"use client";

import { usePathname } from "next/navigation";

export default function Loading() {
  const pathname = usePathname();

  // If we are on the Home Page, stay completely black.
  // The SplashScreen component will handle the entrance animation.
  if (pathname === "/") {
    return <div className="min-h-screen bg-black" />;
  }

  // For all other pages, show the NASA Satellite loader
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p className="text-gray-400 font-mono animate-pulse">
        Contacting NASA Satellite...
      </p>
    </div>
  );
}
