import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useCustomizationOptions from "@/hooks/useCustomizationOptions";

interface Selection {
  chocolate?: { id: string; nome: string };
  base?: { id: string; nome: string };
  ganache?: { id: string; nome: string };
  geleia?: { id: string; nome: string };
  cor?: { id: string; nome: string; codigo_hex: string };
}

interface CustomizationPanelProps {
  selection: Selection;
  onSelectionChange: (selection: Selection) => void;
}

const CustomizationPanel = ({ selection, onSelectionChange }: CustomizationPanelProps) => {
  const { options, loading } = useCustomizationOptions();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const renderOptionSection = (
    title: string,
    options: Array<{ id: string; nome: string; codigo_hex?: string }>,
    selectedValue: any,
    onSelect: (option: any) => void
  ) => (
    <Card key={title}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {options.map((option) => (
            <Button
              key={option.id}
              variant={selectedValue?.id === option.id ? "default" : "outline"}
              className="justify-start h-auto py-3 px-4"
              onClick={() => onSelect(option)}
            >
              {option.codigo_hex && (
                <div 
                  className="w-4 h-4 rounded mr-2 border border-border"
                  style={{ backgroundColor: option.codigo_hex }}
                />
              )}
              {option.nome}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderOptionSection(
        "Tipo de Chocolate", 
        options.chocolates, 
        selection.chocolate, 
        (chocolate) => onSelectionChange({ ...selection, chocolate })
      )}

      {renderOptionSection(
        "Base do Bombom", 
        options.bases, 
        selection.base, 
        (base) => onSelectionChange({ ...selection, base })
      )}

      {renderOptionSection(
        "Ganache", 
        options.ganaches, 
        selection.ganache, 
        (ganache) => onSelectionChange({ ...selection, ganache })
      )}

      {renderOptionSection(
        "Geleia", 
        options.geleias, 
        selection.geleia, 
        (geleia) => onSelectionChange({ ...selection, geleia })
      )}

      {renderOptionSection(
        "Cor da Casquinha", 
        options.cores, 
        selection.cor, 
        (cor) => onSelectionChange({ ...selection, cor })
      )}
    </div>
  );
};

export default CustomizationPanel;