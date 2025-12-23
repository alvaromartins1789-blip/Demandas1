import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DemandaCard } from '@/components/dashboard/DemandaCard';
import { StatusPipeline } from '@/components/dashboard/StatusPipeline';
import { useDemandas } from '@/hooks/useDemandas';
import { StatusDemanda } from '@/types/demanda';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  FolderOpen,
  PlayCircle,
  XCircle
} from 'lucide-react';

export default function Dashboard() {
  const [activeStatus, setActiveStatus] = useState<StatusDemanda | null>(null);
  const { data: demandas = [], isLoading, error } = useDemandas();

  const stats = useMemo(() => {
    const total = demandas.length;
    // Em Aberto: demandas aguardando triagem
    const emAberto = demandas.filter(d => d.status === 'triagem').length;
    // Em Desenvolvimento: demandas aprovadas que estão sendo trabalhadas
    const emDesenvolvimento = demandas.filter(d => d.status === 'desenvolvimento').length;
    // Concluídas
    const concluidas = demandas.filter(d => d.status === 'concluido').length;
    // Reprovadas
    const reprovadas = demandas.filter(d => d.status === 'reprovado').length;
    // Aceitas = desenvolvimento + concluídas (foram aprovadas na triagem)
    const aceitas = emDesenvolvimento + concluidas;
    
    // Percentuais (baseado no total, excluindo em aberto)
    const totalTriadas = aceitas + reprovadas;
    const percentualAceitas = totalTriadas > 0 ? Math.round((aceitas / totalTriadas) * 100) : 0;
    const percentualReprovadas = totalTriadas > 0 ? Math.round((reprovadas / totalTriadas) * 100) : 0;

    return { 
      total, 
      emAberto, 
      emDesenvolvimento, 
      concluidas, 
      reprovadas, 
      aceitas,
      percentualAceitas,
      percentualReprovadas
    };
  }, [demandas]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusDemanda, number> = {
      'triagem': 0,
      'triagem-tecnica': 0,
      'pdd': 0,
      'desenvolvimento': 0,
      'homologacao': 0,
      'golive': 0,
      'concluido': 0,
      'reprovado': 0,
    };

    demandas.forEach(d => {
      counts[d.status]++;
    });

    return counts;
  }, [demandas]);

  const filteredDemandas = useMemo(() => {
    if (!activeStatus) return demandas;
    return demandas.filter(d => d.status === activeStatus);
  }, [activeStatus, demandas]);

  const recentDemandas = useMemo(() => {
    return [...filteredDemandas]
      .sort((a, b) => b.dataAtualizacao.getTime() - a.dataAtualizacao.getTime())
      .slice(0, 6);
  }, [filteredDemandas]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar demandas.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhamento de solicitações de demandas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Solicitações de Demandas"
            value={stats.total}
            icon={FileText}
            iconClassName="bg-primary text-primary-foreground"
          />
          <StatCard
            title="Em Aberto"
            value={stats.emAberto}
            subtitle="Aguardando triagem"
            icon={FolderOpen}
            iconClassName="bg-warning text-warning-foreground"
          />
          <StatCard
            title="Em Desenvolvimento"
            value={stats.emDesenvolvimento}
            icon={PlayCircle}
            iconClassName="bg-info text-info-foreground"
          />
          <StatCard
            title="Concluídas"
            value={stats.concluidas}
            icon={CheckCircle2}
            iconClassName="bg-success text-success-foreground"
          />
          <StatCard
            title="Aceitas"
            value={stats.aceitas}
            subtitle={stats.percentualAceitas > 0 ? `${stats.percentualAceitas}% das triadas` : undefined}
            icon={CheckCircle2}
            iconClassName="bg-success/80 text-success-foreground"
          />
          <StatCard
            title="Reprovadas"
            value={stats.reprovadas}
            subtitle={stats.percentualReprovadas > 0 ? `${stats.percentualReprovadas}% das triadas` : undefined}
            icon={XCircle}
            iconClassName="bg-destructive text-destructive-foreground"
          />
        </div>

        {/* Pipeline */}
        <StatusPipeline 
          counts={statusCounts}
          activeStatus={activeStatus}
          onStatusClick={(status) => setActiveStatus(status === activeStatus ? null : status)}
        />

        {/* Recent Demands */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {activeStatus ? `Demandas - ${activeStatus}` : 'Demandas Recentes'}
            </h2>
            {activeStatus && (
              <button
                onClick={() => setActiveStatus(null)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Ver todas
              </button>
            )}
          </div>

          {recentDemandas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDemandas.map((demanda, index) => (
                <div 
                  key={demanda.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fade-in"
                >
                  <DemandaCard demanda={demanda} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {activeStatus 
                ? 'Nenhuma demanda encontrada para este status.'
                : 'Nenhuma demanda cadastrada ainda. Crie sua primeira solicitação!'}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
