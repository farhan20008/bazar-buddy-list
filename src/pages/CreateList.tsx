
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGrocery, GroceryItem } from "@/contexts/GroceryContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GroceryItemForm } from "@/components/GroceryItemForm";
import { GroceryItemTable } from "@/components/GroceryItemTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({
  length: 5
}, (_, i) => CURRENT_YEAR + i);

const CreateList = () => {
  const navigate = useNavigate();
  const {
    createList,
    isLoading
  } = useGrocery();
  const currentMonth = new Date().getMonth(); // 0-indexed

  const [title, setTitle] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonth]);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
  const [items, setItems] = useState<GroceryItem[]>([]);
  
  const handleCreateList = async () => {
    if (!title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for your grocery list.",
        variant: "destructive"
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Empty List",
        description: "Please add at least one item to your grocery list.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const listId = await createList({
        title,
        month: selectedMonth,
        year: parseInt(selectedYear),
        items
      });
      
      navigate(`/edit-list/${listId}`);
    } catch (error) {
      console.error("Error creating list:", error);
      // Error is already handled in the context
    }
  };
  
  const addItemToList = (item: GroceryItem) => {
    setItems([...items, item]);
  };
  
  const removeItemFromList = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const tempListId = "temp-new-list";
  
  return <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New List</h1>
          <p className="text-muted-foreground">
            Add items to your grocery list
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* List Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>List Information</CardTitle>
            <CardDescription>
              Provide basic information about your grocery list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">List Title</Label>
              <Input id="title" placeholder="April Groceries" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {MONTHS.map(month => <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {YEARS.map(year => <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateList} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-500 text-gray-50">
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </> : <>
                  <Save className="mr-2 h-4 w-4" />
                  Save List
                </>}
            </Button>
          </CardContent>
        </Card>

        {/* Add Item Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Item</CardTitle>
            <CardDescription>
              Add a new item to your grocery list with AI price estimation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GroceryItemForm 
              listId={tempListId} 
              onSubmit={newItem => newItem && addItemToList(newItem)} 
              isCreatePage={true} 
            />
          </CardContent>
        </Card>
      </div>

      {/* List Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items in Your List</CardTitle>
          <CardDescription>
            {items.length} items • Estimated total: $
            {items.reduce((total, item) => total + (item.estimatedPrice || 0), 0).toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroceryItemTable listId={tempListId} items={items} onDelete={removeItemFromList} isCreatePage={true} />
        </CardContent>
      </Card>
    </DashboardLayout>;
};

export default CreateList;
