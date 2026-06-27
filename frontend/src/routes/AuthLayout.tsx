import { motion } from "motion/react";
import { Link } from "react-router";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#FFF9FA" }}>

      {/* Glow blobs */}
      <motion.div className="absolute top-1/4 left-1/4 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full blur-3xl z-0 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,65,3,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }} />
      <motion.div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 rounded-full blur-3xl z-0 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(33,241,168,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }} />

      {/* Floating dots */}
      {[...Array(5)].map((_, i) => (
        <motion.div key={i}
          className="absolute rounded-full z-0 pointer-events-none"
          style={{ width: `${6 + i * 2}px`, height: `${6 + i * 2}px`,
                   left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 25}%`,
                   backgroundColor: i % 2 === 0 ? "rgba(255,65,3,0.2)" : "rgba(33,241,168,0.15)" }}
          animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -12, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }} />
      ))}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 py-10 sm:py-12">

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-7 sm:mb-9">
          <Link to="/" className="flex flex-col items-center gap-3 group">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #FF4103 0%, #ff6a35 100%)",
                       boxShadow: "0 0 40px rgba(255,65,3,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
              <span className="text-white font-black text-2xl sm:text-3xl select-none">ST</span>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "#001621" }}>
                Smart<span style={{ color: "#FF4103" }}>Transport</span>
              </div>
              <div className="text-xs mt-0.5 font-bold uppercase tracking-widest"
                style={{ color: "rgba(0,22,33,0.4)" }}>Management System</div>
            </div>
          </Link>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xs sm:text-sm mt-3 text-center max-w-xs leading-relaxed italic px-4"
            style={{ color: "rgba(0,22,33,0.4)" }}>
            "Connecting people, simplifying journeys — every day."
          </motion.p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl overflow-hidden"
          style={{ backgroundColor: "#fff",
                   boxShadow: "0 8px 40px rgba(0,22,33,0.12), 0 0 0 1px rgba(0,22,33,0.07)" }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg, #FF4103, #FFBE0B, #21F1A8)" }} />
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </motion.div>

        <p className="text-center text-xs mt-5" style={{ color: "rgba(0,22,33,0.3)" }}>
          © 2026 SmartTransport · Built by Alemu Chamada
        </p>
      </div>
    </div>
  );
}
