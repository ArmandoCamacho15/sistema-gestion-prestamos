'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createInvite(ownerId: string, email: string, role: string) {
  const supabase = await createSupabaseServerClient();
  const token = crypto.randomUUID();

  const { error } = await supabase
    .from('team_members')
    .insert({
      owner_id: ownerId,
      email: email,
      role: role,
      invite_token: token,
      status: 'pending'
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/equipo');
  
  // En un sistema real aquí se enviaría un email.
  // Por ahora, devolvemos el token para que el dueño lo copie.
  return { token };
}
