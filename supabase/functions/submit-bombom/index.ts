
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const body = await req.json();
    const {
      selection,
      prompt,
      url_imagem,
      user_id,
      guest_nome,
      guest_telefone
    } = body;

    if (!selection?.chocolate_id || !selection?.ganache_id || !selection?.cor_id) {
      return new Response(JSON.stringify({ error: "Seleção incompleta." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Basic sanity on guest fields
    if (!user_id) {
      if (!guest_nome || !guest_telefone) {
        return new Response(JSON.stringify({ error: "Informe nome e WhatsApp." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const { data, error } = await supabase
      .from("bombons")
      .insert({
        user_id: user_id ?? null,
        chocolate_id: selection.chocolate_id,
        base_id: selection.base_id ?? null,
        ganache_id: selection.ganache_id,
        geleia_id: selection.geleia_id ?? null,
        cor_id: selection.cor_id,
        prompt_gerado: prompt ?? null,
        url_imagem: url_imagem ?? null,
        status: "enviado",
        guest_nome: user_id ? null : guest_nome,
        guest_telefone: user_id ? null : guest_telefone
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true, bombom: data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: "Erro interno." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
