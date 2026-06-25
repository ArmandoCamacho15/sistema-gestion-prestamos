'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

interface ReportFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function ReportFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ReportFiltersProps) {
  
  const setPreset = (preset: 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear') => {
    const today = new Date();
    switch (preset) {
      case 'thisMonth':
        onStartDateChange(format(startOfMonth(today), 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'lastMonth':
        const lastMonthDate = subMonths(today, 1);
        onStartDateChange(format(startOfMonth(lastMonthDate), 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(lastMonthDate), 'yyyy-MM-dd'));
        break;
      case 'last3Months':
        const last3Date = subMonths(today, 3);
        onStartDateChange(format(startOfMonth(last3Date), 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'thisYear':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        onStartDateChange(format(startOfYear, 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between bg-card p-4 rounded-xl border shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <Label htmlFor="startDate">Desde</Label>
          <Input 
            id="startDate" 
            type="date" 
            value={startDate} 
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-[160px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Hasta</Label>
          <Input 
            id="endDate" 
            type="date" 
            value={endDate} 
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div className="flex gap-2 flex-wrap mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => setPreset('thisMonth')}>
            Este mes
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreset('lastMonth')}>
            Mes pasado
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreset('last3Months')}>
            Últimos 3 meses
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreset('thisYear')}>
            Este Año
          </Button>
        </div>
      </div>
    </div>
  );
}
