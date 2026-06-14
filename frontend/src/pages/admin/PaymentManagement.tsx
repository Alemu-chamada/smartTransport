import { useState } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { SearchBar } from "../../shared/ui/SearchBar";
import { FilterPanel } from "../../shared/ui/FilterPanel";
import { MetricCard } from "../../shared/ui/MetricCard";
import { DollarSign, TrendingUp, XCircle, Clock } from "lucide-react";

interface Payment {
  id: string;
  transactionId: string;
  bookingRef: string;
  customer: string;
  amount: number;
  status: "success" | "failed" | "pending";
  method: string;
  date: string;
  time: string;
}

export function PaymentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const metrics = [
    {
      label: "Total Revenue",
      value: "$124,580",
      icon: DollarSign,
      iconColor: "bg-emerald-500",
      trend: { value: "18% from last month", isPositive: true },
    },
    {
      label: "Successful",
      value: "2,456",
      icon: TrendingUp,
      iconColor: "bg-green-500",
      trend: { value: "12% from last month", isPositive: true },
    },
    {
      label: "Failed",
      value: "48",
      icon: XCircle,
      iconColor: "bg-red-500",
      trend: { value: "5% from last month", isPositive: false },
    },
    {
      label: "Pending",
      value: "23",
      icon: Clock,
      iconColor: "bg-yellow-500",
    },
  ];

  const payments: Payment[] = [
    {
      id: "1",
      transactionId: "TXN-001-123",
      bookingRef: "TMS-001-123",
      customer: "John Doe",
      amount: 90,
      status: "success",
      method: "Credit Card",
      date: "2026-06-15",
      time: "10:30 AM",
    },
    {
      id: "2",
      transactionId: "TXN-002-456",
      bookingRef: "TMS-002-456",
      customer: "Sarah Wilson",
      amount: 45,
      status: "pending",
      method: "PayPal",
      date: "2026-06-15",
      time: "11:15 AM",
    },
    {
      id: "3",
      transactionId: "TXN-003-789",
      bookingRef: "TMS-003-789",
      customer: "Mike Chen",
      amount: 45,
      status: "success",
      method: "Debit Card",
      date: "2026-06-14",
      time: "02:45 PM",
    },
    {
      id: "4",
      transactionId: "TXN-004-012",
      bookingRef: "TMS-004-012",
      customer: "Emma Davis",
      amount: 100,
      status: "failed",
      method: "Credit Card",
      date: "2026-06-13",
      time: "09:20 AM",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || payment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Payment>[] = [
    { key: "transactionId", label: "Transaction ID" },
    { key: "bookingRef", label: "Booking Ref" },
    { key: "customer", label: "Customer" },
    {
      key: "amount",
      label: "Amount",
      render: (payment) => (
        <span className="font-bold text-foreground">${payment.amount}</span>
      ),
    },
    { key: "method", label: "Method" },
    {
      key: "status",
      label: "Status",
      render: (payment) => <StatusBadge status={payment.status} />,
    },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Payment Management
          </h1>
          <p className="text-muted-foreground">
            Monitor payment transactions and revenue
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.label} {...metric} delay={index * 0.1} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FilterPanel>
            <div className="flex-1 min-w-[250px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search payments..."
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
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </FilterPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <DataTable
            columns={columns}
            data={filteredPayments}
            emptyMessage="No payments found"
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}
