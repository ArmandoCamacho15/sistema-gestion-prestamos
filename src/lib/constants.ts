export const APP_NAME = 'Sistema de Gestión de Préstamos';

export const RATE_TYPES = {
  FLAT: 'flat',
  SIMPLE: 'simple',
} as const;

export const PAYMENT_FREQUENCIES = {
  MENSUAL: 'mensual',
  QUINCENAL: 'quincenal',
} as const;

export const LOAN_STATUS = {
  ACTIVO: 'activo',
  PAGADO: 'pagado',
  MOROSO: 'moroso',
} as const;

export const INSTALLMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  LATE: 'late',
} as const;
