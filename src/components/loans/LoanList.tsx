'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoanCard } from './LoanCard';
import { Search, Filter } from 'lucide-react';

interface Loan {
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

interface LoanListProps {
  loans: Loan[];
  isLoading?: boolean;
}

export function LoanList({ loans = [], isLoading }: LoanListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState('recent');

  const filteredAndSortedLoans = useMemo(() => {
    let result = [...loans];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      result = result.filter((loan) =>
        loan.clients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.includes(searchTerm)
      );
    }

    // Aplicar filtro de estado
    if (statusFilter !== 'todos') {
      result = result.filter((loan) => loan.status === statusFilter);
    }

    // Aplicar ordenamiento
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'amount_high') {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount_low') {
      result.sort((a, b) => a.amount - b.amount);
    }

    return result;
  }, [loans, searchTerm, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="amount_high">Monto: Mayor a Menor</SelectItem>
            <SelectItem value="amount_low">Monto: Menor a Mayor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de tarjetas */}
      {filteredAndSortedLoans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'todos'
              ? 'No se encontraron préstamos con los filtros aplicados'
              : 'No hay préstamos registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedLoans.map((loan) => (
            <LoanCard key={loan.id} {...loan} />
          ))}
        </div>
      )}

      {/* Resumen */}
      <div className="text-sm text-muted-foreground pt-2">
        Mostrando {filteredAndSortedLoans.length} de {loans.length} préstamo(s)
      </div>
    </div>
  );
}
