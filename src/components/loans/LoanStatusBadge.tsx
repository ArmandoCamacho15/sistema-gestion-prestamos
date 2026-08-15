'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';

// Permite cualquier string de status que llegue de la DB
interface LoanStatusBadgeProps {
  status: string;
  className?: string;
}

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; label: string }> = {
    activo: {
      variant: 'default',
      icon: Clock,
      label: 'Activo',
    },
    pagado: {
      variant: 'secondary',
      icon: CheckCircle2,
      label: 'Pagado',
    },
    cancelado: {
      variant: 'destructive',
      icon: AlertCircle,
      label: 'Cancelado',
    },
    vencido: {
      variant: 'destructive',
      icon: AlertCircle,
      label: 'Vencido',
    },
    en_mora: {
      variant: 'destructive',
      icon: AlertCircle,
      label: 'En mora',
    },
  };

  // Fallback seguro: si el status no existe en el mapa, mostrar el valor crudo
  const config = variants[status] ?? {
    variant: 'outline' as const,
    icon: HelpCircle,
    label: status ?? 'Desconocido',
  };

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}

