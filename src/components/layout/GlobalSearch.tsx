"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, User, HandCoins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  clients: {
    id: string;
    full_name: string;
    identification: string;
  }[];
  loans: {
    id: string;
    amount: number;
    status: string;
    clients: { full_name: string };
  }[];
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult>({ clients: [], loans: [] });
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 2) {
        setResults({ clients: [], loans: [] });
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (query.length >= 2) setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const hasResults = results.clients.length > 0 || results.loans.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm sm:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar préstamos o clientes..."
          className="w-[300px] pl-9 lg:w-[400px] bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary transition-all"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 mt-2 w-[300px] lg:w-[400px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {!isLoading && !hasResults && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {results.clients.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Clientes
                </div>
                {results.clients.map((client) => (
                  <button
                    key={client.id}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleNavigate(`/clients/${client.id}`)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{client.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{client.identification}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.clients.length > 0 && results.loans.length > 0 && (
              <div className="h-px bg-border my-1" />
            )}

            {results.loans.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Préstamos
                </div>
                {results.loans.map((loan) => (
                  <button
                    key={loan.id}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleNavigate(`/loans/${loan.id}`)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                      <HandCoins className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <p className="truncate font-medium">{loan.clients.full_name}</p>
                        <p className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{loan.id.substring(0, 6)}</p>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(loan.amount)} • {loan.status}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
