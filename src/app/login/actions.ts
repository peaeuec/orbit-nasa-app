"use server";

import { createClient } from "@/utils/supabase/server"; // Update this path if yours is different!
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  // 1. Sign up the user and save their username in their secure metadata
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: username },
    },
  });

  // 2. Catch any database/auth errors
  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  // 3. Since email confirmation is OFF, they are instantly authenticated.
  // Bypass the login screen entirely and drop them right into the app!
  return redirect("/");
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const identifier = formData.get("username") as string; // This holds whatever they typed in the first box
  const password = formData.get("password") as string;

  let emailToLogin = identifier;

  // 2. Determine if they typed an email or a username
  if (!identifier.includes("@")) {
    // It's a username! Call our secure SQL function to get the email
    const { data: email, error: rpcError } = await supabase.rpc(
      "get_user_email_by_username",
      {
        username_input: identifier,
      },
    );

    // If no email is found for that username, throw a generic error to prevent data scraping
    if (rpcError || !email) {
      return redirect(
        `/login?message=${encodeURIComponent("Invalid login credentials")}`,
      );
    }

    emailToLogin = email;
  }

  // 3. Log them in using the resolved email
  const { error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  });

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  // Redirect to dashboard or home on success
  return redirect("/");
}
