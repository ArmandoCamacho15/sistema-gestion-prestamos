# 📊 Sistema de Gestión de Préstamos

Una aplicación web completa para la gestión de préstamos personales, construida con Next.js 15, Supabase y shadcn/ui. Diseñada para prestamistas independientes que necesitan llevar un control profesional de su cartera de clientes y préstamos.

**🌍 URL de Producción:** [https://prestamos-app.vercel.app](https://prestamos-app.vercel.app)

## ✨ Características Principales

- **Dashboard Financiero** con KPIs en tiempo real (Capital disponible, Capital en la calle, Intereses ganados, Ganancia neta, Retorno esperado, Cartera en riesgo)
- **Gestión de Clientes** — CRUD completo con validación de identificación única
- **Gestión de Préstamos** — Simulador en tiempo real con tasas Flat y Sistema Francés (Amortización)
- **Registro de Pagos** — Soporte para pagos parciales e interés moratorio
- **Cronograma de Cuotas** — Tabla detallada con estado y exportación a PDF
- **Proyección de Recaudo** — Gráfico de barras de los próximos 6 meses
- **Gestión de Capital** — Registro de inyecciones y retiros de capital propio
- **Módulo de Auditoría** — Historial completo de todos los cambios del sistema
- **Configuración Avanzada** — Gastos operativos, provisión mora, días de gracia, límites
- **Modo Oscuro / Claro** — Soporte completo de tema
- **Diseño Responsive** — Funciona en móvil, tablet y escritorio

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| UI Components | shadcn/ui + Radix UI |
| Estilado | Tailwind CSS |
| Formularios | React Hook Form + Zod |
| Estado servidor | TanStack Query (React Query) |
| Gráficas | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Notificaciones | Sonner |
| Lenguaje | TypeScript |

## 🚀 Configuración e Instalación

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com) (gratuita)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd "Sistema de Gestión de Préstamos"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y rellena los valores:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Nunca subas `.env.local` a Git.** Ya está en `.gitignore`.

### 4. Configurar Supabase

Accede al **SQL Editor** de tu proyecto en Supabase y ejecuta las migraciones **en orden**:

| Migración | Descripción |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | Tablas base: clientes, préstamos, cuotas, pagos |
| `supabase/migrations/002_rls_policies.sql` | Políticas de seguridad Row Level Security |
| `supabase/migrations/003_views_kpis.sql` | Vistas para KPIs del Dashboard |
| `supabase/migrations/004_functions.sql` | Funciones SQL (mora, cronograma) |
| `supabase/migrations/005_capital_management.sql` | Tabla capital_transactions |
| `supabase/migrations/006_portfolio_summary.sql` | Vista de resumen de portafolio |
| `supabase/migrations/007_settings_fix.sql` | Tabla de configuración por usuario |
| `supabase/migrations/008_dashboard_extras.sql` | Funciones auxiliares del dashboard |
| `supabase/migrations/009_audit_logs.sql` | Tabla y triggers de auditoría |

> 💡 Puedes copiar cada archivo y pegarlo directamente en el SQL Editor de Supabase.

### 5. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Páginas de login/registro
│   ├── (dashboard)/     # Páginas principales de la app
│   │   ├── dashboard/   # Dashboard con KPIs
│   │   ├── clients/     # Gestión de clientes
│   │   ├── loans/       # Gestión de préstamos
│   │   ├── settings/    # Configuración del sistema
│   │   ├── auditoria/   # Módulo de auditoría
│   │   └── ayuda/       # Centro de ayuda
│   └── api/             # API Routes (Next.js)
├── components/
│   ├── dashboard/       # Componentes del Dashboard
│   ├── clients/         # Componentes de Clientes
│   ├── loans/           # Componentes de Préstamos
│   ├── payments/        # Componentes de Pagos
│   ├── installments/    # Tabla de cuotas
│   ├── layout/          # Sidebar, Header, Nav
│   └── ui/              # Componentes base (shadcn/ui)
├── hooks/               # Custom hooks (React Query)
├── lib/                 # Utilidades, formatters, Supabase client
└── supabase/
    └── migrations/      # Archivos SQL de migración
```

## 🔑 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Compilar para producción
npm run start      # Iniciar servidor de producción
npm run typecheck  # Verificar tipos TypeScript (sin errores)
npm run lint       # Verificar ESLint
npm run test       # Ejecutar tests unitarios
```

## 🔒 Seguridad

- Toda la data está protegida por **Row Level Security (RLS)** de Supabase.
- Cada usuario solo ve y modifica su propia información.
- Las cookies de sesión se manejan de forma segura con `@supabase/ssr`.
- Variables de entorno críticas (`SERVICE_ROLE_KEY`) nunca se exponen al cliente.

## 📖 Guía de Uso Rápido

1. **Crea un cliente** en `/clients/new` con nombre e identificación.
2. **Crea un préstamo** en `/loans/new`, selecciona el cliente, configura monto, tasa, plazo y frecuencia. El simulador muestra el cronograma en tiempo real.
3. **Registra pagos** haciendo clic en "Registrar Pago" en el cronograma del préstamo.
4. **Gestiona tu capital** con el botón "Gestionar Capital" en el Dashboard.
5. **Configura el sistema** en `/settings` para ajustar gastos operativos, provisión mora y días de gracia.
6. **Revisa la auditoría** en `/auditoria` para ver el historial completo de cambios.

## 🏗️ Convención de Commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) en español:

```
feat(módulo): descripción de nueva funcionalidad
fix(módulo): descripción de corrección
docs(readme): actualizar documentación
refactor(componente): mejora sin cambio de comportamiento
```

## 📄 Licencia

Proyecto privado. Todos los derechos reservados.
