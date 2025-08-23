import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    // Use Google Cloud Vision API for OCR with Bengali support
    const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!visionApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Vision API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Data,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 50,
              },
            ],
            imageContext: {
              languageHints: ['en', 'bn'], // English and Bengali
            },
          },
        ],
      }),
    });

    const visionData = await visionResponse.json();
    
    if (visionData.responses && visionData.responses[0] && visionData.responses[0].textAnnotations) {
      const extractedText = visionData.responses[0].textAnnotations[0]?.description || '';
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          extractedText: extractedText.trim(),
          detectedLanguages: ['en', 'bn']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Fallback: Try Tesseract.js for better Bengali support
      const tesseractResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': Deno.env.get('OCR_SPACE_API_KEY') || 'helloworld', // Free tier key
        },
        body: (() => {
          const formData = new FormData();
          formData.append('base64Image', `data:${file.type};base64,${base64Data}`);
          formData.append('language', 'ben'); // Bengali language code
          formData.append('isOverlayRequired', 'false');
          formData.append('detectOrientation', 'true');
          formData.append('scale', 'true');
          formData.append('OCREngine', '2'); // Use engine 2 for better accuracy
          return formData;
        })(),
      });

      const tesseractData = await tesseractResponse.json();
      
      if (tesseractData.ParsedResults && tesseractData.ParsedResults[0]) {
        const extractedText = tesseractData.ParsedResults[0].ParsedText || '';
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            extractedText: extractedText.trim(),
            engine: 'tesseract'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'No text could be extracted from the image',
        extractedText: ''
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OCR Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process file for text extraction',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});