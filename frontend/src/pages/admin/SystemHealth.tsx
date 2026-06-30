import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { Card } from "../../shared/ui/Card";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Server, Database, Wifi, Activity, Loader2, RefreshCw } from "lucide-react";
import { adminApi } from "../../features/admin/services";

export function SystemHealth() {
  const [health, setHealth] = useState<{ database: boolean; redis: boolean } | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      // Check backend reachability via /health
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5002/api/v1";
      try {
        const r = await fetch(`${apiUrl}/health`);
        const json = await r.json();
        setBackendOnline(json?.success === true);
      } catch {
        setBackendOnline(false);
      }

      // Check DB + Redis
      const data = await adminApi.getSystemHealth();
      setHealth(data.health);
      setLastChecked(new Date());
    } catch (err) {
      console.error("Health check failed:", err);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const statusOf = (ok: boolean | null | undefined) =>
    ok === true ? "healthy" : ok === false ? "critical" : "warning";

  const services = [
    {
      name: "API Server",
      icon: Server,
      ok: backendOnline,
      detail: backendOnline === true ? "Responding" : backendOnline === false ? "Unreachable" : "Checking…",
    },
    {
      name: "PostgreSQL Database",
      icon: Database,
      ok: health?.database,
      detail: health?.database === true ? "Connected" : health?.database === false ? "Disconnected" : "Checking…",
    },
    {
      name: "Redis Cache",
      icon: Wifi,
      ok: health?.redis,
      detail: health?.redis === true ? "Connected" : health?.redis === false ? "Disconnected" : "Checking…",
    },
    {
      name: "Socket / Tracking",
      icon: Activity,
      ok: backendOnline, // socket lives on the same server
      detail: backendOnline === true ? "Active" : backendOnline === false ? "Unavailable" : "Checking…",
    },
  ];

  const colorOf = (ok: boolean | null | undefined) =>
    ok === true ? "bg-emerald-500" : ok === false ? "bg-red-500" : "bg-yellow-500";

  const allOk = backendOnline && health?.database && health?.redis;

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">System Health</h1>
              <p className="text-muted-foreground">Infrastructure monitoring and live status</p>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          {lastChecked && (
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {/* Overall banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-semibold ${
            loading
              ? "bg-muted/40 border-border text-muted-foreground"
              : allOk
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${allOk ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />}
            {loading
              ? "Running health checks…"
              : allOk
              ? "All systems operational"
              : "One or more systems need attention"}
          </div>
        </motion.div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            const status = statusOf(svc.ok);
            return (
              <motion.div key={svc.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}>
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${colorOf(svc.ok)} h-11 w-11 rounded-xl flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {loading
                      ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      : <StatusBadge status={status} />}
                  </div>
                  <h3 className="font-bold text-foreground mb-1 text-sm">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground">{loading ? "Checking…" : svc.detail}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Details card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Infrastructure Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Database",
                  value: health?.database === true ? "PostgreSQL — Online" : health?.database === false ? "PostgreSQL — Offline" : "Checking…",
                  ok: health?.database,
                },
                {
                  label: "Cache",
                  value: health?.redis === true ? "Redis (Upstash) — Online" : health?.redis === false ? "Redis — Offline" : "Checking…",
                  ok: health?.redis,
                },
                {
                  label: "API",
                  value: backendOnline === true ? "Railway — Online" : backendOnline === false ? "Railway — Offline" : "Checking…",
                  ok: backendOnline,
                },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-muted/50 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{item.label}</p>
                  <p className={`text-sm font-semibold ${
                    item.ok === true ? "text-emerald-600" : item.ok === false ? "text-red-600" : "text-muted-foreground"
                  }`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
