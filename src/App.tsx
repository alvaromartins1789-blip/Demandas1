import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Demandas from "./pages/Demandas";
import NovaDemanda from "./pages/NovaDemanda";
import DetalheDemanda from "./pages/DetalheDemanda";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Usuarios from "./pages/admin/Usuarios";
import Setores from "./pages/admin/Setores";

const queryClient = new QueryClient();

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={
              <AuthRedirect>
                <Auth />
              </AuthRedirect>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/demandas" element={
              <ProtectedRoute>
                <Demandas />
              </ProtectedRoute>
            } />
            <Route path="/nova-demanda" element={
              <ProtectedRoute>
                <NovaDemanda />
              </ProtectedRoute>
            } />
            <Route path="/demanda/:id" element={
              <ProtectedRoute>
                <DetalheDemanda />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <RoleProtectedRoute allowedRoles={['super_admin']}>
                <Usuarios />
              </RoleProtectedRoute>
            } />
            <Route path="/admin/setores" element={
              <RoleProtectedRoute allowedRoles={['super_admin']}>
                <Setores />
              </RoleProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
