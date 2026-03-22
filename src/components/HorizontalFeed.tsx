"use client";

import { useState, useEffect, useRef } from "react";
import { SpacePost } from "@/lib/types";
import {
  PlayCircle,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
  LogIn,
  Loader2,
} from "lucide-react";
import { toggleNativeFullscreen } from "@/utils/fullscreen";
import StaggeredText from "@/components/StaggeredText";
import { likePost } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface HorizontalFeedProps {
  posts: SpacePost[];
  title: string;
  subtitle?: string;
  initialLikes?: string[];
  userId?: string;
}

export default function HorizontalFeed({
  posts,
  title,
  subtitle,
  initialLikes = [],
  userId,
}: HorizontalFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedPost, setSelectedPost] = useState<SpacePost | null>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(initialLikes),
  );
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({});
  const [showLogin, setShowLogin] = useState(false);

  // --- NEW: THE FROZEN BASE COUNTS REFUGE ---
  const baseCountsRef = useRef<Record<string, number>>({});
  if (posts) {
    posts.forEach((post) => {
      if (baseCountsRef.current[post.id] === undefined) {
        baseCountsRef.current[post.id] = post.likes || 0;
      }
    });
  }

  const handleLike = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!userId) {
      setShowLogin(true);
      return;
    }

    const isLiked = likedPosts.has(id);

    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (isLiked) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });

    setLikeDeltas((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (isLiked ? -1 : 1),
    }));

    await likePost(id);
  };

  // --- FIX: UPDATED MATH LOGIC ---
  const getDisplayLikes = (post: SpacePost) => {
    const baseCount = baseCountsRef.current[post.id] ?? (post.likes || 0);
    const delta = likeDeltas[post.id] || 0;
    return Math.max(0, baseCount + delta);
  };

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [posts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -304 : 304;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragDistance(0);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance(Math.abs(walk));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (selectedPost || showLogin) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      setIsZoomed(false);
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [selectedPost, showLogin]);

  useEffect(() => {
    if (selectedPost?.mediaType === "video") {
      setLoadingVideo(true);
      setVideoUrl(null);
      fetch(
        `https://images-assets.nasa.gov/video/${selectedPost.id}/collection.json`,
      )
        .then((res) => res.json())
        .then((urls: string[]) => {
          const mp4 =
            urls.find((url) => url.endsWith("~medium.mp4")) ||
            urls.find((url) => url.endsWith("~orig.mp4")) ||
            urls.find((url) => url.endsWith(".mp4"));
          setVideoUrl(mp4 || null);
          setLoadingVideo(false);
        })
        .catch((err) => {
          console.error("Failed to load video", err);
          setLoadingVideo(false);
        });
    }
  }, [selectedPost]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        setFullscreenId(document.fullscreenElement.id);
      } else {
        setFullscreenId(null);
        setIsZoomed(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  return (
    <>
      <style>{`
        :fullscreen { cursor: auto !important; }
        :fullscreen * { cursor: inherit !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER & NAVIGATION DECK */}
      <div className="flex items-end justify-between mb-6">
        <div className="border-l-4 border-cyan-500 pl-4">
          <h2
            className="group cursor-none w-fit outline-none flex"
            data-cursor-invert="true"
          >
            <StaggeredText
              text={title}
              className="text-3xl font-bold text-white"
              hideClass="group-hover:-translate-y-full"
              showClass="group-hover:translate-y-0 text-cyan-400"
            />
          </h2>
          {subtitle && (
            <p
              className="text-gray-400 mt-1 cursor-none w-fit"
              data-cursor-invert="true"
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* DYNAMIC NAVIGATION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500 hover:bg-gray-800 transition-all duration-300 cursor-none origin-right ${
              canScrollLeft
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50 pointer-events-none"
            }`}
            data-cursor-invert="true"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => scroll("right")}
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500 hover:bg-gray-800 transition-all duration-300 cursor-none origin-left ${
              canScrollRight
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50 pointer-events-none"
            }`}
            data-cursor-invert="true"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL */}
      <div
        ref={scrollRef}
        data-lenis-prevent="true"
        onScroll={checkScrollPosition}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        className={`flex gap-6 overflow-x-auto pb-6 no-scrollbar ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {posts.map((item) => {
          const isThisFullscreen =
            fullscreenId === `horizontal-media-${item.id}`;
          const isLiked = likedPosts.has(item.id);

          return (
            <div
              key={item.id}
              className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] group relative flex flex-col shrink-0"
              style={{ cursor: isDragging ? "grabbing" : "none" }}
              data-cursor-image="true"
              onClick={(e) => {
                if (dragDistance > 10) {
                  e.preventDefault();
                  return;
                }
                setSelectedPost(item);
              }}
            >
              <div
                id={`horizontal-media-${item.id}`}
                className={`relative transition-colors duration-300 overflow-hidden ${
                  isThisFullscreen
                    ? "w-full h-full bg-black flex items-center justify-center border-none rounded-none"
                    : "aspect-[4/3] rounded-xl bg-gray-900 border border-gray-800 mb-3 group/wrapper"
                }`}
                onClick={(e) => {
                  if (isThisFullscreen && item.mediaType === "image") {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                  }
                }}
                onMouseMove={(e) => {
                  if (isThisFullscreen && item.mediaType === "image") {
                    handleZoomMove(e);
                  }
                }}
                data-cursor-image="true"
                style={{
                  cursor:
                    isThisFullscreen && item.mediaType === "image"
                      ? isZoomed
                        ? "zoom-out"
                        : "zoom-in"
                      : "auto",
                }}
              >
                <img
                  src={
                    isThisFullscreen && item.mediaType === "image"
                      ? item.highResUrl || item.imageUrl
                      : item.imageUrl
                  }
                  className={`transition-transform duration-[2s] ease-out pointer-events-none ${
                    isThisFullscreen
                      ? "w-full h-full object-contain"
                      : "w-full h-full object-cover group-hover:scale-105"
                  }`}
                  style={
                    isThisFullscreen
                      ? {
                          transform: isZoomed ? "scale(2.5)" : "scale(1)",
                          transformOrigin: transformOrigin,
                        }
                      : {}
                  }
                  alt={item.title}
                />

                {/* Video Play Icon */}
                {!isThisFullscreen && item.mediaType === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <PlayCircle size={40} className="text-white opacity-80" />
                  </div>
                )}

                {/* Likes Badge on Image */}
                {!isThisFullscreen && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none z-10">
                    <Heart
                      size={12}
                      className={
                        isLiked ? "fill-pink-500 text-pink-500" : "text-white"
                      }
                    />
                    <span className="text-xs font-bold text-white">
                      {getDisplayLikes(item)}
                    </span>
                  </div>
                )}

                {item.mediaType === "image" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNativeFullscreen(e, `horizontal-media-${item.id}`);
                    }}
                    className={`absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full transition transform hover:scale-110 z-20 border border-gray-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-none ${
                      isThisFullscreen
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 group-hover/wrapper:opacity-100"
                    }`}
                  >
                    {isThisFullscreen ? (
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
              <p className="text-xs text-gray-500 pointer-events-none">
                {item.date}
              </p>
            </div>
          );
        })}
      </div>

      {/* --- LOGIN MODAL --- */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-auto"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-400">
                <LogIn size={32} />
              </div>

              <h2 className="text-2xl font-bold mb-2">Join the Mission</h2>
              <p className="text-gray-400 mb-8">
                Log in to curate your own collection, save favorites, and track
                your exploration stats.
              </p>

              <Link
                href="/login"
                className="block w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-full transition"
              >
                Log In to Continue
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN POST MODAL */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-auto"
          onClick={() => setSelectedPost(null)}
          onWheel={(e) => e.stopPropagation()}
        >
          <button className="absolute top-6 right-6 text-gray-400 hover:text-white z-50 bg-gray-800/80 hover:bg-gray-700 rounded-full p-3 transition border border-gray-700">
            <X size={24} />
          </button>

          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="horizontal-modal-wrapper"
              className="md:w-2/3 bg-black flex items-center justify-center p-4 relative group/modal-media overflow-hidden"
              onClick={() => setIsZoomed(!isZoomed)}
              onMouseMove={handleZoomMove}
              data-cursor-image="true"
              style={{
                cursor:
                  selectedPost.mediaType === "image"
                    ? isZoomed
                      ? "zoom-out"
                      : "zoom-in"
                    : "auto",
              }}
            >
              {selectedPost.mediaType === "video" ? (
                loadingVideo ? (
                  <div className="flex flex-col items-center gap-2 text-cyan-400">
                    <Loader2 className="animate-spin w-10 h-10" />
                    <span className="text-sm font-mono">
                      RETRIEVING VIDEO FEED...
                    </span>
                  </div>
                ) : videoUrl ? (
                  <video
                    src={videoUrl}
                    className="w-full h-full max-h-[85vh] outline-none"
                    controls
                    autoPlay
                  />
                ) : (
                  <p className="text-red-500 font-mono">VIDEO SIGNAL LOST</p>
                )
              ) : (
                <img
                  src={selectedPost.highResUrl || selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className={`w-full h-full max-h-[90vh] object-contain transition-transform duration-300 ease-out`}
                  style={{
                    transform: isZoomed ? "scale(2.5)" : "scale(1)",
                    transformOrigin: transformOrigin,
                  }}
                />
              )}

              <button
                onClick={(e) =>
                  toggleNativeFullscreen(e, "horizontal-modal-wrapper")
                }
                className="absolute top-6 right-6 bg-black/50 backdrop-blur-md p-3 rounded-full opacity-0 group-hover/modal-media:opacity-100 transition transform hover:scale-110 z-20 border border-gray-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-none"
              >
                {fullscreenId === "horizontal-modal-wrapper" ? (
                  <Minimize2 className="text-white w-5 h-5" />
                ) : (
                  <Maximize2 className="text-white w-5 h-5" />
                )}
              </button>
            </div>

            <div
              className="md:w-1/3 p-8 flex flex-col bg-gray-900 border-l border-gray-800 overflow-y-auto"
              data-lenis-prevent
            >
              <div className="mb-6">
                <span className="bg-cyan-900/30 text-cyan-400 border border-cyan-900/50 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {selectedPost.date}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white leading-tight">
                {selectedPost.title}
              </h2>
              <div className="flex-1 overflow-y-auto overflow-x-hidden pr-4 mb-6 custom-scrollbar">
                <p className="text-gray-300 text-sm md:text-base leading-relaxed break-words whitespace-pre-line">
                  {selectedPost.description}
                </p>
              </div>

              {/* MODAL ACTIONS (LIKE & DOWNLOAD) */}
              <div className="flex gap-3 mt-auto pt-6 border-t border-gray-800/60 relative z-20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleLike(selectedPost.id, e)}
                  className={`group relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 cursor-none overflow-hidden border ${
                    likedPosts.has(selectedPost.id)
                      ? "bg-pink-500/10 border-pink-500/50 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                      : "bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-500"
                  }`}
                >
                  {likedPosts.has(selectedPost.id) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10 blur-md pointer-events-none" />
                  )}

                  <Heart
                    size={18}
                    className={`relative z-10 transition-transform duration-300 ${
                      likedPosts.has(selectedPost.id)
                        ? "scale-110"
                        : "group-hover:scale-110"
                    }`}
                    fill={
                      likedPosts.has(selectedPost.id) ? "currentColor" : "none"
                    }
                  />
                  <span className="relative z-10 flex items-center gap-1.5 tracking-wider text-sm uppercase">
                    {likedPosts.has(selectedPost.id) ? "Saved" : "Save"}
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs ml-1 transition-colors font-mono ${
                        likedPosts.has(selectedPost.id)
                          ? "bg-pink-500/20 text-pink-300"
                          : "bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300"
                      }`}
                    >
                      {getDisplayLikes(selectedPost)}
                    </span>
                  </span>
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  href={
                    videoUrl || selectedPost.highResUrl || selectedPost.imageUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="group relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 cursor-none overflow-hidden border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                  <Download
                    size={18}
                    className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <span className="relative z-10 tracking-wider text-sm uppercase">
                    Original
                  </span>
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
