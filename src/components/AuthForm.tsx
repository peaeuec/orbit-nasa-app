'use client'; 

import { useState } from 'react';
import { login, signup } from '@/app/login/actions';
import { Eye, EyeOff } from 'lucide-react'; // 1. Import icons

export default function AuthForm({ message }: { message?: string }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // 2. New State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-full backdrop-blur-xl border bg-transparent border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* 1. The Tabs (Top Bar) */}
      <div className="flex border-b border-gray-800">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition ${
            isLogin 
              ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition ${
            !isLogin 
              ? 'bg-purple-600/10 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back, Commander' : 'Join the Mission'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Enter your credentials to access the terminal.' 
              : 'Create a new ID to explore the archives.'}
          </p>
        </div>

        {/* 2. Error Message Display */}
        {message && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <p className="text-red-200 text-xs font-mono">{decodeURIComponent(message)}</p>
          </div>
        )}

        {/* 3. The Form */}
        <form 
          className="flex flex-col gap-4" 
          onSubmit={() => setLoading(true)} 
          action={isLogin ? login : signup} 
        >
          {/* Username Field (Only shows during Sign Up) */}
          {!isLogin && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-300">
                Username
              </label>
              <input 
                name="username" 
                type="text" 
                required 
                placeholder="Space Cadet"
                className="bg-gray-900 border border-gray-700 placeholder:text-gray-50 placeholder:opacity-30 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-300">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="astronaut@nasa.gov"
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder:text-gray-50 placeholder:opacity-30 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-300">Password</label>
            
            {/* Wrapper div relative for positioning the eye icon */}
            <div className="relative">
              <input 
                name="password" 
                // Toggle between 'text' and 'password'
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••"
                minLength={6}
                // Added 'pr-10' (padding-right) so text doesn't run into the icon
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pr-10 text-white placeholder:text-gray-50 placeholder:opacity-30 focus:border-blue-500 outline-none transition"
              />
              
              {/* The Eye Button */}
              <button
                type="button" // Important: prevents form submission
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`mt-4 w-full py-4 rounded-lg font-bold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isLogin 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' 
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20'
            }`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Create ID')}
          </button>
        </form>

        {/* 4. Bottom Switcher Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            {isLogin ? "Don't have an account? " : "Already have an ID? "}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-white font-bold hover:underline transition"
            >
              {isLogin ? "Sign Up Now" : "Log In"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}