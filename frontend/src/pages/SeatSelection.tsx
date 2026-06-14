import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { ArrowLeft, Armchair, DollarSign, Loader2 } from "lucide-react";
import { tripApi, type Trip } from "../features/trip/services";

type SeatStatus = "available" | "selected" | "reserved";

interface Seat {
  id: string;
  number: number;
  status: SeatStatus;
}

export function SeatSelection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState<Seat[]>([]);
  const selectedSeats = seats.filter((s) => s.status === "selected");

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [tripData, occupiedData] = await Promise.all([
          tripApi.getTripById(id),
          tripApi.getTripOccupiedSeats(id),
        ]);
        setTrip(tripData.trip);
        const initialSeats: Seat[] = Array.from({ length: tripData.trip.total_capacity }, (_, i) => ({
          id: `seat-${i + 1}`,
          number: i + 1,
          status: occupiedData.occupiedSeats.includes(i + 1) ? "reserved" : "available",
        }));
        setSeats(initialSeats);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSeatClick = (seatId: string) => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.id === seatId && seat.status !== "reserved") {
          return {
            ...seat,
            status: seat.status === "available" ? "selected" : "available",
          };
        }
        return seat;
      })
    );
  };

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case "available":
        return "bg-muted hover:bg-primary/20 cursor-pointer";
      case "selected":
        return "bg-primary text-primary-foreground cursor-pointer";
      case "reserved":
        return "bg-border cursor-not-allowed opacity-50";
    }
  };

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0) return;
    // Store selected seats in state or localStorage for the booking page
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats.map(s => s.number)));
    localStorage.setItem('tripId', id!);
    navigate(`/trip/${id}/booking`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate(`/trip/${id}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to trip details
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Select Your Seat
          </h1>
          <p className="text-muted-foreground">Choose your preferred seating</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-muted rounded-lg" />
                      <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-primary rounded-lg" />
                      <span className="text-muted-foreground">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-border rounded-lg opacity-50" />
                      <span className="text-muted-foreground">Reserved</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-6 mb-6">
                  <p className="text-center text-sm font-medium text-muted-foreground">
                    Driver
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {seats.map((seat, index) => (
                    <motion.button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === "reserved"}
                      className={`
                        h-16 rounded-xl flex flex-col items-center justify-center
                        transition-all duration-200
                        ${getSeatColor(seat.status)}
                        ${index % 4 === 1 ? "mr-4" : ""}
                      `}
                      whileHover={
                        seat.status !== "reserved" ? { scale: 1.05 } : {}
                      }
                      whileTap={seat.status !== "reserved" ? { scale: 0.95 } : {}}
                    >
                      <Armchair className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">{seat.number}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-24"
            >
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">Booking Summary</h3>

                <AnimatePresence mode="wait">
                  {selectedSeats.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <Armchair className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No seats selected
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Selected Seats
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSeats.map((seat) => (
                            <span
                              key={seat.id}
                              className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                            >
                              {seat.number}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Price per seat
                          </span>
                          <span className="text-foreground font-medium">
                            {trip?.currency} {trip?.fare}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Number of seats
                          </span>
                          <span className="text-foreground font-medium">
                            {selectedSeats.length}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {trip?.currency} {trip ? trip.fare * selectedSeats.length : 0}
                        </span>
                      </div>

                      <Button
                        className="w-full mt-4"
                        size="lg"
                        onClick={handleProceedToBooking}
                        disabled={selectedSeats.length === 0}
                      >
                        <DollarSign className="h-5 w-5" />
                        Proceed to Booking
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}