"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { DashboardSummary } from "@/hooks/useDashboard";

interface LoansByStatusChartProps {
  summary: DashboardSummary;
}

const COLORS = {
  activo: "hsl(var(--chart-1, 217 91% 60%))",
  moroso: "hsl(var(--chart-5, 0 84% 60%))",
  pagado: "hsl(var(--chart-2, 160 84% 39%))",
};

export function LoansByStatusChart({ summary }: LoansByStatusChartProps) {
  const data = [
    { name: "Activos", value: Number(summary.active_loans), color: COLORS.activo },
    { name: "Morosos", value: Number(summary.late_loans), color: COLORS.moroso },
    { name: "Pagados", value: Number(summary.paid_loans), color: COLORS.pagado },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Préstamos por Estado</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No hay préstamos registrados
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Préstamos por Estado</CardTitle>
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
                  Cuenta la <b>cantidad total de préstamos</b> que tienes en el sistema y los agrupa según su estado actual.
                </p>
                <p className="text-muted-foreground">
                  Un préstamo es "Activo" si tiene cuotas pendientes y ninguna está vencida. Pasa a "Moroso" automáticamente si una cuota se retrasa más allá de tus días de gracia configurados.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${value} préstamos`, "Cantidad"]}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
