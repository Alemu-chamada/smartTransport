import { motion } from "motion/react";
import { Link } from "react-router";
import { Logo } from "../shared/ui/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0d0b1e 0%, #131030 35%, #0c1628 70%, #080d1a 100%)" }}>

      {/* Animated glow blobs */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl z-0 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 rounded-full blur-3xl z-0 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
      />

      {/* Floating dots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20 z-0 pointer-events-none"
          style={{
            width: `${6 + i * 2}px`,
            height: `${6 + i * 2}px`,
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -12, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 py-10 sm:py-12">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-6 sm:mb-8"
        >
          <Link to="/" className="flex flex-col items-center gap-3 group">
            <div
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 ring-2 ring-white/10 group-hover:ring-white/25 transition-all"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              <span className="text-white font-black text-2xl sm:text-3xl select-none tracking-tight">ST</span>
            </div>
            <div className="text-center">
              <div className="text-white font-black text-xl sm:text-2xl leading-tight tracking-tight">
                Smart<span className="text-indigo-300">Transport</span>
              </div>
              <div className="text-white/40 text-xs mt-0.5 font-medium tracking-widest uppercase">
                Management System
              </div>
            </div>
          </Link>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 text-xs sm:text-sm mt-3 text-center max-w-xs leading-relaxed italic px-4"
          >
            "Connecting people, simplifying journeys — every day."
          </motion.p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/[0.09] backdrop-blur-2xl border border-white/[0.14] rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)" }}
        >
          <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-violet-400 to-emerald-400" />
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-5">
          © 2026 SmartTransport · Built by Alemu Chamada
        </p>
      </div>
    </div>
  );
}
