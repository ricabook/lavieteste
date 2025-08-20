
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCustomizationOptions from "@/hooks/useCustomizationOptions";

interface Entity { id: string; nome: string }
interface Cor extends Entity { codigo_hex: string }

interface Selection {
  chocolate?: Entity;
  base?: Entity;
  ganache?: Entity;
  geleia?: Entity;
  cor?: Cor;
}

interface CustomizationPanelProps {
  selection: Selection;
  onSelectionChange: (selection: Selection) => void;
}

const CustomizationPanel = ({ selection, onSelectionChange }: CustomizationPanelProps) => {
  const { options, loading } = useCustomizationOptions();

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando opções…</div>;
  }

  const byId = <T extends { id: string }>(arr: T[] | undefined, id?: string) =>
    (arr || []).find(o => o.id === id);

  const renderDropdown = (
    label: string,
    items: Entity[],
    selected?: Entity,
    onChange?: (v?: Entity) => void
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select
        value={selected?.id ?? ""}
        onValueChange={(id) => onChange?.(byId(items, id))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {items.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCores = (
    label: string,
    cores: Cor[],
    selected?: Cor,
    onChange?: (v?: Cor) => void
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-6 gap-3">
        {(cores || []).map((c) => {
          const active = c.id === selected?.id;
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => onChange?.(c)}
              title={c.nome}
              className={[
                "relative h-10 w-10 rounded-full border transition",
                active ? "ring-2 ring-offset-2 ring-primary border-primary" : "border-muted-foreground/30"
              ].join(" ")}
              aria-pressed={active}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: c.codigo_hex }}
                aria-hidden="true"
              />
              <span className="sr-only">{c.nome}</span>
            </button>
          );
        })}
      </div>
      {selected ? (
        <div className="text-xs text-muted-foreground">Selecionado: {selected.nome}</div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderDropdown(
        "Tipo de Chocolate",
        options.chocolates || [],
        selection.chocolate,
        (v) => onSelectionChange({ ...selection, chocolate: v })
      )}

      {renderDropdown(
        "Base do Bombom",
        options.bases || [],
        selection.base,
        (v) => onSelectionChange({ ...selection, base: v })
      )}

      {renderDropdown(
        "Ganache",
        options.ganaches || [],
        selection.ganache,
        (v) => onSelectionChange({ ...selection, ganache: v })
      )}

      {renderDropdown(
        "Geléias/Extras",
        options.geleias || [],
        selection.geleia,
        (v) => onSelectionChange({ ...selection, geleia: v })
      )}

      {renderCores(
        "Cor da Casquinha",
        (options.cores || []) as Cor[],
        selection.cor as Cor | undefined,
        (v) => onSelectionChange({ ...selection, cor: v })
      )}
    </div>
  );
};

export default CustomizationPanel;
