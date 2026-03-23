import AuthForm from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  // 1. Add 'view' to the Promise type definition
  searchParams: Promise<{ message?: string; view?: string }>;
}) {
  // 2. Await the params to unlock the data
  const resolvedParams = await searchParams;

  // 3. Extract what we need
  const message = resolvedParams.message;
  const isSignup = resolvedParams.view === "signup";

  return (
    <AuthForm message={message} initialView={isSignup ? "signup" : "login"} />
  );
}
