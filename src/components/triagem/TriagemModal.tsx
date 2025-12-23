import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TriagemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: 'aprovar' | 'reprovar';
  etapa: 'triagem' | 'triagem-tecnica';
  usuarioNome: string;
  onConfirm: (observacoes: string) => Promise<void>;
  isLoading?: boolean;
}

export function TriagemModal({
  open,
  onOpenChange,
  tipo,
  etapa,
  usuarioNome,
  onConfirm,
  isLoading,
}: TriagemModalProps) {
  const [observacoes, setObservacoes] = useState('');

  const isAprovar = tipo === 'aprovar';
  const etapaLabel = etapa === 'triagem' ? 'Triagem' : 'Triagem Técnica';

  const handleConfirm = async () => {
    if (!observacoes.trim()) return;
    await onConfirm(observacoes);
    setObservacoes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAprovar ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
            {isAprovar ? 'Aprovar' : 'Reprovar'} {etapaLabel}
          </DialogTitle>
          <DialogDescription>
            {isAprovar
              ? `A demanda será aprovada e avançará no fluxo.`
              : `A demanda será reprovada e marcada como encerrada.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Esta ação será registrada como:
            </p>
            <p className="text-sm font-medium text-foreground mt-1">
              "{etapaLabel} {isAprovar ? 'aprovada' : 'reprovada'} por {usuarioNome}"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="observacoes"
              placeholder={
                isAprovar
                  ? 'Justifique a aprovação da demanda...'
                  : 'Explique o motivo da reprovação...'
              }
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={isAprovar ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={!observacoes.trim() || isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isAprovar ? 'Confirmar Aprovação' : 'Confirmar Reprovação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
