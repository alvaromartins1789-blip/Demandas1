import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Plus, 
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Users
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { fetchSetores, createSetor, updateSetor, toggleSetorActive, deleteSetor } from '@/services/setoresService';
import { Setor } from '@/types/roles';

export default function Setores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const { toast } = useToast();

  const loadSetores = async () => {
    try {
      const data = await fetchSetores();
      setSetores(data);
    } catch (error) {
      console.error('Error loading setores:', error);
      toast({
        title: 'Erro ao carregar setores',
        description: 'Não foi possível carregar a lista de setores.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetores();
  }, []);

  const handleOpenDialog = (setor?: Setor) => {
    if (setor) {
      setEditingSetor(setor);
      setFormData({ nome: setor.nome, descricao: setor.descricao || '' });
    } else {
      setEditingSetor(null);
      setFormData({ nome: '', descricao: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingSetor) {
        await updateSetor(editingSetor.id, formData);
        toast({
          title: 'Setor atualizado',
          description: 'O setor foi atualizado com sucesso.',
        });
      } else {
        await createSetor(formData.nome, formData.descricao);
        toast({
          title: 'Setor criado',
          description: 'O novo setor foi criado com sucesso.',
        });
      }
      setDialogOpen(false);
      setFormData({ nome: '', descricao: '' });
      loadSetores();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o setor.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (setor: Setor) => {
    try {
      await toggleSetorActive(setor.id, !setor.ativo);
      toast({
        title: setor.ativo ? 'Setor desativado' : 'Setor ativado',
        description: `O setor foi ${setor.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });
      loadSetores();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do setor.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (setorId: string) => {
    try {
      await deleteSetor(setorId);
      toast({
        title: 'Setor excluído',
        description: 'O setor foi excluído com sucesso.',
      });
      loadSetores();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o setor. Verifique se não há usuários vinculados.',
        variant: 'destructive',
      });
    }
  };

  const filteredSetores = setores.filter(setor =>
    setor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (setor.descricao && setor.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Gestão de Setores
            </h1>
            <p className="text-muted-foreground">
              Gerencie os setores da organização
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Setor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSetor ? 'Editar Setor' : 'Novo Setor'}
                </DialogTitle>
                <DialogDescription>
                  {editingSetor 
                    ? 'Atualize as informações do setor.' 
                    : 'Preencha as informações para criar um novo setor.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do setor"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descrição do setor (opcional)"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.nome.trim()}>
                  {editingSetor ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar setores..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Setores Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSetores.map((setor) => (
            <Card key={setor.id} className={!setor.ativo ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {setor.nome}
                  </CardTitle>
                  {setor.descricao && (
                    <CardDescription>{setor.descricao}</CardDescription>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(setor)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(setor)}>
                      {setor.ativo ? 'Desativar' : 'Ativar'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(setor.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={setor.ativo ? 'default' : 'secondary'}>
                    {setor.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Criado em {new Date(setor.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSetores.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum setor encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tente uma busca diferente.' : 'Crie um novo setor para começar.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
