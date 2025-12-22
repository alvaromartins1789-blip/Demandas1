import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Building2, 
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Mail,
  Trash2,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  UserX
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { fetchAllUsersWithRoles, assignRole, removeRole, toggleUserActive, updateUserSetor } from '@/services/rolesService';
import { fetchSetores } from '@/services/setoresService';
import { createInvite, fetchPendingInvites, cancelInvite } from '@/services/invitesService';
import { ProfileWithRole, Setor, AppRole, roleLabels, UserInvite } from '@/types/roles';
import { supabase } from '@/integrations/supabase/client';

export default function Usuarios() {
  const [users, setUsers] = useState<ProfileWithRole[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'usuario' as AppRole, setor_id: '' });
  
  // Reset password state
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<ProfileWithRole | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Delete user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<ProfileWithRole | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banEmail, setBanEmail] = useState(false);
  
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [usersData, setoresData, invitesData] = await Promise.all([
        fetchAllUsersWithRoles(),
        fetchSetores(),
        fetchPendingInvites(),
      ]);
      setUsers(usersData);
      setSetores(setoresData);
      setInvites(invitesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserActive(userId, !currentStatus);
      toast({
        title: currentStatus ? 'Usuário desativado' : 'Usuário ativado',
        description: `O usuário foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do usuário.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignRole = async (userId: string, role: AppRole, setorId?: string) => {
    try {
      await assignRole(userId, role, setorId);
      toast({
        title: 'Papel atribuído',
        description: `O papel ${roleLabels[role]} foi atribuído com sucesso.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atribuir o papel.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await removeRole(roleId);
      toast({
        title: 'Papel removido',
        description: 'O papel foi removido com sucesso.',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o papel.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateInvite = async () => {
    try {
      await createInvite(
        newInvite.email, 
        newInvite.role, 
        newInvite.setor_id || undefined
      );
      toast({
        title: 'Convite criado',
        description: `Um convite foi enviado para ${newInvite.email}.`,
      });
      setInviteDialogOpen(false);
      setNewInvite({ email: '', role: 'usuario', setor_id: '' });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar convite',
        description: error.message || 'Não foi possível criar o convite.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite(inviteId);
      toast({
        title: 'Convite cancelado',
        description: 'O convite foi cancelado com sucesso.',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o convite.',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserForReset) return;

    setResetPasswordLoading(true);
    setGeneratedPassword(null);
    setPasswordCopied(false);
    
    try {
      const response = await supabase.functions.invoke('admin-reset-password', {
        body: {
          user_email: selectedUserForReset.email,
          user_id: selectedUserForReset.id,
          action: 'generate_temp_password'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar senha temporária');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (response.data?.temp_password) {
        setGeneratedPassword(response.data.temp_password);
        toast({
          title: 'Senha gerada!',
          description: 'A senha temporária foi gerada. Copie e envie ao usuário.',
        });
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível gerar a senha temporária.',
        variant: 'destructive',
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const copyPasswordToClipboard = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Senha copiada para a área de transferência.',
      });
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const closeResetDialog = () => {
    setResetPasswordDialogOpen(false);
    setSelectedUserForReset(null);
    setGeneratedPassword(null);
    setPasswordCopied(false);
  };

  const openResetPasswordDialog = (user: ProfileWithRole) => {
    setSelectedUserForReset(user);
    setGeneratedPassword(null);
    setPasswordCopied(false);
    setResetPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user: ProfileWithRole) => {
    setSelectedUserForDelete(user);
    setBanEmail(false);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUserForDelete(null);
    setBanEmail(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;

    setDeleteLoading(true);
    
    try {
      const response = await supabase.functions.invoke('admin-delete-user', {
        body: {
          user_id: selectedUserForDelete.id,
          user_email: selectedUserForDelete.email,
          ban_email: banEmail,
          reason: banEmail ? 'Banned by super admin' : undefined
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao excluir usuário');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: banEmail ? 'Usuário banido' : 'Usuário excluído',
        description: banEmail 
          ? `${selectedUserForDelete.email} foi excluído e o email foi banido.`
          : `${selectedUserForDelete.email} foi excluído com sucesso.`,
      });
      
      closeDeleteDialog();
      loadData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir o usuário.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin_setor': return 'default';
      default: return 'secondary';
    }
  };

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
              <Users className="h-6 w-6" />
              Gestão de Usuários
            </h1>
            <p className="text-muted-foreground">
              Gerencie usuários, papéis e convites do sistema
            </p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Envie um convite para um novo usuário se cadastrar no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newInvite.email}
                    onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Papel</Label>
                  <Select
                    value={newInvite.role}
                    onValueChange={(value: AppRole) => setNewInvite({ ...newInvite, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuário</SelectItem>
                      <SelectItem value="admin_setor">Admin de Setor</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newInvite.role === 'usuario' || newInvite.role === 'admin_setor') && (
                  <div className="space-y-2">
                    <Label htmlFor="setor">Setor</Label>
                    <Select
                      value={newInvite.setor_id}
                      onValueChange={(value) => setNewInvite({ ...newInvite, setor_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {setores.map((setor) => (
                          <SelectItem key={setor.id} value={setor.id}>
                            {setor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInvite} disabled={!newInvite.email}>
                  Enviar Convite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Convites Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {roleLabels[invite.role]} • Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.ativo ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Users className={`h-5 w-5 ${user.ativo ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.nome}</p>
                        {!user.ativo && (
                          <Badge variant="outline" className="text-destructive border-destructive">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant={getRoleBadgeVariant(role.role)}>
                            {roleLabels[role.role]}
                          </Badge>
                        ))}
                        {user.setor && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {user.setor.nome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                        <KeyRound className="h-4 w-4 mr-2" />
                        Resetar Senha
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.ativo)}>
                        {user.ativo ? (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            Desativar Usuário
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ativar Usuário
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!user.roles.some(r => r.role === 'super_admin') && (
                        <DropdownMenuItem onClick={() => handleAssignRole(user.id, 'super_admin')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Tornar Super Admin
                        </DropdownMenuItem>
                      )}
                      {user.roles.map((role) => (
                        <DropdownMenuItem 
                          key={role.id}
                          onClick={() => handleRemoveRole(role.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover {roleLabels[role.role]}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(user)}
                        className="text-destructive"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Excluir Conta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={closeResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Resetar Senha
              </DialogTitle>
              <DialogDescription>
                {generatedPassword 
                  ? 'Senha temporária gerada. Copie e envie ao usuário.'
                  : 'Será gerada uma senha temporária. O usuário deverá trocar no primeiro login.'
                }
              </DialogDescription>
            </DialogHeader>
            {selectedUserForReset && (
              <div className="py-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedUserForReset.nome}</p>
                  <p className="text-sm text-muted-foreground">{selectedUserForReset.email}</p>
                </div>
                
                {generatedPassword && (
                  <div className="space-y-2">
                    <Label>Senha Temporária</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={generatedPassword} 
                        readOnly 
                        className="font-mono text-lg"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copyPasswordToClipboard}
                      >
                        {passwordCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O usuário deverá trocar essa senha no próximo login.
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {generatedPassword ? (
                <Button onClick={closeResetDialog}>
                  Fechar
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={closeResetDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleResetPassword} disabled={resetPasswordLoading}>
                    {resetPasswordLoading ? 'Gerando...' : 'Gerar Senha Temporária'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={closeDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Excluir Conta
              </DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. O usuário perderá todo o acesso ao sistema.
              </DialogDescription>
            </DialogHeader>
            {selectedUserForDelete && (
              <div className="py-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedUserForDelete.nome}</p>
                  <p className="text-sm text-muted-foreground">{selectedUserForDelete.email}</p>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                  <div className="space-y-1">
                    <Label htmlFor="ban-email" className="font-medium">Banir email permanentemente</Label>
                    <p className="text-xs text-muted-foreground">
                      Se ativado, o usuário não poderá criar nova conta com este email.
                    </p>
                  </div>
                  <Switch
                    id="ban-email"
                    checked={banEmail}
                    onCheckedChange={setBanEmail}
                  />
                </div>

                {banEmail && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      O email será banido permanentemente!
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser} 
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Excluindo...' : banEmail ? 'Excluir e Banir' : 'Excluir Conta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
