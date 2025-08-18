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
    console.log("Edge function called with method:", req.method)
    
    const FAL_API_KEY = Deno.env.get('FAL_API_KEY')
    if (!FAL_API_KEY) {
      console.error('FAL_API_KEY is not set in environment')
      throw new Error('FAL_API_KEY is not set')
    }
    
    console.log("FAL_API_KEY found, length:", FAL_API_KEY.length)

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

    // Call fal.ai API for image generation
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: englishPrompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true
      })
    })

    console.log("fal.ai response status:", response.status)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('fal.ai error details:', errorData)
      throw new Error(`fal.ai API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log("fal.ai response received, data keys:", Object.keys(data))
    
    if (!data.images || data.images.length === 0) {
      console.error('No images array in response:', data)
      throw new Error('No image data returned from fal.ai')
    }
    
    if (!data.images[0].url) {
      console.error('No URL in first image item:', data.images[0])
      throw new Error('No image URL in response')
    }
    
    const imageUrl = data.images[0].url
    console.log("Image URL received:", imageUrl)
    
    // Download the image and convert to base64
    console.log("Downloading image from URL...")
    const imageResponse = await fetch(imageUrl)
    console.log("Image download response status:", imageResponse.status)
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    console.log("Image buffer size:", imageBuffer.byteLength)
    
    // Convert to base64 using a more reliable method for Deno
    const uint8Array = new Uint8Array(imageBuffer)
    const chunks = []
    const chunkSize = 0x8000 // 32KB chunks
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
      chunks.push(String.fromCharCode.apply(null, Array.from(chunk)))
    }
    
    const imageBase64 = btoa(chunks.join(''))
    console.log("Base64 conversion completed, length:", imageBase64.length)
    
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