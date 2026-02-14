'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation';

export async function likePost(nasaId: string) {
  const supabase = await createClient()
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // If not logged in, stop.

  // 2. Check if already liked (Bookmark check)
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('nasa_id', nasaId)
    .single()

  if (existingLike) {
    // --- UNLIKE FLOW ---
    
    // A. Remove Bookmark
    await supabase.from('likes').delete().eq('id', existingLike.id)
    
    // B. Decrement Global Count
    // We use a raw RPC or a manual update. Manual is safer for now.
    const { data: currentCount } = await supabase
      .from('post_likes')
      .select('like_count')
      .eq('post_id', nasaId)
      .single();
      
    if (currentCount && currentCount.like_count > 0) {
      await supabase
        .from('post_likes')
        .update({ like_count: currentCount.like_count - 1 })
        .eq('post_id', nasaId);
    }

  } else {
    // --- LIKE FLOW ---
    
    // A. Add Bookmark
    await supabase.from('likes').insert({ 
      user_id: user.id, 
      nasa_id: nasaId 
    })

    // B. Increment Global Count
    const { data: currentCount } = await supabase
      .from('post_likes')
      .select('like_count')
      .eq('post_id', nasaId)
      .single();

    // Upsert ensures we create the row if it's the first like ever
    await supabase
      .from('post_likes')
      .upsert(
        { post_id: nasaId, like_count: (currentCount?.like_count || 0) + 1 },
        { onConflict: 'post_id' }
      );
  }

  // 5. Refresh the page data
  revalidatePath('/explore')
  revalidatePath('/profile')
  revalidatePath('/search')
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/');
}