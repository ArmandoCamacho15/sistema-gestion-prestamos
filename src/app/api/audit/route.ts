import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");

    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq("action", action);
    }
    if (entity) {
      query = query.eq("entity_type", entity);
    }

    const { data: logs, error: logsError } = await query;

    if (logsError) {
      console.error("Error fetching audit logs:", logsError);
      return NextResponse.json(
        { error: "Error al cargar historial de auditoría" },
        { status: 500 }
      );
    }

    return NextResponse.json(logs || []);
  } catch (error: any) {
    console.error("Error en audit API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
