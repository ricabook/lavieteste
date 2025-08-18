import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

interface Bombon {
  id: string;
  prompt_gerado: string;
  status: string;
  created_at: string;
  opcoes_chocolate: { nome: string };
  opcoes_base: { nome: string };
  opcoes_ganache: { nome: string };
  opcoes_geleia: { nome: string } | null;
  opcoes_cor: { nome: string; codigo_hex: string };
}

const UserDashboard = () => {
  const [bombons, setBombons] = useState<Bombon[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchBombons = async () => {
      const { data, error } = await supabase
        .from('bombons')
        .select(`
          id,
          prompt_gerado,
          status,
          created_at,
          opcoes_chocolate (nome),
          opcoes_base (nome),
          opcoes_ganache (nome),
          opcoes_geleia (nome),
          opcoes_cor (nome, codigo_hex)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bombons:', error);
      } else {
        setBombons(data || []);
      }
      setLoading(false);
    };

    fetchBombons();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviado': return 'bg-blue-500';
      case 'em_producao': return 'bg-yellow-500';
      case 'finalizado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enviado': return 'Enviado';
      case 'em_producao': return 'Em Produção';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Meus Bombons</h1>
      
      {bombons.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Você ainda não criou nenhum bombom personalizado.
            </p>
            <Button 
              className="mt-4"
              onClick={() => window.location.href = '/'}
            >
              Criar Meu Primeiro Bombom
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bombons.map((bombon) => (
            <Card key={bombon.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Bombom de {bombon.opcoes_chocolate?.nome}
                  </CardTitle>
                  <Badge className={getStatusColor(bombon.status)}>
                    {getStatusText(bombon.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Base:</strong> {bombon.opcoes_base?.nome}
                    </div>
                    <div>
                      <strong>Ganache:</strong> {bombon.opcoes_ganache?.nome}
                    </div>
                    <div>
                      <strong>Geleia:</strong> {bombon.opcoes_geleia?.nome || "Sem geleia"}
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Cor:</strong>
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: bombon.opcoes_cor?.codigo_hex }}
                      />
                      {bombon.opcoes_cor?.nome}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Criado em: {new Date(bombon.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;