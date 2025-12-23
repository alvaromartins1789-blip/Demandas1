import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDemanda, useDeleteDemanda } from '@/hooks/useDemandas';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { 
  StatusDemanda, 
  statusLabels, 
  categoriaLabels, 
  tipoLabels 
} from '@/types/demanda';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building, 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AIValidationPanel } from '@/components/ai/AIValidationPanel';
import { TriagemActions } from '@/components/triagem/TriagemActions';
import { HistoricoTimeline } from '@/components/triagem/HistoricoTimeline';

const statusFlow: StatusDemanda[] = [
  'triagem',
  'desenvolvimento',
  'concluido',
];

// Map actual status to simplified progress phase
const getProgressPhase = (status: StatusDemanda): StatusDemanda => {
  if (status === 'triagem') return 'triagem';
  if (status === 'desenvolvimento') return 'desenvolvimento';
  if (status === 'concluido') return 'concluido';
  if (status === 'reprovado') return 'reprovado';
  // Fallback for any other status
  return status;
};

export default function DetalheDemanda() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: demanda, isLoading, error } = useDemanda(id || '');
  const deleteDemanda = useDeleteDemanda();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteDemanda.mutateAsync(id);
      toast({
        title: "Demanda excluída",
        description: "A demanda foi removida com sucesso.",
      });
      navigate('/demandas');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
    }
  };

  const canEdit = demanda && user && demanda.solicitanteId === user.id;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !demanda) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Demanda não encontrada.</p>
          <Link to="/demandas" className="text-primary hover:underline mt-2 inline-block">
            Voltar para lista
          </Link>
        </div>
      </MainLayout>
    );
  }

  const currentPhase = getProgressPhase(demanda.status);
  const currentStatusIndex = statusFlow.indexOf(currentPhase);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link to="/demandas">
            <Button variant="ghost" size="icon" className="shrink-0 mt-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{demanda.nomeProjeto}</h1>
                <p className="text-muted-foreground mt-1">ID: #{demanda.id.slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={demanda.status} />
                <PriorityBadge priority={demanda.prioridade} />
                {canEdit && (
                  <>
                    <Link to={`/demanda/${id}/editar`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir demanda?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A demanda "{demanda.nomeProjeto}" será permanentemente removida.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteDemanda.isPending ? 'Excluindo...' : 'Excluir'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {demanda.status !== 'reprovado' && (
          <div className="bg-card rounded-xl p-6 card-shadow border border-border/50">
            <h2 className="text-lg font-semibold text-card-foreground mb-6">Progresso</h2>
            
            <div className="flex items-center justify-between">
              {statusFlow.map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isPending = index > currentStatusIndex;

                return (
                  <div key={status} className="flex-1 flex items-center">
                    {/* Step */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        isCompleted && "bg-success text-success-foreground",
                        isCurrent && "bg-primary text-primary-foreground animate-pulse-soft",
                        isPending && "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs mt-2 text-center max-w-[80px]",
                        isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {statusLabels[status]}
                      </span>
                    </div>

                    {/* Connector */}
                    {index < statusFlow.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-2",
                        index < currentStatusIndex ? "bg-success" : "bg-muted"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed">
                {demanda.descricao}
              </p>
            </div>

            {/* Objective */}
            <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Objetivo Esperado</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {demanda.objetivoEsperado}
              </p>
            </div>

            {/* Impact */}
            {(demanda.kpiImpactado || demanda.eficienciaEsperada) && (
              <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <h2 className="text-lg font-semibold text-card-foreground">Impacto e Eficiência</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {demanda.kpiImpactado && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">KPI Impactado</p>
                      <p className="font-medium text-foreground mt-1">{demanda.kpiImpactado}</p>
                    </div>
                  )}
                  {demanda.eficienciaEsperada && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Eficiência Esperada</p>
                      <p className="font-medium text-foreground mt-1">{demanda.eficienciaEsperada}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Development Info */}
            {(demanda.estimativaHoras || demanda.horasReais) && (
              <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <h2 className="text-lg font-semibold text-card-foreground">Desenvolvimento</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {demanda.estimativaHoras && (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-foreground">{demanda.estimativaHoras}h</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Estimado</p>
                    </div>
                  )}
                  {demanda.horasReais && (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-foreground">{demanda.horasReais}h</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Realizado</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Triagem Actions - Only for admin/gestor when status is triagem or triagem-tecnica */}
            <TriagemActions demanda={demanda} />

            {/* Histórico Timeline */}
            <HistoricoTimeline demandaId={demanda.id} />

            {/* AI Validation Panel */}
            <AIValidationPanel demanda={demanda} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground">Detalhes</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Solicitante</p>
                    <p className="text-sm font-medium text-foreground">{demanda.solicitante}</p>
                  </div>
                </div>

                {demanda.responsavelTecnico && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Responsável Técnico</p>
                      <p className="text-sm font-medium text-foreground">{demanda.responsavelTecnico}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Building className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Área</p>
                    <p className="text-sm font-medium text-foreground">{demanda.areaSolicitante}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Categoria / Tipo</p>
                    <p className="text-sm font-medium text-foreground">
                      {categoriaLabels[demanda.categoria]} • {tipoLabels[demanda.tipo]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Criado em</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(demanda.dataCriacao)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última atualização</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(demanda.dataAtualizacao)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Triagem Info */}
            {demanda.statusTriagem && (
              <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-3">
                <h2 className="text-lg font-semibold text-card-foreground">Triagem</h2>
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium",
                  demanda.statusTriagem === 'aprovado' && "bg-success/15 text-success",
                  demanda.statusTriagem === 'reprovado' && "bg-destructive/15 text-destructive",
                  demanda.statusTriagem === 'pendente' && "bg-warning/15 text-warning"
                )}>
                  {demanda.statusTriagem === 'aprovado' && 'Aprovado'}
                  {demanda.statusTriagem === 'reprovado' && 'Reprovado'}
                  {demanda.statusTriagem === 'pendente' && 'Pendente'}
                </div>
                {demanda.observacoesTriagem && (
                  <p className="text-sm text-muted-foreground">{demanda.observacoesTriagem}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
