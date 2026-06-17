import { Link } from "react-router";
import { motion } from "motion/react";
import { UserPlus, Search, CreditCard, Navigation, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up with your email or phone number. Your identity is verified instantly via a one-time password sent directly to you. All new users start as Passengers.",
    color: "bg-blue-500",
  },
  {
    step: "02",
    icon: Search,
    title: "Discover Available Trips",
    description:
      "Browse the full catalogue of scheduled trips — filter by route, departure time, or available seats. See real-time seat counts and fare information.",
    color: "bg-indigo-500",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Book & Pay Securely",
    description:
      "Select your preferred seats and complete payment through our integrated secure payment gateway. Receive an instant booking confirmation and receipt.",
    color: "bg-purple-500",
  },
  {
    step: "04",
    icon: Navigation,
    title: "Track Your Journey Live",
    description:
      "Follow your vehicle on an interactive live map from the moment it departs. Real-time GPS updates keep you informed every step of the way.",
    color: "bg-green-500",
  },
  {
    step: "05",
    icon: ShieldCheck,
    title: "Role Promotion (Optional)",
    description:
      "Drivers, Traffic Authorities, Garage Managers, and Fuel Station Managers can request role promotion. Admins review and approve profile submissions.",
    color: "bg-orange-500",
  },
  {
    step: "06",
    icon: BarChart3,
    title: "Full Operational Control",
    description:
      "System Administrators gain access to the full dashboard — user management, trip scheduling, audit logs, financial reports, and system health monitoring.",
    color: "bg-red-500",
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Smart Transport</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
              <Link to="/about" className="text-primary font-semibold">About</Link>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">How It Works</span>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">From sign-up to journey — in minutes</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Smart Transport is designed around simplicity. Whether you're a passenger booking a trip or an administrator managing an entire fleet, every workflow is clear, fast, and intuitive.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works — vertical timeline */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />

            <div className="space-y-12">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-8 items-start"
                >
                  {/* Icon circle */}
                  <div className={`relative z-10 flex-shrink-0 h-16 w-16 ${s.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <s.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                      <span className="text-3xl font-black text-gray-100 select-none">{s.step}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About the project */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 md:p-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-black text-3xl">T</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About Smart Transport System</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Smart Transport is a web-based Transportation Management System designed to digitize, streamline, and modernize public and private transportation operations.
                The platform supports the full journey lifecycle — from trip scheduling and passenger booking through real-time tracking, payment processing, and post-trip reporting.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Built with a modern React frontend, a Node.js/Express backend, PostgreSQL database, and Socket.IO for real-time communication, the system was designed with scalability, security, and role-based access at its core.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                {[
                  { value: "6", label: "User Roles" },
                  { value: "100%", label: "OTP Secured" },
                  { value: "Live", label: "GPS Tracking" },
                  { value: "Full", label: "Audit Trail" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl font-black text-primary mb-1">{s.value}</div>
                    <div className="text-sm text-gray-500 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Start your journey today</h2>
          <p className="text-gray-600 mb-8">Create a free account and experience seamless transportation management.</p>
          <Link to="/signup" className="bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
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
