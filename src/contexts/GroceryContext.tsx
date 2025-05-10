import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  createList: (list: Omit<GroceryList, "id" | "createdAt" | "totalEstimatedPrice">) => Promise<string>;
  updateList: (id: string, list: Partial<GroceryList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  getListById: (id: string) => GroceryList | undefined;
  addItemToList: (listId: string, item: Omit<GroceryItem, "id" | "estimatedPrice">) => Promise<void>;
  updateItemInList: (listId: string, itemId: string, item: Partial<GroceryItem>) => Promise<void>;
  removeItemFromList: (listId: string, itemId: string) => Promise<void>;
  generatePriceSuggestion: (itemName: string, quantity: number, unit: string) => Promise<number>;
  downloadListAsPdf: (listId: string) => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  // Load lists from database when user changes
  useEffect(() => {
    const fetchLists = async () => {
      if (!user) {
        setLists([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all lists for the user
        const { data: listsData, error: listsError } = await supabase
          .from('grocery_lists')
          .select('*')
          .order('created_at', { ascending: false });

        if (listsError) throw listsError;

        // Fetch all items for all lists
        const { data: itemsData, error: itemsError } = await supabase
          .from('grocery_items')
          .select('*')
          .in('list_id', listsData.map(list => list.id));

        if (itemsError) throw itemsError;

        // Format data to match our application structure
        const formattedLists: GroceryList[] = listsData.map(list => {
          const listItems = itemsData
            ? itemsData.filter(item => item.list_id === list.id).map(item => ({
                id: item.id,
                name: item.name,
                quantity: Number(item.quantity),
                unit: item.unit,
                estimatedPrice: item.estimated_price ? Number(item.estimated_price) : null
              }))
            : [];

          return {
            id: list.id,
            title: list.title,
            month: list.month,
            year: list.year,
            createdAt: list.created_at,
            items: listItems,
            totalEstimatedPrice: Number(list.total_estimated_price)
          };
        });

        setLists(formattedLists);
      } catch (error) {
        console.error("Error fetching grocery data:", error);
        toast({
          title: "Error",
          description: "Failed to load your grocery lists. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, [user]);

  const createList = async (list: Omit<GroceryList, "id" | "createdAt" | "totalEstimatedPrice">) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create lists",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }

    setIsLoading(true);
    try {
      // Calculate total estimated price
      const totalEstimatedPrice = list.items.reduce(
        (total, item) => total + (item.estimatedPrice || 0),
        0
      );

      // Insert list into database
      const { data: listData, error: listError } = await supabase
        .from('grocery_lists')
        .insert([{
          user_id: user.id,
          title: list.title,
          month: list.month,
          year: list.year,
          total_estimated_price: totalEstimatedPrice
        }])
        .select()
        .single();

      if (listError) throw listError;

      // Insert all items
      if (list.items.length > 0) {
        const itemsToInsert = list.items.map(item => ({
          list_id: listData.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          estimated_price: item.estimatedPrice
        }));

        const { error: itemsError } = await supabase
          .from('grocery_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // Refetch lists to get updated data
      await fetchListsAndItems();

      toast({
        title: "List Created",
        description: `${list.title} has been created successfully.`,
      });
      
      return listData.id;
    } catch (error) {
      console.error("Error creating list:", error);
      toast({
        title: "Error",
        description: "Failed to create grocery list. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateList = async (id: string, updatedFields: Partial<GroceryList>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updates: any = {};
      
      // Only include fields that are actually changing
      if (updatedFields.title) updates.title = updatedFields.title;
      if (updatedFields.month) updates.month = updatedFields.month;
      if (updatedFields.year) updates.year = updatedFields.year;
      
      // If there are items, recalculate total price
      if (updatedFields.items) {
        const totalEstimatedPrice = updatedFields.items.reduce(
          (total, item) => total + (item.estimatedPrice || 0),
          0
        );
        updates.total_estimated_price = totalEstimatedPrice;
      }
      
      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('grocery_lists')
          .update(updates)
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Refetch to get updated data
      await fetchListsAndItems();
      
      toast({
        title: "List Updated",
        description: "Your grocery list has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating list:", error);
      toast({
        title: "Error",
        description: "Failed to update the grocery list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteList = async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Delete list (items will be cascade deleted due to foreign key constraint)
      const { error } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setLists((prevLists) => prevLists.filter((list) => list.id !== id));
      
      toast({
        title: "List Deleted",
        description: "Your grocery list has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting list:", error);
      toast({
        title: "Error",
        description: "Failed to delete the grocery list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getListById = (id: string) => {
    return lists.find((list) => list.id === id);
  };

  const addItemToList = async (
    listId: string,
    item: Omit<GroceryItem, "id" | "estimatedPrice">
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Generate price if not provided
      const estimatedPrice = Math.floor(Math.random() * 10) + 1; // Mock price logic
      
      // Add item to database
      const { data, error } = await supabase
        .from('grocery_items')
        .insert({
          list_id: listId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          estimated_price: estimatedPrice
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      const updatedLists = lists.map(list => {
        if (list.id === listId) {
          const newItem: GroceryItem = {
            id: data.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            estimatedPrice: estimatedPrice
          };
          
          const updatedItems = [...list.items, newItem];
          const updatedTotalPrice = updatedItems.reduce(
            (total, i) => total + (i.estimatedPrice || 0),
            0
          );
          
          // Update total price in database
          supabase
            .from('grocery_lists')
            .update({ total_estimated_price: updatedTotalPrice })
            .eq('id', listId)
            .then(({ error }) => {
              if (error) console.error("Error updating list total price:", error);
            });
          
          return {
            ...list,
            items: updatedItems,
            totalEstimatedPrice: updatedTotalPrice
          };
        }
        return list;
      });
      
      setLists(updatedLists);
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemInList = async (
    listId: string,
    itemId: string,
    updatedFields: Partial<GroceryItem>
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updates: any = {};
      
      // Only include fields that are actually changing
      if (updatedFields.name) updates.name = updatedFields.name;
      if (updatedFields.quantity) updates.quantity = updatedFields.quantity;
      if (updatedFields.unit) updates.unit = updatedFields.unit;
      if (updatedFields.estimatedPrice !== undefined) 
        updates.estimated_price = updatedFields.estimatedPrice;
      
      // Update item in database
      const { error } = await supabase
        .from('grocery_items')
        .update(updates)
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update local state
      const updatedLists = lists.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.map(item => {
            if (item.id === itemId) {
              return { ...item, ...updatedFields };
            }
            return item;
          });
          
          const updatedTotalPrice = updatedItems.reduce(
            (total, item) => total + (item.estimatedPrice || 0),
            0
          );
          
          // Update total price in database
          supabase
            .from('grocery_lists')
            .update({ total_estimated_price: updatedTotalPrice })
            .eq('id', listId)
            .then(({ error }) => {
              if (error) console.error("Error updating list total price:", error);
            });
          
          return {
            ...list,
            items: updatedItems,
            totalEstimatedPrice: updatedTotalPrice
          };
        }
        return list;
      });
      
      setLists(updatedLists);
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItemFromList = async (listId: string, itemId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Delete item from database
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update local state
      const updatedLists = lists.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.filter(item => item.id !== itemId);
          
          const updatedTotalPrice = updatedItems.reduce(
            (total, item) => total + (item.estimatedPrice || 0),
            0
          );
          
          // Update total price in database
          supabase
            .from('grocery_lists')
            .update({ total_estimated_price: updatedTotalPrice })
            .eq('id', listId)
            .then(({ error }) => {
              if (error) console.error("Error updating list total price:", error);
            });
          
          return {
            ...list,
            items: updatedItems,
            totalEstimatedPrice: updatedTotalPrice
          };
        }
        return list;
      });
      
      setLists(updatedLists);
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to refetch lists and items
  const fetchListsAndItems = async () => {
    if (!user) return;
    
    try {
      // Fetch all lists for the user
      const { data: listsData, error: listsError } = await supabase
        .from('grocery_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (listsError) throw listsError;

      // Fetch all items for all lists
      const { data: itemsData, error: itemsError } = await supabase
        .from('grocery_items')
        .select('*')
        .in('list_id', listsData.map(list => list.id));

      if (itemsError) throw itemsError;

      // Format data to match our application structure
      const formattedLists: GroceryList[] = listsData.map(list => {
        const listItems = itemsData
          ? itemsData.filter(item => item.list_id === list.id).map(item => ({
              id: item.id,
              name: item.name,
              quantity: Number(item.quantity),
              unit: item.unit,
              estimatedPrice: item.estimated_price ? Number(item.estimated_price) : null
            }))
          : [];

        return {
          id: list.id,
          title: list.title,
          month: list.month,
          year: list.year,
          createdAt: list.created_at,
          items: listItems,
          totalEstimatedPrice: Number(list.total_estimated_price)
        };
      });

      setLists(formattedLists);
    } catch (error) {
      console.error("Error fetching grocery data:", error);
    }
  };

  // Generate price suggestion using OpenAI
  const generatePriceSuggestion = async (itemName: string, quantity: number, unit: string): Promise<number> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-price', {
        body: { 
          itemName,
          quantity, 
          unit 
        }
      });
      
      if (error) {
        console.error('Error calling generate-price function:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.price) {
        throw new Error('Failed to generate price suggestion');
      }
      
      // Return the price in USD
      return data.price;
    } catch (error) {
      console.error('Error generating price suggestion:', error);
      // Fallback to the mock pricing logic
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
      }[itemName.toLowerCase()] || Math.floor(Math.random() * 10) + 1;
      
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
      return Math.round(price * 100) / 100; // Round to 2 decimal places
    }
  };
  
  // Function to download list as PDF with enhanced Bangla support
  const downloadListAsPdf = async (listId: string) => {
    const list = getListById(listId);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Import jspdf dynamically
      const { default: jsPDF } = await import('jspdf');
      
      // Try to use the Noto Sans Bengali font which has better Bangla support
      try {
        const pdfWindow = window.open(`/print-preview/${listId}`, '_blank');
        if (pdfWindow) {
          toast({
            title: "PDF Preview",
            description: "Opening PDF for printing. Please use your browser's print function for better Bangla support."
          });
          // Close loading state after reasonable time for window to open
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
          return;
        }
      } catch (windowError) {
        console.error("Error opening print window:", windowError);
        // Continue with fallback PDF generation
      }
      
      // Fallback method with improved Bangla handling
      try {
        // Create a new PDF document
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          putOnlyUsedFonts: true
        });
        
        // Use simpler approach that better preserves characters
        doc.setFontSize(18);
        doc.text(`${list.title}`, 20, 20);
        
        // Add subtitle with simpler text handling
        doc.setFontSize(12);
        doc.text(`${list.month} ${list.year}`, 20, 30);
        
        // Import and use autoTable which has better text handling
        const { default: autoTable } = await import('jspdf-autotable');
        
        // Create simplified table structure
        autoTable(doc, {
          startY: 50,
          head: [['Item', 'Quantity', 'Unit', 'Est. Price (৳)']],
          body: list.items.map(item => [
            item.name,
            item.quantity.toString(),
            item.unit,
            (item.estimatedPrice || 0).toFixed(2)
          ]),
          foot: [
            ['', '', 'Total:', `৳${list.totalEstimatedPrice.toFixed(2)}`]
          ],
          headStyles: { 
            fillColor: [255, 140, 0],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          footStyles: { 
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          theme: 'grid',
          styles: {
            font: 'courier', // Using courier for better compatibility
            fontSize: 10,
            cellPadding: 3,
          },
          didDrawPage: function(data) {
            // Add footer
            doc.setFontSize(10);
            doc.text("Generated by BazarBuddy", data.settings.margin.left, 
              doc.internal.pageSize.height - 10);
          }
        });
        
        // Save the PDF with error handling
        doc.save(`${list.title}_${list.month}_${list.year}.pdf`);
        
        toast({
          title: "PDF Downloaded",
          description: "Your grocery list has been saved as a PDF. Check your downloads folder."
        });
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        throw new Error("Failed to generate PDF with direct method");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Opening preview mode instead.",
        variant: "destructive"
      });
      
      // Always fall back to preview mode if direct PDF fails
      // setShowPDFPreview(true);
    } finally {
      setIsLoading(false);
    }
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
    downloadListAsPdf,
    isLoading
  };

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>;
};
