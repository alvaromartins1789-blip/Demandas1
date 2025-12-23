import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  aprovarTriagem,
  reprovarTriagem,
  concluirDemanda,
  fetchHistoricoDemanda,
} from '@/services/triagemService';
import { useToast } from '@/hooks/use-toast';

interface TriagemParams {
  demandaId: string;
  usuarioId: string;
  usuarioNome: string;
  observacoes: string;
}

export function useAprovarTriagem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: TriagemParams) => aprovarTriagem(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demanda', variables.demandaId] });
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['historico', variables.demandaId] });
      toast({
        title: 'Triagem aprovada',
        description: 'A demanda foi aprovada e encaminhada para desenvolvimento.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao aprovar triagem',
        description: error.message,
      });
    },
  });
}

export function useReprovarTriagem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: TriagemParams) => reprovarTriagem(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demanda', variables.demandaId] });
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['historico', variables.demandaId] });
      toast({
        title: 'Triagem reprovada',
        description: 'A demanda foi reprovada.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao reprovar triagem',
        description: error.message,
      });
    },
  });
}

export function useConcluirDemanda() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: TriagemParams) => concluirDemanda(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demanda', variables.demandaId] });
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['historico', variables.demandaId] });
      toast({
        title: 'Demanda concluída',
        description: 'A demanda foi marcada como concluída com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao concluir demanda',
        description: error.message,
      });
    },
  });
}

export function useHistoricoDemanda(demandaId: string) {
  return useQuery({
    queryKey: ['historico', demandaId],
    queryFn: () => fetchHistoricoDemanda(demandaId),
    enabled: !!demandaId,
  });
}
