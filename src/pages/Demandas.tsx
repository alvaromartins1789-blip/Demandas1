import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DemandaCard } from '@/components/dashboard/DemandaCard';
import { mockDemandas } from '@/data/mockDemandas';
import { StatusDemanda, statusLabels, Prioridade, prioridadeLabels, Categoria, categoriaLabels } from '@/types/demanda';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, Plus, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';

export default function Demandas() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusDemanda | 'all'>('all');
  const [prioridadeFilter, setPrioridadeFilter] = useState<Prioridade | 'all'>('all');
  const [categoriaFilter, setCategoriaFilter] = useState<Categoria | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDemandas = useMemo(() => {
    return mockDemandas.filter(demanda => {
      const matchesSearch = search === '' || 
        demanda.nomeProjeto.toLowerCase().includes(search.toLowerCase()) ||
        demanda.descricao.toLowerCase().includes(search.toLowerCase()) ||
        demanda.areaSolicitante.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || demanda.status === statusFilter;
      const matchesPrioridade = prioridadeFilter === 'all' || demanda.prioridade === prioridadeFilter;
      const matchesCategoria = categoriaFilter === 'all' || demanda.categoria === categoriaFilter;

      return matchesSearch && matchesStatus && matchesPrioridade && matchesCategoria;
    });
  }, [search, statusFilter, prioridadeFilter, categoriaFilter]);

  const hasFilters = statusFilter !== 'all' || prioridadeFilter !== 'all' || categoriaFilter !== 'all' || search !== '';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPrioridadeFilter('all');
    setCategoriaFilter('all');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Demandas</h1>
            <p className="text-muted-foreground">
              {filteredDemandas.length} demanda(s) encontrada(s)
            </p>
          </div>
          <Link to="/nova-demanda">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Solicitação
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 card-shadow border border-border/50 space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros</span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar demandas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusDemanda | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority */}
            <Select value={prioridadeFilter} onValueChange={(v) => setPrioridadeFilter(v as Prioridade | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                {Object.entries(prioridadeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category */}
            <Select value={categoriaFilter} onValueChange={(v) => setCategoriaFilter(v as Categoria | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {Object.entries(categoriaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'grid' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDemandas.map((demanda, index) => (
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
          <div className="bg-card rounded-xl card-shadow border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Projeto</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Área</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Prioridade</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDemandas.map((demanda) => (
                  <tr key={demanda.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <Link to={`/demanda/${demanda.id}`} className="hover:text-primary transition-colors">
                        <p className="font-medium text-foreground">{demanda.nomeProjeto}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{demanda.solicitante}</p>
                      </Link>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                      {demanda.areaSolicitante}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={demanda.status} />
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <PriorityBadge priority={demanda.prioridade} />
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(demanda.dataCriacao)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredDemandas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma demanda encontrada.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
