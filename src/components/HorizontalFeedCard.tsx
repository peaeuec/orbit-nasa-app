"use client";

import { useState, useEffect } from "react";
import { SpacePost } from "@/lib/types";
import { PlayCircle, Maximize2, Minimize2, Heart } from "lucide-react";
import { toggleNativeFullscreen } from "@/utils/fullscreen";

interface HorizontalFeedCardProps {
  item: SpacePost;
  isDragging: boolean;
  dragDistance: number;
  onClick: (post: SpacePost) => void;
  isLiked: boolean;
  displayLikes: number;
}

export default function HorizontalFeedCard({
  item,
  isDragging,
  dragDistance,
  onClick,
  isLiked,
  displayLikes,
}: HorizontalFeedCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  // Manage fullscreen state locally for this specific card
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull =
        document.fullscreenElement?.id === `horizontal-media-${item.id}`;
      setIsFullscreen(isFull);
      if (!isFull) setIsZoomed(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [item.id]);

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      className="min-w-70 w-70 md:min-w-[320px] md:w-[320px] group relative flex flex-col shrink-0"
      style={{ cursor: isDragging ? "grabbing" : "none" }}
      data-cursor-image="true"
      onClick={(e) => {
        if (dragDistance > 10) {
          e.preventDefault();
          return;
        }
        onClick(item);
      }}
    >
      <div
        id={`horizontal-media-${item.id}`}
        className={`relative transition-colors duration-300 overflow-hidden ${
          isFullscreen
            ? "w-full h-full bg-black flex items-center justify-center border-none rounded-none"
            : "aspect-4/3 rounded-xl bg-gray-900 border border-gray-800 mb-3 group/wrapper"
        }`}
        onClick={(e) => {
          if (isFullscreen && item.mediaType === "image") {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }
        }}
        onMouseMove={(e) => {
          if (isFullscreen && item.mediaType === "image") {
            handleZoomMove(e);
          }
        }}
        data-cursor-image="true"
        style={{
          cursor:
            isFullscreen && item.mediaType === "image"
              ? isZoomed
                ? "zoom-out"
                : "zoom-in"
              : "auto",
        }}
      >
        <img
          src={
            isFullscreen && item.mediaType === "image"
              ? item.highResUrl || item.imageUrl
              : item.imageUrl
          }
          className={`transition-transform duration-[2s] ease-out pointer-events-none ${
            isFullscreen
              ? "w-full h-full object-contain"
              : "w-full h-full object-cover group-hover:scale-105"
          }`}
          style={
            isFullscreen
              ? {
                  transform: isZoomed ? "scale(2.5)" : "scale(1)",
                  transformOrigin: transformOrigin,
                }
              : {}
          }
          alt={item.title}
        />

        {/* Video Play Icon */}
        {!isFullscreen && item.mediaType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <PlayCircle size={40} className="text-white opacity-80" />
          </div>
        )}

        {/* Likes Badge on Image */}
        {!isFullscreen && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none z-10">
            <Heart
              size={12}
              className={isLiked ? "fill-pink-500 text-pink-500" : "text-white"}
            />
            <span className="text-xs font-bold text-white">{displayLikes}</span>
          </div>
        )}

        {/* Fullscreen Toggle */}
        {item.mediaType === "image" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNativeFullscreen(e, `horizontal-media-${item.id}`);
            }}
            className={`absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full transition transform hover:scale-110 z-20 border border-gray-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-none ${
              isFullscreen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-hover/wrapper:opacity-100"
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="text-white w-4 h-4" />
            ) : (
              <Maximize2 className="text-white w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <h3 className="font-bold truncate group-hover:text-cyan-400 transition pointer-events-none">
        {item.title}
      </h3>
      <p className="text-xs text-gray-500 pointer-events-none">{item.date}</p>
    </div>
  );
}
