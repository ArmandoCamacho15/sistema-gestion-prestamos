"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ProjectedCashflow } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/formatters";

interface ProjectedRevenueChartProps {
  data: ProjectedCashflow[];
}

export function ProjectedRevenueChart({ data }: ProjectedRevenueChartProps) {
  const chartData = data.map((item) => {
    const date = new Date(item.month);
    // Add timezone offset to fix off-by-one errors in months due to GMT
    const correctedDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));
    const monthStr = new Intl.DateTimeFormat("es-ES", {
      month: "short",
      year: "numeric",
    }).format(correctedDate);
    
    return {
      monthStr,
      Capital: Number(item.projected_capital),
      Intereses: Number(item.projected_interest),
      Total: Number(item.projected_total),
    };
  });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyección de Recaudo Futuro</CardTitle>
          <CardDescription>Capital recuperado vs Interés ganado</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No hay proyección futura (No hay préstamos activos con cuotas pendientes)
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Proyección de Recaudo Futuro</CardTitle>
            <CardDescription>
              Capital recuperado vs Interés ganado (Ganancia)
            </CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-primary">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-primary">¿De dónde sale esta gráfica?</h4>
                <p className="text-muted-foreground">
                  Suma todas las cuotas de los próximos 6 meses basándose en sus <b>fechas de vencimiento</b> reales.
                </p>
                <p className="text-muted-foreground">
                  Separa visualmente la parte de la cuota que es <b>Capital</b> (dinero que te devuelven) y la parte que es <b>Interés</b> (tu ganancia real).
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="monthStr"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]}
                labelClassName="text-foreground capitalize font-bold"
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Capital" stackId="a" fill="hsl(var(--chart-1, 217 91% 60%))" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Intereses" stackId="a" fill="hsl(var(--chart-2, 160 84% 39%))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
