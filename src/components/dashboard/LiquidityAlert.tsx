import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/formatters";

interface LiquidityAlertProps {
  capitalDisponible: number;
  capitalInvertido: number;
  minLiquidityPercent: number;
}

export function LiquidityAlert({
  capitalDisponible,
  capitalInvertido,
  minLiquidityPercent,
}: LiquidityAlertProps) {
  const totalCapital = capitalDisponible + capitalInvertido;
  if (totalCapital === 0) return null;

  const currentLiquidityPercent = (capitalDisponible / totalCapital) * 100;

  if (currentLiquidityPercent >= minLiquidityPercent) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 mb-6">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <AlertTitle className="text-red-500 font-semibold">
        Alerta de Liquidez Baja ({currentLiquidityPercent.toFixed(1)}%)
      </AlertTitle>
      <AlertDescription className="text-red-500/90">
        Tu capital disponible ({formatCurrency(capitalDisponible)}) ha caído por debajo del umbral mínimo configurado del {minLiquidityPercent}%. 
        Se recomienda inyectar capital o pausar nuevos préstamos hasta recuperar liquidez.
      </AlertDescription>
    </Alert>
  );
}
