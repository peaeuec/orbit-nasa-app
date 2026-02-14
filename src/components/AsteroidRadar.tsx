"use client";

import { AlertTriangle, Activity, Wind, Target } from "lucide-react";

interface Asteroid {
  id: string;
  name: string;
  isHazardous: boolean;
  speedKmh: string;
  lunarDistance: string;
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

  return (
    <div
      className={`flex flex-col h-full p-6 md:p-8 rounded-2xl border transition-all hover:scale-[1.02] ${
        isDanger
          ? "border-red-900 bg-gradient-to-br from-red-950/30 to-black"
          : "border-green-900 bg-gradient-to-br from-green-950/30 to-black"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl flex items-center gap-3 text-white">
          <Activity className={isDanger ? "text-red-500" : "text-green-500"} />
          Asteroid Radar
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
            isDanger ? "bg-red-500 text-black" : "bg-green-500 text-black"
          }`}
        >
          {isDanger ? "WARNING" : "SAFE"}
        </span>
      </div>

      {/* Summary */}
      <p className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-2 text-white">
        {data.text}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Real-time data from NASA NeoWs API
      </p>

      {/* Threat Board (Scrollable List) */}
      <div
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[250px] flex flex-col gap-3"
        data-lenis-prevent
      >
        {data.asteroids.map((asteroid) => (
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

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Speedometer */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 flex items-center gap-1">
                  <Wind size={12} /> Velocity
                </span>
                <span className="font-mono text-gray-300">
                  {asteroid.speedKmh} km/h
                </span>
              </div>

              {/* Lunar Distance (LD) */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 flex items-center gap-1">
                  <Target size={12} /> Miss Distance
                </span>
                <span className="font-mono text-gray-300">
                  {asteroid.lunarDistance} LD
                </span>

                {/* Visual Distance Bar (Caps at 100 Lunar Distances for visual scale) */}
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${asteroid.isHazardous ? "bg-red-500" : "bg-blue-500"}`}
                    style={{
                      width: `${Math.max(2, 100 - parseFloat(asteroid.lunarDistance))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
