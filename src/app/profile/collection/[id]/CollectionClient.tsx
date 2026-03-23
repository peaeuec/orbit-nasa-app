"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import FeedGrid from "@/components/FeedGrid";
import BackButton from "@/components/BackButton";
import StaggeredText from "@/components/StaggeredText";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderOpen,
  Calendar,
  Pencil,
  Check,
  X,
  Trash2,
  CheckSquare,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function CollectionClient({
  initialCollection,
  initialPosts,
  likedIds,
  userId,
}: any) {
  const router = useRouter();
  const supabase = createClient();

  // States
  const [collectionName, setCollectionName] = useState(initialCollection.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // NEW: State to trigger the custom delete confirmation modal
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // 1. Sorting Logic
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.added_at).getTime();
    const dateB = new Date(b.added_at).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // 2. Edit Name Logic
  const handleSaveName = async () => {
    if (!collectionName.trim() || collectionName === initialCollection.name) {
      setCollectionName(initialCollection.name);
      setIsEditingName(false);
      return;
    }
    await supabase
      .from("collections")
      .update({ name: collectionName })
      .eq("id", initialCollection.id);
    setIsEditingName(false);
  };

  // 3. Selection Logic
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 4. Delete Posts Logic
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);

    await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", initialCollection.id)
      .in("nasa_id", Array.from(selectedIds));

    setPosts(posts.filter((p: any) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setIsSelecting(false);
    setIsDeleting(false);
  };

  // 5. Delete Entire Collection Logic (Updated to be called by the modal)
  const confirmDeleteCollection = async () => {
    await supabase.from("collections").delete().eq("id", initialCollection.id);
    router.push("/profile");
  };

  const formattedDate = new Date(
    initialCollection.created_at,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-black text-white">
      {/* --- CUSTOM DELETE CONFIRMATION POPUP --- */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-150 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
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
                Delete Collection?
              </h4>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to permanently delete "{collectionName}"?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors cursor-none"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCollection}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors cursor-none shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ------------------------------------------ */}

      {/* Header Section */}
      <div className="bg-linear-to-b from-gray-900 to-black border-b border-gray-800 pb-12 pt-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-cyan-900/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* TOP ROW: Back Button (Left) & Action Buttons (Right) */}
          <div className="flex justify-between items-center mb-8">
            <BackButton fallback="/profile" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSelecting(!isSelecting);
                  setSelectedIds(new Set());
                }}
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-2 text-sm font-bold cursor-none ${isSelecting ? "bg-cyan-900/50 border-cyan-500 text-cyan-400" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}`}
              >
                <CheckSquare size={18} />
                {isSelecting ? "Cancel" : "Select"}
              </button>

              <button
                onClick={() => setIsConfirmingDelete(true)} // UPDATE: Triggers modal instead of window.confirm
                className="p-2.5 rounded-xl border border-gray-700 bg-gray-900 text-gray-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/30 transition-colors cursor-none"
                title="Delete Collection"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* BOTTOM ROW: Title Area & Sort Button */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 text-cyan-500 mb-4">
                <FolderOpen size={24} />
                <span className="font-mono text-sm uppercase tracking-widest border border-cyan-900/50 bg-cyan-950/30 px-3 py-1 rounded-full">
                  Saved Folder
                </span>
              </div>

              {/* EDITABLE TITLE */}
              <div className="mb-4 h-14 flex items-center">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <input
                      autoFocus
                      type="text"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        else if (e.key === "Escape") {
                          setCollectionName(initialCollection.name);
                          setIsEditingName(false);
                        }
                      }}
                      className="bg-black border border-cyan-500 text-3xl md:text-5xl font-bold text-white px-3 py-1 rounded-2xl outline-none w-full"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white cursor-none transition-colors shadow-lg"
                    >
                      <Check size={20} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => {
                        setCollectionName(initialCollection.name);
                        setIsEditingName(false);
                      }}
                      className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-full text-white cursor-none transition-colors"
                    >
                      <X size={20} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="group cursor-none w-fit outline-none flex items-center gap-4"
                    data-cursor-invert="true"
                  >
                    <StaggeredText
                      text={collectionName}
                      className="text-4xl md:text-5xl font-bold text-cyan-400"
                      hideClass="group-hover:-translate-y-full"
                      showClass="group-hover:translate-y-0 text-white"
                    />
                    <Pencil
                      size={20}
                      className="text-gray-600 group-hover:text-cyan-400 transition-colors mt-2"
                    />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-400 text-sm font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Created {formattedDate}
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-cyan-400">
                  {posts.length} Item{posts.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* SORT BUTTON */}
            {posts.length > 1 && (
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-300 hover:text-white transition-colors text-sm cursor-none"
              >
                {sortOrder === "desc" ? (
                  <ArrowDownWideNarrow size={16} />
                ) : (
                  <ArrowUpNarrowWide size={16} />
                )}
                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12 relative">
        {/* FLOATING DELETE ACTION BAR */}
        <AnimatePresence>
          {isSelecting && selectedIds.size > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100">
              <div className="bg-red-950/90 backdrop-blur-md border border-red-500/50 px-6 py-4 rounded-full shadow-2xl flex items-center gap-4">
                <span className="text-red-200 font-bold">
                  {selectedIds.size} selected
                </span>
                <div className="w-px h-6 bg-red-900" />
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold transition-colors cursor-none"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Remove
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {sortedPosts.length > 0 ? (
          <FeedGrid
            posts={sortedPosts}
            initialLikes={likedIds}
            userId={userId}
            isSelecting={isSelecting}
            selectedIds={selectedIds}
            onSelect={toggleSelection}
          />
        ) : (
          <div className="text-center py-24 border border-dashed border-gray-800 rounded-3xl bg-gray-900/20 max-w-2xl mx-auto">
            <div className="text-gray-600 mb-4 flex justify-center">
              <FolderOpen size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              This folder is empty
            </h3>
            <a
              href="/explore"
              className="inline-flex mt-4 items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full transition cursor-none"
            >
              Explore the Archives
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
