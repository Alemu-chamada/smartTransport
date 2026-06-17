import { motion } from "motion/react";
import { Link } from "react-router";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-primary">

      {/* ── Full-page background layer ── */}
      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />

      {/* Large decorative blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

      {/* Floating bus — top left */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: -18 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 3.5, ease: "easeInOut" }}
        className="absolute top-16 left-16 text-6xl select-none opacity-30 hidden md:block"
      >
        🚌
      </motion.div>

      {/* Floating bus — bottom right */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: 14 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 4, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-20 text-5xl select-none opacity-20 hidden md:block"
      >
        🚍
      </motion.div>

      {/* Small decorative circles */}
      <div className="absolute top-1/4 right-12 w-3 h-3 bg-white/30 rounded-full" />
      <div className="absolute top-2/3 left-12 w-2 h-2 bg-white/20 rounded-full" />
      <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-white/15 rounded-full" />

      {/* Background brand text — very subtle watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
        <span className="text-white font-black text-[18rem] leading-none tracking-tighter">TMS</span>
      </div>

      {/* Stats strip at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8">
        {[
          { value: "50K+", label: "Trips" },
          { value: "10K+", label: "Users" },
          { value: "98%", label: "Satisfaction" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-white font-bold text-lg leading-tight">{s.value}</div>
            <div className="text-white/50 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Form card ── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo above card */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-lg leading-tight">Smart Transport</div>
            <div className="text-white/60 text-xs">Management System</div>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Smart Transport System · Built by Alemu Chamada
        </p>
      </div>
    </div>
  );
}
