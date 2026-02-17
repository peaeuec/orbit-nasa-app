"use client";

import { useState } from "react";
import { login, signup } from "@/app/login/actions";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";

/* --- CINEMATIC ROLL VARIANTS (Deep Space Style) --- */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
  exit: {
    transition: { staggerChildren: 0.02 },
  },
};

// Functions are perfectly legal inside the Variants object!
const wordVariants: Variants = {
  hidden: (isLogin: boolean) => ({
    y: isLogin ? -40 : 40,
    opacity: 0,
    filter: "blur(12px)",
    scale: 0.85,
    rotateZ: isLogin ? -5 : 5,
  }),
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    rotateZ: 0,
    transition: { type: "spring", damping: 14, stiffness: 150 },
  },
  exit: (isLogin: boolean) => ({
    y: isLogin ? 40 : -40,
    opacity: 0,
    filter: "blur(12px)",
    scale: 0.85,
    rotateZ: isLogin ? 5 : -5,
    transition: { ease: "easeIn", duration: 0.2 },
  }),
};

export default function AuthForm({ message }: { message?: string }) {
  // Default is set to true (Log In)
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const headingText = isLogin
    ? "Continue where you left off."
    : "Step into the system.";

  return (
    <div className="min-h-screen w-full flex relative bg-black font-sans overflow-hidden cursor-none">
      {/* --- BACKGROUND IMAGE --- */}
      <img
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2500&auto=format&fit=crop"
        alt="Space Background"
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none select-none"
      />

      {/* --- LEFT SIDE: THE PITCH & TOGGLE CARD --- */}
      <div className="relative z-10 hidden md:flex w-1/2 flex-col justify-between p-12 lg:p-20">
        <Link
          href="/"
          className="text-3xl font-bold tracking-tightest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent w-fit cursor-none"
        >
          ORBIT
        </Link>

        {/* The Rolling Staggered Heading Container */}
        <div className="relative min-h-[160px] lg:min-h-[220px] w-full flex items-center">
          <AnimatePresence mode="popLayout" custom={isLogin}>
            <motion.h1
              key={isLogin ? "login" : "signup"}
              custom={isLogin}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl flex flex-wrap"
            >
              {headingText.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  custom={isLogin} // Explicitly pass custom state down to the words
                  variants={wordVariants}
                  className="inline-block mr-3 lg:mr-4 mb-2 origin-bottom"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* The glass toggle card */}
        {/* FIX: Changed to <motion.div layout>. Replaced transition-all with transition-colors so CSS doesn't fight the layout engine! */}
        <motion.div
          layout
          className="backdrop-blur-lg bg-white/10 p-6 rounded-3xl border border-white/20 w-fit shadow-2xl transition-colors duration-500 hover:bg-white/20 overflow-hidden"
        >
          {/* --- SUBTLE ANIMATED TEXT --- */}
          <div className="relative mb-1 flex items-center">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={isLogin ? "login" : "signup"}
                initial={{
                  y: isLogin ? -10 : 10,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: { duration: 0.3 },
                }}
                exit={{
                  y: isLogin ? 10 : -10,
                  opacity: 0,
                  filter: "blur(4px)",
                  transition: { duration: 0.2 },
                }}
                className="text-sm text-gray-300 font-medium cursor-none whitespace-nowrap"
              >
                {isLogin ? "Need a new ID?" : "Already a member?"}
              </motion.p>
            </AnimatePresence>
          </div>
          {/* --------------------------------- */}

          {/* FIX: Turned into a <motion.button layout> to smoothly shift the arrow when text width changes */}
          <motion.button
            layout
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-white font-bold text-xl flex items-center gap-2 group outline-none cursor-none mt-1"
            data-cursor-invert="true"
          >
            {/* FIX: Simple Fade for the button text */}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={isLogin ? "signup-btn" : "signin-btn"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="whitespace-nowrap"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </motion.span>
            </AnimatePresence>

            {/* The layout prop here allows the arrow to dynamically slide left/right as the text cross-fades */}
            <motion.div layout>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* --- RIGHT SIDE: THE GLASSMORPHISM FORM --- */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center p-8 lg:p-20 backdrop-blur-xl bg-black/40 border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-sm">
          {/* Form Header (Synchronized with the Left Side Roll) */}
          <div className="mb-10 min-h-[80px] relative">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{
                  y: isLogin ? -30 : 30,
                  opacity: 0,
                  filter: "blur(8px)",
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: { type: "spring", damping: 15, stiffness: 150 },
                }}
                exit={{
                  y: isLogin ? 30 : -30,
                  opacity: 0,
                  filter: "blur(8px)",
                  transition: { duration: 0.2, ease: "easeIn" },
                }}
              >
                <h2 className="text-3xl font-bold text-white mb-2 cursor-none">
                  {isLogin ? "Log in" : "Sign up"}
                </h2>
                <p className="text-gray-400 text-sm cursor-none">
                  {isLogin
                    ? "Enter your credentials to access the terminal."
                    : "Create a new ID to access the archives."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              <p className="text-red-200 text-xs font-mono cursor-none">
                {decodeURIComponent(message)}
              </p>
            </div>
          )}

          <form
            className="flex flex-col gap-4"
            onSubmit={() => setLoading(true)}
            action={isLogin ? login : signup}
          >
            {/* 1. IDENTIFIER (Username or Email) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1 cursor-none">
                {isLogin ? "Username or Email" : "Username"}
              </label>
              <input
                name="username"
                type="text"
                required
                placeholder={
                  isLogin
                    ? "SpaceCadet99 or astronaut@nasa.gov"
                    : "SpaceCadet99"
                }
                className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-cyan-400 outline-none transition-all duration-300 cursor-none"
              />
            </div>

            {/* 2. EMAIL */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 4 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="flex flex-col gap-1.5 overflow-hidden"
                >
                  <label className="text-xs font-medium text-gray-300 ml-1 cursor-none">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required={!isLogin}
                    placeholder="astronaut@nasa.gov"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-cyan-400 outline-none transition-all duration-300 cursor-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. PASSWORD */}
            <motion.div layout className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-medium text-gray-300 ml-1 cursor-none">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 pr-12 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-cyan-400 outline-none transition-all duration-300 cursor-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-none outline-none"
                  data-cursor-invert="true"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* 4. SUBMIT BUTTON */}
            <motion.button
              layout
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-white text-black py-4 rounded-full font-bold text-sm hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-none outline-none"
              data-cursor-invert="true"
            >
              {loading
                ? "Processing..."
                : isLogin
                  ? "Initialize Session"
                  : "Create account"}
            </motion.button>
          </form>

          {/* Mobile Fallback Toggle */}
          <div className="mt-8 text-center md:hidden">
            <p className="text-gray-500 text-sm cursor-none">
              {isLogin ? "Don't have an account? " : "Already have an ID? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-white font-bold hover:underline transition cursor-none outline-none"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
