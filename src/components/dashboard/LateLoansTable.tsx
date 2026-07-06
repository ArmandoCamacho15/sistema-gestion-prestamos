import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { LateInstallment } from "@/hooks/useDashboard";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface LateLoansTableProps {
  installments: LateInstallment[];
}

export function LateLoansTable({ installments }: LateLoansTableProps) {
  // Solo mostrar las 5 más atrasadas para no saturar
  const topLate = installments.slice(0, 5);

  return (
    <Card className="col-span-1 shadow-sm border-red-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-500">Cartera Morosa</CardTitle>
        </div>
        <CardDescription>
          Cuotas vencidas con mayor tiempo de atraso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topLate.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Excelente, no tienes cuotas en mora.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-center">Días Mora</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLate.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium">
                      <Link href={`/loans/${inst.loan_id}`} className="hover:underline text-primary">
                        {inst.client_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inst.due_date)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
                        {inst.days_overdue} días
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(inst.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
