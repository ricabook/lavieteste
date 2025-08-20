import { useState } from "react";
import CustomizationPanel from "@/components/CustomizationPanel";
import PreviewArea from "@/components/PreviewArea";

interface Selection {
  chocolate?: { id: string; nome: string };
  base?: { id: string; nome: string };
  ganache?: { id: string; nome: string };
  geleia?: { id: string; nome: string };
  cor?: { id: string; nome: string; codigo_hex: string };
}

const Index = () => {
  const [selection, setSelection] = useState<Selection>({});

  console.log("Index component rendered, selection:", selection);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna de Opções — deve vir primeiro no mobile */}
          <div className="order-1 lg:order-1">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Crie seu Bombom
            </h2>
            <CustomizationPanel
              selection={selection}
              onSelectionChange={setSelection}
            />
          </div>

          {/* Coluna de Preview + Resumo — vem depois no mobile */}
          <div className="order-2 lg:order-2">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Foto e detalhes do Bombom
            </h2>
            <PreviewArea selection={selection} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
