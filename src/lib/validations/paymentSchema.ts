import { z } from 'zod';
import { formatLocalYYYYMMDD } from '@/lib/formatters';


export const paymentSchema = z.object({
  installment_id: z.string().uuid('ID de cuota inválido'),
  loan_id: z.string().uuid('ID de préstamo inválido'),
  amount: z
    .number()
    .positive('El monto debe ser positivo')
    .min(0.01, 'El monto mínimo es 0.01'),
  paid_date: z.preprocess((val) => {
    if (!val) return undefined;
    if (val instanceof Date) return formatLocalYYYYMMDD(val);
    if (typeof val === 'string') {
      const s = val.trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split('/');
        return `${y}-${m}-${d}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        return s;
      }
      // Si es un string ISO, intentar extraer la parte de la fecha
      const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    return undefined;
  }, z.string().optional()),
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
