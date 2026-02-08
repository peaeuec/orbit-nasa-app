import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getPostById } from '@/lib/api';
import FeedGrid from '@/components/FeedGrid';
import { LogOut, User, Rocket } from 'lucide-react';
import { signOut } from '@/app/actions';
import AvatarUpload from '@/components/AvatarUpload';

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Get Liked IDs from Database
  const { data: likes } = await supabase
    .from('likes')
    .select('nasa_id')
    .eq('user_id', user.id);

  const likedIds = likes?.map(l => l.nasa_id) || [];

  // 3. Hydrate! Fetch details for every single ID from NASA
  // Promise.all makes these run at the same time, so it's fast.
  const savedPostsPromises = likedIds.map(id => getPostById(id));
  const savedPostsRaw = await Promise.all(savedPostsPromises);
  
  // Filter out any nulls (in case NASA deleted an image)
  const savedPosts = savedPostsRaw.filter(post => post !== null);
  const avatarUrl = user.user_metadata?.avatar_url; 
  const username = user.user_metadata?.username || 'Space Marine';

  return (
    <main className="min-h-screen bg-black text-white">
      
      {/* Profile Header */}
      <div className="bg-linear-to-b from-gray-900 to-black border-b border-gray-800 pb-12 pt-24 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          
          <div className="flex items-center gap-6">
            {/* Avatar*/}
            <AvatarUpload 
              userId={user.id} 
              userUrl={avatarUrl} 
              username={username} 
            />
            
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{username}</h1>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Rocket size={14} /> 
                User Status: Active
              </p>
              <p className="text-gray-500 text-xs mt-1 font-mono uppercase">
                ID: {user.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <form action={signOut}>
            <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-red-900/50 text-red-400 hover:bg-red-950/30 hover:border-red-500 transition text-sm font-bold uppercase tracking-wider">
              <LogOut size={16} />
              Logout
            </button>
          </form>

        </div>
      </div>

      {/* Saved Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold">Saved Posts</h2>
          <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-mono">
            {savedPosts.length} ITEMS
          </span>
        </div>

        {savedPosts.length > 0 ? (
          // We pass initialLikes={likedIds} so the hearts show as "Red" immediately
          <FeedGrid posts={savedPosts} initialLikes={likedIds} />
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-500 mb-4">No posts saved yet.</p>
            <a href="/explore" className="text-blue-400 hover:underline">
              Go to the Archives &rarr;
            </a>
          </div>
        )}
      </div>

    </main>
  );
}