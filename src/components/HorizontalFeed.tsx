"use client";

import { useState, useEffect, useRef } from "react";
import { SpacePost } from "@/lib/types";
import { X, ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import StaggeredText from "@/components/StaggeredText";
import { likePost } from "@/app/actions";
import CollectionSelector from "./CollectionSelector";
import PostModal from "./PostModal";
import HorizontalFeedCard from "./HorizontalFeedCard";
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
  const [collectionModalPostId, setCollectionModalPostId] = useState<
    string | null
  >(null);

  // Drag and Scroll States
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Like & Login States
  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(initialLikes),
  );
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({});
  const [showLogin, setShowLogin] = useState(false);

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
    if (!userId) return setShowLogin(true);

    const isLiked = likedPosts.has(id);
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      isLiked ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });

    setLikeDeltas((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (isLiked ? -1 : 1),
    }));

    await likePost(id);
  };

  const getDisplayLikes = (post: SpacePost) => {
    const baseCount = baseCountsRef.current[post.id] ?? (post.likes || 0);
    return Math.max(0, baseCount + (likeDeltas[post.id] || 0));
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

  // Drag Logic
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

  const handleDragEnd = () => setIsDragging(false);

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
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500 hover:bg-gray-800 transition-all duration-300 cursor-none origin-right ${canScrollLeft ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}
            data-cursor-invert="true"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500 hover:bg-gray-800 transition-all duration-300 cursor-none origin-left ${canScrollRight ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}
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
        {posts.map((item) => (
          <HorizontalFeedCard
            key={item.id}
            item={item}
            isDragging={isDragging}
            dragDistance={dragDistance}
            onClick={setSelectedPost}
            isLiked={likedPosts.has(item.id)}
            displayLikes={getDisplayLikes(item)}
          />
        ))}
      </div>

      {/* COLLECTION SELECTOR MODAL */}
      <CollectionSelector
        postId={collectionModalPostId}
        userId={userId}
        onClose={() => setCollectionModalPostId(null)}
      />

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

      {/* SHARED POST MODAL */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          userId={userId}
          onClose={() => setSelectedPost(null)}
          isLiked={likedPosts.has(selectedPost.id)}
          displayLikes={getDisplayLikes(selectedPost)}
          onLike={handleLike}
          onSaveClick={() => {
            if (!userId) setShowLogin(true);
            else setCollectionModalPostId(selectedPost.id);
          }}
        />
      )}
    </>
  );
}
