import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Intentar eliminar el préstamo. Fallará si tiene pagos asociados debido a la restricción FK.
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (error.code === '23503') { // Foreign key violation
        return NextResponse.json(
          { error: 'No se puede eliminar un préstamo que ya tiene pagos registrados.' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar préstamo:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
