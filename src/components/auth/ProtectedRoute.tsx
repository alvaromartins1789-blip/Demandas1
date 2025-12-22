import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ForcePasswordChange } from './ForcePasswordChange';
import { PendingApproval } from './PendingApproval';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, mustChangePassword, isActive } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show pending approval if user is not active (and isActive has been loaded)
  if (isActive === false) {
    return <PendingApproval />;
  }

  // Force password change if required
  if (mustChangePassword) {
    return <ForcePasswordChange />;
  }

  return <>{children}</>;
}
