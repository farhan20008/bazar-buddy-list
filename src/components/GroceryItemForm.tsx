
import { useEffect, useState } from "react";
import { useGrocery, GroceryItem } from "@/contexts/GroceryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

interface GroceryItemFormProps {
  listId: string;
  item?: GroceryItem;
  onSubmit?: (item?: GroceryItem) => void;
  isCreatePage?: boolean;
}

const UNITS = ["kg", "g", "lb", "pcs", "l", "ml", "dozen"];
const UNITS_BN = ["কেজি", "গ্রাম", "পাউন্ড", "পিস", "লিটার", "মিলিলিটার", "ডজন"];

export function GroceryItemForm({
  listId,
  item,
  onSubmit,
  isCreatePage = false
}: GroceryItemFormProps) {
  const { language, isEnglish } = useLanguage();
  const {
    addItemToList,
    updateItemInList,
    generatePriceSuggestion,
    isLoading
  } = useGrocery();
  
  const [name, setName] = useState(item?.name || "");
  const [quantity, setQuantity] = useState(item?.quantity.toString() || "1");
  const [unit, setUnit] = useState(item?.unit || "kg");
  const [estimatedPrice, setEstimatedPrice] = useState(
    item?.estimatedPrice ? 
    item.estimatedPrice.toString() : 
    "");
  const [isGeneratingPrice, setIsGeneratingPrice] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleQuantityChange = (value: string) => {
    // Only allow positive numbers
    if (!value || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({
        title: isEnglish ? "Missing Information" : "তথ্য অনুপস্থিত",
        description: isEnglish ? "Please provide an item name." : "অনুগ্রহ করে আইটেমের নাম প্রদান করুন।",
        variant: "destructive"
      });
      return;
    }
    
    setLocalLoading(true);
    try {
      const parsedQuantity = parseFloat(quantity) || 1;
      const parsedPrice = estimatedPrice ? parseFloat(estimatedPrice) : null;
      
      if (item) {
        // Update existing item
        await updateItemInList(listId, item.id, {
          name,
          quantity: parsedQuantity,
          unit,
          estimatedPrice: parsedPrice
        });
      } else if (isCreatePage) {
        // For create page, create temporary item to add to the form
        const newItem: GroceryItem = {
          id: uuidv4(), // Generate temporary ID
          name,
          quantity: parsedQuantity,
          unit,
          estimatedPrice: parsedPrice || 0
        };
        
        if (onSubmit) {
          onSubmit(newItem);
        }
      } else {
        // Add new item to existing list in database
        await addItemToList(listId, {
          name,
          quantity: parsedQuantity,
          unit
        });
      }

      // Reset form and call onSubmit callback
      if (!item) {
        setName("");
        setQuantity("1");
        setUnit("kg");
        setEstimatedPrice("");
      }
      
      if (onSubmit && !isCreatePage) {
        onSubmit(item);
      }
    } catch (error) {
      console.error("Error submitting item:", error);
    } finally {
      setLocalLoading(false);
    }
  };
  
  const handleGeneratePrice = async () => {
    if (!name || !quantity) {
      toast({
        title: isEnglish ? "Missing Information" : "তথ্য অনুপস্থিত",
        description: isEnglish ? "Please provide a name and quantity for the item." : "অনুগ্রহ করে আইটেমের নাম এবং পরিমাণ প্রদান করুন।",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGeneratingPrice(true);
      const priceBdt = await generatePriceSuggestion(name, parseFloat(quantity) || 1, unit);
      setEstimatedPrice(priceBdt.toFixed(2));

      // Format the toast message according to the specified examples
      const toastDescription = isEnglish ? 
        `Estimated price for ${quantity} ${unit} of "${name}" in Bangladeshi Taka: ${priceBdt}` :
        `${quantity} ${unit} "${name}" এর অনুমানিত মূল্য বাংলাদেশি টাকায়: ${priceBdt}`;
        
      toast({
        title: isEnglish ? "Price Generated" : "মূল্য তৈরি হয়েছে",
        description: toastDescription
      });
    } catch (error) {
      console.error("Error generating price:", error);
      toast({
        title: isEnglish ? "Error" : "ত্রুটি",
        description: isEnglish ? "Failed to generate price suggestion." : "মূল্য প্রস্তাব তৈরি করতে ব্যর্থ।",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrice(false);
    }
  };
  
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{isEnglish ? "Item Name" : "আইটেমের নাম"}</Label>
        <Input id="name" placeholder={isEnglish ? "e.g., Rice, Chicken, Eggs" : "যেমন, চাল, মুরগি, ডিম"} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="quantity">{isEnglish ? "Quantity" : "পরিমাণ"}</Label>
          <Input id="quantity" type="text" inputMode="decimal" placeholder="1" value={quantity} onChange={e => handleQuantityChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unit">{isEnglish ? "Unit" : "একক"}</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="unit">
              <SelectValue placeholder={isEnglish ? "Select unit" : "একক নির্বাচন করুন"} />
            </SelectTrigger>
            <SelectContent position="popper">
              {UNITS.map((u, index) => <SelectItem key={u} value={u}>
                  {isEnglish ? u : UNITS_BN[index]}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="price">{isEnglish ? "Estimated Price (BDT)" : "অনুমানিত মূল্য (৳)"}</Label>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={handleGeneratePrice} 
            disabled={isGeneratingPrice || !name || !quantity}
          >
            {isGeneratingPrice ? 
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : 
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            }
            {isEnglish ? "Generate" : "তৈরি করুন"}
          </Button>
        </div>
        <Input 
          id="price" 
          type="text" 
          inputMode="decimal" 
          placeholder="0.00" 
          value={estimatedPrice} 
          onChange={e => {
            if (!e.target.value || /^\d*\.?\d*$/.test(e.target.value)) {
              setEstimatedPrice(e.target.value);
            }
          }} 
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-orange-600 hover:bg-orange-500 text-gray-50"
        disabled={isLoading || localLoading}
      >
        {isLoading || localLoading ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : item ? (
          isEnglish ? "Update Item" : "আইটেম আপডেট করুন"
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" /> 
            {isEnglish ? "Add Item" : "আইটেম যোগ করুন"}
          </>
        )}
      </Button>
    </form>;
}
