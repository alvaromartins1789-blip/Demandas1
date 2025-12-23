import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyzeInsightData {
  nomeProjeto?: string;
  descricao?: string;
  objetivoEsperado?: string;
  categoria?: string;
  tipo?: string;
  prioridade?: string;
  areaSolicitante?: string;
  kpiImpactado?: string;
  eficienciaEsperada?: string;
}

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  type?: string;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeInsight = async (data: AnalyzeInsightData): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'analyze_insight',
          data,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      return response as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao analisar com IA';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const validateIdea = async (data: AnalyzeInsightData): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'validate_idea',
          data,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      return response as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao validar ideia';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const improveSuggestion = async (descricao: string, objetivoEsperado: string): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'improve_suggestion',
          data: { descricao, objetivoEsperado },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      return response as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao melhorar sugestão';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const generateSectorAnalysis = async (demandas: any[]): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'sector_analysis',
          data: { demandas },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      return response as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar análise setorial';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const generateProductivityReport = async (demandas: any[]): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'productivity_report',
          data: { demandas },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      return response as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar relatório';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const findSimilarDemands = async (novaDemanda: any, demandasExistentes: any[]): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'find_similar_demands',
          data: { novaDemanda, demandasExistentes },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      return response as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar demandas similares';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    analyzeInsight,
    validateIdea,
    improveSuggestion,
    generateSectorAnalysis,
    generateProductivityReport,
    findSimilarDemands,
  };
}
