import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

const ProtectedRoute = ({ redirectTo = '/', children }: ProtectedRouteProps) => {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to home (or specified route) if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location so we can redirect back after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render children or Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;