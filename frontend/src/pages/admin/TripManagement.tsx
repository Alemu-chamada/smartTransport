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
import { Plus, Edit, XCircle, Eye } from "lucide-react";
import { tripApi, type Trip } from "../../features/trip/services";

export function TripManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Create trip form state
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    scheduled_start_time: "",
    total_capacity: 40,
    fare: 0,
    currency: "ETB",
  });

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await tripApi.getScheduledTrips();
        setTrips(data.trips || []);
      } catch (error) {
        console.error("Failed to load trips:", error);
      }
    };
    loadTrips();
  }, []);

  const handleCreateTrip = async () => {
    try {
      setLoading(true);
      await tripApi.createTrip({
        ...formData,
        route_description: `${formData.origin} → ${formData.destination}`,
        avg_speed_kmh: 60,
      });
      setIsCreateModalOpen(false);
      setFormData({
        origin: "",
        destination: "",
        scheduled_start_time: "",
        total_capacity: 40,
        fare: 0,
        currency: "ETB",
      });
      // Refresh the trip list
      const data = await tripApi.getScheduledTrips();
      setTrips(data.trips || []);
    } catch (error) {
      console.error("Failed to create trip:", error);
      alert("Failed to create trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const route = trip.origin + " → " + trip.destination;
    const matchesSearch = route.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || trip.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Trip>[] = [
    {
      key: "route",
      label: "Route",
      render: (trip) => (
        <span className="text-foreground">{trip.origin} → {trip.destination}</span>
      ),
    },
    {
      key: "scheduled_start_time",
      label: "Date & Time",
      render: (trip) => (
        <span className="text-foreground">
          {new Date(trip.scheduled_start_time).toLocaleString()}
        </span>
      ),
    },
    {
      key: "total_capacity",
      label: "Capacity",
      render: (trip) => (
        <span className="text-foreground">{trip.total_capacity} seats</span>
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
      render: (trip) => (
        <div className="flex gap-2">
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-foreground" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4 text-foreground" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Cancel Trip"
          >
            <XCircle className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
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
                Trip Management
              </h1>
              <p className="text-muted-foreground">
                Create and manage transportation trips
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Trip
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FilterPanel>
            <div className="flex-1 min-w-[250px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by route..."
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </FilterPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={filteredTrips}
            emptyMessage="No trips found"
          />
        </motion.div>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Trip"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From"
                placeholder="Addis Ababa"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
              <Input
                label="To"
                placeholder="Dire Dawa"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Departure Time"
                type="datetime-local"
                value={formData.scheduled_start_time}
                onChange={(e) => setFormData({ ...formData, scheduled_start_time: e.target.value })}
              />
              <Input
                label="Capacity"
                type="number"
                placeholder="40"
                value={formData.total_capacity}
                onChange={(e) => setFormData({ ...formData, total_capacity: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price per Seat"
                type="number"
                placeholder="150"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: parseFloat(e.target.value) })}
              />
              <Input
                label="Currency"
                placeholder="ETB"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreateTrip} loading={loading}>
                Create Trip
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
