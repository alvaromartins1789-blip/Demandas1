import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TriagemModal } from './TriagemModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import {
  useAprovarTriagem,
  useReprovarTriagem,
  useAprovarTriagemTecnica,
  useReprovarTriagemTecnica,
} from '@/hooks/useTriagem';
import { Demanda, StatusDemanda } from '@/types/demanda';
import { CheckCircle2, XCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TriagemActionsProps {
  demanda: Demanda;
}

export function TriagemActions({ demanda }: TriagemActionsProps) {
  const { user } = useAuth();
  const { isAdmin, isGestor, loading: roleLoading } = useUserRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<'aprovar' | 'reprovar'>('aprovar');
  const [usuarioNome, setUsuarioNome] = useState('');

  const aprovarTriagem = useAprovarTriagem();
  const reprovarTriagem = useReprovarTriagem();
  const aprovarTriagemTecnica = useAprovarTriagemTecnica();
  const reprovarTriagemTecnica = useReprovarTriagemTecnica();

  // Only admin and gestor can manage triagem
  const canManageTriagem = isAdmin || isGestor;

  // Determine which etapa we're in
  const isTriagem = demanda.status === 'triagem';
  const isTriagemTecnica = demanda.status === 'triagem-tecnica';
  const canAct = canManageTriagem && (isTriagem || isTriagemTecnica);

  const openModal = async (tipo: 'aprovar' | 'reprovar') => {
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
    } else if (isTriagemTecnica) {
      if (modalTipo === 'aprovar') {
        await aprovarTriagemTecnica.mutateAsync(params);
      } else {
        await reprovarTriagemTecnica.mutateAsync(params);
      }
    }
  };

  if (roleLoading || !canAct) {
    return null;
  }

  const isLoading =
    aprovarTriagem.isPending ||
    reprovarTriagem.isPending ||
    aprovarTriagemTecnica.isPending ||
    reprovarTriagemTecnica.isPending;

  const etapa: 'triagem' | 'triagem-tecnica' = isTriagem ? 'triagem' : 'triagem-tecnica';
  const etapaLabel = isTriagem ? 'Triagem' : 'Triagem Técnica';

  return (
    <>
      <div className="bg-card rounded-xl p-6 card-shadow border border-border/50 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">
            Ações de {etapaLabel}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          {isTriagem
            ? 'Analise a demanda e decida se ela deve prosseguir para triagem técnica.'
            : 'Avalie a viabilidade técnica e decida se a demanda deve seguir para desenvolvimento.'}
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
        tipo={modalTipo}
        etapa={etapa}
        usuarioNome={usuarioNome}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  );
}
