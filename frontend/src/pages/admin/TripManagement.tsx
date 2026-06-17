import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Button } from "../../shared/ui/Button";
import { SearchBar } from "../../shared/ui/SearchBar";
import { FilterPanel } from "../../shared/ui/FilterPanel";
import { Modal } from "../../shared/ui/Modal";
import { Input } from "../../shared/ui/Input";
import { Plus, Edit, XCircle, Eye, AlertCircle, Bus, User } from "lucide-react";
import { tripApi, type Trip } from "../../features/trip/services";
import { adminApi, type Bus as BusType, type Driver } from "../../features/admin/services";

export function TripManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bus_id: "",
    driver_id: "",
    origin: "",
    destination: "",
    scheduled_start_time: "",
    total_capacity: 40,
    fare: 0,
    currency: "ETB",
  });

  // Load trips on mount
  useEffect(() => {
    loadTrips();
  }, []);

  // Load buses and drivers when modal opens
  useEffect(() => {
    if (isCreateModalOpen && buses.length === 0) {
      loadBusesAndDrivers();
    }
  }, [isCreateModalOpen]);

  const loadTrips = async () => {
    try {
      const data = await tripApi.getScheduledTrips();
      setTrips(data.trips || []);
    } catch (error) {
      console.error("Failed to load trips:", error);
    }
  };

  const loadBusesAndDrivers = async () => {
    try {
      const [busData, driverData] = await Promise.all([
        adminApi.getBuses(),
        adminApi.getDrivers(),
      ]);
      setBuses(busData.buses || []);
      setDrivers(driverData.drivers || []);
    } catch (error) {
      console.error("Failed to load buses/drivers:", error);
    }
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);

    // Auto-fill capacity from selected bus
    if (field === "bus_id") {
      const bus = buses.find((b) => b.id === value);
      if (bus) {
        setFormData((prev) => ({ ...prev, bus_id: value as string, total_capacity: bus.capacity }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.bus_id) return "Please select a bus.";
    if (!formData.driver_id) return "Please select a driver.";
    if (!formData.origin.trim()) return "Origin is required.";
    if (!formData.destination.trim()) return "Destination is required.";
    if (!formData.scheduled_start_time) return "Departure time is required.";
    if (formData.total_capacity < 1) return "Capacity must be at least 1.";
    if (formData.fare < 0) return "Fare cannot be negative.";
    return null;
  };

  const handleCreateTrip = async () => {
    const error = validateForm();
    if (error) { setFormError(error); return; }

    try {
      setLoading(true);
      setFormError(null);
      await tripApi.createTrip({
        bus_id: formData.bus_id,
        driver_id: formData.driver_id,
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        route_description: `${formData.origin.trim()} → ${formData.destination.trim()}`,
        scheduled_start_time: formData.scheduled_start_time,
        total_capacity: formData.total_capacity,
        fare: formData.fare,
        currency: formData.currency || "ETB",
        avg_speed_kmh: 60,
      });
      setIsCreateModalOpen(false);
      resetForm();
      await loadTrips();
    } catch (error: any) {
      const msg = error.data?.message || error.message || "Failed to create trip. Please try again.";
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bus_id: "",
      driver_id: "",
      origin: "",
      destination: "",
      scheduled_start_time: "",
      total_capacity: 40,
      fare: 0,
      currency: "ETB",
    });
    setFormError(null);
  };

  const filteredTrips = trips.filter((trip) => {
    const route = `${trip.origin} → ${trip.destination}`;
    const matchesSearch = route.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || trip.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Trip>[] = [
    {
      key: "route",
      label: "Route",
      render: (trip) => (
        <span className="font-medium text-foreground">{trip.origin} → {trip.destination}</span>
      ),
    },
    {
      key: "scheduled_start_time",
      label: "Departure",
      render: (trip) => (
        <span className="text-foreground">{new Date(trip.scheduled_start_time).toLocaleString()}</span>
      ),
    },
    {
      key: "total_capacity",
      label: "Seats",
      render: (trip) => <span className="text-foreground">{trip.total_capacity}</span>,
    },
    {
      key: "fare",
      label: "Fare",
      render: (trip) => (
        <span className="text-foreground">{trip.fare} {trip.currency}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (trip) => <StatusBadge status={trip.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye className="h-4 w-4 text-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit">
            <Edit className="h-4 w-4 text-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Cancel">
            <XCircle className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Trip Management</h1>
              <p className="text-muted-foreground">Schedule and manage transportation trips</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Trip
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <FilterPanel>
            <div className="flex-1 min-w-[250px]">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by route..." />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </FilterPanel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <DataTable columns={columns} data={filteredTrips} emptyMessage="No trips found" />
        </motion.div>

        {/* Create Trip Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
          title="Create New Trip"
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Error */}
            {formError && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Bus selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <Bus className="h-4 w-4" /> Bus
              </label>
              {buses.length === 0 ? (
                <div className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">
                  No active buses found. Add buses to the system first.
                </div>
              ) : (
                <select
                  value={formData.bus_id}
                  onChange={(e) => handleFormChange("bus_id", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a bus…</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.plate_number} — {bus.capacity} seats
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Driver selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <User className="h-4 w-4" /> Driver
              </label>
              {drivers.length === 0 ? (
                <div className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">
                  No active drivers found. Assign the driver role to a user first.
                </div>
              ) : (
                <select
                  value={formData.driver_id}
                  onChange={(e) => handleFormChange("driver_id", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a driver…</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.full_name} {driver.phone ? `(${driver.phone})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Origin / Destination */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From (Origin)"
                placeholder="e.g. Addis Ababa"
                value={formData.origin}
                onChange={(e) => handleFormChange("origin", e.target.value)}
              />
              <Input
                label="To (Destination)"
                placeholder="e.g. Dire Dawa"
                value={formData.destination}
                onChange={(e) => handleFormChange("destination", e.target.value)}
              />
            </div>

            {/* Time / Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Departure Time"
                type="datetime-local"
                value={formData.scheduled_start_time}
                onChange={(e) => handleFormChange("scheduled_start_time", e.target.value)}
              />
              <Input
                label="Seat Capacity"
                type="number"
                placeholder="40"
                value={formData.total_capacity}
                onChange={(e) => handleFormChange("total_capacity", parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Fare / Currency */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fare per Seat"
                type="number"
                placeholder="150"
                value={formData.fare}
                onChange={(e) => handleFormChange("fare", parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Currency"
                placeholder="ETB"
                value={formData.currency}
                onChange={(e) => handleFormChange("currency", e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateTrip}
                loading={loading}
                disabled={buses.length === 0 || drivers.length === 0}
              >
                Create Trip
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
