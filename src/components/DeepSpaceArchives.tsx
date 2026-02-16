"use client";

import Link from "next/link";
import StaggeredText from "@/components/StaggeredText";

export default function DeepSpaceArchives() {
  return (
    // 100vh forces this section to take up the entire screen height
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center border-t border-gray-900 overflow-hidden">
      {/* Z-10 ensures our text stays on top of whatever background preview we build later */}
      <div className="z-10 flex flex-col items-center text-center max-w-3xl px-4">
        <button
          className="group/archive outline-none cursor-none flex justify-center mb-6 w-fit"
          data-cursor-invert="true"
        >
          {/* Scaled up the text to 5xl/7xl for that cinematic full-screen feel */}
          <StaggeredText
            text="Deep Space Archives"
            className="text-5xl md:text-7xl font-extrabold text-cyan-400 tracking-tight"
            hideClass="group-hover/archive:-translate-y-full"
            showClass="group-hover/archive:translate-y-0"
          />
        </button>

        <p
          className="text-gray-400 text-lg md:text-xl mb-10"
          data-cursor-invert="true"
        >
          Access thousands of curated images from the Hubble, James Webb, and
          historic missions.
        </p>

        <Link
          href="/explore"
          className="bg-white text-black px-8 py-4 rounded-full font-bold text-sm md:text-base hover:bg-gray-200 transition flex items-center gap-2 cursor-none"
        >
          Enter Archives &rarr;
        </Link>
      </div>

      {/* A subtle placeholder gradient background until we build the real preview */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-cyan-950/10 to-black pointer-events-none" />
    </section>
  );
}
