import { Demanda, categoriaLabels } from '@/types/demanda';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Calendar, User, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface DemandaCardProps {
  demanda: Demanda;
  className?: string;
}

export function DemandaCard({ demanda, className }: DemandaCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  return (
    <Link 
      to={`/demanda/${demanda.id}`}
      className={cn(
        "block bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all duration-300 border border-border/50",
        "hover:-translate-y-1 cursor-pointer group",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
            {demanda.nomeProjeto}
          </h3>
          <PriorityBadge priority={demanda.prioridade} />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {demanda.descricao}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" />
            <span>{categoriaLabels[demanda.categoria]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{demanda.solicitante}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(demanda.dataCriacao)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <StatusBadge status={demanda.status} />
          <span className="text-xs text-muted-foreground">
            {demanda.areaSolicitante}
          </span>
        </div>
      </div>
    </Link>
  );
}
