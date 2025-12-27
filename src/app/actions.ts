'use server'; // <--- This magic line allows the browser to call this function!

import { incrementLike } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function likePost(postId: string) {
  // 1. Run the database logic we wrote earlier
  await incrementLike(postId);
  
  // 2. Tell Next.js to refresh the homepage immediately
  // (So the user sees the number go up without hitting refresh)
  revalidatePath('/');
}