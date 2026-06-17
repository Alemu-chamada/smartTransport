import { Link } from "react-router";
import { motion } from "motion/react";
import {
  MapPin, Navigation, ShieldCheck, Users, Settings, Bus,
  CreditCard, Bell, BarChart3, Wrench, Fuel, FileText,
  CheckCircle2, ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Bus,
    title: "Trip Booking",
    description:
      "Passengers can browse available trips, select seats, and complete secure bookings in minutes. Real-time seat availability ensures accurate capacity management.",
    badge: "Core",
    color: "bg-blue-500",
  },
  {
    icon: Navigation,
    title: "Real-Time Vehicle Tracking",
    description:
      "Live GPS tracking lets passengers and administrators monitor vehicle locations and journey progress through an interactive map interface with Socket.IO updates.",
    badge: "Live",
    color: "bg-green-500",
  },
  {
    icon: CreditCard,
    title: "Secure Payment Processing",
    description:
      "Integrated payment gateway handles booking payments with webhook verification, automatic refunds, and full payment audit trails.",
    badge: "Finance",
    color: "bg-purple-500",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    description:
      "Six distinct user roles — Passenger, Driver, Traffic Authority, Garage Manager, Fuel Station Manager, and System Admin — each with precisely scoped permissions.",
    badge: "Security",
    color: "bg-orange-500",
  },
  {
    icon: ShieldCheck,
    title: "OTP Authentication",
    description:
      "Two-factor authentication via email OTP on every login. Brute-force protection, account lockout after failed attempts, and secure JWT session management.",
    badge: "Auth",
    color: "bg-red-500",
  },
  {
    icon: Settings,
    title: "Admin Dashboard",
    description:
      "Complete system oversight: user management, role assignment, booking management, payment tracking, audit logs, and real-time system health monitoring.",
    badge: "Admin",
    color: "bg-gray-700",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated event-driven notifications for booking confirmations, payment receipts, trip start reminders, profile verification updates, and system announcements.",
    badge: "Alerts",
    color: "bg-yellow-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Platform metrics, trip statistics, revenue reports, user growth analytics, and complete audit logs for regulatory compliance and business intelligence.",
    badge: "Insights",
    color: "bg-cyan-500",
  },
  {
    icon: FileText,
    title: "Community Posts",
    description:
      "Traffic authorities and admins can publish posts and announcements. Users can engage with comments, enabling a transparent information-sharing ecosystem.",
    badge: "Community",
    color: "bg-pink-500",
  },
  {
    icon: MapPin,
    title: "Nearby Services",
    description:
      "Integrated service locator shows nearby garages and fuel stations. Garage managers and fuel station managers maintain their service listings in real time.",
    badge: "Services",
    color: "bg-teal-500",
  },
  {
    icon: Wrench,
    title: "Driver & Vehicle Management",
    description:
      "Complete driver onboarding with profile verification workflow, vehicle assignment, license tracking, and operational status management.",
    badge: "Fleet",
    color: "bg-indigo-500",
  },
  {
    icon: Fuel,
    title: "Fuel Station Management",
    description:
      "Dedicated portal for fuel station managers to manage locations, availability, and service information integrated into the main platform.",
    badge: "Infrastructure",
    color: "bg-amber-500",
  },
];

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Smart Transport</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/features" className="text-primary font-semibold">Features</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/signin" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Login</Link>
              <Link to="/signup" className="bg-primary text-white font-medium px-5 py-2 rounded-xl text-sm hover:bg-primary/90 transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Platform Features</span>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Everything you need to manage transportation</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Smart Transport is a comprehensive, role-based transportation management platform built for passengers, drivers, administrators, and supporting services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`h-14 w-14 ${f.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <f.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{f.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-white/80 text-lg mb-8">Create your free account and experience the platform today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-white text-primary font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold">Smart Transport System</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Smart Transport System · Built by Alemu Chamada</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link to="/features" className="hover:text-white">Features</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
