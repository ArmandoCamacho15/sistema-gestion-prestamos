'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, LoginValues, RegisterValues } from '@/lib/validations/authSchema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(values: LoginValues) {
  const supabase = await createSupabaseServerClient();

  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos.' };
  }

  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciales inválidas o error de conexión.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(values: RegisterValues) {
  const supabase = await createSupabaseServerClient();

  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos.' };
  }

  const { email, password, fullName } = validatedFields.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('Error en signUp:', error);
    return { error: `No se pudo crear la cuenta: ${error.message}` };
  }


  if (data.user) {
    // Insertar configuraciones por defecto para el nuevo usuario
    const defaultSettings = [
      { key: 'operating_expense_percent', value: 20, description: 'Gastos operativos (%)', user_id: data.user.id },
      { key: 'provision_percent', value: 10, description: 'Provisión para mora (%)', user_id: data.user.id },
      { key: 'late_days', value: 15, description: 'Días de gracia', user_id: data.user.id },
      { key: 'max_active_loans_per_client', value: 2, description: 'Máximo préstamos activos por cliente', user_id: data.user.id },
      { key: 'liquidity_min_percent', value: 30, description: 'Liquidez mínima requerida (%)', user_id: data.user.id },
    ];

    const { error: settingsError } = await supabase.from('settings').insert(defaultSettings);

    if (settingsError) {
      console.error('Error al insertar settings por defecto:', settingsError);
    }
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
