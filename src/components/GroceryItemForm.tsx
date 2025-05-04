import { useEffect, useState } from "react";
import { useGrocery, GroceryItem } from "@/contexts/GroceryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
interface GroceryItemFormProps {
  listId: string;
  item?: GroceryItem;
  onSubmit?: (item?: GroceryItem) => void;
}
const UNITS = ["kg", "g", "lb", "pcs", "l", "ml", "dozen"];
export function GroceryItemForm({
  listId,
  item,
  onSubmit
}: GroceryItemFormProps) {
  const {
    addItemToList,
    updateItemInList,
    generatePriceSuggestion
  } = useGrocery();
  const [name, setName] = useState(item?.name || "");
  const [quantity, setQuantity] = useState(item?.quantity.toString() || "1");
  const [unit, setUnit] = useState(item?.unit || "kg");
  const [estimatedPrice, setEstimatedPrice] = useState(item?.estimatedPrice?.toString() || "");
  const [isGeneratingPrice, setIsGeneratingPrice] = useState(false);
  const handleQuantityChange = (value: string) => {
    // Only allow positive numbers
    if (!value || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({
        title: "Missing Information",
        description: "Please provide an item name.",
        variant: "destructive"
      });
      return;
    }
    const parsedQuantity = parseFloat(quantity) || 1;
    const parsedPrice = estimatedPrice ? parseFloat(estimatedPrice) : null;
    if (item) {
      // Update existing item
      updateItemInList(listId, item.id, {
        name,
        quantity: parsedQuantity,
        unit,
        estimatedPrice: parsedPrice
      });
    } else {
      // Add new item
      addItemToList(listId, {
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
    if (onSubmit) {
      onSubmit(item);
    }
  };
  const handleGeneratePrice = async () => {
    if (!name || !quantity) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and quantity for the item.",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsGeneratingPrice(true);
      const price = await generatePriceSuggestion(name, parseFloat(quantity) || 1, unit);
      setEstimatedPrice(price.toString());
      toast({
        title: "Price Generated",
        description: `Estimated price for ${name}: $${price.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate price suggestion.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrice(false);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Item Name</Label>
        <Input id="name" placeholder="e.g., Rice, Chicken, Eggs" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="text" inputMode="decimal" placeholder="1" value={quantity} onChange={e => handleQuantityChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unit">Unit</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="unit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent position="popper">
              {UNITS.map(u => <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="price">Estimated Price</Label>
          <Button type="button" size="sm" variant="outline" onClick={handleGeneratePrice} disabled={isGeneratingPrice || !name || !quantity}>
            {isGeneratingPrice ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            Generate
          </Button>
        </div>
        <Input id="price" type="text" inputMode="decimal" placeholder="0.00" value={estimatedPrice} onChange={e => {
        if (!e.target.value || /^\d*\.?\d*$/.test(e.target.value)) {
          setEstimatedPrice(e.target.value);
        }
      }} />
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-gray-50">
        {item ? "Update Item" : <>
            <Plus className="mr-1.5 h-4 w-4" /> Add Item
          </>}
      </Button>
    </form>;
}