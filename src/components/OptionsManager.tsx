import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Option {
  id: string;
  nome: string;
  ativo: boolean;
  codigo_hex?: string;
}

interface OptionsData {
  chocolates: Option[];
  bases: Option[];
  ganaches: Option[];
  geleias: Option[];
  cores: Option[];
}

const OptionsManager = () => {
  const [options, setOptions] = useState<OptionsData>({
    chocolates: [],
    bases: [],
    ganaches: [],
    geleias: [],
    cores: []
  });
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<{ type: string; option: Option | null }>({ type: '', option: null });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllOptions();
  }, []);

  const fetchAllOptions = async () => {
    try {
      const [chocolates, bases, ganaches, geleias, cores] = await Promise.all([
        supabase.from('opcoes_chocolate').select('*').order('nome'),
        supabase.from('opcoes_base').select('*').order('nome'),
        supabase.from('opcoes_ganache').select('*').order('nome'),
        supabase.from('opcoes_geleia').select('*').order('nome'),
        supabase.from('opcoes_cor').select('*').order('nome')
      ]);

      setOptions({
        chocolates: chocolates.data || [],
        bases: bases.data || [],
        ganaches: ganaches.data || [],
        geleias: geleias.data || [],
        cores: cores.data || []
      });
    } catch (error) {
      console.error('Error fetching options:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar opções."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOption = async (formData: FormData) => {
    const type = editingOption.type;
    const isEditing = editingOption.option !== null;
    
    const optionData: any = {
      nome: formData.get('nome') as string,
      ativo: formData.get('ativo') === 'on'
    };

    if (type === 'cores') {
      optionData.codigo_hex = formData.get('codigo_hex') as string;
    }

    try {
      let result;
      
      if (isEditing) {
        if (type === 'chocolates') {
          result = await supabase.from('opcoes_chocolate').update(optionData).eq('id', editingOption.option!.id);
        } else if (type === 'bases') {
          result = await supabase.from('opcoes_base').update(optionData).eq('id', editingOption.option!.id);
        } else if (type === 'ganaches') {
          result = await supabase.from('opcoes_ganache').update(optionData).eq('id', editingOption.option!.id);
        } else if (type === 'geleias') {
          result = await supabase.from('opcoes_geleia').update(optionData).eq('id', editingOption.option!.id);
        } else if (type === 'cores') {
          result = await supabase.from('opcoes_cor').update(optionData).eq('id', editingOption.option!.id);
        }
      } else {
        if (type === 'chocolates') {
          result = await supabase.from('opcoes_chocolate').insert([optionData]);
        } else if (type === 'bases') {
          result = await supabase.from('opcoes_base').insert([optionData]);
        } else if (type === 'ganaches') {
          result = await supabase.from('opcoes_ganache').insert([optionData]);
        } else if (type === 'geleias') {
          result = await supabase.from('opcoes_geleia').insert([optionData]);
        } else if (type === 'cores') {
          result = await supabase.from('opcoes_cor').insert([optionData]);
        }
      }

      if (result?.error) throw result.error;

      toast({
        title: "Sucesso",
        description: `Opção ${isEditing ? 'atualizada' : 'criada'} com sucesso.`
      });

      fetchAllOptions();
      setIsDialogOpen(false);
      setEditingOption({ type: '', option: null });
    } catch (error) {
      console.error('Error saving option:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} opção.`
      });
    }
  };

  const handleDeleteOption = async (type: string, id: string) => {
    try {
      let result;
      
      if (type === 'chocolates') {
        result = await supabase.from('opcoes_chocolate').delete().eq('id', id);
      } else if (type === 'bases') {
        result = await supabase.from('opcoes_base').delete().eq('id', id);
      } else if (type === 'ganaches') {
        result = await supabase.from('opcoes_ganache').delete().eq('id', id);
      } else if (type === 'geleias') {
        result = await supabase.from('opcoes_geleia').delete().eq('id', id);
      } else if (type === 'cores') {
        result = await supabase.from('opcoes_cor').delete().eq('id', id);
      }

      if (result?.error) throw result.error;

      toast({
        title: "Sucesso",
        description: "Opção removida com sucesso."
      });

      fetchAllOptions();
    } catch (error) {
      console.error('Error deleting option:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover opção."
      });
    }
  };

  const handleToggleActive = async (type: string, option: Option) => {
    try {
      let result;
      
      if (type === 'chocolates') {
        result = await supabase.from('opcoes_chocolate').update({ ativo: !option.ativo }).eq('id', option.id);
      } else if (type === 'bases') {
        result = await supabase.from('opcoes_base').update({ ativo: !option.ativo }).eq('id', option.id);
      } else if (type === 'ganaches') {
        result = await supabase.from('opcoes_ganache').update({ ativo: !option.ativo }).eq('id', option.id);
      } else if (type === 'geleias') {
        result = await supabase.from('opcoes_geleia').update({ ativo: !option.ativo }).eq('id', option.id);
      } else if (type === 'cores') {
        result = await supabase.from('opcoes_cor').update({ ativo: !option.ativo }).eq('id', option.id);
      }

      if (result?.error) throw result.error;

      toast({
        title: "Sucesso",
        description: `Opção ${!option.ativo ? 'ativada' : 'desativada'} com sucesso.`
      });

      fetchAllOptions();
    } catch (error) {
      console.error('Error toggling option:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao alterar status da opção."
      });
    }
  };

  const openEditDialog = (type: string, option: Option | null = null) => {
    setEditingOption({ type, option });
    setIsDialogOpen(true);
  };

  const OptionCard = ({ type, options: typeOptions, title }: { type: string; options: Option[]; title: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button 
          size="sm" 
          onClick={() => openEditDialog(type)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Adicionar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {typeOptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma opção cadastrada
            </p>
          ) : (
            typeOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {type === 'cores' && option.codigo_hex && (
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: option.codigo_hex }}
                    />
                  )}
                  <div>
                    <span className="font-medium">{option.nome}</span>
                    {type === 'cores' && option.codigo_hex && (
                      <span className="text-sm text-muted-foreground ml-2">
                        {option.codigo_hex}
                      </span>
                    )}
                  </div>
                  <Badge variant={option.ativo ? "default" : "secondary"}>
                    {option.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={option.ativo}
                    onCheckedChange={() => handleToggleActive(type, option)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(type, option)}
                  >
                    <Edit size={14} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{option.nome}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteOption(type, option.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chocolates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chocolates">Chocolates</TabsTrigger>
          <TabsTrigger value="bases">Bases</TabsTrigger>
          <TabsTrigger value="ganaches">Ganaches</TabsTrigger>
          <TabsTrigger value="geleias">Geleias</TabsTrigger>
          <TabsTrigger value="cores">Cores</TabsTrigger>
        </TabsList>

        <TabsContent value="chocolates">
          <OptionCard type="chocolates" options={options.chocolates} title="Tipos de Chocolate" />
        </TabsContent>

        <TabsContent value="bases">
          <OptionCard type="bases" options={options.bases} title="Bases" />
        </TabsContent>

        <TabsContent value="ganaches">
          <OptionCard type="ganaches" options={options.ganaches} title="Ganaches" />
        </TabsContent>

        <TabsContent value="geleias">
          <OptionCard type="geleias" options={options.geleias} title="Geleias" />
        </TabsContent>

        <TabsContent value="cores">
          <OptionCard type="cores" options={options.cores} title="Cores" />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOption.option ? 'Editar' : 'Adicionar'} {editingOption.type.charAt(0).toUpperCase() + editingOption.type.slice(1, -1)}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveOption(formData);
          }} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={editingOption.option?.nome || ''}
                required
              />
            </div>

            {editingOption.type === 'cores' && (
              <div>
                <Label htmlFor="codigo_hex">Código da Cor (Hex)</Label>
                <Input
                  id="codigo_hex"
                  name="codigo_hex"
                  type="color"
                  defaultValue={editingOption.option?.codigo_hex || '#000000'}
                  required
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                name="ativo"
                defaultChecked={editingOption.option?.ativo ?? true}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingOption.option ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OptionsManager;