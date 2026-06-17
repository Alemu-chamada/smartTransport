import { Link } from "react-router";
import { motion } from "motion/react";
import { Mail, Phone, User, Globe, MessageSquare, Github, Linkedin } from "lucide-react";

const contacts = [
  {
    category: "System",
    icon: Globe,
    color: "bg-primary",
    items: [
      { icon: Globe, label: "System Name", value: "Smart Transport Management System" },
      { icon: Mail, label: "System Email", value: "smarttransportserv@gmail.com", href: "mailto:smarttransportserv@gmail.com" },
    ],
  },
  {
    category: "Developer",
    icon: User,
    color: "bg-indigo-500",
    items: [
      { icon: User, label: "Developer", value: "Alemu Chamada" },
      { icon: Mail, label: "Email", value: "alemuchamada@gmail.com", href: "mailto:alemuchamada@gmail.com" },
      { icon: Phone, label: "Phone", value: "+251 95 604 7594", href: "tel:+251956047594" },
      { icon: Github, label: "GitHub", value: "github.com/Alemu-chamada", href: "https://github.com/Alemu-chamada" },
      { icon: Linkedin, label: "LinkedIn", value: "Alemu Chamada", href: "https://linkedin.com/in/alemu-chamada" },
    ],
  },
];

export function ContactPage() {
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
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">About</Link>
              <Link to="/contact" className="text-primary font-semibold">Contact</Link>
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
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Get In Touch</span>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have questions about Smart Transport? Want to report an issue or suggest a feature? Reach out — we're happy to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contacts.map((group, gi) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: gi * 0.1 }}
                className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className={`${group.color} p-6`}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <group.icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{group.category}</h2>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-5">
                  {group.items.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-gray-900 font-medium hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-gray-900 font-medium">{item.value}</p>
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Send us a message</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              For support, feature requests, or general inquiries, email us directly and we'll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:smarttransportserv@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email the System
              </a>
              <a
                href="mailto:alemuchamada@gmail.com"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4" />
                Email the Developer
              </a>
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
