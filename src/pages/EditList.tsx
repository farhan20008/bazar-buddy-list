import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGrocery } from "@/contexts/GroceryContext";
import { formatCurrency } from "@/utils/currency";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GroceryItemForm } from "@/components/GroceryItemForm";
import { GroceryItemTable } from "@/components/GroceryItemTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Download, Loader2, Save, Trash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PDFPreview } from "@/components/PDFPreview";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({
  length: 5
}, (_, i) => CURRENT_YEAR + i);

const EditList = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    getListById,
    updateList,
    deleteList,
    downloadListAsPdf,
    isLoading
  } = useGrocery();
  
  const [title, setTitle] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [localLoading, setLocalLoading] = useState(true);
  const [listExists, setListExists] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  
  useEffect(() => {
    if (id) {
      const list = getListById(id);
      if (list) {
        setTitle(list.title);
        setSelectedMonth(list.month);
        setSelectedYear(list.year.toString());
        setListExists(true);
      } else {
        toast({
          title: "List Not Found",
          description: "The grocery list you're looking for doesn't exist.",
          variant: "destructive"
        });
        navigate("/dashboard");
      }
    }
    setLocalLoading(false);
  }, [id, getListById, navigate]);
  
  const handleUpdateList = async () => {
    if (!id) return;
    if (!title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for your grocery list.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await updateList(id, {
        title,
        month: selectedMonth,
        year: parseInt(selectedYear)
      });
    } catch (error) {
      console.error("Error updating list:", error);
      // Error is already handled in the context
    }
  };
  
  const handleDeleteList = async () => {
    if (id) {
      try {
        await deleteList(id);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error deleting list:", error);
        // Error is already handled in the context
      }
    }
  };
  
  const handleDownloadPdf = async () => {
    if (id) {
      try {
        await downloadListAsPdf(id);
      } catch (error) {
        console.error("Error downloading PDF:", error);
        toast({
          title: "PDF Generation Issue",
          description: "Using preview mode for better Bangla support",
          variant: "destructive"
        });
        // Open preview as fallback for better Bangla support
        setShowPDFPreview(true);
      }
    }
  };
  
  if (localLoading || isLoading) {
    return <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>;
  }
  
  if (!listExists) {
    return null;
  }
  
  const list = getListById(id!);
  const totalPrice = list ? list.totalEstimatedPrice : 0;
  
  return <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {selectedMonth} {selectedYear} • {list?.items.length || 0} items
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPDFPreview(true)}
            className="flex items-center"
          >
            Preview PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPdf} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Print
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete List
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your "{title}" grocery list and all its items.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteList} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreview 
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        listId={id!}
        listName={title}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* List Details */}
        <Card>
          <CardHeader>
            <CardTitle>List Information</CardTitle>
            <CardDescription>
              Update basic information about your grocery list
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
                    {YEARS.map(year => <SelectItem key={year.toString()} value={year.toString()}>
                        {year}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateList} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-500 text-gray-50">
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </> : <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>}
            </Button>
          </CardFooter>
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
            <GroceryItemForm listId={id!} />
          </CardContent>
        </Card>
      </div>

      {/* List Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items in Your List</CardTitle>
          <CardDescription>
            {list?.items.length || 0} items • Estimated total: 
            {list ? formatCurrency(totalPrice, 'BDT') : "৳0.00"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list && <GroceryItemTable listId={id!} items={list.items} />}
        </CardContent>
      </Card>
    </DashboardLayout>;
};

export default EditList;
