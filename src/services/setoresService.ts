import { supabase } from '@/integrations/supabase/client';
import { Setor } from '@/types/roles';

// Helper to get supabase client without strict typing for new tables
const db = supabase as any;

// Fetch all setores
export async function fetchSetores(): Promise<Setor[]> {
  const { data, error } = await db
    .from('setores')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw error;
  return (data || []) as Setor[];
}

// Fetch active setores only
export async function fetchActiveSetores(): Promise<Setor[]> {
  const { data, error } = await db
    .from('setores')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true });

  if (error) throw error;
  return (data || []) as Setor[];
}

// Create a new setor
export async function createSetor(nome: string, descricao?: string): Promise<Setor> {
  const { data, error } = await db
    .from('setores')
    .insert({ nome, descricao: descricao || null })
    .select()
    .single();

  if (error) throw error;
  return data as Setor;
}

// Update setor
export async function updateSetor(
  id: string, 
  updates: Partial<Pick<Setor, 'nome' | 'descricao' | 'ativo'>>
): Promise<Setor> {
  const { data, error } = await db
    .from('setores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Setor;
}

// Toggle setor active status
export async function toggleSetorActive(id: string, ativo: boolean): Promise<void> {
  const { error } = await db
    .from('setores')
    .update({ ativo })
    .eq('id', id);

  if (error) throw error;
}

// Delete setor (only if no users assigned)
export async function deleteSetor(id: string): Promise<void> {
  const { error } = await db
    .from('setores')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
