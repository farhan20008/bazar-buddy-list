
import { useState, useEffect } from 'react';
import {
  Area,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

interface AreaChartProps {
  data: {
    name: string;
    value: number;
    secondaryValue?: number;
  }[];
  height?: number;
  showXAxis?: boolean;
  showTooltip?: boolean;
}

export function AreaChart({
  data,
  height = 200,
  showXAxis = true,
  showTooltip = true,
}: AreaChartProps) {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  return (
    <div className="mt-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaGradientSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          {showXAxis && (
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              tickMargin={8}
            />
          )}
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-background p-2 shadow-md">
                      <div className="text-xs text-muted-foreground">{payload[0].payload.name}</div>
                      <div className="font-semibold text-foreground">
                        {payload[0].value}
                      </div>
                      {payload[1] && (
                        <div className="font-semibold text-green-500">
                          {payload[1].value}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#areaGradient)"
            className="area-chart"
          />
          {chartData[0] && chartData[0].secondaryValue !== undefined && (
            <Area
              type="monotone"
              dataKey="secondaryValue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#areaGradientSecondary)"
              className="area-chart-secondary"
            />
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
