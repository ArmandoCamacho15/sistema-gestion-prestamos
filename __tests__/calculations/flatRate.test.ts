import { calculateFlatRate } from '@/lib/calculations/flatRate';

describe('calculateFlatRate', () => {
  it('debe calcular correctamente con $1.000.000, 10% mensual, 3 meses', () => {
    const result = calculateFlatRate({ 
      capital: 1_000_000, 
      monthlyRate: 0.10, 
      termMonths: 3, 
      installmentCount: 3 
    });
    expect(result.totalInterest).toBe(300_000);
    expect(result.installmentAmount).toBe(433_333.33);
  });

  it('debe calcular correctamente con $2.000.000, 10% mensual, 3 meses, mensual', () => {
    const result = calculateFlatRate({ 
      capital: 2_000_000, 
      monthlyRate: 0.10, 
      termMonths: 3, 
      installmentCount: 3 
    });
    expect(result.installmentAmount).toBe(866_666.67);
  });

  it('debe calcular correctamente con $2.000.000, 10% mensual, 3 meses, quincenal (6 cuotas)', () => {
    const result = calculateFlatRate({ 
      capital: 2_000_000, 
      monthlyRate: 0.10, 
      termMonths: 3, 
      installmentCount: 6 
    });
    expect(result.installmentAmount).toBe(433_333.33);
  });
});
