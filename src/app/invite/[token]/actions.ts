'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function acceptInviteAction(email: string, password: string, token: string, memberId: string) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Registrar al usuario
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // Nota: Si el usuario ya existe, Supabase devuelve un error o requiere confirmación de email.
    // En un sistema real se debería manejar el caso en que el usuario inicie sesión con su cuenta existente.
    return { error: error.message };
  }

  const userId = data.user?.id;

  if (userId) {
    // 2. Actualizar el registro en team_members a 'active'
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        user_id: userId,
        status: 'active',
        invite_token: null, // Invalidar el token
      })
      .eq('id', memberId)
      .eq('invite_token', token); // Doble validación

    if (updateError) {
      return { error: 'Error al activar la invitación.' };
    }
  }

  return { success: true };
}
