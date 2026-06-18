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

    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      return NextResponse.json(
        { error: "Error al cargar configuración" },
        { status: 500 }
      );
    }

    // Default settings format
    const defaultSettings = {
      operating_expenses: 20,
      provision_mora: 10,
      grace_days: 15,
      max_active_loans: 2,
      min_liquidity_percent: 30,
    };

    const formattedSettings = { ...defaultSettings };

    settings?.forEach((setting) => {
      if (formattedSettings.hasOwnProperty(setting.key)) {
        // @ts-ignore
        formattedSettings[setting.key] = Number(setting.value);
      }
    });

    return NextResponse.json(formattedSettings);
  } catch (error: any) {
    console.error("Error en settings API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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
    
    // Prepare the upsert payload
    const upsertData = Object.keys(body).map((key) => ({
      user_id: user.id,
      key: key,
      value: body[key],
      description: `Configuración para ${key}`,
    }));

    const { error: upsertError } = await supabase
      .from("settings")
      .upsert(upsertData, { onConflict: "key,user_id" });

    if (upsertError) {
      console.error("Error upserting settings:", upsertError);
      return NextResponse.json(
        { error: "Error al guardar configuración" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en POST settings API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
