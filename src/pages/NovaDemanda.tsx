import { useState } from 'react';
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
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCreateDemanda } from '@/hooks/useDemandas';
import { useAuth } from '@/contexts/AuthContext';
import { AIInsightPanel } from '@/components/ai/AIInsightPanel';
import { SimilarDemandsAlert } from '@/components/ai/SimilarDemandsAlert';

export default function NovaDemanda() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const createDemanda = useCreateDemanda();

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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Você precisa estar logado para criar uma demanda.',
      });
      return;
    }

    try {
      await createDemanda.mutateAsync({
        nomeProjeto: formData.nomeProjeto,
        descricao: formData.descricao,
        objetivoEsperado: formData.objetivoEsperado,
        areaSolicitante: formData.areaSolicitante,
        categoria: formData.categoria as Categoria,
        tipo: formData.tipo as TipoDemanda,
        prioridade: formData.prioridade as Prioridade,
        kpiImpactado: formData.kpiImpactado || undefined,
        eficienciaEsperada: formData.eficienciaEsperada || undefined,
        solicitanteId: user.id,
      });

      toast({
        title: "Solicitação enviada!",
        description: "Sua demanda foi registrada e está aguardando triagem.",
      });

      navigate('/demandas');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar demanda',
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

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/demandas">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Solicitação</h1>
            <p className="text-muted-foreground">Preencha os campos para registrar uma nova demanda</p>
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

          {/* Similar Demands Alert */}
          <SimilarDemandsAlert formData={formData} />

          {/* AI Insight Panel */}
          <AIInsightPanel formData={formData} />

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
            <Link to="/demandas">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={!isFormValid || createDemanda.isPending}
              className="gap-2"
            >
              {createDemanda.isPending ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Solicitação
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
