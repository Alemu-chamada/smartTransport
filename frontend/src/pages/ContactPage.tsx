import { motion } from "motion/react";
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink, MessageSquare, Bus, Navigation } from "lucide-react";
import { LandingNav, LandingFooter } from "./LandingPage";

const C = { red: "#FF4103", navy: "#001621", green: "#21F1A8", gold: "#FFBE0B", purple: "#3C1A47", g2: "#59C749" };

const SYSTEM_ITEMS = [
  { Icon: Globe,  label: "Platform",     value: "Smart Transport Management System", href: undefined },
  { Icon: Mail,   label: "Support Email",value: "smarttransportserv@gmail.com",      href: "mailto:smarttransportserv@gmail.com" },
  { Icon: Phone,  label: "Phone",        value: "+251 96 694 2369.",                 href: "tel:+251 96 694 2369." },
];

const DEV_ITEMS = [
  { Icon: Mail,     label: "Email",    value: "alemuchamada@gmail.com",         href: "mailto:alemuchamada@gmail.com" },
  { Icon: Phone,    label: "Phone",    value: "+251 95 604 7594",               href: "tel:+251956047594" },
  { Icon: Github,   label: "GitHub",   value: "github.com/Alemu-chamada",       href: "https://github.com/Alemu-chamada" },
  { Icon: Linkedin, label: "LinkedIn", value: "Alemu Chamada",                  href: "https://linkedin.com/in/alemu-chamada" },
  { Icon: MapPin,   label: "Education",   value: "Computer science and Engineering · ASTU",        href: "https://www.astu.edu.et/" },
];

export function ContactPage() {
  return (
    <div style={{ backgroundColor: "#FFF9FA" }}>
      <LandingNav active="/contact" />

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: C.red }} />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: C.green }} />
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
      <section className="py-12 pb-28">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">

          {/* ── DESKTOP: vertical composition, slight offset ──────────── */}
          <div className="hidden md:block relative" style={{ minHeight: 780 }}>

            {/* System card — top, left-of-center */}
            <motion.div className="absolute top-0"
              style={{ left: "50%", marginLeft: "-340px", width: "360px" }}
              initial={{ opacity: 0, y: -24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65 }}>
              <SystemCard />
            </motion.div>

            {/* SVG connector — full overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <ConnectorSVG />
            </div>

            {/* Developer card — bottom, right-of-center */}
            <motion.div className="absolute bottom-0"
              style={{ left: "50%", marginLeft: "-20px", width: "360px" }}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.2 }}>
              <DeveloperCard />
            </motion.div>
          </div>

          {/* ── MOBILE: stacked ──────────────────────────────────────── */}
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
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 20px 48px rgba(0,22,33,0.14)` }}
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
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 20px 48px rgba(0,22,33,0.14)` }}
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
                  ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
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

/* ─── ConnectorSVG ───────────────────────────────────────────────────────── */
/*
 * viewBox: 1000 × 780
 *
 * Card positions (container ~full width, cards fixed at px offsets from 50%):
 *   System card : left = 50% - 340px, width = 360px
 *                 → right edge ≈ x = 520  (500 - 340 + 360)
 *                 → mid-height of card ≈ y = 140
 *
 *   Dev card    : left = 50% - 20px,  width = 360px
 *                 → left edge ≈ x = 480  (500 - 20)
 *                 → mid-height from bottom ≈ y = 638
 *
 * Route: start at System card right edge → arc right → drop straight down → arc left → end at Dev card left edge
 * Path: M 520 140 H 620 C 660 140 660 175 660 220 V 560 C 660 605 640 638 600 638 H 480
 */
const CPATH = "M 520 140 H 620 C 660 140 660 175 660 220 V 560 C 660 605 640 638 600 638 H 480";

const CNODES = [
  { x: 660, y: 280, Icon: MapPin,     label: "Station"  },
  { x: 660, y: 390, Icon: Bus,        label: "En Route" },
  { x: 660, y: 500, Icon: Navigation, label: "Arrive"   },
];

function ConnectorSVG() {
  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 1000 780"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <linearGradient id="cg2" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"   stopColor={C.red}    stopOpacity="0.95" />
          <stop offset="50%"  stopColor={C.gold}   stopOpacity="0.9"  />
          <stop offset="100%" stopColor={C.purple} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="cf2" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"   stopColor="#fff"     stopOpacity="0"   />
          <stop offset="40%"  stopColor={C.red}    stopOpacity="1"   />
          <stop offset="55%"  stopColor="#fff"     stopOpacity="1"   />
          <stop offset="100%" stopColor={C.purple} stopOpacity="0"   />
        </linearGradient>
        <filter id="glow2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sglow2" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Wide glow halo */}
      <path d={CPATH} stroke="url(#cg2)" strokeWidth={20} fill="none"
        strokeLinecap="round" strokeLinejoin="round" opacity={0.1} />

      {/* Dashed track */}
      <path d={CPATH} stroke="url(#cg2)" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12 8" opacity={0.55} filter="url(#glow2)" fill="none" />

      {/* Solid bright line */}
      <path d={CPATH} stroke="url(#cg2)" strokeWidth={3}
        strokeLinecap="round" strokeLinejoin="round"
        opacity={0.9} filter="url(#glow2)" fill="none" />

      {/* Animated particle */}
      <motion.path
        d={CPATH} stroke="url(#cf2)" strokeWidth={7}
        strokeLinecap="round" fill="none"
        initial={{ pathOffset: 0 }}
        animate={{ pathOffset: [0, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        filter="url(#sglow2)" opacity={0.95}
      />

      {/* Station nodes */}
      {CNODES.map(({ x, y }, i) => (
        <g key={i}>
          <motion.circle cx={x} cy={y} r={18} fill="none"
            stroke={C.red} strokeWidth={1.5}
            animate={{ r: [11, 26], opacity: [0.65, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, delay: i * 0.65 }} />
          <circle cx={x} cy={y} r={11} fill="#FFF9FA"
            stroke="url(#cg2)" strokeWidth={2} filter="url(#glow2)" />
          <circle cx={x} cy={y} r={4.5} fill="url(#cg2)" opacity={0.95} />
        </g>
      ))}

      {/* Origin dot — right edge of System card */}
      <circle cx={520} cy={140} r={8} fill={C.red} filter="url(#glow2)" />
      <motion.circle cx={520} cy={140} r={8} fill="none"
        stroke={C.red} strokeWidth={2}
        animate={{ r: [8, 22], opacity: [0.85, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }} />

      {/* Destination dot + arrowhead — left edge of Developer card */}
      <polygon points="465,625 480,638 465,651" fill={C.purple} opacity={0.9} />
      <circle cx={480} cy={638} r={8} fill={C.purple} filter="url(#glow2)" />
      <motion.circle cx={480} cy={638} r={8} fill="none"
        stroke={C.purple} strokeWidth={2}
        animate={{ r: [8, 22], opacity: [0.85, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }} />
    </svg>
  );
}

function VerticalConnector() { return null; }
