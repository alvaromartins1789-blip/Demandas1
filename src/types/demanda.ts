export type StatusDemanda = 
  | 'triagem'
  | 'triagem-tecnica'
  | 'pdd'
  | 'desenvolvimento'
  | 'homologacao'
  | 'golive'
  | 'concluido'
  | 'reprovado';

export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente';

export type Categoria = 'aplicativo' | 'automacao' | 'dashboard';

export type TipoDemanda = 'criacao' | 'ajuste' | 'manutencao';

export interface Demanda {
  id: string;
  nomeProjeto: string;
  descricao: string;
  objetivoEsperado: string;
  areaSolicitante: string;
  categoria: Categoria;
  tipo: TipoDemanda;
  prioridade: Prioridade;
  kpiImpactado: string;
  eficienciaEsperada: string;
  status: StatusDemanda;
  dataCriacao: Date;
  dataAtualizacao: Date;
  solicitante: string;
  solicitanteId?: string;
  responsavelTecnico?: string;
  responsavelTecnicoId?: string;
  
  // Triagem
  statusTriagem?: 'aprovado' | 'reprovado' | 'pendente';
  observacoesTriagem?: string;
  
  // Triagem Técnica
  statusTriagemTecnica?: 'aprovado' | 'reprovado' | 'pendente';
  dependencias?: string;
  justificativaTecnica?: string;
  
  // Desenvolvimento
  estimativaHoras?: number;
  horasReais?: number;
  
  // Homologação
  statusHomologacao?: 'aprovado' | 'reprovado' | 'pendente';
  linkGravacao?: string;
  
  // Go Live
  feedbacks?: string[];
  documentacaoAjustes?: string;
}

export const statusLabels: Record<StatusDemanda, string> = {
  'triagem': 'Triagem',
  'triagem-tecnica': 'Triagem Técnica',
  'pdd': 'Elaboração PDD',
  'desenvolvimento': 'Desenvolvimento',
  'homologacao': 'Homologação',
  'golive': 'Go Live',
  'concluido': 'Concluído',
  'reprovado': 'Reprovado',
};

export const prioridadeLabels: Record<Prioridade, string> = {
  'baixa': 'Baixa',
  'media': 'Média',
  'alta': 'Alta',
  'urgente': 'Urgente',
};

export const categoriaLabels: Record<Categoria, string> = {
  'aplicativo': 'Aplicativo',
  'automacao': 'Automação',
  'dashboard': 'Dashboard',
};

export const tipoLabels: Record<TipoDemanda, string> = {
  'criacao': 'Criação',
  'ajuste': 'Ajuste',
  'manutencao': 'Manutenção',
};
