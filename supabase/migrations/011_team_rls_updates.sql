-- Actualizar RLS para clientes
DROP POLICY IF EXISTS "Usuarios solo ven sus propios clientes" ON clients;
CREATE POLICY "Usuarios solo ven sus propios clientes"
  ON clients FOR ALL
  USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  );

-- Actualizar RLS para préstamos
DROP POLICY IF EXISTS "Usuarios solo ven sus propios préstamos" ON loans;
CREATE POLICY "Usuarios solo ven sus propios préstamos"
  ON loans FOR ALL
  USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  );

-- Actualizar RLS para cuotas
DROP POLICY IF EXISTS "Usuarios solo ven cuotas de sus préstamos" ON installments;
CREATE POLICY "Usuarios solo ven cuotas de sus préstamos"
  ON installments FOR ALL
  USING (
    loan_id IN (
      SELECT id FROM loans WHERE user_id = auth.uid() OR user_id IN (SELECT owner_id FROM get_user_context())
    )
  );

-- Actualizar RLS para pagos
DROP POLICY IF EXISTS "Usuarios solo ven sus propios pagos" ON payments;
CREATE POLICY "Usuarios solo ven sus propios pagos"
  ON payments FOR ALL
  USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  );

-- Actualizar RLS para configuración
DROP POLICY IF EXISTS "Usuarios solo ven su propia configuración" ON settings;
CREATE POLICY "Usuarios solo ven su propia configuración"
  ON settings FOR ALL
  USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    user_id IN (SELECT owner_id FROM get_user_context())
  );
