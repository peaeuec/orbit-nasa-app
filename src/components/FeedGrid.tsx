"use client";

import { useState, useRef } from "react";
import { SpacePost } from "@/lib/types";
import { X, LogIn } from "lucide-react";
import { likePost } from "@/app/actions";
import CollectionSelector from "./CollectionSelector";
import FeedCard from "./FeedCard";
import PostModal from "./PostModal";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import Link from "next/link";

const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };

interface FeedGridProps {
  posts: SpacePost[];
  initialLikes?: string[];
  userId?: string;
  isSelecting?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
}

export default function FeedGrid({
  posts,
  initialLikes = [],
  userId,
  isSelecting,
  selectedIds,
  onSelect,
}: FeedGridProps) {
  const [selectedPost, setSelectedPost] = useState<SpacePost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(initialLikes),
  );
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({});
  const [showLogin, setShowLogin] = useState(false);
  const [collectionModalPostId, setCollectionModalPostId] = useState<
    string | null
  >(null);

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
            isSelecting={isSelecting}
            isSelected={selectedIds?.has(post.id)}
            onSelect={onSelect}
          />
        ))}
      </Masonry>

      <CollectionSelector
        postId={collectionModalPostId}
        userId={userId}
        onClose={() => setCollectionModalPostId(null)}
      />

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
