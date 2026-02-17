"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  AlertTriangle,
  Wind,
  Target,
  Info,
  Ruler,
  Earth,
  Moon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import StaggeredText from "@/components/StaggeredText";
import {
  motion,
  useScroll,
  useTransform,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";

interface Asteroid {
  id: string;
  name: string;
  isHazardous: boolean;
  speedKmh: string;
  lunarDistance: string;
  estimatedDiameter: string;
}

interface AsteroidRadarProps {
  data: {
    statusColor: string;
    text: string;
    asteroids: Asteroid[];
  };
}

/* =========================================================
   INDIVIDUAL ASTEROID CARD
   ========================================================= */
function AsteroidCard({
  asteroid,
  maxDistance,
}: {
  asteroid: Asteroid;
  maxDistance: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovered(false);
  };

  const ldValue = parseFloat(asteroid.lunarDistance);
  const fillPercentage = Math.max(2, 100 - (ldValue / maxDistance) * 100);

  const renderContent = (isRipple: boolean) => {
    const isDanger = asteroid.isHazardous;

    const titleColor = isRipple
      ? isDanger
        ? "text-red-300"
        : "text-cyan-400"
      : isDanger
        ? "text-red-400"
        : "text-blue-400";

    const barColor = isRipple
      ? isDanger
        ? "bg-red-400 shadow-[0_0_12px_red]"
        : "bg-cyan-400 shadow-[0_0_8px_cyan]"
      : isDanger
        ? "bg-red-500 shadow-[0_0_8px_red]"
        : "bg-blue-500";

    const bgColor = isRipple
      ? isDanger
        ? "bg-red-900/40"
        : "bg-gray-800/80"
      : isDanger
        ? "bg-red-950/20"
        : "bg-gray-900/50";

    const borderColor = isRipple
      ? isDanger
        ? "border-red-500/50"
        : "border-cyan-500/50"
      : isDanger
        ? "border-red-900/50"
        : "border-gray-800";

    return (
      <div
        className={`p-4 rounded-xl border h-full w-[280px] flex flex-col justify-between ${bgColor} ${borderColor}`}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className={`font-bold font-mono truncate mr-2 ${titleColor}`}>
            {asteroid.name}
          </h4>
          {isDanger && (
            <AlertTriangle
              size={16}
              className={`shrink-0 ${isRipple ? "text-red-400" : "text-red-500"}`}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Wind size={12} /> Velocity
              </span>
              <span className="font-mono text-gray-300 truncate">
                {asteroid.speedKmh} km/h
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Ruler size={12} /> Est. Size
              </span>
              <span className="font-mono text-gray-300 truncate">
                {asteroid.estimatedDiameter}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-1">
                <Target size={12} /> Miss Distance
              </span>
              <span className="font-mono text-gray-300">
                {asteroid.lunarDistance} LD
              </span>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor-image="true"
      className="relative rounded-xl cursor-none overflow-hidden shrink-0 transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl"
    >
      {renderContent(false)}

      <div
        className="absolute inset-0 z-10 pointer-events-none transition-[clip-path] duration-700 ease-out"
        style={{
          clipPath: `circle(${isHovered ? 150 : 0}% at ${mousePos.x}px ${mousePos.y}px)`,
        }}
      >
        {renderContent(true)}
      </div>
    </div>
  );
}

/* =========================================================
   PHYSICS-BASED TICKER TAPE WITH NAVIGATION
   ========================================================= */
const SmoothTicker = forwardRef(
  (props: { children: React.ReactNode; itemCount: number }, ref) => {
    const { children, itemCount } = props;
    const [isHovered, setIsHovered] = useState(false);
    const xValue = useMotionValue(0);
    const speed = useSpring(1, { damping: 40, stiffness: 50 });
    const idleTimeout = useRef<NodeJS.Timeout | null>(null);

    const ITEM_WIDTH = 304;
    const SET_WIDTH = itemCount * ITEM_WIDTH;

    useImperativeHandle(ref, () => ({
      scrollLeft: () => navigate(-1),
      scrollRight: () => navigate(1),
    }));

    const navigate = (direction: 1 | -1) => {
      speed.set(0);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);

      const currentX = xValue.get();
      const currentIndex = Math.round(currentX / ITEM_WIDTH);

      const targetX = (currentIndex - direction) * ITEM_WIDTH;
      animate(xValue, targetX, { type: "spring", stiffness: 150, damping: 25 });

      idleTimeout.current = setTimeout(() => {
        speed.set(1);
      }, 2000);
    };

    useEffect(() => {
      if (isHovered) {
        speed.set(0);
      } else {
        if (!idleTimeout.current) speed.set(1);
      }
    }, [isHovered, speed]);

    useAnimationFrame((_, delta) => {
      let currentX = xValue.get();
      if (speed.get() > 0.01) {
        currentX -= delta * 0.05 * speed.get();
        xValue.set(currentX);
      }
    });

    const x = useTransform(xValue, (v) => {
      const w = ((v % SET_WIDTH) + SET_WIDTH) % SET_WIDTH;
      const finalX = w === 0 ? 0 : w - SET_WIDTH;
      return `${finalX}px`;
    });

    return (
      // FIX: Massive vertical padding (py-8 -my-4) and completely removed overflow-hidden.
      // This allows the cards to scale up by 1.05 without EVER getting clipped by their container boundaries!
      <div
        className="relative w-full py-8 -my-4 z-10"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex w-full">
          <motion.div
            style={{ x }}
            className="flex gap-6 w-max cursor-grab active:cursor-grabbing px-6"
          >
            {children}
          </motion.div>
        </div>
      </div>
    );
  },
);
SmoothTicker.displayName = "SmoothTicker";

/* =========================================================
   MAIN RADAR COMPONENT
   ========================================================= */
export default function AsteroidRadar({ data }: AsteroidRadarProps) {
  const isDanger = data.statusColor === "red";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tickerRef = useRef<{ scrollLeft: () => void; scrollRight: () => void }>(
    null,
  );

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start end", "end start"],
  });

  const rawX = useTransform(
    scrollYProgress,
    [0.1, 0.35, 0.65, 0.85],
    [1200, 0, 0, -1000],
  );
  const x = useSpring(rawX, { stiffness: 60, damping: 25, mass: 1 });
  const opacity = useTransform(
    scrollYProgress,
    [0.1, 0.25, 0.75, 0.9],
    [0, 1, 1, 0],
  );

  const maxDistance = Math.max(
    1,
    ...data.asteroids.map((a) => parseFloat(a.lunarDistance)),
  );

  return (
    <div className="relative w-full mt-40 mb-10">
      <div ref={scrollContainerRef} className="relative w-full h-[250vh]">
        <div className="sticky top-0 w-full h-screen flex flex-col justify-center py-10">
          <style>{`
            @keyframes border-spin {
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .animate-border-spin {
              animation: border-spin 6s linear infinite;
            }
          `}</style>

          <motion.div
            style={{ x, opacity }}
            className={`group/card relative w-full p-[2px] rounded-[2rem] overflow-hidden transition-all duration-700 ease-out hover:-translate-y-2 hover:scale-[1.005] ${
              isDanger
                ? "hover:shadow-[0_40px_80px_-15px_rgba(220,38,38,0.3)]"
                : "hover:shadow-[0_40px_80px_-15px_rgba(34,211,238,0.25)]"
            }`}
          >
            <div
              className={`absolute top-1/2 left-1/2 w-[200%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-border-spin z-0 ${
                isDanger
                  ? "bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(239,68,68,0.8)_360deg)]"
                  : "bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(34,211,238,0.8)_360deg)]"
              }`}
            />

            <div
              className={`absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 ${
                isDanger ? "bg-red-500/80" : "bg-cyan-400/80"
              }`}
            />

            <div
              className={`absolute inset-0 z-0 ${isDanger ? "bg-red-950/30" : "bg-cyan-950/20"}`}
            />

            <div className="relative z-10 w-full h-full bg-black rounded-[calc(2rem-2px)] p-8 md:p-10 flex flex-col shadow-2xl">
              {/* --- HEADER --- */}
              <div className="flex items-center justify-between mb-4 z-20">
                <h3 className="group flex items-center gap-2 cursor-none w-fit">
                  <span className="text-2xl">☄️</span>
                  <button className="outline-none">
                    <StaggeredText
                      text="Asteroid Radar"
                      className="font-bold text-2xl text-cyan-400"
                    />
                  </button>
                </h3>

                <button
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-none ${
                    isDanger ? "bg-red-500" : "bg-green-500"
                  } text-black`}
                >
                  {isDanger ? "WARNING" : "SAFE"}
                </button>
              </div>

              {/* --- SUMMARY --- */}
              <p className="text-2xl md:text-3xl font-mono font-bold mb-4 z-20">
                {data.text}
              </p>

              {/* --- SUB-HEADER: API INFO & NAVIGATION ARROWS --- */}
              {/* Relocated arrows to sit beautifully parallel to the API tooltip text */}
              <div className="flex items-center justify-between mb-4 z-20">
                {/* Left side: Tooltip */}
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    Real-time data from NASA NeoWs API
                  </p>
                  <div
                    className="relative group/info flex items-center cursor-none"
                    data-cursor-invert="true"
                  >
                    <Info
                      size={16}
                      className="text-gray-500 group-hover/info:text-cyan-400 transition"
                    />

                    <div className="absolute top-full left-1/2 md:left-auto md:right-[-20px] -translate-x-1/2 md:translate-x-0 mt-4 w-[280px] md:w-[320px] p-5 bg-gray-900 text-xs text-gray-300 rounded-xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-gray-700">
                      <p className="mb-3">
                        <strong className="text-cyan-400">
                          Lunar Distance (LD)
                        </strong>{" "}
                        is the space between Earth and the Moon (~384,400 km).
                      </p>
                      <div className="relative flex items-center justify-between w-full h-8 px-2 mb-4 bg-black/40 rounded-full border border-gray-800/80 overflow-hidden">
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-700"></div>
                        <div className="relative z-10 flex items-center gap-1.5 bg-gray-900 pr-2">
                          <Earth size={14} className="text-cyan-500" />
                        </div>
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-2 text-[10px] text-gray-400 font-mono tracking-widest z-10 border border-gray-800 rounded-full">
                          1.0 LD
                        </span>
                        <div className="relative z-10 flex items-center gap-1.5 bg-gray-900 pl-2">
                          <Moon size={12} className="text-gray-400" />
                        </div>
                      </div>
                      <p>
                        <strong className="text-red-400">
                          Potentially Hazardous
                        </strong>{" "}
                        means it's large and its orbit comes relatively close to
                        Earth. It{" "}
                        <strong className="text-white">does not</strong> mean a
                        collision is expected.
                      </p>
                      <div className="absolute bottom-full left-1/2 md:left-auto md:right-[24px] -translate-x-1/2 md:translate-x-0 -mb-[1px] border-[6px] border-transparent border-b-gray-700"></div>
                    </div>
                  </div>
                </div>

                {/* Right side: Large, Thin Navigation Arrows */}
                {/* opacity-0 -> 100 on hover creates the reveal effect without cluttering the UI */}
                <div className="flex items-center gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                  <button
                    onClick={() => tickerRef.current?.scrollLeft()}
                    className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-400 hover:text-white hover:border-gray-400 hover:scale-110 hover:bg-gray-900/50 transition-all duration-300 cursor-none"
                  >
                    <ArrowLeft size={22} strokeWidth={1.2} />
                  </button>
                  <button
                    onClick={() => tickerRef.current?.scrollRight()}
                    className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-400 hover:text-white hover:border-gray-400 hover:scale-110 hover:bg-gray-900/50 transition-all duration-300 cursor-none"
                  >
                    <ArrowRight size={22} strokeWidth={1.2} />
                  </button>
                </div>
              </div>

              {/* --- THE BUTTERY SMOOTH TICKER TAPE --- */}
              <SmoothTicker ref={tickerRef} itemCount={data.asteroids.length}>
                {data.asteroids.map((asteroid) => (
                  <AsteroidCard
                    key={`set1-${asteroid.id}`}
                    asteroid={asteroid}
                    maxDistance={maxDistance}
                  />
                ))}
                {data.asteroids.map((asteroid) => (
                  <AsteroidCard
                    key={`set2-${asteroid.id}`}
                    asteroid={asteroid}
                    maxDistance={maxDistance}
                  />
                ))}
              </SmoothTicker>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
