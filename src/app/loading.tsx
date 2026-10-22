"use client";

import { usePathname } from "next/navigation";
import OrbitLogo from "@/components/OrbitLogo";

export default function Loading() {
  const pathname = usePathname();

  // If on the Home Page, stay blank so SplashScreen handles entrance
  if (pathname === "/") {
    return <div className="min-h-screen bg-black" />;
  }

  // For all other pages, show the matching aerospace HUD card
  return (
    <div className="min-h-screen bg-[#04060b] text-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Deep Space Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-sm p-8 rounded-3xl bg-neutral-950/85 backdrop-blur-2xl border border-cyan-500/25 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.15)] flex flex-col items-center">
        {/* Sci-fi Corner Brackets */}
        <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-cyan-400/70" />
        <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-cyan-400/70" />
        <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-cyan-400/70" />
        <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-cyan-400/70" />

        {/* Clean Orbit Logo (no gradient, animated orbital satellite) */}
        <div className="mb-6 flex justify-center">
          <OrbitLogo size="md" />
        </div>

        {/* Scanning Track */}
        <div className="w-full h-1.5 bg-gray-900/90 rounded-full overflow-hidden relative border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-400 to-white w-2/3 animate-[shimmer_1.4s_infinite]" />
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-gray-400 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>QUERYING NASA SATELLITE NETWORK...</span>
        </div>
      </div>
    </div>
  );
}
