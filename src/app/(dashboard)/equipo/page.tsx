import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InviteMemberForm } from '@/components/team/InviteMemberForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const metadata = {
  title: 'Equipo | PrestamosApp',
  description: 'Gestión de miembros del equipo',
};

export default async function EquipoPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificar si es dueño o supervisor
  const { data: contextData } = await supabase.rpc('get_user_context');
  const role = contextData && contextData.length > 0 ? contextData[0].role : 'owner';
  
  if (role !== 'owner' && role !== 'supervisor') {
    redirect('/dashboard');
  }

  const ownerId = contextData && contextData.length > 0 ? contextData[0].owner_id : user.id;

  // Cargar miembros del equipo
  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando equipo:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Equipo de Trabajo</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los accesos y roles de tu personal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Formulario de invitación */}
        {role === 'owner' && (
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Invitar Miembro</CardTitle>
                <CardDescription>
                  Genera un enlace para que tu empleado se registre.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteMemberForm ownerId={ownerId} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de miembros */}
        <div className={role === 'owner' ? "md:col-span-2" : "md:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle>Miembros actuales</CardTitle>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                      <tr>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Rol</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Invitado el</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{member.email}</td>
                          <td className="px-4 py-3 capitalize">{member.role}</td>
                          <td className="px-4 py-3">
                            <Badge variant={member.status === 'active' ? 'default' : member.status === 'pending' ? 'secondary' : 'destructive'}>
                              {member.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {member.created_at ? format(new Date(member.created_at), "d 'de' MMMM, yyyy", { locale: es }) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes miembros en tu equipo aún.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
