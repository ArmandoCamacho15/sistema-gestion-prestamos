import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TeamRoleProvider } from '@/providers/TeamRoleProvider';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener rol del equipo de forma defensiva
  // Si la función RPC no existe en producción o lanza error, usamos fallback seguro
  let userContext: {
    role: 'owner' | 'collector' | 'secretary' | 'supervisor';
    ownerId: string;
  };

  try {
    const { data: contextData, error: rpcError } = await supabase.rpc('get_user_context');

    if (rpcError) {
      console.error('[DashboardLayout] Error en RPC get_user_context:', rpcError.message);
    }

    userContext =
      contextData && contextData.length > 0
        ? {
            role: contextData[0].role as 'owner' | 'collector' | 'secretary' | 'supervisor',
            ownerId: contextData[0].owner_id,
          }
        : { role: 'owner' as const, ownerId: user.id };
  } catch (err) {
    console.error('[DashboardLayout] Error inesperado obteniendo contexto de usuario:', err);
    userContext = { role: 'owner' as const, ownerId: user.id };
  }

  return (
    <TeamRoleProvider userContext={userContext}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Sidebar Desktop */}
        <aside className="hidden w-64 flex-col md:flex">
          <Sidebar />
        </aside>

        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TeamRoleProvider>
  );
}
