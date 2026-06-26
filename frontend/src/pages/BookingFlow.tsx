import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import {
  ArrowLeft, CheckCircle2, MapPin, Calendar, Armchair, CreditCard,
  Loader2, AlertCircle, CheckCircle, Shield, Lock,
} from "lucide-react";
import { tripApi, type Trip } from "../features/trip/services";
import { bookingApi } from "../features/booking/services";
import { apiService } from "../shared/services/api";
import { useAuth } from "../providers/AuthProvider";

type Step = 1 | 2 | 3;

const formatCardNumber = (val: string) =>
  val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (val: string) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
};

const getCardBrand = (num: string) => {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return { name: "Visa", color: "text-blue-600" };
  if (n.startsWith("5") || n.startsWith("2")) return { name: "Mastercard", color: "text-red-600" };
  if (n.startsWith("3")) return { name: "Amex", color: "text-green-600" };
  return null;
};

const luhnCheck = (num: string) => {
  const digits = num.replace(/\s/g, "");
  if (digits.length < 13) return false;
  let sum = 0; let odd = true;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (!odd) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit; odd = !odd;
  }
  return sum % 10 === 0;
};

function CustomPaymentForm({
  bookingInfo, bookingId, onSuccess, onError,
}: {
  bookingInfo: { route: string; seat: number; fare: number; currency: string };
  bookingId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const brand = getCardBrand(cardNumber);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!luhnCheck(cardNumber)) e.cardNumber = "Invalid card number";
    if (!name.trim()) e.name = "Cardholder name required";
    const [mm, yy] = expiry.split("/");
    const now = new Date();
    const expMonth = parseInt(mm, 10); const expYear = 2000 + parseInt(yy || "0", 10);
    if (!mm || !yy || expMonth < 1 || expMonth > 12 || expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) e.expiry = "Invalid or expired date";
    if (cvv.length < 3) e.cvv = "CVV must be 3–4 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      await apiService.post("/payment/confirm", { booking_id: bookingId });
      onSuccess();
    } catch (err: any) {
      onError(err?.data?.message || err?.message || "Payment failed. Please try again.");
    } finally { setProcessing(false); }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Route</span>
          <span className="font-semibold text-foreground">{bookingInfo.route}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-muted-foreground">Seat</span>
          <span className="font-semibold text-foreground">Seat {bookingInfo.seat}</span>
        </div>
        <div className="h-px bg-border mb-3" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground">Total</span>
          <span className="text-2xl font-black text-primary">{bookingInfo.currency} {bookingInfo.fare}</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" /> Card Details
        </p>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Card Number</label>
          <div className="relative">
            <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric"
              className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${errors.cardNumber ? "border-destructive" : "border-border"}`} />
            {brand && <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${brand.color}`}>{brand.name}</span>}
          </div>
          {errors.cardNumber && <p className="mt-1 text-xs text-destructive">{errors.cardNumber}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Cardholder Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name on card"
            className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${errors.name ? "border-destructive" : "border-border"}`} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Expiry Date</label>
            <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY" maxLength={5} inputMode="numeric"
              className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${errors.expiry ? "border-destructive" : "border-border"}`} />
            {errors.expiry && <p className="mt-1 text-xs text-destructive">{errors.expiry}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">CVV <Lock className="h-3 w-3" /></label>
            <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="•••" maxLength={4} inputMode="numeric" type="password"
              className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${errors.cvv ? "border-destructive" : "border-border"}`} />
            {errors.cvv && <p className="mt-1 text-xs text-destructive">{errors.cvv}</p>}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={processing}>
        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><Lock className="h-4 w-4" /> Pay {bookingInfo.currency} {bookingInfo.fare}</>}
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" /><span>256-bit SSL encrypted · Your card data is never stored</span>
      </div>
    </form>
  );
}

export function BookingFlow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState({ name: user?.full_name || "", email: user?.email || "", phone: user?.phone || "" });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await tripApi.getTripById(id);
        setTrip(data.trip);
        const stored = localStorage.getItem("selectedSeats");
        if (stored) setSelectedSeats(JSON.parse(stored));
      } catch { setError("Failed to load trip details."); }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (user) setPassengerInfo({ name: user.full_name || "", email: user.email || "", phone: user.phone || "" });
  }, [user]);

  const handleContinue = async () => {
    setError(null);
    if (currentStep === 1) {
      if (!passengerInfo.name.trim()) { setError("Please enter your full name."); return; }
      setCurrentStep(2); return;
    }
    if (currentStep === 2) {
      const seatNumber = selectedSeats[0];
      if (!seatNumber) { setError("No seat selected. Go back and select a seat."); return; }
      setLoadingPayment(true);
      try {
        const idempotencyKey = `${user?.id}-${id}-${seatNumber}-${Date.now()}`;
        const bookingResult = await bookingApi.createBooking({ trip_id: id!, seat_number: seatNumber, idempotency_key: idempotencyKey });
        setBookingId(bookingResult.booking.id);
        setCurrentStep(3);
      } catch (err: any) {
        setError(err?.data?.message || err?.message || "Failed to create booking. Please try again.");
      } finally { setLoadingPayment(false); }
    }
  };

  const steps = [{ number: 1, label: "Your Info" }, { number: 2, label: "Confirm" }, { number: 3, label: "Pay" }];

  if (!trip) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          {error ? (<div className="text-center"><AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" /><p className="text-destructive mb-4">{error}</p><Button onClick={() => navigate("/trips-discovery")}>Back to Trips</Button></div>) : <Loader2 className="h-10 w-10 animate-spin text-primary" />}
        </div>
      </MainLayout>
    );
  }

  if (paymentDone) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful! 🎉</h2>
              <p className="text-muted-foreground mb-2">Your seat on <strong>{trip.origin} → {trip.destination}</strong> is confirmed.</p>
              <p className="text-sm text-muted-foreground mb-8">A confirmation has been saved to your bookings.</p>
              <Button className="w-full" onClick={() => { localStorage.removeItem("selectedSeats"); navigate("/my-bookings"); }}>View My Bookings</Button>
            </Card>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  const bookingData = {
    route: `${trip.origin} → ${trip.destination}`,
    date: new Date(trip.scheduled_start_time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
    time: new Date(trip.scheduled_start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    seat: selectedSeats[0], price: trip.fare, currency: trip.currency || "ETB",
  };

  return (
    <MainLayout>
      <div className="w-full max-w-xl mx-auto space-y-4 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => currentStep === 1 ? navigate(`/trip/${id}/seats`) : setCurrentStep((currentStep - 1) as Step)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" />{currentStep === 1 ? "Back to seats" : "Previous step"}
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Complete Booking</h1>
          <p className="text-muted-foreground text-sm">Almost there — just a few steps to confirm your seat</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 sm:p-7">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep > step.number ? "bg-emerald-500 text-white" : currentStep === step.number ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
                      {currentStep > step.number ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  </div>
                  {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded transition-all duration-500 ${currentStep > step.number ? "bg-emerald-400" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm mb-5">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="font-bold text-foreground">Your Information</h3>
                  <Input label="Full Name *" placeholder="Your full name" value={passengerInfo.name} onChange={(e) => setPassengerInfo(p => ({ ...p, name: e.target.value }))} />
                  <Input label="Email" type="email" placeholder="your@email.com" value={passengerInfo.email} onChange={(e) => setPassengerInfo(p => ({ ...p, email: e.target.value }))} />
                  <Input label="Phone" type="tel" placeholder="+251..." value={passengerInfo.phone} onChange={(e) => setPassengerInfo(p => ({ ...p, phone: e.target.value }))} />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="font-bold text-foreground">Booking Summary</h3>
                  <div className="space-y-3">
                    {[{ icon: MapPin, label: "Route", value: bookingData.route }, { icon: Calendar, label: "Date & Time", value: `${bookingData.date} · ${bookingData.time}` }, { icon: Armchair, label: "Seat", value: `Seat ${bookingData.seat}` }].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl">
                        <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div><p className="text-xs text-muted-foreground">{item.label}</p><p className="font-semibold text-foreground text-sm">{item.value}</p></div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-primary/8 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /><span className="text-sm font-semibold text-foreground">Total Fare</span></div>
                      <span className="text-2xl font-black text-primary">{bookingData.currency} {bookingData.price}</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                    <span className="shrink-0">⏱</span>Seat held for 15 minutes · Complete payment to confirm
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && bookingId && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <CustomPaymentForm bookingInfo={bookingData} bookingId={bookingId} onSuccess={() => setPaymentDone(true)} onError={(msg) => setError(msg)} />
                </motion.div>
              )}
            </AnimatePresence>

            {currentStep < 3 && (
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && <Button variant="secondary" onClick={() => { setCurrentStep((currentStep - 1) as Step); setError(null); }} className="flex-1" disabled={loadingPayment}>Back</Button>}
                <Button onClick={handleContinue} loading={currentStep === 2 ? loadingPayment : loading} className="flex-1">
                  {currentStep === 2 ? "Proceed to Payment" : "Continue"}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
