import { useState } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Button } from "../../shared/ui/Button";
import { Modal } from "../../shared/ui/Modal";
import { Input } from "../../shared/ui/Input";
import { FilterPanel } from "../../shared/ui/FilterPanel";
import { Plus, Send } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: string;
  status: "sent" | "scheduled" | "failed";
  sentAt: string;
  type: "email" | "sms" | "push";
}

export function NotificationCenter() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const notifications: Notification[] = [
    {
      id: "1",
      title: "Trip Confirmation",
      message: "Your trip to Boston has been confirmed",
      recipients: "john.doe@gmail.com",
      status: "sent",
      sentAt: "2026-06-15 10:30 AM",
      type: "email",
    },
    {
      id: "2",
      title: "Payment Receipt",
      message: "Payment of $90 received successfully",
      recipients: "sarah.wilson@gmail.com",
      status: "sent",
      sentAt: "2026-06-15 10:15 AM",
      type: "email",
    },
    {
      id: "3",
      title: "Trip Reminder",
      message: "Your trip departs in 2 hours",
      recipients: "mike.chen@gmail.com",
      status: "scheduled",
      sentAt: "2026-06-15 06:00 AM",
      type: "sms",
    },
    {
      id: "4",
      title: "System Maintenance",
      message: "Scheduled maintenance tonight at 2 AM",
      recipients: "All Users",
      status: "scheduled",
      sentAt: "2026-06-15 08:00 PM",
      type: "push",
    },
    {
      id: "5",
      title: "Booking Cancellation",
      message: "Your booking has been cancelled",
      recipients: "emma.davis@gmail.com",
      status: "failed",
      sentAt: "2026-06-14 03:30 PM",
      type: "email",
    },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType =
      selectedType === "all" || notification.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || notification.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const columns: Column<Notification>[] = [
    { key: "title", label: "Title" },
    {
      key: "message",
      label: "Message",
      render: (notification) => (
        <span className="text-sm text-muted-foreground truncate max-w-xs block">
          {notification.message}
        </span>
      ),
    },
    { key: "recipients", label: "Recipients" },
    {
      key: "type",
      label: "Type",
      render: (notification) => (
        <StatusBadge status={notification.type} variant="info" />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (notification) => <StatusBadge status={notification.status} />,
    },
    { key: "sentAt", label: "Sent At" },
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
                Notification Center
              </h1>
              <p className="text-muted-foreground">
                Manage system notifications and broadcasts
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-5 w-5" />
              Create Notification
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FilterPanel>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
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
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
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
            data={filteredNotifications}
            emptyMessage="No notifications found"
          />
        </motion.div>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Notification"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <Input label="Title" placeholder="Trip Confirmation" />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Enter notification message..."
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <select className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recipients
              </label>
              <select className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All Users</option>
                <option value="passengers">All Passengers</option>
                <option value="drivers">All Drivers</option>
                <option value="custom">Custom List</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1">
                <Send className="h-5 w-5" />
                Send Notification
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
