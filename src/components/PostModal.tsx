"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SpacePost } from "@/lib/types";
import {
  X,
  Download,
  Heart,
  Bookmark,
  Loader2,
  Bug,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toggleNativeFullscreen } from "@/utils/fullscreen";
import CommentSection from "./CommentSection";

interface PostModalProps {
  post: SpacePost;
  userId?: string;
  onClose: () => void;
  isLiked: boolean;
  displayLikes: number;
  onLike: (id: string, e?: React.MouseEvent) => void;
  onSaveClick: () => void;
}

export default function PostModal({
  post,
  userId,
  onClose,
  isLiked,
  displayLikes,
  onLike,
  onSaveClick,
}: PostModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(true);

  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const [isModalZoomed, setIsModalZoomed] = useState(false);
  const [modalTransformOrigin, setModalTransformOrigin] =
    useState("center center");

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

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

  useEffect(() => {
    setLoadingMedia(true);
    fetch(
      `https://images-assets.nasa.gov/${post.mediaType}/${post.id}/collection.json`,
    )
      .then((res) => res.json())
      .then((urls: string[]) => {
        if (post.mediaType === "video") {
          const mp4 =
            urls.find((u) => u.endsWith("~orig.mp4")) ||
            urls.find((u) => u.endsWith("~large.mp4")) ||
            urls.find((u) => u.endsWith(".mp4"));
          setVideoUrl(mp4 || null);
        } else {
          const bestImage =
            urls.find(
              (u) => u.endsWith("~orig.jpg") || u.endsWith("~orig.png"),
            ) ||
            urls.find(
              (u) => u.endsWith("~large.jpg") || u.endsWith("~large.png"),
            ) ||
            urls[0];
          setHighResUrl(bestImage || null);
        }
        setLoadingMedia(false);
      })
      .catch(() => setLoadingMedia(false));
  }, [post]);

  const handleModalZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isModalZoomed || !isModalFullscreen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setModalTransformOrigin(
      `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  const parseDescription = (text: string) => {
    if (!text) return "No description available.";
    let clean = text
      .replace(/\u00A0/g, " ")
      .replace(/\s{2,}(?=[A-Z])/g, "<br /><br />")
      .replace(/\r\n|\r|\n/g, "<br />");
    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
    clean = clean.replace(
      urlRegex,
      (url) =>
        `<a href="${url.startsWith("www.") ? `http://${url}` : url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
    );
    return clean;
  };

  return (
    <div
      className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-auto"
      onWheel={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition z-50 cursor-none"
      >
        <X size={32} />
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        <div
          id="grid-modal-media"
          className="md:w-[60%] bg-black flex items-center justify-center p-2 relative group/modal-media overflow-hidden"
          onClick={() => {
            if (isModalFullscreen && post.mediaType === "image")
              setIsModalZoomed(!isModalZoomed);
          }}
          onMouseMove={handleModalZoomMove}
          data-cursor-image="true"
          style={{
            cursor:
              isModalFullscreen && post.mediaType === "image"
                ? isModalZoomed
                  ? "zoom-out"
                  : "zoom-in"
                : "auto",
          }}
        >
          {post.mediaType === "video" ? (
            loadingMedia ? (
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
              src={highResUrl || post.highResUrl || post.imageUrl}
              alt={post.title}
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
              {post.date}
            </span>
            <button
              onClick={() =>
                console.log("RAW NASA DATA:", JSON.stringify(post.description))
              }
              className="text-gray-500 hover:text-white transition flex items-center gap-1 text-xs cursor-none"
              title="Log raw data to console"
            >
              <Bug size={14} /> Raw Data
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight pr-4 text-white">
            {post.title}
          </h2>

          <div className="flex-1 overflow-y-auto overflow-x-hidden pr-4 mb-1 custom-scrollbar relative flex flex-col">
            <div
              className="text-gray-300 text-sm md:text-base leading-relaxed break-words [&_a]:text-cyan-400 [&_a:hover]:text-cyan-300 [&_a]:underline [&_b]:text-white [&_b]:font-bold [&_strong]:text-white"
              dangerouslySetInnerHTML={{
                __html: parseDescription(post.description),
              }}
            />
            <CommentSection postId={post.id} userId={userId} />
          </div>

          <div className="flex gap-3 mt-auto pt-6 border-t border-gray-800/60 relative z-20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => onLike(post.id, e)}
              className={`group relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 cursor-none border ${isLiked ? "bg-pink-500/10 border-pink-500/50 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.15)]" : "bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-500"}`}
            >
              {isLiked && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10 blur-md pointer-events-none" />
              )}
              <Heart
                size={18}
                className={`relative z-10 transition-transform duration-300 ${isLiked ? "scale-110" : "group-hover:scale-110"}`}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span className="relative z-10 flex items-center gap-1.5 tracking-wider text-xs uppercase">
                {isLiked ? "Liked" : "Like"}{" "}
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] ml-1 transition-colors font-mono ${isLiked ? "bg-pink-500/20 text-pink-300" : "bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300"}`}
                >
                  {displayLikes}
                </span>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSaveClick}
              className="group relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 cursor-none border bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-cyan-400 hover:border-cyan-500/50"
            >
              <Bookmark size={18} />
              <span className="tracking-wider text-xs uppercase">Save</span>
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              href={videoUrl || highResUrl || post.highResUrl || post.imageUrl}
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
              <span className="relative z-10 tracking-wider text-xs uppercase">
                Original
              </span>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
}
