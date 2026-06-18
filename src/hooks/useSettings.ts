import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserSettings {
  operating_expenses: number;
  provision_mora: number;
  grace_days: number;
  max_active_loans: number;
  min_liquidity_percent: number;
}

export const defaultSettings: UserSettings = {
  operating_expenses: 20,
  provision_mora: 10,
  grace_days: 15,
  max_active_loans: 2,
  min_liquidity_percent: 30,
};

async function fetchSettings(): Promise<UserSettings> {
  const res = await fetch("/api/settings");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al cargar configuración");
  }
  return res.json();
}

async function updateSettings(data: UserSettings): Promise<void> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al guardar configuración");
  }
}

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return {
    ...query,
    updateSettings: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
