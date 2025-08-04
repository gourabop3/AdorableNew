"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { templatesMap } from "@/lib/templates";

type FrameworkSelectorProps = {
  value?: keyof typeof templatesMap;
  onChange: (value: keyof typeof templatesMap) => void;
  className?: string;
};

export function FrameworkSelector({
  value = "nextjs",
  onChange,
  className,
}: FrameworkSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-2 px-2 text-xs bg-transparent border-none hover:bg-gray-100 hover:bg-opacity-50 shadow-none"
            style={{ boxShadow: "none" }}
          >
            <Image
              src={templatesMap[value].logo}
              alt={templatesMap[value].name}
              width={16}
              height={16}
              className="opacity-90"
            />
            {templatesMap[value].name}
            <ChevronDownIcon className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[8rem] !shadow-none border border-gray-200"
          style={{ boxShadow: "none" }}
        >
          {Object.entries(templatesMap).map(([key, template]) => (
            <DropdownMenuItem
              key={key}
              onClick={(e) => {
                e.preventDefault();
                onChange(key as keyof typeof templatesMap);
              }}
              className="gap-2 text-xs"
            >
              <Image
                src={template.logo}
                alt={template.name}
                width={16}
                height={16}
                className="opacity-90"
              />
              {template.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
