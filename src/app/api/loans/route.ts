import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateSchedule } from '@/lib/calculations/schedule';
import { parseLocalDate, formatLocalYYYYMMDD } from '@/lib/formatters';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

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

    // 1. Generar el cronograma
    const schedule = generateSchedule({
      capital: amount,
      monthlyRate: interestRate / 100,
      termMonths,
      rateType,
      frequency: paymentFrequency,
      firstPaymentDate: parseLocalDate(firstPaymentDate),
    });

    const totalPaid = schedule.reduce((sum, inst) => sum + inst.totalAmount, 0);
    const totalInterest = totalPaid - amount;

    // 2. Insertar el Préstamo
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .insert([{
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
        user_id: user.id,
      }])
      .select()
      .single();

    if (loanError) throw loanError;

    // 3. Insertar las Cuotas
    const installmentsData = schedule.map((inst) => ({
      loan_id: loan.id,
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

    return NextResponse.json({ data: loan });
  } catch (error: any) {
    console.error('Error in API /api/loans:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('loans')
      .select('*, clients(full_name, identification)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
