/**
 * Formatea un número como moneda colombiana (COP).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY).
 */
export function formatDate(date: Date | string): string {
  const formatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (typeof date === 'string') {
    const s = date.trim();
    // If string is YYYY-MM-DD, construct local Date to avoid timezone shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-').map(Number);
      return formatter.format(new Date(y, m - 1, d));
    }
    const dObj = new Date(s);
    return formatter.format(dObj);
  }

  return formatter.format(date);
}
