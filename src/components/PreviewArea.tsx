import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ nome: "", telefone: "" });
  const { user } = useAuth();
  const { toast } = useToast();

  const generatePrompt = () => {
    if (!selection.chocolate || !selection.ganache || !selection.cor) {
      return "";
    }

    const hasGeleia = selection.geleia && selection.geleia.nome !== "Sem Geleia";
    
    if (!hasGeleia) {
      return `Gerar uma foto hiper-realista, em estúdio profissional, de bombons artesanais de ${selection.chocolate.nome}, formato arredondado e brilhante. A casquinha externa está pintada de forma uniforme e completa de ${selection.cor.nome} absoluto. 
Um dos bombons está cortado ao meio, exibindo o interior com uma camada: da base ao topo, ocupando 100% da altura do bombom, uma única camada uniforme cremosa de ${selection.ganache.nome}. 
Iluminação suave de estúdio, fundo neutro acinzentado, foco nítido e textura detalhada do chocolate e do recheio. Estilo fotográfico realista, como se fosse capturado com uma câmera Canon em estúdio de fotografia gastronômica. Sem textos ou objetos adicionais na cena, apenas os bombons centralizados.`;      

    } else {
      return `Gerar uma foto hiper-realista, em estúdio profissional, de bombons artesanais de ${selection.chocolate.nome}, formato arredondado e brilhante. A casquinha externa está pintada de forma uniforme e completa de ${selection.cor.nome} absoluto. 
Um dos bombons está cortado ao meio, exibindo o interior com duas camadas: 
- Da base até 80% da altura do bombom: uma única camada uniforme cremosa de ${selection.ganache.nome}. 
- No topo, correspondente aos 20% restantes do bombom: uma camada brilhante de ${selection.geleia.nome}.
Iluminação suave de estúdio, fundo neutro acinzentado, foco nítido e textura detalhada do chocolate e do recheio. Estilo fotográfico realista, como se fosse capturado com uma câmera Canon em estúdio de fotografia gastronômica. Sem textos ou objetos adicionais na cena, apenas os bombons centralizados.`;
    }
  };

  const handleSendToProduction = async () => {
    if (!selection.chocolate || !selection.base || !selection.ganache || !selection.cor) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, complete todas as seleções antes de enviar para produção.",
        variant: "destructive",
      });
      return;
    }

    // Se não há usuário logado, abrir modal para coletar informações
    if (!user) {
      setShowGuestModal(true);
      return;
    }

    await sendToProductionWithUserInfo();
  };

  const sendToProductionWithUserInfo = async (guestData?: { nome: string; telefone: string }) => {
    setIsGenerating(true);
    
    try {
      const prompt = generatePrompt();
      
      const insertData: any = {
        chocolate_id: selection.chocolate!.id,
        base_id: selection.base!.id,
        ganache_id: selection.ganache!.id,
        geleia_id: selection.geleia?.id || null,
        cor_id: selection.cor!.id,
        prompt_gerado: prompt,
        url_imagem: generatedImageUrl || null,
        url_imagem_base64: imageBase64 || null,
        status: 'enviado'
      };

      if (user) {
        insertData.user_id = user.id;
      } else if (guestData) {
        insertData.user_id = null;
        insertData.nome_guest = guestData.nome;
        insertData.telefone_guest = guestData.telefone;
      }
      
      const { error } = await supabase
        .from('bombons')
        .insert(insertData);

      if (error) {
        throw error;
      }

      toast({
        title: "Enviado para produção!",
        description: "Seu bombom personalizado foi enviado para a loja.",
      });

      // Fechar modal se estava aberto
      setShowGuestModal(false);
      setGuestInfo({ nome: "", telefone: "" });
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

  const handleGuestSubmit = () => {
    if (!guestInfo.nome.trim() || !guestInfo.telefone.trim()) {
      toast({
        title: "Informações obrigatórias",
        description: "Por favor, preencha seu nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    sendToProductionWithUserInfo(guestInfo);
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
          <div className="bg-gradient-to-br from-background to-muted rounded-lg aspect-square w-full max-w-sm mx-auto flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
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

          {/* Texto informativo abaixo da imagem */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            A imagem acima é um esboço e foi gerada através de <strong>Inteligência Artificial</strong>. 
            O bombom final pode apresentar diferenças nas cores e texturas dos recheios.
            Se tiver qualquer dúvida, fale conosco pelo WhatsApp:{" "}
            <a 
              href="https://wa.me/5519996594881" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              (19) 9-9659-4881
            </a>.
          </p>
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
              disabled={isGenerating || !generatedImageUrl}
            >
              {isGenerating ? "Enviando..." : "Enviar para Produção"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal para usuários não logados */}
      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suas informações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para enviar seu bombom para produção, precisamos de algumas informações:
            </p>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="guest-nome">Nome completo</Label>
                <Input
                  id="guest-nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={guestInfo.nome}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="guest-telefone">WhatsApp</Label>
                <Input
                  id="guest-telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={guestInfo.telefone}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowGuestModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuestSubmit}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? "Enviando..." : "Enviar Pedido"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviewArea;
