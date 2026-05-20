"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyCashflow } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/formatters";
interface CashFlowChartProps {
  data: MonthlyCashflow[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const chartData = data.map((item) => {
    // Convert 'YYYY-MM-DD...' to a date object safely
    const date = new Date(item.month);
    const monthStr = new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(date);
    return {
      monthStr,
      value: Number(item.total_received),
    };
  });

  if (chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Flujo de Caja Mensual</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No hay datos de recaudo para mostrar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Flujo de Caja Mensual (Últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="monthStr"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
              textAnchor="middle"
              className="capitalize"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), "Recaudo"]}
              labelClassName="text-foreground capitalize font-bold"
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
