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

  // Obtener rol del equipo
  const { data: contextData } = await supabase.rpc('get_user_context');
  
  const userContext = contextData && contextData.length > 0 
    ? { role: contextData[0].role, ownerId: contextData[0].owner_id }
    : { role: 'owner' as const, ownerId: user.id };

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
