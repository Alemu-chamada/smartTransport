import { motion } from "motion/react";
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink, MessageSquare, Bus, Navigation } from "lucide-react";
import { LandingNav, LandingFooter } from "./LandingPage";

const C = { red: "#FF4103", navy: "#001621", green: "#21F1A8", gold: "#FFBE0B", purple: "#3C1A47", g2: "#59C749" };

const SYSTEM_ITEMS = [
  { Icon: Globe,  label: "Platform",      value: "Smart Transport Management System", href: undefined },
  { Icon: Mail,   label: "Support Email", value: "smarttransportserv@gmail.com",      href: "mailto:smarttransportserv@gmail.com" },
  { Icon: Phone,  label: "Phone",         value: "+251 96 694 2369",                  href: "tel:+251966942369" },
];

const DEV_ITEMS = [
  { Icon: Mail,     label: "Email",     value: "alemuchamada@gmail.com",         href: "mailto:alemuchamada@gmail.com" },
  { Icon: Phone,    label: "Phone",     value: "+251 95 604 7594",               href: "tel:+251956047594" },
  { Icon: Github,   label: "GitHub",    value: "github.com/Alemu-chamada",       href: "https://github.com/Alemu-chamada" },
  { Icon: Linkedin, label: "LinkedIn",  value: "Alemu Chamada",                  href: "https://linkedin.com/in/alemu-chamada" },
  { Icon: MapPin,   label: "Education", value: "Computer Science & Eng · ASTU",  href: "https://www.astu.edu.et/" },
];

// ── card approximate heights (used for connector geometry) ──
const CARD_W       = 360;   // fixed card width on desktop
const SYS_MID_Y    = 130;   // ~mid-height of system card header
const DEV_OFFSET_X = 100;   // how far right dev card is from sys card left
const V_GAP        = 300;   // vertical gap between card tops

export function ContactPage() {
  return (
    <div style={{ backgroundColor: "#FFF9FA" }}>
      <LandingNav active="/contact" />

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: C.red }} />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: C.green }} />
        </div>
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: `${C.red}12`, color: C.red }}>Get In Touch</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight" style={{ color: C.navy }}>
              Contact{" "}
              <span style={{ background: `linear-gradient(135deg, ${C.red}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Us
              </span>
            </h1>
            <p className="text-xl leading-relaxed" style={{ color: "#6b7280" }}>
              Questions about Smart Transport? Want to report an issue or suggest a feature?<br />
              Reach out — we're happy to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Cards ────────────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">

          {/* DESKTOP: absolute positioned timeline */}
          <div className="hidden lg:block relative"
            style={{ height: V_GAP + 520 /* enough for both cards + gap */ }}>

            {/* System card — top-left */}
            <motion.div className="absolute top-0 left-0" style={{ width: CARD_W }}
              initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65 }}>
              <SystemCard />
            </motion.div>

            {/* Metro connector — SVG overlay, pointer-events none */}
            <div className="absolute inset-0 pointer-events-none">
              <MetroLine />
            </div>

            {/* Developer card — offset below and slightly right */}
            <motion.div className="absolute" style={{ top: V_GAP, left: DEV_OFFSET_X, width: CARD_W }}
              initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.2 }}>
              <DeveloperCard />
            </motion.div>
          </div>

          {/* TABLET (md): side-by-side with thin connector */}
          <div className="hidden md:flex lg:hidden items-start gap-8">
            <motion.div className="flex-1" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SystemCard />
            </motion.div>
            <div className="flex flex-col items-center justify-center pt-20" style={{ minHeight: 300 }}>
              <div className="w-px flex-1" style={{ background: `linear-gradient(to bottom, ${C.red}, ${C.purple})` }} />
              <Bus className="h-5 w-5 my-2 flex-shrink-0" style={{ color: C.gold }} />
              <div className="w-px flex-1" style={{ background: `linear-gradient(to bottom, ${C.gold}, ${C.purple})` }} />
            </div>
            <motion.div className="flex-1" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
              <DeveloperCard />
            </motion.div>
          </div>

          {/* MOBILE: stacked */}
          <div className="md:hidden flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SystemCard />
            </motion.div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.red}40)` }} />
              <Bus className="h-4 w-4 flex-shrink-0" style={{ color: C.red }} />
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${C.red}40, transparent)` }} />
            </div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <DeveloperCard />
            </motion.div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: `${C.navy}06` }}>
        <div className="w-full max-w-2xl mx-auto px-6 sm:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-3xl p-10 text-center"
            style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 8px 40px rgba(0,22,33,0.08)" }}>
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: `${C.red}12` }}>
              <MessageSquare className="h-8 w-8" style={{ color: C.red }} />
            </div>
            <h2 className="text-2xl font-black mb-3" style={{ color: C.navy }}>Send us a message</h2>
            <p className="mb-8 leading-relaxed" style={{ color: "#6b7280" }}>
              For support, feature requests, or general inquiries — email us directly and we'll respond quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:smarttransportserv@gmail.com"
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: C.red, boxShadow: `0 4px 16px ${C.red}40` }}>
                <Mail className="h-4 w-4" /> Email the System
              </a>
              <a href="mailto:alemuchamada@gmail.com"
                className="inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-colors"
                style={{ border: `2px solid ${C.purple}30`, color: C.purple }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${C.purple}08`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                <Mail className="h-4 w-4" /> Email the Developer
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

/* ─── System Card ────────────────────────────────────────────────────────── */
function SystemCard() {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: `0 20px 48px rgba(0,22,33,0.14)` }}
      className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
      style={{ border: "1px solid rgba(0,22,33,0.08)", boxShadow: "0 4px 24px rgba(0,22,33,0.08)" }}>
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${C.red}, ${C.gold})` }} />
      <div className="p-7">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.red}, #ff6a35)`, boxShadow: `0 4px 16px ${C.red}40` }}>
            <Bus className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: C.red }}>System</p>
            <h2 className="text-lg font-black leading-tight" style={{ color: C.navy }}>
              Smart Transport<br />Management System
            </h2>
          </div>
        </div>
        <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, ${C.red}30, transparent)` }} />
        <div className="space-y-4">
          {SYSTEM_ITEMS.map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${C.red}12` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: C.red }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#9ca3af" }}>{label}</p>
                {href
                  ? <a href={href} className="text-sm font-semibold break-all hover:underline" style={{ color: C.navy }}>{value}</a>
                  : <p className="text-sm font-semibold" style={{ color: C.navy }}>{value}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: `${C.g2}18`, color: C.g2, border: `1px solid ${C.g2}30` }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.g2 }} />
          System Online
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Developer Card ─────────────────────────────────────────────────────── */
function DeveloperCard() {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: `0 20px 48px rgba(0,22,33,0.14)` }}
      className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
      style={{ border: "1px solid rgba(0,22,33,0.08)", boxShadow: "0 4px 24px rgba(0,22,33,0.08)" }}>
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${C.purple}, ${C.green})` }} />
      <div className="p-7">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-black text-xl"
              style={{ background: `linear-gradient(135deg, ${C.purple}, #5a2a6a)`, boxShadow: `0 4px 16px ${C.purple}50` }}>
              AC
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#fff", border: `2px solid ${C.g2}` }}>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: C.g2 }} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: C.purple }}>Developer</p>
            <h2 className="text-lg font-black" style={{ color: C.navy }}>Alemu Chamada</h2>
            <p className="text-xs font-medium" style={{ color: "#9ca3af" }}>Full Stack Developer</p>
          </div>
        </div>
        <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, ${C.purple}30, transparent)` }} />
        <div className="space-y-4">
          {DEV_ITEMS.map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${C.purple}12` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: C.purple }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#9ca3af" }}>{label}</p>
                {href
                  ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                      className="text-sm font-semibold break-all inline-flex items-center gap-1 hover:underline"
                      style={{ color: C.navy }}>
                      {value}
                      {href.startsWith("http") && <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-40" />}
                    </a>
                  : <p className="text-sm font-semibold" style={{ color: C.navy }}>{value}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MetroLine ──────────────────────────────────────────────────────────── */
/*
 * Geometry (all in px, matching the JS constants above):
 *
 *   System card: left=0, width=360  → right-mid = (360, SYS_MID_Y=130)
 *   Dev card:    left=DEV_OFFSET_X=100, top=V_GAP=300, width=360
 *                → left-mid = (100, 300 + 120) = (100, 420)
 *
 * SVG viewBox = 500 × (V_GAP + 520)  = 500 × 820
 *
 * Route:
 *   Start  : (360, 130)  — System card right-mid
 *   H      : (420, 130)  — short horizontal jog right
 *   Bezier : curve down-left to (260, 300)
 *   V      : (260, 380)  — short vertical
 *   Bezier : curve down-left to (100, 420)  — Dev card left-mid
 *
 * Full path (smooth S-curve, no sharp corners):
 *   M 360 130  H 420
 *   C 460 130  460 300  260 300
 *   C 160 300  100 360  100 420
 */
const VB_W = 500;
const VB_H = V_GAP + 520;   // 820
const METRO_PATH = `M ${CARD_W} ${SYS_MID_Y} H 420 C 460 ${SYS_MID_Y} 460 ${V_GAP} 260 ${V_GAP} C 160 ${V_GAP} ${DEV_OFFSET_X} ${V_GAP + 90} ${DEV_OFFSET_X} ${V_GAP + 120}`;

const METRO_NODES = [
  { x: 420, y: SYS_MID_Y,           Icon: MapPin,     label: "Depart"   },
  { x: 260, y: V_GAP,               Icon: Bus,        label: "En Route" },
  { x: DEV_OFFSET_X, y: V_GAP + 90, Icon: Navigation, label: "Arrive"   },
];

function MetroLine() {
  return (
    <svg width="100%" height="100%"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMinYMin meet"
      fill="none"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="mlg" x1="0.7" y1="0" x2="0.2" y2="1">
          <stop offset="0%"   stopColor={C.red}    stopOpacity="0.95" />
          <stop offset="50%"  stopColor={C.gold}   stopOpacity="0.9"  />
          <stop offset="100%" stopColor={C.purple} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="mfl" x1="0.7" y1="0" x2="0.2" y2="1">
          <stop offset="0%"   stopColor="#fff"     stopOpacity="0"   />
          <stop offset="42%"  stopColor={C.red}    stopOpacity="1"   />
          <stop offset="55%"  stopColor="#fff"     stopOpacity="1"   />
          <stop offset="100%" stopColor={C.purple} stopOpacity="0"   />
        </linearGradient>
        <filter id="mg">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="msg">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Glow halo */}
      <path d={METRO_PATH} stroke="url(#mlg)" strokeWidth={16} fill="none"
        strokeLinecap="round" strokeLinejoin="round" opacity={0.1} />

      {/* Dashed track */}
      <path d={METRO_PATH} stroke="url(#mlg)" strokeWidth={2} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="11 7" opacity={0.6} filter="url(#mg)" />

      {/* Solid line */}
      <path d={METRO_PATH} stroke="url(#mlg)" strokeWidth={2.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
        opacity={0.9} filter="url(#mg)" />

      {/* Animated particle */}
      <motion.path d={METRO_PATH} stroke="url(#mfl)" strokeWidth={6} fill="none"
        strokeLinecap="round"
        initial={{ pathOffset: 0 }}
        animate={{ pathOffset: [0, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        filter="url(#msg)" opacity={0.95} />

      {/* Station nodes */}
      {METRO_NODES.map(({ x, y }, i) => (
        <g key={i}>
          <motion.circle cx={x} cy={y} r={11} fill="none" stroke={C.red} strokeWidth={1.2}
            animate={{ r: [8, 20], opacity: [0.65, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.65 }} />
          <circle cx={x} cy={y} r={8} fill="#FFF9FA"
            stroke="url(#mlg)" strokeWidth={1.5} filter="url(#mg)" />
          <circle cx={x} cy={y} r={3.5} fill="url(#mlg)" opacity={0.95} />
        </g>
      ))}

      {/* Origin — System card right edge */}
      <circle cx={CARD_W} cy={SYS_MID_Y} r={7} fill={C.red} filter="url(#mg)" />
      <motion.circle cx={CARD_W} cy={SYS_MID_Y} r={7} fill="none"
        stroke={C.red} strokeWidth={1.5}
        animate={{ r: [7, 18], opacity: [0.85, 0] }}
        transition={{ duration: 1.4, repeat: Infinity }} />

      {/* Destination arrowhead — Developer card left edge */}
      <polygon
        points={`${DEV_OFFSET_X - 12},${V_GAP + 113} ${DEV_OFFSET_X},${V_GAP + 120} ${DEV_OFFSET_X - 12},${V_GAP + 127}`}
        fill={C.purple} opacity={0.95} />
      <circle cx={DEV_OFFSET_X} cy={V_GAP + 120} r={7} fill={C.purple} filter="url(#mg)" />
      <motion.circle cx={DEV_OFFSET_X} cy={V_GAP + 120} r={7} fill="none"
        stroke={C.purple} strokeWidth={1.5}
        animate={{ r: [7, 18], opacity: [0.85, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.7 }} />
    </svg>
  );
}
