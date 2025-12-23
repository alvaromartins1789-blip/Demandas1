import { useCallback, useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { Permission, rolePermissions } from '@/types/roles';

interface UsePermissionsReturn {
  // Core permission check
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  
  // User management shortcuts
  canManageUsers: boolean;
  canManageUsersInSetor: boolean;
  canCreateUsers: boolean;
  canDeleteUsers: boolean;
  canBanUsers: boolean;
  
  // Setor management shortcuts
  canManageSetores: boolean;
  
  // Demanda management shortcuts
  canCreateDemandas: boolean;
  canViewAllDemandas: boolean;
  canViewSetorDemandas: boolean;
  canApproveDemandas: boolean;
  canAssignTechnical: boolean;
  
  // Dashboard shortcuts
  canViewGlobalDashboard: boolean;
  canViewSetorDashboard: boolean;
  
  // Configuration shortcuts
  canManageConfig: boolean;
  
  // Insight shortcuts
  canPrioritizeInsights: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { roles, isAdmin, isGestor } = useUserRole();

  const can = useCallback((permission: Permission): boolean => {
    return roles.some(r => rolePermissions[r.role]?.includes(permission));
  }, [roles]);

  const canAny = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(p => can(p));
  }, [can]);

  const canAll = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(p => can(p));
  }, [can]);

  // Memoized permission checks for common operations
  const permissions = useMemo(() => ({
    // User management
    canManageUsers: isAdmin,
    canManageUsersInSetor: isAdmin || isGestor,
    canCreateUsers: can('users:create'),
    canDeleteUsers: can('users:delete'),
    canBanUsers: can('users:ban'),
    
    // Setor management
    canManageSetores: can('setores:create') || can('setores:edit'),
    
    // Demanda management
    canCreateDemandas: can('demandas:create'),
    canViewAllDemandas: can('demandas:view_all'),
    canViewSetorDemandas: can('demandas:view_setor'),
    canApproveDemandas: can('demandas:approve_triagem') || can('demandas:approve_homologacao'),
    canAssignTechnical: can('demandas:assign_technical'),
    
    // Dashboard
    canViewGlobalDashboard: can('dashboard:global'),
    canViewSetorDashboard: can('dashboard:setor'),
    
    // Configuration
    canManageConfig: can('config:status') || can('config:fluxos') || can('config:prioridades'),
    
    // Insights
    canPrioritizeInsights: can('insights:prioritize'),
  }), [roles, isAdmin, isGestor, can]);

  return {
    can,
    canAny,
    canAll,
    ...permissions,
  };
}
