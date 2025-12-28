import { getHeroPost, getHazardStory, getLibraryItems } from '@/lib/api';
import FeedGrid from '@/components/FeedGrid';

export default async function Home() {
  // 1. Fetch APOD (Hero)
  const hero = await getHeroPost();
  
  // 2. Fetch Asteroid Data (Status)
  const hazard = await getHazardStory();
  
  // 3. Fetch Library Feed (Images & Videos)
  // You can change 'nebula' to 'black hole', 'mars', 'sun', etc.
  const feed = await getLibraryItems('nebula');

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- Navbar --- */}
      <nav className="border-b border-gray-800 p-6 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ORBIT
        </h1>
        <div className="flex items-center gap-2">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
           </span>
           <span className="text-xs text-gray-500 font-mono">SYSTEM ONLINE</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        
        {/* --- 1. Hero Section (APOD) --- */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">
              Astronomy Picture of the Day
            </h2>
            <span className="text-gray-600 text-xs font-mono">{hero.date}</span>
          </div>
          
          <div className="relative group rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl shadow-blue-900/10">
            {/* Logic: Handle Video vs Image */}
            {hero.mediaType === 'video' ? (
              <div className="aspect-video w-full">
                <iframe 
                  src={hero.imageUrl} 
                  className="w-full h-full" 
                  title="APOD Video"
                  allowFullScreen
                />
              </div>
            ) : (
              <img 
                src={hero.imageUrl} 
                alt={hero.title}
                className="w-full h-auto object-cover max-h-[700px] group-hover:scale-105 transition duration-700 ease-in-out"
              />
            )}
            
            {/* Overlay Text */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-8 pt-32">
              <h1 className="text-3xl md:text-6xl font-bold mb-4">{hero.title}</h1>
              <p className="text-gray-300 line-clamp-2 max-w-3xl text-sm md:text-lg">
                {hero.description}
              </p>
            </div>
          </div>
        </section>

        {/* --- 2. Status Dashboard (Asteroids) --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          
          {/* Card A: Asteroid Radar */}
          <div className={`p-8 rounded-2xl border transition-all hover:scale-[1.02] ${
            hazard.statusColor === 'red' 
              ? 'border-red-900 bg-gradient-to-br from-red-950/30 to-black' 
              : 'border-green-900 bg-gradient-to-br from-green-950/30 to-black'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl flex items-center gap-3">
                ☄️ Asteroid Radar
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                hazard.statusColor === 'red' ? 'bg-red-500 text-black' : 'bg-green-500 text-black'
              }`}>
                {hazard.statusColor === 'red' ? 'WARNING' : 'SAFE'}
              </span>
            </div>
            <p className="text-3xl font-mono font-bold tracking-tight mb-2">{hazard.text}</p>
            <p className="text-sm text-gray-500">Real-time data from NASA NeoWs API</p>
          </div>

          {/* Card B: Project Info (Static Placeholder) */}
          <div className="p-8 rounded-2xl border border-gray-800 bg-gray-900/50 flex flex-col justify-center">
             <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">Current Mission</h3>
             <p className="text-xl font-bold text-white mb-2">Exploring the Archives</p>
             <p className="text-gray-500 text-sm">
               Fetching curated content from the NASA Image and Video Library based on dynamic topic selection.
             </p>
          </div>
        </section>

        {/* --- 3. The Library Feed (Interactive Grid) --- */}
        <section>
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
             <h2 className="text-2xl font-bold">Deep Space Archives</h2>
             <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-mono border border-blue-900">
                QUERY: NEBULA
             </span>
          </div>

          {/* This one line replaces all the old grid HTML */}
          <FeedGrid posts={feed} />
          
        </section>

      </div>
    </main>
  );
}