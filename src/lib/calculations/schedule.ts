export interface ScheduleInstallment {
  installmentNumber: number;
  dueDate: Date;
  capitalAmount: number;
  interestAmount: number;
  totalAmount: number;
  balanceAfter: number;
}

export type PaymentFrequency = 'mensual' | 'quincenal';
export type RateType = 'flat' | 'simple';

export interface ScheduleParams {
  capital: number;
  monthlyRate: number;         // Tasa mensual en decimal
  termMonths: number;
  rateType: RateType;
  frequency: PaymentFrequency;
  firstPaymentDate: Date;
}

/**
 * Calcula la siguiente fecha de pago según la frecuencia.
 * Para 'quincenal': añade 15 días exactos.
 * Para 'mensual': añade 1 mes (respeta el calendario).
 */
function getNextDueDate(current: Date, frequency: PaymentFrequency): Date {
  const next = new Date(current);
  switch (frequency) {
    case 'mensual':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quincenal':
      next.setDate(next.getDate() + 15);
      break;
  }
  return next;
}

/**
 * Genera el cronograma completo de cuotas para un préstamo.
 * La última cuota se ajusta para absorber diferencias de redondeo.
 */
export function generateSchedule(params: ScheduleParams): ScheduleInstallment[] {
  const { capital, monthlyRate, termMonths, rateType, frequency, firstPaymentDate } = params;

  // Calcular número de cuotas según frecuencia
  const installmentCountMap: Record<PaymentFrequency, number> = {
    mensual: termMonths,
    quincenal: termMonths * 2,
  };
  const n = installmentCountMap[frequency];

  // Ajustar tasa según frecuencia
  const rateMap: Record<PaymentFrequency, number> = {
    mensual: monthlyRate,
    quincenal: monthlyRate / 2,
  };
  const periodRate = rateMap[frequency];

  const schedule: ScheduleInstallment[] = [];
  let balance = capital;
  let currentDate = new Date(firstPaymentDate);

  if (rateType === 'flat') {
    // Tasa flat: cuota fija, interés proporcional al capital original
    const totalInterest = capital * monthlyRate * termMonths;
    const capitalPerInstallment = capital / n;
    const interestPerInstallment = totalInterest / n;

    for (let i = 1; i <= n; i++) {
      const isLast = i === n;
      // Ajustar última cuota para compensar redondeo
      const capitalAmount = isLast ? balance : Math.round(capitalPerInstallment * 100) / 100;
      const interestAmount = Math.round(interestPerInstallment * 100) / 100;
      const totalAmount = Math.round((capitalAmount + interestAmount) * 100) / 100;
      balance = Math.round((balance - capitalAmount) * 100) / 100;

      schedule.push({
        installmentNumber: i,
        dueDate: new Date(currentDate),
        capitalAmount,
        interestAmount,
        totalAmount,
        balanceAfter: isLast ? 0 : balance,
      });

      if (i < n) currentDate = getNextDueDate(currentDate, frequency);
    }
  } else {
    // Tasa simple (sistema francés): cuota fija, interés sobre saldo pendiente
    const factor = periodRate === 0 ? 1 : Math.pow(1 + periodRate, n);
    const fixedInstallment = periodRate === 0
      ? capital / n
      : capital * (periodRate * factor) / (factor - 1);

    for (let i = 1; i <= n; i++) {
      const isLast = i === n;
      const interestAmount = Math.round(balance * periodRate * 100) / 100;
      // En la última cuota, el capital es exactamente el saldo restante
      const capitalAmount = isLast
        ? balance
        : Math.round((fixedInstallment - interestAmount) * 100) / 100;
      const totalAmount = Math.round((capitalAmount + interestAmount) * 100) / 100;
      balance = Math.round((balance - capitalAmount) * 100) / 100;

      schedule.push({
        installmentNumber: i,
        dueDate: new Date(currentDate),
        capitalAmount,
        interestAmount,
        totalAmount,
        balanceAfter: isLast ? 0 : balance,
      });

      if (i < n) currentDate = getNextDueDate(currentDate, frequency);
    }
  }

  return schedule;
}
