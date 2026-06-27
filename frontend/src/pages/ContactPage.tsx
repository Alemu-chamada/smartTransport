import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Mail, Phone, MapPin, Globe, Github, Linkedin,
  Bus, Navigation, Clock, ExternalLink,
} from "lucide-react";
import { Logo } from "../shared/ui/Logo";

// ─── Transportation connector SVG path ───────────────────────────────────────
// Starts at top-right of System card, travels mostly vertically down
// with two shallow 35° bends, ends at top-left of Developer card.
const CONNECTOR_PATH = "M 160 0 L 160 80 L 200 130 L 200 340 L 160 390 L 160 480";

// Nodes along the connector: [progress 0-1, icon, label]
const CONNECTOR_NODES = [
  { y: 90,  Icon: Bus,        label: "Fleet"    },
  { y: 220, Icon: Navigation, label: "Route"    },
  { y: 370, Icon: MapPin,     label: "Arrive"   },
];

// ─── Card data ────────────────────────────────────────────────────────────────
const SYSTEM_ITEMS = [
  { Icon: Globe,  label: "Platform",     value: "Smart Transport Management System", href: undefined },
  { Icon: Mail,   label: "Support Email",value: "smarttransportserv@gmail.com",      href: "mailto:smarttransportserv@gmail.com" },
  { Icon: Phone,  label: "Phone",        value: "+251 99 273 8116",                 href: "tel:+251992738116" },
  { Icon: MapPin, label: "Location",     value: "ASTU · Addis Ababa, Ethiopia",     href: undefined },
  { Icon: Clock,  label: "Hours",        value: "Mon–Fri · 9 AM–6 PM EAT",         href: undefined },
];

const DEV_ITEMS = [
  { Icon: Mail,        label: "Email",     value: "alemuchamada@gmail.com",           href: "mailto:alemuchamada@gmail.com" },
  { Icon: Phone,       label: "Phone",     value: "+251 95 604 7594",                href: "tel:+251956047594" },
  { Icon: Github,      label: "GitHub",    value: "github.com/Alemu-chamada",         href: "https://github.com/Alemu-chamada" },
  { Icon: Linkedin,    label: "LinkedIn",  value: "Alemu Chamada",                   href: "https://linkedin.com/in/alemu-chamada" },
  { Icon: MapPin,      label: "Degree",    value: "CS & Engineering · ASTU",         href: undefined },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function ContactPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#05071a" }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "rgba(5,7,26,0.85)", backdropFilter: "blur(16px)", borderColor: "rgba(99,102,241,0.2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              {[["Home", "/"], ["Features", "/features"], ["About", "/about"], ["Contact", "/contact"]].map(([label, path]) => (
                <Link key={path} to={path} className="text-sm font-medium transition-colors"
                  style={{ color: path === "/contact" ? "#818cf8" : "rgba(255,255,255,0.55)" }}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/signin" className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.55)" }}>Login</Link>
              <Link to="/signup"
                className="text-white text-sm font-semibold px-5 py-2 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-10 text-center relative overflow-hidden">
        {/* background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        </div>
        <motion.div className="relative z-10 max-w-3xl mx-auto px-4"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
            ◈ Get In Touch
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 leading-tight">
            Contact <span style={{ background: "linear-gradient(90deg,#818cf8,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Us</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Questions about Smart Transport? Want to report an issue or suggest a feature?<br />
            Reach out — we're happy to help.
          </p>
        </motion.div>
      </section>

      {/* ── Main section: diagonal cards + connector ───────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">

          {/* ── DESKTOP/TABLET layout ────────────────────────────────────── */}
          <div className="hidden md:block relative" style={{ minHeight: "640px" }}>

            {/* System card — top-left */}
            <motion.div
              className="absolute top-0 left-0 w-[380px]"
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <SystemCard />
            </motion.div>

            {/* Connector — center */}
            <div className="absolute" style={{ left: "calc(50% - 160px)", top: "80px" }}>
              <TransportConnector />
            </div>

            {/* Developer card — bottom-right */}
            <motion.div
              className="absolute bottom-0 right-0 w-[380px]"
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
              <DeveloperCard />
            </motion.div>
          </div>

          {/* ── MOBILE layout — stacked, no connector ────────────────────── */}
          <div className="md:hidden flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SystemCard />
            </motion.div>
            {/* mobile divider */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4))" }} />
              <Bus className="h-5 w-5" style={{ color: "#6366f1" }} />
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.4), transparent)" }} />
            </div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <DeveloperCard />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── CTA section ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <motion.div
          className="max-w-2xl mx-auto rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.25)", backdropFilter: "blur(16px)" }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12), transparent 70%)" }} />
          <div className="relative z-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Mail className="h-7 w-7" style={{ color: "#818cf8" }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Send us a message</h2>
            <p className="mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              For support, feature requests, or general inquiries — email us directly and we'll respond quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:smarttransportserv@gmail.com"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Mail className="h-4 w-4" /> Email the System
              </a>
              <a href="mailto:alemuchamada@gmail.com"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
                <Mail className="h-4 w-4" /> Email the Developer
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t" style={{ borderColor: "rgba(99,102,241,0.15)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-semibold text-white text-sm">Smart Transport System</span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © 2026 Smart Transport System · Built by Alemu Chamada
          </p>
          <div className="flex gap-5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {[["Features", "/features"], ["About", "/about"], ["Contact", "/contact"]].map(([label, path]) => (
              <Link key={path} to={path} className="transition-colors hover:text-white">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── System Card ──────────────────────────────────────────────────────────────
function SystemCard() {
  return (
    <div className="relative rounded-3xl overflow-hidden group transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(99,102,241,0.3)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 40px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
      {/* top glow strip */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #6366f1, #22d3ee, #8b5cf6)" }} />
      {/* background gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.15), transparent 60%)" }} />
      <div className="relative p-7">
        {/* header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}>
            <Bus className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#818cf8" }}>System</div>
            <h2 className="text-lg font-bold text-white leading-tight">Smart Transport<br />Management System</h2>
          </div>
        </div>
        {/* divider */}
        <div className="mb-5 h-px" style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.5), transparent)" }} />
        {/* items */}
        <div className="space-y-4">
          {SYSTEM_ITEMS.map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3 group/item">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <Icon className="h-3.5 w-3.5" style={{ color: "#818cf8" }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-medium transition-colors break-all hover:text-cyan-400"
                    style={{ color: "rgba(255,255,255,0.85)" }}>
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* status badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(34,211,100,0.1)", border: "1px solid rgba(34,211,100,0.25)", color: "#4ade80" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          System Online
        </div>
      </div>
    </div>
  );
}

// ─── Developer Card ───────────────────────────────────────────────────────────
function DeveloperCard() {
  return (
    <div className="relative rounded-3xl overflow-hidden group transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(139,92,246,0.35)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
      {/* top glow strip */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #8b5cf6, #c084fc, #22d3ee)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 70% 0%, rgba(139,92,246,0.15), transparent 60%)" }} />
      <div className="relative p-7">
        {/* avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-black text-xl"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #8b5cf6)", boxShadow: "0 0 24px rgba(139,92,246,0.5)" }}>
              AC
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
              style={{ background: "#05071a", border: "2px solid rgba(139,92,246,0.5)" }}>
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#c084fc" }}>Developer</div>
            <h2 className="text-lg font-bold text-white">Alemu Chamada</h2>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Full Stack Developer</p>
          </div>
        </div>
        {/* divider */}
        <div className="mb-5 h-px" style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.5), transparent)" }} />
        {/* items */}
        <div className="space-y-4">
          {DEV_ITEMS.map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
                <Icon className="h-3.5 w-3.5" style={{ color: "#c084fc" }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors break-all inline-flex items-center gap-1 hover:text-purple-300"
                    style={{ color: "rgba(255,255,255,0.85)" }}>
                    {value}
                    {href.startsWith("http") && <ExternalLink className="h-3 w-3 opacity-50 flex-shrink-0" />}
                  </a>
                ) : (
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Transportation Connector ─────────────────────────────────────────────────
function TransportConnector() {
  const H = 480;

  return (
    <div style={{ width: 320, height: H, position: "relative" }}>
      <svg width={320} height={H} viewBox={`0 0 320 ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* main gradient */}
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="40%"  stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
          </linearGradient>
          {/* glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* strong glow */}
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* animated dash */}
          <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%"  stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="55%"  stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── background glow track ── */}
        <path d={CONNECTOR_PATH} stroke="url(#lineGrad)" strokeWidth="6"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />

        {/* ── dashed segmented line ── */}
        <path d={CONNECTOR_PATH} stroke="url(#lineGrad)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8"
          opacity="0.6" filter="url(#glow)" />

        {/* ── solid bright line ── */}
        <path d={CONNECTOR_PATH} stroke="url(#lineGrad)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" opacity="0.85" />

        {/* ── animated flowing light ── */}
        <motion.path
          d={CONNECTOR_PATH}
          stroke="url(#flowGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{ pathOffset: [0, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          filter="url(#strongGlow)"
          opacity={0.9}
        />

        {/* ── nodes ── */}
        {CONNECTOR_NODES.map(({ y, Icon, label }, i) => (
          <g key={label}>
            {/* pulse ring */}
            <motion.circle cx={160} cy={y} r={14}
              fill="none" stroke="#22d3ee" strokeWidth="1"
              initial={{ r: 10, opacity: 0.8 }}
              animate={{ r: [10, 22], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }}
            />
            {/* node bg */}
            <circle cx={160} cy={y} r={14} fill="#05071a" stroke="url(#lineGrad)" strokeWidth="1.5" filter="url(#glow)" />
            {/* icon rendered as text (SVG foreignObject for React icon) */}
            <circle cx={160} cy={y} r={6} fill="url(#lineGrad)" opacity={0.9} />
          </g>
        ))}

        {/* ── origin dot (top) ── */}
        <circle cx={160} cy={0} r={5} fill="#6366f1" filter="url(#glow)" />
        <motion.circle cx={160} cy={0} r={5}
          fill="none" stroke="#6366f1" strokeWidth="1"
          animate={{ r: [5, 14], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />

        {/* ── destination dot (bottom) ── */}
        <circle cx={160} cy={H} r={5} fill="#8b5cf6" filter="url(#glow)" />
        <motion.circle cx={160} cy={H} r={5}
          fill="none" stroke="#8b5cf6" strokeWidth="1"
          animate={{ r: [5, 14], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.8 }}
        />
      </svg>

      {/* ── icon labels beside nodes ── (positioned absolutely over SVG) */}
      {CONNECTOR_NODES.map(({ y, Icon, label }) => (
        <div key={label}
          style={{ position: "absolute", top: y - 12, left: 186, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)" }}>
            <Icon style={{ width: 13, height: 13, color: "#22d3ee" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
