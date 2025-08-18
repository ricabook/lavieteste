import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "OPENAI_API_KEY is not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Proteção contra corpo inválido
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { prompt } = body ?? {};
    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: "Prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Generating image with prompt:", prompt);

    // Traduções básicas PT → EN
    const translations: Record<string, string> = {
      "Chocolate ao Leite": "Milk Chocolate",
      "Chocolate Meio Amargo": "Semi Sweet Chocolate",
      "Chocolate Branco": "White Chocolate",
      "Chocolate 70% Cacau": "70% Cocoa Chocolate",
      "Somente chocolate": "Only chocolate",
      "Bolacha Triturada": "Crushed Cookies",
      "Sucrilhos Triturado": "Crushed Cereal",
      "Ganache de Chocolate": "Chocolate Ganache",
      "Ganache de Caramelo": "Caramel Ganache",
      "Ganache de Frutas Vermelhas": "Red Berries Ganache",
      "Ganache de Maracujá": "Passion Fruit Ganache",
      "Ganache de Café": "Coffee Ganache",
      "Geleia de Morango": "Strawberry Jam",
      "Geleia de Framboesa": "Raspberry Jam",
      "Geleia de Maracujá": "Passion Fruit Jam",
      "Geleia de Damasco": "Apricot Jam",
      "Sem Geleia": "No Jam",
      "Rosa": "Pink",
      "Azul": "Blue",
      "Verde": "Green",
      "Amarelo": "Yellow",
      "Roxo": "Purple",
      "Laranja": "Orange",
      "Vermelho": "Red",
      "Branco": "White",
      "Gere uma imagem de:": "Generate a detailed image of:",
      "Bombom de": "A handmade bonbon made of",
      "com": "with",
      "e": "and",
      "A Casquinha é pintada por completo e uniformemente de":
        "The shell is completely and uniformly painted in",
      "A cor é mostrada somente no exterior do bombom, não alterando a cor do chocolate":
        "The color is shown only on the exterior of the bonbon, not altering the chocolate color",
      "A ordem dos recheios é:": "The filling order is:",
      "base até 70% de altura com a ganache e nos 30% do topo a geléia":
        "base up to 70% height with ganache and in the top 30% the jam",
      "base até 100% de altura com a ganache":
        "base up to 100% height with ganache",
      "Uma mesa branca embaixo e nenhum outro objeto adicional na foto gerada":
        "A white table underneath and no other additional objects in the generated photo",
    };

    let englishPrompt = prompt;
    Object.entries(translations).forEach(([pt, en]) => {
      englishPrompt = englishPrompt.replace(new RegExp(pt, "g"), en);
    });

    console.log("Translated prompt:", englishPrompt);

    // Chamada à OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          // "OpenAI-Organization": "org_xxx", // descomente se necessário
          // "OpenAI-Project": "proj_xxx",     // descomente se necessário
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: englishPrompt,
          n: 1,
          size: "1024x1024",
          quality: "medium",
        }),
      },
    );

    console.log("OpenAI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error details:", errorText);
      return new Response(
        JSON.stringify({
          success: false,
          provider: "openai",
          status: response.status,
          error: errorText,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    if (!data?.data?.[0]?.b64_json) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No image data returned from OpenAI",
          raw: data,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const imageBase64 = data.data[0].b64_json;
    return new Response(
      JSON.stringify({
        success: true,
        imageBase64,
        imageUrl: `data:image/png;base64,${imageBase64}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error generating image:", error?.message, error?.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Failed to generate image",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
