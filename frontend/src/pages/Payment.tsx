import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

type PaymentStatus = "pending" | "processing" | "success" | "failed";

export function Payment() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>("pending");

  const handlePayment = () => {
    setStatus("processing");
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setStatus(success ? "success" : "failed");
    }, 3000);
  };

  const handleRetry = () => {
    setStatus("pending");
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Payment</h1>
          <p className="text-muted-foreground">Complete your booking payment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {status === "pending" && (
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Ready to Pay
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Click the button below to process your payment
                  </p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-xl">
                    <span className="text-sm text-muted-foreground">
                      Total Amount:
                    </span>
                    <span className="text-3xl font-bold text-primary">$90</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Payment secured by TMS Payment Gateway
                  </p>
                  <Button className="w-full" size="lg" onClick={handlePayment}>
                    Pay Now
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {status === "processing" && (
            <Card className="p-8">
              <div className="space-y-6 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex justify-center"
                >
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary" />
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Processing Payment
                  </h2>
                  <p className="text-muted-foreground">
                    Please wait while we process your payment...
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            </Card>
          )}

          {status === "success" && (
            <Card className="p-8">
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="flex justify-center"
                >
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-muted-foreground">
                    Your booking has been confirmed
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-foreground">
                    Booking confirmation sent to your email
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate("/my-bookings")}
                  >
                    View Bookings
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate("/trips-discovery")}
                  >
                    Book Another Trip
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {status === "failed" && (
            <Card className="p-8">
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="flex justify-center"
                >
                  <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Payment Failed
                  </h2>
                  <p className="text-muted-foreground">
                    We couldn't process your payment
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-foreground">
                    Please check your payment details and try again
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate("/trips-discovery")}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleRetry}>
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
