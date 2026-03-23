"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js"; // NEW: For admin operations
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function likePost(nasaId: string) {
  const supabase = await createClient();

  // 1. Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // If not logged in, stop.

  // 2. Check if already liked (Bookmark check)
  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", user.id)
    .eq("nasa_id", nasaId)
    .single();

  if (existingLike) {
    // --- UNLIKE FLOW ---
    await supabase.from("likes").delete().eq("id", existingLike.id);

    const { data: currentCount } = await supabase
      .from("post_likes")
      .select("like_count")
      .eq("post_id", nasaId)
      .single();

    if (currentCount && currentCount.like_count > 0) {
      await supabase
        .from("post_likes")
        .update({ like_count: currentCount.like_count - 1 })
        .eq("post_id", nasaId);
    }
  } else {
    // --- LIKE FLOW ---
    await supabase.from("likes").insert({
      user_id: user.id,
      nasa_id: nasaId,
    });

    const { data: currentCount } = await supabase
      .from("post_likes")
      .select("like_count")
      .eq("post_id", nasaId)
      .single();

    await supabase
      .from("post_likes")
      .upsert(
        { post_id: nasaId, like_count: (currentCount?.like_count || 0) + 1 },
        { onConflict: "post_id" },
      );
  }

  revalidatePath("/explore");
  revalidatePath("/profile");
  revalidatePath("/search");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be logged in to comment");

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content,
  });

  if (error) throw error;
  revalidatePath(`/explore`);
}

// --- NEW: DELETE ACCOUNT ACTION ---
export async function deleteAccount(password: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Not authenticated" };
  }

  // 1. Verify the password by attempting a background login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  });

  if (signInError) {
    return { error: "Invalid password. Authorization denied." };
  }

  // 2. Initialize the Admin Client to bypass RLS and delete the user
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    console.error("Delete user error:", deleteError);
    return { error: "Failed to purge account data. Contact Houston." };
  }

  // 3. Success! Sign them out and redirect to home
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
