"use client";

import { useEffect, useRef } from "react";
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

export default function AsteroidRadar({ data }: AsteroidRadarProps) {
  const isDanger = data.statusColor === "red";
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- SCOPED LENIS SMOOTH SCROLLING ---
  useEffect(() => {
    if (!scrollRef.current) return;

    // Initialize Lenis specifically for this inner container
    const lenis = new Lenis({
      wrapper: scrollRef.current, // The overflow container
      content: scrollRef.current.firstElementChild as HTMLElement, // The inner moving content
      lerp: 0.9, // Smoothness factor
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

  // Calculate the maximum Lunar Distance for today to create a relative scale
  const maxDistance = Math.max(
    1,
    ...data.asteroids.map((a) => parseFloat(a.lunarDistance)),
  );

  return (
    <div
      className={`flex flex-col h-full p-6 md:p-8 rounded-2xl border transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] ${
        isDanger
          ? "border-red-900 bg-gradient-to-br from-red-950/30 to-black hover:shadow-[0_20px_40px_-15px_rgba(153,27,27,0.4)] hover:border-red-800"
          : "border-green-900 bg-gradient-to-br from-green-950/30 to-black hover:shadow-[0_20px_40px_-15px_rgba(20,83,45,0.4)] hover:border-green-800"
      }`}
    >
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl flex items-center gap-2 text-white">
          ☄️ Asteroid Radar
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
      <p className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-2 text-white">
        {data.text}
      </p>

      {/* --- API SOURCE & INFO TOOLTIP --- */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm text-gray-500">
          Real-time data from NASA NeoWs API
        </p>
        <div className="relative group flex items-center">
          <Info
            size={16}
            className="text-gray-500 hover:text-blue-400 cursor-help transition"
          />

          {/* Tooltip Card (Hidden until hovered) */}
          <div className="absolute bottom-full left-1/2 md:left-auto md:right-[-20px] -translate-x-1/2 md:translate-x-0 mb-3 w-[280px] md:w-[320px] p-5 bg-gray-900 text-xs text-gray-300 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-gray-700">
            <p className="mb-3">
              <strong className="text-blue-400">Lunar Distance (LD)</strong> is
              the space between Earth and the Moon (~384,400 km).
            </p>

            {/* Visual Aid Diagram */}
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

            {/* Little Triangle Arrow */}
            <div className="absolute top-full left-1/2 md:left-auto md:right-[24px] -translate-x-1/2 md:translate-x-0 -mt-[1px] border-[6px] border-transparent border-t-gray-700"></div>
          </div>
        </div>
      </div>

      {/* --- THREAT BOARD (Scrollable List) --- */}
      {/* Added data-lenis-prevent to stop the global Lenis from hijacking this div */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-3 custom-scrollbar max-h-[250px]"
        data-lenis-prevent
      >
        {/* Inner wrapper required for Lenis to calculate height properly */}
        <div className="flex flex-col gap-3 pb-2">
          {data.asteroids.map((asteroid) => {
            const ldValue = parseFloat(asteroid.lunarDistance);
            // Relative Scale: If it's the furthest object today, it fills ~2%.
            // If it's right next to us (0 LD), it fills 100%.
            const fillPercentage = Math.max(
              2,
              100 - (ldValue / maxDistance) * 100,
            );

            return (
              <div
                key={asteroid.id}
                className={`p-4 rounded-xl border ${
                  asteroid.isHazardous
                    ? "bg-red-950/20 border-red-900/50"
                    : "bg-gray-900/50 border-gray-800"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4
                    className={`font-bold font-mono ${asteroid.isHazardous ? "text-red-400" : "text-blue-400"}`}
                  >
                    {asteroid.name}
                  </h4>
                  {asteroid.isHazardous && (
                    <AlertTriangle size={16} className="text-red-500" />
                  )}
                </div>

                {/* Data Grid */}
                <div className="flex flex-col gap-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Speedometer */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Wind size={12} /> Velocity
                      </span>
                      <span className="font-mono text-gray-300">
                        {asteroid.speedKmh} km/h
                      </span>
                    </div>

                    {/* Estimated Size */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Ruler size={12} /> Est. Size
                      </span>
                      <span className="font-mono text-gray-300">
                        {asteroid.estimatedDiameter}
                      </span>
                    </div>
                  </div>

                  {/* Lunar Distance & Visual Bar */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Target size={12} /> Miss Distance
                      </span>
                      <span className="font-mono text-gray-300">
                        {asteroid.lunarDistance} LD
                      </span>
                    </div>

                    {/* Dynamic Bar */}
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          asteroid.isHazardous
                            ? "bg-red-500 shadow-[0_0_8px_red]"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${fillPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
