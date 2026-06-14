import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import { MapPin, Clock, Users, DollarSign, Search, Navigation, Phone, User, Plus } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";

export function Trip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [activeSection, setActiveSection] = useState("track"); // "find" or "track"

  const trips = [
    {
      id: 1,
      from: "New York",
      to: "Boston",
      departure: "08:00 AM",
      arrival: "12:00 PM",
      price: 45,
      availableSeats: 12,
      duration: "4h",
    },
    {
      id: 2,
      from: "New York",
      to: "Boston",
      departure: "02:00 PM",
      arrival: "06:00 PM",
      price: 50,
      availableSeats: 8,
      duration: "4h",
    },
    {
      id: 3,
      from: "New York",
      to: "Boston",
      departure: "06:00 PM",
      arrival: "10:00 PM",
      price: 40,
      availableSeats: 15,
      duration: "4h",
    },
  ];

  const tripInfo = {
    route: "New York → Boston",
    currentLocation: "New Haven, CT",
    progress: 45,
    eta: "11:30 AM",
    driver: {
      name: "Michael Johnson",
      phone: "+1 (555) 123-4567",
      rating: 4.8,
    },
    stops: [
      { name: "New York", time: "08:00 AM", status: "completed" },
      { name: "Stamford", time: "09:15 AM", status: "completed" },
      { name: "New Haven", time: "10:00 AM", status: "current" },
      { name: "Hartford", time: "10:45 AM", status: "upcoming" },
      { name: "Boston", time: "12:00 PM", status: "upcoming" },
    ],
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-4">
              <Button
                variant={activeSection === "track" ? "primary" : "secondary"}
                onClick={() => setActiveSection("track")}
              >
                Track Trip
              </Button>
              <Button
                variant={activeSection === "find" ? "primary" : "secondary"}
                onClick={() => setActiveSection("find")}
              >
                Find Trip
              </Button>
            </div>
            {user?.role === "system_admin" && (
              <Button onClick={() => navigate("/admin/trips")}>
                <Plus className="h-5 w-5 mr-2" />
                Create Trip
              </Button>
            )}
          </div>
        </motion.div>

        {/* Active Content */}
        {activeSection === "track" && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Track your trip
              </h1>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="p-0 overflow-hidden">
                    <div className="h-[500px] bg-gradient-to-br from-muted via-muted/50 to-background flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <path
                            d="M 10 50 Q 30 20, 50 50 T 90 50"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            fill="none"
                            strokeDasharray="2,2"
                          />
                        </svg>
                      </div>

                      <div className="text-center z-10">
                        <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Navigation className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Live Tracking
                        </h3>
                        <p className="text-muted-foreground">
                          Map view placeholder
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                          Current Location: <span className="font-medium text-foreground">{tripInfo.currentLocation}</span>
                        </p>
                      </div>

                      <motion.div
                        className="absolute"
                        style={{ left: "45%", top: "50%" }}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="h-8 w-8 bg-primary rounded-full border-4 border-primary-foreground shadow-lg" />
                      </motion.div>
                    </div>

                    <div className="p-6 bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-foreground">
                              {tripInfo.progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${tripInfo.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">ETA</p>
                          <p className="font-bold text-foreground">
                            {tripInfo.eta}
                          </p>
                        </div>
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
                    <h3 className="font-bold text-foreground mb-4">Trip Details</h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Route</p>
                          <p className="font-medium text-foreground">
                            {tripInfo.route}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Estimated Arrival
                          </p>
                          <p className="font-medium text-foreground">
                            {tripInfo.eta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="p-6">
                    <h3 className="font-bold text-foreground mb-4">Driver Info</h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {tripInfo.driver.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-muted-foreground">
                              {tripInfo.driver.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-border">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm text-foreground">
                          {tripInfo.driver.phone}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="p-6">
                    <h3 className="font-bold text-foreground mb-4">Stops</h3>

                    <div className="space-y-3">
                      {tripInfo.stops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className={`
                              h-3 w-3 rounded-full
                              ${
                                stop.status === "completed"
                                  ? "bg-green-500"
                                  : stop.status === "current"
                                  ? "bg-primary ring-4 ring-primary/20"
                                  : "bg-muted"
                              }
                            `}
                          />
                          <div className="flex-1">
                            <p
                              className={`
                                text-sm
                                ${
                                  stop.status === "current"
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                                }
                              `}
                            >
                              {stop.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {stop.time}
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
        )}

        {activeSection === "find" && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Find your trip
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="From"
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="To"
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <Search className="h-5 w-5" />
                  Search Trips
                </Button>
              </Card>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Available Trips</h2>
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="p-6" hover>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-bold text-foreground">
                              {trip.from} → {trip.to}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {trip.duration} journey
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {trip.departure} - {trip.arrival}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {trip.availableSeats} seats left
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-5 text-muted-foreground" />
                            <span className="text-foreground font-medium">
                              ${trip.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/trip/${trip.id}`)}
                        variant="primary"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
