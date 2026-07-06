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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { MonthlyCashflow } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/formatters";
interface CashFlowChartProps {
  data: MonthlyCashflow[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const chartData = data.map((item) => {
    // The DB returns dates like "2026-06-01T00:00:00+00:00".
    // If we parse this in a local timezone (like UTC-5), it becomes May 31, 2026.
    // To fix this, we force the formatter to use UTC timezone.
    const date = new Date(item.month);
    const monthStr = new Intl.DateTimeFormat("es-ES", { 
      month: "short", 
      year: "numeric",
      timeZone: "UTC" 
    }).format(date);
    
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
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Flujo de Caja Mensual (Últimos 6 meses)</CardTitle>
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
                  Es la suma real de todo el dinero que ha entrado a tu negocio en los últimos 6 meses.
                </p>
                <p className="text-muted-foreground">
                  Se alimenta automáticamente cada vez que haces clic en <b>"Registrar Pago"</b> en la pantalla de un préstamo. Suma tanto el pago de cuotas a tiempo como los pagos con mora.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
