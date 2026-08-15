import { createBrowserClient } from '@supabase/ssr';

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // No lanzar error (evita crashear React en producción).
    // En su lugar loguear y retornar valores vacíos; las queries fallarán
    // con un error de red en lugar de romper el árbol de componentes.
    console.warn(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están definidas. ' +
      'Las operaciones de base de datos fallarán silenciosamente.'
    );
    return { supabaseUrl: 'https://placeholder.supabase.co', supabaseAnonKey: 'placeholder' };
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}