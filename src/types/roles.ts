export type AppRole = 'admin' | 'gestor' | 'equipe';

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
  admin: 'Admin',
  gestor: 'Gestor',
  equipe: 'Equipe',
};

export const roleDescriptions: Record<AppRole, string> = {
  admin: 'Governança total do sistema - gerencia todos os usuários, setores e configurações',
  gestor: 'Responsável por um ou mais setores - gerencia usuários e demandas do seu setor',
  equipe: 'Colaborador do setor - cria insights e acompanha demandas',
};

// Definição detalhada de permissões por papel
export type Permission = 
  // Gestão de Usuários
  | 'users:create'
  | 'users:view_all'
  | 'users:view_setor'
  | 'users:edit_role'
  | 'users:reset_password'
  | 'users:toggle_active'
  | 'users:delete'
  | 'users:ban'
  // Gestão de Setores
  | 'setores:create'
  | 'setores:edit'
  | 'setores:delete'
  | 'setores:view_all'
  // Gestão de Demandas
  | 'demandas:create'
  | 'demandas:view_all'
  | 'demandas:view_setor'
  | 'demandas:view_own'
  | 'demandas:edit_own'
  | 'demandas:edit_setor'
  | 'demandas:delete_own'
  | 'demandas:approve_triagem'
  | 'demandas:approve_homologacao'
  | 'demandas:assign_technical'
  // Dashboards
  | 'dashboard:global'
  | 'dashboard:setor'
  | 'dashboard:personal'
  // Configurações
  | 'config:status'
  | 'config:fluxos'
  | 'config:prioridades'
  // Insights e Interações
  | 'insights:create'
  | 'insights:comment'
  | 'insights:prioritize'
  | 'insights:vote';

// Mapeamento de permissões por papel
export const rolePermissions: Record<AppRole, Permission[]> = {
  admin: [
    // Todas as permissões de usuários
    'users:create',
    'users:view_all',
    'users:view_setor',
    'users:edit_role',
    'users:reset_password',
    'users:toggle_active',
    'users:delete',
    'users:ban',
    // Todas as permissões de setores
    'setores:create',
    'setores:edit',
    'setores:delete',
    'setores:view_all',
    // Todas as permissões de demandas
    'demandas:create',
    'demandas:view_all',
    'demandas:view_setor',
    'demandas:view_own',
    'demandas:edit_own',
    'demandas:edit_setor',
    'demandas:delete_own',
    'demandas:approve_triagem',
    'demandas:approve_homologacao',
    'demandas:assign_technical',
    // Todos os dashboards
    'dashboard:global',
    'dashboard:setor',
    'dashboard:personal',
    // Todas as configurações
    'config:status',
    'config:fluxos',
    'config:prioridades',
    // Insights
    'insights:create',
    'insights:comment',
    'insights:prioritize',
    'insights:vote',
  ],
  gestor: [
    // Permissões de usuários do setor
    'users:view_setor',
    'users:toggle_active',
    // Permissões de demandas do setor
    'demandas:create',
    'demandas:view_setor',
    'demandas:view_own',
    'demandas:edit_own',
    'demandas:edit_setor',
    'demandas:delete_own',
    'demandas:approve_triagem',
    'demandas:approve_homologacao',
    // Dashboard do setor
    'dashboard:setor',
    'dashboard:personal',
    // Insights
    'insights:create',
    'insights:comment',
    'insights:prioritize',
    'insights:vote',
  ],
  equipe: [
    // Permissões básicas de demandas
    'demandas:create',
    'demandas:view_own',
    'demandas:view_setor',
    'demandas:edit_own',
    // Dashboard pessoal
    'dashboard:personal',
    'dashboard:setor',
    // Insights
    'insights:create',
    'insights:comment',
    'insights:vote',
  ],
};
