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
    // Extraer la parte de la fecha YYYY-MM-DD independientemente de si tiene hora o zona horaria
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [_, y, m, d] = match;
      return formatter.format(new Date(Number(y), Number(m) - 1, Number(d)));
    }
    const dObj = new Date(s);
    return formatter.format(dObj);
  }

  return formatter.format(date);
}
/**
 * Parsea un string "YYYY-MM-DD" a un objeto Date usando la zona horaria local.
 * Esto evita el desfase de horas que ocurre al usar `new Date('YYYY-MM-DD')` que por defecto es UTC.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr); // fallback
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formatea un objeto Date a un string "YYYY-MM-DD" usando el tiempo local.
 * Esto evita el desfase de horas de `toISOString().split('T')[0]`.
 */
export function formatLocalYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
