"use client";

import { Input } from "@/components/ui/input";
import { formatAngka } from "@/lib/format";

const MAX_DIGITS = 12; // 999.999.999.999

export function MoneyInput({
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      autoComplete="off"
      value={value ? formatAngka(Number(value)) : ""}
      onChange={(event) => {
        const digits = event.target.value
          .replace(/\D/g, "")
          .replace(/^0+(?=\d)/, "")
          .slice(0, MAX_DIGITS);

        onValueChange(digits);
      }}
    />
  );
}
