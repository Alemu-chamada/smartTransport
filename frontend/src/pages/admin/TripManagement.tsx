import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Button } from "../../shared/ui/Button";
import { SearchBar } from "../../shared/ui/SearchBar";
import { FilterPanel } from "../../shared/ui/FilterPanel";
import { Modal } from "../../shared/ui/Modal";
import { Input } from "../../shared/ui/Input";
import {
  Plus, Edit, Trash2, AlertCircle, Bus, User,
  CheckCircle2, XCircle,
} from "lucide-react";
import { tripApi, type Trip } from "../../features/trip/services";
import { adminApi, type Bus as BusType, type Driver } from "../../features/admin/services";

/* ── Toast helper ──────────────────────────────────────────────────────── */
function Toast({
  message, type, onClose,
}: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold"
        style={{
          backgroundColor: type === "success" ? "#001621" : "#FD1843",
          color: "#fff",
        }}
      >
        {type === "success"
          ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          : <XCircle className="h-4 w-4 flex-shrink-0" />}
        {message}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Empty form defaults ───────────────────────────────────────────────── */
const EMPTY_FORM = {
  bus_id: "", driver_id: "", origin: "", destination: "",
  scheduled_start_time: "", total_capacity: 40, fare: 0, currency: "ETB",
};

type FormData = typeof EMPTY_FORM;

/* ── Trip form — defined OUTSIDE TripManagement so it never remounts ── */
interface TripFormProps {
  formData: FormData;
  formError: string | null;
  buses: BusType[];
  drivers: Driver[];
  onChange: (field: keyof FormData, value: string | number) => void;
}

function TripForm({ formData, formError, buses, drivers, onChange }: TripFormProps) {
  return (
    <div className="space-y-4">
      {formError && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      {/* Bus */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Bus className="h-4 w-4" /> Bus <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        {buses.length === 0
          ? <p className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">No buses found — trip can be created without one.</p>
          : <select value={formData.bus_id}
              onChange={e => onChange("bus_id", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select a bus… (optional)</option>
              {buses.map(b => <option key={b.id} value={b.id}>{b.plate_number} — {b.capacity} seats</option>)}
            </select>}
      </div>
      {/* Driver */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <User className="h-4 w-4" /> Driver *
        </label>
        {drivers.length === 0
          ? <p className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">No drivers found. Assign the driver role to a user first.</p>
          : <select value={formData.driver_id}
              onChange={e => onChange("driver_id", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select a driver *</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}{d.phone ? ` (${d.phone})` : ""}</option>)}
            </select>}
      </div>
      {/* Origin / Destination */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="From (Origin) *" placeholder="e.g. Addis Ababa"
          value={formData.origin} onChange={e => onChange("origin", e.target.value)} />
        <Input label="To (Destination) *" placeholder="e.g. Dire Dawa"
          value={formData.destination} onChange={e => onChange("destination", e.target.value)} />
      </div>
      {/* Time / Capacity */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Departure Time *" type="datetime-local"
          value={formData.scheduled_start_time}
          onChange={e => onChange("scheduled_start_time", e.target.value)} />
        <Input label="Seat Capacity *" type="number" placeholder="40"
          value={formData.total_capacity}
          onChange={e => onChange("total_capacity", parseInt(e.target.value) || 0)} />
      </div>
      {/* Fare / Currency */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Fare per Seat" type="number" placeholder="150"
          value={formData.fare}
          onChange={e => onChange("fare", parseFloat(e.target.value) || 0)} />
        <Input label="Currency" placeholder="ETB"
          value={formData.currency}
          onChange={e => onChange("currency", e.target.value)} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
export function TripManagement() {
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [trips, setTrips]                 = useState<Trip[]>([]);
  const [buses, setBuses]                 = useState<BusType[]>([]);
  const [drivers, setDrivers]             = useState<Driver[]>([]);

  const [isCreateOpen, setIsCreateOpen]   = useState(false);
  const [editTrip, setEditTrip]           = useState<Trip | null>(null);
  const [deleteTrip, setDeleteTrip]       = useState<Trip | null>(null);

  const [formData, setFormData]           = useState<FormData>({ ...EMPTY_FORM });
  const [formError, setFormError]         = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  /* ── Load data ─────────────────────────────────────────────────────── */
  const loadTrips = useCallback(async () => {
    try {
      const data = await tripApi.getScheduledTrips({ all: true });
      setTrips(data.trips || []);
    } catch (err) { console.error(err); }
  }, []);

  const loadBusesDrivers = useCallback(async () => {
    if (buses.length && drivers.length) return;
    try {
      const [bd, dd] = await Promise.all([adminApi.getBuses(), adminApi.getDrivers()]);
      setBuses(bd.buses || []);
      setDrivers(dd.drivers || []);
    } catch (err) { console.error(err); }
  }, [buses.length, drivers.length]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  /* ── Open create modal ─────────────────────────────────────────────── */
  const openCreate = () => {
    setFormData({ ...EMPTY_FORM });
    setFormError(null);
    setIsCreateOpen(true);
    loadBusesDrivers();
  };

  /* ── Open edit modal ───────────────────────────────────────────────── */
  const openEdit = (trip: Trip) => {
    setEditTrip(trip);
    setFormData({
      bus_id:               (trip as any).bus_id      ?? "",
      driver_id:            (trip as any).driver_id   ?? "",
      origin:               trip.origin,
      destination:          trip.destination,
      scheduled_start_time: trip.scheduled_start_time
        ? new Date(trip.scheduled_start_time).toISOString().slice(0, 16)
        : "",
      total_capacity:       trip.total_capacity,
      fare:                 trip.fare ?? 0,
      currency:             trip.currency || "ETB",
    });
    setFormError(null);
    loadBusesDrivers();
  };

  /* ── Form change ───────────────────────────────────────────────────── */
  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === "bus_id") {
        const bus = buses.find(b => b.id === value);
        if (bus) next.total_capacity = bus.capacity;
      }
      return next;
    });
    setFormError(null);
  };

  /* ── Validate ──────────────────────────────────────────────────────── */
  const validate = (): string | null => {
    if (!formData.driver_id)            return "Driver is required.";
    if (!formData.origin.trim())        return "Origin is required.";
    if (!formData.destination.trim())   return "Destination is required.";
    if (!formData.scheduled_start_time) return "Departure time is required.";
    if (formData.total_capacity < 1)    return "Capacity must be at least 1.";
    if (formData.fare < 0)              return "Fare cannot be negative.";
    return null;
  };

  /* ── Create ────────────────────────────────────────────────────────── */
  const handleCreate = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setLoading(true); setFormError(null);
    try {
      await tripApi.createTrip({
        bus_id:              formData.bus_id || undefined,
        driver_id:           formData.driver_id,
        origin:              formData.origin.trim(),
        destination:         formData.destination.trim(),
        route_description:   `${formData.origin.trim()} → ${formData.destination.trim()}`,
        scheduled_start_time: formData.scheduled_start_time,
        total_capacity:      formData.total_capacity,
        fare:                formData.fare,
        currency:            formData.currency || "ETB",
        avg_speed_kmh:       60,
      });
      setIsCreateOpen(false);
      await loadTrips();
      showToast("Trip created successfully!", "success");
    } catch (e: any) {
      setFormError(e.data?.message || e.message || "Failed to create trip.");
    } finally { setLoading(false); }
  };

  /* ── Update ────────────────────────────────────────────────────────── */
  const handleUpdate = async () => {
    if (!editTrip) return;
    const err = validate();
    if (err) { setFormError(err); return; }
    setLoading(true); setFormError(null);
    try {
      await tripApi.updateTrip(editTrip.id, {
        origin:              formData.origin.trim(),
        destination:         formData.destination.trim(),
        scheduled_start_time: formData.scheduled_start_time,
        total_capacity:      formData.total_capacity,
        fare:                formData.fare,
        currency:            formData.currency || "ETB",
        driver_id:           formData.driver_id || undefined,
        bus_id:              formData.bus_id || undefined,
      });
      setEditTrip(null);
      await loadTrips();
      showToast("Trip updated successfully!", "success");
    } catch (e: any) {
      setFormError(e.data?.message || e.message || "Failed to update trip.");
    } finally { setLoading(false); }
  };

  /* ── Delete ────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTrip) return;
    setDeleteLoading(true);
    try {
      await tripApi.deleteTrip(deleteTrip.id);
      setDeleteTrip(null);
      await loadTrips();
      showToast("Trip deleted successfully.", "success");
    } catch (e: any) {
      showToast(e.data?.message || "Failed to delete trip.", "error");
      setDeleteTrip(null);
    } finally { setDeleteLoading(false); }
  };

  /* ── Table columns ─────────────────────────────────────────────────── */
  const columns: Column<Trip>[] = [
    {
      key: "route", label: "Route",
      render: (trip) => (
        <span className="font-medium text-foreground">{trip.origin} → {trip.destination}</span>
      ),
    },
    {
      key: "scheduled_start_time", label: "Departure",
      render: (trip) => (
        <span className="text-foreground">{new Date(trip.scheduled_start_time).toLocaleString()}</span>
      ),
    },
    {
      key: "total_capacity", label: "Seats",
      render: (trip) => <span className="text-foreground">{trip.total_capacity}</span>,
    },
    {
      key: "fare", label: "Fare",
      render: (trip) => <span className="text-foreground">{trip.fare} {trip.currency}</span>,
    },
    {
      key: "status", label: "Status",
      render: (trip) => <StatusBadge status={trip.status} />,
    },
    {
      key: "actions", label: "Actions",
      render: (trip) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(trip)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit trip"
          >
            <Edit className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={() => setDeleteTrip(trip)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete trip"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const filteredTrips = trips.filter(trip => {
    const route = `${trip.origin} → ${trip.destination}`;
    const matchesSearch = route.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || trip.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Trip Management</h1>
              <p className="text-muted-foreground">Schedule and manage transportation trips</p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-5 w-5 mr-2" /> Create Trip
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
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
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

        {/* ── Create Trip Modal ─────────────────────────────────────── */}
        <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setFormError(null); }}
          title="Create New Trip" maxWidth="lg">
          <div className="space-y-4">
            <TripForm formData={formData} formError={formError} buses={buses} drivers={drivers} onChange={handleChange} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1"
                onClick={() => { setIsCreateOpen(false); setFormError(null); }} disabled={loading}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreate} loading={loading}
                disabled={!formData.driver_id || !formData.origin.trim() || !formData.destination.trim() || !formData.scheduled_start_time}>
                Create Trip
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── Edit Trip Modal ───────────────────────────────────────── */}
        <Modal isOpen={!!editTrip} onClose={() => { setEditTrip(null); setFormError(null); }}
          title="Edit Trip" maxWidth="lg">
          <div className="space-y-4">
            <TripForm formData={formData} formError={formError} buses={buses} drivers={drivers} onChange={handleChange} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1"
                onClick={() => { setEditTrip(null); setFormError(null); }} disabled={loading}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdate} loading={loading}
                disabled={!formData.driver_id || !formData.origin.trim() || !formData.destination.trim() || !formData.scheduled_start_time}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── Delete Confirm Modal ──────────────────────────────────── */}
        <Modal isOpen={!!deleteTrip} onClose={() => setDeleteTrip(null)} title="Delete Trip">
          <div className="space-y-5">
            <p className="text-foreground">
              Are you sure you want to delete the trip{" "}
              <strong>{deleteTrip?.origin} → {deleteTrip?.destination}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              All reserved / pending bookings will be cancelled. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteTrip(null)} disabled={deleteLoading}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} loading={deleteLoading}>
                Delete Trip
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── Toast ────────────────────────────────────────────────── */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
