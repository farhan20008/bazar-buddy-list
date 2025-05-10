import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGrocery } from "@/contexts/GroceryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { convertUsdToBdt, formatCurrency } from "@/utils/currency";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { AreaChart } from "@/components/AreaChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Clock, DollarSign, Loader2, Plus, ShoppingCart } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getText } from "@/utils/translations";
import { useIsMobile } from "@/hooks/use-mobile";
const Dashboard = () => {
  const {
    lists,
    isLoading
  } = useGrocery();
  const {
    user
  } = useAuth();
  const {
    language
  } = useLanguage();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<any[]>([]);

  // Get user's name from metadata or use email as fallback
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  useEffect(() => {
    // Generate chart data based on last 6 months of grocery lists
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const last6Months = Array.from({
      length: 6
    }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return {
        month: months[monthIndex],
        year: currentMonth - i < 0 ? currentYear - 1 : currentYear
      };
    }).reverse();
    const newChartData = last6Months.map(({
      month,
      year
    }) => {
      // Find lists for this month/year
      const matchingLists = lists.filter(list => list.month === month && list.year === year);

      // Calculate total spent for month in BDT
      const totalSpent = matchingLists.reduce((total, list) => total + convertUsdToBdt(list.totalEstimatedPrice), 0);

      // Generate some random secondary value for visualization
      const secondaryValue = totalSpent > 0 ? totalSpent * (0.8 + Math.random() * 0.4) : Math.floor(Math.random() * 100 * 110.5) + 5525; // Converted to BDT

      return {
        name: month.substring(0, 3),
        value: Math.round(totalSpent * 100) / 100,
        secondaryValue: Math.round(secondaryValue * 100) / 100
      };
    });
    setChartData(newChartData);
  }, [lists]);

  // Calculate metrics in BDT
  const totalLists = lists.length;
  const totalItems = lists.reduce((count, list) => count + list.items.length, 0);
  const totalSpentUsd = lists.reduce((total, list) => total + list.totalEstimatedPrice, 0);
  const totalSpentBdt = convertUsdToBdt(totalSpentUsd);
  const avgSpentPerListUsd = totalLists > 0 ? totalSpentUsd / totalLists : 0;
  const avgSpentPerListBdt = convertUsdToBdt(avgSpentPerListUsd);
  const isMobile = useIsMobile();
  if (isLoading) {
    return <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-left">
              {getText("dashboardTitle", language)}
            </h1>
            <p className="text-muted-foreground">
              {getText("welcome", language)} {userName}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
            <LanguageSwitcher />
            <Button onClick={() => navigate("/create-list")} className="text-gray-50 bg-orange-600 hover:bg-orange-500">
              <Plus className="mr-2 h-4 w-4" /> {getText("newList", language)}
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-4">
          <MetricCard title={getText("totalLists", language)} value={totalLists} icon={<ShoppingCart size={18} />} subtext={getText("allTimeGroceryLists", language)} />
          <MetricCard title={getText("totalItems", language)} value={totalItems} icon={<BarChart size={18} />} subtext={getText("itemsAcrossAllLists", language)} />
          <MetricCard title={getText("totalSpent", language)} value={formatCurrency(totalSpentBdt, 'BDT')} icon={<DollarSign size={18} />} subtext={getText("estimatedTotalExpenses", language)} trend="up" trendText="Based on AI price estimates" />
          <MetricCard title={getText("avgListCost", language)} value={formatCurrency(avgSpentPerListBdt, 'BDT')} icon={<Clock size={18} />} subtext={getText("averagePerGroceryList", language)} />
        </div>

        <div className="grid gap-2 sm:gap-4 md:grid-cols-7 mt-2 sm:mt-4">
          <Card className="card-gradient md:col-span-4">
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle>{getText("spendingHistory", language)}</CardTitle>
              <CardDescription>
                {getText("expensesOverTime", language)} (৳ BDT)
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-1 py-1" : ""}>
              <AreaChart data={chartData} height={isMobile ? 200 : 250} />
            </CardContent>
          </Card>
          
          <Card className="card-gradient md:col-span-3">
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className="text-left">{getText("recentLists", language)}</CardTitle>
              <CardDescription className="text-left">
                {getText("recentlyCreatedLists", language)}
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-3 py-2" : ""}>
              {lists.length === 0 ? <div className="flex flex-col items-center justify-center py-4 sm:py-8 text-center">
                  <ShoppingCart className="h-8 sm:h-12 w-8 sm:w-12 text-muted-foreground/50 mb-2 sm:mb-4" />
                  <p className="text-muted-foreground mb-2 sm:mb-4">
                    {getText("noListsYet", language)}
                  </p>
                  <Button onClick={() => navigate("/create-list")} className="text-gray-50 bg-orange-600 hover:bg-orange-500" size={isMobile ? "sm" : "default"}>
                    <Plus className="mr-2 h-4 w-4" /> {getText("createFirstList", language)}
                  </Button>
                </div> : <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={isMobile ? "py-2 px-2" : ""}>
                          {getText("listName", language)}
                        </TableHead>
                        <TableHead className={`text-right ${isMobile ? "py-2 px-2" : ""}`}>
                          {getText("items", language)}
                        </TableHead>
                        <TableHead className={`text-right ${isMobile ? "py-2 px-2" : ""}`}>
                          {getText("estCost", language)}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lists.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(list => <TableRow key={list.id} className="cursor-pointer" onClick={() => navigate(`/edit-list/${list.id}`)}>
                            <TableCell className={`font-medium ${isMobile ? "py-2 px-2" : ""}`}>
                              {list.title}
                            </TableCell>
                            <TableCell className={`text-right ${isMobile ? "py-2 px-2" : ""}`}>
                              {list.items.length}
                            </TableCell>
                            <TableCell className={`text-right ${isMobile ? "py-2 px-2" : ""}`}>
                              {formatCurrency(convertUsdToBdt(list.totalEstimatedPrice), 'BDT')}
                            </TableCell>
                          </TableRow>)}
                    </TableBody>
                  </Table>
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>;
};
export default Dashboard;