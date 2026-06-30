import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import { Modal } from "../shared/ui/Modal";
import {
  MapPin, Navigation, Loader2, Wrench, Fuel,
  LayoutGrid, CheckCircle2, XCircle, Phone, Plus, Edit,
  Trash2, Hotel, AlertCircle, ExternalLink,
} from "lucide-react";
import { serviceApi, type Service, type ServiceType } from "../features/service/services";
import { useAuth } from "../providers/AuthProvider";

const FILTER_OPTIONS = [
  { value: null, label: "All",            icon: LayoutGrid },
  { value: "garage",       label: "Garages",        icon: Wrench  },
  { value: "fuel_station", label: "Fuel Stations",  icon: Fuel    },
  { value: "hotel",        label: "Hotels",          icon: Hotel   },
];

const getCategoryIcon = (type: string) => {
  if (type === "garage")       return Wrench;
  if (type === "fuel_station") return Fuel;
  if (type === "hotel")        return Hotel;
  return MapPin;
};

const getCategoryColor = (type: string) => {
  if (type === "garage")       return "bg-blue-500";
  if (type === "fuel_station") return "bg-orange-500";
  if (type === "hotel")        return "bg-purple-500";
  return "bg-gray-500";
};

const EMPTY_FORM = {
  name: "", type: "garage" as ServiceType, address: "",
  latitude: "", longitude: "", phone: "", maps_link: "",
  description: "",
};

// Extract lat/lng from a Google Maps link
function extractCoordsFromMapsLink(url: string): { lat: string; lng: string } | null {
  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return { lat: m[1], lng: m[2] };
  }
  return null;
}

export function NearbyServices() {
  const { user } = useAuth();
  const isAdmin = user?.role === "system_admin";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ServiceType | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Admin CRUD state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load services
  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const fn = isAdmin ? serviceApi.getAllServicesAdmin : serviceApi.getAllServices;
      const data = await fn();
      setServices(data?.services ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Detect user location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
        setDetectingLocation(false);
      },
      () => {
        setLocationError("Location permission denied. Distances won't be shown.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Haversine distance in km
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  };

  // Compute distances and sort
  const enrichedServices = services
    .filter((s) => !filter || s.type === filter)
    .map((s) => ({
      ...s,
      computed_distance: userLocation
        ? haversine(userLocation.lat, userLocation.lng, s.latitude, s.longitude)
        : null,
    }))
    .sort((a, b) => {
      if (a.computed_distance == null && b.computed_distance == null) return 0;
      if (a.computed_distance == null) return 1;
      if (b.computed_distance == null) return -1;
      return a.computed_distance - b.computed_distance;
    });

  // Admin form helpers
  const openCreate = () => { setFormData({ ...EMPTY_FORM }); setFormError(null); setIsCreateOpen(true); };
  const openEdit = (svc: Service) => {
    setEditService(svc);
    setFormData({
      name: svc.name, type: svc.type, address: svc.address ?? "",
      latitude: String(svc.latitude), longitude: String(svc.longitude),
      phone: svc.phone ?? "", maps_link: svc.maps_link ?? "",
      description: svc.description ?? "",
    });
    setFormError(null);
  };

  const handleMapsLinkChange = (val: string) => {
    setFormData((p) => ({ ...p, maps_link: val }));
    const coords = extractCoordsFromMapsLink(val);
    if (coords) {
      setFormData((p) => ({ ...p, maps_link: val, latitude: coords.lat, longitude: coords.lng }));
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) { setFormError("Name is required."); return; }
    if (!formData.latitude || !formData.longitude) { setFormError("Latitude and longitude are required. Paste a Google Maps link to auto-fill."); return; }
    setFormLoading(true); setFormError(null);
    try {
      await serviceApi.createService({
        type: formData.type,
        name: formData.name.trim(),
        address: formData.address || undefined,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone: formData.phone || undefined,
        maps_link: formData.maps_link || undefined,
        description: formData.description || undefined,
      });
      setIsCreateOpen(false);
      await loadServices();
    } catch (e: any) {
      setFormError(e.data?.message || e.message || "Failed to create service.");
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editService) return;
    if (!formData.name.trim()) { setFormError("Name is required."); return; }
    setFormLoading(true); setFormError(null);
    try {
      await serviceApi.updateService(editService.id, {
        type: formData.type,
        name: formData.name.trim(),
        address: formData.address || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        phone: formData.phone || undefined,
        maps_link: formData.maps_link || undefined,
        description: formData.description || undefined,
      });
      setEditService(null);
      await loadServices();
    } catch (e: any) {
      setFormError(e.data?.message || e.message || "Failed to update service.");
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try { await serviceApi.deleteService(id); await loadServices(); }
    catch (e) { console.error(e); }
  };

  const ServiceForm = () => (
    <div className="space-y-4">
      {formError && (
        <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {formError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Type *</label>
          <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as ServiceType }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            <option value="garage">Garage</option>
            <option value="fuel_station">Fuel Station</option>
            <option value="hotel">Hotel</option>
          </select>
        </div>
        <Input label="Name *" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Service name" />
      </div>
      <Input label="Address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="Full address" />
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Google Maps Link (auto-extracts coordinates)</label>
        <input value={formData.maps_link} onChange={e => handleMapsLinkChange(e.target.value)}
          placeholder="https://maps.google.com/..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Latitude *" value={formData.latitude} onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))} placeholder="e.g. 9.0192" type="number" />
        <Input label="Longitude *" value={formData.longitude} onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))} placeholder="e.g. 38.7525" type="number" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+251 9xx xxx xxx" />
        <Input label="Description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Short description" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={() => { setIsCreateOpen(false); setEditService(null); }}>Cancel</Button>
        <Button className="flex-1" loading={formLoading} onClick={editService ? handleUpdate : handleCreate}>
          {editService ? "Save Changes" : "Create Service"}
        </Button>
      </div>
    </div>
  );

  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-1">Nearby Services</h1>
              <p className="text-muted-foreground text-sm">
                {userLocation
                  ? "Sorted by distance from your location"
                  : detectingLocation
                  ? "Detecting your location…"
                  : "Garages, fuel stations, and hotels"}
              </p>
            </div>
            {isAdmin && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Service
              </Button>
            )}
          </div>
        </motion.div>

        {/* Location banner */}
        {locationError && (
          <div className="flex items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {locationError}
            </div>
            <Button size="sm" variant="secondary" onClick={detectLocation}>Retry</Button>
          </div>
        )}

        {/* Filter bar */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => {
              const isActive = filter === value;
              return (
                <button key={label} onClick={() => setFilter(value as ServiceType | null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    isActive ? "bg-primary text-white border-primary shadow-sm" : "bg-muted text-foreground border-transparent hover:border-border"
                  }`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Service grid */}
        {enrichedServices.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No services found</h3>
            <p className="text-muted-foreground text-sm">Try a different filter or check back later.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrichedServices.map((service, i) => {
              const Icon = getCategoryIcon(service.type);
              const color = getCategoryColor(service.type);
              return (
                <motion.div key={service.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden" hover>
                    <div className={`h-28 flex items-center justify-center relative ${color}/10`}
                      style={{ background: `linear-gradient(135deg, color-mix(in srgb, white 90%, transparent), white)` }}>
                      {/* Active/Inactive badge */}
                      <div className="absolute top-3 right-3">
                        {service.is_active
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 text-xs font-semibold"><CheckCircle2 className="h-3 w-3" />Active</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-semibold"><XCircle className="h-3 w-3" />Inactive</span>}
                      </div>
                      {/* Distance badge */}
                      {service.computed_distance != null && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 text-foreground border text-xs font-semibold">
                            <Navigation className="h-3 w-3 text-primary" />
                            {service.computed_distance} km
                          </span>
                        </div>
                      )}
                      <div className={`${color} h-14 w-14 rounded-full flex items-center justify-center shadow-md`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="font-bold text-foreground">{service.name}</h3>
                        <span className="text-xs text-muted-foreground capitalize">{service.type.replace("_", " ")}</span>
                      </div>
                      {service.address && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          {service.address}
                        </div>
                      )}
                      {service.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {service.maps_link && (
                          <a href={service.maps_link} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" /> Maps
                          </a>
                        )}
                        {service.phone && (
                          <a href={`tel:${service.phone}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors">
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                        )}
                        {!service.maps_link && !service.phone && (
                          <p className="text-xs text-muted-foreground italic">No contact info</p>
                        )}
                      </div>

                      {/* Admin controls */}
                      {isAdmin && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                          <button onClick={() => openEdit(service)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-muted text-xs font-medium text-foreground transition-colors">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(service.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-red-50 text-xs font-medium text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Service" maxWidth="lg">
          <ServiceForm />
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={!!editService} onClose={() => setEditService(null)} title="Edit Service" maxWidth="lg">
          <ServiceForm />
        </Modal>
      </div>
    </MainLayout>
  );
}
