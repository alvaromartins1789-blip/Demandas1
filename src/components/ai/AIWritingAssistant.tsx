import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Sparkles, RefreshCw, Copy, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FormContext {
  nomeProjeto?: string;
  categoria?: string;
  tipo?: string;
  prioridade?: string;
  areaSolicitante?: string;
  descricao?: string;
  objetivoEsperado?: string;
}

interface AIWritingAssistantProps {
  field: 'descricao' | 'objetivoEsperado';
  formContext: FormContext;
  onApply: (value: string) => void;
  generateFunction: (context: FormContext, hint?: string) => Promise<{ success: boolean; response?: string; error?: string }>;
  isLoading?: boolean;
}

export function AIWritingAssistant({
  field,
  formContext,
  onApply,
  generateFunction,
  isLoading: externalLoading = false,
}: AIWritingAssistantProps) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fieldLabels = {
    descricao: 'Descrição',
    objetivoEsperado: 'Objetivo Esperado',
  };

  const fieldPlaceholders = {
    descricao: 'Ex: dashboard de vendas com gráficos por região...',
    objetivoEsperado: 'Ex: acompanhar métricas de vendas em tempo real...',
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuggestion('');

    try {
      const result = await generateFunction(formContext, hint);

      if (result.success && result.response) {
        setSuggestion(result.response);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao gerar sugestão',
          description: result.error || 'Não foi possível gerar a sugestão.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao gerar a sugestão.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApply(suggestion);
    toast({
      title: 'Sugestão aplicada!',
      description: `${fieldLabels[field]} foi atualizado com a sugestão da IA.`,
    });
    setOpen(false);
    setSuggestion('');
    setHint('');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setSuggestion('');
    setHint('');
  };

  const hasContext = formContext.nomeProjeto || formContext.categoria || formContext.areaSolicitante;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
          disabled={externalLoading}
        >
          <Sparkles className="w-3 h-3" />
          Ajuda da IA
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Assistente de Escrita IA
            </DrawerTitle>
            <DrawerDescription>
              Gere sugestões para o campo "{fieldLabels[field]}" usando IA
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 space-y-4">
            {/* Context Display */}
            {hasContext && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium text-muted-foreground mb-1">Contexto detectado:</p>
                <div className="flex flex-wrap gap-2">
                  {formContext.nomeProjeto && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                      {formContext.nomeProjeto}
                    </span>
                  )}
                  {formContext.categoria && (
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                      {formContext.categoria}
                    </span>
                  )}
                  {formContext.areaSolicitante && (
                    <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs">
                      {formContext.areaSolicitante}
                    </span>
                  )}
                  {formContext.prioridade && (
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded text-xs">
                      {formContext.prioridade}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Hint Input */}
            <div className="space-y-2">
              <Label htmlFor="hint" className="text-sm">
                Descreva brevemente sua ideia (opcional)
              </Label>
              <Textarea
                id="hint"
                placeholder={fieldPlaceholders[field]}
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Quanto mais detalhes você fornecer, melhor será a sugestão gerada.
              </p>
            </div>

            {/* Generate Button */}
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gerando sugestão...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Sugestão
                </>
              )}
            </Button>

            {/* Suggestion Display */}
            {suggestion && (
              <div className="space-y-3 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Sugestão gerada:</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="flex-row gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </DrawerClose>
            {suggestion && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
                  Regenerar
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aplicar
                </Button>
              </>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
