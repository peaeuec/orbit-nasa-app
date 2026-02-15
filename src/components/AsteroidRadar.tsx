"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Wind,
  Target,
  Info,
  Ruler,
  Earth,
  Moon,
} from "lucide-react";
import Lenis from "lenis";
import StaggeredText from "@/components/StaggeredText";

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
        className={`p-4 rounded-xl border h-full w-full flex flex-col justify-between ${bgColor} ${borderColor}`}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className={`font-bold font-mono ${titleColor}`}>
            {asteroid.name}
          </h4>
          {isDanger && (
            <AlertTriangle
              size={16}
              className={isRipple ? "text-red-400" : "text-red-500"}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Wind size={12} /> Velocity
              </span>
              <span className="font-mono text-gray-300">
                {asteroid.speedKmh} km/h
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Ruler size={12} /> Est. Size
              </span>
              <span className="font-mono text-gray-300">
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
      className="relative rounded-xl cursor-none transition-transform duration-300 hover:scale-[1.01] overflow-hidden shrink-0"
    >
      {renderContent(false)}

      <div
        className="absolute inset-0 z-10 pointer-events-none transition-[clip-path] duration-1300 ease-out"
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
   MAIN RADAR COMPONENT
   ========================================================= */
export default function AsteroidRadar({ data }: AsteroidRadarProps) {
  const isDanger = data.statusColor === "red";
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: scrollRef.current.firstElementChild as HTMLElement,
      lerp: 0.1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const maxDistance = Math.max(
    1,
    ...data.asteroids.map((a) => parseFloat(a.lunarDistance)),
  );

  return (
    <div
      // IMPORTANT FIX: Changed h-full to a fixed h-[500px] so it stops growing infinitely!
      className={`flex flex-col h-[500px] p-6 md:p-8 rounded-2xl border transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] ${
        isDanger
          ? "border-red-900 bg-gradient-to-br from-red-950/30 to-black hover:shadow-[0_20px_40px_-15px_rgba(153,27,27,0.4)] hover:border-red-800"
          : "border-green-900 bg-gradient-to-br from-green-950/30 to-black hover:shadow-[0_20px_40px_-15px_rgba(20,83,45,0.4)] hover:border-green-800"
      }`}
    >
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3
          className="group flex items-center gap-2 cursor-none w-fit"
          data-cursor-invert="true"
        >
          <span className="text-2xl">☄️</span>
          <StaggeredText
            text="Asteroid Radar"
            className="font-bold text-2xl text-cyan-400"
          />
        </h3>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
            isDanger ? "bg-red-500 text-black" : "bg-green-500 text-black"
          }`}
        >
          {isDanger ? "WARNING" : "SAFE"}
        </span>
      </div>

      {/* --- SUMMARY --- */}
      <p className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-2 text-white shrink-0">
        {data.text}
      </p>

      {/* --- API SOURCE & INFO TOOLTIP --- */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <p className="text-sm text-gray-500">
          Real-time data from NASA NeoWs API
        </p>
        <div className="relative group flex items-center">
          <Info
            size={16}
            className="text-gray-500 hover:text-blue-400 cursor-help transition"
          />

          <div className="absolute bottom-full left-1/2 md:left-auto md:right-[-20px] -translate-x-1/2 md:translate-x-0 mb-3 w-[280px] md:w-[320px] p-5 bg-gray-900 text-xs text-gray-300 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-gray-700">
            <p className="mb-3">
              <strong className="text-blue-400">Lunar Distance (LD)</strong> is
              the space between Earth and the Moon (~384,400 km).
            </p>

            <div className="relative flex items-center justify-between w-full h-8 px-2 mb-4 bg-black/40 rounded-full border border-gray-800/80 overflow-hidden">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-700"></div>

              <div className="relative z-10 flex items-center gap-1.5 bg-gray-900 pr-2">
                <Earth size={14} className="text-blue-500" />
              </div>

              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-2 text-[10px] text-gray-400 font-mono tracking-widest z-10 border border-gray-800 rounded-full">
                1.0 LD
              </span>

              <div className="relative z-10 flex items-center gap-1.5 bg-gray-900 pl-2">
                <Moon size={12} className="text-gray-400" />
              </div>
            </div>

            <p>
              <strong className="text-red-400">Potentially Hazardous</strong>{" "}
              means it's large and its orbit comes relatively close to Earth. It{" "}
              <strong className="text-white">does not</strong> mean a collision
              is expected.
            </p>

            <div className="absolute top-full left-1/2 md:left-auto md:right-[24px] -translate-x-1/2 md:translate-x-0 -mt-[1px] border-[6px] border-transparent border-t-gray-700"></div>
          </div>
        </div>
      </div>

      {/* --- THREAT BOARD (Scrollable List) --- */}
      {/* IMPORTANT FIX: Added min-h-0 here to force the flexbox to respect the parent's height and actually scroll! */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto pl-2 pr-4 custom-scrollbar"
        data-lenis-prevent
      >
        <div className="flex flex-col gap-3 pb-2">
          {data.asteroids.map((asteroid) => (
            <AsteroidCard
              key={asteroid.id}
              asteroid={asteroid}
              maxDistance={maxDistance}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
