"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, User, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { addComment } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";

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

// HELPER: Calculates the "time ago" string
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

  // NEW: State to track which comment is being deleted to trigger the custom popup
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

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
      await fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // NEW: The actual deletion logic that runs after they click "Confirm" in our custom popup
  const confirmDelete = async () => {
    if (!commentToDelete) return;

    const targetId = commentToDelete;
    setCommentToDelete(null); // Instantly hide the popup

    // Optimistic UI update: instantly hide it from the screen
    setComments((prev) => prev.filter((c) => c.id !== targetId));

    // Actually delete from database
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", targetId);

    if (error) {
      console.error("Error deleting comment:", error);
      fetchComments(); // Revert if it fails
    }
  };

  return (
    <div className="mt-8 relative flex flex-col h-full">
      {/* --- CUSTOM DELETE CONFIRMATION POPUP --- */}
      <AnimatePresence>
        {commentToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // This overlays strictly over the comment section, not the whole screen
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 rounded-3xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Scrub Comment?
              </h4>
              <p className="text-gray-400 text-sm mb-6">
                This comment will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCommentToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors cursor-none"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors cursor-none shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  Scrub
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ------------------------------------------ */}

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
              className="flex gap-4 w-full group relative"
            >
              {/* Avatar */}
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

              {/* Comment Body */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1.5 ml-1">
                  <span className="text-xs font-bold text-gray-300 truncate">
                    {comment.profiles?.username || "Explorer"}
                  </span>

                  <span className="text-[10px] text-gray-500 font-mono shrink-0">
                    {timeAgo(comment.created_at)}
                  </span>

                  {/* UPDATE: Clicking this now triggers the custom popup */}
                  {userId === comment.user_id && (
                    <button
                      onClick={() => setCommentToDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-600 hover:text-red-500 ml-auto cursor-none p-1"
                      title="Delete transmission"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

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
        <p className="sticky bottom-0 bg-gray-900 pt-4 pb-2 z-20 mt-auto text-xs text-center text-gray-300">
          <span className="bg-gray-950/50 py-3.5 block rounded-full border border-dashed border-gray-800">
            Login required to comment.
          </span>
        </p>
      )}
    </div>
  );
}
