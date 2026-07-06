import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AcceptInviteForm } from './AcceptInviteForm';
import { Landmark } from 'lucide-react';

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = await createSupabaseServerClient();
  const token = params.token;

  // Buscar el token en la base de datos
  const { data: memberData, error } = await supabase
    .from('team_members')
    .select('*, owner:owner_id(email)')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single();

  if (error || !memberData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invitación no válida</h1>
          <p className="text-muted-foreground mb-6">
            El enlace de invitación ha expirado o ya fue utilizado.
          </p>
          <a href="/login" className="text-primary hover:underline">Ir a iniciar sesión</a>
        </div>
      </div>
    );
  }

  // Comprobar si la invitación expiró
  if (new Date(memberData.invite_expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invitación Expirada</h1>
          <p className="text-muted-foreground mb-6">
            Este enlace de invitación expiró. Por favor, solicita uno nuevo al administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-lg mb-4">
            <Landmark className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Unirse al Equipo</h1>
          <p className="text-muted-foreground mt-2">
            Has sido invitado para unirte con el rol de <span className="font-semibold text-foreground capitalize">{memberData.role}</span>.
          </p>
        </div>

        <AcceptInviteForm 
          email={memberData.email} 
          token={token} 
          memberId={memberData.id} 
        />
      </div>
    </div>
  );
}
