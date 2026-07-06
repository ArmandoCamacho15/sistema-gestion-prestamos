'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface LoanStatusBadgeProps {
  status: 'activo' | 'pagado' | 'cancelado';
  className?: string;
}

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const variants: Record<string, { variant: any; icon: any; label: string }> = {
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
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
