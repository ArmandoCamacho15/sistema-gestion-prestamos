import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Banknote, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface NetProfitCardProps {
  interesesBrutos: number;
  porcentajeGastos: number;
  porcentajeProvision: number;
  gastos: number;
  provision: number;
  gananciaNeta: number;
}

export function NetProfitCard({
  interesesBrutos,
  porcentajeGastos,
  porcentajeProvision,
  gastos,
  provision,
  gananciaNeta,
}: NetProfitCardProps) {
  return (
    <Card className="border-green-400/20 bg-green-500/5 hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ganancia Neta (Mes)</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-green-500/20 text-green-600">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-green-600">Distribución de Intereses</h4>
                <p className="text-sm text-muted-foreground">
                  Desglose contable sugerido para el mes actual basado en tu Configuración.
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between font-medium">
                  <span>Intereses Cobrados (Bruto):</span>
                  <span>{formatCurrency(interesesBrutos)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Fondo Gastos Operativos ({porcentajeGastos}%):</span>
                  <span className="text-red-400">-{formatCurrency(gastos)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground border-b pb-2">
                  <span>Fondo Provisión Mora ({porcentajeProvision}%):</span>
                  <span className="text-orange-400">-{formatCurrency(provision)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-green-500">
                  <span>Utilidad Libre (Neta):</span>
                  <span>{formatCurrency(gananciaNeta)}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                <strong>Tip:</strong> Si sacas dinero del fondo de gastos para pagar costos reales de tu negocio, regístralo arriba en el botón <b>"Gestionar Capital" &gt; "Retiro"</b> para descontarlo del sistema.
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(gananciaNeta)}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Banknote className="h-3 w-3" />
          Haz clic en la [i] para ver el desglose
        </p>
      </CardContent>
    </Card>
  );
}
