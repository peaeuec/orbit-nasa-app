import { getHeroPost, getFeedPosts, getHazardStory } from '@/lib/api';

export default async function Home() {
  // We keep fetching the data, because we will need it soon!
  const hero = await getHeroPost();
  const feed = await getFeedPosts();
  const hazard = await getHazardStory();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* 1. Navbar (Coming soon) */}
      <nav className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tighter">ORBIT</h1>
      </nav>

      {/* 2. Hero Section */}
      <section className="container mx-auto py-20 px-4">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Explore the Cosmos
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Daily deep space imagery from NASA's APOD and NeoWs APIs.
        </p>
      </section>

      {/* 3. Empty Grid for Feed */}
      <section className="container mx-auto px-4 py-10">
        <div className="p-10 border border-dashed border-gray-700 rounded-xl text-center text-gray-500">
          Feed Components Will Go Here
        </div>
      </section>
    </main>
  );
}