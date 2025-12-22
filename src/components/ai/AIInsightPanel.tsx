import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle, AlertCircle, Lightbulb, X } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/lib/utils';

interface AIInsightPanelProps {
  formData: {
    nomeProjeto: string;
    descricao: string;
    objetivoEsperado: string;
    categoria: string;
    tipo: string;
    prioridade: string;
    areaSolicitante: string;
    kpiImpactado?: string;
    eficienciaEsperada?: string;
  };
  onClose?: () => void;
}

export function AIInsightPanel({ formData, onClose }: AIInsightPanelProps) {
  const { analyzeInsight, isLoading } = useAI();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    const result = await analyzeInsight(formData);
    if (result.success && result.response) {
      setAnalysis(result.response);
      setHasAnalyzed(true);
    } else {
      setAnalysis(`Erro: ${result.error || 'Não foi possível analisar a demanda.'}`);
    }
  };

  const canAnalyze = formData.descricao.length > 20 && formData.objetivoEsperado.length > 10;

  if (!hasAnalyzed) {
    return (
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-primary/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">Validação com IA</h3>
              <p className="text-sm text-muted-foreground">
                Utilize inteligência artificial para validar e melhorar sua demanda antes de enviar.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={!canAnalyze || isLoading}
              className="gap-2 border-primary/30 hover:bg-primary/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Validar com IA
                </>
              )}
            </Button>
            {!canAnalyze && (
              <p className="text-xs text-muted-foreground">
                Preencha a descrição e objetivo esperado para habilitar a validação.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-primary/10 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Análise da IA</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="h-7 text-xs gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Reanalisar
              </>
            )}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
