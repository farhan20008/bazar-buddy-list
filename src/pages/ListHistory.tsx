
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGrocery } from "@/contexts/GroceryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Download, Loader2, Search, ShoppingCart } from "lucide-react";
import { getText } from "@/utils/translations";

const ListHistory = () => {
  const { lists, isLoading, downloadListAsPdf } = useGrocery();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and sort lists by creation date (newest first)
  const filteredLists = lists
    .filter(
      (list) =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.month.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
  const handleDownloadPdf = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await downloadListAsPdf(id);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getText("listHistory", language)}
          </h1>
          <p className="text-muted-foreground">
            {getText("viewManageLists", language)}
          </p>
        </div>
        <div className="w-full md:w-auto relative">
          <Input
            placeholder={getText("searchLists", language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-[250px] pl-8"
          />
          <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{getText("yourGroceryLists", language)}</CardTitle>
          <CardDescription>
            {filteredLists.length} {getText("listsTotal", language)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {getText("noListsMatch", language)}
                  </p>
                  <Button variant="link" onClick={() => setSearchTerm("")}>
                    {getText("clearSearch", language)}
                  </Button>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {getText("noListsYet", language)}
                  </p>
                  <Button onClick={() => navigate("/create-list")}>
                    {getText("createFirstList", language)}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getText("listName", language)}</TableHead>
                    <TableHead>{getText("month", language)}</TableHead>
                    <TableHead>{getText("items", language)}</TableHead>
                    <TableHead className="text-right">{getText("estCost", language)}</TableHead>
                    <TableHead className="text-right">{getText("createdOn", language)}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLists.map((list) => {
                    const createdDate = new Date(list.createdAt);
                    return (
                      <TableRow
                        key={list.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/edit-list/${list.id}`)}
                      >
                        <TableCell className="font-medium">{list.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {list.month} {list.year}
                          </div>
                        </TableCell>
                        <TableCell>{list.items.length} {getText("items", language)}</TableCell>
                        <TableCell className="text-right">
                          ${list.totalEstimatedPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {createdDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleDownloadPdf(list.id, e)}
                            className="h-8 px-2"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download PDF</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ListHistory;
