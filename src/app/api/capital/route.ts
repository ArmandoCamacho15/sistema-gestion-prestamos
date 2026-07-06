import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type, date, notes } = body;

    if (!amount || amount <= 0 || !type || !["inyeccion", "retiro"].includes(type) || !date) {
      return NextResponse.json(
        { error: "Datos de transacción inválidos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("capital_transactions")
      .insert([
        {
          user_id: user.id,
          amount,
          type,
          date,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error insertando capital:", error);
      return NextResponse.json(
        { error: "Error al guardar la transacción" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error en capital API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
