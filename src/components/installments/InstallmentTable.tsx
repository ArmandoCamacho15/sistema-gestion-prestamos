'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InstallmentRow } from './InstallmentRow';

interface Installment {
  id: string;
  installment_number: number;
  due_date: string;
  total_amount: number;
  capital_amount: number;
  interest_amount: number;
  status: 'pending' | 'paid' | 'late';
  paid_date?: string;
}

interface InstallmentTableProps {
  installments: Installment[];
  onPayClick?: (installment: Installment) => void;
  showActions?: boolean;
}

export function InstallmentTable({
  installments,
  onPayClick,
  showActions = true,
}: InstallmentTableProps) {
  if (!installments || installments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay cuotas para mostrar
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Fecha Vencimiento</TableHead>
            <TableHead className="text-right">Cuota</TableHead>
            <TableHead className="text-right hidden md:table-cell">Capital</TableHead>
            <TableHead className="text-right hidden md:table-cell">Interés</TableHead>
            <TableHead>Estado</TableHead>
            {showActions && <TableHead className="text-right">Acción</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((inst) => (
            <InstallmentRow
              key={inst.id}
              installment={inst}
              onPayClick={() => onPayClick?.(inst)}
              showActions={showActions}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
