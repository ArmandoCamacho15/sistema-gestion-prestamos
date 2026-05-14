import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieRecord = {
  name: string;
  value: string;
};

type SupabaseCookieToSet = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

type MutableCookieStore = {
  getAll(): CookieRecord[];
  set(name: string, value: string, options?: Record<string, unknown>): void;
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan las variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // El método setAll puede ser llamado desde Server Components
          // donde las cookies no pueden ser modificadas. Ignoramos si falla.
        }
      },
    },
  });
}