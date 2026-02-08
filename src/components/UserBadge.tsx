    'use client';

import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';

export default function UserBadge({ user }: { user: User }) {
  // 1. Get Username & Avatar
  // We check for a custom avatar URL first, then fall back to defaults
  const username = user.user_metadata?.username || 'Commander';
  const avatarUrl = user.user_metadata?.avatar_url;
  
  // Get the first letter for the placeholder (e.g. "P" for Peaeuec)
  const initial = username.charAt(0).toUpperCase();

  return (
    <Link 
      href="/profile" 
      className="group flex items-center bg-gray-900/50 hover:bg-gray-800 border border-transparent hover:border-gray-700 rounded-full pr-1 transition-all duration-300"
    >
      
      {/* --- Avatar Circle --- */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-700 group-hover:border-blue-500 transition-colors shadow-lg">
        {avatarUrl ? (
          // If they have a picture, show it
          <img 
            src={avatarUrl} 
            alt={username} 
            className="w-full h-full object-cover" 
          />
        ) : (
          // If not, show the "Letter Avatar" with a gradient
          <div className="w-full h-full bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        )}
      </div>

      {/* --- The Sliding Name --- */}
      <div className="max-w-0 overflow-hidden group-hover:max-w-[150px] transition-all duration-700 ease-in-out">
        <span className="pl-3 pr-4 text-sm font-bold text-gray-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
          {username}
        </span>
      </div>

    </Link>
  );
}