
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemName, quantity, unit } = await req.json();
    console.log(`Generating price for: ${itemName}, quantity: ${quantity}, unit: ${unit}`);
    
    // Detect if the item name is in Bangla
    const isBangla = /[\u0980-\u09FF]/.test(itemName);
    
    let prompt;
    if (isBangla) {
      prompt = `আমি বাংলাদেশে একটি গ্রোসারি মূল্য অনুমান করতে চাই। আমার আইটেম হলো ${quantity} ${unit} ${itemName}। 
      দয়া করে এই আইটেমের জন্য বাংলাদেশে এর গড় বাজার মূল্য USD মূদ্রায় প্রদান করুন।
      শুধু মূল্য সংখ্যা দিন (মার্কিন ডলারে), কোন অতিরিক্ত ব্যাখ্যা বা টেক্সট নয়। যেমন: 2.50`;
    } else {
      prompt = `I want to estimate the average market price in Bangladesh for a grocery item: ${quantity} ${unit} of ${itemName}. 
      Please provide the average market price for this item in Bangladesh in USD currency.
      Provide only the numeric value in USD, no additional explanation or text. For example: 2.50`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides average market prices for grocery items in Bangladesh. Respond with only the numeric price value in USD without any text, currency symbols or explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data);
    
    // Parse the generated price, handling various possible formats
    const priceText = data.choices[0].message.content.trim();
    const priceMatch = priceText.match(/(\d+(\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : null;
    
    if (price === null) {
      throw new Error(`Failed to parse price from response: ${priceText}`);
    }
    
    return new Response(JSON.stringify({ price }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating price:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
