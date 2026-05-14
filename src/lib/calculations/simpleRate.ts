export interface SimpleRateParams {
  capital: number;
  monthlyRate: number;       // Tasa mensual en decimal
  installmentCount: number;  // Número de cuotas (n)
}

export interface SimpleRateResult {
  installmentAmount: number;
  totalAmount: number;
  totalInterest: number;
}

/**
 * Calcula la cuota para un préstamo con sistema francés (tasa simple, cuota fija).
 * Usa la fórmula estándar de anualidades: PMT = PV × [i(1+i)^n] / [(1+i)^n - 1]
 */
export function calculateSimpleRate(params: SimpleRateParams): SimpleRateResult {
  const { capital, monthlyRate, installmentCount } = params;

  // Evitar división por cero si la tasa es 0
  if (monthlyRate === 0) {
    const installmentAmount = capital / installmentCount;
    return {
      installmentAmount,
      totalAmount: capital,
      totalInterest: 0,
    };
  }

  const i = monthlyRate;
  const n = installmentCount;
  const factor = Math.pow(1 + i, n);

  // Fórmula de anualidades (sistema francés)
  const installmentAmount = capital * (i * factor) / (factor - 1);
  const totalAmount = installmentAmount * n;
  const totalInterest = totalAmount - capital;

  return {
    installmentAmount: Math.round(installmentAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}
