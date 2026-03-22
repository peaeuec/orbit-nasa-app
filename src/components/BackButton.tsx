"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
      title="Go back"
      className="group flex items-center cursor-none w-fit outline-none"
      data-cursor-invert="true"
    >
      {/* ICON CONTAINER */}
      <div className="relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-400 -mr-9 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-mr-3 group-hover:bg-white group-hover:text-black group-hover:border-cyan-400 shadow-none group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
        <ArrowLeft className="h-5 w-5 rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-0" />
      </div>

      {/* TEXT CONTAINER */}
      <div className="relative z-10 flex items-center bg-gray-900/50 border border-gray-800 text-white pl-12 pr-6 py-2.5 rounded-full font-bold text-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:pl-7 group-hover:text-cyan-400 group-hover:bg-gray-900">
        <span className="uppercase tracking-widest text-xs">Back</span>
      </div>
    </button>
  );
}
