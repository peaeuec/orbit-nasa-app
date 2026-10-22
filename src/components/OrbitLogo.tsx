"use client";

import { motion } from "framer-motion";

interface OrbitLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export default function OrbitLogo({
  size = "md",
  className = "",
  showIcon = true,
}: OrbitLogoProps) {
  // Size presets
  const config = {
    sm: {
      iconBox: "w-6 h-6",
      core: "w-1.5 h-1.5",
      satellite: "w-1 h-1 -top-0.5",
      text: "text-lg font-extrabold tracking-tight",
      gap: "gap-2",
    },
    md: {
      iconBox: "w-8 h-8",
      core: "w-2.5 h-2.5",
      satellite: "w-1.5 h-1.5 -top-1",
      text: "text-2xl font-extrabold tracking-tight",
      gap: "gap-2.5",
    },
    lg: {
      iconBox: "w-12 h-12",
      core: "w-3.5 h-3.5",
      satellite: "w-2 h-2 -top-1.5",
      text: "text-4xl md:text-5xl font-extrabold tracking-tight",
      gap: "gap-3.5",
    },
  }[size];

  return (
    <div className={`group flex items-center ${config.gap} select-none ${className}`}>
      {showIcon && (
        <div className={`relative flex items-center justify-center ${config.iconBox}`}>
          {/* Luminous Central Celestial Core */}
          <div
            className={`${config.core} rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_16px_rgba(6,182,212,0.4)]`}
          />

          {/* Tilted Elliptical Orbit Track */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-25 overflow-visible pointer-events-none"
            viewBox="0 0 32 32"
          >
            {/* Outer faint guide ring */}
            <ellipse
              cx="16"
              cy="16"
              rx="15"
              ry="6"
              fill="none"
              stroke="rgba(6, 182, 212, 0.25)"
              strokeWidth="1"
            />
            {/* Active dashed orbital trajectory */}
            <ellipse
              cx="16"
              cy="16"
              rx="15"
              ry="6"
              fill="none"
              stroke="rgba(34, 211, 238, 0.75)"
              strokeWidth="1.2"
              strokeDasharray="5 3"
            />
          </svg>

          {/* Orbiting Satellite Node with smooth continuous revolution */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center -rotate-25 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className={`absolute ${config.satellite} rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee,0_0_4px_#ffffff]`}
            />
          </motion.div>
        </div>
      )}

      {/* Clean, Solid, Architectural Typography (Matching Website Geist Font) */}
      <span
        className={`${config.text} text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:text-cyan-50 transition-colors`}
      >
        ORBIT
      </span>
    </div>
  );
}
