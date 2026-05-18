'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface InstallmentRowProps {
  installment: {
    id: string;
    installment_number: number;
    due_date: string;
    total_amount: number;
    capital_amount: number;
    interest_amount: number;
    status: 'pending' | 'paid' | 'late';
    paid_date?: string;
  };
  onPayClick?: () => void;
  showActions?: boolean;
}

export function InstallmentRow({
  installment,
  onPayClick,
  showActions = true,
}: InstallmentRowProps) {
  const getStatusBadge = () => {
    if (installment.status === 'paid') {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Pagada {installment.paid_date && `· ${formatDate(installment.paid_date)}`}
        </Badge>
      );
    }

    if (installment.status === 'late') {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Atrasada
        </Badge>
      );
    }

    return <Badge variant="outline">Pendiente</Badge>;
  };

  return (
    <TableRow className={installment.status === 'paid' ? 'opacity-60' : ''}>
      <TableCell className="text-center font-medium w-12">
        {installment.installment_number}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {formatDate(installment.due_date)}
        </div>
      </TableCell>
      <TableCell className="text-right font-bold">
        {formatCurrency(installment.total_amount)}
      </TableCell>
      <TableCell className="text-right hidden md:table-cell text-muted-foreground">
        {formatCurrency(installment.capital_amount)}
      </TableCell>
      <TableCell className="text-right hidden md:table-cell text-muted-foreground">
        {formatCurrency(installment.interest_amount)}
      </TableCell>
      <TableCell>{getStatusBadge()}</TableCell>
      <TableCell className="text-right">
        {showActions && installment.status !== 'paid' && (
          <Button size="sm" onClick={onPayClick}>
            Cobrar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
