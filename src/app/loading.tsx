export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      {/* A simple spinning circle */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400 font-mono animate-pulse">
        Contacting NASA Satellite...
      </p>
    </div>
  );
}