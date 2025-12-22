import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Layers, Lock, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL for error parameters (expired/invalid token)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    
    const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
    const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
    
    if (errorCode || errorDescription) {
      console.log('[ResetPassword] Token error detected:', { errorCode, errorDescription });
      setIsValidToken(false);
      return;
    }

    // Check for access_token in URL hash (indicates valid recovery link)
    const accessToken = hashParams.get('access_token');
    const tokenType = hashParams.get('type');
    
    console.log('[ResetPassword] URL params:', { 
      hasAccessToken: !!accessToken, 
      tokenType,
      hash: window.location.hash.substring(0, 50) + '...'
    });

    let subscriptionRef: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const checkSession = async () => {
      // First check if there's already a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('[ResetPassword] Valid session found');
        setIsValidToken(true);
        return;
      }

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('[ResetPassword] Auth event:', event, !!session);
          
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            if (timeoutId) clearTimeout(timeoutId);
            setIsValidToken(true);
          }
        }
      );
      
      subscriptionRef = subscription;

      // Only set invalid after timeout if we don't have an access_token in URL
      // This gives Supabase time to process the token
      timeoutId = setTimeout(() => {
        // Re-check session before marking as invalid
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            console.log('[ResetPassword] Session found after wait');
            setIsValidToken(true);
          } else if (!accessToken) {
            console.log('[ResetPassword] No session and no token in URL');
            setIsValidToken(false);
          } else {
            // Has token but no session yet - give it more time
            console.log('[ResetPassword] Has token, waiting for processing...');
            setTimeout(() => {
              supabase.auth.getSession().then(({ data: { session } }) => {
                setIsValidToken(!!session);
              });
            }, 2000);
          }
        });
      }, 1500);
    };

    checkSession();

    return () => {
      if (subscriptionRef) subscriptionRef.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.message,
        });
      } else {
        setIsSuccess(true);
        toast({
          title: 'Senha alterada!',
          description: 'Sua senha foi redefinida com sucesso.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao redefinir sua senha.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando...</div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Link Inválido ou Expirado</CardTitle>
            <CardDescription>
              O link de redefinição de senha é inválido ou já expirou. 
              Por favor, solicite um novo link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Você já pode acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-foreground">PDD App</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Salvando...'
                ) : (
                  <>
                    Redefinir Senha
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="text-sm text-primary hover:underline"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    </div>
  );
}
