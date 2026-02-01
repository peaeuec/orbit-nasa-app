import { getHeroPost, getHazardStory, getLibraryItems } from '@/lib/api';
import FeedGrid from '@/components/FeedGrid';
import SearchBar from '@/components/SearchBar';
import HeroSection from '@/components/HeroSection'; // <--- NEW IMPORT

export default async function Home() {
  // 1. Fetch APOD (Hero)
  const hero = await getHeroPost();
  
  // 2. Fetch Asteroid Data (Status)
  const hazard = await getHazardStory();
  
  // 3. Topic Roulette (Dynamic Feed)
  // Instead of just 'nebula', it picks a random topic every time the page loads
  const topics = ['nebula', 'black hole', 'mars rover', 'supernova', 'galaxy', 'astronaut', 'saturn'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  // Fetch Library Feed using the random topic
  const feed = await getLibraryItems(randomTopic);

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- Navbar --- */}
      <nav className="border-b border-gray-800 p-6 flex flex-col md:flex-row justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50 gap-4">
        <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ORBIT
        </h1>
        
        {/* Right side container */}
        <div className="flex items-center gap-6">
           <SearchBar /> {/* Kept your Search Bar! */}

           {/* System Online Indicator */}
           <div className="flex items-center gap-2 hidden md:flex">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs text-gray-500 font-mono">SYSTEM ONLINE</span>
           </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        
        {/* --- 1. NEW: Interactive Hero Section (Click to Open) --- */}
        {/* We replaced the big static HTML block with this component */}
        <HeroSection hero={hero} />

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

          {/* Card B: Project Info */}
          <div className="p-8 rounded-2xl border border-gray-800 bg-gray-900/50 flex flex-col justify-center">
             <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">Current Mission</h3>
             <p className="text-xl font-bold text-white mb-2">Exploring the Archives</p>
             <p className="text-gray-500 text-sm">
               Fetching curated content from the NASA Image and Video Library based on dynamic topic selection.
             </p>
          </div>
        </section>

        {/* --- 3. The Library Feed (Dynamic) --- */}
        <section>
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
             <h2 className="text-2xl font-bold">Deep Space Archives</h2>
             {/* This badge now updates to show which topic was picked */}
             <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-mono border border-blue-900 uppercase">
                QUERY: {randomTopic}
             </span>
          </div>

          <FeedGrid posts={feed} />
          
        </section>

      </div>
    </main>
  );
}