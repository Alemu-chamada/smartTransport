import { Link } from "react-router";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  const primaryText = variant === "light" ? "text-white" : "text-gray-900";
  const accentText = variant === "light" ? "text-indigo-300" : "text-[#FF4103]";

  return (
    <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
      <div
        className={`${iconSize} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all flex-shrink-0`}
        style={{ background: "linear-gradient(135deg, #FF4103 0%, #FFBE0B 100%)" }}
      >
        <span className="text-white font-black text-sm leading-none select-none tracking-tight">ST</span>
      </div>
      <div className="hidden sm:block leading-none">
        <span className={`font-black ${textSize} ${primaryText}`}>Smart</span>
        <span className={`font-black ${textSize} ${accentText}`}>Transport</span>
      </div>
    </Link>
  );
}

export function BYDBackground({ opacity = 0.08, className = "" }: { opacity?: number; className?: string }) {
  return (
    <div
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        opacity,
        background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)",
      }}
    />
  );
}
