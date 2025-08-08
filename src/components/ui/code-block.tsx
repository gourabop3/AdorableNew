"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  className,
  ...props
}: CodeBlockCodeProps) {
  const { theme: browserTheme } = useTheme();

  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const theme = browserTheme === "dark" ? "github-dark" : "github-light";

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }

      const html = await codeToHtml(code, { lang: language, theme });
      setHighlightedHtml(html);
    }
    highlight();
  }, [code, language, theme]);

  const classNames = cn(
    "relative w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    className,
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed", e);
    }
  }

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <div className={classNames} {...props}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 rounded border px-2 py-1 text-xs bg-white/70 dark:bg-black/40 hover:bg-white/90 dark:hover:bg-black/60 backdrop-blur-sm"
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <div
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  ) : (
    <div className={classNames} {...props}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 rounded border px-2 py-1 text-xs bg-white/70 dark:bg-black/40 hover:bg-white/90 dark:hover:bg-black/60 backdrop-blur-sm"
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
