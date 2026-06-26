import { Link } from "react-router";
import { motion } from "motion/react";
import { Mail, Phone, User, Globe, MessageSquare, Github, Linkedin, MapPin } from "lucide-react";
import { Logo } from "../shared/ui/Logo";

const contacts = [
  {
    category: "System",
    subtitle: "Smart Transport Management System",
    icon: Globe,
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    accentColor: "#818cf8",
    items: [
      {
        icon: Globe,
        label: "Platform",
        value: "Smart Transport Management System",
      },
      {
        icon: Mail,
        label: "System Email",
        value: "smarttransportserv@gmail.com",
        href: "mailto:smarttransportserv@gmail.com",
      },
      {
        icon: Phone,
        label: "System Phone",
        value: "+251 99 273 8116",
        href: "tel:+251992738116",
      },
      {
        icon: MapPin,
        label: "Location",
        value: "Addis Ababa Science and Technology University, Addis Ababa, Ethiopia",
      },
    ],
  },
  {
    category: "Developer",
    subtitle: "Alemu Chamada",
    icon: User,
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    accentColor: "#34d399",
    items: [
      {
        icon: User,
        label: "Full Name",
        value: "Alemu Chamada",
      },
      {
        icon: Mail,
        label: "Personal Email",
        value: "alemuchamada@gmail.com",
        href: "mailto:alemuchamada@gmail.com",
      },
      {
        icon: Phone,
        label: "Phone",
        value: "+251 95 604 7594",
        href: "tel:+251956047594",
      },
      {
        icon: Github,
        label: "GitHub",
        value: "github.com/Alemu-chamada",
        href: "https://github.com/Alemu-chamada",
      },
      {
        icon: Linkedin,
        label: "LinkedIn",
        value: "Alemu Chamada",
        href: "https://linkedin.com/in/alemu-chamada",
      },
      {
        icon: MapPin,
        label: "Institution",
        value: "ASTU · Computer Science & Engineering",
      },
    ],
  },
];

export function ContactPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fc" }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderColor: "#e5e7eb" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              {[["Home", "/"], ["Features", "/features"], ["About", "/about"], ["Contact", "/contact"]].map(([label, path]) => (
                <Link key={path} to={path}
                  className="font-medium text-sm transition-colors"
                  style={{ color: path === "/contact" ? "#6366f1" : "#4b5563" }}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/signin" className="text-sm font-medium transition-colors" style={{ color: "#4b5563" }}>Login</Link>
              <Link to="/signup"
                className="text-white text-sm font-semibold px-5 py-2 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20" style={{ background: "linear-gradient(160deg, #0f0a28 0%, #1e1450 55%, #f8f9fc 90%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider"
              style={{ backgroundColor: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">Contact Us</h1>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Have questions about Smart Transport? Want to report an issue or suggest a feature?
              Reach out — we're happy to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contacts.map((group, gi) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: gi * 0.12 }}
                className="rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                {/* Card header */}
                <div className="p-6 relative overflow-hidden" style={{ background: group.gradient }}>
                  {/* Decorative circle */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                    style={{ background: "rgba(255,255,255,0.4)" }} />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
                    style={{ background: "rgba(255,255,255,0.6)" }} />
                  <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                      <group.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{group.category}</h2>
                      <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                        {group.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#f3f4f6" }}>
                        <item.icon className="h-4 w-4" style={{ color: group.accentColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                          style={{ color: "#9ca3af" }}>
                          {item.label}
                        </p>
                        {item.href ? (
                          <a href={item.href}
                            className="text-sm font-medium transition-colors break-all hover:underline"
                            style={{ color: "#111827" }}
                            onMouseEnter={e => (e.currentTarget.style.color = group.accentColor)}
                            onMouseLeave={e => (e.currentTarget.style.color = "#111827")}>
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium" style={{ color: "#111827" }}>
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Email CTA */}
      <section className="py-16" style={{ backgroundColor: "#f1f5f9" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-10 text-center"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, #ede9fe, #ddd6fe)" }}>
              <MessageSquare className="h-8 w-8" style={{ color: "#7c3aed" }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#111827" }}>Send us a message</h2>
            <p className="mb-8 leading-relaxed" style={{ color: "#6b7280" }}>
              For support, feature requests, or general inquiries, email us directly and we'll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:smarttransportserv@gmail.com"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Mail className="h-4 w-4" />
                Email the System
              </a>
              <a href="mailto:alemuchamada@gmail.com"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-colors"
                style={{ border: "2px solid #e5e7eb", color: "#374151", backgroundColor: "transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f9fafb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                <User className="h-4 w-4" />
                Email the Developer
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: "#0f0c1a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-semibold text-white">Smart Transport System</span>
          </div>
          <p className="text-sm" style={{ color: "#4b5563" }}>
            © 2026 Smart Transport System · Built by Alemu Chamada
          </p>
          <div className="flex gap-5 text-sm" style={{ color: "#4b5563" }}>
            {[["Features", "/features"], ["About", "/about"], ["Contact", "/contact"]].map(([label, path]) => (
              <Link key={path} to={path} className="transition-colors hover:text-white">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
