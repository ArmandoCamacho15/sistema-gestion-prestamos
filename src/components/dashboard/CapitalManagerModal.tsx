"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
import { formatCurrency, formatLocalYYYYMMDD } from "@/lib/formatters";

const capitalSchema = z.object({
  amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  type: z.enum(["inyeccion", "retiro"]),
  date: z.string().min(1, "Selecciona una fecha"),
  notes: z.string().optional(),
});

type CapitalFormValues = z.infer<typeof capitalSchema>;

export function CapitalManagerModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(capitalSchema),
    defaultValues: {
      amount: 0,
      type: "inyeccion" as "inyeccion" | "retiro",
      date: formatLocalYYYYMMDD(new Date()),
      notes: "",
    },
  });

  async function onSubmit(data: CapitalFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al procesar la transacción");
      }

      toast.success("Transacción exitosa", {
        description: `Se registró el ${data.type} por ${formatCurrency(data.amount)}.`,
      });
      
      setOpen(false);
      form.reset();
      
      // Invalidar todas las querys del dashboard para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Gestionar Capital
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gestionar Capital Propio</DialogTitle>
          <DialogDescription>
            Registra cuando inyectas nuevo dinero al negocio o cuando retiras ganancias para tu uso personal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Transacción</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inyeccion">Inyección (Ingreso de Capital)</SelectItem>
                      <SelectItem value="retiro">Retiro (Sacar Ganancias)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                    type="number"
                    placeholder="Ej: 5000000"
                    {...field}
                    value={field.value as number}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Inversión inicial o Retiro fin de año" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Transacción"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
