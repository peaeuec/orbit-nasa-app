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

// 2. Add a like (Simple version)
export async function incrementLike(postId: string) {
  const current = await getPostLikes(postId);
  
  const { error } = await supabase
    .from('post_likes')
    .upsert({ post_id: postId, like_count: current + 1 });

  if (error) console.error('Error liking:', error);
}