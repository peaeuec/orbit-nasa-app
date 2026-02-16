"use client";

import { useState, useEffect } from "react";
import { SpacePost } from "@/lib/types";
import { X, Maximize2, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import StaggeredText from "@/components/StaggeredText";

/* ---------------- TYPEWRITER HOOK ---------------- */
function useTypewriter(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}
/* ------------------------------------------------ */

/* ---------------- ROLLING DIGIT ---------------- */
function RollingDigit({ value, delay = 0 }: { value: string; delay?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span className="relative inline-block w-[0.65em] h-[1em] overflow-hidden">
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out
          ${visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
      >
        {value}
      </span>
    </span>
  );
}
/* ------------------------------------------------ */

/* ---------------- DATE ROLL ---------------- */
function DateRoll({
  date,
  startDelay = 0,
}: {
  date: string; // YYYY-MM-DD
  startDelay?: number;
}) {
  const [year, month, day] = date.split("-");
  let delay = startDelay;

  const yearDigits = year.split("").map((d) => {
    const currentDelay = delay;
    delay += 70;
    return { d, delay: currentDelay };
  });

  delay += 160;

  const monthDigits = month.split("").map((d) => {
    const currentDelay = delay;
    delay += 110;
    return { d, delay: currentDelay };
  });

  delay += 160;

  const dayDigits = day.split("").map((d) => {
    const currentDelay = delay;
    delay += 90;
    return { d, delay: currentDelay };
  });

  return (
    <span className="flex items-center gap-2 text-amber-50 text-sm font-mono font-bold">
      <span className="flex gap-[1px]">
        {yearDigits.map(({ d, delay }, i) => (
          <RollingDigit key={`y-${i}`} value={d} delay={delay} />
        ))}
      </span>

      <span className="opacity-40">—</span>

      <span className="flex gap-[1px]">
        {monthDigits.map(({ d, delay }, i) => (
          <RollingDigit key={`m-${i}`} value={d} delay={delay} />
        ))}
      </span>

      <span className="opacity-40">—</span>

      <span className="flex gap-[1px]">
        {dayDigits.map(({ d, delay }, i) => (
          <RollingDigit key={`d-${i}`} value={d} delay={delay} />
        ))}
      </span>
    </span>
  );
}
/* ------------------------------------------------ */

/* ---------------- NEXT APOD COUNTDOWN ---------------- */
function NextApodCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const nyTimeStr = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      });
      const nowNY = new Date(nyTimeStr);

      const tomorrowNY = new Date(nowNY);
      tomorrowNY.setHours(24, 0, 0, 0);

      const diff = tomorrowNY.getTime() - nowNY.getTime();

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((diff / 1000 / 60) % 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor((diff / 1000) % 60)
        .toString()
        .padStart(2, "0");

      setTimeLeft(`${h}:${m}:${s}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  return (
    <span className="flex items-center gap-2 text-cyan-400 text-sm font-mono font-bold tracking-widest whitespace-nowrap">
      <span className="opacity-60 hidden md:inline">NEXT IN:</span>
      <span className="text-white">{timeLeft}</span>
    </span>
  );
}
/* ------------------------------------------------ */

export default function HeroSection({ hero }: { hero: SpacePost }) {
  const [isOpen, setIsOpen] = useState(false);

  const typedTitle = useTypewriter("Astronomy Picture of the Day");
  const dateStartDelay = 38 * "Astronomy Picture of the Day".length + 150;

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!hero) return null;

  return (
    <>
      <div className="w-full mb-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-800 pb-2 animate-soft-fade">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shrink-0" />

            <button className="group/title outline-none cursor-none text-left flex">
              <StaggeredText
                text={typedTitle}
                className="text-cyan-400 text-lg md:text-xl font-bold uppercase tracking-[0.2em] hidden md:flex"
                hideClass="group-hover/title:-translate-y-full"
                showClass="group-hover/title:translate-y-0"
              />
              <StaggeredText
                text="APOD"
                className="text-cyan-400 text-lg font-bold uppercase tracking-[0.2em] flex md:hidden"
                hideClass="group-hover/title:-translate-y-full"
                showClass="group-hover/title:translate-y-0"
              />
            </button>
          </div>

          <button className="grid grid-cols-1 grid-rows-1 place-items-end group/date h-6 overflow-hidden outline-none cursor-none">
            <div className="col-start-1 row-start-1 transition-transform duration-500 ease-out group-hover/date:-translate-y-full flex items-center h-full">
              <DateRoll date={hero.date} startDelay={dateStartDelay} />
            </div>

            <div className="col-start-1 row-start-1 transition-transform duration-500 ease-out translate-y-full group-hover/date:translate-y-0 flex items-center h-full">
              <NextApodCountdown />
            </div>
          </button>
        </div>

        {/* HERO CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          data-cursor-image="true"
          className="relative group rounded-3xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] hover:border-cyan-900/50 transition-all duration-500 cursor-none flex flex-col justify-end"
          onClick={() => setIsOpen(true)}
        >
          {hero.mediaType === "video" ? (
            <div className="aspect-video w-full relative">
              <iframe
                src={hero.imageUrl}
                className="w-full h-full pointer-events-none transform transition-transform duration-[2s] ease-out group-hover:scale-105"
                title="APOD Video"
              />
              <div className="absolute inset-0 bg-transparent" />
            </div>
          ) : (
            <div className="relative w-full overflow-hidden">
              <img
                src={hero.imageUrl}
                alt={hero.title}
                className="w-full h-auto object-contain transform transition-transform duration-[2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>
          )}

          <button className="absolute top-6 right-6 bg-black/50 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition transform group-hover:scale-110 z-20 border-2 border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-none">
            <Maximize2 className="text-white w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10 pt-32 pointer-events-none">
            <h1
              data-cursor-invert="true"
              className="w-fit text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-xl leading-tight pointer-events-auto"
            >
              {hero.title}
            </h1>

            <p
              data-cursor-invert="true"
              className="text-gray-200 line-clamp-3 max-w-3xl text-sm md:text-lg drop-shadow-md leading-relaxed mb-6 pointer-events-auto"
            >
              {hero.description}
            </p>

            <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-blue-900/20 group-hover:shadow-cyan-500/40 pointer-events-auto cursor-none">
              <BookOpen size={16} />
              <span>Read Full Story</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </motion.div>
      </div>

      {/* FULL SCREEN MODAL (unchanged) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-auto"
          onClick={() => setIsOpen(false)}
          onWheel={(e) => e.stopPropagation()}
        >
          <button className="absolute top-6 right-6 text-gray-400 hover:text-white z-50 bg-gray-800/80 hover:bg-gray-700 rounded-full p-3 transition border border-gray-700">
            <X size={24} />
          </button>

          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:w-2/3 bg-black flex items-center justify-center p-4">
              {hero.mediaType === "video" ? (
                <iframe
                  src={hero.imageUrl}
                  className="w-full h-full aspect-video"
                  allowFullScreen
                />
              ) : (
                <img
                  src={hero.imageUrl}
                  alt={hero.title}
                  className="w-full h-full max-h-[90vh] object-contain"
                />
              )}
            </div>

            <div
              className="md:w-1/3 p-8 flex flex-col bg-gray-900 border-l border-gray-800 overflow-y-auto"
              data-lenis-prevent
            >
              <div className="mb-6">
                <span className="bg-cyan-900/30 text-cyan-400 border border-cyan-900/50 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {hero.date}
                </span>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-white leading-tight">
                {hero.title}
              </h2>

              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <p className="whitespace-pre-line leading-relaxed text-base">
                  {hero.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
