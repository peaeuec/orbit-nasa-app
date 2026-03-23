"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export default function Starfield() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate random stars on the client to avoid hydration mismatch
    // NEW: Increased length from 60 to 100 for density
    const generatedStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      // NEW: Size range slightly increased (1.5px to 4px) for prominence
      size: Math.random() * 2.5 + 1.5,
      duration: Math.random() * 5 + 3, // Slower, dreamier pulse
      delay: Math.random() * 2,
      driftX: Math.random() * 40 - 20, // Float left or right by up to 20px
      driftY: Math.random() * 40 - 20, // Float up or down by up to 20px
    }));
    setStars(generatedStars);
  }, []);

  return (
    // FIX: Container opacity increased to 80% to make stars pop
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-80">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          // NEW: Added a glowing drop shadow to make them much more prominent
          className="absolute bg-white rounded-full drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            // NEW: The max opacity now pulses to 100%
            opacity: [0.1, 1.0, 0.1],
            x: [0, star.driftX, 0],
            y: [0, star.driftY, 0],
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
      {/* Optional: Add a subtle overlay gradient to blend the stars into the background */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
    </div>
  );
}
