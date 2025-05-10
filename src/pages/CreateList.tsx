import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGrocery, GroceryItem } from "@/contexts/GroceryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/utils/currency";
import { getText } from "@/utils/translations";
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

// Bengali month names
const MONTHS_BN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const CreateList = () => {
  const navigate = useNavigate();
  const {
    language,
    isEnglish
  } = useLanguage();
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
        title: isEnglish ? "Missing Information" : "তথ্য অনুপস্থিত",
        description: isEnglish ? "Please provide a title for your grocery list." : "অনুগ্রহ করে আপনার মুদি তালিকার জন্য একটি শিরোনাম দিন।",
        variant: "destructive"
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: isEnglish ? "Empty List" : "খালি তালিকা",
        description: isEnglish ? "Please add at least one item to your grocery list." : "অনুগ্রহ করে আপনার মুদি তালিকায় অন্তত একটি আইটেম যোগ করুন।",
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

  // Use the appropriate month names based on language
  const displayMonths = isEnglish ? MONTHS : MONTHS_BN;

  // Calculate the total price in BDT
  const totalPriceBdt = items.reduce((total, item) => total + (item.estimatedPrice || 0), 0);
  return <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getText("createNewList", language)}</h1>
          <p className="text-muted-foreground text-left">
            {getText("addItems", language)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* List Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{getText("listInformation", language)}</CardTitle>
            <CardDescription>
              {getText("listDetails", language)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">{getText("listTitle", language)}</Label>
              <Input id="title" placeholder={isEnglish ? "April Groceries" : "এপ্রিল মুদি"} value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="month">{getText("month", language)}</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder={isEnglish ? "Select month" : "মাস নির্বাচন করুন"} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {MONTHS.map((month, index) => <SelectItem key={month} value={month}>
                        {isEnglish ? month : MONTHS_BN[index]}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">{getText("year", language)}</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder={isEnglish ? "Select year" : "বছর নির্বাচন করুন"} />
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
                  {getText("saving", language)}
                </> : <>
                  <Save className="mr-2 h-4 w-4" />
                  {getText("saveList", language)}
                </>}
            </Button>
          </CardContent>
        </Card>

        {/* Add Item Form */}
        <Card>
          <CardHeader>
            <CardTitle>{getText("addItem", language)}</CardTitle>
            <CardDescription>
              {getText("addNewItem", language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GroceryItemForm listId={tempListId} onSubmit={newItem => newItem && addItemToList(newItem)} isCreatePage={true} />
          </CardContent>
        </Card>
      </div>

      {/* List Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-left">{getText("itemsInList", language)}</CardTitle>
          <CardDescription className="text-left">
            {isEnglish ? `${items.length} items • Estimated total: ${formatCurrency(totalPriceBdt, 'BDT')}` : `${items.length} আইটেম • অনুমানিত মোট: ${formatCurrency(totalPriceBdt, 'BDT')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroceryItemTable listId={tempListId} items={items} onDelete={removeItemFromList} isCreatePage={true} />
        </CardContent>
      </Card>
    </DashboardLayout>;
};
export default CreateList;