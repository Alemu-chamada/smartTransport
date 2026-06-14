import { useState, useEffect } from "react";
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
} from "lucide-react";
import { bookingApi, type Booking } from "../features/booking/services";
import { useAuth } from "../providers/AuthProvider";

type BookingStatus = "reserved" | "payment_pending" | "confirmed" | "failed" | "expired";

export function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getMyBookings();
      if (data?.bookings) {
        setBookings(data.bookings);
      }
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
    const badges: Record<BookingStatus, {
      icon: any;
      text: string;
      className: string;
    }> = {
      confirmed: {
        icon: CheckCircle2,
        text: "Confirmed",
        className: "bg-green-100 text-green-700 border-green-200",
      },
      reserved: {
        icon: Clock,
        text: "Reserved",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      payment_pending: {
        icon: Clock,
        text: "Payment Pending",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      failed: {
        icon: XCircle,
        text: "Failed",
        className: "bg-red-100 text-red-700 border-red-200",
      },
      expired: {
        icon: XCircle,
        text: "Expired",
        className: "bg-red-100 text-red-700 border-red-200",
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium ${badge.className}`}
      >
        <Icon className="h-4 w-4" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Bookings
          </h1>
          <p className="text-muted-foreground">
            View and manage your trip bookings
          </p>
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
            <Card className="p-12 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Armchair className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No bookings yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start your journey by booking a trip
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card className="p-6" hover>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-foreground">
                              {booking.trip?.origin || "Trip"} → {booking.trip?.destination || "Destination"}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground ml-8">
                            Ref: {booking.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ml-8">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-sm font-medium text-foreground">
                              {booking.trip?.scheduled_start_time ? formatDate(booking.trip.scheduled_start_time) : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="text-sm font-medium text-foreground">
                              {booking.trip?.scheduled_start_time ? formatTime(booking.trip.scheduled_start_time) : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Armchair className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Seat</p>
                            <p className="text-sm font-medium text-foreground">
                              {booking.seat_number}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:text-right space-y-3">
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
