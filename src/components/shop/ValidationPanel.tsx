"use client";

import { CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { validateLayout } from "@/data/validate";
import { useShop } from "@/hooks/useShop";

/** Live layout validation — the same checks the `npm run validate` stress test runs. */
export function ValidationPanel() {
  const { layout } = useShop();
  const { checks, errors, warnings } = useMemo(() => validateLayout(layout), [layout]);
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
        <ShieldAlert size={14} /> Layout check
        <span className={`ml-auto rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${errors.length ? "bg-pink text-white" : warnings.length ? "bg-gold/40 text-navy" : "bg-teal-soft text-[#1f6f67]"}`}>
          {errors.length ? `${errors.length} error` : warnings.length ? `${warnings.length} to review` : "all clear"}
        </span>
      </h3>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[11.5px] leading-snug">
            {c.ok ? (
              <CheckCircle2 size={14} className="mt-0.5 flex-none text-teal" />
            ) : (
              <TriangleAlert size={14} className={`mt-0.5 flex-none ${c.level === "error" ? "text-pink" : "text-gold"}`} />
            )}
            <span>
              <span className="font-medium">{c.label}</span>
              <span className="block text-navy/55">{c.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
