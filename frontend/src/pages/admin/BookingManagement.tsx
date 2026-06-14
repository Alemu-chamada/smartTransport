import { useState } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { SearchBar } from "../../shared/ui/SearchBar";
import { FilterPanel } from "../../shared/ui/FilterPanel";
import { Eye } from "lucide-react";

interface Booking {
  id: string;
  bookingRef: string;
  passenger: string;
  route: string;
  seat: string;
  paymentStatus: "paid" | "pending" | "failed";
  bookingStatus: "confirmed" | "pending" | "cancelled";
  date: string;
  amount: number;
}

export function BookingManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedBookingStatus, setSelectedBookingStatus] = useState("all");

  const bookings: Booking[] = [
    {
      id: "1",
      bookingRef: "TMS-001-123",
      passenger: "John Doe",
      route: "New York → Boston",
      seat: "12, 13",
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      date: "2026-06-15",
      amount: 90,
    },
    {
      id: "2",
      bookingRef: "TMS-002-456",
      passenger: "Sarah Wilson",
      route: "Boston → Philadelphia",
      seat: "8",
      paymentStatus: "pending",
      bookingStatus: "pending",
      date: "2026-06-15",
      amount: 45,
    },
    {
      id: "3",
      bookingRef: "TMS-003-789",
      passenger: "Mike Chen",
      route: "Philadelphia → New York",
      seat: "15",
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      date: "2026-06-14",
      amount: 45,
    },
    {
      id: "4",
      bookingRef: "TMS-004-012",
      passenger: "Emma Davis",
      route: "New York → Washington DC",
      seat: "5, 6",
      paymentStatus: "failed",
      bookingStatus: "cancelled",
      date: "2026-06-13",
      amount: 100,
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.passenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.route.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment =
      selectedPaymentStatus === "all" ||
      booking.paymentStatus === selectedPaymentStatus;
    const matchesBooking =
      selectedBookingStatus === "all" ||
      booking.bookingStatus === selectedBookingStatus;
    return matchesSearch && matchesPayment && matchesBooking;
  });

  const columns: Column<Booking>[] = [
    { key: "bookingRef", label: "Booking Ref" },
    { key: "passenger", label: "Passenger" },
    { key: "route", label: "Route" },
    { key: "date", label: "Date" },
    { key: "seat", label: "Seat(s)" },
    {
      key: "amount",
      label: "Amount",
      render: (booking) => (
        <span className="font-medium text-foreground">${booking.amount}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (booking) => <StatusBadge status={booking.paymentStatus} />,
    },
    {
      key: "bookingStatus",
      label: "Status",
      render: (booking) => <StatusBadge status={booking.bookingStatus} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <button
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4 text-foreground" />
        </button>
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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Booking Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all trip bookings
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
                placeholder="Search bookings..."
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Payment Status
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Booking Status
              </label>
              <select
                value={selectedBookingStatus}
                onChange={(e) => setSelectedBookingStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
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
            data={filteredBookings}
            emptyMessage="No bookings found"
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}
