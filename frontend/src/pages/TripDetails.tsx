import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Modal } from "../shared/ui/Modal";
import { Input } from "../shared/ui/Input";
import {
  MapPin, Clock, Users, Calendar, Bus, ArrowLeft, Loader2,
  Edit, Trash2, AlertCircle, CheckCircle2, XCircle, User,
  Bus as BusIcon,
} from "lucide-react";
import { tripApi, type Trip } from "../features/trip/services";
import { adminApi, type Bus as BusType, type Driver } from "../features/admin/services";
import { useAuth } from "../providers/AuthProvider";

/* ── Toast ─────────────────────────────────────────────────────────────── */
function Toast({
  message, type, onClose,
}: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold"
      style={{ backgroundColor: type === "success" ? "#001621" : "#FD1843", color: "#fff" }}
    >
      {type === "success"
        ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        : <XCircle className="h-4 w-4 flex-shrink-0" />}
      {message}
    </motion.div>
  );
}

/* ── Form defaults ─────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  bus_id: "", driver_id: "", origin: "", destination: "",
  scheduled_start_time: "", total_capacity: 40, fare: 0, currency: "ETB",
};
type FormData = typeof EMPTY_FORM;

/* ── Trip edit form — defined OUTSIDE TripDetails so it never remounts ── */
interface TripEditFormProps {
  formData: FormData;
  formError: string | null;
  buses: BusType[];
  drivers: Driver[];
  onChange: (field: keyof FormData, value: string | number) => void;
}

function TripEditForm({ formData, formError, buses, drivers, onChange }: TripEditFormProps) {
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
          <BusIcon className="h-4 w-4" /> Bus <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        {buses.length === 0
          ? <p className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">No buses found.</p>
          : <select value={formData.bus_id} onChange={e => onChange("bus_id", e.target.value)}
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
          ? <p className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">No drivers found.</p>
          : <select value={formData.driver_id} onChange={e => onChange("driver_id", e.target.value)}
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

/* ── Main component ────────────────────────────────────────────────────── */
export function TripDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "system_admin";

  /* Trip state */
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  /* Admin: buses / drivers */
  const [buses, setBuses] = useState<BusType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  /* Admin: modals */
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* Admin: form */
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* Toast */
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error") => setToast({ message, type }), []);

  /* ── Load trip ─────────────────────────────────────────────────────── */
  const loadTrip = useCallback(async (tripId: string) => {
    try {
      setLoading(true);
      const data = await tripApi.getTripById(tripId);
      if (data?.trip) setTrip(data.trip);
    } catch (err) {
      console.error("Failed to load trip:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (id) loadTrip(id); }, [id, loadTrip]);

  /* ── Load buses & drivers (admin only, lazy) ───────────────────────── */
  const loadBusesDrivers = useCallback(async () => {
    if (buses.length && drivers.length) return;
    try {
      const [bd, dd] = await Promise.all([adminApi.getBuses(), adminApi.getDrivers()]);
      setBuses(bd.buses || []);
      setDrivers(dd.drivers || []);
    } catch (err) { console.error(err); }
  }, [buses.length, drivers.length]);

  /* ── Open edit modal ───────────────────────────────────────────────── */
  const openEdit = () => {
    if (!trip) return;
    setFormData({
      bus_id:               (trip as any).bus_id    ?? "",
      driver_id:            (trip as any).driver_id ?? "",
      origin:               trip.origin,
      destination:          trip.destination,
      scheduled_start_time: trip.scheduled_start_time
        ? new Date(trip.scheduled_start_time).toISOString().slice(0, 16)
        : "",
      total_capacity: trip.total_capacity,
      fare:           trip.fare ?? 0,
      currency:       trip.currency || "ETB",
    });
    setFormError(null);
    setEditOpen(true);
    loadBusesDrivers();
  };

  /* ── Form field change ─────────────────────────────────────────────── */
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

  /* ── Save edit ─────────────────────────────────────────────────────── */
  const handleUpdate = async () => {
    if (!trip) return;
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true); setFormError(null);
    try {
      await tripApi.updateTrip(trip.id, {
        origin:               formData.origin.trim(),
        destination:          formData.destination.trim(),
        scheduled_start_time: formData.scheduled_start_time,
        total_capacity:       formData.total_capacity,
        fare:                 formData.fare,
        currency:             formData.currency || "ETB",
        driver_id:            formData.driver_id || undefined,
        bus_id:               formData.bus_id || undefined,
      });
      setEditOpen(false);
      await loadTrip(trip.id);          // refresh trip details in place
      showToast("Trip updated successfully!", "success");
    } catch (e: any) {
      setFormError(e.data?.message || e.message || "Failed to update trip.");
    } finally { setSaving(false); }
  };

  /* ── Confirm delete ────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!trip) return;
    setDeleting(true);
    try {
      await tripApi.deleteTrip(trip.id);
      setDeleteOpen(false);
      showToast("Trip deleted.", "success");
      setTimeout(() => navigate(-1), 1200);  // brief toast, then go back
    } catch (e: any) {
      showToast(e.data?.message || "Failed to delete trip.", "error");
      setDeleteOpen(false);
    } finally { setDeleting(false); }
  };

  /* ── Back navigation ───────────────────────────────────────────────── */
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(isAdmin ? "/trip" : "/trips-discovery");
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });

  /* ── Loading ───────────────────────────────────────────────────────── */
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
          <Button onClick={() => navigate(isAdmin ? "/trip" : "/trips-discovery")}>
            Back to trips
          </Button>
        </div>
      </MainLayout>
    );
  }

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to trips
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Trip Details</h1>
          <p className="text-muted-foreground">Review your trip information</p>
        </motion.div>

        {/* Trip card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="p-8">
            <div className="space-y-6">
              {/* Route header + admin action buttons */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      {trip.origin} → {trip.destination}
                    </h2>
                  </div>
                  {trip.route_description && (
                    <p className="text-muted-foreground ml-9">{trip.route_description}</p>
                  )}
                </div>

                {/* Admin-only: Edit + Delete icons */}
                {isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={openEdit}
                      title="Edit trip"
                      className="p-2.5 rounded-xl hover:bg-muted transition-colors group"
                    >
                      <Edit className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                    <button
                      onClick={() => setDeleteOpen(true)}
                      title="Delete trip"
                      className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
                    >
                      <Trash2 className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Trip info grid */}
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
                      <p className="font-medium text-foreground">{(trip as any).bus_id || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Capacity</p>
                      <p className="font-medium text-foreground">{trip.total_capacity} seats</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare */}
              {trip.fare != null && (
                <>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Fare per seat</p>
                    <p className="text-2xl font-bold text-foreground">
                      {trip.currency || "ETB"} {trip.fare.toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>

        {/* CTA — passengers only */}
        {!isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Button className="w-full" size="lg" onClick={() => navigate(`/trip/${id}/seats`)}>
              Select Seat
            </Button>
          </motion.div>
        )}

        {/* ── Edit Trip Modal (admin) ───────────────────────────────── */}
        <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setFormError(null); }} title="Edit Trip" maxWidth="lg">
          <div className="space-y-4">
            <TripEditForm formData={formData} formError={formError} buses={buses} drivers={drivers} onChange={handleChange} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1"
                onClick={() => { setEditOpen(false); setFormError(null); }} disabled={saving}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdate} loading={saving}
                disabled={!formData.driver_id || !formData.origin.trim() || !formData.destination.trim() || !formData.scheduled_start_time}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── Delete Confirm Modal (admin) ──────────────────────────── */}
        <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Trip">
          <div className="space-y-5">
            <p className="text-foreground">
              Are you sure you want to delete the trip{" "}
              <strong>{trip.origin} → {trip.destination}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              All reserved / pending bookings will be cancelled. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} loading={deleting}>
                Delete Trip
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast */}
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
