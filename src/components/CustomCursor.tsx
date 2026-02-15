"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [variant, setVariant] = useState("default");

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;

      // 1. EXCEPTION: Check for the Avatar first!
      const isAvatar = target.closest(".avatar-container");

      // 2. Check for interactive elements
      const isClickable =
        target.closest("a") ||
        target.tagName === "BUTTON" ||
        target.closest("button");

      // 3. Check for explicit text we want to invert
      const isInvertText = target.closest("[data-cursor-invert='true']");

      // 4. Fallback to standard Image checking
      const isImage =
        target.tagName === "IMG" ||
        target.closest("img") ||
        target.closest("[data-cursor-image='true']");

      // NEW HIERARCHY: Avatar > Buttons > Text > Images
      if (isAvatar) {
        setVariant("image"); // Forces the hollow ring, prevents inversion!
      } else if (isClickable) {
        setVariant("clickable");
      } else if (isInvertText) {
        setVariant("default");
      } else if (isImage) {
        setVariant("image");
      } else {
        setVariant("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      width: 16,
      height: 16,
      backgroundColor: "white",
      border: "0px solid white",
      mixBlendMode: "difference" as any,
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
      border: "2px solid rgba(255, 255, 255, 0.8)",
      mixBlendMode: "normal" as any,
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] hidden md:flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
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
