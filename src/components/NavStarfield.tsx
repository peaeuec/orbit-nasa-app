"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function NavStarfield() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate horizontal drifting stars
    const generatedStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      y: Math.random() * 100, // Random vertical position
      size: Math.random() * 2 + 1, // Random size
      duration: Math.random() * 30 + 15, // Travel time (15s to 45s for parallax depth)
      delay: -(Math.random() * 30), // Negative delay scatters them instantly across the screen
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
          initial={{ left: "-5%" }}
          animate={{ left: "105%" }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "linear", // Linear ease makes it a constant cruising speed
          }}
        />
      ))}
      {/* Vignette effect to seamlessly blend the edges of the navbar */}
      <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-black" />
    </div>
  );
}
