import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { Card } from "../../shared/ui/Card";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import {
  Server,
  Database,
  Wifi,
  Layers,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
} from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "healthy" | "warning" | "critical";
  uptime: string;
  lastChecked: string;
  responseTime?: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  icon: any;
  status: "healthy" | "warning" | "critical";
}

export function SystemHealth() {
  const services: ServiceStatus[] = [
    {
      name: "API Server",
      status: "healthy",
      uptime: "99.99%",
      lastChecked: "1 min ago",
      responseTime: "45ms",
    },
    {
      name: "Database",
      status: "healthy",
      uptime: "99.95%",
      lastChecked: "1 min ago",
      responseTime: "12ms",
    },
    {
      name: "WebSocket",
      status: "warning",
      uptime: "98.50%",
      lastChecked: "2 min ago",
      responseTime: "150ms",
    },
    {
      name: "Queue System",
      status: "healthy",
      uptime: "99.80%",
      lastChecked: "1 min ago",
    },
  ];

  const metrics: SystemMetric[] = [
    {
      name: "CPU Usage",
      value: 42,
      unit: "%",
      icon: Cpu,
      status: "healthy",
    },
    {
      name: "Memory",
      value: 68,
      unit: "%",
      icon: MemoryStick,
      status: "warning",
    },
    {
      name: "Disk Space",
      value: 35,
      unit: "%",
      icon: HardDrive,
      status: "healthy",
    },
    {
      name: "Network I/O",
      value: 25,
      unit: "MB/s",
      icon: Activity,
      status: "healthy",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return Server;
      case "warning":
        return Server;
      case "critical":
        return Server;
      default:
        return Server;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            System Health
          </h1>
          <p className="text-muted-foreground">
            Infrastructure monitoring and status
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = getStatusIcon(service.status);
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${getStatusColor(
                        service.status
                      )} h-12 w-12 rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <StatusBadge status={service.status} />
                  </div>

                  <h3 className="font-bold text-foreground mb-3">
                    {service.name}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium text-foreground">
                        {service.uptime}
                      </span>
                    </div>
                    {service.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response</span>
                        <span className="font-medium text-foreground">
                          {service.responseTime}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Checked</span>
                      <span className="text-xs text-muted-foreground">
                        {service.lastChecked}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              System Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.name}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {metric.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Current usage
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {metric.value}
                          <span className="text-sm text-muted-foreground ml-1">
                            {metric.unit}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            metric.unit === "%"
                              ? `${metric.value}%`
                              : `${Math.min((metric.value / 100) * 100, 100)}%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full rounded-full ${
                          metric.status === "healthy"
                            ? "bg-green-500"
                            : metric.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
