import { Navigate } from 'react-router';
import { useAuth } from '../providers/AuthProvider';
import type { User } from '../features/auth/services';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  /** If true, redirect unauthorized roles to /unauthorized instead of /dashboard */
  strict?: boolean;
}

// All system roles, matching backend USER_ROLES constants
export const ROLES = {
  PASSENGER: 'passenger' as const,
  DRIVER: 'driver' as const,
  TRAFFIC_AUTHORITY: 'traffic_authority' as const,
  GARAGE_MANAGER: 'garage_manager' as const,
  FUEL_STATION_MANAGER: 'fuel_station_manager' as const,
  SYSTEM_ADMIN: 'system_admin' as const,
} as const;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  strict = false,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Still initializing — show nothing (App.tsx already shows a spinner)
  if (loading) return null;

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Role check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={strict ? '/unauthorized' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};
