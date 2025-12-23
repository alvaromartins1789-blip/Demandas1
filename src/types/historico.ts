export interface DemandaHistorico {
  id: string;
  demandaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: 'criacao' | 'triagem_aprovada' | 'triagem_reprovada' | 'triagem_tecnica_aprovada' | 'triagem_tecnica_reprovada' | 'status_alterado';
  statusAnterior?: string;
  statusNovo?: string;
  observacoes?: string;
  createdAt: Date;
}

export const acaoLabels: Record<DemandaHistorico['acao'], string> = {
  'criacao': 'Demanda criada',
  'triagem_aprovada': 'Triagem aprovada',
  'triagem_reprovada': 'Triagem reprovada',
  'triagem_tecnica_aprovada': 'Triagem técnica aprovada',
  'triagem_tecnica_reprovada': 'Triagem técnica reprovada',
  'status_alterado': 'Status alterado',
};
