import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  MapPin,
  Calendar,
  Armchair,
  CreditCard,
  Loader2,
} from "lucide-react";
import { tripApi, type Trip } from "../features/trip/services";
import { bookingApi } from "../features/booking/services";
import { useAuth } from "../providers/AuthProvider";

type Step = 1 | 2 | 3;

export function BookingFlow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const [passengerInfo, setPassengerInfo] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const tripData = await tripApi.getTripById(id);
        setTrip(tripData.trip);
        const storedSeats = localStorage.getItem('selectedSeats');
        if (storedSeats) {
          setSelectedSeats(JSON.parse(storedSeats));
        }
      } catch (error) {
        console.error('Failed to load trip data:', error);
      }
    };
    loadData();
  }, [id, user]);

  const handleContinue = async () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      setLoading(true);
      try {
        // Create bookings for each selected seat
        // First, generate idempotency keys for each seat
        for (const seat of selectedSeats) {
          const idempotencyKey = `${Date.now()}-${seat}-${Math.random().toString(36).substr(2, 9)}`;
          await bookingApi.createBooking({
            trip_id: id!,
            seat_number: seat,
            idempotency_key: idempotencyKey,
          });
        }
        // Clear localStorage
        localStorage.removeItem('selectedSeats');
        localStorage.removeItem('tripId');
        navigate(`/my-bookings`);
      } catch (error) {
        console.error('Failed to create booking:', error);
        alert('Failed to create booking. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const steps = [
    { number: 1, label: "Passenger Info", icon: Circle },
    { number: 2, label: "Confirmation", icon: Circle },
    { number: 3, label: "Payment", icon: Circle },
  ];

  if (!trip) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const bookingData = {
    route: `${trip.origin} → ${trip.destination}`,
    date: new Date(trip.scheduled_start_time).toLocaleDateString(),
    time: new Date(trip.scheduled_start_time).toLocaleTimeString(),
    seats: selectedSeats,
    price: trip.fare * selectedSeats.length,
    currency: trip.currency,
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate(`/trip/${id}/seats`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to seat selection
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Complete Booking
          </h1>
          <p className="text-muted-foreground">Just a few steps to confirm</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        h-10 w-10 rounded-full flex items-center justify-center
                        transition-all duration-300
                        ${
                          currentStep >= step.number
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="font-medium">{step.number}</span>
                      )}
                    </div>
                    <p
                      className={`
                        text-xs mt-2 hidden sm:block
                        ${
                          currentStep >= step.number
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        h-1 flex-1 mx-2 rounded-full transition-all duration-300
                        ${
                          currentStep > step.number ? "bg-primary" : "bg-muted"
                        }
                      `}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-foreground">
                    Passenger Information
                  </h3>
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={passengerInfo.name}
                    onChange={(e) =>
                      setPassengerInfo({ ...passengerInfo, name: e.target.value })
                    }
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john.doe@gmail.com"
                    value={passengerInfo.email}
                    onChange={(e) =>
                      setPassengerInfo({ ...passengerInfo, email: e.target.value })
                    }
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={passengerInfo.phone}
                    onChange={(e) =>
                      setPassengerInfo({ ...passengerInfo, phone: e.target.value })
                    }
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-foreground">
                    Booking Confirmation
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Route</p>
                        <p className="font-medium text-foreground">
                          {bookingData.route}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date & Time
                        </p>
                        <p className="font-medium text-foreground">
                          {bookingData.date} at {bookingData.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Armchair className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Seats</p>
                        <p className="font-medium text-foreground">
                          {bookingData.seats.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {bookingData.currency} {bookingData.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-2">
                      Passenger Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground">{passengerInfo.name}</p>
                      <p className="text-muted-foreground">
                        {passengerInfo.email}
                      </p>
                      <p className="text-muted-foreground">
                        {passengerInfo.phone}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center py-8"
                >
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">
                    Proceed to Payment
                  </h3>
                  <p className="text-muted-foreground">
                    You will be redirected to the payment page (simulated)
                  </p>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-4"
        >
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((currentStep - 1) as Step)}
              className="flex-1"
            >
              Previous
            </Button>
          )}
          <Button
            onClick={handleContinue}
            loading={loading}
            className="flex-1"
          >
            {currentStep === 3 ? "Confirm Booking" : "Continue"}
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}