import { calculateSimpleRate } from '@/lib/calculations/simpleRate';

describe('calculateSimpleRate', () => {
  it('debe calcular cuota ≈ $402.114 para $1.000.000, 10% mensual, 3 meses', () => {
    const result = calculateSimpleRate({ 
      capital: 1_000_000, 
      monthlyRate: 0.10, 
      installmentCount: 3 
    });
    // Usamos toBeCloseTo con precisión de -1 para permitir diferencias de redondeo pequeñas en pesos
    expect(result.installmentAmount).toBeCloseTo(402_114, -1);
  });

  it('debe retornar cuota igual al capital/n cuando la tasa es 0', () => {
    const result = calculateSimpleRate({ 
      capital: 600_000, 
      monthlyRate: 0, 
      installmentCount: 3 
    });
    expect(result.installmentAmount).toBe(200_000);
    expect(result.totalInterest).toBe(0);
  });
});
