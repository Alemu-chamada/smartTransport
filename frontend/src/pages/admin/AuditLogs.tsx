import { useState } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { SearchBar } from "../../shared/ui/SearchBar";
import { FilterPanel } from "../../shared/ui/FilterPanel";

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetUser: string;
  details: string;
  ipAddress: string;
}

export function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");

  const logs: AuditLog[] = [
    {
      id: "1",
      timestamp: "2026-06-15 10:30:45",
      actor: "admin@tms.com",
      action: "User Created",
      targetUser: "john.doe@gmail.com",
      details: "New passenger account registered",
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      timestamp: "2026-06-15 10:25:12",
      actor: "admin@tms.com",
      action: "Trip Created",
      targetUser: "N/A",
      details: "Created trip: New York → Boston",
      ipAddress: "192.168.1.100",
    },
    {
      id: "3",
      timestamp: "2026-06-15 10:15:33",
      actor: "admin@tms.com",
      action: "Role Assigned",
      targetUser: "sarah.wilson@gmail.com",
      details: "Changed role from passenger to driver",
      ipAddress: "192.168.1.100",
    },
    {
      id: "4",
      timestamp: "2026-06-15 10:05:21",
      actor: "system",
      action: "Payment Processed",
      targetUser: "mike.chen@gmail.com",
      details: "Payment of $90 successfully processed",
      ipAddress: "System",
    },
    {
      id: "5",
      timestamp: "2026-06-15 09:50:18",
      actor: "admin@tms.com",
      action: "User Suspended",
      targetUser: "james.brown@gmail.com",
      details: "Account suspended for policy violation",
      ipAddress: "192.168.1.100",
    },
    {
      id: "6",
      timestamp: "2026-06-15 09:40:05",
      actor: "system",
      action: "Booking Confirmed",
      targetUser: "emma.davis@gmail.com",
      details: "Booking TMS-001-123 confirmed",
      ipAddress: "System",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction =
      selectedAction === "all" || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const columns: Column<AuditLog>[] = [
    { key: "timestamp", label: "Timestamp" },
    {
      key: "actor",
      label: "Actor",
      render: (log) => (
        <span
          className={`${
            log.actor === "system" ? "text-muted-foreground italic" : "text-foreground"
          }`}
        >
          {log.actor}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (log) => (
        <span className="font-medium text-foreground">{log.action}</span>
      ),
    },
    { key: "targetUser", label: "Target User" },
    { key: "details", label: "Details" },
    {
      key: "ipAddress",
      label: "IP Address",
      render: (log) => (
        <span className="text-xs text-muted-foreground">{log.ipAddress}</span>
      ),
    },
  ];

  const actionTypes = [
    ...new Set(logs.map((log) => log.action)),
  ].sort();

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Audit Logs
          </h1>
          <p className="text-muted-foreground">
            System activity and security audit trail
          </p>
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
                placeholder="Search logs..."
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Action Type
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Actions</option>
                {actionTypes.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
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
            data={filteredLogs}
            emptyMessage="No audit logs found"
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}
