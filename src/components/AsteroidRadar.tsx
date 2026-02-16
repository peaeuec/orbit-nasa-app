"use client";

import { useRef, useState, useEffect } from "react";
import {
  AlertTriangle,
  Wind,
  Target,
  Info,
  Ruler,
  Earth,
  Moon,
} from "lucide-react";
import StaggeredText from "@/components/StaggeredText";
import {
  motion,
  useScroll,
  useTransform,
  useAnimationFrame,
  useMotionValue,
  useSpring,
} from "framer-motion";

interface Asteroid {
  id: string;
  name: string;
  isHazardous: boolean;
  speedKmh: string;
  lunarDistance: string;
  estimatedDiameter: string;
}

interface AsteroidRadarProps {
  data: {
    statusColor: string;
    text: string;
    asteroids: Asteroid[];
  };
}

/* =========================================================
   INDIVIDUAL ASTEROID CARD
   ========================================================= */
function AsteroidCard({
  asteroid,
  maxDistance,
}: {
  asteroid: Asteroid;
  maxDistance: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(false);
  };

  const ldValue = parseFloat(asteroid.lunarDistance);
  const fillPercentage = Math.max(2, 100 - (ldValue / maxDistance) * 100);

  const renderContent = (isRipple: boolean) => {
    const isDanger = asteroid.isHazardous;

    const titleColor = isRipple
      ? isDanger
        ? "text-red-300"
        : "text-cyan-400"
      : isDanger
        ? "text-red-400"
        : "text-blue-400";

    const barColor = isRipple
      ? isDanger
        ? "bg-red-400 shadow-[0_0_12px_red]"
        : "bg-cyan-400 shadow-[0_0_8px_cyan]"
      : isDanger
        ? "bg-red-500 shadow-[0_0_8px_red]"
        : "bg-blue-500";

    const bgColor = isRipple
      ? isDanger
        ? "bg-red-900/40"
        : "bg-gray-800/80"
      : isDanger
        ? "bg-red-950/20"
        : "bg-gray-900/50";

    const borderColor = isRipple
      ? isDanger
        ? "border-red-500/50"
        : "border-cyan-500/50"
      : isDanger
        ? "border-red-900/50"
        : "border-gray-800";

    return (
      <div
        className={`p-4 rounded-xl border h-full w-[280px] flex flex-col justify-between ${bgColor} ${borderColor}`}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className={`font-bold font-mono truncate mr-2 ${titleColor}`}>
            {asteroid.name}
          </h4>
          {isDanger && (
            <AlertTriangle
              size={16}
              className={`shrink-0 ${isRipple ? "text-red-400" : "text-red-500"}`}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Wind size={12} /> Velocity
              </span>
              <span className="font-mono text-gray-300 truncate">
                {asteroid.speedKmh} km/h
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Ruler size={12} /> Est. Size
              </span>
              <span className="font-mono text-gray-300 truncate">
                {asteroid.estimatedDiameter}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-1">
                <Target size={12} /> Miss Distance
              </span>
              <span className="font-mono text-gray-300">
                {asteroid.lunarDistance} LD
              </span>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor-image="true"
      className="relative rounded-xl cursor-none overflow-hidden shrink-0"
    >
      {renderContent(false)}

      <div
        className="absolute inset-0 z-10 pointer-events-none transition-[clip-path] duration-700 ease-out"
        style={{
          clipPath: `circle(${isHovered ? 150 : 0}% at ${mousePos.x}px ${mousePos.y}px)`,
        }}
      >
        {renderContent(true)}
      </div>
    </div>
  );
}

/* =========================================================
   PHYSICS-BASED TICKER TAPE
   ========================================================= */
function SmoothTicker({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const xValue = useMotionValue(0);
  const speed = useSpring(1, { damping: 40, stiffness: 50 });

  useEffect(() => {
    speed.set(isHovered ? 0 : 1);
  }, [isHovered, speed]);

  useAnimationFrame((_, delta) => {
    let currentX = xValue.get();
    currentX -= delta * 0.001 * speed.get();
    if (currentX <= -50) currentX += 50;
    xValue.set(currentX);
  });

  const x = useTransform(xValue, (v) => `${v}%`);

  return (
    <div
      className="relative w-full pb-4 pt-6 z-10"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex gap-6 w-max cursor-grab active:cursor-grabbing pl-4 pr-4"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN RADAR COMPONENT
   ========================================================= */
export default function AsteroidRadar({ data }: AsteroidRadarProps) {
  const isDanger = data.statusColor === "red";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start end", "end start"],
  });

  // The cinematic continuous scroll map
  const rawX = useTransform(
    scrollYProgress,
    [0.1, 0.35, 0.65, 0.9],
    [1200, 0, 0, -1200],
  );

  // Heavily damped spring for a solid, weighty glide into place
  const x = useSpring(rawX, { stiffness: 60, damping: 25, mass: 1 });
  const opacity = useTransform(
    scrollYProgress,
    [0.1, 0.25, 0.75, 0.9],
    [0, 1, 1, 0],
  );

  const maxDistance = Math.max(
    1,
    ...data.asteroids.map((a) => parseFloat(a.lunarDistance)),
  );

  return (
    <div className="relative w-full mt-40 mb-10">
      <div ref={scrollContainerRef} className="relative w-full h-[250vh]">
        <div className="sticky top-0 w-full h-screen flex flex-col justify-center overflow-hidden py-10">
          {/* MAIN CONTAINER: Clean, solid rounded-3xl box */}
          <motion.div
            style={{ x, opacity }}
            className={`relative w-full flex flex-col p-8 md:p-10 rounded-3xl border border-gray-800 ${
              isDanger
                ? "bg-gradient-to-br from-red-950/30 to-black border-red-900/50 shadow-[0_20px_40px_-15px_rgba(153,27,27,0.4)]"
                : "bg-gradient-to-br from-cyan-950/30 to-black border-cyan-900/50 shadow-[0_20px_40px_-15px_rgba(20,83,45,0.4)]"
            }`}
          >
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between mb-4 z-20">
              <h3 className="group flex items-center gap-2 cursor-none w-fit">
                <span className="text-2xl">☄️</span>
                <button className="outline-none">
                  <StaggeredText
                    text="Asteroid Radar"
                    className="font-bold text-2xl text-cyan-400"
                  />
                </button>
              </h3>
              <button
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-none ${
                  isDanger ? "bg-red-500" : "bg-green-500"
                } text-black`}
              >
                {isDanger ? "WARNING" : "SAFE"}
              </button>
            </div>

            {/* --- SUMMARY --- */}
            <p className="text-2xl md:text-3xl font-mono font-bold mb-2 z-20">
              {data.text}
            </p>

            {/* --- API SOURCE & INFO TOOLTIP --- */}
            <div className="flex items-center gap-2 mb-8 z-20">
              <p className="text-sm text-gray-500">
                Real-time data from NASA NeoWs API
              </p>
              <div
                className="relative group/info flex items-center cursor-none"
                data-cursor-invert="true"
              >
                <Info
                  size={16}
                  className="text-gray-500 group-hover/info:text-cyan-400 transition"
                />
                <div className="absolute bottom-full left-1/2 md:left-auto md:right-[-20px] -translate-x-1/2 md:translate-x-0 mb-3 w-[280px] md:w-[320px] p-5 bg-gray-900 text-xs text-gray-300 rounded-xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-gray-700">
                  <p className="mb-3">
                    <strong className="text-cyan-400">
                      Lunar Distance (LD)
                    </strong>{" "}
                    is the space between Earth and the Moon (~384,400 km).
                  </p>
                  <div className="relative flex items-center justify-between w-full h-8 px-2 mb-4 bg-black/40 rounded-full border border-gray-800/80 overflow-hidden">
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-700"></div>
                    <div className="relative z-10 flex items-center gap-1.5 bg-gray-900 pr-2">
                      <Earth size={14} className="text-cyan-500" />
                    </div>
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-2 text-[10px] text-gray-400 font-mono tracking-widest z-10 border border-gray-800 rounded-full">
                      1.0 LD
                    </span>
                    <div className="relative z-10 flex items-center gap-1.5 bg-gray-900 pl-2">
                      <Moon size={12} className="text-gray-400" />
                    </div>
                  </div>
                  <p>
                    <strong className="text-red-400">
                      Potentially Hazardous
                    </strong>{" "}
                    means it's large and its orbit comes relatively close to
                    Earth. It <strong className="text-white">does not</strong>{" "}
                    mean a collision is expected.
                  </p>
                  <div className="absolute top-full left-1/2 md:left-auto md:right-[24px] -translate-x-1/2 md:translate-x-0 -mt-[1px] border-[6px] border-transparent border-t-gray-700"></div>
                </div>
              </div>
            </div>

            {/* --- THE BUTTERY SMOOTH TICKER TAPE --- */}
            {/* FIX: Removed the stray 'index' props! */}
            <SmoothTicker>
              {data.asteroids.map((asteroid) => (
                <AsteroidCard
                  key={`set1-${asteroid.id}`}
                  asteroid={asteroid}
                  maxDistance={maxDistance}
                />
              ))}
              {data.asteroids.map((asteroid) => (
                <AsteroidCard
                  key={`set2-${asteroid.id}`}
                  asteroid={asteroid}
                  maxDistance={maxDistance}
                />
              ))}
            </SmoothTicker>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
