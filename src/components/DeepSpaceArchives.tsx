"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useInView, motion, Variants } from "framer-motion";

const IMAGES = [
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1630694093867-4b947d810bf0?q=80&w=1000&auto=format&fit=crop",
];

/* --- ANIMATION VARIANTS --- */
const headingText = "Deep Space Archives";
const subtext =
  "Access thousands of curated images from the Hubble, James Webb, and historic missions.";

const headingVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.2 },
  },
};

const charVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 15, scale: 0.9, rotateZ: -5 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: { type: "spring", damping: 15, stiffness: 150 },
  },
};

const subtextVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 1.2 },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0.15, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function DeepSpaceArchives() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "1500px" });

  const col1 = [...IMAGES, ...IMAGES];
  const col2 = [...[...IMAGES].reverse(), ...[...IMAGES].reverse()];
  const col3 = [
    ...IMAGES.slice(3),
    ...IMAGES.slice(0, 3),
    ...IMAGES.slice(3),
    ...IMAGES.slice(0, 3),
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center border-t border-gray-900 overflow-hidden group/archive cursor-none"
    >
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

      {/* --- BACKGROUND GRID --- */}
      {isInView && (
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
                    decoding="async"
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
                    decoding="async"
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
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- FROSTED GLASS OVERLAY --- */}
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-2xl transition-all duration-1000 group-hover/archive:bg-black/20 group-hover/archive:backdrop-blur-sm pointer-events-none" />

      {/* --- CONTENT CONTAINER --- */}
      <div className="z-20 flex flex-col items-center text-center max-w-3xl px-4 pointer-events-auto transition-transform duration-1000 group-hover/archive:-translate-y-4">
        {/* Trigger animations when the user scrolls this container into view */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          {/* 1. CINEMATIC "APPEAR" HEADING (Now identified as a button!) */}
          <motion.button
            variants={headingVariants}
            className="outline-none cursor-none text-5xl md:text-7xl font-extrabold text-white group-hover/archive:text-cyan-400 transition-colors duration-1000 tracking-tight drop-shadow-2xl mb-6 flex justify-center whitespace-nowrap"
            data-cursor-invert="true"
          >
            {headingText.split(" ").map((word, i) => (
              <span key={i} className="inline-block whitespace-nowrap">
                {word.split("").map((char, j) => (
                  <motion.span
                    key={j}
                    variants={charVariants}
                    className="inline-block origin-bottom"
                  >
                    {char}
                  </motion.span>
                ))}
                {/* Add a space after each word except the last one */}
                {i !== headingText.split(" ").length - 1 && (
                  <span className="inline-block">&nbsp;</span>
                )}
              </span>
            ))}
          </motion.button>

          {/* 2. SEQUENTIAL WORD "REVEAL" SUBTEXT */}
          <motion.p
            variants={subtextVariants}
            className="text-gray-300 text-lg md:text-xl mb-12 flex flex-wrap justify-center transition-opacity duration-1000 group-hover/archive:opacity-0"
            data-cursor-invert="true"
          >
            {subtext.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block mr-1.5"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        {/* 3. ELASTIC OVERLAP BUTTON */}
        <Link
          href="/explore"
          className="group flex items-center justify-center cursor-none w-fit"
          data-cursor-invert="true"
        >
          <div className="relative z-10 flex items-center bg-white text-black pl-8 pr-16 py-3.5 rounded-full font-bold text-sm md:text-base transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:pr-8 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <span>Enter Archives</span>
          </div>
          <div className="relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white -ml-12 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-ml-3 group-hover:bg-cyan-400 group-hover:text-black shadow-none group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <ArrowRight className="h-5 w-5 -rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-0" />
          </div>
        </Link>
      </div>
    </section>
  );
}
