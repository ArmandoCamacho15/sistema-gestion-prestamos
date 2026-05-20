-- Tabla de transacciones de capital
CREATE TABLE capital_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('inyeccion', 'retiro')) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE capital_transactions ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY "Users can manage their own capital transactions"
  ON capital_transactions
  FOR ALL
  USING (auth.uid() = user_id);

-- Vista: Flujo proyectado futuro
CREATE VIEW v_projected_cashflow AS
SELECT
  l.user_id,
  DATE_TRUNC('month', i.due_date) AS month,
  SUM(i.capital_amount) AS projected_capital,
  SUM(i.interest_amount) AS projected_interest,
  SUM(i.total_amount) AS projected_total
FROM installments i
JOIN loans l ON i.loan_id = l.id
WHERE
  i.status = 'pending'
  AND i.due_date >= CURRENT_DATE
GROUP BY l.user_id, DATE_TRUNC('month', i.due_date)
ORDER BY month ASC;

-- Vista: Resumen de capital (Capital Inyectado Neto)
CREATE VIEW v_capital_summary AS
SELECT
  user_id,
  COALESCE(SUM(amount) FILTER (WHERE type = 'inyeccion'), 0) AS total_injected,
  COALESCE(SUM(amount) FILTER (WHERE type = 'retiro'), 0) AS total_withdrawn,
  COALESCE(SUM(amount) FILTER (WHERE type = 'inyeccion'), 0) - COALESCE(SUM(amount) FILTER (WHERE type = 'retiro'), 0) AS net_capital
FROM capital_transactions
GROUP BY user_id;
