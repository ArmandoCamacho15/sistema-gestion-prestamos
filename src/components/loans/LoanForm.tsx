'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema, LoanValues } from '@/lib/validations/loanSchema';
import { formatLocalYYYYMMDD } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calculator } from 'lucide-react';
import { LoanSimulator } from './LoanSimulator';
import { useClients } from '@/hooks/useClients';

interface LoanFormProps {
  onSubmit: (values: LoanValues) => void;
  isLoading: boolean;
}

export function LoanForm({ onSubmit, isLoading }: LoanFormProps) {
  const { data: clients, isLoading: loadingClients } = useClients();

  const form = useForm<LoanValues>({
    resolver: zodResolver(loanSchema) as any,
    defaultValues: {
      clientId: '',
      amount: 0,
      termMonths: 1,
      interestRate: 0,
      rateType: 'flat',
      paymentFrequency: 'mensual',
      startDate: formatLocalYYYYMMDD(new Date()),
      firstPaymentDate: '',
    },
  });

  const watchAll = form.watch();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Formulario */}
      <div className="lg:col-span-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Datos del Préstamo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingClients ? (
                            <div className="flex p-2 items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.full_name} ({client.identification})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 1000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasa Mensual (%) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ej: 10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="termMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plazo (Meses) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Tasa <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="flat">Tasa Flat</SelectItem>
                            <SelectItem value="simple">Tasa Simple (Francés)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia de Pago <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mensual">Mensual</SelectItem>
                          <SelectItem value="quincenal">Quincenal (Cada 15 días)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Desembolso <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstPaymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Pago <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Préstamo
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      {/* Simulador */}
      <div className="lg:col-span-7">
        <LoanSimulator 
          amount={Number(watchAll.amount) || 0}
          interestRate={Number(watchAll.interestRate) || 0}
          termMonths={Number(watchAll.termMonths) || 1}
          rateType={watchAll.rateType}
          paymentFrequency={watchAll.paymentFrequency}
          firstPaymentDate={watchAll.firstPaymentDate}
        />
      </div>
    </div>
  );
}
