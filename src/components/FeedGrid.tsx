"use client";

import { useState, useEffect, useRef } from "react";
import { SpacePost } from "@/lib/types";
import {
  X,
  Download,
  Heart,
  PlayCircle,
  Loader2,
  LogIn,
  Bug,
} from "lucide-react";
import { likePost } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import Link from "next/link";

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
   INDIVIDUAL FEED CARD (Handles Ripple & Coordinates)
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

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(false);
  };

  const renderContent = (isRipple: boolean) => {
    const bgColor = isRipple ? "bg-gray-900" : "bg-gray-900/40";
    const borderColor = isRipple ? "border-cyan-500/50" : "border-gray-800";
    const titleColor = isRipple ? "text-cyan-400" : "text-white";

    return (
      <div
        className={`flex flex-col h-full w-full border rounded-2xl overflow-hidden transition-colors duration-300 ${bgColor} ${borderColor}`}
      >
        <div className="relative w-full">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
          {post.mediaType === "video" && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition ${isRipple ? "bg-black/40" : "bg-black/20"}`}
            >
              <PlayCircle
                className={`w-12 h-12 text-white drop-shadow-lg opacity-80 transition transform ${isRipple ? "scale-110" : "scale-100"}`}
              />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
            <Heart
              size={12}
              className={isLiked ? "fill-pink-500 text-pink-500" : "text-white"}
            />
            <span className="text-xs font-bold text-white">{displayLikes}</span>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
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
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor-image="true"
      className="relative group mb-8 break-inside-avoid cursor-none rounded-2xl overflow-hidden shrink-0"
    >
      {/* 1. DEFAULT BOTTOM LAYER */}
      {renderContent(false)}

      {/* 2. HOVER TOP LAYER (Clipped by Ripple) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-[clip-path] duration-500 ease-out"
        style={{
          clipPath: `circle(${isHovered ? 150 : 0}% at ${mousePos.x}px ${mousePos.y}px)`,
        }}
      >
        {renderContent(true)}
      </div>
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

  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(initialLikes),
  );
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({});
  const [showLogin, setShowLogin] = useState(false);

  // --- SCROLL LOCKING ---
  useEffect(() => {
    if (selectedPost || showLogin) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [selectedPost, showLogin]);

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

  const getDisplayLikes = (post: SpacePost) => {
    const delta = likeDeltas[post.id] || 0;
    const baseCount = post.likes || 0;
    return Math.max(0, baseCount + delta);
  };

  // --- ULTIMATE NASA DATA PARSER ---
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

      {/* --- FULL SCREEN POST MODAL --- */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition z-50 cursor-none"
          >
            <X size={32} />
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
            {/* Media (60%) */}
            <div className="md:w-[60%] bg-black flex items-center justify-center p-2 relative">
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
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="max-h-[85vh] max-w-full object-contain"
                />
              )}
            </div>

            {/* Details (40%) */}
            <div className="md:w-[40%] p-6 md:p-8 flex flex-col border-l border-gray-800 bg-gray-900">
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

              <div
                className="flex-1 overflow-y-auto overflow-x-hidden pr-4 mb-6 custom-scrollbar"
                data-lenis-prevent
              >
                <div
                  className="text-gray-300 text-sm md:text-base leading-relaxed break-words [&_a]:text-cyan-400 [&_a:hover]:text-cyan-300 [&_a]:underline [&_b]:text-white [&_b]:font-bold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{
                    __html: parseDescription(selectedPost.description),
                  }}
                />
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex gap-3 mt-auto pt-6 border-t border-gray-800">
                <button
                  onClick={(e) => handleLike(selectedPost.id, e)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition cursor-none ${
                    likedPosts.has(selectedPost.id)
                      ? "bg-pink-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                >
                  <Heart
                    size={20}
                    fill={
                      likedPosts.has(selectedPost.id) ? "currentColor" : "none"
                    }
                  />
                  <span className="flex items-center gap-1">
                    {likedPosts.has(selectedPost.id) ? "Liked" : "Like"}
                    <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-1 opacity-70">
                      {getDisplayLikes(selectedPost)}
                    </span>
                  </span>
                </button>
                <a
                  href={videoUrl || selectedPost.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-bold transition cursor-none"
                >
                  <Download size={20} />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
