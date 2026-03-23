"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import AvatarUpload from "@/components/AvatarUpload";
import StaggeredText from "@/components/StaggeredText";
import {
  Rocket,
  Pencil,
  Check,
  X,
  LogOut,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteAccount } from "@/app/actions";

interface ProfileHeaderProps {
  userId: string;
  initialUsername: string;
  avatarUrl?: string;
  signOutAction: () => void;
}

export default function ProfileHeader({
  userId,
  initialUsername,
  avatarUrl,
  signOutAction,
}: ProfileHeaderProps) {
  const supabase = createClient();
  const [username, setUsername] = useState(initialUsername);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(initialUsername);

  // Account Deletion States
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // NEW: Track when the component has mounted to safely use the Portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSave = async () => {
    if (!tempName.trim() || tempName === username) {
      setTempName(username);
      setIsEditing(false);
      return;
    }

    const newName = tempName.trim();

    await supabase.auth.updateUser({
      data: { username: newName },
    });

    const { error } = await supabase
      .from("profiles")
      .update({ username: newName })
      .eq("id", userId);

    if (error) {
      console.error("Error updating database profile:", error);
      alert("Failed to update database profile. Please try again.");
    } else {
      setUsername(newName);
    }

    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setDeleteError("Password is required.");
      return;
    }
    setDeleteError("");
    setDeleteLoading(true);

    const res = await deleteAccount(password);

    if (res?.error) {
      setDeleteError(res.error);
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* --- CUSTOM DELETE ACCOUNT MODAL (NOW USING A PORTAL) --- */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isDeletingAccount && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                // Safely elevated to the top of the document body
                className="fixed inset-0 z-9999 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-gray-900 border border-red-900/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.15)] max-w-md w-full text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-600 via-red-500 to-red-600" />

                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} />
                  </div>

                  <h4 className="text-2xl font-bold text-white mb-2">
                    Initiate Self-Destruct?
                  </h4>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    This action will permanently purge your identity,
                    collections, and all transmissions from the ORBIT archives.
                    <strong className="text-red-400 block mt-2">
                      Enter your password to authorize.
                    </strong>
                  </p>

                  {deleteError && (
                    <div className="mb-6 p-3 bg-red-950/50 border border-red-900 rounded-xl text-red-400 text-xs font-mono">
                      {deleteError}
                    </div>
                  )}

                  <div className="relative mb-6">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 pr-12 text-white placeholder:text-gray-600 focus:bg-gray-950 focus:border-red-500 outline-none transition-all cursor-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-none outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsDeletingAccount(false);
                        setPassword("");
                        setDeleteError("");
                      }}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors cursor-none disabled:opacity-50"
                    >
                      Abort
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || !password}
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors cursor-none shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50"
                    >
                      {deleteLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Purge Data
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      {/* ------------------------------------------ */}

      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <AvatarUpload
            userId={userId}
            userUrl={avatarUrl}
            username={username}
          />

          <div>
            {isEditing ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  autoFocus
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSave();
                    } else if (e.key === "Escape") {
                      setTempName(username);
                      setIsEditing(false);
                    }
                  }}
                  className="bg-black border border-cyan-500 text-3xl font-bold text-white px-3 py-1 rounded-2xl outline-none w-full max-w-62.5"
                />
                <button
                  onClick={handleSave}
                  className="p-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white cursor-none transition-colors shadow-lg"
                >
                  <Check size={18} strokeWidth={3} />
                </button>
                <button
                  onClick={() => {
                    setTempName(username);
                    setIsEditing(false);
                  }}
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-full text-white cursor-none transition-colors"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="group cursor-none w-fit mb-2 outline-none flex items-center gap-4"
                data-cursor-invert="true"
              >
                <StaggeredText
                  text={username}
                  className="text-4xl font-bold text-cyan-400"
                  hideClass="group-hover:-translate-y-full"
                  showClass="group-hover:translate-y-0 text-white"
                />
                <Pencil
                  size={18}
                  className="text-gray-600 group-hover:text-cyan-400 transition-colors mt-2"
                />
              </button>
            )}

            <p
              className="text-gray-400 text-sm flex items-center gap-2 cursor-none w-fit"
              data-cursor-invert="true"
            >
              <Rocket size={14} className="text-cyan-500 animate-pulse" />
              User Status: Active
            </p>
            <p
              className="text-gray-500 text-xs mt-1 font-mono uppercase cursor-none w-fit"
              data-cursor-invert="true"
            >
              ID: {userId.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* --- DANGER ZONE ACTIONS --- */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsDeletingAccount(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-full border border-gray-800 text-gray-500 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 transition text-sm font-bold uppercase tracking-wider cursor-none"
          >
            <Trash2 size={16} />
            Delete Account
          </button>

          <form action={signOutAction} className="w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-6 py-3 w-full rounded-full border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition text-sm font-bold uppercase tracking-wider cursor-none">
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
