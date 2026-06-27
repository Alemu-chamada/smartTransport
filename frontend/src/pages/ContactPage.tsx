import { Link } from "react-router";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink, MessageSquare, Bus } from "lucide-react";
import { LandingNav, LandingFooter } from "./LandingPage";

const C = { red: "#FF4103", navy: "#001621", green: "#21F1A8", gold: "#FFBE0B", purple: "#3C1A47", g2: "#59C749" };

const SYSTEM_ITEMS = [
  { Icon: Globe,  label: "Platform",     value: "Smart Transport Management System", href: undefined },
  { Icon: Mail,   label: "Support Email",value: "smarttransportserv@gmail.com",      href: "mailto:smarttransportserv@gmail.com" },
  { Icon: Phone,  label: "Phone",        value: "+251 99 273 8116",                 href: "tel:+251992738116" },
  { Icon: MapPin, label: "Location",     value: "ASTU · Addis Ababa, Ethiopia",     href: undefined },
];

const DEV_ITEMS = [
  { Icon: Mail,     label: "Email",    value: "alemuchamada@gmail.com",         href: "mailto:alemuchamada@gmail.com" },
  { Icon: Phone,    label: "Phone",    value: "+251 95 604 7594",               href: "tel:+251956047594" },
  { Icon: Github,   label: "GitHub",   value: "github.com/Alemu-chamada",       href: "https://github.com/Alemu-chamada" },
  { Icon: Linkedin, label: "LinkedIn", value: "Alemu Chamada",                  href: "https://linkedin.com/in/alemu-chamada" },
  { Icon: MapPin,   label: "Degree",   value: "CS & Engineering · ASTU",        href: undefined },
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
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

      {/* Contact Cards */}
      <section className="py-8 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: side by side. Mobile: stacked. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* System Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
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
                    <h2 className="text-lg font-black" style={{ color: C.navy }}>Smart Transport<br />Management System</h2>
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
                          ? <a href={href} className="text-sm font-semibold transition-colors break-all hover:underline" style={{ color: C.navy }}>{value}</a>
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

            {/* Developer Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
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
                              className="text-sm font-semibold transition-colors break-all inline-flex items-center gap-1 hover:underline"
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
          </div>

          {/* Mobile bus divider (visible only between stacked cards) */}
          <div className="md:hidden flex items-center justify-center gap-3 py-4">
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.red}40)` }} />
            <Bus className="h-5 w-5" style={{ color: C.red }} />
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${C.red}40, transparent)` }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: `${C.navy}06` }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
