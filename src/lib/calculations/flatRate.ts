export interface FlatRateParams {
  capital: number;           // Monto del préstamo
  monthlyRate: number;       // Tasa mensual en decimal (e.g., 0.10 para 10%)
  termMonths: number;        // Plazo en meses
  installmentCount: number;  // Número de cuotas según frecuencia
}

export interface FlatRateResult {
  totalInterest: number;
  totalAmount: number;
  installmentAmount: number;
}

/**
 * Calcula el interés y la cuota para un préstamo con tasa flat.
 * El interés se aplica sobre el capital total durante todo el plazo.
 */
export function calculateFlatRate(params: FlatRateParams): FlatRateResult {
  const { capital, monthlyRate, termMonths, installmentCount } = params;

  // Interés = capital × tasa × plazo en meses
  const totalInterest = capital * monthlyRate * termMonths;
  const totalAmount = capital + totalInterest;
  // Cuota fija dividiendo el total entre el número de cuotas
  const installmentAmount = totalAmount / installmentCount;

  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    installmentAmount: Math.round(installmentAmount * 100) / 100,
  };
}
