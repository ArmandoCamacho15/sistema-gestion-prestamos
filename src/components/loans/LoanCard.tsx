'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { LoanStatusBadge } from './LoanStatusBadge';

interface LoanCardProps {
  id: string;
  amount: number;
  total_amount: number;
  total_interest: number;
  interest_rate: number;
  rate_type: string;
  status: 'activo' | 'pagado' | 'cancelado';
  created_at: string;
  clients?: {
    full_name: string;
  };
}

export function LoanCard({
  id,
  amount,
  total_amount,
  total_interest,
  interest_rate,
  rate_type,
  status,
  created_at,
  clients,
}: LoanCardProps) {
  return (
    <Link href={`/loans/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{clients?.full_name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">ID: {id.slice(0, 8)}</p>
            </div>
            <LoanStatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Capital</p>
              <p className="font-bold">{formatCurrency(amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interés</p>
              <p className="font-bold text-primary">{interest_rate}% ({rate_type})</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Total a Pagar</span>
              <span className="font-bold text-primary">{formatCurrency(total_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(created_at)}
              </div>
              <span>+{formatCurrency(total_interest)} interés</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-2 group">
            Ver detalles
            <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
