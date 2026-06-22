import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateSchedule } from '@/lib/calculations/schedule';
import { parseLocalDate, formatLocalYYYYMMDD } from '@/lib/formatters';

export async function PATCH(
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
    const body = await request.json();
    const {
      clientId,
      amount,
      interestRate,
      termMonths,
      rateType,
      paymentFrequency,
      startDate,
      firstPaymentDate,
    } = body;

    // Verificar que el préstamo exista
    const { data: loan, error: loanFetchError } = await supabase
      .from('loans')
      .select('*, installments(*)')
      .eq('id', id)
      .single();

    if (loanFetchError || !loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
    }

    // Verificar que no haya cuotas pagadas
    const paidInstallments = (loan.installments || []).filter((i: any) => i.status === 'paid');
    if (paidInstallments.length > 0) {
      return NextResponse.json(
        { error: 'No se puede editar un préstamo que ya tiene cuotas pagadas.' },
        { status: 400 }
      );
    }

    // 1. Generar el nuevo cronograma
    const schedule = generateSchedule({
      capital: amount,
      monthlyRate: interestRate / 100,
      termMonths,
      rateType,
      frequency: paymentFrequency,
      firstPaymentDate: parseLocalDate(firstPaymentDate),
    });

    const totalPaid = schedule.reduce((sum: number, inst: any) => sum + inst.totalAmount, 0);
    const totalInterest = totalPaid - amount;

    // 2. Actualizar el Préstamo
    const { error: updateError } = await supabase
      .from('loans')
      .update({
        client_id: clientId,
        amount,
        term_months: termMonths,
        interest_rate: interestRate,
        rate_type: rateType,
        payment_frequency: paymentFrequency,
        start_date: startDate,
        first_payment_date: firstPaymentDate,
        total_interest: totalInterest,
        total_amount: totalPaid,
        installment_amount: schedule[0].totalAmount,
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. Eliminar cuotas antiguas (todas en pending)
    const { error: deleteError } = await supabase
      .from('installments')
      .delete()
      .eq('loan_id', id);

    if (deleteError) throw deleteError;

    // 4. Insertar el nuevo cronograma
    const installmentsData = schedule.map((inst: any) => ({
      loan_id: id,
      installment_number: inst.installmentNumber,
      due_date: formatLocalYYYYMMDD(inst.dueDate),
      capital_amount: inst.capitalAmount,
      interest_amount: inst.interestAmount,
      total_amount: inst.totalAmount,
      balance_after: inst.balanceAfter,
      status: 'pending',
    }));

    const { error: instError } = await supabase
      .from('installments')
      .insert(installmentsData);

    if (instError) throw instError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/loans/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


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
