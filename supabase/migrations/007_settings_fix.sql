-- Migración para corregir la Primary Key de la tabla settings
-- Esto permite que el sistema sea multiusuario real, dejando que cada usuario tenga sus propias settings.

-- 1. Eliminar la Primary Key actual que solo es `key`
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey;

-- 2. Crear la nueva Primary Key compuesta `(key, user_id)`
ALTER TABLE settings ADD PRIMARY KEY (key, user_id);

-- 3. Habilitar Row Level Security (RLS) en la tabla si no estaba habilitado
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS para que los usuarios solo puedan ver y editar sus configuraciones
DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;
CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON settings;
CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = user_id);
