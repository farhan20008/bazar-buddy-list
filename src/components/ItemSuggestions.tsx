import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, History, Globe } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ItemSuggestionsProps {
  onItemSelect: (item: { name: string; price: number; unit: string }) => void;
}

interface BangladeshiGroceryItem {
  name_en: string;
  name_bn: string;
  category: string;
  estimated_price: number;
  unit: string;
}

interface PreviousItem {
  name: string;
  unit: string;
  estimated_price: number;
}

export function ItemSuggestions({ onItemSelect }: ItemSuggestionsProps) {
  const { isEnglish } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'previous' | 'bangladeshi'>('previous');
  const [previousItems, setPreviousItems] = useState<PreviousItem[]>([]);
  const [bangladeshiItems, setBangladeshiItems] = useState<BangladeshiGroceryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [isLoadingBangladeshi, setIsLoadingBangladeshi] = useState(false);

  const categories = [
    { value: 'all', label: isEnglish ? 'All Categories' : 'সব ক্যাটাগরি' },
    { value: 'vegetables', label: isEnglish ? 'Vegetables' : 'সবজি' },
    { value: 'fruits', label: isEnglish ? 'Fruits' : 'ফল' },
    { value: 'meat', label: isEnglish ? 'Meat' : 'মাংস' },
    { value: 'fish', label: isEnglish ? 'Fish' : 'মাছ' },
    { value: 'dairy', label: isEnglish ? 'Dairy' : 'দুগ্ধজাত' },
    { value: 'grains', label: isEnglish ? 'Grains' : 'শস্য' },
    { value: 'spices', label: isEnglish ? 'Spices' : 'মসলা' },
    { value: 'cooking', label: isEnglish ? 'Cooking Essentials' : 'রান্নার উপকরণ' }
  ];

  // Load previous items from user's grocery history
  useEffect(() => {
    const loadPreviousItems = async () => {
      if (!user) return;
      
      setIsLoadingPrevious(true);
      try {
        const { data, error } = await supabase
          .from('grocery_items')
          .select(`
            name,
            unit,
            estimated_price,
            grocery_lists!inner(user_id)
          `)
          .eq('grocery_lists.user_id', user.id);

        if (error) throw error;

        // Get unique items with their most recent price
        const uniqueItems = data?.reduce((acc: PreviousItem[], item) => {
          const existingItem = acc.find(i => i.name.toLowerCase() === item.name.toLowerCase());
          if (existingItem) {
            // Update with higher price (assuming more recent)
            if (item.estimated_price > existingItem.estimated_price) {
              existingItem.estimated_price = item.estimated_price;
              existingItem.unit = item.unit;
            }
          } else {
            acc.push({
              name: item.name,
              unit: item.unit,
              estimated_price: item.estimated_price || 0
            });
          }
          return acc;
        }, []) || [];

        setPreviousItems(uniqueItems.slice(0, 20)); // Limit to 20 items
      } catch (error) {
        console.error('Error loading previous items:', error);
      } finally {
        setIsLoadingPrevious(false);
      }
    };

    loadPreviousItems();
  }, [user]);

  // Load Bangladeshi grocery items
  useEffect(() => {
    const loadBangladeshiItems = async () => {
      setIsLoadingBangladeshi(true);
      try {
        const response = await supabase.functions.invoke('bangladeshi-grocery-items', {
          body: { category: selectedCategory }
        });

        if (response.error) throw response.error;
        
        setBangladeshiItems(response.data.items || []);
      } catch (error) {
        console.error('Error loading Bangladeshi items:', error);
        toast({
          title: isEnglish ? "Loading Error" : "লোডিং ত্রুটি",
          description: isEnglish 
            ? "Failed to load Bangladeshi grocery items" 
            : "বাংলাদেশি মুদি আইটেম লোড করতে ব্যর্থ",
          variant: "destructive"
        });
      } finally {
        setIsLoadingBangladeshi(false);
      }
    };

    loadBangladeshiItems();
  }, [selectedCategory, isEnglish]);

  const handleItemSelect = (item: { name: string; price: number; unit: string }) => {
    onItemSelect(item);
    toast({
      title: isEnglish ? "Item Added" : "আইটেম যোগ করা হয়েছে",
      description: isEnglish 
        ? `${item.name} has been added to your list` 
        : `${item.name} আপনার তালিকায় যোগ করা হয়েছে`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEnglish ? "Quick Add Items" : "দ্রুত আইটেম যোগ করুন"}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'previous' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('previous')}
            disabled={!user}
          >
            <History className="mr-1 h-4 w-4" />
            {isEnglish ? "Previous" : "পূর্ববর্তী"}
          </Button>
          <Button
            variant={activeTab === 'bangladeshi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('bangladeshi')}
          >
            <Globe className="mr-1 h-4 w-4" />
            {isEnglish ? "Popular BD" : "জনপ্রিয় বিডি"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'previous' && (
          <div className="space-y-3">
            {!user ? (
              <p className="text-muted-foreground text-center py-4">
                {isEnglish 
                  ? "Login to see your previous items" 
                  : "আপনার পূর্ববর্তী আইটেম দেখতে লগইন করুন"
                }
              </p>
            ) : isLoadingPrevious ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : previousItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {isEnglish 
                  ? "No previous items found. Create your first list to see suggestions here." 
                  : "কোন পূর্ববর্তী আইটেম পাওয়া যায়নি। এখানে সাজেশন দেখতে আপনার প্রথম তালিকা তৈরি করুন।"
                }
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {previousItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.estimated_price} ৳ per {item.unit}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleItemSelect({
                        name: item.name,
                        price: item.estimated_price,
                        unit: item.unit
                      })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bangladeshi' && (
          <div className="space-y-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={isEnglish ? "Select category" : "ক্যাটাগরি নির্বাচন করুন"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoadingBangladeshi ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {bangladeshiItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {isEnglish ? item.name_en : item.name_bn}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {item.estimated_price} ৳ per {item.unit}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleItemSelect({
                        name: isEnglish ? item.name_en : item.name_bn,
                        price: item.estimated_price,
                        unit: item.unit
                      })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}