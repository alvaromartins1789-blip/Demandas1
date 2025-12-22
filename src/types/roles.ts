export type AppRole = 'super_admin' | 'admin_setor' | 'usuario';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  setor_id: string | null;
  created_at?: string;
}

export interface Setor {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInvite {
  id: string;
  email: string;
  role: AppRole;
  setor_id: string | null;
  invited_by: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface ProfileWithRole {
  id: string;
  nome: string;
  email: string;
  area: string | null;
  setor_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  setor?: Setor | null;
  roles: UserRole[];
}

export const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin_setor: 'Admin de Setor',
  usuario: 'Usuário',
};

export const roleDescriptions: Record<AppRole, string> = {
  super_admin: 'Gerencia todos os usuários, setores e configurações do sistema',
  admin_setor: 'Gerencia usuários e demandas do seu setor',
  usuario: 'Acessa e interage com demandas do seu setor',
};
