import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPostById } from "@/lib/api";
import { getBulkLikeCounts } from "@/lib/db";
import CollectionClient from "./CollectionClient";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Fix for Next.js 15+ dynamic route params
  const resolvedParams = await params;
  const collectionId = resolvedParams.id;

  const supabase = await createClient();

  // 1. Authenticate User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch Collection
  const { data: collection, error: colError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .single();

  if (colError || !collection) notFound();

  // 3. Fetch Items and map their "Added At" date for sorting
  const { data: collectionItems } = await supabase
    .from("collection_items")
    .select("nasa_id, created_at")
    .eq("collection_id", collection.id);

  const itemMap = new Map(
    collectionItems?.map((item) => [item.nasa_id, item.created_at]) || [],
  );
  const itemIds = Array.from(itemMap.keys());

  // 4. Fetch Global Likes
  const { data: userLikes } = await supabase
    .from("likes")
    .select("nasa_id")
    .eq("user_id", user.id);
  const likedIds = userLikes?.map((l) => l.nasa_id) || [];

  // 5. Fetch NASA details and Merge data
  const savedPostsRaw = await Promise.all(itemIds.map((id) => getPostById(id)));
  const likeCounts = await getBulkLikeCounts(itemIds);

  const postsWithExtraData = savedPostsRaw
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .map((post) => ({
      ...post,
      likes: likeCounts[post.id] || 0,
      added_at: itemMap.get(post.id) || "", // Required for Client Sorting
    }));

  return (
    <CollectionClient
      initialCollection={collection}
      initialPosts={postsWithExtraData}
      likedIds={likedIds}
      userId={user.id}
    />
  );
}
