'use client'; 

import { useState } from 'react';
import { SpacePost } from '@/lib/types';
import { X, Download, Heart, Maximize2 } from 'lucide-react';
import { likePost } from '@/app/actions'; 

// ✅ UPDATE: Props now accept 'initialLikes' (a list of IDs)
export default function FeedGrid({ posts, initialLikes = [] }: { posts: SpacePost[], initialLikes?: string[] }) {
  const [selectedPost, setSelectedPost] = useState<SpacePost | null>(null);
  
  // ✅ UPDATE: Initialize the 'likedPosts' set with the data from the server
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(initialLikes));

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    // Optimistic Update (Update UI instantly)
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Toggle Off
      } else {
        newSet.add(id); // Toggle On
      }
      return newSet;
    });

    // Send to Server
    await likePost(id); 
  };

  return (
    <>
      {/* --- The Grid Layout --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div 
            key={post.id} 
            onClick={() => setSelectedPost(post)}
            className="group flex flex-col bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-gray-900 transition duration-300 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden bg-gray-800">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                 <Maximize2 className="text-white w-8 h-8" />
              </div>
            </div>

            {/* Mini Content */}
            <div className="p-6">
              <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-blue-400 transition">
                {post.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {post.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- The Full Screen Modal --- */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          
          <button 
            onClick={() => setSelectedPost(null)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition"
          >
            <X size={32} />
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            
            {/* Left Side: Image/Video */}
            <div className="md:w-2/3 bg-black flex items-center justify-center p-2 relative">
               {selectedPost.mediaType === 'video' ? (
                 <iframe src={selectedPost.imageUrl} className="w-full h-full aspect-video" allowFullScreen />
               ) : (
                 <img 
                   src={selectedPost.imageUrl} 
                   alt={selectedPost.title} 
                   className="max-h-[85vh] max-w-full object-contain"
                 />
               )}
            </div>

            {/* Right Side: Details */}
            <div className="md:w-1/3 p-8 flex flex-col border-l border-gray-800 bg-gray-900">
               <div className="mb-6">
                 <span className="text-blue-400 text-xs font-mono uppercase tracking-widest border border-blue-900 px-2 py-1 rounded">
                   {selectedPost.date}
                 </span>
               </div>
               
               <h2 className="text-2xl font-bold mb-4 leading-tight">{selectedPost.title}</h2>
               
               <div className="flex-1 overflow-y-auto pr-2 mb-6">
                 <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                   {selectedPost.description}
                 </p>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3 mt-auto pt-6 border-t border-gray-800">
                 <button 
                    onClick={(e) => handleLike(selectedPost.id, e)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition ${
                        likedPosts.has(selectedPost.id) 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                 >
                    <Heart size={20} fill={likedPosts.has(selectedPost.id) ? "currentColor" : "none"} />
                    {likedPosts.has(selectedPost.id) ? 'Liked' : 'Like'}
                 </button>

                 <a 
                   href={selectedPost.imageUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
                 >
                    <Download size={20} />
                    Download
                 </a>
               </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}