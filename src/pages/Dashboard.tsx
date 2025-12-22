import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DemandaCard } from '@/components/dashboard/DemandaCard';
import { StatusPipeline } from '@/components/dashboard/StatusPipeline';
import { mockDemandas } from '@/data/mockDemandas';
import { StatusDemanda } from '@/types/demanda';
import { 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [activeStatus, setActiveStatus] = useState<StatusDemanda | null>(null);

  const stats = useMemo(() => {
    const total = mockDemandas.length;
    const emAndamento = mockDemandas.filter(d => 
      !['concluido', 'reprovado'].includes(d.status)
    ).length;
    const concluidas = mockDemandas.filter(d => d.status === 'concluido').length;
    const urgentes = mockDemandas.filter(d => d.prioridade === 'urgente').length;

    return { total, emAndamento, concluidas, urgentes };
  }, []);

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

    mockDemandas.forEach(d => {
      counts[d.status]++;
    });

    return counts;
  }, []);

  const filteredDemandas = useMemo(() => {
    if (!activeStatus) return mockDemandas;
    return mockDemandas.filter(d => d.status === activeStatus);
  }, [activeStatus]);

  const recentDemandas = useMemo(() => {
    return [...filteredDemandas]
      .sort((a, b) => b.dataAtualizacao.getTime() - a.dataAtualizacao.getTime())
      .slice(0, 6);
  }, [filteredDemandas]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhamento de solicitações de demandas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Demandas"
            value={stats.total}
            icon={ListTodo}
            iconClassName="bg-primary text-primary-foreground"
          />
          <StatCard
            title="Em Andamento"
            value={stats.emAndamento}
            icon={Clock}
            iconClassName="bg-warning text-warning-foreground"
          />
          <StatCard
            title="Concluídas"
            value={stats.concluidas}
            icon={CheckCircle2}
            iconClassName="bg-success text-success-foreground"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Urgentes"
            value={stats.urgentes}
            icon={AlertTriangle}
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

          {recentDemandas.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma demanda encontrada para este status.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
