import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDemandas, fetchDemandaById, createDemanda, updateDemanda, deleteDemanda } from '@/services/demandasService';
import { Categoria, TipoDemanda, Prioridade } from '@/types/demanda';

export function useDemandas() {
  return useQuery({
    queryKey: ['demandas'],
    queryFn: fetchDemandas,
  });
}

export function useDemanda(id: string) {
  return useQuery({
    queryKey: ['demanda', id],
    queryFn: () => fetchDemandaById(id),
    enabled: !!id,
  });
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

export function useCreateDemanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDemandaInput) => createDemanda(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });
}

export function useUpdateDemanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateDemanda(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['demanda', variables.id] });
    },
  });
}

export function useDeleteDemanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDemanda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });
}
