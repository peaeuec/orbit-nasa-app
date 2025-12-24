import { getHeroPost, getFeedPosts } from '@/lib/api';

export default async function Home() {
  const hero = await getHeroPost();
  const feed = await getFeedPosts();

  return (
    <div className="p-10 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Backend Test Dashboard</h1>
      
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