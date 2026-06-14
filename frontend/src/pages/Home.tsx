import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { MainLayout } from "../routes/MainLayout";
import {
  MapPin,
  Navigation,
  ShieldCheck,
  Users,
  Calendar,
  CreditCard,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  Map,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { bookingApi } from "../features/booking/services";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_API_URL ?? "http://localhost:5002/api/v1";

    fetch(`${backendUrl}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success === true) {
          setBackendStatus("Online");
        } else {
          setBackendStatus(`Error: ${data?.message || "unknown"}`);
        }
      })
      .catch(() => {
        setBackendStatus("Offline");
      });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          const bookingsData = await bookingApi.getMyBookings();
          setMyBookings(bookingsData.bookings || []);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        // Mock data is already handled in the service layer
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Quick actions based on role
  const getQuickActions = () => {
    if (user?.role === "passenger") {
      return [
        { label: "Book a Trip", path: "/trips-discovery", icon: MapPin },
        { label: "My Bookings", path: "/my-bookings", icon: Calendar },
        { label: "Nearby Services", path: "/nearby", icon: Map },
      ];
    }
    if (user?.role === "driver") {
      return [
        { label: "Assigned Trips", path: "/admin", icon: Calendar },
        { label: "Start Trip", path: "/admin/trips", icon: Navigation },
      ];
    }
    // Admin
    return [
      { label: "Dashboard", path: "/admin", icon: Activity },
      { label: "User Management", path: "/admin/users", icon: Users },
      { label: "Trip Management", path: "/admin/trips", icon: Navigation },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: ShieldCheck },
    ];
  };

  const quickActions = getQuickActions();

  // Available features based on role
  const getFeatures = () => {
    if (user?.role === "passenger") {
      return [
        {
          title: "Browse Trips",
          description: "Discover available trips",
          icon: MapPin,
          path: "/trips-discovery",
        },
        {
          title: "My Bookings",
          description: "Manage your bookings",
          icon: Calendar,
          path: "/my-bookings",
        },
        {
          title: "Live Tracking",
          description: "Track your trips in real-time",
          icon: Navigation,
          path: "/tracking",
        },
        {
          title: "Nearby Services",
          description: "Find services around you",
          icon: Map,
          path: "/nearby",
        },
        {
          title: "Community",
          description: "Connect with others",
          icon: MessageSquare,
          path: "/community",
        },
      ];
    }
    if (user?.role === "driver") {
      return [
        {
          title: "Assigned Trips",
          description: "View your assigned trips",
          icon: Calendar,
          path: "/admin",
        },
      ];
    }
    // Admin
    return [
      {
        title: "Dashboard",
        description: "System overview",
        icon: Activity,
        path: "/admin",
      },
      {
        title: "User Management",
        description: "Manage users",
        icon: Users,
        path: "/admin/users",
      },
      {
        title: "Trip Management",
        description: "Manage all trips",
        icon: Navigation,
        path: "/admin/trips",
      },
      {
        title: "Booking Management",
        description: "Manage bookings",
        icon: Calendar,
        path: "/admin/bookings",
      },
      {
        title: "Audit Logs",
        description: "View system logs",
        icon: ShieldCheck,
        path: "/admin/audit-logs",
      },
      {
        title: "System Health",
        description: "Monitor system status",
        icon: TrendingUp,
        path: "/admin/system-health",
      },
    ];
  };

  const features = getFeatures();

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
        {/* Welcome Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {user?.full_name}!
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                  </span>
                </div>
                <p className="text-muted-foreground text-lg">
                  What would you like to do today?
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Backend health status
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {backendStatus}
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  backendStatus === "Online"
                    ? "bg-emerald-500 text-white"
                    : backendStatus === "Offline"
                    ? "bg-rose-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {backendStatus === "Online" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : backendStatus === "Offline" ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </div>
            </div>
          </Card>
        </motion.div>



        {/* Available Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Available Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                className="transition-transform"
              >
                <Card className="p-5" hover>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(feature.path)}
                    >
                      Open
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
