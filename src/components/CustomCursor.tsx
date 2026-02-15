"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [variant, setVariant] = useState("default");

  // Track exact mouse position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Apply fluid spring physics to the movement
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;

      // 1. Check if hovering over an image or the User Avatar
      const isImage =
        target.tagName === "IMG" ||
        target.closest("img") ||
        target.closest(".avatar-container");

      // 2. Check if hovering over a clickable element (Links, Buttons)
      const isClickable =
        target.closest("a") ||
        target.tagName === "BUTTON" ||
        target.closest("button");

      if (isImage) {
        setVariant("image");
      } else if (isClickable) {
        setVariant("clickable");
      } else {
        setVariant("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [mouseX, mouseY]);

  // Define the shapes and states of the cursor
  const variants = {
    default: {
      width: 16,
      height: 16,
      backgroundColor: "white",
      border: "0px solid white",
      mixBlendMode: "difference" as any, // Inverts colors underneath
    },
    clickable: {
      width: 64,
      height: 64,
      backgroundColor: "white",
      border: "0px solid white",
      mixBlendMode: "difference" as any,
    },
    image: {
      width: 80,
      height: 80,
      backgroundColor: "transparent",
      border: "2px solid rgba(255, 255, 255, 0.8)", // Hollow Ring
      mixBlendMode: "normal" as any, // Drop the difference mode so it doesn't distort the image colors
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] hidden md:flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%", // Centers the cursor directly on the mouse tip
        translateY: "-50%",
      }}
      variants={variants}
      animate={variant}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.5,
      }}
    />
  );
}
