"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, SettingsFormValues } from "@/lib/validations/settingsSchema";
import { useSettings, defaultSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading, isError, updateSettings, isUpdating } = useSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  async function onSubmit(data: SettingsFormValues) {
    try {
      await updateSettings(data);
      toast.success("Configuración guardada exitosamente");
    } catch (error: any) {
      toast.error(error.message || "No se pudo guardar la configuración");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Cargando parámetros...</p>
        </div>
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <div className="text-red-500">Error al cargar la configuración.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Ajusta los parámetros globales de tu sistema de préstamos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Configura el tema de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Modo Oscuro / Claro</span>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Parámetros Financieros y de Riesgo</CardTitle>
            <CardDescription>
              Estos valores afectan cómo se calculan las ganancias, la morosidad y los límites de préstamos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gastos Operativos */}
                  <FormField
                    control={form.control}
                    name="operating_expenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gastos Operativos (% sobre intereses)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Porcentaje de los intereses cobrados destinado a gastos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Provisión Mora */}
                  <FormField
                    control={form.control}
                    name="provision_mora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provisión para Mora (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Porcentaje de reserva sobre los pagos recibidos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Días de gracia */}
                  <FormField
                    control={form.control}
                    name="grace_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Días de Gracia</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Días permitidos antes de clasificar una cuota como morosa.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Máximo préstamos activos */}
                  <FormField
                    control={form.control}
                    name="max_active_loans"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máx. Préstamos Activos por Cliente</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Límite de préstamos simultáneos que puede tener un cliente.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Liquidez Mínima */}
                  <FormField
                    control={form.control}
                    name="min_liquidity_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Liquidez Mínima Requerida (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Porcentaje del capital inyectado que siempre debe quedar disponible.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isUpdating} className="w-full md:w-auto">
                  {isUpdating ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
