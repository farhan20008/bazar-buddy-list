import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGrocery } from "@/contexts/GroceryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/utils/currency";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Download, Loader2, Search, ShoppingCart, Trash } from "lucide-react";
import { getText } from "@/utils/translations";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
const ITEMS_PER_PAGE = 8;
const ListHistory = () => {
  const {
    lists,
    isLoading,
    downloadListAsPdf,
    deleteList
  } = useGrocery();
  const {
    language,
    isEnglish
  } = useLanguage();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and sort lists by creation date (newest first)
  const filteredLists = lists.filter(list => list.title.toLowerCase().includes(searchTerm.toLowerCase()) || list.month.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination logic
  const totalPages = Math.ceil(filteredLists.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLists = filteredLists.slice(startIndex, endIndex);
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const handleDownloadPdf = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await downloadListAsPdf(id);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };
  const handleDeleteConfirm = async () => {
    if (!listToDelete) return;
    setIsDeleting(true);
    try {
      await deleteList(listToDelete);
      toast({
        title: isEnglish ? "List Deleted" : "তালিকা মুছে ফেলা হয়েছে",
        description: isEnglish ? "The grocery list has been successfully deleted." : "মুদি তালিকাটি সফলভাবে মুছে ফেলা হয়েছে।"
      });
    } catch (error) {
      console.error("Error deleting list:", error);
      toast({
        title: isEnglish ? "Error" : "ত্রুটি",
        description: isEnglish ? "Failed to delete list. Please try again." : "তালিকা মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setListToDelete(null);
    }
  };
  const handleDeleteClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setListToDelete(id);
  };

  // Loading states
  if (isLoading) {
    return <DashboardLayout>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-full md:w-[250px]" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(4).fill(0).map((_, index) => <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">
            {getText("listHistory", language)}
          </h1>
          <p className="text-muted-foreground">
            {getText("viewManageLists", language)}
          </p>
        </div>
        <div className="w-full md:w-auto relative">
          <Input placeholder={getText("searchLists", language)} value={searchTerm} onChange={e => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset to first page on search
        }} className="md:w-[250px] pl-8" />
          <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-left">{getText("yourGroceryLists", language)}</CardTitle>
          <CardDescription>
            {filteredLists.length} {getText("listsTotal", language)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLists.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-center">
              {searchTerm ? <>
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {getText("noListsMatch", language)}
                  </p>
                  <Button variant="link" onClick={() => setSearchTerm("")}>
                    {getText("clearSearch", language)}
                  </Button>
                </> : <>
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {getText("noListsYet", language)}
                  </p>
                  <Button onClick={() => navigate("/create-list")} className="bg-orange-600 hover:bg-orange-500 text-gray-50">
                    {getText("createFirstList", language)}
                  </Button>
                </>}
            </div> : <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getText("listName", language)}</TableHead>
                    <TableHead>{getText("month", language)}</TableHead>
                    <TableHead>{getText("items", language)}</TableHead>
                    <TableHead className="text-right">{getText("estCost", language)}</TableHead>
                    <TableHead className="text-right">{getText("createdOn", language)}</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLists.map(list => {
                const createdDate = new Date(list.createdAt);
                return <TableRow key={list.id} className="cursor-pointer" onClick={() => navigate(`/edit-list/${list.id}`)}>
                        <TableCell className="font-medium">{list.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {list.month} {list.year}
                          </div>
                        </TableCell>
                        <TableCell>{list.items.length} {getText("items", language)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(list.totalEstimatedPrice, 'BDT')}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {createdDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" onClick={e => handleDownloadPdf(list.id, e)} className="h-8 w-8 p-0" title={isEnglish ? "Download PDF" : "পিডিএফ ডাউনলোড করুন"}>
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download PDF</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={e => handleDeleteClick(list.id, e)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" title={isEnglish ? "Delete List" : "তালিকা মুছুন"}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>;
              })}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && <div className="py-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => <PaginationItem key={i}>
                          <PaginationLink isActive={currentPage === i + 1} onClick={() => handlePageChange(i + 1)} className="cursor-pointer">
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>)}
                      
                      <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>}
            </div>}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!listToDelete} onOpenChange={open => !open && setListToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEnglish ? "Delete This List?" : "এই তালিকা মুছবেন?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isEnglish ? "This action cannot be undone. This will permanently delete the grocery list and all its items from your account." : "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। এটি আপনার অ্যাকাউন্ট থেকে মুদি তালিকা এবং এর সমস্ত আইটেম স্থায়ীভাবে মুছে ফেলবে।"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {isEnglish ? "Cancel" : "বাতিল"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="text-gray-50 bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEnglish ? "Deleting..." : "মুছে ফেলা হচ্ছে..."}
                </> : isEnglish ? "Delete" : "মুছুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>;
};
export default ListHistory;