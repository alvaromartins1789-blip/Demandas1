import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Lightbulb, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/lib/utils';
import { Demanda, categoriaLabels, tipoLabels, prioridadeLabels } from '@/types/demanda';

interface AIValidationPanelProps {
  demanda: Demanda;
}

export function AIValidationPanel({ demanda }: AIValidationPanelProps) {
  const { validateIdea, improveSuggestion, isLoading } = useAI();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [improvement, setImprovement] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'validate' | 'improve'>('validate');

  const handleValidate = async () => {
    setIsExpanded(true);
    setActiveTab('validate');
    const result = await validateIdea({
      nomeProjeto: demanda.nomeProjeto,
      descricao: demanda.descricao,
      objetivoEsperado: demanda.objetivoEsperado,
      categoria: categoriaLabels[demanda.categoria],
      tipo: tipoLabels[demanda.tipo],
      prioridade: prioridadeLabels[demanda.prioridade],
      areaSolicitante: demanda.areaSolicitante,
      kpiImpactado: demanda.kpiImpactado,
      eficienciaEsperada: demanda.eficienciaEsperada,
    });
    
    if (result.success && result.response) {
      setAnalysis(result.response);
    } else {
      setAnalysis(`Erro: ${result.error || 'Não foi possível validar a demanda.'}`);
    }
  };

  const handleImprove = async () => {
    setIsExpanded(true);
    setActiveTab('improve');
    const result = await improveSuggestion(demanda.descricao, demanda.objetivoEsperado);
    
    if (result.success && result.response) {
      setImprovement(result.response);
    } else {
      setImprovement(`Erro: ${result.error || 'Não foi possível gerar sugestões de melhoria.'}`);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Assistente IA</h3>
            <p className="text-xs text-muted-foreground">Valide e melhore esta demanda com inteligência artificial</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Collapsed Actions */}
      {!isExpanded && (
        <div className="px-5 py-3 border-t border-border/50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleValidate(); }}
            disabled={isLoading}
            className="gap-1.5 flex-1"
          >
            {isLoading && activeTab === 'validate' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Validar Ideia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleImprove(); }}
            disabled={isLoading}
            className="gap-1.5 flex-1"
          >
            {isLoading && activeTab === 'improve' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lightbulb className="w-3.5 h-3.5" />
            )}
            Sugerir Melhorias
          </Button>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border/50">
          {/* Tabs */}
          <div className="flex border-b border-border/50">
            <button
              onClick={() => setActiveTab('validate')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === 'validate' 
                  ? "text-primary border-b-2 border-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Validação
              </div>
            </button>
            <button
              onClick={() => setActiveTab('improve')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === 'improve' 
                  ? "text-primary border-b-2 border-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Melhorias
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {activeTab === 'validate' && (
              <div className="space-y-4">
                {!analysis ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Clique para validar esta demanda com IA
                    </p>
                    <Button onClick={handleValidate} disabled={isLoading} className="gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Validar Demanda
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleValidate}
                        disabled={isLoading}
                        className="gap-1.5"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Reanalisar
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                        {analysis}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'improve' && (
              <div className="space-y-4">
                {!improvement ? (
                  <div className="text-center py-8">
                    <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Clique para receber sugestões de melhoria
                    </p>
                    <Button onClick={handleImprove} disabled={isLoading} className="gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando sugestões...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4" />
                          Gerar Sugestões
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleImprove}
                        disabled={isLoading}
                        className="gap-1.5"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Gerar novamente
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                        {improvement}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
