"use client";

import Link from "next/link";
import StaggeredText from "@/components/StaggeredText";
import { ArrowRight } from "lucide-react";

const IMAGES = [
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1630694093867-4b947d810bf0?q=80&w=1000&auto=format&fit=crop",
];

export default function DeepSpaceArchives() {
  const col1 = [...IMAGES, ...IMAGES];
  const col2 = [...[...IMAGES].reverse(), ...[...IMAGES].reverse()];
  const col3 = [
    ...IMAGES.slice(3),
    ...IMAGES.slice(0, 3),
    ...IMAGES.slice(3),
    ...IMAGES.slice(0, 3),
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center border-t border-gray-900 overflow-hidden group/archive cursor-none">
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up { animation: scroll-up 40s linear infinite; }
        .animate-scroll-down { animation: scroll-down 50s linear infinite; }
      `}</style>

      {/* THE MOVING MASONRY BACKGROUND */}
      <div className="absolute inset-0 z-0 flex gap-4 p-4 md:gap-6 md:p-6 opacity-30 scale-105 transition-all duration-1000 ease-out group-hover/archive:opacity-100 group-hover/archive:scale-100">
        <div className="flex-1 relative overflow-hidden hidden sm:block">
          <div className="absolute w-full flex flex-col gap-4 md:gap-6 animate-scroll-up">
            {col1.map((src, i) => (
              <div
                key={i}
                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Archive"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute w-full flex flex-col gap-4 md:gap-6 animate-scroll-down">
            {col2.map((src, i) => (
              <div
                key={i}
                className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Archive"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden hidden md:block">
          <div
            className="absolute w-full flex flex-col gap-4 md:gap-6 animate-scroll-up"
            style={{ animationDuration: "60s" }}
          >
            {col3.map((src, i) => (
              <div
                key={i}
                className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Archive"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-2xl transition-all duration-1000 group-hover/archive:bg-black/20 group-hover/archive:backdrop-blur-sm pointer-events-none" />

      {/* THE CONTENT */}
      <div className="z-20 flex flex-col items-center text-center max-w-3xl px-4 pointer-events-auto transition-transform duration-1000 group-hover/archive:-translate-y-4">
        <button
          className="group/text outline-none cursor-none flex justify-center mb-6 w-fit"
          data-cursor-invert="true"
        >
          <StaggeredText
            text="Deep Space Archives"
            className="text-5xl md:text-7xl font-extrabold text-white group-hover/archive:text-cyan-400 transition-colors duration-1000 tracking-tight drop-shadow-2xl"
            hideClass="group-hover/text:-translate-y-full"
            showClass="group-hover/text:translate-y-0"
          />
        </button>

        <p className="text-gray-300 text-lg md:text-xl mb-12 transition-opacity duration-1000 group-hover/archive:opacity-0">
          Access thousands of curated images from the Hubble, James Webb, and
          historic missions.
        </p>

        {/* --- THE 'ELASTIC OVERLAP' BUTTON --- */}
        <Link
          href="/explore"
          className="group flex items-center justify-center cursor-none w-fit"
          data-cursor-invert="true"
        >
          {/* 1. The Main Pill: pr-12 gives room for the black circle to tuck inside it initially */}
          <div className="relative z-10 flex items-center bg-white text-black pl-8 pr-15 py-3.5 rounded-full font-bold text-sm md:text-base transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:pr-8 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <span>Enter Archives</span>
          </div>

          {/* 2. The Arrow Circle: Starts tucked inside (-ml-12). On hover, it springs outward to -ml-3 (barely attached). */}
          <div className="relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white -ml-12 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-ml-3 group-hover:bg-cyan-400 group-hover:text-black shadow-none group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <ArrowRight className="h-5 w-5 -rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-0" />
          </div>
        </Link>
      </div>
    </section>
  );
}
