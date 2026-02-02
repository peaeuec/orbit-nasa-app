'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function likePost(nasaId: string) {
  const supabase = await createClient()
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // If not logged in, stop.

  // 2. Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('nasa_id', nasaId)
    .single()

  if (existingLike) {
    // 3. Unlike (Delete)
    await supabase.from('likes').delete().eq('id', existingLike.id)
  } else {
    // 4. Like (Insert)
    await supabase.from('likes').insert({ 
      user_id: user.id, 
      nasa_id: nasaId 
    })
  }

  // 5. Refresh the page data
  revalidatePath('/explore')
}