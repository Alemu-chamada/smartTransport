import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { Button } from "../../shared/ui/Button";
import { Modal } from "../../shared/ui/Modal";
import { Input } from "../../shared/ui/Input";
import { Plus, Bus, AlertCircle, CheckCircle } from "lucide-react";
import { adminApi, type Bus as BusType, type Driver } from "../../features/admin/services";

export function BusManagement() {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    plate_number: "",
    capacity: 40,
    driver_id: "",
  });

  const loadData = async () => {
    try {
      const [busData, driverData] = await Promise.all([
        adminApi.getBuses(),
        adminApi.getDrivers(),
      ]);
      setBuses(busData.buses || []);
      setDrivers(driverData.drivers || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!formData.plate_number.trim()) { setFormError("Plate number is required."); return; }
    if (formData.capacity < 1) { setFormError("Capacity must be at least 1."); return; }

    setFormLoading(true);
    setFormError(null);
    try {
      await adminApi.createBus({
        plate_number: formData.plate_number.trim(),
        capacity: formData.capacity,
        driver_id: formData.driver_id || undefined,
      });
      setSuccess("Bus created successfully!");
      setIsCreateModalOpen(false);
      setFormData({ plate_number: "", capacity: 40, driver_id: "" });
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create bus.");
    } finally {
      setFormLoading(false);
    }
  };

  const getDriverName = (driverId?: string) => {
    if (!driverId) return "—";
    const driver = drivers.find(d => d.id === driverId);
    return driver?.full_name || "Unknown";
  };

  const columns: Column<BusType>[] = [
    {
      key: "plate_number",
      label: "Plate Number",
      render: (bus) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bus className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold font-mono">{bus.plate_number}</span>
        </div>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (bus) => <span>{bus.capacity} seats</span>,
    },
    {
      key: "driver",
      label: "Assigned Driver",
      render: (bus) => (
        <span className={bus.driver_id ? "text-foreground" : "text-muted-foreground"}>
          {getDriverName(bus.driver_id)}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (bus) => (
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${bus.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${bus.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
          {bus.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Bus Management</h1>
              <p className="text-muted-foreground">Register buses and assign drivers</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Bus
            </Button>
          </div>
        </motion.div>

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <DataTable columns={columns} data={buses} emptyMessage="No buses registered yet. Add your first bus!" />
          )}
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Buses</p>
            <p className="text-3xl font-bold text-foreground">{buses.length}</p>
          </div>
          <div className="p-5 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Assigned to Drivers</p>
            <p className="text-3xl font-bold text-foreground">{buses.filter(b => b.driver_id).length}</p>
          </div>
          <div className="p-5 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Capacity</p>
            <p className="text-3xl font-bold text-foreground">{buses.reduce((sum, b) => sum + b.capacity, 0)} seats</p>
          </div>
        </div>

        {/* Create Bus Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => { setIsCreateModalOpen(false); setFormError(null); }}
          title="Register New Bus"
        >
          <div className="space-y-4">
            {formError && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Input
              label="Plate Number *"
              placeholder="e.g. AA-12345"
              value={formData.plate_number}
              onChange={(e) => { setFormData(p => ({ ...p, plate_number: e.target.value })); setFormError(null); }}
            />

            <Input
              label="Seat Capacity *"
              type="number"
              placeholder="40"
              value={formData.capacity}
              onChange={(e) => { setFormData(p => ({ ...p, capacity: parseInt(e.target.value) || 0 })); setFormError(null); }}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Assign Driver (optional)</label>
              {drivers.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-xl">
                  No drivers available. Assign driver role to users first.
                </p>
              ) : (
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData(p => ({ ...p, driver_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No driver assigned</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.full_name} {driver.phone ? `(${driver.phone})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setIsCreateModalOpen(false); setFormError(null); }} disabled={formLoading}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreate} loading={formLoading}>
                Register Bus
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
