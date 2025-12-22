import { supabase } from '@/integrations/supabase/client';
import { Demanda, StatusDemanda, Prioridade, Categoria, TipoDemanda } from '@/types/demanda';
import { Database } from '@/integrations/supabase/types';

type DbDemanda = Database['public']['Tables']['demandas']['Row'];
type DbInsertDemanda = Database['public']['Tables']['demandas']['Insert'];

// Convert database row to Demanda type
function mapDbToClient(row: DbDemanda): Demanda {
  return {
    id: row.id,
    nomeProjeto: row.nome_projeto,
    descricao: row.descricao,
    objetivoEsperado: row.objetivo_esperado,
    areaSolicitante: row.area_solicitante,
    categoria: row.categoria as Categoria,
    tipo: row.tipo as TipoDemanda,
    prioridade: row.prioridade as Prioridade,
    kpiImpactado: row.kpi_impactado || '',
    eficienciaEsperada: row.eficiencia_esperada || '',
    status: row.status as StatusDemanda,
    dataCriacao: new Date(row.created_at),
    dataAtualizacao: new Date(row.updated_at),
    solicitante: '', // Will be fetched separately if needed
    solicitanteId: row.solicitante_id,
    responsavelTecnico: undefined,
    responsavelTecnicoId: row.responsavel_tecnico_id || undefined,
    statusTriagem: row.status_triagem as 'aprovado' | 'reprovado' | 'pendente' | undefined,
    observacoesTriagem: row.observacoes_triagem || undefined,
    statusTriagemTecnica: row.status_triagem_tecnica as 'aprovado' | 'reprovado' | 'pendente' | undefined,
    dependencias: row.dependencias || undefined,
    justificativaTecnica: row.justificativa_tecnica || undefined,
    estimativaHoras: row.estimativa_horas || undefined,
    horasReais: row.horas_reais || undefined,
    statusHomologacao: row.status_homologacao as 'aprovado' | 'reprovado' | 'pendente' | undefined,
    linkGravacao: row.link_gravacao || undefined,
    feedbacks: row.feedbacks || undefined,
    documentacaoAjustes: row.documentacao_ajustes || undefined,
  };
}

export async function fetchDemandas(): Promise<Demanda[]> {
  // Fetch demandas first
  const { data: demandas, error: demandasError } = await supabase
    .from('demandas')
    .select('*')
    .order('created_at', { ascending: false });

  if (demandasError) {
    console.error('Error fetching demandas:', demandasError);
    throw demandasError;
  }

  if (!demandas || demandas.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set([
    ...demandas.map(d => d.solicitante_id),
    ...demandas.filter(d => d.responsavel_tecnico_id).map(d => d.responsavel_tecnico_id!)
  ])];

  // Fetch profiles for those users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .in('id', userIds);

  const profilesMap = new Map((profiles || []).map(p => [p.id, p.nome]));

  return demandas.map(row => ({
    ...mapDbToClient(row),
    solicitante: profilesMap.get(row.solicitante_id) || 'Usuário',
    responsavelTecnico: row.responsavel_tecnico_id ? profilesMap.get(row.responsavel_tecnico_id) : undefined,
  }));
}

export async function fetchDemandaById(id: string): Promise<Demanda | null> {
  const { data, error } = await supabase
    .from('demandas')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching demanda:', error);
    throw error;
  }

  if (!data) return null;

  // Fetch profile names separately
  const userIds = [data.solicitante_id, data.responsavel_tecnico_id].filter(Boolean) as string[];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .in('id', userIds);

  const profilesMap = new Map((profiles || []).map(p => [p.id, p.nome]));

  return {
    ...mapDbToClient(data),
    solicitante: profilesMap.get(data.solicitante_id) || 'Usuário',
    responsavelTecnico: data.responsavel_tecnico_id ? profilesMap.get(data.responsavel_tecnico_id) : undefined,
  };
}

interface CreateDemandaInput {
  nomeProjeto: string;
  descricao: string;
  objetivoEsperado: string;
  areaSolicitante: string;
  categoria: Categoria;
  tipo: TipoDemanda;
  prioridade: Prioridade;
  kpiImpactado?: string;
  eficienciaEsperada?: string;
  solicitanteId: string;
}

export async function createDemanda(input: CreateDemandaInput): Promise<Demanda> {
  const insertData: DbInsertDemanda = {
    nome_projeto: input.nomeProjeto,
    descricao: input.descricao,
    objetivo_esperado: input.objetivoEsperado,
    area_solicitante: input.areaSolicitante,
    categoria: input.categoria,
    tipo: input.tipo,
    prioridade: input.prioridade,
    kpi_impactado: input.kpiImpactado || null,
    eficiencia_esperada: input.eficienciaEsperada || null,
    solicitante_id: input.solicitanteId,
    status: 'triagem',
    status_triagem: 'pendente',
  };

  const { data, error } = await supabase
    .from('demandas')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating demanda:', error);
    throw error;
  }

  return mapDbToClient(data);
}

export async function updateDemanda(id: string, updates: Partial<DbInsertDemanda>): Promise<Demanda> {
  const { data, error } = await supabase
    .from('demandas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating demanda:', error);
    throw error;
  }

  return mapDbToClient(data);
}

export async function deleteDemanda(id: string): Promise<void> {
  const { error } = await supabase
    .from('demandas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting demanda:', error);
    throw error;
  }
}
