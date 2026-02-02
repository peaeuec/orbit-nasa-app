import AuthForm from '@/components/AuthForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      
      {/* Background Image */}
      <img 
        src="https://images.pexels.com/photos/9160637/pexels-photo-9160637.jpeg" 
        alt="Galaxy Background" 
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none select-none"
      />

      {/* The Interactive Form Component */}
      <div className="relative z-10 w-full max-w-md px-4">
        <AuthForm message={message} />
      </div>
      
    </div>
  );
}