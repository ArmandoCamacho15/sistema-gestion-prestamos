import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const patchSchema = z.object({
  installmentId: z.string().uuid().optional(),
  loanId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
  lateInterest: z.number().min(0).optional(),
});

function resolveParams(params: any) {
  if (!params) return undefined;
  // Some Next versions provide params as a Promise
  if (typeof params.then === 'function') return params.then((p: any) => p);
  return params;
}

export async function PATCH(request: Request, context: any) {
  try {
    const resolved = await resolveParams(context?.params);
    const paymentId = resolved?.id ?? context?.params?.id;

    if (!paymentId) return NextResponse.json({ error: 'Missing id param' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const raw = await request.json();
    
    // Normalizar paymentDate: preferimos guardar fecha en formato YYYY-MM-DD (tipo date en DB)
    let paymentDateRaw = raw.paymentDate || raw.paid_date || raw.payment_date;
    let normalizedPaymentDate: string | undefined = undefined;
    if (paymentDateRaw) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(paymentDateRaw)) {
        // Ya está en YYYY-MM-DD
        normalizedPaymentDate = paymentDateRaw;
      } else {
        // Intentar parsear y extraer la fecha local del objeto Date
        const d = new Date(paymentDateRaw);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          normalizedPaymentDate = `${y}-${m}-${day}`;
        }
      }
    }

    const body = {
      installmentId: raw.installmentId || raw.installment_id,
      loanId: raw.loanId || raw.loan_id,
      amount: raw.amount,
      paymentDate: normalizedPaymentDate,
      notes: raw.notes,
      lateInterest: raw.lateInterest ?? raw.late_interest,
    };

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // Verificar existencia y propiedad
    const { data: existing, error: existingErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (existingErr || !existing) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    if (existing.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const updates: any = {};
    if (parsed.data.amount != null) updates.amount = parsed.data.amount;
    if (parsed.data.paymentDate !== undefined) updates.payment_date = parsed.data.paymentDate;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
    if (parsed.data.lateInterest !== undefined) updates.late_interest = parsed.data.lateInterest;
    if (parsed.data.installmentId) updates.installment_id = parsed.data.installmentId;
    if (parsed.data.loanId) updates.loan_id = parsed.data.loanId;

    const { data: updatedPayment, error: updateErr } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Propagar cambios a installments si aplica
    if (parsed.data.installmentId && parsed.data.installmentId !== existing.installment_id) {
      await supabase
        .from('installments')
        .update({ status: 'pending', paid_date: null })
        .eq('id', existing.installment_id);

      await supabase
        .from('installments')
        .update({ status: 'paid', paid_date: parsed.data.paymentDate || existing.payment_date })
        .eq('id', parsed.data.installmentId);
    } else if (parsed.data.paymentDate) {
      await supabase
        .from('installments')
        .update({ paid_date: parsed.data.paymentDate })
        .eq('id', existing.installment_id);
    }

    // Recalcular estado del préstamo
    const loanId = updates.loan_id || existing.loan_id;
    const { count: pendingCount } = await supabase
      .from('installments')
      .select('*', { count: 'exact', head: true })
      .eq('loan_id', loanId)
      .in('status', ['pending', 'late']);

    if (pendingCount === 0) {
      await supabase.from('loans').update({ status: 'pagado' }).eq('id', loanId);
    } else {
      await supabase.from('loans').update({ status: 'activo' }).eq('id', loanId);
    }

    return NextResponse.json({ data: updatedPayment });
  } catch (error: any) {
    console.error('PATCH /api/payments/[id]:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const resolved = await resolveParams(context?.params);
    const paymentId = resolved?.id ?? context?.params?.id;

    if (!paymentId) return NextResponse.json({ error: 'Missing id param' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, loan_id, installment_id, user_id')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    if (payment.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const { error: delErr } = await supabase.from('payments').delete().eq('id', paymentId);
    if (delErr) throw delErr;

    await supabase
      .from('installments')
      .update({ status: 'pending', paid_date: null })
      .eq('id', payment.installment_id);

    const { count: pendingCount } = await supabase
      .from('installments')
      .select('*', { count: 'exact', head: true })
      .eq('loan_id', payment.loan_id)
      .in('status', ['pending', 'late']);

    if ((pendingCount ?? 0) > 0) {
      await supabase.from('loans').update({ status: 'activo' }).eq('id', payment.loan_id);
    }

    return NextResponse.json({ data: { id: paymentId } });
  } catch (error: any) {
    console.error('DELETE /api/payments/[id]:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
