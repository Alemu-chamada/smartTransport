import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { MapPin, Navigation, User, Loader2 } from "lucide-react";
import { trackingApi } from "../features/tracking/services";
import { tripApi } from "../features/trip/services";

export function Tracking() {
  const [loading, setLoading] = useState(true);
  const [nearbyTrips, setNearbyTrips] = useState<any[]>([]);

  useEffect(() => {
    const loadNearbyTrips = async () => {
      try {
        const data = await tripApi.getNearbyTrips();
        if (data?.trips) {
          setNearbyTrips(data.trips);
        }
      } catch (error) {
        console.error("Failed to load nearby trips:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNearbyTrips();
  }, []);

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
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Live Trip Tracking
          </h1>
          <p className="text-muted-foreground">
            Track active trips in real-time
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
                <div className="h-[500px] bg-gradient-to-br from-muted via-muted/50 to-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Navigation className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Map View
                    </h3>
                    <p className="text-muted-foreground">
                      Active trips will appear here
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">Active Trips</h3>
                {nearbyTrips.length === 0 ? (
                  <p className="text-muted-foreground">No active trips nearby</p>
                ) : (
                  <div className="space-y-4">
                    {nearbyTrips.map((trip) => (
                      <div key={trip.id} className="p-4 bg-muted rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              {trip.origin} → {trip.destination}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(trip.scheduled_start_time).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Status: {trip.status}
                            </p>
                          </div>
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
