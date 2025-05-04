
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGrocery } from "@/contexts/GroceryContext";
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
import { Calendar, Search, ShoppingCart } from "lucide-react";

const ListHistory = () => {
  const { lists } = useGrocery();
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

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List History</h1>
          <p className="text-muted-foreground">
            View and manage your past grocery lists
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search lists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-[250px]"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Grocery Lists</CardTitle>
          <CardDescription>
            {filteredLists.length} lists in total • Click on a list to view or edit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">
                    No lists match your search.
                  </p>
                  <Button variant="link" onClick={() => setSearchTerm("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't created any grocery lists yet.
                  </p>
                  <Button onClick={() => navigate("/create-list")}>
                    Create Your First List
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>List Name</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                    <TableHead className="text-right">Created On</TableHead>
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
                        <TableCell>{list.items.length} items</TableCell>
                        <TableCell className="text-right">
                          ${list.totalEstimatedPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {createdDate.toLocaleDateString()}
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
