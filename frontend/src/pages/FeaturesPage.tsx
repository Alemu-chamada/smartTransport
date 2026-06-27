import { Link } from "react-router";
import { motion } from "motion/react";
import {
  MapPin, Navigation, ShieldCheck, Users, Settings, Bus,
  CreditCard, Bell, BarChart3, Wrench, Fuel, FileText, ArrowRight,
} from "lucide-react";
import { LandingNav, LandingFooter } from "./LandingPage";

const C = { red: "#FF4103", navy: "#001621", green: "#21F1A8", gold: "#FFBE0B",
            purple: "#3C1A47", g2: "#59C749", lime: "#B6FF00" };

const BADGE_COLORS = [C.red, C.green, C.gold, C.purple, "#FD1843", "#2D3E2C",
                      C.gold, "#21F1A8", "#FD1843", "#2D3E2C", C.purple, C.gold];

const features = [
  { icon: Bus,          title: "Trip Booking",                badge: "Core",           color: C.red,    description: "Passengers can browse available trips, select seats, and complete secure bookings in minutes. Real-time seat availability ensures accurate capacity management." },
  { icon: Navigation,   title: "Real-Time Vehicle Tracking",  badge: "Live",           color: C.green,  description: "Live GPS tracking lets passengers and administrators monitor vehicle locations and journey progress through an interactive map interface with Socket.IO updates." },
  { icon: CreditCard,   title: "Secure Payment Processing",   badge: "Finance",        color: C.gold,   description: "Integrated payment gateway handles booking payments with webhook verification, automatic refunds, and full payment audit trails." },
  { icon: Users,        title: "Role-Based Access Control",   badge: "Security",       color: C.purple, description: "Six distinct user roles with precisely scoped permissions — Passenger, Driver, Traffic Authority, Garage Manager, Fuel Station Manager, and System Admin." },
  { icon: ShieldCheck,  title: "OTP Authentication",          badge: "Auth",           color: "#FD1843", description: "Two-factor authentication via email OTP on every login. Brute-force protection, account lockout after failed attempts, and secure JWT session management." },
  { icon: Settings,     title: "Admin Dashboard",             badge: "Admin",          color: "#2D3E2C", description: "Complete system oversight: user management, role assignment, booking management, payment tracking, audit logs, and real-time system health monitoring." },
  { icon: Bell,         title: "Smart Notifications",         badge: "Alerts",         color: C.gold,   description: "Automated event-driven notifications for booking confirmations, payment receipts, trip start reminders, profile verification updates, and system announcements." },
  { icon: BarChart3,    title: "Analytics & Reporting",       badge: "Insights",       color: C.green,  description: "Platform metrics, trip statistics, revenue reports, user growth analytics, and complete audit logs for regulatory compliance and business intelligence." },
  { icon: FileText,     title: "Community Posts",             badge: "Community",      color: "#FD1843", description: "Traffic authorities and admins can publish posts and announcements. Users can engage with comments, enabling a transparent information-sharing ecosystem." },
  { icon: MapPin,       title: "Nearby Services",             badge: "Services",       color: "#2D3E2C", description: "Integrated service locator shows nearby garages and fuel stations. Garage managers and fuel station managers maintain their service listings in real time." },
  { icon: Wrench,       title: "Driver & Vehicle Management", badge: "Fleet",          color: C.purple, description: "Complete driver onboarding with profile verification workflow, vehicle assignment, license tracking, and operational status management." },
  { icon: Fuel,         title: "Fuel Station Management",     badge: "Infrastructure", color: C.gold,   description: "Dedicated portal for fuel station managers to manage locations, availability, and service information integrated into the main platform." },
];

export function FeaturesPage() {
  return (
    <div style={{ backgroundColor: "#FFF9FA" }}>
      <LandingNav active="/features" />

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: C.red }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: `${C.red}12`, color: C.red }}>Platform Features</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight" style={{ color: C.navy }}>
              Everything you need to{" "}
              <span style={{ background: `linear-gradient(135deg, ${C.red}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                manage transportation
              </span>
            </h1>
            <p className="text-xl leading-relaxed" style={{ color: "#6b7280" }}>
              Smart Transport is a comprehensive, role-based platform built for passengers, drivers, administrators, and supporting services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }} whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-7 transition-all cursor-default"
                style={{ border: "1px solid rgba(0,22,33,0.07)", boxShadow: "0 2px 16px rgba(0,22,33,0.05)" }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="h-13 w-13 rounded-2xl flex items-center justify-center p-3"
                    style={{ backgroundColor: `${f.color}16` }}>
                    <f.icon className="h-6 w-6" style={{ color: f.color }} />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${f.color}12`, color: f.color }}>{f.badge}</span>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: C.navy }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ backgroundColor: C.navy }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: C.red }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white mb-4">Ready to get started?</h2>
              <p className="mb-8 text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>Create your free account and experience the platform today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: C.red, color: "#fff", boxShadow: `0 8px 24px ${C.red}50` }}>
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:bg-white/10"
                  style={{ border: "2px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}>
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
