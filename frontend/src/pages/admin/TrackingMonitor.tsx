import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { Card } from "../../shared/ui/Card";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { MapPin, Navigation, Users, Clock } from "lucide-react";

interface ActiveTrip {
  id: string;
  route: string;
  driver: string;
  status: "on-time" | "delayed" | "stopped";
  passengers: number;
  eta: string;
  currentLocation: string;
  progress: number;
}

export function TrackingMonitor() {
  const activeTrips: ActiveTrip[] = [
    {
      id: "1",
      route: "New York → Boston",
      driver: "Michael Johnson",
      status: "on-time",
      passengers: 28,
      eta: "11:30 AM",
      currentLocation: "New Haven, CT",
      progress: 45,
    },
    {
      id: "2",
      route: "Boston → Philadelphia",
      driver: "Sarah Martinez",
      status: "delayed",
      passengers: 32,
      eta: "06:30 PM",
      currentLocation: "Hartford, CT",
      progress: 25,
    },
    {
      id: "3",
      route: "Philadelphia → New York",
      driver: "David Lee",
      status: "on-time",
      passengers: 40,
      eta: "02:15 PM",
      currentLocation: "Trenton, NJ",
      progress: 65,
    },
    {
      id: "4",
      route: "New York → Washington DC",
      driver: "Emma Wilson",
      status: "stopped",
      passengers: 25,
      eta: "10:45 PM",
      currentLocation: "Baltimore, MD",
      progress: 80,
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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Tracking Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring of active trips
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-0 overflow-hidden">
                <div className="h-[600px] bg-gradient-to-br from-muted via-muted/50 to-background flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <path
                        d="M 10 50 Q 30 20, 50 50 T 90 50"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="2,2"
                      />
                      <path
                        d="M 20 30 Q 50 60, 80 30"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="2,2"
                      />
                    </svg>
                  </div>

                  <div className="text-center z-10">
                    <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <MapPin className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Live Map View
                    </h3>
                    <p className="text-muted-foreground">
                      Real-time trip tracking placeholder
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {activeTrips.length} active trips
                    </p>
                  </div>

                  {[
                    { x: "20%", y: "30%" },
                    { x: "45%", y: "50%" },
                    { x: "70%", y: "35%" },
                    { x: "60%", y: "65%" },
                  ].map((pos, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{ left: pos.x, top: pos.y }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      <div className="h-6 w-6 bg-primary rounded-full border-2 border-primary-foreground shadow-lg" />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">
                  Active Trips ({activeTrips.length})
                </h3>
                <div className="space-y-4 max-h-[540px] overflow-y-auto">
                  {activeTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">
                            {trip.route}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Driver: {trip.driver}
                          </p>
                        </div>
                        <StatusBadge status={trip.status} />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">
                            {trip.currentLocation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">
                            {trip.passengers} passengers
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">ETA: {trip.eta}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">
                            {trip.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${trip.progress}%` }}
                          />
                        </div>
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
