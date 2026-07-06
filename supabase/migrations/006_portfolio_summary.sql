-- Vista: Resumen Integral de Cartera y Liquidez
-- Reemplaza la funcionalidad básica de v_capital_summary con un cálculo profundo

CREATE OR REPLACE VIEW v_portfolio_summary AS
WITH all_users AS (
  SELECT DISTINCT user_id FROM capital_transactions
  UNION
  SELECT DISTINCT user_id FROM loans
),
capital AS (
  SELECT
    user_id,
    COALESCE(SUM(amount) FILTER (WHERE type = 'inyeccion'), 0) - 
    COALESCE(SUM(amount) FILTER (WHERE type = 'retiro'), 0) AS net_capital
  FROM capital_transactions
  GROUP BY user_id
),
loans_summary AS (
  SELECT
    user_id,
    COALESCE(SUM(amount), 0) AS total_prestado_historico
  FROM loans
  GROUP BY user_id
),
payments_summary AS (
  SELECT
    l.user_id,
    COALESCE(SUM(
      CASE 
        WHEN i.total_amount > 0 THEN p.amount * (i.capital_amount / i.total_amount)
        ELSE 0
      END
    ), 0) AS total_recuperado_capital,
    COALESCE(SUM(
      CASE 
        WHEN i.total_amount > 0 THEN p.amount * (i.interest_amount / i.total_amount)
        ELSE 0
      END
    ), 0) + COALESCE(SUM(p.late_interest), 0) AS total_recuperado_intereses
  FROM payments p
  JOIN loans l ON p.loan_id = l.id
  JOIN installments i ON p.installment_id = i.id
  GROUP BY l.user_id
),
pending_interest AS (
  SELECT
    l.user_id,
    COALESCE(SUM(i.interest_amount), 0) AS interes_esperado
  FROM installments i
  JOIN loans l ON i.loan_id = l.id
  WHERE i.status IN ('pending', 'late')
  GROUP BY l.user_id
)
SELECT
  u.user_id,
  COALESCE(c.net_capital, 0) AS net_capital,
  COALESCE(l.total_prestado_historico, 0) AS total_prestado_historico,
  COALESCE(p.total_recuperado_capital, 0) AS total_recuperado_capital,
  COALESCE(p.total_recuperado_intereses, 0) AS total_recuperado_intereses,
  -- Capital en la Calle = Prestado Histórico - Recuperado Capital
  COALESCE(l.total_prestado_historico, 0) - COALESCE(p.total_recuperado_capital, 0) AS capital_en_calle,
  -- Liquidez Disponible = Inyectado - Capital en la calle + Intereses ganados
  COALESCE(c.net_capital, 0) 
    - (COALESCE(l.total_prestado_historico, 0) - COALESCE(p.total_recuperado_capital, 0)) 
    + COALESCE(p.total_recuperado_intereses, 0) AS capital_disponible,
  COALESCE(pi.interes_esperado, 0) AS interes_esperado
FROM all_users u
LEFT JOIN capital c ON u.user_id = c.user_id
LEFT JOIN loans_summary l ON u.user_id = l.user_id
LEFT JOIN payments_summary p ON u.user_id = p.user_id
LEFT JOIN pending_interest pi ON u.user_id = pi.user_id;
