"use client";

import Link from "next/link";
import Image from "next/image";
import VibeLogo from "@/vibe-logo.svg";
import { UserButtonWithBilling } from "@/components/user-button-with-billing";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src={VibeLogo} alt="Vibe" width={24} height={24} />
            <span className="text-sm font-semibold tracking-tight">Vibe</span>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
              <Link href="/docs" className="hover:text-black dark:hover:text-white transition-colors">Docs</Link>
              <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            </nav>
            <UserButtonWithBilling />
          </div>
        </div>
      </div>
    </header>
  );
}