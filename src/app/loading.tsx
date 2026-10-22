"use client";

import { usePathname } from "next/navigation";

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
        <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/70" />
        <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/70" />
        <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/70" />
        <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/70" />

        {/* Pulse Core Icon */}
        <div className="relative flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <div className="absolute inset-1 rounded-xl border border-cyan-400/30 animate-spin [animation-duration:8s]" />
        </div>

        <span className="text-xl font-black tracking-[0.2em] bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          ORBIT
        </span>
        <span className="text-[9px] font-mono tracking-[0.3em] text-cyan-400/70 mt-1 uppercase mb-6">
          Synchronizing Uplink
        </span>

        {/* Scanning Track */}
        <div className="w-full h-1.5 bg-gray-900/90 rounded-full overflow-hidden relative border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-400 to-white w-2/3 animate-[shimmer_1.4s_infinite]" />
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-gray-500 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>QUERYING NASA SATELLITE NETWORK...</span>
        </div>
      </div>
    </div>
  );
}
