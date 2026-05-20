"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UpcomingInstallment } from "@/hooks/useDashboard";
import { formatCurrency, formatDate } from "@/lib/formatters";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RecentActivityTableProps {
  installments: UpcomingInstallment[];
}

export function RecentActivityTable({ installments }: RecentActivityTableProps) {
  if (installments.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Próximos Vencimientos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-muted-foreground py-8">
          No hay cuotas próximas a vencer (7 días).
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Próximos Vencimientos (7 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha Vto.</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-medium">
                    <div className="truncate max-w-[150px] md:max-w-xs">
                      {inst.client_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cuota {inst.installment_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={inst.status === "pending" ? "outline" : "destructive"}>
                      {formatDate(inst.due_date)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(Number(inst.total_amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/loans/${inst.loan_id}`}>
                        <ArrowRight className="h-4 w-4" />
                        <span className="sr-only">Ir al préstamo</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
