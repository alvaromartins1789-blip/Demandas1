import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAI } from '@/hooks/useAI';
import { useDemandas } from '@/hooks/useDemandas';

interface SimilarDemand {
  id: string;
  score: number;
  motivo: string;
}

interface SimilarDemandsAlertProps {
  formData: {
    descricao: string;
    objetivoEsperado: string;
    categoria: string;
    tipo: string;
  };
  onDismiss?: () => void;
}

export function SimilarDemandsAlert({ formData, onDismiss }: SimilarDemandsAlertProps) {
  const [similarDemands, setSimilarDemands] = useState<SimilarDemand[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastSearched, setLastSearched] = useState('');
  
  const { findSimilarDemands } = useAI();
  const { data: allDemandas } = useDemandas();

  const searchSimilar = useCallback(async () => {
    if (!formData.descricao || formData.descricao.length < 20) return;
    if (!allDemandas || allDemandas.length === 0) return;
    
    const searchKey = `${formData.descricao}-${formData.objetivoEsperado}`;
    if (searchKey === lastSearched) return;
    
    setIsSearching(true);
    setLastSearched(searchKey);
    
    try {
      const novaDemanda = {
        descricao: formData.descricao,
        objetivoEsperado: formData.objetivoEsperado,
        categoria: formData.categoria,
        tipo: formData.tipo,
      };
      
      const demandasExistentes = allDemandas.map(d => ({
        id: d.id,
        nomeProjeto: d.nomeProjeto,
        descricao: d.descricao,
        objetivoEsperado: d.objetivoEsperado,
        categoria: d.categoria,
        tipo: d.tipo,
        status: d.status,
      }));

      const result = await findSimilarDemands(novaDemanda, demandasExistentes);
      
      if (result.success && result.response) {
        try {
          const parsed = JSON.parse(result.response);
          if (parsed.similares && Array.isArray(parsed.similares)) {
            setSimilarDemands(parsed.similares.filter((s: SimilarDemand) => s.score >= 60));
          }
        } catch {
          console.error('Erro ao parsear resposta da IA:', result.response);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar demandas similares:', error);
    } finally {
      setIsSearching(false);
    }
  }, [formData, allDemandas, lastSearched, findSimilarDemands]);

  // Debounce search when description changes
  useEffect(() => {
    if (dismissed) return;
    
    const timer = setTimeout(() => {
      searchSimilar();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [formData.descricao, formData.objetivoEsperado, searchSimilar, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setSimilarDemands([]);
    onDismiss?.();
  };

  const getDemandaName = (id: string) => {
    const demanda = allDemandas?.find(d => d.id === id);
    return demanda?.nomeProjeto || 'Demanda';
  };

  if (dismissed) return null;

  if (isSearching) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando demandas similares...</span>
      </div>
    );
  }

  if (similarDemands.length === 0) return null;

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="flex items-center justify-between">
        <span className="text-amber-600 dark:text-amber-400">
          Demandas similares encontradas
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-3">
        <p className="text-sm text-muted-foreground">
          Encontramos demandas parecidas com a sua. Verifique se já não existe algo similar:
        </p>
        
        <div className="space-y-2">
          {similarDemands.map((similar) => (
            <div
              key={similar.id}
              className="flex items-center justify-between gap-3 p-3 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {getDemandaName(similar.id)}
                  </span>
                  <Badge variant="outline" className="shrink-0">
                    {similar.score}% similar
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {similar.motivo}
                </p>
              </div>
              <Link to={`/demandas/${similar.id}`} target="_blank">
                <Button variant="outline" size="sm" className="shrink-0 gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Ver
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground italic">
          Você pode continuar criando sua demanda normalmente se for diferente.
        </p>
      </AlertDescription>
    </Alert>
  );
}
