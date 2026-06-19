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
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { TopClient } from "@/hooks/useDashboard";
import { Users } from "lucide-react";

interface TopClientsTableProps {
  clients: TopClient[];
}

export function TopClientsTable({ clients }: TopClientsTableProps) {
  return (
    <Card className="col-span-1 shadow-sm border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Top Clientes (Mayor Deuda)</CardTitle>
        </div>
        <CardDescription>
          Los 5 clientes con mayor saldo pendiente de pago.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay clientes con deuda activa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Préstamos</TableHead>
                  <TableHead className="text-right">Saldo Pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.client_id}>
                    <TableCell className="font-medium">
                      {client.full_name}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{client.active_loans_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-orange-500">
                      {formatCurrency(client.total_pending_debt)}
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
