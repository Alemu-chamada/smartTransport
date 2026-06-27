import { Link } from "react-router";
import { motion } from "motion/react";
import { UserPlus, Search, CreditCard, Navigation, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { LandingNav, LandingFooter } from "./LandingPage";

const C = { red: "#FF4103", navy: "#001621", green: "#21F1A8", gold: "#FFBE0B", purple: "#3C1A47" };

const steps = [
  { step:"01", icon: UserPlus,   title: "Create Your Account",        color: C.red,    description: "Sign up with your email or phone number. Your identity is verified instantly via a one-time password sent directly to you. All new users start as Passengers." },
  { step:"02", icon: Search,     title: "Discover Available Trips",   color: C.green,  description: "Browse the full catalogue of scheduled trips — filter by route, departure time, or available seats. See real-time seat counts and fare information." },
  { step:"03", icon: CreditCard, title: "Book & Pay Securely",        color: C.gold,   description: "Select your preferred seats and complete payment through our integrated secure payment gateway. Receive an instant booking confirmation and receipt." },
  { step:"04", icon: Navigation, title: "Track Your Journey Live",    color: C.purple, description: "Follow your vehicle on an interactive live map from the moment it departs. Real-time GPS updates keep you informed every step of the way." },
  { step:"05", icon: ShieldCheck,title: "Role Promotion (Optional)",  color: "#FD1843", description: "Drivers, Traffic Authorities, Garage Managers, and Fuel Station Managers can request role promotion. Admins review and approve profile submissions." },
  { step:"06", icon: BarChart3,  title: "Full Operational Control",   color: "#2D3E2C", description: "System Administrators gain access to the full dashboard — user management, trip scheduling, audit logs, financial reports, and system health monitoring." },
];

export function AboutPage() {
  return (
    <div style={{ backgroundColor: "#FFF9FA" }}>
      <LandingNav active="/about" />

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: C.green }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: `${C.red}12`, color: C.red }}>How It Works</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight" style={{ color: C.navy }}>
              From sign-up to journey —{" "}
              <span style={{ background: `linear-gradient(135deg, ${C.red}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                in minutes
              </span>
            </h1>
            <p className="text-xl leading-relaxed" style={{ color: "#6b7280" }}>
              Smart Transport is designed around simplicity. Whether you're a passenger booking a trip or an administrator managing an entire fleet, every workflow is clear, fast, and intuitive.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 hidden md:block"
              style={{ background: `linear-gradient(to bottom, ${C.red}, ${C.gold}, ${C.green})` }} />
            <div className="space-y-10">
              {steps.map((s, i) => (
                <motion.div key={s.step}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-6 items-start">
                  <div className="relative z-10 flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: s.color }}>
                    <s.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-7"
                    style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 2px 16px rgba(0,22,33,0.05)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold" style={{ color: C.navy }}>{s.title}</h3>
                      <span className="text-3xl font-black select-none" style={{ color: "rgba(0,22,33,0.06)" }}>{s.step}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About card */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-3xl p-10 md:p-16 text-center"
            style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 8px 40px rgba(0,22,33,0.08)" }}>
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.purple})` }}>
              <span className="text-white font-black text-3xl">ST</span>
            </div>
            <h2 className="text-3xl font-black mb-5" style={{ color: C.navy }}>About Smart Transport System</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: "#6b7280" }}>
              Smart Transport is a web-based Transportation Management System designed to digitize, streamline, and modernize public and private transportation operations. The platform supports the full journey lifecycle — from trip scheduling and passenger booking through real-time tracking, payment processing, and post-trip reporting.
            </p>
            <p className="leading-relaxed mb-10" style={{ color: "#9ca3af" }}>
              Built with a modern React frontend, a Node.js/Express backend, PostgreSQL database, and Socket.IO for real-time communication, the system was designed with scalability, security, and role-based access at its core.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "6",     label: "User Roles",   color: C.red    },
                { value: "100%",  label: "OTP Secured",  color: C.green  },
                { value: "Live",  label: "GPS Tracking", color: C.gold   },
                { value: "Full",  label: "Audit Trail",  color: C.purple },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-sm font-semibold" style={{ color: "#9ca3af" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4" style={{ color: C.navy }}>Start your journey today</h2>
          <p className="mb-8" style={{ color: "#6b7280" }}>Create a free account and experience seamless transportation management.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: C.red, boxShadow: `0 8px 24px ${C.red}40` }}>
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
