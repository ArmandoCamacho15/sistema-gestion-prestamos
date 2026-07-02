'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

interface CashFlowChartProps {
  data: {
    date: string;
    amount: number;
    retiro?: number;
  }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  // Formatear las fechas para mostrar en el XAxis (ej: "15 May")
  const formattedData = data.map(item => {
    const d = new Date(item.date + 'T00:00:00'); // Evitar problemas de timezone
    return {
      ...item,
      displayDate: d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    };
  });

  return (
    <Card className="col-span-full xl:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle>Flujo de Caja: Ingresos vs Retiros</CardTitle>
        <CardDescription>
          Comparativa de recaudación y retiros de capital diarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            No hay movimientos en este periodo
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis 
                  dataKey="displayDate" 
                  tickLine={false} 
                  axisLine={false} 
                  className="text-xs" 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  className="text-xs" 
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value)), 
                    name === 'amount' ? 'Recaudado' : 'Retirado'
                  ]}
                  labelClassName="text-foreground font-semibold"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Ingresos"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="retiro"
                  name="Retiros"
                  stroke="#ef4444" // red-500
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ef4444' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
