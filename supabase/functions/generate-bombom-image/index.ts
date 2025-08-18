import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const { prompt } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log("Generating image with prompt:", prompt)

    // Translate Portuguese terms to English
    const translations = {
      'Chocolate ao Leite': 'Milk Chocolate',
      'Chocolate Meio Amargo': 'Semi Sweet Chocolate',
      'Chocolate Branco': 'White Chocolate',
      'Chocolate 70% Cacau': '70% Cocoa Chocolate',
      'Somente chocolate': 'Only chocolate',
      'Bolacha Triturada': 'Crushed Cookies',
      'Sucrilhos Triturado': 'Crushed Cereal',
      'Ganache de Chocolate': 'Chocolate Ganache',
      'Ganache de Caramelo': 'Caramel Ganache',
      'Ganache de Frutas Vermelhas': 'Red Berries Ganache',
      'Ganache de Maracujá': 'Passion Fruit Ganache',
      'Ganache de Café': 'Coffee Ganache',
      'Geleia de Morango': 'Strawberry Jam',
      'Geleia de Framboesa': 'Raspberry Jam',
      'Geleia de Maracujá': 'Passion Fruit Jam',
      'Geleia de Damasco': 'Apricot Jam',
      'Sem Geleia': 'No Jam',
      'Rosa': 'Pink',
      'Azul': 'Blue',
      'Verde': 'Green',
      'Amarelo': 'Yellow',
      'Roxo': 'Purple',
      'Laranja': 'Orange',
      'Vermelho': 'Red',
      'Branco': 'White',
      'Gere uma imagem de:': 'Generate a detailed image of:',
      'Bombom de': 'A luxury bonbon made of',
      'com': 'with',
      'e': 'and',
      'A Casquinha é pintada por completo e uniformemente de': 'The shell is completely and uniformly painted in',
      'A cor é mostrada somente no exterior do bombom, não alterando a cor do chocolate': 'The color is shown only on the exterior of the bonbon, not altering the chocolate color',
      'A ordem dos recheios é:': 'The filling order is:',
      'base até 70% de altura com a ganache e nos 30% do topo a geléia': 'base up to 70% height with ganache and in the top 30% the jam',
      'base até 100% de altura com a ganache': 'base up to 100% height with ganache',
      'Uma mesa branca embaixo e nenhum outro objeto adicional na foto gerada': 'A white table underneath and no other additional objects in the generated photo'
    }

    let englishPrompt = prompt
    Object.entries(translations).forEach(([portuguese, english]) => {
      englishPrompt = englishPrompt.replace(new RegExp(portuguese, 'g'), english)
    })

    console.log("Translated prompt:", englishPrompt)

    // Call OpenAI API for image generation
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: englishPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      })
    })

    console.log("OpenAI response status:", response.status)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI error details:', errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log("OpenAI response received, data keys:", Object.keys(data))
    
    if (!data.data || data.data.length === 0) {
      console.error('No data array in response:', data)
      throw new Error('No image data returned from OpenAI')
    }
    
    if (!data.data[0].b64_json) {
      console.error('No b64_json in first data item:', data.data[0])
      throw new Error('No base64 image data in response')
    }
    
    const imageBase64 = data.data[0].b64_json
    
    return new Response(
      JSON.stringify({ 
        success: true,
        imageBase64: imageBase64,
        imageUrl: `data:image/png;base64,${imageBase64}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate image',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})