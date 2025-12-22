import { StatusDemanda, statusLabels } from '@/types/demanda';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Microscope, 
  FileText, 
  Code, 
  CheckCircle2, 
  Rocket, 
  Trophy,
  XCircle
} from 'lucide-react';

interface StatusPipelineProps {
  counts: Record<StatusDemanda, number>;
  onStatusClick?: (status: StatusDemanda) => void;
  activeStatus?: StatusDemanda | null;
}

const statusConfig: Record<StatusDemanda, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'triagem': { icon: Search, color: 'bg-status-triagem' },
  'triagem-tecnica': { icon: Microscope, color: 'bg-status-triagem-tecnica' },
  'pdd': { icon: FileText, color: 'bg-status-pdd' },
  'desenvolvimento': { icon: Code, color: 'bg-status-desenvolvimento' },
  'homologacao': { icon: CheckCircle2, color: 'bg-status-homologacao' },
  'golive': { icon: Rocket, color: 'bg-status-golive' },
  'concluido': { icon: Trophy, color: 'bg-status-concluido' },
  'reprovado': { icon: XCircle, color: 'bg-status-reprovado' },
};

const pipelineOrder: StatusDemanda[] = [
  'triagem',
  'triagem-tecnica',
  'pdd',
  'desenvolvimento',
  'homologacao',
  'golive',
  'concluido',
];

export function StatusPipeline({ counts, onStatusClick, activeStatus }: StatusPipelineProps) {
  return (
    <div className="bg-card rounded-xl p-6 card-shadow border border-border/50">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Pipeline de Demandas</h3>
      
      <div className="flex items-stretch gap-1">
        {pipelineOrder.map((status, index) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const count = counts[status] || 0;
          const isActive = activeStatus === status;
          
          return (
            <button
              key={status}
              onClick={() => onStatusClick?.(status)}
              className={cn(
                "flex-1 relative group transition-all duration-300",
                "hover:scale-105 hover:z-10",
                isActive && "scale-105 z-10"
              )}
            >
              {/* Connector line */}
              {index > 0 && (
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-0.5 bg-border" />
              )}
              
              <div className={cn(
                "rounded-xl p-4 transition-all duration-300 border-2",
                isActive 
                  ? `${config.color} border-transparent` 
                  : "bg-muted/50 border-transparent hover:border-border"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2",
                  isActive ? "bg-background/20" : config.color + "/15"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary-foreground" : config.color.replace('bg-', 'text-')
                  )} />
                </div>
                
                <p className={cn(
                  "text-2xl font-bold text-center",
                  isActive ? "text-primary-foreground" : "text-card-foreground"
                )}>
                  {count}
                </p>
                
                <p className={cn(
                  "text-xs text-center mt-1 line-clamp-1",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {statusLabels[status]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reprovado indicator */}
      {counts['reprovado'] > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => onStatusClick?.('reprovado')}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
              activeStatus === 'reprovado' 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-destructive/10 hover:bg-destructive/20"
            )}
          >
            <XCircle className={cn(
              "w-4 h-4",
              activeStatus === 'reprovado' ? "text-destructive-foreground" : "text-destructive"
            )} />
            <span className={cn(
              "text-sm font-medium",
              activeStatus === 'reprovado' ? "text-destructive-foreground" : "text-destructive"
            )}>
              {counts['reprovado']} Reprovado(s)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
