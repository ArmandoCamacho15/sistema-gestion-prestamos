import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { ArrowDownToLine, ArrowUpFromLine, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CapitalMovementsCardProps {
  inyeccionesMes: number;
  retirosMes: number;
}

export function CapitalMovementsCard({
  inyeccionesMes,
  retirosMes,
}: CapitalMovementsCardProps) {
  return (
    <Card className="border-primary/20 bg-card hover:shadow-md transition-all shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Movimientos (Mes)</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Inyecciones y Retiros</h4>
              <p className="text-sm text-muted-foreground">
                Muestra el dinero que ha entrado o salido del fondo de capital durante el mes actual.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <ArrowDownToLine className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium">Inyecciones</span>
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-500 truncate" title={formatCurrency(inyeccionesMes)}>
            {formatCurrency(inyeccionesMes)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <ArrowUpFromLine className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-medium">Retiros</span>
          </div>
          <div className="text-lg font-bold text-red-600 dark:text-red-500 truncate" title={formatCurrency(retirosMes)}>
            {formatCurrency(retirosMes)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
