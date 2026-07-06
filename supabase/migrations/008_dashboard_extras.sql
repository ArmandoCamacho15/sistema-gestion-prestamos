-- Funciones adicionales para el Dashboard Profesional

-- Obtener los Top 5 Clientes con mayor deuda pendiente
CREATE OR REPLACE FUNCTION get_top_debt_clients(p_user_id UUID)
RETURNS TABLE (
    client_id UUID,
    full_name TEXT,
    active_loans_count BIGINT,
    total_pending_debt NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as client_id,
        c.full_name,
        COUNT(DISTINCT l.id) as active_loans_count,
        COALESCE(SUM(i.total_amount), 0) as total_pending_debt
    FROM clients c
    JOIN loans l ON c.id = l.client_id AND l.status IN ('activo', 'moroso')
    JOIN installments i ON l.id = i.loan_id AND i.status IN ('pending', 'late')
    WHERE c.user_id = p_user_id
    GROUP BY c.id, c.full_name
    ORDER BY total_pending_debt DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
