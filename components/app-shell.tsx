"use client";

import { Cpu } from "lucide-react";
import { BrandedBackground } from "@/components/branded-background";
import Link from "next/link";

type AppShellProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export function AppShell({ children, compact = false }: AppShellProps) {
  return (
    <BrandedBackground variant={compact ? "hero" : "workspace"}>
      {!compact && (
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/[0.88] shadow-[0_10px_34px_rgba(36,39,44,0.06)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link className="flex items-center gap-3" href="/">
              <div className="flex size-9 items-center justify-center rounded-md bg-mahindra-red text-white shadow-[0_10px_24px_rgba(215,25,32,0.2)]">
                <Cpu size={19} />
              </div>
              <div>
                <p className="text-sm font-bold text-mahindra-ink">
                  Procurement Assistant
                </p>
              </div>
            </Link>
            <nav className="grid w-full grid-cols-2 gap-2 text-sm font-bold text-mahindra-ink sm:flex sm:w-auto sm:items-center">
              <Link className="secondary-button px-3 py-2" href="/requirements">
                Hardware
              </Link>
              <Link className="secondary-button px-3 py-2" href="/advisory">
                Advisory
              </Link>
            </nav>
          </div>
        </header>
      )}
      {children}
    </BrandedBackground>
  );
}
