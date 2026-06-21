-- Tabla de miembros del equipo
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,   -- El prestamista dueño
  user_id UUID REFERENCES auth.users(id),              -- El miembro invitado (NULL si aún no acepta)
  email TEXT NOT NULL,                                  -- Email del invitado
  role TEXT CHECK (role IN ('owner', 'collector', 'secretary', 'supervisor')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  invite_token TEXT UNIQUE,                             -- Token para aceptar invitación
  invite_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asignación de préstamos a cobradores
CREATE TABLE loan_assignments (
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  collector_id UUID REFERENCES auth.users(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (loan_id, collector_id)
);

-- RLS: el dueño ve su equipo completo, el miembro se ve a sí mismo o a su equipo si el dueño es él mismo (ya resuelto)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_manages_team"
  ON team_members FOR ALL
  USING (owner_id = auth.uid() OR user_id = auth.uid());

-- Función: obtener el contexto del usuario en sesión
-- Retorna: {role, owner_id} para saber qué tenant pertenece
CREATE OR REPLACE FUNCTION get_user_context()
RETURNS TABLE (role TEXT, owner_id UUID) AS $$
  SELECT tm.role, tm.owner_id
  FROM team_members tm
  WHERE tm.user_id = auth.uid() AND tm.status = 'active'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;
