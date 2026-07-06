'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoansDistributionChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = {
  Activos: 'hsl(var(--primary))',
  Pagados: '#10b981', // green-500
  Morosos: '#ef4444', // red-500
};

export function LoansDistributionChart({ data }: LoansDistributionChartProps) {
  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle>Estado de la Cartera</CardTitle>
        <CardDescription>
          Distribución de préstamos originados en el periodo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            No hay préstamos en este periodo
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} préstamos`, 'Cantidad']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
