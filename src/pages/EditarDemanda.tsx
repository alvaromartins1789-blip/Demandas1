import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Prioridade, 
  Categoria, 
  TipoDemanda, 
  prioridadeLabels, 
  categoriaLabels, 
  tipoLabels 
} from '@/types/demanda';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDemanda, useUpdateDemanda } from '@/hooks/useDemandas';

export default function EditarDemanda() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: demanda, isLoading, error } = useDemanda(id || '');
  const updateDemanda = useUpdateDemanda();

  const [formData, setFormData] = useState({
    nomeProjeto: '',
    descricao: '',
    objetivoEsperado: '',
    areaSolicitante: '',
    categoria: '' as Categoria | '',
    tipo: '' as TipoDemanda | '',
    prioridade: '' as Prioridade | '',
    kpiImpactado: '',
    eficienciaEsperada: '',
  });

  useEffect(() => {
    if (demanda) {
      setFormData({
        nomeProjeto: demanda.nomeProjeto,
        descricao: demanda.descricao,
        objetivoEsperado: demanda.objetivoEsperado,
        areaSolicitante: demanda.areaSolicitante,
        categoria: demanda.categoria,
        tipo: demanda.tipo,
        prioridade: demanda.prioridade,
        kpiImpactado: demanda.kpiImpactado || '',
        eficienciaEsperada: demanda.eficienciaEsperada || '',
      });
    }
  }, [demanda]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      await updateDemanda.mutateAsync({
        id,
        updates: {
          nome_projeto: formData.nomeProjeto,
          descricao: formData.descricao,
          objetivo_esperado: formData.objetivoEsperado,
          area_solicitante: formData.areaSolicitante,
          categoria: formData.categoria as Categoria,
          tipo: formData.tipo as TipoDemanda,
          prioridade: formData.prioridade as Prioridade,
          kpi_impactado: formData.kpiImpactado || null,
          eficiencia_esperada: formData.eficienciaEsperada || null,
        },
      });

      toast({
        title: "Demanda atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });

      navigate(`/demanda/${id}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar demanda',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
    }
  };

  const isFormValid = 
    formData.nomeProjeto && 
    formData.descricao && 
    formData.objetivoEsperado && 
    formData.areaSolicitante && 
    formData.categoria && 
    formData.tipo && 
    formData.prioridade;

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

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={`/demanda/${id}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editar Demanda</h1>
            <p className="text-muted-foreground">ID: #{demanda.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-5">
            <h2 className="text-lg font-semibold text-card-foreground border-b border-border pb-3">
              Informações Básicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="nomeProjeto">Nome do Projeto *</Label>
                <Input
                  id="nomeProjeto"
                  placeholder="Ex: Dashboard de Vendas"
                  value={formData.nomeProjeto}
                  onChange={(e) => handleChange('nomeProjeto', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaSolicitante">Área Solicitante *</Label>
                <Input
                  id="areaSolicitante"
                  placeholder="Ex: Comercial, RH, Financeiro"
                  value={formData.areaSolicitante}
                  onChange={(e) => handleChange('areaSolicitante', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(v) => handleChange('categoria', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoriaLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select value={formData.prioridade} onValueChange={(v) => handleChange('prioridade', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(prioridadeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Detalhes da Demanda */}
          <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-5">
            <h2 className="text-lg font-semibold text-card-foreground border-b border-border pb-3">
              Detalhes da Demanda
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Solicitação *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva detalhadamente o que precisa ser desenvolvido ou ajustado..."
                  value={formData.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivoEsperado">Objetivo Esperado *</Label>
                <Textarea
                  id="objetivoEsperado"
                  placeholder="Qual resultado você espera alcançar com esta demanda?"
                  value={formData.objetivoEsperado}
                  onChange={(e) => handleChange('objetivoEsperado', e.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Impacto e Eficiência */}
          <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-5">
            <h2 className="text-lg font-semibold text-card-foreground border-b border-border pb-3">
              Impacto e Eficiência
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="kpiImpactado">KPI Impactado</Label>
                <Input
                  id="kpiImpactado"
                  placeholder="Ex: Volume de vendas, Tempo de resposta"
                  value={formData.kpiImpactado}
                  onChange={(e) => handleChange('kpiImpactado', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eficienciaEsperada">Eficiência Esperada</Label>
                <Input
                  id="eficienciaEsperada"
                  placeholder="Ex: Redução de 4h semanais"
                  value={formData.eficienciaEsperada}
                  onChange={(e) => handleChange('eficienciaEsperada', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to={`/demanda/${id}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={!isFormValid || updateDemanda.isPending}
              className="gap-2"
            >
              {updateDemanda.isPending ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
