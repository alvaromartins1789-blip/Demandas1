import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserRole, Setor } from '@/types/roles';

interface UseUserRoleReturn {
  roles: UserRole[];
  primaryRole: AppRole | null;
  setor: Setor | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdminSetor: boolean;
  isUsuario: boolean;
  isActive: boolean;
  hasRole: (role: AppRole) => boolean;
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

  const canManageSetor = useCallback((setorId: string): boolean => {
    // Super admin can manage any setor
    if (hasRole('super_admin')) return true;
    
    // Admin setor can manage their specific setor
    return roles.some(r => r.role === 'admin_setor' && r.setor_id === setorId);
  }, [roles, hasRole]);

  // Determine primary role (highest privilege)
  const primaryRole: AppRole | null = roles.length > 0
    ? (hasRole('super_admin') 
        ? 'super_admin' 
        : hasRole('admin_setor') 
          ? 'admin_setor' 
          : 'usuario')
    : null;

  return {
    roles,
    primaryRole,
    setor,
    loading,
    isSuperAdmin: hasRole('super_admin'),
    isAdminSetor: hasRole('admin_setor'),
    isUsuario: hasRole('usuario'),
    isActive,
    hasRole,
    canManageSetor,
    refetch: fetchUserRoleData,
  };
}
