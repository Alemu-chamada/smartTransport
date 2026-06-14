import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { SignIn } from "./features/auth/components/SignIn";
import { SignUp } from "./features/auth/components/SignUp";
import { OTP } from "./features/auth/components/OTP";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { Placeholder } from "./pages/Placeholder";
import { Trip } from "./pages/Trip";
import { TripDiscovery } from "./pages/TripDiscovery";
import { TripDetails } from "./pages/TripDetails";
import { SeatSelection } from "./pages/SeatSelection";
import { BookingFlow } from "./pages/BookingFlow";
import { Payment } from "./pages/Payment";
import { MyBookings } from "./pages/MyBookings";
import { PostsAndComments } from "./pages/PostsAndComments";
import { NearbyServices } from "./pages/NearbyServices";
import { Tracking } from "./pages/Tracking";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { TripManagement } from "./pages/admin/TripManagement";
import { BookingManagement } from "./pages/admin/BookingManagement";
import { PaymentManagement } from "./pages/admin/PaymentManagement";
import { TrackingMonitor } from "./pages/admin/TrackingMonitor";
import { AuditLogs } from "./pages/admin/AuditLogs";
import { SystemHealth } from "./pages/admin/SystemHealth";
import { NotificationCenter } from "./pages/admin/NotificationCenter";
import { Settings } from "./pages/admin/Settings";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { useAuth } from "./providers/AuthProvider";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signin" element={!isAuthenticated ? <SignIn /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" replace />} />
        <Route path="/otp" element={!isAuthenticated ? <OTP /> : <Navigate to="/dashboard" replace />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/trip" element={<ProtectedRoute><Trip /></ProtectedRoute>} />
        <Route path="/trips-discovery" element={<ProtectedRoute><TripDiscovery /></ProtectedRoute>} />
        <Route path="/trip/:id" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
        <Route path="/trip/:id/seats" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/trip/:id/booking" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
        <Route path="/trip/:id/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><PostsAndComments /></ProtectedRoute>} />
        <Route path="/nearby" element={<ProtectedRoute><NearbyServices /></ProtectedRoute>} />
        <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['system_admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/trips" element={<ProtectedRoute allowedRoles={['system_admin']}><TripManagement /></ProtectedRoute>} />
        <Route path="/admin/trips/create" element={<ProtectedRoute allowedRoles={['system_admin']}><TripManagement /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['system_admin']}><BookingManagement /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['system_admin']}><PaymentManagement /></ProtectedRoute>} />
        <Route path="/admin/tracking" element={<ProtectedRoute allowedRoles={['system_admin']}><TrackingMonitor /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['system_admin']}><AuditLogs /></ProtectedRoute>} />
        <Route path="/admin/system-health" element={<ProtectedRoute allowedRoles={['system_admin']}><SystemHealth /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['system_admin']}><NotificationCenter /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['system_admin']}><Settings /></ProtectedRoute>} />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Trips"
                description="Trip management feature coming soon"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Bookings"
                description="Booking management feature coming soon"
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
