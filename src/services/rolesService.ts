import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserRole, ProfileWithRole, Setor } from '@/types/roles';

// Helper to get supabase client without strict typing for new tables
const db = supabase as any;

// Fetch all users with their roles (for super_admin)
export async function fetchAllUsersWithRoles(): Promise<ProfileWithRole[]> {
  const { data: profiles, error: profilesError } = await db
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;

  // Fetch all roles
  const { data: allRoles, error: rolesError } = await db
    .from('user_roles')
    .select('*');

  if (rolesError) throw rolesError;

  // Fetch all setores
  const { data: allSetores, error: setoresError } = await db
    .from('setores')
    .select('*');

  if (setoresError) throw setoresError;

  const typedRoles = (allRoles || []) as UserRole[];
  const typedSetores = (allSetores || []) as Setor[];

  // Map profiles with their roles and setor
  return (profiles || []).map((profile: any) => {
    const userRoles = typedRoles.filter(r => r.user_id === profile.id);
    const userSetor = typedSetores.find(s => s.id === profile.setor_id);

    return {
      id: profile.id,
      nome: profile.nome,
      email: profile.email,
      area: profile.area,
      setor_id: profile.setor_id,
      ativo: profile.ativo ?? true,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      roles: userRoles,
      setor: userSetor || null,
    } as ProfileWithRole;
  });
}

// Fetch users by setor (for admin_setor)
export async function fetchUsersBySetor(setorId: string): Promise<ProfileWithRole[]> {
  const { data: profiles, error: profilesError } = await db
    .from('profiles')
    .select('*')
    .eq('setor_id', setorId)
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;

  // Fetch roles for these users
  const userIds = (profiles || []).map((p: any) => p.id);
  
  if (userIds.length === 0) return [];

  const { data: userRoles, error: rolesError } = await db
    .from('user_roles')
    .select('*')
    .in('user_id', userIds);

  if (rolesError) throw rolesError;

  const typedRoles = (userRoles || []) as UserRole[];

  return (profiles || []).map((profile: any) => ({
    id: profile.id,
    nome: profile.nome,
    email: profile.email,
    area: profile.area,
    setor_id: profile.setor_id,
    ativo: profile.ativo ?? true,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    roles: typedRoles.filter(r => r.user_id === profile.id),
    setor: null,
  } as ProfileWithRole));
}

// Assign role to user
export async function assignRole(
  userId: string, 
  role: AppRole, 
  setorId?: string
): Promise<void> {
  const { error } = await db
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role,
      setor_id: setorId || null,
    });

  if (error) throw error;
}

// Remove role from user
export async function removeRole(roleId: string): Promise<void> {
  const { error } = await db
    .from('user_roles')
    .delete()
    .eq('id', roleId);

  if (error) throw error;
}

// Update user's setor
export async function updateUserSetor(userId: string, setorId: string | null): Promise<void> {
  const { error } = await db
    .from('profiles')
    .update({ setor_id: setorId })
    .eq('id', userId);

  if (error) throw error;
}

// Toggle user active status
export async function toggleUserActive(userId: string, ativo: boolean): Promise<void> {
  const { error } = await db
    .from('profiles')
    .update({ ativo })
    .eq('id', userId);

  if (error) throw error;
}
