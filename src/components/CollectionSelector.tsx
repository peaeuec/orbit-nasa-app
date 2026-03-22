"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Folder, Plus, Check, Loader2, X, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Collection {
  id: string;
  name: string;
}

interface CollectionSelectorProps {
  postId: string | null;
  userId?: string;
  onClose: () => void;
}

export default function CollectionSelector({
  postId,
  userId,
  onClose,
}: CollectionSelectorProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedCollectionIds, setSavedCollectionIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (postId && userId) {
      fetchCollectionsAndStatus();
    }
  }, [postId, userId]);

  async function fetchCollectionsAndStatus() {
    setIsLoading(true);

    // 1. Get all user's collections
    const { data: cols } = await supabase
      .from("collections")
      .select("id, name")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false });

    // 2. Get which collections already contain this post
    const { data: savedItems } = await supabase
      .from("collection_items")
      .select("collection_id")
      .eq("nasa_id", postId!);

    if (cols) setCollections(cols);
    if (savedItems) {
      setSavedCollectionIds(
        new Set(savedItems.map((item) => item.collection_id)),
      );
    }

    setIsLoading(false);
  }

  const toggleCollection = async (collectionId: string) => {
    if (!postId || loadingRowId) return;
    setLoadingRowId(collectionId);

    const isSaved = savedCollectionIds.has(collectionId);

    // Optimistic UI Update
    setSavedCollectionIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });

    // Database Update
    if (isSaved) {
      await supabase
        .from("collection_items")
        .delete()
        .match({ collection_id: collectionId, nasa_id: postId });
    } else {
      await supabase
        .from("collection_items")
        .insert({ collection_id: collectionId, nasa_id: postId });
    }

    setLoadingRowId(null);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim() || !userId || !postId || isCreating) return;

    setIsCreating(true);

    // 1. Create the new collection
    const { data: newCol, error } = await supabase
      .from("collections")
      .insert({ user_id: userId, name: newCollectionName.trim() })
      .select()
      .single();

    // SHOW THE ERROR IF IT FAILS
    if (error) {
      console.error("Collection Creation Error:", error);
      alert(`Database Error: ${error.message}`);
    }

    if (!error && newCol) {
      // 2. Immediately save the post into the new collection
      const { error: itemError } = await supabase
        .from("collection_items")
        .insert({ collection_id: newCol.id, nasa_id: postId });

      if (itemError) {
        console.error("Item Save Error:", itemError);
        alert(`Failed to save item: ${itemError.message}`);
      } else {
        // 3. Update local state
        setCollections([newCol, ...collections]);
        setSavedCollectionIds((prev) => new Set(prev).add(newCol.id));
        setNewCollectionName("");
      }
    }

    setIsCreating(false);
  };

  return (
    <AnimatePresence>
      {postId && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          {/* Background Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden cursor-auto flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-2 text-white font-bold">
                <Bookmark className="text-cyan-400" size={20} />
                <h3>Save to Collection</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800 cursor-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Collection List */}
            <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-cyan-500">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No collections yet. Create one below!
                </div>
              ) : (
                <div className="space-y-1">
                  {collections.map((col) => {
                    const isSaved = savedCollectionIds.has(col.id);
                    const isRowLoading = loadingRowId === col.id;

                    return (
                      <button
                        key={col.id}
                        onClick={() => toggleCollection(col.id)}
                        disabled={isRowLoading}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors group cursor-none text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Folder
                            size={18}
                            className={
                              isSaved
                                ? "text-cyan-400"
                                : "text-gray-500 group-hover:text-gray-400"
                            }
                            fill={isSaved ? "currentColor" : "none"}
                          />
                          <span
                            className={`text-sm font-medium ${isSaved ? "text-white" : "text-gray-300"}`}
                          >
                            {col.name}
                          </span>
                        </div>

                        <div>
                          {isRowLoading ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-gray-500"
                            />
                          ) : isSaved ? (
                            <div className="bg-cyan-500/20 text-cyan-400 p-1 rounded-full">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-gray-600 group-hover:border-gray-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create New Footer */}
            <form
              onSubmit={handleCreateCollection}
              className="p-4 border-t border-gray-800 bg-gray-950"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="New collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none cursor-none"
                />
                <button
                  type="submit"
                  disabled={!newCollectionName.trim() || isCreating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors cursor-none"
                >
                  {isCreating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
