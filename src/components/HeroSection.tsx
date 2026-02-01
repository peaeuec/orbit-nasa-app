'use client';

import { useState } from 'react';
import { SpacePost } from '@/lib/types';
import { X, Maximize2, Info } from 'lucide-react';

export default function HeroSection({ hero }: { hero: SpacePost }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">
            Astronomy Picture of the Day
          </h2>
          <span className="text-gray-600 text-xs font-mono">{hero.date}</span>
        </div>

        <div 
          className="relative group rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl shadow-blue-900/10 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          {hero.mediaType === 'video' ? (
            <div className="aspect-video w-full pointer-events-none">
              <iframe src={hero.imageUrl} className="w-full h-full" title="APOD Video" />
            </div>
          ) : (
            <img 
              src={hero.imageUrl} 
              alt={hero.title}
              className="w-full h-auto object-cover max-h-[700px] group-hover:scale-105 transition duration-700 ease-in-out"
            />
          )}

          <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-md">
            <Maximize2 className="text-white w-5 h-5" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-8 pt-32">
            <h1 className="text-3xl md:text-6xl font-bold mb-4">{hero.title}</h1>
            <p className="text-gray-300 line-clamp-2 max-w-3xl text-sm md:text-lg">
              {hero.description}
            </p>
            <button className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest hover:text-blue-300 transition">
              <Info size={16} /> Read Full Story
            </button>
          </div>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-50 bg-black/50 rounded-full p-2">
              <X size={24} />
            </button>
            <div className="w-full bg-black flex justify-center">
               {hero.mediaType === 'video' ? (
                 <iframe src={hero.imageUrl} className="w-full aspect-video" allowFullScreen />
               ) : (
                 <img src={hero.imageUrl} alt={hero.title} className="w-full h-auto max-h-[60vh] object-contain" />
               )}
            </div>
            <div className="p-8">
               <h2 className="text-3xl font-bold mb-4">{hero.title}</h2>
               <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 font-mono border-b border-gray-800 pb-4">
                 <span>{hero.date}</span>
                 <span>•</span>
                 <span>{hero.mediaType.toUpperCase()}</span>
               </div>
               <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">{hero.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}