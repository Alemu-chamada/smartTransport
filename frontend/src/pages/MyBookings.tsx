import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import {
  MapPin,
  Calendar,
  Armchair,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { bookingApi } from "../features/booking/services";
import { useAuth } from "../providers/AuthProvider";

type BookingStatus = "reserved" | "payment_pending" | "confirmed" | "failed" | "expired";

export function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "system_admin";
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getMyBookings();
      if (data?.bookings) setBookings(data.bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingApi.cancelBooking(bookingId);
      await loadBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const badges: Record<BookingStatus, { icon: any; text: string; className: string }> = {
      confirmed: { icon: CheckCircle2, text: "Confirmed", className: "bg-green-100 text-green-700 border-green-200" },
      reserved: { icon: Clock, text: "Reserved", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      payment_pending: { icon: Clock, text: "Payment Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      failed: { icon: XCircle, text: "Failed", className: "bg-red-100 text-red-700 border-red-200" },
      expired: { icon: XCircle, text: "Expired", className: "bg-red-100 text-red-700 border-red-200" },
    };
    const badge = badges[status] || badges.expired;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${badge.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your trip bookings</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-16 text-center">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
                <Armchair className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6 text-sm">Start your journey by browsing available trips.</p>
              <Button onClick={() => navigate(isAdmin ? "/trip" : "/trips-discovery")}>
                <MapPin className="h-4 w-4" />
                Browse Trips
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.07 }}
              >
                <Card className="p-6" hover>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      {/* Route header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-lg leading-tight">
                              {booking.trip?.origin || "Trip"} → {booking.trip?.destination || "Destination"}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Ref: {booking.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      {/* Info strip */}
                      <div className="flex flex-wrap gap-5 px-12">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-sm font-semibold text-foreground">
                              {booking.trip?.scheduled_start_time ? formatDate(booking.trip.scheduled_start_time) : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="text-sm font-semibold text-foreground">
                              {booking.trip?.scheduled_start_time ? formatTime(booking.trip.scheduled_start_time) : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Armchair className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Seat</p>
                            <p className="text-sm font-semibold text-foreground">{booking.seat_number}</p>
                          </div>
                        </div>
                        {booking.trip?.fare != null && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Fare</p>
                              <p className="text-sm font-semibold text-emerald-700">
                                {booking.trip?.currency || "ETB"} {booking.trip.fare.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                      {booking.status === "confirmed" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/trip/${booking.trip_id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Trip
                        </Button>
                      )}
                      {["reserved", "payment_pending"].includes(booking.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
