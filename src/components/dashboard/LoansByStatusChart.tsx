"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Préstamos por Estado</CardTitle>
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
