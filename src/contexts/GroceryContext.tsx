
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number | null;
}

export interface GroceryList {
  id: string;
  title: string;
  month: string;
  year: number;
  createdAt: string;
  items: GroceryItem[];
  totalEstimatedPrice: number;
}

interface GroceryContextType {
  lists: GroceryList[];
  currentList: GroceryList | null;
  setCurrentList: (list: GroceryList | null) => void;
  createList: (list: Omit<GroceryList, "id" | "createdAt" | "totalEstimatedPrice">) => void;
  updateList: (id: string, list: Partial<GroceryList>) => void;
  deleteList: (id: string) => void;
  getListById: (id: string) => GroceryList | undefined;
  addItemToList: (listId: string, item: Omit<GroceryItem, "id" | "estimatedPrice">) => void;
  updateItemInList: (listId: string, itemId: string, item: Partial<GroceryItem>) => void;
  removeItemFromList: (listId: string, itemId: string) => void;
  generatePriceSuggestion: (itemName: string, quantity: number, unit: string) => Promise<number>;
}

const GroceryContext = createContext<GroceryContextType | null>(null);

export const useGrocery = () => {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error("useGrocery must be used within a GroceryProvider");
  }
  return context;
};

interface GroceryProviderProps {
  children: ReactNode;
}

export const GroceryProvider = ({ children }: GroceryProviderProps) => {
  const { user } = useAuth();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);

  // Load lists from local storage on mount and when user changes
  useEffect(() => {
    if (user) {
      const storedLists = localStorage.getItem(`bazarLists_${user.id}`);
      if (storedLists) {
        setLists(JSON.parse(storedLists));
      } else {
        // Initialize with sample data if no lists found
        const sampleLists: GroceryList[] = [
          {
            id: "1",
            title: "April Groceries",
            month: "April",
            year: 2025,
            createdAt: new Date().toISOString(),
            items: [
              { id: "i1", name: "Rice", quantity: 5, unit: "kg", estimatedPrice: 25 },
              { id: "i2", name: "Chicken", quantity: 2, unit: "kg", estimatedPrice: 18 },
              { id: "i3", name: "Eggs", quantity: 24, unit: "pcs", estimatedPrice: 6 },
            ],
            totalEstimatedPrice: 49,
          },
        ];
        setLists(sampleLists);
        localStorage.setItem(`bazarLists_${user.id}`, JSON.stringify(sampleLists));
      }
    } else {
      setLists([]);
    }
  }, [user]);

  // Save lists to local storage whenever they change
  useEffect(() => {
    if (user && lists.length > 0) {
      localStorage.setItem(`bazarLists_${user.id}`, JSON.stringify(lists));
    }
  }, [lists, user]);

  const createList = (list: Omit<GroceryList, "id" | "createdAt" | "totalEstimatedPrice">) => {
    const newList: GroceryList = {
      ...list,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      totalEstimatedPrice: list.items.reduce(
        (total, item) => total + (item.estimatedPrice || 0),
        0
      ),
    };
    
    setLists((prevLists) => [...prevLists, newList]);
    toast({
      title: "List Created",
      description: `${newList.title} has been created successfully.`,
    });
  };

  const updateList = (id: string, updatedFields: Partial<GroceryList>) => {
    setLists((prevLists) => {
      return prevLists.map((list) => {
        if (list.id === id) {
          const updatedList = {
            ...list,
            ...updatedFields,
          };
          
          // Recalculate total if items were updated
          if (updatedFields.items) {
            updatedList.totalEstimatedPrice = updatedFields.items.reduce(
              (total, item) => total + (item.estimatedPrice || 0),
              0
            );
          }
          
          return updatedList;
        }
        return list;
      });
    });
    
    toast({
      title: "List Updated",
      description: "Your grocery list has been updated successfully.",
    });
  };

  const deleteList = (id: string) => {
    setLists((prevLists) => prevLists.filter((list) => list.id !== id));
    
    toast({
      title: "List Deleted",
      description: "Your grocery list has been deleted.",
    });
  };

  const getListById = (id: string) => {
    return lists.find((list) => list.id === id);
  };

  const addItemToList = (
    listId: string,
    item: Omit<GroceryItem, "id" | "estimatedPrice">
  ) => {
    const estimatedPrice = Math.floor(Math.random() * 10) + 1; // Mock price logic
    
    setLists((prevLists) => {
      return prevLists.map((list) => {
        if (list.id === listId) {
          const newItem: GroceryItem = {
            ...item,
            id: crypto.randomUUID(),
            estimatedPrice,
          };
          
          const updatedItems = [...list.items, newItem];
          const updatedTotalPrice = updatedItems.reduce(
            (total, i) => total + (i.estimatedPrice || 0),
            0
          );
          
          return {
            ...list,
            items: updatedItems,
            totalEstimatedPrice: updatedTotalPrice,
          };
        }
        return list;
      });
    });
  };

  const updateItemInList = (
    listId: string,
    itemId: string,
    updatedFields: Partial<GroceryItem>
  ) => {
    setLists((prevLists) => {
      return prevLists.map((list) => {
        if (list.id === listId) {
          const updatedItems = list.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, ...updatedFields };
            }
            return item;
          });
          
          const updatedTotalPrice = updatedItems.reduce(
            (total, item) => total + (item.estimatedPrice || 0),
            0
          );
          
          return {
            ...list,
            items: updatedItems,
            totalEstimatedPrice: updatedTotalPrice,
          };
        }
        return list;
      });
    });
  };

  const removeItemFromList = (listId: string, itemId: string) => {
    setLists((prevLists) => {
      return prevLists.map((list) => {
        if (list.id === listId) {
          const updatedItems = list.items.filter((item) => item.id !== itemId);
          
          const updatedTotalPrice = updatedItems.reduce(
            (total, item) => total + (item.estimatedPrice || 0),
            0
          );
          
          return {
            ...list,
            items: updatedItems,
            totalEstimatedPrice: updatedTotalPrice,
          };
        }
        return list;
      });
    });
  };

  // Mock AI price suggestion generator
  const generatePriceSuggestion = async (name: string, quantity: number, unit: string): Promise<number> => {
    // Simulate API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock logic for price calculation
        const basePrice = {
          rice: 5,
          chicken: 9,
          beef: 12,
          eggs: 0.25,
          milk: 2,
          bread: 3,
          oil: 8,
          sugar: 2,
          salt: 1,
          onion: 1,
          potato: 1,
          tomato: 1.5,
        }[name.toLowerCase()] || Math.floor(Math.random() * 10) + 1;
        
        let multiplier = 1;
        
        switch (unit.toLowerCase()) {
          case 'kg':
            multiplier = 1;
            break;
          case 'g':
            multiplier = 0.001;
            break;
          case 'lb':
            multiplier = 0.45;
            break;
          case 'dozen':
            multiplier = 12;
            break;
          case 'pcs':
          case 'pieces':
            multiplier = 1;
            break;
          case 'l':
          case 'liter':
            multiplier = 1;
            break;
          case 'ml':
            multiplier = 0.001;
            break;
          default:
            multiplier = 1;
        }
        
        const price = basePrice * quantity * multiplier;
        resolve(Math.round(price * 100) / 100); // Round to 2 decimal places
      }, 500);
    });
  };

  const value = {
    lists,
    currentList,
    setCurrentList,
    createList,
    updateList,
    deleteList,
    getListById,
    addItemToList,
    updateItemInList,
    removeItemFromList,
    generatePriceSuggestion,
  };

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>;
};
