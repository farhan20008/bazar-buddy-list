import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BangladeshiGroceryItem {
  name_en: string;
  name_bn: string;
  category: string;
  estimated_price: number;
  unit: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'all' } = await req.json();
    
    const prompt = `Generate a comprehensive list of 50 popular Bangladeshi grocery items with accurate market prices in Dhaka, Bangladesh. Include items from categories like vegetables, fruits, meat, fish, dairy, spices, grains, pulses, and household essentials.

For each item, provide:
- English name
- Bengali name (in Bengali script)
- Category
- Current market price per unit in BDT
- Appropriate unit (kg, pcs, l, etc.)

Format as JSON array with objects containing: name_en, name_bn, category, estimated_price, unit

Focus on commonly purchased items in Bangladesh with realistic 2024 market prices.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a grocery price expert for Bangladesh. Provide accurate, current market prices for grocery items in Dhaka. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data);
    
    let groceryItems: BangladeshiGroceryItem[] = [];
    
    try {
      const content = data.choices[0].message.content.trim();
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        groceryItems = JSON.parse(jsonMatch[0]);
      } else {
        groceryItems = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback to predefined list
      groceryItems = [
        { name_en: "Rice (Basmati)", name_bn: "চাল (বাসমতি)", category: "grains", estimated_price: 80, unit: "kg" },
        { name_en: "Potato", name_bn: "আলু", category: "vegetables", estimated_price: 25, unit: "kg" },
        { name_en: "Onion", name_bn: "পেঁয়াজ", category: "vegetables", estimated_price: 35, unit: "kg" },
        { name_en: "Chicken", name_bn: "মুরগি", category: "meat", estimated_price: 180, unit: "kg" },
        { name_en: "Fish (Rohu)", name_bn: "মাছ (রুই)", category: "fish", estimated_price: 250, unit: "kg" },
        { name_en: "Milk", name_bn: "দুধ", category: "dairy", estimated_price: 60, unit: "l" },
        { name_en: "Eggs", name_bn: "ডিম", category: "dairy", estimated_price: 12, unit: "pcs" },
        { name_en: "Tomato", name_bn: "টমেটো", category: "vegetables", estimated_price: 40, unit: "kg" },
        { name_en: "Lentils (Red)", name_bn: "মসুর ডাল", category: "pulses", estimated_price: 120, unit: "kg" },
        { name_en: "Oil (Soybean)", name_bn: "তেল (সয়াবিন)", category: "cooking", estimated_price: 140, unit: "l" }
      ];
    }

    // Filter by category if specified
    if (category !== 'all') {
      groceryItems = groceryItems.filter(item => item.category === category);
    }

    return new Response(JSON.stringify({ items: groceryItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating Bangladeshi grocery items:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});