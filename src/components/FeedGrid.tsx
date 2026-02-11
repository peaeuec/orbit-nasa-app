'use client'; 

import { useState, useEffect } from 'react';
import { SpacePost } from '@/lib/types';
import { X, Download, Heart, Maximize2, PlayCircle, Loader2 } from 'lucide-react';
import { likePost } from '@/app/actions'; 
import { motion } from 'framer-motion'; 
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

export default function FeedGrid({ posts, initialLikes = [] }: { posts: SpacePost[], initialLikes?: string[] }) {
  const [selectedPost, setSelectedPost] = useState<SpacePost | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(initialLikes));

  // --- 1. NUCLEAR SCROLL LOCK ---
  useEffect(() => {
    if (selectedPost) {
      document.documentElement.style.overflow = 'hidden'; // Lock HTML
      document.body.style.overflow = 'hidden';            // Lock Body
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [selectedPost]);

  // Video Fetch Logic
  useEffect(() => {
    if (selectedPost?.mediaType === 'video') {
      setLoadingVideo(true);
      setVideoUrl(null);
      fetch(`https://images-assets.nasa.gov/video/${selectedPost.id}/collection.json`)
        .then(res => res.json())
        .then((urls: string[]) => {
          const mp4 = urls.find(url => url.endsWith('~medium.mp4')) || 
                      urls.find(url => url.endsWith('~orig.mp4')) || 
                      urls.find(url => url.endsWith('.mp4'));
          setVideoUrl(mp4 || null);
          setLoadingVideo(false);
        })
        .catch(err => {
          console.error("Failed to load video", err);
          setLoadingVideo(false);
        });
    }
  }, [selectedPost]);

  const handleLike = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    await likePost(id); 
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-8"
        columnClassName="pl-8 bg-clip-padding"
      >
        {posts.map((post, index) => (
          <motion.div 
            key={post.id} 
            onClick={() => setSelectedPost(post)}
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "100px" }} 
            transition={{ duration: 0.5, delay: index * 0.05 }} 
            className="group mb-8 break-inside-avoid"
          >
            <div className="flex flex-col bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-gray-900 transition duration-300 cursor-pointer">
              <div className="relative w-full"> 
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-auto object-cover" 
                  loading="lazy"
                />
                {post.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                     <PlayCircle className="w-12 h-12 text-white drop-shadow-lg opacity-80 group-hover:scale-110 transition" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-10">
                   <Maximize2 className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {post.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </Masonry>

      {/* FULL SCREEN MODAL */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          // --- 2. STOP PROPAGATION (Prevents scroll reaching body) ---
          onWheel={(e) => e.stopPropagation()} 
        >
          <button 
            onClick={() => setSelectedPost(null)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition z-50"
          >
            <X size={32} />
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
            <div className="md:w-2/3 bg-black flex items-center justify-center p-2 relative">
               {selectedPost.mediaType === 'video' ? (
                 loadingVideo ? (
                    <div className="flex flex-col items-center gap-2 text-blue-400">
                      <Loader2 className="animate-spin w-10 h-10" />
                      <span className="text-sm font-mono">RETRIEVING VIDEO FEED...</span>
                    </div>
                 ) : videoUrl ? (
                   <video src={videoUrl} className="w-full h-full max-h-[85vh] outline-none" controls autoPlay />
                 ) : (
                   <p className="text-red-500 font-mono">VIDEO SIGNAL LOST</p>
                 )
               ) : (
                 <img src={selectedPost.imageUrl} alt={selectedPost.title} className="max-h-[85vh] max-w-full object-contain" />
               )}
            </div>
            
            <div className="md:w-1/3 p-8 flex flex-col border-l border-gray-800 bg-gray-900">
               <div className="mb-6">
                 <span className="text-blue-400 text-xs font-mono uppercase tracking-widest border border-blue-900 px-2 py-1 rounded">
                   {selectedPost.date}
                 </span>
               </div>
               <h2 className="text-2xl font-bold mb-4 leading-tight">{selectedPost.title}</h2>
               <div className="flex-1 overflow-y-auto pr-2 mb-6 custom-scrollbar" data-lenis-prevent>
                 <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                   {selectedPost.description}
                 </p>
               </div>
               <div className="flex gap-3 mt-auto pt-6 border-t border-gray-800">
                 <button onClick={(e) => handleLike(selectedPost.id, e)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition ${likedPosts.has(selectedPost.id) ? 'bg-pink-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                    <Heart size={20} fill={likedPosts.has(selectedPost.id) ? "currentColor" : "none"} />
                    {likedPosts.has(selectedPost.id) ? 'Liked' : 'Like'}
                 </button>
                 <a href={videoUrl || selectedPost.imageUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition">
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