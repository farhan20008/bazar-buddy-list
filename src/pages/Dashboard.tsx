
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGrocery } from "@/contexts/GroceryContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { AreaChart } from "@/components/AreaChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Clock,
  DollarSign,
  Plus,
  ShoppingCart,
} from "lucide-react";

const Dashboard = () => {
  const { lists } = useGrocery();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate chart data based on last 6 months of grocery lists
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return {
        month: months[monthIndex],
        year: currentMonth - i < 0 ? currentYear - 1 : currentYear,
      };
    }).reverse();
    
    const chartData = last6Months.map(({ month, year }) => {
      // Find lists for this month/year
      const matchingLists = lists.filter(
        (list) => list.month === month && list.year === year
      );
      
      // Calculate total spent for month
      const totalSpent = matchingLists.reduce(
        (total, list) => total + list.totalEstimatedPrice,
        0
      );
      
      // Generate some random secondary value for visualization
      const secondaryValue = totalSpent > 0
        ? totalSpent * (0.8 + Math.random() * 0.4)
        : Math.floor(Math.random() * 100) + 50;
      
      return {
        name: month.substring(0, 3),
        value: Math.round(totalSpent * 100) / 100,
        secondaryValue: Math.round(secondaryValue * 100) / 100,
      };
    });
    
    setChartData(chartData);
  }, [lists]);

  // Get most recent list
  const latestList = lists.length > 0
    ? [...lists].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : null;

  // Calculate metrics
  const totalLists = lists.length;
  const totalItems = lists.reduce((count, list) => count + list.items.length, 0);
  const totalSpent = lists.reduce(
    (total, list) => total + list.totalEstimatedPrice,
    0
  );
  const avgSpentPerList = totalLists > 0 ? totalSpent / totalLists : 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}
          </p>
        </div>
        <Button onClick={() => navigate("/create-list")}>
          <Plus className="mr-2 h-4 w-4" /> New List
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Lists"
          value={totalLists}
          icon={<ShoppingCart size={18} />}
          subtext="All-time grocery lists"
        />
        <MetricCard
          title="Total Items"
          value={totalItems}
          icon={<BarChart size={18} />}
          subtext="Items across all lists"
        />
        <MetricCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          icon={<DollarSign size={18} />}
          subtext="Estimated total expenses"
          trend="up"
          trendText="Based on AI price estimates"
        />
        <MetricCard
          title="Avg. List Cost"
          value={`$${avgSpentPerList.toFixed(2)}`}
          icon={<Clock size={18} />}
          subtext="Average per grocery list"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7 mt-4">
        <Card className="card-gradient md:col-span-4">
          <CardHeader>
            <CardTitle>Spending History</CardTitle>
            <CardDescription>
              Your estimated grocery expenses over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart data={chartData} height={250} />
          </CardContent>
        </Card>
        <Card className="card-gradient md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Lists</CardTitle>
            <CardDescription>
              Your most recently created grocery lists
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't created any grocery lists yet.
                </p>
                <Button onClick={() => navigate("/create-list")}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First List
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>List Name</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Est. Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lists
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .slice(0, 5)
                      .map((list) => (
                        <TableRow
                          key={list.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/edit-list/${list.id}`)}
                        >
                          <TableCell className="font-medium">
                            {list.title}
                          </TableCell>
                          <TableCell className="text-right">
                            {list.items.length}
                          </TableCell>
                          <TableCell className="text-right">
                            ${list.totalEstimatedPrice.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
