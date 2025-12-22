import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserInvite } from '@/types/roles';

// Helper to get supabase client without strict typing for new tables
const db = supabase as any;

// Fetch all pending invites
export async function fetchPendingInvites(): Promise<UserInvite[]> {
  const { data, error } = await db
    .from('user_invites')
    .select('*')
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as UserInvite[];
}

// Create a new invite
export async function createInvite(
  email: string,
  role: AppRole,
  setorId?: string
): Promise<UserInvite> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuário não autenticado');

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await db
    .from('user_invites')
    .insert({
      email: email.toLowerCase(),
      role,
      setor_id: setorId || null,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Já existe um convite pendente para este email');
    }
    throw error;
  }
  
  return data as UserInvite;
}

// Cancel/delete an invite
export async function cancelInvite(inviteId: string): Promise<void> {
  const { error } = await db
    .from('user_invites')
    .delete()
    .eq('id', inviteId);

  if (error) throw error;
}

// Check if email has a pending invite
export async function checkInviteForEmail(email: string): Promise<UserInvite | null> {
  const { data, error } = await db
    .from('user_invites')
    .select('*')
    .eq('email', email.toLowerCase())
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data as UserInvite | null;
}

// Resend invite (update expiration)
export async function resendInvite(inviteId: string): Promise<UserInvite> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await db
    .from('user_invites')
    .update({ expires_at: expiresAt.toISOString() })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) throw error;
  return data as UserInvite;
}
