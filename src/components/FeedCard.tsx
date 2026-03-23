"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SpacePost } from "@/lib/types";
import { Heart, PlayCircle, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { toggleNativeFullscreen } from "@/utils/fullscreen";

interface FeedCardProps {
  post: SpacePost;
  index: number;
  onClick: (post: SpacePost) => void;
  isLiked: boolean;
  displayLikes: number;
  isSelecting?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export default function FeedCard({
  post,
  index,
  onClick,
  isLiked,
  displayLikes,
  isSelecting,
  isSelected,
  onSelect,
}: FeedCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  useEffect(() => {
    const handleFsChange = () => {
      const isFull = document.fullscreenElement?.id === `grid-media-${post.id}`;
      setIsFullscreen(isFull);
      if (!isFull) setIsZoomed(false);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, [post.id]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!cardRef.current || isFullscreen) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!cardRef.current || isFullscreen) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(false);
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !isFullscreen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  const renderContent = (isRipple: boolean) => {
    const bgColor = isRipple ? "bg-gray-900" : "bg-gray-900/40";
    const borderColor = isRipple ? "border-cyan-500/50" : "border-gray-800";
    const titleColor = isRipple ? "text-cyan-400" : "text-white";

    return (
      <div
        className={`flex flex-col h-full w-full border rounded-2xl overflow-hidden transition-colors duration-300 ${bgColor} ${borderColor}`}
      >
        <div
          id={`grid-media-${post.id}`}
          className={`relative w-full group/media overflow-hidden ${isFullscreen ? "h-screen bg-black flex items-center justify-center border-none rounded-none" : ""}`}
          onClick={(e) => {
            if (isFullscreen && post.mediaType === "image") {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }
          }}
          onMouseMove={handleZoomMove}
          data-cursor-image="true"
          style={{
            cursor:
              isFullscreen && post.mediaType === "image"
                ? isZoomed
                  ? "zoom-out"
                  : "zoom-in"
                : "auto",
          }}
        >
          <Image
            src={
              isFullscreen && post.mediaType === "image"
                ? post.highResUrl || post.imageUrl
                : post.imageUrl
            }
            alt={post.title}
            width={0}
            height={0}
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`pointer-events-none transition-transform ease-out ${isFullscreen ? "object-contain duration-300" : "object-cover duration-[2s] group-hover:scale-105"}`}
            style={{
              width: "100%",
              height: isFullscreen ? "100%" : "auto",
              ...(isFullscreen && {
                transform: isZoomed ? "scale(2.5)" : "scale(1)",
                transformOrigin,
              }),
            }}
          />

          {!isFullscreen && post.mediaType === "video" && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition pointer-events-none ${isRipple ? "bg-black/40" : "bg-black/20"}`}
            >
              <PlayCircle
                className={`w-12 h-12 text-white drop-shadow-lg opacity-80 transition transform ${isRipple ? "scale-110" : "scale-100"}`}
              />
            </div>
          )}

          {!isFullscreen && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none z-10">
              <Heart
                size={12}
                className={
                  isLiked ? "fill-pink-500 text-pink-500" : "text-white"
                }
              />
              <span className="text-xs font-bold text-white">
                {displayLikes}
              </span>
            </div>
          )}

          {!isSelecting && post.mediaType === "image" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNativeFullscreen(e, `grid-media-${post.id}`);
              }}
              // FIX: Dynamically remove cursor-none when fullscreen
              className={`absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full transition transform hover:scale-110 z-20 border border-gray-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] ${isFullscreen ? "opacity-100 cursor-auto" : "opacity-0 group-hover:opacity-100 group-hover/media:opacity-100 cursor-none"}`}
            >
              {isFullscreen ? (
                <Minimize2 className="text-white w-4 h-4" />
              ) : (
                <Maximize2 className="text-white w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between pointer-events-none">
          <div>
            <h3
              className={`font-bold text-lg leading-tight mb-2 transition-colors ${titleColor}`}
            >
              {post.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-3">
              {post.description?.replace(/<[^>]*>?/gm, "")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={() => {
        if (isSelecting && onSelect) onSelect(post.id);
        else onClick(post);
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor-image="true"
      // FIX: Dynamically remove cursor-none on the parent wrapper when fullscreen
      className={`relative group mb-8 break-inside-avoid rounded-2xl overflow-hidden shrink-0 ${isFullscreen ? "cursor-auto" : "cursor-none"}`}
    >
      {renderContent(false)}

      {isSelecting && (
        <div
          className={`absolute inset-0 z-30 transition-all duration-200 border-4 rounded-2xl flex items-start justify-end p-4 pointer-events-none ${isSelected ? "border-cyan-500 bg-cyan-500/20" : "border-transparent group-hover:border-gray-500/50 bg-black/40"}`}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-cyan-500 bg-cyan-500 text-white" : "border-gray-400"}`}
          >
            {isSelected && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="w-4 h-4"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
        </div>
      )}

      {!isFullscreen && !isSelecting && (
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-[clip-path] duration-500 ease-out"
          style={{
            clipPath: `circle(${isHovered ? 150 : 0}% at ${mousePos.x}px ${mousePos.y}px)`,
          }}
        >
          {renderContent(true)}
        </div>
      )}
    </motion.div>
  );
}
