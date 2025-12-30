import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Lock, User, ArrowRight, KeyRound } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao entrar',
            description: error.message.includes('Invalid login credentials') 
              ? 'Email ou senha incorretos.' 
              : error.message,
          });
          setIsLoading(false);
          return;
        }

        toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
        navigate('/');
      } else {
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.nome);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao criar conta',
            description: error.message.includes('already registered') 
              ? 'Este email já está cadastrado.' 
              : error.message,
          });
          setIsLoading(false);
          return;
        }

        toast({ title: 'Conta criada!', description: 'Você foi logado automaticamente.' });
        navigate('/');
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Ocorreu um erro inesperado.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira seu email.' });
      return;
    }

    const emailSchema = z.string().email('Email inválido');
    const result = emailSchema.safeParse(forgotPasswordEmail);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira um email válido.' });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message });
      } else {
        toast({ title: 'Email enviado!', description: 'Verifique sua caixa de entrada.' });
        setForgotPasswordOpen(false);
        setForgotPasswordEmail('');
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao enviar o email.' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado Esquerdo - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          {/* ALTERAÇÃO AQUI: Logo substituindo o ícone e textos PDD App */}
          <img 
            src="/placeholder.svg" 
            alt="Logo da Empresa" 
            className="h-14 w-auto object-contain" 
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Central de Solicitações de Demandas
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Otimize processos, acompanhe fluxos em tempo real e garanta total rastreabilidade das suas demandas.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/60">
        
        </p>
      </div>

      {/* Lado Direito - Formuário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile logo (Aparece apenas em telas pequenas) */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            {/* ALTERAÇÃO AQUI: Logo para versão mobile */}
            <img 
              src="/placeholder.svg" 
              alt="Logo da Empresa" 
              className="h-12 w-auto object-contain" 
            />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? 'Bem-vindo de volta! Entre com suas credenciais.'
                : 'Preencha os dados para criar sua conta.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? 'Carregando...' : (
                <>
                  {isLogin ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" /> Recuperar Senha
            </DialogTitle>
            <DialogDescription>
              Digite seu email para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotPasswordOpen(false)}>Cancelar</Button>
            <Button onClick={handleForgotPassword} disabled={forgotPasswordLoading}>
              {forgotPasswordLoading ? 'Enviando...' : 'Enviar Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}