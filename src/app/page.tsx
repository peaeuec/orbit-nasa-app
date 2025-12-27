import { getHeroPost, getFeedPosts, getHazardStory } from '@/lib/api';
import { getPostLikes } from '@/lib/db';

export default async function Home() {
  const hero = await getHeroPost();
  const feed = await getFeedPosts();
  const testLikes = await getPostLikes('test-id');
  
  // NEW: Fetch the Hazard Story
  const hazard = await getHazardStory();

  return (
    <div className="p-10 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Backend Test Dashboard</h1>
      
      {/* NEW: Asteroid Radar Box */}
      <div className={`p-4 border-l-4 mb-8 text-black ${hazard.statusColor === 'red' ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'}`}>
        <h2 className="font-bold text-lg">Asteroid Radar (NeoWs)</h2>
        <p className="text-xl">{hazard.text}</p>
        <p className="text-xs mt-2 text-gray-600">Status: {hazard.statusColor.toUpperCase()}</p>
      </div>

      {/* ... keep your existing Database Test ... */}
      <div className="bg-yellow-100 p-4 border-l-4 border-yellow-500 text-black mb-8">
         <h2 className="font-bold text-lg">Database Connection Test</h2>
         <p>Checking ID 'test-id': <strong>{testLikes} Likes</strong></p>
      </div>
      
      {/* ... keep your existing Hero and Feed sections ... */}
      <h2 className="text-xl text-blue-600 mt-8">1. Hero Post (APOD)</h2>
      <pre className="bg-gray-100 text-black p-4 rounded overflow-auto h-64">
        {JSON.stringify(hero, null, 2)}
      </pre>

      <h2 className="text-xl text-green-600 mt-8">2. Feed Posts (Library)</h2>
      <pre className="bg-gray-100 text-black p-4 rounded overflow-auto h-96">
        {JSON.stringify(feed, null, 2)}
      </pre>
    </div>
  );
}