import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  LogOut,
  User,
  Users,
  Building2,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles?: ('super_admin' | 'admin_setor' | 'usuario')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Demandas', icon: ListTodo, path: '/demandas' },
  { label: 'Nova Solicitação', icon: PlusCircle, path: '/nova-demanda' },
];

const adminItems: NavItem[] = [
  { label: 'Usuários', icon: Users, path: '/admin/usuarios', roles: ['super_admin'] },
  { label: 'Setores', icon: Building2, path: '/admin/setores', roles: ['super_admin'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isSuperAdmin, isAdminSetor, primaryRole } = useUserRole();

  const visibleAdminItems = adminItems.filter(item => {
    if (!item.roles) return true;
    if (isSuperAdmin && item.roles.includes('super_admin')) return true;
    if (isAdminSetor && item.roles.includes('admin_setor')) return true;
    return false;
  });

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen gradient-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-ring/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-sidebar-ring" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-semibold text-sidebar-foreground">PDD App</h1>
              <p className="text-xs text-sidebar-foreground/60">Solicitações</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium animate-fade-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}

        {/* Admin Section */}
        {visibleAdminItems.length > 0 && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Administração
                </p>
              </div>
            )}
            {visibleAdminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium animate-fade-in">{item.label}</span>
                  )}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* User & Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {user && (
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50",
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-sidebar-ring/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-sidebar-ring" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-xs text-sidebar-foreground truncate">{user.email}</p>
                {primaryRole && (
                  <p className="text-xs text-sidebar-foreground/50 capitalize">
                    {primaryRole.replace('_', ' ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
