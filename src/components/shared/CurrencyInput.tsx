import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (value !== undefined && value !== null) {
        setDisplayValue(formatAsCurrency(value.toString()));
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const formatAsCurrency = (val: string) => {
      const digits = val.replace(/\D/g, "");
      if (!digits) return "";
      
      const num = parseInt(digits, 10);
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(num);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      setDisplayValue(formatAsCurrency(raw));
      
      if (onChange) {
        onChange(raw ? parseInt(raw, 10) : 0);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        className={className}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
