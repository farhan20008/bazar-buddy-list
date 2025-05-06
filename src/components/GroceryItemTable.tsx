
import { useState } from "react";
import { useGrocery, GroceryItem } from "@/contexts/GroceryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { convertUsdToBdt, formatCurrency } from "@/utils/currency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GroceryItemForm } from "./GroceryItemForm";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

interface GroceryItemTableProps {
  listId: string;
  items: GroceryItem[];
  onDelete?: (id: string) => void;
  isCreatePage?: boolean;
}

export function GroceryItemTable({ listId, items, onDelete, isCreatePage = false }: GroceryItemTableProps) {
  const { removeItemFromList } = useGrocery();
  const { language, isEnglish } = useLanguage();
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleEdit = (item: GroceryItem) => {
    setEditItem(item);
  };

  const handleDelete = async (itemId: string) => {
    setItemToDelete(null);
    
    if (isCreatePage && onDelete) {
      onDelete(itemId);
    } else {
      try {
        await removeItemFromList(listId, itemId);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isEnglish ? "Item" : "আইটেম"}</TableHead>
            <TableHead className="text-center">{isEnglish ? "Quantity" : "পরিমাণ"}</TableHead>
            <TableHead className="text-right">{isEnglish ? "Est. Price" : "অনু. মূল্য"}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {isEnglish ? "No items added to this list yet." : "এই তালিকায় এখনও কোন আইটেম যোগ করা হয়নি।"}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-right">
                  {item.estimatedPrice 
                    ? formatCurrency(convertUsdToBdt(item.estimatedPrice), 'BDT') 
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{isEnglish ? "Open menu" : "মেনু খুলুন"}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" /> {isEnglish ? "Edit" : "সম্পাদনা"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setItemToDelete(item.id)}>
                        <Trash className="mr-2 h-4 w-4" /> {isEnglish ? "Delete" : "মুছুন"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Item Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEnglish ? "Edit Item" : "আইটেম সম্পাদনা করুন"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <GroceryItemForm
              listId={listId}
              item={editItem}
              onSubmit={() => setEditItem(null)}
              isCreatePage={isCreatePage}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEnglish ? "Are you sure?" : "আপনি কি নিশ্চিত?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isEnglish 
                ? "This action cannot be undone. This will permanently delete the item from your grocery list."
                : "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। এটি আপনার মুদি তালিকা থেকে আইটেমটি স্থায়ীভাবে মুছে ফেলবে।"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isEnglish ? "Cancel" : "বাতিল"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)}>
              {isEnglish ? "Delete" : "মুছুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
