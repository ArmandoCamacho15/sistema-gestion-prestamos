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

function getEntityName(log: AuditLog): string {
  const details = log.details as any;
  if (!details) return "";

  const record = log.action === "UPDATE" ? details.new : details;

  if (log.entity_type === "clients") {
    return record?.name || "—";
  }
  if (log.entity_type === "loans") {
    const amount = record?.amount
      ? `$${Number(record.amount).toLocaleString("es-CO")}`
      : "";
    return amount ? `Monto: ${amount}` : "—";
  }
  if (log.entity_type === "installments") {
    const amount = record?.total_amount
      ? `$${Number(record.total_amount).toLocaleString("es-CO")}`
      : "";
    return amount ? `Cuota: ${amount}` : "—";
  }
  if (log.entity_type === "capital_transactions") {
    const type = record?.type === "inyeccion" ? "Inyección" : "Retiro";
    const amount = record?.amount
      ? `$${Number(record.amount).toLocaleString("es-CO")}`
      : "";
    return amount ? `${type}: ${amount}` : "—";
  }
  if (log.entity_type === "settings") {
    return `${record?.key || "—"} → ${record?.value ?? "—"}`;
  }
  return "—";
}

function getChangeDescription(log: AuditLog): string | null {
  if (log.action !== "UPDATE") return null;
  const details = log.details as any;
  if (!details?.old || !details?.new) return null;

  const changes: string[] = [];
  const skipKeys = ["updated_at", "created_at", "user_id", "id"];

  for (const key of Object.keys(details.new)) {
    if (skipKeys.includes(key)) continue;
    if (JSON.stringify(details.old[key]) !== JSON.stringify(details.new[key])) {
      changes.push(
        `${key}: "${details.old[key] ?? "—"}" → "${details.new[key] ?? "—"}"`
      );
    }
  }

  return changes.length > 0 ? changes.slice(0, 3).join(" | ") : null;
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
      getEntityName(log).toLowerCase().includes(q) ||
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
                const entityName = getEntityName(log);
                const changeDesc = getChangeDescription(log);
                let dateStr = "—";
                try {
                  dateStr = format(parseISO(log.created_at), "dd MMM yyyy, HH:mm:ss", { locale: es });
                } catch {}

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 py-3 hover:bg-muted/30 transition-colors rounded-lg px-2"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {ENTITY_LABELS[log.entity_type] || log.entity_type}
                        </span>
                        {entityName && (
                          <span className="text-sm text-muted-foreground truncate">
                            — {entityName}
                          </span>
                        )}
                      </div>
                      {changeDesc && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono bg-muted/50 rounded px-2 py-0.5 truncate">
                          {changeDesc}
                        </p>
                      )}
                      {log.action === "DELETE" && (
                        <p className="text-xs text-red-400/80 mt-0.5">
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
