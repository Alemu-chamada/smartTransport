import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { MainLayout } from "../routes/MainLayout";
import { MetricCard } from "../shared/ui/MetricCard";
import {
  MapPin, Navigation, ShieldCheck, Users, Calendar, CreditCard,
  CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Activity,
  Map, MessageSquare, ChevronRight, ArrowRight, Loader2, Car,
  Plus, FileText, Bus, Zap, Star,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { bookingApi } from "../features/booking/services";
import { userApi } from "../features/user/services";
import { tripApi } from "../features/trip/services";

const greetingByTime = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState("0");
  const [totalDrivers, setTotalDrivers] = useState("0");
  const [trips, setTrips] = useState<any[]>([]);
  const [totalTrips, setTotalTrips] = useState("0");
  const [activeTrips, setActiveTrips] = useState("0");
  const [totalBookings, setTotalBookings] = useState("0");
  const [totalRevenue, setTotalRevenue] = useState("ETB 0");

  // Backend health check
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5002/api/v1";
    fetch(`${backendUrl}/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data?.success === true ? "Online" : "Error"))
      .catch(() => setBackendStatus("Offline"));
  }, []);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        if (!user) return;
        try {
          const bd = await bookingApi.getMyBookings();
          setMyBookings(bd.bookings || []);
          setTotalBookings((bd.bookings?.length ?? 0).toString());
          const rev = bd.bookings?.reduce((s: number, b: any) => s + (b.amount || 0), 0) || 0;
          setTotalRevenue(`ETB ${rev.toLocaleString()}`);
        } catch {}
        try {
          const ud = await userApi.getUsers();
          setTotalUsers((ud.users?.length ?? 0).toString());
          setTotalDrivers((ud.users?.filter((u: any) => u.role === "driver").length ?? 0).toString());
        } catch {}
        try {
          const td = await tripApi.getScheduledTrips();
          setTrips(td.trips || []);
          setTotalTrips((td.trips?.length ?? 0).toString());
          setActiveTrips((td.trips?.filter((t: any) => t.status === "active").length ?? 0).toString());
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const isAdmin = user?.role === "system_admin";
  const isPassenger = user?.role === "passenger";
  const isDriver = user?.role === "driver";
  const firstName = user?.first_name || user?.full_name?.split(" ")[0] || "there";

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: string) => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" });

  const metrics = [
    { label: "Total Users", value: totalUsers, icon: Users, iconColor: "bg-blue-500", trend: { value: "Live", isPositive: true } },
    { label: "Total Drivers", value: totalDrivers, icon: Car, iconColor: "bg-green-500", trend: { value: "Live", isPositive: true } },
    { label: "Total Trips", value: totalTrips, icon: MapPin, iconColor: "bg-violet-500", trend: { value: "Live", isPositive: true } },
    { label: "Active Trips", value: activeTrips, icon: TrendingUp, iconColor: "bg-orange-500", trend: { value: "Live", isPositive: true } },
    { label: "Bookings", value: totalBookings, icon: Calendar, iconColor: "bg-pink-500", trend: { value: "Live", isPositive: true } },
    { label: "Revenue", value: totalRevenue, icon: DollarSign, iconColor: "bg-emerald-500", trend: { value: "Live", isPositive: true } },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">

        {/* ── Welcome Hero ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden relative p-0">
            {/* gradient background */}
            <div
              className="p-8 md:p-10"
              style={{ background: "linear-gradient(145deg, #0f0c2e 0%, #1a1740 50%, #0d1f3c 100%)" }}
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                {/* BYD car background */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/BYD_Han_EV_2022_in_China_license_plate_redacted.jpg/640px-BYD_Han_EV_2022_in_China_license_plate_redacted.jpg"
                  alt="" aria-hidden="true"
                  className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-[0.08] rounded-r-2xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                    {greetingByTime()}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                    Welcome, {firstName}
                  </h1>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium capitalize">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      {user?.role?.replace(/_/g, " ")}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      backendStatus === "Online" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                      "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${backendStatus === "Online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                      System {backendStatus}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                    {isAdmin
                      ? "Your command center is ready. Manage users, trips, buses and monitor operations in real time."
                      : isDriver
                      ? "Ready to drive? View your assigned routes and share your live location with passengers."
                      : "Your journey starts here. Book a seat, track your ride, and explore services near you."}
                  </p>
                </div>

                {/* Quick action buttons */}
                <div className="flex flex-wrap gap-3">
                  {isPassenger && (
                    <>
                      <button onClick={() => navigate("/trips-discovery")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium transition-all hover:bg-primary/90 shadow-lg shadow-primary/25">
                        <MapPin className="h-4 w-4" /> Book a Trip
                      </button>
                      <button onClick={() => navigate("/my-bookings")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/20">
                        <Calendar className="h-4 w-4" /> My Bookings
                      </button>
                    </>
                  )}
                  {isDriver && (
                    <button onClick={() => navigate("/tracking")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium transition-all hover:bg-primary/90">
                      <Navigation className="h-4 w-4" /> Start Tracking
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => navigate("/admin/trips")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium transition-all hover:bg-primary/90 shadow-lg shadow-primary/25">
                        <Plus className="h-4 w-4" /> Create Trip
                      </button>
                      <button onClick={() => navigate("/admin/users")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/20">
                        <Users className="h-4 w-4" /> Manage Users
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Metrics ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {metrics.map((m, i) => <MetricCard key={m.label} {...m} delay={i * 0.08} />)}
        </div>

        {/* ── Passenger features grid ───────────────────────────────── */}
        {isPassenger && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Explore Features</h2>
              <span className="text-sm text-muted-foreground">Everything you need for your journey</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Browse Trips", description: "Find and book your next journey", icon: MapPin, path: "/trips-discovery", color: "bg-violet-500/10 text-violet-600", accent: "border-violet-200" },
                { title: "My Bookings", description: "View and manage your reservations", icon: Calendar, path: "/my-bookings", color: "bg-blue-500/10 text-blue-600", accent: "border-blue-200" },
                { title: "Live Tracking", description: "Track your trip in real time", icon: Navigation, path: "/tracking", color: "bg-emerald-500/10 text-emerald-600", accent: "border-emerald-200" },
                { title: "Nearby Services", description: "Garages and fuel stations near you", icon: Map, path: "/nearby", color: "bg-orange-500/10 text-orange-600", accent: "border-orange-200" },
                { title: "Community", description: "Posts, updates and announcements", icon: MessageSquare, path: "/community", color: "bg-pink-500/10 text-pink-600", accent: "border-pink-200" },
              ].map((f, i) => (
                <motion.button
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(f.path)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border bg-card hover:shadow-md transition-all text-left group ${f.accent}`}
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Driver features ───────────────────────────────────────── */}
        {isDriver && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Live Tracking", description: "Share your GPS location in real time", icon: Navigation, path: "/tracking", color: "bg-emerald-500/10 text-emerald-600" },
                { title: "Community", description: "Posts and announcements", icon: MessageSquare, path: "/community", color: "bg-blue-500/10 text-blue-600" },
              ].map((f, i) => (
                <motion.button
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(f.path)}
                  className="flex items-center gap-4 p-5 rounded-2xl border bg-card hover:shadow-md transition-all text-left group"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Admin features (instead of navigation grid) ───────────── */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Quick Access</h2>
              <span className="text-sm text-muted-foreground">All management tools in one place</span>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: "User Management", description: "Roles & permissions", icon: Users, path: "/admin/users", color: "bg-blue-500/10 text-blue-600" },
                { title: "Bus Management", description: "Fleet & assignments", icon: Bus, path: "/admin/buses", color: "bg-slate-500/10 text-slate-600" },
                { title: "Trip Management", description: "Schedule & routes", icon: MapPin, path: "/admin/trips", color: "bg-violet-500/10 text-violet-600" },
                { title: "Booking Management", description: "Reservations & status", icon: Calendar, path: "/admin/bookings", color: "bg-pink-500/10 text-pink-600" },
                { title: "Payment Management", description: "Transactions & refunds", icon: CreditCard, path: "/admin/payments", color: "bg-emerald-500/10 text-emerald-600" },
                { title: "Tracking Monitor", description: "Real-time fleet view", icon: Activity, path: "/admin/tracking", color: "bg-orange-500/10 text-orange-600" },
                { title: "Audit Logs", description: "System activity trail", icon: FileText, path: "/admin/audit-logs", color: "bg-amber-500/10 text-amber-600" },
                { title: "System Health", description: "DB, Redis & uptime", icon: Zap, path: "/admin/system-health", color: "bg-teal-500/10 text-teal-600" },
              ].map((f, i) => (
                <motion.button
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(f.path)}
                  className="flex items-start gap-3 p-4 rounded-2xl border bg-card hover:shadow-md transition-all text-left group"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                    <f.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Main content grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: summaries */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Trip Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: "Scheduled", value: totalTrips, sub: "Total in system" },
                    { label: "Active Now", value: activeTrips, sub: "Currently running" },
                    { label: isPassenger ? "My Bookings" : "All Bookings", value: totalBookings, sub: "Total bookings" },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                      <p className="text-3xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Platform Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: "Registered Users", value: totalUsers, sub: "All accounts" },
                    { label: "Active Drivers", value: totalDrivers, sub: "Verified drivers" },
                    { label: "Revenue", value: totalRevenue, sub: "From confirmed bookings" },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                      <p className="text-2xl font-bold text-foreground truncate">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right: recent bookings */}
          <div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Recent Bookings</h3>
                  {isPassenger && (
                    <button onClick={() => navigate("/my-bookings")} className="text-xs text-primary hover:underline">
                      View all
                    </button>
                  )}
                </div>
                {myBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No bookings yet</p>
                    <p className="text-xs text-muted-foreground">Your upcoming trips will appear here</p>
                    {isPassenger && (
                      <button onClick={() => navigate("/trips-discovery")}
                        className="mt-3 text-xs text-primary hover:underline font-medium">
                        Browse available trips →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myBookings.slice(0, 5).map((b: any) => (
                      <div key={b.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {b.trip?.origin || "—"} → {b.trip?.destination || "—"}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {b.trip?.scheduled_start_time
                                ? `${formatDate(b.trip.scheduled_start_time)} · ${formatTime(b.trip.scheduled_start_time)}`
                                : "—"}
                            </p>
                          </div>
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                            b.status === "reserved" || b.status === "payment_pending" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {b.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


