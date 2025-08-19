import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CustomizationOptions {
  chocolates: Array<{ id: string; nome: string }>;
  bases: Array<{ id: string; nome: string }>;
  ganaches: Array<{ id: string; nome: string }>;
  geleias: Array<{ id: string; nome: string }>;
  cores: Array<{ id: string; nome: string; codigo_hex: string }>;
}

const useCustomizationOptions = () => {
  const [options, setOptions] = useState<CustomizationOptions>({
    chocolates: [],
    bases: [],
    ganaches: [],
    geleias: [],
    cores: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [chocolates, bases, ganaches, geleias, cores] = await Promise.all([
          supabase.from('opcoes_chocolate').select('id, nome').eq('ativo', true).order('ordem'),
          supabase.from('opcoes_base').select('id, nome').eq('ativo', true).order('ordem'),
          supabase.from('opcoes_ganache').select('id, nome').eq('ativo', true).order('ordem'),
          supabase.from('opcoes_geleia').select('id, nome').eq('ativo', true).order('ordem'),
          supabase.from('opcoes_cor').select('id, nome, codigo_hex').eq('ativo', true).order('ordem'),
        ]);

        console.log('Fetched options:', { chocolates, bases, ganaches, geleias, cores });

        setOptions({
          chocolates: chocolates.data || [],
          bases: bases.data || [],
          ganaches: ganaches.data || [],
          geleias: geleias.data || [],
          cores: cores.data || [],
        });

        if (chocolates.error) console.error('Chocolates error:', chocolates.error);
        if (bases.error) console.error('Bases error:', bases.error);
        if (ganaches.error) console.error('Ganaches error:', ganaches.error);
        if (geleias.error) console.error('Geleias error:', geleias.error);
        if (cores.error) console.error('Cores error:', cores.error);
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, loading };
};

export default useCustomizationOptions;