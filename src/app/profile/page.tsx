import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPostById } from "@/lib/api";
import FeedGrid from "@/components/FeedGrid";
import { Folder } from "lucide-react";
import { signOut } from "@/app/actions";
import { getBulkLikeCounts } from "@/lib/db";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import ProfileHeader from "./ProfileHeader";
import Starfield from "@/components/StarField"; // NEW: Import the animated background

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Get User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Get Liked IDs from Database
  const { data: likes } = await supabase
    .from("likes")
    .select("nasa_id")
    .eq("user_id", user.id);

  const likedIds = likes?.map((l) => l.nasa_id) || [];

  // 3. Fetch details for every single Liked ID from NASA
  const savedPostsRaw = await Promise.all(
    likedIds.map((id) => getPostById(id)),
  );
  const savedPosts = savedPostsRaw.filter(
    (post): post is NonNullable<typeof post> => post !== null,
  );

  // 4. Fetch Global Like Counts
  const likeCounts = await getBulkLikeCounts(likedIds);

  // 5. Merge Counts into Posts
  const savedPostsWithCounts = savedPosts.map((post) => ({
    ...post,
    likes: likeCounts[post.id] || 0,
  }));

  // 6. Fetch User's Custom Collections
  const { data: userCollections } = await supabase
    .from("collections")
    .select("id, name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const avatarUrl = user.user_metadata?.avatar_url;
  const username = user.user_metadata?.username || "Space Marine";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Profile Header */}
      {/* FIX: Added 'relative' and 'overflow-hidden' to contain the stars */}
      <div className="relative bg-linear-to-b from-gray-900 to-black border-b border-gray-800 pb-12 pt-20 px-4 overflow-hidden">
        {/* NEW: Mount the animated star background */}
        <Starfield />

        {/* FIX: Added 'relative z-10' to ensure content stays above the stars */}
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="mb-8">
            <BackButton fallback="/explore" />
          </div>

          <ProfileHeader
            userId={user.id}
            initialUsername={username}
            avatarUrl={avatarUrl}
            signOutAction={signOut}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* COLLECTIONS SECTION */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold">Your Collections</h2>
            <span className="bg-cyan-900/30 text-cyan-400 border border-cyan-900/50 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest">
              {userCollections?.length || 0} Folder
              {userCollections?.length !== 1 ? "s" : ""}
            </span>
          </div>

          {userCollections && userCollections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/profile/collection/${col.id}`}
                  className="group relative bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 hover:bg-gray-800 cursor-none flex flex-col justify-between min-h-35 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-gray-500 mb-4 group-hover:-translate-y-1 group-hover:text-cyan-400 transition-all duration-300 relative z-10">
                    <Folder size={32} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors line-clamp-2 relative z-10">
                    {col.name}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
              <div className="text-gray-600 mb-4 flex justify-center">
                <Folder size={48} />
              </div>
              <p className="text-gray-500">No collections created yet.</p>
              <p className="text-sm text-gray-600 mt-2">
                Click the Save icon on any post to create one!
              </p>
            </div>
          )}
        </div>

        {/* LIKED CONTENT (Formerly Saved Posts) */}
        <div>
          <div className="flex items-center gap-4 mb-8 border-t border-gray-800/50 pt-12">
            <h2 className="text-2xl font-bold">Liked Posts</h2>
            <span className="bg-pink-900/20 text-pink-400 border border-pink-900/30 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest">
              {savedPostsWithCounts.length} Item
              {savedPostsWithCounts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {savedPostsWithCounts.length > 0 ? (
            <FeedGrid
              posts={savedPostsWithCounts}
              initialLikes={likedIds}
              userId={user.id}
            />
          ) : (
            <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
              <p className="text-gray-500 mb-4">No liked posts found.</p>
              <a
                href="/explore"
                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Return to the Archives &rarr;
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
