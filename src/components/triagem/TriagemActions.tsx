import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TriagemModal } from './TriagemModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import {
  useAprovarTriagem,
  useReprovarTriagem,
  useConcluirDemanda,
} from '@/hooks/useTriagem';
import { Demanda } from '@/types/demanda';
import { CheckCircle2, XCircle, Shield, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TriagemActionsProps {
  demanda: Demanda;
}

export function TriagemActions({ demanda }: TriagemActionsProps) {
  const { user } = useAuth();
  const { isAdmin, isGestor, loading: roleLoading } = useUserRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<'aprovar' | 'reprovar' | 'concluir'>('aprovar');
  const [usuarioNome, setUsuarioNome] = useState('');

  const aprovarTriagem = useAprovarTriagem();
  const reprovarTriagem = useReprovarTriagem();
  const concluirDemanda = useConcluirDemanda();

  // Only admin and gestor can manage triagem
  const canManageTriagem = isAdmin || isGestor;

  // Determine which action is available
  const isTriagem = demanda.status === 'triagem';
  const isDesenvolvimento = demanda.status === 'desenvolvimento';
  const canAct = canManageTriagem && (isTriagem || isDesenvolvimento);

  const openModal = async (tipo: 'aprovar' | 'reprovar' | 'concluir') => {
    if (!user) return;

    // Fetch user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', user.id)
      .single();

    setUsuarioNome(profile?.nome || user.email || 'Usuário');
    setModalTipo(tipo);
    setModalOpen(true);
  };

  const handleConfirm = async (observacoes: string) => {
    if (!user) return;

    const params = {
      demandaId: demanda.id,
      usuarioId: user.id,
      usuarioNome,
      observacoes,
    };

    if (isTriagem) {
      if (modalTipo === 'aprovar') {
        await aprovarTriagem.mutateAsync(params);
      } else {
        await reprovarTriagem.mutateAsync(params);
      }
    } else if (isDesenvolvimento && modalTipo === 'concluir') {
      await concluirDemanda.mutateAsync(params);
    }
  };

  if (roleLoading || !canAct) {
    return null;
  }

  const isLoading =
    aprovarTriagem.isPending ||
    reprovarTriagem.isPending ||
    concluirDemanda.isPending;

  // Triagem actions
  if (isTriagem) {
    return (
      <>
        <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Ações de Triagem
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Analise a demanda e decida se ela deve ser aceita para desenvolvimento.
          </p>

          <div className="flex gap-3">
            <Button
              variant="default"
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => openModal('aprovar')}
              disabled={isLoading}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => openModal('reprovar')}
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reprovar
            </Button>
          </div>
        </div>

        <TriagemModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          tipo={modalTipo === 'aprovar' ? 'aprovar' : 'reprovar'}
          etapa="triagem"
          usuarioNome={usuarioNome}
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      </>
    );
  }

  // Development - Concluir action
  if (isDesenvolvimento) {
    return (
      <>
        <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Finalizar Desenvolvimento
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Quando o desenvolvimento estiver concluído, marque a demanda como finalizada.
          </p>

          <Button
            variant="default"
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => openModal('concluir')}
            disabled={isLoading}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar como Concluída
          </Button>
        </div>

        <TriagemModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          tipo="aprovar"
          etapa="conclusao"
          usuarioNome={usuarioNome}
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      </>
    );
  }

  return null;
}
