import { supabase } from './supabase';

// 1. Get likes for a specific post
export async function getPostLikes(postId: string): Promise<number> {
  const { data } = await supabase
    .from('post_likes')
    .select('like_count')
    .eq('post_id', postId)
    .single();

  return data?.like_count || 0;
}

// 2. NEW: Get likes for MANY posts at once (Optimization)
export async function getBulkLikeCounts(postIds: string[]): Promise<Record<string, number>> {
  // CRITICAL FIX: Don't query if array is empty
  if (!postIds || postIds.length === 0) return {};

  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id, like_count')
    .in('post_id', postIds);

  if (error) {
    console.error("Error fetching bulk likes:", error);
    return {};
  }

  const map: Record<string, number> = {};
  
  // Default all requested IDs to 0 first (prevents undefined)
  postIds.forEach(id => map[id] = 0);

  // Fill in the real counts from DB
  data?.forEach((row: any) => {
    map[row.post_id] = row.like_count;
  });

  return map;
}

// 3. Add a like
export async function incrementLike(postId: string) {
  // First, try to get the current count
  const current = await getPostLikes(postId);
  
  // Then upsert (insert or update)
  const { error } = await supabase
    .from('post_likes')
    .upsert(
      { post_id: postId, like_count: current + 1 },
      { onConflict: 'post_id' } // Explicitly state the conflict column
    );

  if (error) console.error('Error liking:', error);
}