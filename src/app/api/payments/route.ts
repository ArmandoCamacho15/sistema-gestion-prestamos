import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  installmentId: z.string().uuid(),
  loanId: z.string().uuid(),
  amount: z.number().positive(),
  paymentDate: z.string(),
  notes: z.string().optional(),
  lateInterest: z.number().min(0).default(0),
});

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rawBody = await request.json();

    // Normalizar paymentDate: preferimos guardar fecha en formato YYYY-MM-DD (tipo date en DB)
    let paymentDateRaw = rawBody.paymentDate || rawBody.paid_date || rawBody.payment_date;
    let normalizedPaymentDate: string | undefined = undefined;
    if (paymentDateRaw) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(paymentDateRaw)) {
        normalizedPaymentDate = paymentDateRaw;
      } else {
        const d = new Date(paymentDateRaw);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          normalizedPaymentDate = `${y}-${m}-${day}`;
        }
      }
    }

    // Normalizar claves camelCase/snake_case
    const body = {
      installmentId: rawBody.installmentId || rawBody.installment_id,
      loanId: rawBody.loanId || rawBody.loan_id,
      amount: rawBody.amount,
      paymentDate: normalizedPaymentDate,
      notes: rawBody.notes,
      lateInterest: rawBody.lateInterest ?? rawBody.late_interest ?? 0,
    };

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { installmentId, loanId, amount, paymentDate, notes, lateInterest } = parsed.data;

    // 1. Verificar que el préstamo pertenece al usuario
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id, status')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
    }

    if (loan.status === 'pagado') {
      return NextResponse.json({ error: 'Este préstamo ya está completamente pagado' }, { status: 400 });
    }

    // 2. Verificar que la cuota existe y está pendiente
    const { data: installment, error: instError } = await supabase
      .from('installments')
      .select('id, status, total_amount, loan_id')
      .eq('id', installmentId)
      .eq('loan_id', loanId)
      .single();

    if (instError || !installment) {
      return NextResponse.json({ error: 'Cuota no encontrada' }, { status: 404 });
    }

    if (installment.status === 'paid') {
      return NextResponse.json({ error: 'Esta cuota ya está pagada' }, { status: 400 });
    }

    // 3. Registrar el pago
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        loan_id: loanId,
        installment_id: installmentId,
        amount,
        payment_date: paymentDate,
        notes: notes || null,
        late_interest: lateInterest,
        user_id: user.id,
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 4. Marcar la cuota como pagada
    const { error: updateInstError } = await supabase
      .from('installments')
      .update({
        status: 'paid',
        paid_date: paymentDate,
      })
      .eq('id', installmentId);

    if (updateInstError) throw updateInstError;

    // 5. Verificar si todas las cuotas del préstamo están pagadas
    const { count: pendingCount } = await supabase
      .from('installments')
      .select('*', { count: 'exact', head: true })
      .eq('loan_id', loanId)
      .in('status', ['pending', 'late']);

    // 6. Si no quedan cuotas pendientes, marcar el préstamo como pagado
    if (pendingCount === 0) {
      await supabase
        .from('loans')
        .update({ status: 'pagado' })
        .eq('id', loanId);
    }

    return NextResponse.json({ data: payment });
  } catch (error: any) {
    console.error('Error en API /api/payments:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    const query = supabase
      .from('payments')
      .select('id, loan_id, installment_id, amount, payment_date, late_interest, notes, created_at, user_id, installments(installment_number, due_date)')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });

    if (loanId) {
      query.eq('loan_id', loanId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
