"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, User, Loader2 } from "lucide-react";
import { addComment } from "@/app/actions";
import { motion } from "framer-motion";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

// NEW HELPER: Calculates the "time ago" string
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function CommentSection({
  postId,
  userId,
}: {
  postId: string;
  userId?: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
      id, 
      content, 
      created_at, 
      user_id,
      profiles (
        username, 
        avatar_url
      )
    `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Comment fetch error:", error);
    } else {
      setComments(data as any);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId || submitting) return;

    setSubmitting(true);
    try {
      await addComment(postId, newComment);
      setNewComment("");
      await fetchComments(); // Reload to get the new comment with user profile info
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 relative flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">
          Log Box ({comments.length})
        </h3>
      </div>

      {/* COMMENT LIST */}
      <div className="space-y-6 pr-2 mb-4">
        {loading ? (
          <div className="flex justify-center py-4 text-gray-600">
            <Loader2 className="animate-spin" size={20} />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-4 text-center border border-dashed border-gray-800/50 rounded-xl">
            No comments yet. Be the first to log your findings!
          </p>
        ) : (
          comments.map((comment) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={comment.id}
              // NEW: w-full added to ensure proper flex bounds
              className="flex gap-4 w-full"
            >
              {/* Avatar - Slightly larger for better spacing */}
              <div className="h-10 w-10 rounded-full bg-gray-800 shrink-0 overflow-hidden border border-gray-700">
                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    className="h-full w-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <User size={20} className="m-2.5 text-gray-500" />
                )}
              </div>

              {/* Comment Body - NEW: min-w-0 prevents flexbox from overflowing its container */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1.5 ml-1">
                  <span className="text-xs font-bold text-gray-300 truncate">
                    {comment.profiles?.username || "Explorer"}
                  </span>
                  {/* NEW: Relative Timestamp */}
                  <span className="text-[10px] text-gray-500 font-mono shrink-0">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>

                {/* NEW: p-4 adds breathing room, break-words whitespace-pre-wrap forces wrapping */}
                <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/40 p-4 rounded-2xl rounded-tl-sm border border-gray-800/60 wrap-break-word whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* STICKY INPUT BOX */}
      {userId ? (
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 bg-gray-900 pt-4 pb-2 z-20 mt-auto border-t border-gray-800/50 group"
        >
          <div className="relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Log a comment..."
              // Maintained your specific rounded-3xl styling and added text-white
              className="w-full bg-black border border-gray-700 rounded-3xl py-3 pl-4 pr-12 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all cursor-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 disabled:text-gray-700 transition-colors cursor-none"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>
      ) : (
        <p className="sticky bottom-0 bg-gray-900 pt-4 pb-2 z-20 mt-auto text-xs text-center text-gray-600">
          <span className="bg-gray-950/50 py-3.5 block rounded-xl border border-dashed border-gray-800">
            Authorization required to log transmissions.
          </span>
        </p>
      )}
    </div>
  );
}
