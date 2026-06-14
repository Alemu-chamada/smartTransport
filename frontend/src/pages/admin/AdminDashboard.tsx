import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { MetricCard } from "../../shared/ui/MetricCard";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import {
  Users,
  Car,
  MapPin,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  Settings,
  FileText,
  Activity,
  ShieldCheck,
  CreditCard,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { userApi } from "../../features/user/services";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState("0");
  const [totalDrivers, setTotalDrivers] = useState("0");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userApi.getUsers();
        setUsers(data.users);
        setTotalUsers(data.users.length.toString());
        setTotalDrivers(data.users.filter(u => u.role === "driver").length.toString());
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const metrics = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      iconColor: "bg-blue-500",
      trend: { value: "Updated live", isPositive: true },
    },
    {
      label: "Total Drivers",
      value: totalDrivers,
      icon: Car,
      iconColor: "bg-green-500",
      trend: { value: "Updated live", isPositive: true },
    },
    {
      label: "Total Trips",
      value: "1,234",
      icon: MapPin,
      iconColor: "bg-purple-500",
      trend: { value: "15% from last month", isPositive: true },
    },
    {
      label: "Active Trips",
      value: "45",
      icon: TrendingUp,
      iconColor: "bg-orange-500",
      trend: { value: "3% from last hour", isPositive: false },
    },
    {
      label: "Total Bookings",
      value: "2,890",
      icon: Calendar,
      iconColor: "bg-pink-500",
      trend: { value: "20% from last month", isPositive: true },
    },
    {
      label: "Revenue",
      value: "$124,580",
      icon: DollarSign,
      iconColor: "bg-emerald-500",
      trend: { value: "18% from last month", isPositive: true },
    },
  ];

  const adminLinks = [
    { label: "User Management", icon: Users, path: "/admin/users" },
    { label: "Trip Management", icon: MapPin, path: "/admin/trips" },
    { label: "Booking Management", icon: Calendar, path: "/admin/bookings" },
    { label: "Payment Management", icon: CreditCard, path: "/admin/payments" },
    { label: "Tracking Monitor", icon: TrendingUp, path: "/admin/tracking" },
    { label: "Audit Logs", icon: FileText, path: "/admin/audit-logs" },
    { label: "System Health", icon: Activity, path: "/admin/system-health" },
  ];

  const quickActions = [
    { label: "Create Trip", icon: Plus, path: "/admin/trips/create" },
    { label: "Manage Users", icon: Users, path: "/admin/users" },
    { label: "Audit Logs", icon: FileText, path: "/admin/audit-logs" },
    { label: "System Health", icon: Activity, path: "/admin/system-health" },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New user registration",
      user: "John Doe",
      time: "5 mins ago",
    },
    {
      id: 2,
      action: "Trip created",
      user: "Admin User",
      time: "15 mins ago",
    },
    {
      id: 3,
      action: "Booking confirmed",
      user: "Sarah Wilson",
      time: "30 mins ago",
    },
    {
      id: 4,
      action: "Payment received",
      user: "Mike Chen",
      time: "1 hour ago",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage your transportation system
              </p>
            </div>
            <Button onClick={() => navigate("/admin/settings")}>
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Admin Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.label} {...metric} delay={index * 0.1} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Revenue Overview
                </h2>
                <div className="h-64 bg-gradient-to-br from-muted/50 to-background rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Chart visualization placeholder
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Revenue trend for the last 6 months
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Booking Trends
                </h2>
                <div className="h-64 bg-gradient-to-br from-muted/50 to-background rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Chart visualization placeholder
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Booking volume over time
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-foreground">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
