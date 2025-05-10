import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
  icon?: React.ReactNode;
  className?: string;
}
export function MetricCard({
  title,
  value,
  subtext,
  trend,
  trendText,
  icon,
  className
}: MetricCardProps) {
  return <Card className={cn("card-gradient", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="py-[5px]">
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
      {(trend || trendText) && <CardFooter>
          <div className="flex items-center text-sm">
            {trend && <div className={cn("mr-1 flex items-center", trend === "up" && "text-green-500", trend === "down" && "text-red-500")}>
                {trend === "up" ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
              </div>}
            <span className="text-xs text-muted-foreground">{trendText}</span>
          </div>
        </CardFooter>}
    </Card>;
}