"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrbitLogo from "./OrbitLogo";

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
  const [displayProgress, setDisplayProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("INITIALIZING ORBITAL TELEMETRY");
  const [stars, setStars] = useState<Star[]>([]);

  // Ref tracking real target progress from browser telemetry
  const targetProgressRef = useRef(15);

  useEffect(() => {
    // 1. Generate ambient client-side starfield
    const generatedStars = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStars(generatedStars);

    // 2. Session check (allow smooth fast return for repeat visits)
    const hasVisited = sessionStorage.getItem("hasVisitedOrbit");
    if (hasVisited) {
      setIsLoading(false);
      setShouldRender(false);
      return;
    }
    sessionStorage.setItem("hasVisitedOrbit", "true");

    let isMounted = true;

    // 3. REAL BROWSER TELEMETRY PIPELINE
    targetProgressRef.current = 25;

    // Milestone A: Fonts & Design System ready
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready
        .then(() => {
          if (!isMounted) return;
          targetProgressRef.current = Math.max(targetProgressRef.current, 50);
          setStatusMessage("TYPOGRAPHY & DESIGN TOKENS READY");
        })
        .catch(() => {});
    }

    // Milestone B: Resource streaming progress
    const updateFromResources = () => {
      if (!isMounted) return;
      if (typeof window !== "undefined" && window.performance) {
        const resources = performance.getEntriesByType("resource");
        if (resources.length > 0) {
          const resourceProgress = Math.min(88, 50 + Math.round(resources.length * 2));
          targetProgressRef.current = Math.max(targetProgressRef.current, resourceProgress);
          setStatusMessage("CALIBRATING DEEP SPACE SENSORS");
        }
      }
    };

    const resourceInterval = setInterval(updateFromResources, 100);

    // Milestone C: Full Window and Media Load
    const markComplete = () => {
      if (!isMounted) return;
      clearInterval(resourceInterval);
      targetProgressRef.current = 100;
      setStatusMessage("SYSTEMS NOMINAL • LINK ESTABLISHED");
    };

    if (document.readyState === "complete") {
      markComplete();
    } else {
      window.addEventListener("load", markComplete, { once: true });
      const timeoutFallback = setTimeout(markComplete, 2400);
      return () => {
        isMounted = false;
        clearInterval(resourceInterval);
        clearTimeout(timeoutFallback);
        window.removeEventListener("load", markComplete);
      };
    }

    return () => {
      isMounted = false;
      clearInterval(resourceInterval);
    };
  }, []);

  // 4. Smooth fluid interpolation loop
  useEffect(() => {
    let animId: number;

    const animateProgress = () => {
      setDisplayProgress((prev) => {
        const target = targetProgressRef.current;
        if (prev >= 100) return 100;

        const delta = target - prev;
        const step = Math.max(0.8, delta * 0.14);
        const next = Math.min(target, prev + step);

        if (next >= 100) {
          setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => setShouldRender(false), 800);
          }, 350);
          return 100;
        }

        return next;
      });

      animId = requestAnimationFrame(animateProgress);
    };

    animId = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-9999 bg-[#04060b] overflow-hidden flex flex-col items-center justify-center p-4 select-none pointer-events-auto"
        >
          {/* Ambient Starfield */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
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
                  opacity: [0.15, 0.9, 0.15],
                  scale: [1, 1.3, 1],
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

          {/* Deep Space Nebula Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

          {/* Aerospace HUD Telemetry Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-3xl bg-neutral-950/85 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.12)] overflow-hidden"
          >
            {/* Sci-Fi Corner Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60" />

            {/* HUD Status Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800/80">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-cyan-400/90 uppercase font-semibold">
                  NASA TELEMETRY LINK
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-widest text-gray-500">
                ORBIT // V2.6
              </span>
            </div>

            {/* --- REFINED ORBIT LOGO (NO GRADIENT, CLEAN GEIST SANS, NO SUBTEXT) --- */}
            <div className="flex flex-col items-center justify-center mb-8">
              <OrbitLogo size="lg" />
            </div>

            {/* Real-Time Telemetry Progress Bar */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex justify-between items-center px-1 font-mono">
                <span className="text-cyan-400/80 text-[11px] tracking-wider uppercase truncate mr-2">
                  {statusMessage}
                </span>
                <span className="text-white text-xs font-bold tracking-widest tabular-nums">
                  {Math.round(displayProgress)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-1.5 w-full bg-gray-900/90 rounded-full relative overflow-hidden border border-white/5">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 via-sky-400 to-white shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
            </div>

            {/* Telemetry Footer Meta */}
            <div className="mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-between text-[10px] font-mono text-gray-500 tracking-wider">
              <span>FREQ: 8.4 GHz</span>
              <span>BUFFER: REALTIME</span>
              <span className="text-cyan-400/70 font-semibold">
                {displayProgress >= 100 ? "ONLINE" : "SYNCING"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
