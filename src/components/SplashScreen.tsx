"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to prevent hydration errors by generating stars only on the client
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // 1. Generate random starfield on mount
    const generatedStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStars(generatedStars);

    // 2. Session Check
    const hasVisited = sessionStorage.getItem("hasVisitedOrbit");
    if (hasVisited) {
      setIsLoading(false);
      setShouldRender(false);
      return;
    }
    sessionStorage.setItem("hasVisitedOrbit", "true");

    // 3. Fake Progress Counter (eases up to 99% over 2 seconds)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          return 99;
        }
        return prev + 1;
      });
    }, 20);

    // 4. The Real Loading Logic
    const minTimePromise = new Promise((resolve) => setTimeout(resolve, 2000));
    const windowLoadPromise = new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve("ready");
      } else {
        window.addEventListener("load", () => resolve("ready"));
      }
    });

    Promise.all([minTimePromise, windowLoadPromise]).then(() => {
      setProgress(100); // Snap to 100% when everything is truly ready

      // Wait a tiny bit for the user to see "100%", then fade out
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setShouldRender(false), 1000); // Unmount after exit animation
      }, 300);
    });

    return () => clearInterval(interval);
  }, []);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="splash"
          // The smooth exit animation: fades out and scales up slightly like moving forward into space
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-9999 bg-[#050505] overflow-hidden flex flex-col items-center justify-center pointer-events-none"
        >
          {/* --- ANIMATED STARFIELD BACKGROUND --- */}
          <div className="absolute inset-0 opacity-50">
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                }}
                animate={{
                  opacity: [0.1, 0.8, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Deep Space Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-900/10 via-black/50 to-black" />

          {/* --- MAIN CONTENT --- */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, letterSpacing: "0em" }}
            animate={{ scale: 1, opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex flex-col items-center relative z-10 w-full max-w-md px-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 mb-8 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              ORBIT
            </h1>

            {/* --- SCI-FI PROGRESS BAR --- */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex justify-between items-end px-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-cyan-500/70 font-mono text-[13px] uppercase tracking-[0.3em] animate-pulse"
                >
                  Establishing Uplink
                </motion.span>
                <span className="text-cyan-400 font-mono text-xs font-bold tracking-wider">
                  {progress}%
                </span>
              </div>

              {/* The Track */}
              <div className="h-0.5 w-full bg-gray-900 rounded-full relative overflow-hidden">
                {/* The Fill */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
