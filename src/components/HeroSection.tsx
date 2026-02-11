'use client';

import { useState, useEffect } from 'react';
import { SpacePost } from '@/lib/types';
import { X, Maximize2, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ hero }: { hero: SpacePost }) {
  const [isOpen, setIsOpen] = useState(false);

  // --- NUCLEAR SCROLL LOCK ---
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!hero) return null;

  return (
    <>
      <div className="w-full mb-12">
        {/* ... (Header and Card content same as before) ... */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-blue-400 text-xs font-bold uppercase tracking-widest">
              Astronomy Picture of the Day
            </h2>
          </div>
          <span className="text-gray-500 text-xs font-mono">{hero.date}</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group rounded-3xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          {hero.mediaType === 'video' ? (
             <div className="aspect-video w-full relative">
               <iframe src={hero.imageUrl} className="w-full h-full pointer-events-none" title="APOD Video" />
               <div className="absolute inset-0 bg-transparent" />
             </div>
          ) : (
             <div className="relative w-full">
               <img src={hero.imageUrl} alt={hero.title} className="w-full h-auto object-contain" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition duration-500" />
             </div>
          )}

          <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition transform group-hover:scale-110 z-20 border border-white/10">
            <Maximize2 className="text-white w-5 h-5" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10 pt-32">
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-xl leading-tight">
               {hero.title}
             </h1>
             <p className="text-gray-200 line-clamp-3 max-w-3xl text-sm md:text-lg drop-shadow-md leading-relaxed mb-6">
               {hero.description}
             </p>
             <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-blue-900/20 group-hover:shadow-blue-500/40">
               <BookOpen size={16} /> 
               <span>Read Full Story</span>
               <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </motion.div>
      </div>

      {/* FULL SCREEN MODAL */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" 
          onClick={() => setIsOpen(false)}
          onWheel={(e) => e.stopPropagation()} // Stop bubbling
          // Stop Lenis
        >
          <button className="absolute top-6 right-6 text-gray-400 hover:text-white z-50 bg-gray-800/80 hover:bg-gray-700 rounded-full p-3 transition border border-gray-700">
            <X size={24} />
          </button>

          <div 
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:w-2/3 bg-black flex items-center justify-center p-4">
               {hero.mediaType === 'video' ? (
                 <iframe src={hero.imageUrl} className="w-full h-full aspect-video" allowFullScreen />
               ) : (
                 <img src={hero.imageUrl} alt={hero.title} className="w-full h-full max-h-[90vh] object-contain" />
               )}
            </div>

            <div className="md:w-1/3 p-8 flex flex-col bg-gray-900 border-l border-gray-800 overflow-y-auto" data-lenis-prevent>
               <div className="mb-6">
                 <span className="bg-blue-900/30 text-blue-400 border border-blue-900/50 text-xs font-bold px-3 py-1 rounded-full uppercase">
                   {hero.date}
                 </span>
               </div>
               <h2 className="text-3xl font-bold mb-6 text-white leading-tight">{hero.title}</h2>
               <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                 <p className="whitespace-pre-line leading-relaxed text-base">
                   {hero.description}
                 </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}