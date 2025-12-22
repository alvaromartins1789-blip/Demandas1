import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AppRole } from '@/types/roles';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  requireActive?: boolean;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles,
  requireActive = true 
}: RoleProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, isActive, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is active
  if (requireActive && !isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Acesso Bloqueado</h1>
          <p className="text-muted-foreground">
            Sua conta foi desativada. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has any of the allowed roles
  const hasPermission = roles.some(r => allowedRoles.includes(r.role));

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
