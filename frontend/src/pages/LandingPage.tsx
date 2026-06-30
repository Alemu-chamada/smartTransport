import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  MapPin, Navigation, ShieldCheck, Users, Settings, ChevronDown, ChevronUp,
  Star, Facebook, Linkedin, Twitter, Mail, Phone, Map, CheckCircle,
  Bus, Zap, Menu, X, ArrowRight, Github,
} from "lucide-react";
import { Logo } from "../shared/ui/Logo";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  bg:      "#FFF9FA",
  navy:    "#001621",
  red:     "#FF4103",
  green:   "#21F1A8",
  gold:    "#FFBE0B",
  lime:    "#B6FF00",
  purple:  "#3C1A47",
  g2:      "#59C749",
  text:    "#171717",
};

/* ─── Reusable nav/footer shared between all landing pages ─────────────── */
export function LandingNav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const links = [["Home","/"],["Features","/features"],["About","/about"],["Contact","/contact"]];
  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ backgroundColor: "rgba(255,249,250,0.92)", borderColor: "rgba(0,22,33,0.08)" }}>
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            {links.map(([label, path]) => (
              <Link key={path} to={path}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ color: path === active ? C.red : C.navy,
                         backgroundColor: path === active ? `${C.red}12` : "transparent" }}>
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/signin" className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors hover:bg-gray-100"
              style={{ color: C.navy }}>Login</Link>
            <Link to="/signup" className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90 shadow-md"
              style={{ backgroundColor: C.red, boxShadow: `0 4px 16px ${C.red}40` }}>Get Started</Link>
          </div>
          <button className="md:hidden p-2 rounded-xl" style={{ color: C.navy }}
            onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t py-3 space-y-1" style={{ borderColor: "rgba(0,22,33,0.08)" }}>
            {links.map(([label, path]) => (
              <Link key={path} to={path} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ color: C.navy }}>{label}</Link>
            ))}
            <div className="flex gap-2 px-2 pt-2">
              <Link to="/signin" className="flex-1 text-center py-2 rounded-xl border text-sm font-semibold"
                style={{ borderColor: "rgba(0,22,33,0.15)", color: C.navy }}>Sign In</Link>
              <Link to="/signup" className="flex-1 text-center py-2 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: C.red }}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

export function LandingFooter() {
  return (
    <footer className="py-16" style={{ backgroundColor: C.navy }}>
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${C.red}, #ff6a35)` }}>
                <span className="text-white font-black text-sm">ST</span>
              </div>
              <div>
                <span className="font-black text-xl text-white">Smart</span>
                <span className="font-black text-xl" style={{ color: C.green }}>Transport</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
              Connecting people, simplifying transportation, and building smarter journeys every day.
            </p>
            <div className="space-y-2">
              {[
                { Icon: Mail,  val: "smarttransportserv@gmail.com", href: "mailto:smarttransportserv@gmail.com" },
                { Icon: Phone, val: "+251 96 694 2369",              href: "tel:+251966942369" },
                { Icon: Map,   val: "Addis Ababa, Ethiopia",         href: undefined },
              ].map(({ Icon, val, href }) => (
                <div key={val} className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                  {href
                    ? <a href={href} className="text-xs hover:text-white transition-colors">{val}</a>
                    : <span className="text-xs">{val}</span>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Navigation</h4>
            <div className="space-y-2.5">
              {[["Home","/"],["Features","/features"],["About","/about"],["Contact","/contact"]].map(([label, path]) => (
                <Link key={path} to={path} className="block text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.55)" }}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Get Started</h4>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Ready to simplify your transportation management?
            </p>
            <Link to="/signup" className="inline-block font-bold px-6 py-3 rounded-xl text-sm text-white transition-all hover:opacity-90"
              style={{ backgroundColor: C.red, boxShadow: `0 4px 16px ${C.red}40` }}>
              Sign Up Free
            </Link>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Developer</h4>
            <div className="space-y-3">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${C.purple}, #5a2a6a)` }}>AC</div>
                <div>
                  <p className="text-sm font-semibold text-white">Alemu Chamada</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Full-Stack Developer</p>
                </div>
              </div>
              {/* Email */}
              <div className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                <a href="mailto:alemuchamada@gmail.com" className="text-xs hover:text-white transition-colors">alemuchamada@gmail.com</a>
              </div>
              {/* Phone */}
              <div className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                <a href="tel:+251956047594" className="text-xs hover:text-white transition-colors">+251 95 604 7594</a>
              </div>
              {/* ASTU — one line, truncate if needed */}
              <div className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Map className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">ASTU · Computer Science and Engineering</span>
              </div>
              {/* Social icons row */}
              <div className="flex gap-2 pt-1">
                {[
                  { Icon: Github,   href: "https://github.com/Alemu-chamada",           label: "GitHub"   },
                  { Icon: Linkedin, href: "https://linkedin.com/in/alemu-chamada",       label: "LinkedIn" },
                  { Icon: Twitter,  href: "https://x.com/Alemu_chamada",                label: "X"        },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.red; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2026 SmartTransport · Built by Alemu Chamada · ASTU
          </p>
          <div className="flex gap-6">
            {["Privacy Policy","Terms of Service"].map(label => (
              <a key={label} href="#" className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.3)" }}>{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── AuthFooter — same branding, no nav/signup, shown on all auth pages ── */
export function AuthFooter() {
  return (
    <footer className="py-12 mt-auto" style={{ backgroundColor: C.navy }}>
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        {/* Two columns: SmartTransport left, Developer pushed right (not to edge) */}
        <div className="flex flex-col md:flex-row md:justify-between gap-12 mb-10">

          {/* ── SmartTransport column ── */}
          <div className="md:max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${C.red}, #ff6a35)` }}>
                <span className="text-white font-black text-sm">ST</span>
              </div>
              <div>
                <span className="font-black text-xl text-white">Smart</span>
                <span className="font-black text-xl" style={{ color: C.green }}>Transport</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
              Connecting people, simplifying transportation, and building smarter journeys every day.
            </p>
            <div className="space-y-2">
              {[
                { Icon: Mail,  val: "smarttransportserv@gmail.com", href: "mailto:smarttransportserv@gmail.com" },
                { Icon: Phone, val: "+251 96 694 2369",              href: "tel:+251966942369" },
                { Icon: Map,   val: "Addis Ababa, Ethiopia",         href: undefined },
              ].map(({ Icon, val, href }) => (
                <div key={val} className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                  {href
                    ? <a href={href} className="text-xs hover:text-white transition-colors whitespace-nowrap">{val}</a>
                    : <span className="text-xs whitespace-nowrap">{val}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Developer column — pushed right, not flush to edge ── */}
          <div className="md:mr-16 lg:mr-24 xl:mr-32 flex-shrink-0">
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Developer</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${C.purple}, #5a2a6a)` }}>AC</div>
                <div>
                  <p className="text-sm font-semibold text-white whitespace-nowrap">Alemu Chamada</p>
                  <p className="text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.4)" }}>Full-Stack Developer</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                <a href="mailto:alemuchamada@gmail.com" className="text-xs hover:text-white transition-colors whitespace-nowrap">alemuchamada@gmail.com</a>
              </div>
              <div className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                <a href="tel:+251956047594" className="text-xs hover:text-white transition-colors whitespace-nowrap">+251 95 604 7594</a>
              </div>
              <div className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Map className="h-4 w-4 flex-shrink-0" style={{ color: C.green }} />
                <span className="text-xs whitespace-nowrap">ASTU · Computer Science and Engineering</span>
              </div>
              <div className="flex gap-2 pt-1">
                {[
                  { Icon: Github,   href: "https://github.com/Alemu-chamada",     label: "GitHub"   },
                  { Icon: Linkedin, href: "https://linkedin.com/in/alemu-chamada", label: "LinkedIn" },
                  { Icon: Twitter,  href: "https://x.com/Alemu_chamada",          label: "X"        },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.red; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright + legal */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2026 SmartTransport · Built by Alemu Chamada · ASTU
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map(label => (
              <a key={label} href="#" className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.3)" }}>{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main LandingPage component ───────────────────────────────────────── */
export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: MapPin,       title: "Trip Booking",        desc: "Discover and book trips instantly",        color: C.red    },
    { icon: Navigation,   title: "Real-Time Tracking",  desc: "Follow vehicle locations live",            color: C.green  },
    { icon: ShieldCheck,  title: "Secure Payments",     desc: "Safe booking and payment experience",      color: C.gold   },
    { icon: Users,        title: "Driver Management",   desc: "Efficient transportation operations",      color: C.purple },
    { icon: Settings,     title: "Smart Administration",desc: "Complete control and monitoring",          color: "#2D3E2C"},
  ];

  const benefits = [
    { emoji: "⚡", title: "Lightning-Fast Booking",  desc: "From search to confirmed seat in under 60 seconds.", accent: C.red   },
    { emoji: "📍", title: "Live GPS Updates",         desc: "Watch your bus move in real time via Socket.IO.",    accent: C.green },
    { emoji: "🔐", title: "Bank-Grade Security",      desc: "JWT auth, bcrypt hashing, OTP on every login.",      accent: C.gold  },
    { emoji: "📱", title: "Works Everywhere",         desc: "Responsive design on phones, tablets, desktops.",    accent: C.purple},
    { emoji: "🧭", title: "Trusted by Operators",     desc: "Full visibility for fleet managers and admins.",     accent: "#2D3E2C"},
    { emoji: "💌", title: "Smart Notifications",      desc: "Real-time email alerts for every key event.",        accent: C.red   },
  ];

  const testimonials = [
    { name: "Sarah Johnson",   role: "Frequent Traveler", review: "SmartTransport has made booking trips so much easier! The real-time tracking feature is a game-changer." },
    { name: "Michael Chen",    role: "Fleet Manager",     review: "Managing our transportation operations has never been more efficient. The admin dashboard is fantastic!" },
    { name: "Emily Rodriguez", role: "Business Owner",    review: "Secure payments and reliable service. Our employees love using SmartTransport for their business trips." },
  ];

  const faqs = [
    {
      q: "How do I book a trip?",
      a: "Create a free account with your email, browse all available scheduled trips on the Trip Discovery page, select your preferred seats on the interactive seat map, and confirm your booking in under a minute. You'll receive an instant confirmation.",
    },
    {
      q: "How does live tracking work?",
      a: "Once your trip departs, open the Tracking page in the app. Our system uses Socket.IO to stream the driver's GPS location to your screen in real time — you can see exactly where your bus is, its speed, and estimated arrival time.",
    },
    {
      q: "Can I cancel my booking?",
      a: "Yes. Go to My Bookings, find the reservation you want to cancel, and tap Cancel. Cancellations are processed instantly and the seat is released for other passengers. Refund eligibility depends on how close the cancellation is to departure.",
    },
    {
      q: "Is payment secure?",
      a: "Absolutely. All payments are processed through our integrated payment gateway using industry-standard TLS encryption. We never store your raw card details — only a secure webhook confirmation reaches our servers.",
    },
    {
      q: "What user roles are available?",
      a: "Smart Transport supports six roles: Passenger (default), Driver, Traffic Authority, Garage Manager, Fuel Station Manager, and System Admin. Admins can promote any user to a specialised role after profile verification.",
    },
  ];

  return (
    <div style={{ backgroundColor: C.bg }}>
      <LandingNav active="/" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: C.red }} />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: C.green }} />
        </div>
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest"
                style={{ backgroundColor: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.red }} />
                Smart Transportation Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span style={{ color: C.navy }}>Smart</span>{" "}
                <span style={{ background: `linear-gradient(135deg, ${C.red}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Transportation
                </span>
                <br />
                <span style={{ color: C.navy }}>Made Simple</span>
              </h1>
              <p className="text-lg leading-relaxed mb-8" style={{ color: "#4b5563" }}>
                Book trips, track vehicles in real time, manage transportation operations, and streamline travel experiences from one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: C.red, boxShadow: `0 8px 24px ${C.red}40` }}>
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/features" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:bg-white"
                  style={{ color: C.navy, border: `2px solid ${C.navy}20`, backgroundColor: "transparent" }}>
                  Learn More
                </Link>
              </div>
            </motion.div>
            {/* Hero card mockup */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <div className="rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: "#fff", border: `1px solid rgba(0,22,33,0.08)` }}>
                <div className="rounded-2xl p-6" style={{ backgroundColor: C.bg }}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${C.red}15` }}>
                      <Navigation className="h-6 w-6" style={{ color: C.red }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.navy }}>SmartTransport · Trip Live</p>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>Addis Ababa → Dire Dawa</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${C.green}20`, color: C.g2, border: `1px solid ${C.green}40` }}>
                      <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.g2 }} /> Live
                    </div>
                  </div>
                  <div className="rounded-xl h-36 flex items-center justify-center mb-4 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.purple})` }}>
                    {/* Animated road lines */}
                    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-4 opacity-20">
                      {[...Array(3)].map((_, i) => (
                        <motion.div key={i} className="h-0.5 rounded-full"
                          style={{ backgroundColor: C.gold }}
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{ duration: 2.2 + i * 0.4, repeat: Infinity, delay: i * 0.6, ease: "linear" }} />
                      ))}
                    </div>
                    {/* Animated bus */}
                    <motion.div
                      animate={{ x: [-32, 32, -32] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-10 flex flex-col items-center">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}>
                        <Bus className="h-10 w-10" style={{ color: C.green }} />
                      </motion.div>
                      <div className="flex gap-1 mt-1">
                        {[C.red, C.gold, C.green].map((c, i) => (
                          <motion.div key={i} className="h-1 w-4 rounded-full"
                            style={{ backgroundColor: c }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
                        ))}
                      </div>
                    </motion.div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-white/70 text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>Seat 14</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                        style={{ backgroundColor: `${C.green}90`, color: C.navy }}>On time</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "#fff" }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: "#6b7280" }}>Journey Progress</span>
                      <span className="text-sm font-black" style={{ color: C.navy }}>45%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f1f5f9" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1.2, delay: 0.5 }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.red}, ${C.gold})` }} />
                    </div>
                    <div className="flex justify-between text-xs mt-1.5" style={{ color: "#9ca3af" }}>
                      <span>Addis Ababa</span><span>Dire Dawa</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: `${C.red}12`, color: C.red }}>Features</span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: C.navy }}>Key Features</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6b7280" }}>Everything you need to manage your transportation efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-8 transition-all cursor-default"
                style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 2px 16px rgba(0,22,33,0.06)" }}>
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${f.color}18` }}>
                  <f.icon className="h-7 w-7" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: C.navy }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/features" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: `${C.red}12`, color: C.red }}>
              View all features <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: `${C.navy}06` }}>
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: C.navy }}>How It Works</h2>
            <p className="text-lg" style={{ color: "#6b7280" }}>Get started in just 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Create an account", desc: "Sign up with your email and get access to the platform", color: C.red },
              { n: "02", title: "Book or manage trips", desc: "Browse available trips or manage your transportation operations", color: C.green },
              { n: "03", title: "Track journeys live", desc: "Follow your trip or monitor your fleet in real time", color: C.gold },
            ].map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }} className="text-center">
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ backgroundColor: s.color }}>
                  <span className="text-white font-black text-2xl">{s.n}</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: C.navy }}>{s.title}</h3>
                <p style={{ color: "#6b7280" }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: `${C.green}18`, color: C.g2 }}>Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: C.navy }}>Built for real journeys</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6b7280" }}>Every feature is designed with the traveler and the operator in mind.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="group relative bg-white rounded-2xl p-6 transition-all cursor-default"
                style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 2px 16px rgba(0,22,33,0.05)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px rgba(0,22,33,0.12)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,22,33,0.05)"; }}>
                <div className="text-3xl mb-4">{b.emoji}</div>
                <h4 className="font-bold text-lg mb-2" style={{ color: C.navy }}>{b.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{b.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: b.accent }}>
                  <CheckCircle className="h-3.5 w-3.5" /> Included in every plan
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: C.bg }}>
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3"
              style={{ backgroundColor: `${C.red}12`, color: C.red }}>Impact</span>
            <h2 className="text-3xl font-black mt-2" style={{ color: "#171717" }}>Numbers that speak for themselves</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {[
              { value: "1,200", suffix: "+", label: "Users Registered",  icon: Users,       color: "#000000ff"    },
              { value: "3,800", suffix: "+", label: "Bookings Made",     icon: ShieldCheck, color: "#000000ff"  },
              { value: "250",   suffix: "+", label: "Trips Scheduled",   icon: Bus,         color: "#000000ff"   },
              { value: "3",     suffix: "s", label: "Avg. Booking Time", icon: Zap,         color: "#000000ff" },
              { value: "100",   suffix: "%", label: "OTP Secured",       icon: ShieldCheck, color: "#000000ff" },
              { value: "6",     suffix: "+", label: "User Roles",        icon: Users,       color: "#000000ff" },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center"
                style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 4px 20px rgba(0,22,33,0.06)" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="h-6 w-6" style={{ color: s.color }} />
                </div>
                <div className="text-4xl font-black mb-1" style={{ color: "#171717" }}>
                  {s.value}<span style={{ color: s.color }}>{s.suffix}</span>
                </div>
                <div className="w-6 h-0.5 mx-auto mb-2 rounded-full" style={{ backgroundColor: s.color }} />
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#171717" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: `${C.gold}20`, color: "#a07800" }}>Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: C.navy }}>What Our Users Say</h2>
            <p className="text-lg" style={{ color: "#6b7280" }}>Real stories from passengers and operators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8"
                style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 4px 20px rgba(0,22,33,0.06)" }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" style={{ color: C.gold }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#4b5563" }}>"{t.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: C.navy }}>{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: C.navy }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: `${C.navy}06` }}>
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: C.navy }}>Frequently Asked Questions</h2>
            <p className="text-lg" style={{ color: "#6b7280" }}>Got questions? We've got answers</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white rounded-2xl overflow-hidden w-full"
                style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 2px 12px rgba(0,22,33,0.05)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-7 py-5 flex items-center justify-between text-left gap-4 transition-colors"
                  style={{ color: C.navy,
                    backgroundColor: openFaq === i ? `${C.red}06` : "transparent" }}>
                  <span className="font-bold text-base flex-1">{faq.q}</span>
                  <div className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: openFaq === i ? C.red : "rgba(0,22,33,0.08)" }}>
                    {openFaq === i
                      ? <ChevronUp className="h-4 w-4 text-white" />
                      : <ChevronDown className="h-4 w-4" style={{ color: "#9ca3af" }} />}
                  </div>
                </button>
                {openFaq === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="px-7 pb-6">
                    <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, ${C.red}30, transparent)` }} />
                    <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
