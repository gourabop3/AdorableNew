"use client";

import { AVAILABLE_MODELS } from "@/lib/models";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

export function ModelSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = AVAILABLE_MODELS.find((m) => m.key === value);

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-2 px-2 text-xs bg-transparent border-none hover:bg-gray-100 hover:bg-opacity-50 shadow-none"
            style={{ boxShadow: "none" }}
            aria-label="Model selector"
          >
            <span className="truncate max-w-[10rem] sm:max-w-[14rem]">
              {current?.label ?? value}
            </span>
            <ChevronDownIcon className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[8rem] !shadow-none border border-gray-200"
          style={{ boxShadow: "none" }}
        >
          {AVAILABLE_MODELS.map((m) => (
            <DropdownMenuItem
              key={m.key}
              onClick={(e) => {
                e.preventDefault();
                onChange(m.key);
              }}
              className="gap-2 text-xs"
            >
              {m.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}