Orbit is a web application designed for exploring NASA's media archives and tracking Near-Earth Objects (NEOs). It integrates real-time data from NASA's APIs with a modern and responsive user interface.
[https://orbit-nasa.vercel.app](https://orbit-nasa.vercel.app)

APIs used:
1. NASA NeoWs API (Near Earth Object Web Service)
2. NASA Image and Video Library API
**[NASA Open APIs](https://api.nasa.gov/)**

**Framework:** [Next.js 16.1](https://nextjs.org/) (App Router, React 19, React Compiler)
**Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/)
**Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
**Motion & Animation:** [Framer Motion](https://www.framer.com/motion/)
**Scroll Hijacking:** [Lenis](https://lenis.studiofreight.com/)
**Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
**Icons:** [Lucide React](https://lucide.dev/)

Local development:
Need: Node.js (v18 or higher) and npm installed on your local machine.

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/orbit-nasa-app.git](https://github.com/your-username/orbit-nasa-app.git)
   cd orbit-nasa-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a ```.env.local``` file in the root directory. Use the ```.env.example``` file as a reference
4. Start the development server:
   ```bash
   npm run dev```
