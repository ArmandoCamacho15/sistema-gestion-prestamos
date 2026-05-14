import { z } from 'zod';

export const loanSchema = z.object({
  clientId: z.string().min(1, { message: 'Debes seleccionar un cliente.' }),
  amount: z.coerce.number().min(1000, { message: 'El monto mínimo es $1,000.' }),
  termMonths: z.coerce.number().min(1, { message: 'El plazo mínimo es 1 mes.' }),
  interestRate: z.coerce.number().min(0.1, { message: 'La tasa mínima es 0.1%.' }),
  rateType: z.enum(['flat', 'simple'] as const),
  paymentFrequency: z.enum(['mensual', 'quincenal'] as const),

  startDate: z.string().min(1, { message: 'Selecciona la fecha de inicio.' }),
  firstPaymentDate: z.string().min(1, { message: 'Selecciona la fecha del primer pago.' }),
});

export type LoanValues = z.infer<typeof loanSchema>;
