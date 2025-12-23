import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserRole, Setor, Permission, rolePermissions } from '@/types/roles';

interface UseUserRoleReturn {
  roles: UserRole[];
  primaryRole: AppRole | null;
  setor: Setor | null;
  loading: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  isEquipe: boolean;
  isActive: boolean;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  canManageSetor: (setorId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useUserRole(): UseUserRoleReturn {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [setor, setSetor] = useState<Setor | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchUserRoleData = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setSetor(null);
      setIsActive(true);
      setLoading(false);
      return;
    }

    try {
      // Fetch user roles using direct query with type casting for new tables
      const { data: rawRoles, error: rawError } = await (supabase as any)
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (!rawError && rawRoles) {
        setRoles(rawRoles as UserRole[]);
      }

      // Fetch profile for setor_id and ativo status
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('setor_id, ativo')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setIsActive(profileData.ativo ?? true);

        // Fetch setor if user has one
        if (profileData.setor_id) {
          const { data: setorData, error: setorError } = await (supabase as any)
            .from('setores')
            .select('*')
            .eq('id', profileData.setor_id)
            .single();

          if (!setorError && setorData) {
            setSetor(setorData as Setor);
          }
        } else {
          setSetor(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user role data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserRoleData();
  }, [fetchUserRoleData]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  }, [roles]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    // Check if user has any role that grants this permission
    return roles.some(r => rolePermissions[r.role]?.includes(permission));
  }, [roles]);

  const canManageSetor = useCallback((setorId: string): boolean => {
    // Admin can manage any setor
    if (hasRole('admin')) return true;
    
    // Gestor can manage their specific setor
    return roles.some(r => r.role === 'gestor' && r.setor_id === setorId);
  }, [roles, hasRole]);

  // Determine primary role (highest privilege)
  const primaryRole: AppRole | null = roles.length > 0
    ? (hasRole('admin') 
        ? 'admin' 
        : hasRole('gestor') 
          ? 'gestor' 
          : 'equipe')
    : null;

  return {
    roles,
    primaryRole,
    setor,
    loading,
    isAdmin: hasRole('admin'),
    isGestor: hasRole('gestor'),
    isEquipe: hasRole('equipe'),
    isActive,
    hasRole,
    hasPermission,
    canManageSetor,
    refetch: fetchUserRoleData,
  };
}
