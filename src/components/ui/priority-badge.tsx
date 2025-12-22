import { cn } from '@/lib/utils';
import { Prioridade, prioridadeLabels } from '@/types/demanda';
import { AlertTriangle, ArrowDown, ArrowUp, Zap } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Prioridade;
  className?: string;
  showIcon?: boolean;
}

const priorityStyles: Record<Prioridade, string> = {
  'baixa': 'bg-priority-baixa/15 text-priority-baixa border-priority-baixa/30',
  'media': 'bg-priority-media/15 text-priority-media border-priority-media/30',
  'alta': 'bg-priority-alta/15 text-priority-alta border-priority-alta/30',
  'urgente': 'bg-priority-urgente/15 text-priority-urgente border-priority-urgente/30',
};

const priorityIcons: Record<Prioridade, React.ComponentType<{ className?: string }>> = {
  'baixa': ArrowDown,
  'media': ArrowUp,
  'alta': AlertTriangle,
  'urgente': Zap,
};

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
  const Icon = priorityIcons[priority];
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        priorityStyles[priority],
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {prioridadeLabels[priority]}
    </span>
  );
}
