"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  HandCoins,
  CreditCard,
  BarChart3,
  Settings,
  ChevronRight,
  ClipboardList,
  Wallet,
} from "lucide-react";

const sections = [
  {
    icon: UserPlus,
    title: "1. Cómo registrar un cliente",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    steps: [
      "Ve a la sección Clientes en el menú lateral.",
      "Haz clic en el botón «Nuevo Cliente» (esquina superior derecha).",
      "Completa los campos: Nombre completo (obligatorio), Número de identificación (obligatorio y único), Teléfono, Correo y Dirección.",
      "Haz clic en «Guardar». El cliente aparecerá en la lista de inmediato.",
    ],
  },
  {
    icon: HandCoins,
    title: "2. Cómo crear un préstamo y simular cuotas",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    steps: [
      "Ve a Préstamos → «Nuevo Préstamo».",
      "Selecciona el cliente en el buscador.",
      "Ingresa el monto, plazo (meses), tasa de interés y tipo de tasa (Flat o Sistema Francés).",
      "El panel lateral muestra en tiempo real la cuota, el interés total y el cronograma completo.",
      "Haz clic en «Crear Préstamo». El sistema genera el cronograma y redirige al detalle del préstamo.",
    ],
  },
  {
    icon: CreditCard,
    title: "3. Cómo registrar pagos y ver el cronograma",
    color: "text-green-500",
    bg: "bg-green-500/10",
    steps: [
      "Abre un préstamo y ve a la tabla «Cronograma de Pagos».",
      "Haz clic en «Registrar Pago» junto a la cuota que corresponde.",
      "El sistema pre-llena el monto esperado; puedes modificarlo si es un pago parcial.",
      "Si la cuota está en mora, verás los días de retraso y un campo opcional de interés moratorio.",
      "Confirma el pago. La cuota cambia a «Pagada» y el saldo se actualiza al instante.",
      "Para exportar el cronograma en PDF, usa el botón «Exportar PDF» en la parte superior de la página del préstamo.",
    ],
  },
  {
    icon: BarChart3,
    title: "4. Significado de los indicadores del Dashboard",
    color: "text-primary",
    bg: "bg-primary/10",
    steps: [
      "Capital Disponible (Liquidez): Dinero real que tienes disponible para nuevos préstamos. = Capital inyectado − Capital en la calle + Intereses ganados.",
      "Capital en la Calle (Cartera): Saldo del capital principal que tus clientes aún deben. Sube cuando prestas y baja cuando cobras cuotas.",
      "Intereses Ganados: Suma de todas las ganancias reales obtenidas de cuotas pagadas hasta hoy.",
      "Retorno Esperado: Intereses proyectados que cobrarás de los préstamos activos.",
      "Cartera en Riesgo: Porcentaje de préstamos que están en estado moroso. Si supera el 10% aparece en rojo.",
    ],
  },
  {
    icon: Settings,
    title: "5. Cómo configurar parámetros del sistema",
    color: "text-muted-foreground",
    bg: "bg-muted",
    steps: [
      "Ve a la sección «Configuración» en el menú lateral.",
      "Ajusta los parámetros según tu modelo de negocio: Gastos operativos (% sobre intereses), Provisión mora (%), Días de gracia, Máximo préstamos por cliente, Liquidez mínima requerida (%).",
      "Haz clic en «Guardar Configuración». Los cambios se aplican inmediatamente.",
      "Desde la misma pantalla puedes alternar entre el modo oscuro y claro.",
    ],
  },
  {
    icon: Wallet,
    title: "6. Gestionar Capital y Ganancia Neta",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    steps: [
      "Usa el botón «Gestionar Capital» en el Dashboard para registrar Inyecciones (cuando aportas dinero de tu bolsillo) o Retiros (cuando retiras ganancias).",
      "La «Ganancia Neta» que se muestra en el Dashboard es la suma de los intereses cobrados en el mes menos el porcentaje que hayas definido para Gastos Operativos y Provisión de Mora en la Configuración.",
      "El capital de Gastos y Provisión no se retira automáticamente. Tú decides cuándo hacer físicamente el Retiro de Capital.",
    ],
  },
  {
    icon: ClipboardList,
    title: "7. Auditoría e Historial",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    steps: [
      "Ve a la sección «Auditoría» en el menú lateral.",
      "Allí verás el historial detallado de todo lo que ocurre en el sistema (Creación, Actualización, Eliminación).",
      "Esto sirve para rastrear quién realizó cambios o recuperarse en caso de errores manuales.",
    ],
  },
];

export default function AyudaPage() {
  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centro de Ayuda</h1>
        <p className="text-muted-foreground mt-1">
          Guía de uso del Sistema de Gestión de Préstamos.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${section.bg}`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary/60" />
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">¿Necesitas más ayuda?</strong> Si encuentras algún problema,
        revisa que la SQL de migración más reciente esté aplicada en Supabase. Las migraciones están
        en la carpeta <code className="bg-muted px-1 py-0.5 rounded text-xs">supabase/migrations/</code>.
      </div>
    </div>
  );
}
