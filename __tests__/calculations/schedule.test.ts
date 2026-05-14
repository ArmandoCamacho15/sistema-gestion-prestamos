import { generateSchedule } from '@/lib/calculations/schedule';

describe('generateSchedule', () => {
  const firstPaymentDate = new Date('2025-01-01T12:00:00Z');

  it('debe generar un cronograma flat de 3 cuotas correctamente', () => {
    const schedule = generateSchedule({
      capital: 1_000_000,
      monthlyRate: 0.10,
      termMonths: 3,
      rateType: 'flat',
      frequency: 'mensual',
      firstPaymentDate,
    });

    expect(schedule).toHaveLength(3);
    expect(schedule[0].installmentNumber).toBe(1);
    expect(schedule[2].installmentNumber).toBe(3);
    expect(schedule[2].balanceAfter).toBe(0);
    expect(schedule[0].totalAmount).toBe(433_333.33);
  });

  it('debe generar un cronograma francés (simple) de 3 cuotas correctamente', () => {
    const schedule = generateSchedule({
      capital: 1_000_000,
      monthlyRate: 0.10,
      termMonths: 3,
      rateType: 'simple',
      frequency: 'mensual',
      firstPaymentDate,
    });

    expect(schedule).toHaveLength(3);
    expect(schedule[2].balanceAfter).toBe(0);
    // Verificamos que el interés de la primera cuota sea el 10% del capital
    expect(schedule[0].interestAmount).toBe(100_000);
  });

  it('debe generar el doble de cuotas para frecuencia quincenal', () => {
    const schedule = generateSchedule({
      capital: 1_000_000,
      monthlyRate: 0.10,
      termMonths: 3,
      rateType: 'flat',
      frequency: 'quincenal',
      firstPaymentDate,
    });

    expect(schedule).toHaveLength(6);
  });
});
