import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

interface Selection {
  chocolate?: { id: string; nome: string };
  base?: { id: string; nome: string };
  ganache?: { id: string; nome: string };
  geleia?: { id: string; nome: string };
  cor?: { id: string; nome: string; codigo_hex: string };
}

interface PreviewAreaProps {
  selection: Selection;
}

const PreviewArea = ({ selection }: PreviewAreaProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();

  const generatePrompt = () => {
    if (!selection.chocolate || !selection.ganache || !selection.cor) {
      return "";
    }

    // Verifica se há geleia selecionada (e se não é "Sem Geleia")
    const hasGeleia = selection.geleia && selection.geleia.nome !== "Sem Geleia";
    
    if (!hasGeleia) {
      // Prompt para bombom sem geleia
      return `Gere uma imagem de:

Bombom de ${selection.chocolate.nome}, com ${selection.ganache.nome}.

- A Casquinha é pintada por completo e uniformemente de ${selection.cor.nome}.
- A cor é mostrada somente no exterior do bombom, não alterando a cor do chocolate ${selection.chocolate.nome}
- A ordem dos recheios é: base até 100% de altura com a ganache.
- Uma mesa branca embaixo e nenhum outro objeto adicional na foto gerada.`;
    } else {
      // Prompt para bombom com geleia
      return `Gere uma imagem de:

Bombom de ${selection.chocolate.nome} com ${selection.ganache.nome} e ${selection.geleia?.nome}.

- A Casquinha é pintada por completo e uniformemente de ${selection.cor.nome}.
- A cor é mostrada somente no exterior do bombom, não alterando a cor do chocolate ${selection.chocolate.nome}
- A ordem dos recheios é: base até 70% de altura com a ganache e nos 30% do topo a geléia.
- Uma mesa branca embaixo e nenhum outro objeto adicional na foto gerada.`;
    }
  };

  const handleSendToProduction = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para enviar bombons para produção.",
        variant: "destructive",
      });
      return;
    }

    if (!selection.chocolate || !selection.base || !selection.ganache || !selection.cor) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, complete todas as seleções antes de enviar para produção.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = generatePrompt();
      
        const { error } = await supabase
        .from('bombons')
        .insert({
          user_id: user.id,
          chocolate_id: selection.chocolate.id,
          base_id: selection.base.id,
          ganache_id: selection.ganache.id,
          geleia_id: selection.geleia?.id || null,
          cor_id: selection.cor.id,
          prompt_gerado: prompt,
          url_imagem: generatedImageUrl || null,
          status: 'enviado'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Enviado para produção!",
        description: "Seu bombom personalizado foi enviado para a loja.",
      });
    } catch (error) {
      console.error('Error sending to production:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar para produção. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selection.chocolate || !selection.base || !selection.ganache || !selection.cor) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, complete todas as seleções antes de gerar a imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      const prompt = generatePrompt();
      console.log("Prompt para geração de imagem:", prompt);
      
      const { data, error } = await supabase.functions.invoke('generate-bombom-image', {
        body: { prompt }
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setImageBase64(data.imageBase64);
        toast({
          title: "Imagem gerada!",
          description: "A imagem do seu bombom foi gerada com sucesso.",
        });
      } else {
        throw new Error(data?.error || "Falha ao gerar imagem");
      }
      
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao gerar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Área de Preview da Imagem */}
      <Card>
        <CardHeader>
          <CardTitle>Preview do Bombom</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-background to-muted rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
            {generatedImageUrl ? (
              <img 
                src={generatedImageUrl} 
                alt="Bombom gerado" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-2">🍫</div>
                <p>Sua criação aparecerá aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div><strong>Chocolate:</strong> {selection.chocolate?.nome || "Não selecionado"}</div>
            <div><strong>Base:</strong> {selection.base?.nome || "Não selecionado"}</div>
            <div><strong>Ganache:</strong> {selection.ganache?.nome || "Não selecionado"}</div>
            <div><strong>Geleia:</strong> {selection.geleia?.nome || "Não selecionado"}</div>
            <div className="flex items-center gap-2">
              <strong>Cor:</strong> 
              {selection.cor ? (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: selection.cor.codigo_hex }}
                  />
                  {selection.cor.nome}
                </div>
              ) : (
                "Não selecionado"
              )}
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <Button 
              className="w-full" 
              size="lg"
              variant="default"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !selection.chocolate || !selection.base || !selection.ganache || !selection.cor}
            >
              {isGeneratingImage ? "Gerando..." : "Gerar Imagem do Bombom"}
            </Button>
            
            <Button 
              className="w-full" 
              size="lg"
              variant="outline"
              onClick={handleSendToProduction}
              disabled={isGenerating || !user || !generatedImageUrl}
            >
              {isGenerating ? "Enviando..." : "Enviar para Produção"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewArea;