import { cn } from '@/lib/utils';
import { StatusDemanda, statusLabels } from '@/types/demanda';

interface StatusBadgeProps {
  status: StatusDemanda;
  className?: string;
}

const statusStyles: Record<StatusDemanda, string> = {
  'triagem': 'bg-status-triagem/15 text-status-triagem border-status-triagem/30',
  'triagem-tecnica': 'bg-status-triagem-tecnica/15 text-status-triagem-tecnica border-status-triagem-tecnica/30',
  'pdd': 'bg-status-pdd/15 text-status-pdd border-status-pdd/30',
  'desenvolvimento': 'bg-status-desenvolvimento/15 text-status-desenvolvimento border-status-desenvolvimento/30',
  'homologacao': 'bg-status-homologacao/15 text-status-homologacao border-status-homologacao/30',
  'golive': 'bg-status-golive/15 text-status-golive border-status-golive/30',
  'concluido': 'bg-status-concluido/15 text-status-concluido border-status-concluido/30',
  'reprovado': 'bg-status-reprovado/15 text-status-reprovado border-status-reprovado/30',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
