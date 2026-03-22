"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SpacePost } from "@/lib/types";
import {
  X,
  Download,
  Heart,
  PlayCircle,
  Loader2,
  LogIn,
  Bug,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { likePost } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import Link from "next/link";
import { toggleNativeFullscreen } from "@/utils/fullscreen";

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

interface FeedGridProps {
  posts: SpacePost[];
  initialLikes?: string[];
  userId?: string;
}

/* =========================================================
   INDIVIDUAL FEED CARD
   ========================================================= */
function FeedCard({
  post,
  index,
  onClick,
  isLiked,
  displayLikes,
}: {
  post: SpacePost;
  index: number;
  onClick: (post: SpacePost) => void;
  isLiked: boolean;
  displayLikes: number;
}) {
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
          className={`relative w-full group/media overflow-hidden ${
            isFullscreen
              ? "h-screen bg-black flex items-center justify-center border-none rounded-none"
              : ""
          }`}
          onClick={(e) => {
            if (isFullscreen && post.mediaType === "image") {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }
          }}
          onMouseMove={handleZoomMove}
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
            className={`pointer-events-none transition-transform ease-out ${
              isFullscreen
                ? "object-contain duration-300"
                : "object-cover duration-[2s] group-hover:scale-105"
            }`}
            style={{
              width: "100%",
              height: isFullscreen ? "100%" : "auto",
              ...(isFullscreen && {
                transform: isZoomed ? "scale(2.5)" : "scale(1)",
                transformOrigin: transformOrigin,
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

          {post.mediaType === "image" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNativeFullscreen(e, `grid-media-${post.id}`);
              }}
              className={`absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full transition transform hover:scale-110 z-20 border border-gray-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-none ${
                isFullscreen
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 group-hover/media:opacity-100"
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
      onClick={() => onClick(post)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor-image="true"
      className="relative group mb-8 break-inside-avoid cursor-none rounded-2xl overflow-hidden shrink-0"
    >
      {renderContent(false)}
      {!isFullscreen && (
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

/* =========================================================
   MAIN FEED GRID COMPONENT
   ========================================================= */
export default function FeedGrid({
  posts,
  initialLikes = [],
  userId,
}: FeedGridProps) {
  const [selectedPost, setSelectedPost] = useState<SpacePost | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const [isModalZoomed, setIsModalZoomed] = useState(false);
  const [modalTransformOrigin, setModalTransformOrigin] =
    useState("center center");

  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(initialLikes),
  );
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({});
  const [showLogin, setShowLogin] = useState(false);

  // --- NEW: THE FROZEN BASE COUNTS REFUGE ---
  // This securely caches the server's initial counts so revalidations don't break our math
  const baseCountsRef = useRef<Record<string, number>>({});
  if (posts) {
    posts.forEach((post) => {
      if (baseCountsRef.current[post.id] === undefined) {
        baseCountsRef.current[post.id] = post.likes || 0;
      }
    });
  }

  // --- SCROLL LOCKING ---
  useEffect(() => {
    if (selectedPost || showLogin) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      setIsModalZoomed(false);
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [selectedPost, showLogin]);

  // --- MODAL NATIVE FULLSCREEN LISTENER ---
  useEffect(() => {
    const handleFsChange = () => {
      const isFull = document.fullscreenElement?.id === "grid-modal-media";
      setIsModalFullscreen(isFull);
      if (!isFull) setIsModalZoomed(false);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleModalZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isModalZoomed || !isModalFullscreen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setModalTransformOrigin(`${x}% ${y}%`);
  };

  // --- VIDEO FETCH LOGIC ---
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

  // --- LIKE LOGIC ---
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

  const parseDescription = (text: string) => {
    if (!text) return "No description available.";

    let clean = text;
    clean = clean.replace(/\u00A0/g, " ");
    clean = clean.replace(/\s{2,}(?=[A-Z])/g, "<br /><br />");
    clean = clean.replace(/\r\n|\r|\n/g, "<br />");

    const existingLinks: string[] = [];
    clean = clean.replace(/<a[\s\S]*?<\/a>/gi, (match) => {
      existingLinks.push(match);
      return `___LINK_PLACEHOLDER_${existingLinks.length - 1}___`;
    });

    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
    clean = clean.replace(urlRegex, (url) => {
      const href = url.startsWith("www.") ? `http://${url}` : url;
      return `<a href="${href}">${url}</a>`;
    });

    existingLinks.forEach((link, index) => {
      clean = clean.replace(`___LINK_PLACEHOLDER_${index}___`, link);
    });

    clean = clean.replace(/<a\b([^>]*)>/gi, (match, attributes) => {
      if (!attributes.includes("target=")) {
        return `<a target="_blank" rel="noopener noreferrer" ${attributes}>`;
      }
      return match;
    });

    return clean;
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-8"
        columnClassName="pl-8 bg-clip-padding"
      >
        {posts.map((post, index) => (
          <FeedCard
            key={post.id}
            post={post}
            index={index}
            onClick={setSelectedPost}
            isLiked={likedPosts.has(post.id)}
            displayLikes={getDisplayLikes(post)}
          />
        ))}
      </Masonry>

      {/* --- LOGIN MODAL --- */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-150 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-auto"
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

      {/* --- FULL SCREEN POST MODAL --- */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition z-50 cursor-none"
          >
            <X size={32} />
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
            <div
              id="grid-modal-media"
              className="md:w-[60%] bg-black flex items-center justify-center p-2 relative group/modal-media overflow-hidden"
              onClick={() => {
                if (isModalFullscreen && selectedPost.mediaType === "image") {
                  setIsModalZoomed(!isModalZoomed);
                }
              }}
              onMouseMove={handleModalZoomMove}
              data-cursor-image="true"
              style={{
                cursor:
                  isModalFullscreen && selectedPost.mediaType === "image"
                    ? isModalZoomed
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
                <Image
                  src={selectedPost.highResUrl || selectedPost.imageUrl}
                  alt={selectedPost.title}
                  width={0}
                  height={0}
                  unoptimized={true}
                  sizes="(max-width: 1200px) 100vw, 60vw"
                  className="object-contain transition-transform duration-300 ease-out pointer-events-none"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "85vh",
                    transform: isModalZoomed ? "scale(2.5)" : "scale(1)",
                    transformOrigin: modalTransformOrigin,
                  }}
                />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNativeFullscreen(e, "grid-modal-media");
                }}
                className="absolute top-6 right-6 bg-black/50 backdrop-blur-md p-3 rounded-full opacity-0 group-hover/modal-media:opacity-100 transition transform hover:scale-110 z-20 border border-gray-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-none"
              >
                {isModalFullscreen ? (
                  <Minimize2 className="text-white w-5 h-5" />
                ) : (
                  <Maximize2 className="text-white w-5 h-5" />
                )}
              </button>
            </div>

            <div
              className="md:w-[40%] p-6 md:p-8 flex flex-col border-l border-gray-800 bg-gray-900"
              data-lenis-prevent
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest border border-cyan-900 px-2 py-1 rounded">
                  {selectedPost.date}
                </span>

                <button
                  onClick={() =>
                    console.log(
                      "RAW NASA DATA:",
                      JSON.stringify(selectedPost.description),
                    )
                  }
                  className="text-gray-500 hover:text-white transition flex items-center gap-1 text-xs cursor-none"
                  title="Log raw data to console"
                >
                  <Bug size={14} /> Raw Data
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight pr-4 text-white">
                {selectedPost.title}
              </h2>

              <div className="flex-1 overflow-y-auto overflow-x-hidden pr-4 mb-6 custom-scrollbar">
                <div
                  className="text-gray-300 text-sm md:text-base leading-relaxed break-words [&_a]:text-cyan-400 [&_a:hover]:text-cyan-300 [&_a]:underline [&_b]:text-white [&_b]:font-bold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{
                    __html: parseDescription(selectedPost.description),
                  }}
                />
              </div>

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
