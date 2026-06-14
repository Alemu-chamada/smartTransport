import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import {
  MapPin,
  Coffee,
  ShoppingBag,
  Utensils,
  Navigation,
  Loader2,
} from "lucide-react";
import { serviceApi, type Service } from "../features/service/services";

export function NearbyServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviceApi.getAllServices();
        if (data?.services) {
          setServices(data.services);
        }
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const getCategoryIcon = (type: string) => {
    const icons: Record<string, any> = {
      garage: ShoppingBag,
      fuel_station: Coffee,
    };
    return icons[type] || Utensils;
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      garage: "bg-blue-500",
      fuel_station: "bg-orange-500",
    };
    return colors[type] || "bg-purple-500";
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

  const filteredServices = filter
    ? services.filter((s) => s.type === filter)
    : services;

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Nearby Services
          </h1>
          <p className="text-muted-foreground">
            Find garages and fuel stations near you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  Services
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter(null)}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  !filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("garage")}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filter === "garage"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Garages
              </button>
              <button
                onClick={() => setFilter("fuel_station")}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filter === "fuel_station"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Fuel Stations
              </button>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No services found
                </h3>
                <p className="text-muted-foreground">
                  Check back later for updates
                </p>
              </Card>
            </motion.div>
          ) : (
            filteredServices.map((service, index) => {
              const Icon = getCategoryIcon(service.type);
              const colorClass = getCategoryColor(service.type);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="overflow-hidden" hover>
                    <div className="h-40 bg-gradient-to-br from-muted via-muted/50 to-background flex items-center justify-center relative overflow-hidden">
                      <div className={`${colorClass} h-16 w-16 rounded-full flex items-center justify-center z-10`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-foreground mb-1">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-foreground">
                              {service.type === "garage"
                                ? "Garage"
                                : "Fuel Station"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {service.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>{service.address}</span>
                        </div>
                      )}
                      <Button variant="secondary" className="w-full" size="sm">
                        <Navigation className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
