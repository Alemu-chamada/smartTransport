import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import { MapPin, Clock, Users, Search, Loader2, ArrowLeftRight, Calendar } from "lucide-react";
import { tripApi, type Trip } from "../features/trip/services";

export function TripDiscovery() {
  const navigate = useNavigate();
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getScheduledTrips();
      // Only show scheduled trips (created by admin)
      if (data?.trips) setTrips(data.trips.filter((t: Trip) => t.status === 'scheduled'));
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getNearbyTrips({ origin: searchFrom, destination: searchTo });
      // Only show scheduled trips (created by admin)
      if (data?.trips) setTrips(data.trips.filter((t: Trip) => t.status === 'scheduled'));
    } catch (error) {
      console.error('Failed to search trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setSearchFrom(searchTo);
    setSearchTo(searchFrom);
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Your Trip</h1>
          <p className="text-muted-foreground">Search and book your next journey</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Search Route</p>
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Origin city or station"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <button
                onClick={handleSwap}
                className="self-center md:self-end mb-0 md:mb-2 flex items-center justify-center h-9 w-9 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex-shrink-0"
                title="Swap origin and destination"
              >
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Destination city or station"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search Trips
            </Button>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Available Trips</h2>
            {!loading && trips.length > 0 && (
              <span className="text-sm text-muted-foreground">{trips.length} trip{trips.length !== 1 ? "s" : ""} found</span>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : trips.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No trips available</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or check back later for available trips.</p>
            </Card>
          ) : (
            trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.07 }}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden" hover>
                  {/* Gradient accent bar */}
                  <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400" />
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        {/* Route with dot indicators */}
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                            <div className="h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-indigo-200" />
                            <div className="w-px h-6 border-l-2 border-dashed border-muted-foreground/40" />
                            <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                          </div>
                          <div className="space-y-2">
                            <p className="font-bold text-foreground text-base leading-tight">{trip.origin}</p>
                            <p className="font-bold text-foreground text-base leading-tight">{trip.destination}</p>
                          </div>
                          {/* Status badge */}
                          <div className="ml-auto flex-shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                              Scheduled
                            </span>
                          </div>
                        </div>

                        {trip.route_description && (
                          <p className="text-sm text-muted-foreground">{trip.route_description}</p>
                        )}

                        {/* Meta chips */}
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">{formatDate(trip.scheduled_start_time)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">{formatTime(trip.scheduled_start_time)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">{trip.total_capacity} seats</span>
                          </div>
                        </div>
                      </div>

                      {/* Fare + CTA */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 lg:gap-3 lg:min-w-[140px]">
                        {trip.fare != null && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-0.5">Fare per seat</p>
                            <p className="text-2xl font-bold text-foreground leading-tight">
                              {trip.currency || "ETB"} {trip.fare.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={(e) => { e.stopPropagation(); navigate(`/trip/${trip.id}`); }}
                          variant="primary"
                          size="md"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
