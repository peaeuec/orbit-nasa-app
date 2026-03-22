"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [variant, setVariant] = useState("default");

  // NEW: Store the exact screen coordinates of the mouse
  const mousePos = useRef({ x: -100, y: -100 });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // NEW: Centralized logic to check what is under the cursor
    const updateCursorVariant = (x: number, y: number) => {
      // Use elementFromPoint to grab the top-most element at these coordinates
      const target = document.elementFromPoint(x, y) as HTMLElement;
      if (!target) return;

      const isAvatar = target.closest(".avatar-container");
      const isClickable =
        target.closest("a") ||
        target.tagName === "BUTTON" ||
        target.closest("button");
      const isInvertText = target.closest("[data-cursor-invert='true']");
      const isImage =
        target.tagName === "IMG" ||
        target.closest("img") ||
        target.closest("[data-cursor-image='true']");

      if (isAvatar) {
        setVariant("image");
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

    // 1. Mouse Move Handler
    const moveCursor = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      updateCursorVariant(e.clientX, e.clientY);
    };

    // 2. Scroll Handler (Re-evaluates without the mouse moving)
    const handleScroll = () => {
      updateCursorVariant(mousePos.current.x, mousePos.current.y);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("scroll", handleScroll);
    };
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
    <>
      {/* NEW: Global CSS injection to kill the default pointer everywhere */}
      <style>{`
        @media (pointer: fine) {
          body, *:not(input):not(textarea) {
            cursor: none !important;
          }
        }
      `}</style>

      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-9999 hidden md:flex items-center justify-center"
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
    </>
  );
}
