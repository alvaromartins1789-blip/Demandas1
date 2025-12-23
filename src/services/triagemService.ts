import { supabase } from '@/integrations/supabase/client';
import { DemandaHistorico } from '@/types/historico';

interface TriagemParams {
  demandaId: string;
  usuarioId: string;
  usuarioNome: string;
  observacoes: string;
}

export async function aprovarTriagem(params: TriagemParams): Promise<void> {
  const { demandaId, usuarioId, usuarioNome, observacoes } = params;

  // Get current demanda status
  const { data: demanda, error: fetchError } = await supabase
    .from('demandas')
    .select('status, status_triagem')
    .eq('id', demandaId)
    .single();

  if (fetchError) throw fetchError;

  const statusAnterior = demanda.status;

  // Update demanda - goes directly to desenvolvimento
  const { error: updateError } = await supabase
    .from('demandas')
    .update({
      status: 'desenvolvimento',
      status_triagem: 'aprovado',
      observacoes_triagem: observacoes,
      triado_por_id: usuarioId,
      triado_por_nome: usuarioNome,
      triado_em: new Date().toISOString(),
    })
    .eq('id', demandaId);

  if (updateError) throw updateError;

  // Insert history record
  const { error: historyError } = await supabase
    .from('demanda_historico')
    .insert({
      demanda_id: demandaId,
      usuario_id: usuarioId,
      usuario_nome: usuarioNome,
      acao: 'triagem_aprovada',
      status_anterior: statusAnterior,
      status_novo: 'desenvolvimento',
      observacoes,
    });

  if (historyError) throw historyError;
}

export async function reprovarTriagem(params: TriagemParams): Promise<void> {
  const { demandaId, usuarioId, usuarioNome, observacoes } = params;

  // Get current demanda status
  const { data: demanda, error: fetchError } = await supabase
    .from('demandas')
    .select('status')
    .eq('id', demandaId)
    .single();

  if (fetchError) throw fetchError;

  const statusAnterior = demanda.status;

  // Update demanda
  const { error: updateError } = await supabase
    .from('demandas')
    .update({
      status: 'reprovado',
      status_triagem: 'reprovado',
      observacoes_triagem: observacoes,
      triado_por_id: usuarioId,
      triado_por_nome: usuarioNome,
      triado_em: new Date().toISOString(),
    })
    .eq('id', demandaId);

  if (updateError) throw updateError;

  // Insert history record
  const { error: historyError } = await supabase
    .from('demanda_historico')
    .insert({
      demanda_id: demandaId,
      usuario_id: usuarioId,
      usuario_nome: usuarioNome,
      acao: 'triagem_reprovada',
      status_anterior: statusAnterior,
      status_novo: 'reprovado',
      observacoes,
    });

  if (historyError) throw historyError;
}

export async function concluirDemanda(params: TriagemParams): Promise<void> {
  const { demandaId, usuarioId, usuarioNome, observacoes } = params;

  // Get current demanda status
  const { data: demanda, error: fetchError } = await supabase
    .from('demandas')
    .select('status')
    .eq('id', demandaId)
    .single();

  if (fetchError) throw fetchError;

  const statusAnterior = demanda.status;

  // Update demanda
  const { error: updateError } = await supabase
    .from('demandas')
    .update({
      status: 'concluido',
    })
    .eq('id', demandaId);

  if (updateError) throw updateError;

  // Insert history record
  const { error: historyError } = await supabase
    .from('demanda_historico')
    .insert({
      demanda_id: demandaId,
      usuario_id: usuarioId,
      usuario_nome: usuarioNome,
      acao: 'status_alterado',
      status_anterior: statusAnterior,
      status_novo: 'concluido',
      observacoes,
    });

  if (historyError) throw historyError;
}

export async function fetchHistoricoDemanda(demandaId: string): Promise<DemandaHistorico[]> {
  const { data, error } = await supabase
    .from('demanda_historico')
    .select('*')
    .eq('demanda_id', demandaId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    demandaId: row.demanda_id,
    usuarioId: row.usuario_id,
    usuarioNome: row.usuario_nome,
    acao: row.acao as DemandaHistorico['acao'],
    statusAnterior: row.status_anterior || undefined,
    statusNovo: row.status_novo || undefined,
    observacoes: row.observacoes || undefined,
    createdAt: new Date(row.created_at),
  }));
}
