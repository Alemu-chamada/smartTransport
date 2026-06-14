import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  Bus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { tripApi, type Trip } from "../features/trip/services";

export function TripDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTrip(id);
    }
  }, [id]);

  const loadTrip = async (tripId: string) => {
    try {
      setLoading(true);
      const data = await tripApi.getTripById(tripId);
      if (data?.trip) {
        setTrip(data.trip);
      }
    } catch (error) {
      console.error("Failed to load trip:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!trip) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-foreground mb-2">Trip not found</h2>
          <Button onClick={() => navigate("/trips-discovery")}>Back to trips</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/trips-discovery")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to trips
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Trip Details
          </h1>
          <p className="text-muted-foreground">Review your trip information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      {trip.origin} → {trip.destination}
                    </h2>
                  </div>
                  <p className="text-muted-foreground ml-9">{trip.route_description}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">{formatDate(trip.scheduled_start_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Departure Time</p>
                      <p className="font-medium text-foreground">{formatTime(trip.scheduled_start_time)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <Bus className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bus ID</p>
                      <p className="font-medium text-foreground">{trip.bus_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Capacity</p>
                      <p className="font-medium text-foreground">
                        {trip.total_capacity} seats
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate(`/trip/${id}/seats`)}
          >
            Select Seat
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
