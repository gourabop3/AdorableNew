"use client";

import { AVAILABLE_MODELS } from "@/lib/models";

export function ModelSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      className="h-9 rounded-md border bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Model selector"
    >
      {AVAILABLE_MODELS.map((m) => (
        <option key={m.key} value={m.key}>{m.label}</option>
      ))}
    </select>
  );
}