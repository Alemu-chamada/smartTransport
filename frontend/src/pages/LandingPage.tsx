import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  MapPin, Navigation, ShieldCheck, Users, Settings, ChevronDown, ChevronUp,
  Star, Facebook, Linkedin, Twitter, Mail, Phone, Map, CheckCircle, Menu, X
} from "lucide-react";
import { Logo } from "../shared/ui/Logo";

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Features</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Contact</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/signin" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Login</Link>
              <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors shadow-sm">Get Started</Link>
            </div>
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
            </button>
          </div>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="md:hidden border-t border-gray-100 py-3 space-y-1">
              {[["Home", "/"], ["Features", "/features"], ["About", "/about"], ["Contact", "/contact"]].map(([label, path]) => (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium">
                  {label}
                </Link>
              ))}
              <div className="flex gap-2 px-4 pt-2 pb-1">
                <Link to="/signin" className="flex-1 text-center py-2 border border-gray-200 rounded-xl text-sm font-medium">Sign In</Link>
                <Link to="/signup" className="flex-1 text-center py-2 bg-primary text-white rounded-xl text-sm font-semibold">Get Started</Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section — clean gradient background */}
      <section className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0"
          style={{ background: "linear-gradient(160deg, #0f0a28 0%, #1e1450 45%, #f8f9fc 90%)" }} />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.18) 0%, transparent 60%)" }} />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "rgba(139,92,246,0.12)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 border border-white/30 rounded-full text-white text-xs font-semibold mb-6">
                <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Smart Transportation Platform
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Smart Transportation <span className="text-indigo-300">Management</span> Made Simple
              </h1>
              <p className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed">
                Book trips, track vehicles in real time, manage transportation operations, and streamline travel experiences from one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl text-center transition-colors shadow-lg shadow-primary/40">
                  Get Started Free
                </Link>
                <Link to="/features" className="bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-xl text-center transition-colors border border-white/30 backdrop-blur-sm">
                  Learn More
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-indigo-50 rounded-3xl p-8 shadow-md">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                      <Navigation className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">SmartTransport · Trip Live</div>
                      <div className="text-xs text-gray-400 mt-0.5">Addis Ababa → Dire Dawa</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden mb-4 relative h-36 sm:h-44 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
                    <div className="text-center">
                      <div className="text-4xl mb-1">🚗</div>
                      <p className="text-white/60 text-xs font-medium">SmartTransport Fleet</p>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-medium">Seat 14</span>
                      <span className="bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-lg font-medium">On time</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Journey Progress</span>
                      <span className="text-sm font-bold text-gray-900">45%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span>Addis Ababa</span><span>Dire Dawa</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to manage your transportation efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Trip Booking", desc: "Discover and book trips easily", color: "bg-violet-500" },
              { icon: Navigation, title: "Real-Time Tracking", desc: "Follow vehicle locations live", color: "bg-blue-500" },
              { icon: ShieldCheck, title: "Secure Payments", desc: "Safe booking and payment experience", color: "bg-emerald-500" },
              { icon: Users, title: "Driver Management", desc: "Efficient transportation operations", color: "bg-orange-500" },
              { icon: Settings, title: "Smart Administration", desc: "Complete control and monitoring", color: "bg-rose-500" },
            ].map((feature, index) => (
              <motion.div key={feature.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className={`h-16 w-16 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/features" className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-6 py-3 rounded-xl transition-colors">
              View all features →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Get started in just 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: 1, title: "Create an account", desc: "Sign up with your email and get access to the platform" },
              { step: 2, title: "Book or manage trips", desc: "Browse available trips or manage your transportation operations" },
              { step: 3, title: "Track journeys in real time", desc: "Follow your trip or monitor your fleet in real time" },
            ].map((item, index) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }} className="text-center">
                <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-2xl">{item.step}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Built for real journeys</h2>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">Every feature is designed with the traveler and the operator in mind.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: "⚡", title: "Lightning-Fast Booking", desc: "From search to confirmed seat in under 60 seconds. No friction, no delays — just results." },
              { emoji: "📍", title: "Live GPS Updates", desc: "Watch your bus move in real time via Socket.IO. Know exactly where your ride is, always." },
              { emoji: "🔐", title: "Bank-Grade Security", desc: "JWT authentication, bcrypt hashing, OTP on every login. Your data is always protected." },
              { emoji: "📱", title: "Works Everywhere", desc: "Responsive design that looks and feels perfect on phones, tablets, and desktops." },
              { emoji: "🧭", title: "Trusted by Operators", desc: "Fleet managers and admins get full visibility — trips, drivers, bookings, and payments." },
              { emoji: "💌", title: "Smart Notifications", desc: "Real-time email alerts for bookings, payments, and system events keep everyone informed." },
            ].map((b, i) => (
              <motion.div key={b.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/3 rounded-bl-full pointer-events-none" />
                <div className="text-4xl mb-4">{b.emoji}</div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">{b.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle className="h-3.5 w-3.5" /> Included in every plan
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Impact</p>
            <h2 className="text-3xl font-bold text-gray-900">Numbers that speak for themselves</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-12 sm:gap-x-20 sm:gap-y-16 max-w-3xl mx-auto">
            {[
              { label: "Trips Available",    value: "Growing",  icon: "🚌" },
              { label: "Active Users",       value: "Growing",  icon: "👥" },
              { label: "Satisfaction Rate",  value: "High",     icon: "⭐" },
            ].map((stat, index) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }} className="text-center">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-2xl font-black text-gray-900 mb-3">{stat.value}</div>
                <div className="w-8 h-0.5 bg-primary mx-auto mb-3 rounded-full" />
                <div className="text-gray-500 font-semibold text-sm uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Real stories from passengers and operators who use Smart Transport every day</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Sarah Johnson", role: "Frequent Traveler", review: "TMS has made booking trips so much easier! The real-time tracking feature is a game-changer." },
              { name: "Michael Chen", role: "Fleet Manager", review: "Managing our transportation operations has never been more efficient. The admin dashboard is fantastic!" },
              { name: "Emily Rodriguez", role: "Business Owner", review: "Secure payments and reliable service. Our employees love using TMS for their business trips." }
            ].map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">{t.name.charAt(0)}</div>
                  <div><div className="font-semibold text-gray-900">{t.name}</div><div className="text-sm text-gray-500">{t.role}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-gray-600">Got questions? We've got answers</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "How do I book a trip?", a: "Simply create an account, browse available trips, and book directly through the platform." },
              { q: "How does live tracking work?", a: "Our real-time GPS tracking allows you to follow your vehicle's location and progress throughout the journey." },
              { q: "Can I cancel bookings?", a: "Yes, you can cancel bookings through your account. Cancellation policies vary by trip type." },
              { q: "Is payment secure?", a: "Absolutely! We use industry-standard encryption and secure payment gateways for all transactions." }
            ].map((faq, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-6 flex items-center justify-between text-left">
                  <span className="font-semibold text-gray-900 text-lg">{faq.q}</span>
                  {openFaq === index ? <ChevronUp className="h-6 w-6 text-primary" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
                </button>
                {openFaq === index && <div className="px-6 pb-6"><p className="text-gray-600">{faq.a}</p></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  <span className="text-white font-black text-sm">ST</span>
                </div>
                <div><span className="font-black text-xl text-white">Smart</span><span className="font-black text-xl text-indigo-300">Transport</span></div>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">Connecting people, simplifying transportation, and building smarter journeys every day.</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-6 w-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="h-6 w-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-6 w-6" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Navigation</h4>
              <div className="space-y-2">
                <Link to="/" className="text-gray-400 hover:text-white block transition-colors">Home</Link>
                <Link to="/features" className="text-gray-400 hover:text-white block transition-colors">Features</Link>
                <Link to="/about" className="text-gray-400 hover:text-white block transition-colors">About</Link>
                <Link to="/contact" className="text-gray-400 hover:text-white block transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <a href="mailto:smarttransportserv@gmail.com" className="hover:text-white transition-colors text-sm break-all">
                    smarttransportserv@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <a href="tel:+251956047594" className="hover:text-white transition-colors text-sm">
                    +251 95 604 7594
                  </a>
                </div>
                <div className="flex items-start gap-3 text-gray-400">
                  <Map className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">
                    Addis Ababa Science and Technology University<br />
                    Addis Ababa, Ethiopia
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Get Started</h4>
              <p className="text-gray-400 mb-4 text-sm">Ready to simplify your transportation management?</p>
              <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-block text-sm">Sign Up Free</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2026 SmartTransport · Built by Alemu Chamada</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
