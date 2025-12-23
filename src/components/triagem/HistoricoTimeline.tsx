import { useHistoricoDemanda } from '@/hooks/useTriagem';
import { acaoLabels } from '@/types/historico';
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  Loader2,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoricoTimelineProps {
  demandaId: string;
}

export function HistoricoTimeline({ demandaId }: HistoricoTimelineProps) {
  const { data: historico, isLoading } = useHistoricoDemanda(demandaId);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getAcaoIcon = (acao: string) => {
    if (acao.includes('aprovada')) {
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    }
    if (acao.includes('reprovada')) {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    if (acao === 'criacao') {
      return <FileText className="w-4 h-4 text-primary" />;
    }
    return <Clock className="w-4 h-4 text-warning" />;
  };

  const getAcaoColor = (acao: string) => {
    if (acao.includes('aprovada')) return 'border-success/30 bg-success/5';
    if (acao.includes('reprovada')) return 'border-destructive/30 bg-destructive/5';
    if (acao === 'criacao') return 'border-primary/30 bg-primary/5';
    return 'border-warning/30 bg-warning/5';
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 card-shadow border border-border/50">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!historico || historico.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Histórico de Ações</h2>
      </div>

      <div className="space-y-3">
        {historico.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "relative pl-6 pb-3",
              index < historico.length - 1 && "border-l-2 border-border ml-2"
            )}
          >
            {/* Dot */}
            <div className={cn(
              "absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center",
              index < historico.length - 1 ? "top-0" : "top-0",
              item.acao.includes('aprovada') && "border-success",
              item.acao.includes('reprovada') && "border-destructive",
              item.acao === 'criacao' && "border-primary",
              !item.acao.includes('aprovada') && !item.acao.includes('reprovada') && item.acao !== 'criacao' && "border-warning"
            )} />

            <div className={cn(
              "rounded-lg border p-3 ml-2",
              getAcaoColor(item.acao)
            )}>
              <div className="flex items-start gap-2">
                {getAcaoIcon(item.acao)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {acaoLabels[item.acao] || item.acao}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    por <span className="font-medium text-foreground">{item.usuarioNome}</span>
                  </p>
                  {item.observacoes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{item.observacoes}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
