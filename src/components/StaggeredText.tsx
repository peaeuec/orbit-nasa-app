"use client";

interface StaggeredTextProps {
  text: string;
  className?: string;
  // We pass full class strings so Tailwind's compiler doesn't miss them!
  hideClass?: string;
  showClass?: string;
}

export default function StaggeredText({
  text,
  className = "",
  hideClass = "group-hover:-translate-y-full", // Default for standard groups
  showClass = "group-hover:translate-y-0", // Default for standard groups
}: StaggeredTextProps) {
  return (
    // whitespace-pre ensures spaces don't collapse when splitting the string
    <span className={`flex whitespace-pre ${className}`}>
      {text.split("").map((char, i) => (
        <span key={i} className="relative overflow-hidden inline-flex">
          {/* Default Text (Visible -> Slides Up/Away) */}
          <span
            className={`transition-transform duration-500 ease-out ${hideClass}`}
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char}
          </span>

          {/* Hover Text (Hidden Below -> Slides Up into view) */}
          <span
            className={`absolute inset-0 transition-transform duration-500 ease-out translate-y-full text-white ${showClass}`}
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char}
          </span>
        </span>
      ))}
    </span>
  );
}
