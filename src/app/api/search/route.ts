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
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ clients: [], loans: [] });
    }

    // Buscar clientes (por nombre o identificación)
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, full_name, identification")
      .eq("user_id", user.id)
      .or(`full_name.ilike.%${query}%,identification.ilike.%${query}%`)
      .limit(5);

    if (clientsError) {
      console.error("Error searching clients:", clientsError);
      throw clientsError;
    }

    // Buscar préstamos (por ID abreviado o por nombre de cliente)
    // Supabase no soporta un join directo con OR fácilmente en una sola consulta sin una vista o RPC para texto completo.
    // Haremos la búsqueda de préstamos por ID directamente y usando la relación.
    
    // Primero, obtener IDs de clientes que coinciden con la búsqueda
    const matchedClientIds = clients?.map(c => c.id) || [];
    
    let loansQuery = supabase
      .from("loans")
      .select(`
        id, 
        amount, 
        status,
        clients(full_name)
      `)
      .eq("user_id", user.id);

    // Filter either by loan ID starting with query OR loan belongs to a matched client
    if (matchedClientIds.length > 0) {
      loansQuery = loansQuery.or(`id.textSearch.'${query}:*',client_id.in.(${matchedClientIds.join(',')})`);
    } else {
      // If no clients matched, just search by loan ID using cast to text
      // Note: id is UUID. We can search by cast using ilike in Postgrest if we had a view. 
      // For now, we will fetch loans where client_id is matching (handled above). 
      // Supabase JS doesn't support casting UUID to text for ilike directly.
      // A safe way is to search by exactly matching a UUID if it's a valid UUID, otherwise don't search loans by ID.
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);
      if (isValidUUID) {
         loansQuery = loansQuery.eq("id", query);
      } else {
         // Return no loans if not a UUID and no client matched
         return NextResponse.json({ clients: clients || [], loans: [] });
      }
    }

    const { data: loans, error: loansError } = await loansQuery.limit(5);

    if (loansError) {
      console.error("Error searching loans:", loansError);
      throw loansError;
    }

    return NextResponse.json({
      clients: clients || [],
      loans: loans || [],
    });
  } catch (error: any) {
    console.error("Error en search API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
