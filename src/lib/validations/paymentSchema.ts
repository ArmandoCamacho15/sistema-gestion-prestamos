import { z } from 'zod';

export const paymentSchema = z.object({
  installment_id: z.string().uuid('ID de cuota inválido'),
  loan_id: z.string().uuid('ID de préstamo inválido'),
  amount: z
    .number()
    .positive('El monto debe ser positivo')
    .min(0.01, 'El monto mínimo es 0.01'),
  paid_date: z.preprocess((val) => {
    if (!val) return undefined;
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') {
      const s = val.trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split('/');
        return new Date(`${y}-${m}-${d}`).toISOString();
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        return new Date(s).toISOString();
      }
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) return dt.toISOString();
    }
    return undefined;
  }, z.string().optional().refine((v) => !v || !isNaN(Date.parse(v)), { message: 'Fecha inválida' })),
  late_interest: z
    .number()
    .min(0, 'El interés moratorio no puede ser negativo')
    .optional()
    .default(0),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

export const paymentResponseSchema = z.object({
  id: z.string().uuid(),
  installment_id: z.string().uuid(),
  loan_id: z.string().uuid(),
  amount: z.number(),
  paid_date: z.string().datetime(),
  late_interest: z.number(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type PaymentResponse = z.infer<typeof paymentResponseSchema>;

// Schema para editar pagos (no requiere installment_id ni loan_id)
export const editPaymentSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo').min(0.01).optional(),
  paid_date: z.string().optional(),
  late_interest: z.number().min(0).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export type EditPaymentInput = z.infer<typeof editPaymentSchema>;
