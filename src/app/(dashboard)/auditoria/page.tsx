"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ClipboardList,
  PlusCircle,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
interface AuditLog {
  id: string;
  user_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
const ENTITY_LABELS: Record<string, string> = {
  clients: "Cliente",
  loans: "Préstamo",
  installments: "Cuota",
  capital_transactions: "Movimiento de Capital",
  settings: "Configuración",
};

const ACTION_CONFIG: Record<
  "INSERT" | "UPDATE" | "DELETE",
  { label: string; color: string; icon: React.ReactNode }
> = {
  INSERT: {
    label: "Creado",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: <PlusCircle className="h-3.5 w-3.5" />,
  },
  UPDATE: {
    label: "Actualizado",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: <Pencil className="h-3.5 w-3.5" />,
  },
  DELETE: {
    label: "Eliminado",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: <Trash2 className="h-3.5 w-3.5" />,
  },
};

function formatMoney(val: any): string {
  if (val == null || val === '') return '—';
  return `$${Number(val).toLocaleString('es-CO')}`;
}

/**
 * Genera una frase descriptiva clara en español de qué se hizo.
 * Ej: "Se creó el préstamo de $1.200.000 a 6 meses" 
 */
function getActionSummary(log: AuditLog): string {
  const details = log.details as any;
  if (!details) return `${ENTITY_LABELS[log.entity_type] || log.entity_type}`;

  const rec = log.action === 'UPDATE' ? (details.new ?? details) : details;
  const entity = ENTITY_LABELS[log.entity_type] || log.entity_type;

  // ── INSERT ──────────────────────────────────────────
  if (log.action === 'INSERT') {
    if (log.entity_type === 'clients') {
      return `Se registró el cliente "${rec.full_name || rec.name || '—'}"`;
    }
    if (log.entity_type === 'loans') {
      const amount = formatMoney(rec.amount);
      const months = rec.term_months ? `a ${rec.term_months} meses` : '';
      const rate = rec.interest_rate ? `al ${rec.interest_rate}%` : '';
      return `Se creó un préstamo de ${amount} ${rate} ${months}`.trim();
    }
    if (log.entity_type === 'installments') {
      const amount = formatMoney(rec.total_amount);
      return `Se generó la cuota #${rec.installment_number || '?'} por ${amount}`;
    }
    if (log.entity_type === 'capital_transactions') {
      const type = rec.type === 'inyeccion' ? 'Inyección de capital' : 'Retiro de capital';
      return `${type} por ${formatMoney(rec.amount)}`;
    }
    if (log.entity_type === 'payments') {
      return `Se registró un pago de ${formatMoney(rec.amount)}`;
    }
    return `Se creó un registro de ${entity}`;
  }

  // ── UPDATE ──────────────────────────────────────────
  if (log.action === 'UPDATE') {
    if (log.entity_type === 'installments') {
      const old = details.old ?? {};
      const neu = details.new ?? {};
      if (old.status !== neu.status) {
        const statusLabel: Record<string, string> = {
          paid: 'Pagada ✅',
          pending: 'Pendiente',
          overdue: 'En mora ⚠️',
          partial: 'Pago parcial',
        };
        const installNum = neu.installment_number || old.installment_number || '?';
        const from = statusLabel[old.status] || old.status || '?';
        const to = statusLabel[neu.status] || neu.status || '?';
        return `Cuota #${installNum} cambió de "${from}" a "${to}"`;
      }
      return `Se actualizó la cuota #${neu.installment_number || '?'}`;
    }
    if (log.entity_type === 'loans') {
      const old = details.old ?? {};
      const neu = details.new ?? {};
      if (old.status !== neu.status && neu.status) {
        const statusLabel: Record<string, string> = {
          active: 'Activo',
          paid: 'Pagado ✅',
          overdue: 'En mora ⚠️',
          cancelled: 'Cancelado',
        };
        return `Préstamo de ${formatMoney(neu.amount || old.amount)} cambió a "${statusLabel[neu.status] || neu.status}"`;
      }
      if (old.amount !== neu.amount) {
        return `Préstamo editado: monto de ${formatMoney(old.amount)} a ${formatMoney(neu.amount)}`;
      }
      return `Se actualizó el préstamo de ${formatMoney(neu.amount || old.amount)}`;
    }
    if (log.entity_type === 'clients') {
      const old = details.old ?? {};
      const neu = details.new ?? {};
      return `Se actualizó el cliente "${neu.full_name || old.full_name || '—'}"`;
    }
    if (log.entity_type === 'settings') {
      const old = details.old ?? {};
      const neu = details.new ?? {};
      return `Configuración "${neu.key || old.key || '—'}": "${old.value ?? '—'}" → "${neu.value ?? '—'}"`;
    }
    return `Se actualizó un registro de ${entity}`;
  }

  // ── DELETE ──────────────────────────────────────────
  if (log.action === 'DELETE') {
    if (log.entity_type === 'clients') {
      return `Se eliminó el cliente "${rec.full_name || rec.name || '—'}"`;
    }
    if (log.entity_type === 'loans') {
      return `Se eliminó el préstamo de ${formatMoney(rec.amount)}`;
    }
    if (log.entity_type === 'installments') {
      return `Se eliminó la cuota #${rec.installment_number || '?'} por ${formatMoney(rec.total_amount)}`;
    }
    if (log.entity_type === 'capital_transactions') {
      return `Se eliminó el movimiento de capital de ${formatMoney(rec.amount)}`;
    }
    return `Se eliminó un registro de ${entity}`;
  }

  return entity;
}

/**
 * Para cambios en UPDATE: muestra los campos que cambiaron de forma legible.
 */
const FIELD_LABELS: Record<string, string> = {
  amount: 'Monto',
  interest_rate: 'Tasa',
  term_months: 'Plazo (meses)',
  payment_frequency: 'Frecuencia',
  rate_type: 'Tipo de tasa',
  first_payment_date: 'Fecha primer pago',
  start_date: 'Fecha desembolso',
  status: 'Estado',
  full_name: 'Nombre',
  phone: 'Teléfono',
  email: 'Correo',
  address: 'Dirección',
};

function getChangedFields(log: AuditLog): { label: string; from: string; to: string }[] {
  if (log.action !== 'UPDATE') return [];
  const details = log.details as any;
  if (!details?.old || !details?.new) return [];

  const skipKeys = ['updated_at', 'created_at', 'user_id', 'id', 'owner_id', 'loan_id', 'client_id'];
  const changes: { label: string; from: string; to: string }[] = [];

  for (const key of Object.keys(details.new)) {
    if (skipKeys.includes(key)) continue;
    if (JSON.stringify(details.old[key]) !== JSON.stringify(details.new[key])) {
      const label = FIELD_LABELS[key] || key;
      const from = details.old[key] != null ? String(details.old[key]) : '—';
      const to = details.new[key] != null ? String(details.new[key]) : '—';
      changes.push({ label, from, to });
    }
  }
  return changes.slice(0, 4);
}


// ────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────
export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (entityFilter !== "all") params.set("entity", entityFilter);

      const res = await fetch(`/api/audit?${params.toString()}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, entityFilter]);

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ENTITY_LABELS[log.entity_type]?.toLowerCase().includes(q) ||
      getActionSummary(log).toLowerCase().includes(q) ||
      (log.entity_id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Auditoría</h1>
            <p className="text-sm text-muted-foreground">
              Historial completo de todos los movimientos y cambios del sistema.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-primary/10">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, monto..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[150px] justify-between">
                  <Filter className="h-4 w-4" />
                  {actionFilter === "all" ? "Acción: Todas" : ACTION_CONFIG[actionFilter as "INSERT" | "UPDATE" | "DELETE"].label}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActionFilter("all")}>
                  Todas las acciones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter("INSERT")}>
                  ✅ Solo Creaciones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter("UPDATE")}>
                  ✏️ Solo Actualizaciones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter("DELETE")}>
                  🗑️ Solo Eliminaciones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[170px] justify-between">
                  <ClipboardList className="h-4 w-4" />
                  {entityFilter === "all" ? "Módulo: Todos" : ENTITY_LABELS[entityFilter] || entityFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEntityFilter("all")}>
                  Todos los módulos
                </DropdownMenuItem>
                {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                  <DropdownMenuItem key={key} onClick={() => setEntityFilter(key)}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(["INSERT", "UPDATE", "DELETE"] as const).map((action) => {
          const count = logs.filter((l) => l.action === action).length;
          const cfg = ACTION_CONFIG[action];
          return (
            <Card key={action} className={`border ${cfg.color.split(" ")[0]}/20`}>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.color.split(" ")[0]}/10`}>
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{cfg.label}s</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Logs Table */}
      <Card className="border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Registro de Actividad{" "}
            <span className="text-muted-foreground font-normal text-sm ml-2">
              ({filtered.length} entradas)
            </span>
          </CardTitle>
          <CardDescription>
            Los últimos 200 movimientos del sistema, de más reciente a más antiguo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Cargando historial...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <ClipboardList className="h-8 w-8 opacity-40" />
              <p className="text-sm">No hay registros que mostrar todavía.</p>
              <p className="text-xs opacity-60">
                Los movimientos aparecerán aquí automáticamente cuando uses la app.
              </p>
            </div>
          ) : (
          <div className="divide-y divide-border/50">
              {filtered.map((log) => {
                const cfg = ACTION_CONFIG[log.action];
                const summary = getActionSummary(log);
                const changedFields = getChangedFields(log);
                let dateStr = "—";
                try {
                  dateStr = format(parseISO(log.created_at), "dd MMM yyyy, HH:mm:ss", { locale: es });
                } catch {}

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 py-3.5 hover:bg-muted/30 transition-colors rounded-lg px-2"
                  >
                    {/* Action Badge */}
                    <div className="pt-0.5 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 text-xs px-2 py-0.5 ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Descripción principal clara */}
                      <p className="text-sm font-medium leading-snug">{summary}</p>

                      {/* Chips de campos cambiados (solo en UPDATE) */}
                      {changedFields.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {changedFields.map((ch, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-xs bg-muted rounded px-2 py-0.5 text-muted-foreground"
                            >
                              <span className="font-medium text-foreground">{ch.label}:</span>
                              <span className="line-through opacity-60">{ch.from}</span>
                              <span className="mx-0.5 opacity-40">→</span>
                              <span className="text-blue-400 font-medium">{ch.to}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Aviso de eliminación */}
                      {log.action === "DELETE" && (
                        <p className="text-xs text-red-400/80">
                          ⚠️ Este registro fue eliminado permanentemente.
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 text-right">
                      {dateStr}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
