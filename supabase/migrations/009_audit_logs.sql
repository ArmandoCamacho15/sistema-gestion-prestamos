-- Migration: 009_audit_logs
-- Description: Creates the audit logs table and triggers to track all application movements

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Índice para mejorar las búsquedas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);

-- Función genérica del Trigger para capturar eventos
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_entity_id uuid;
  v_details jsonb;
BEGIN
  -- Intentar obtener el user_id de la sesión (auth.uid())
  -- Si es nulo (e.g. ejecutado por el rol postgres internamente o función RPC SECURITY DEFINER), extraemos del registro.
  v_user_id := auth.uid();
  
  IF TG_OP = 'DELETE' THEN
    IF v_user_id IS NULL THEN
      BEGIN
        v_user_id := OLD.user_id;
      EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
      END;
    END IF;
    
    -- Manejo especial de IDs para settings que tiene clave compuesta
    IF TG_TABLE_NAME = 'settings' THEN
      v_entity_id := NULL; -- settings usa text como PK, la omitimos o podríamos intentar castear si existiera un id.
    ELSE
      v_entity_id := OLD.id;
    END IF;

    v_details := row_to_json(OLD)::jsonb;
    
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (v_user_id, 'DELETE', TG_TABLE_NAME, v_entity_id, v_details);
    
    RETURN OLD;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF v_user_id IS NULL THEN
      BEGIN
        v_user_id := NEW.user_id;
      EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
      END;
    END IF;

    IF TG_TABLE_NAME = 'settings' THEN
      v_entity_id := NULL;
    ELSE
      v_entity_id := NEW.id;
    END IF;
    
    v_details := jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
    
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (v_user_id, 'UPDATE', TG_TABLE_NAME, v_entity_id, v_details);
    
    RETURN NEW;
    
  ELSIF TG_OP = 'INSERT' THEN
    IF v_user_id IS NULL THEN
      BEGIN
        v_user_id := NEW.user_id;
      EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
      END;
    END IF;

    IF TG_TABLE_NAME = 'settings' THEN
      v_entity_id := NULL;
    ELSE
      v_entity_id := NEW.id;
    END IF;

    v_details := row_to_json(NEW)::jsonb;
    
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (v_user_id, 'INSERT', TG_TABLE_NAME, v_entity_id, v_details);
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- CREAR LOS TRIGGERS EN LAS TABLAS PRINCIPALES

-- 1. Clients
DROP TRIGGER IF EXISTS trg_audit_clients ON clients;
CREATE TRIGGER trg_audit_clients
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 2. Loans
DROP TRIGGER IF EXISTS trg_audit_loans ON loans;
CREATE TRIGGER trg_audit_loans
AFTER INSERT OR UPDATE OR DELETE ON loans
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 3. Installments
DROP TRIGGER IF EXISTS trg_audit_installments ON installments;
CREATE TRIGGER trg_audit_installments
AFTER INSERT OR UPDATE OR DELETE ON installments
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 4. Capital Transactions
DROP TRIGGER IF EXISTS trg_audit_capital_transactions ON capital_transactions;
CREATE TRIGGER trg_audit_capital_transactions
AFTER INSERT OR UPDATE OR DELETE ON capital_transactions
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 5. Settings
DROP TRIGGER IF EXISTS trg_audit_settings ON settings;
CREATE TRIGGER trg_audit_settings
AFTER INSERT OR UPDATE OR DELETE ON settings
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
