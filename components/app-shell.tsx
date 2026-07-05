"use client";

import { Cpu, LogOut } from "lucide-react";
import { BrandedBackground } from "@/components/branded-background";
import { clearWorkflowStorage } from "@/lib/use-demo-state";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AppShellProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export function AppShell({ children, compact = false }: AppShellProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(localStorage.getItem("mm-sourcing-user") ?? "");
  }, []);

  function handleLogout() {
    localStorage.removeItem("mm-sourcing-user");
    clearWorkflowStorage();
    router.push("/");
  }

  return (
    <BrandedBackground variant={compact ? "hero" : "workspace"}>
      {!compact && (
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/[0.88] shadow-[0_10px_34px_rgba(36,39,44,0.06)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
            <Link className="flex items-center gap-3" href="/requirements">
              <div className="flex size-10 items-center justify-center rounded-md bg-mahindra-red text-white shadow-[0_14px_30px_rgba(215,25,32,0.24)]">
                <Cpu size={21} />
              </div>
              <div>
                <p className="text-sm font-bold text-mahindra-ink">
                  M&M AI Sourcing Assistant
                </p>
                <p className="text-xs text-zinc-500">
                  AI-powered Laptop Procurement Sourcing Event Assistant
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {email && (
                <div className="hidden text-right lg:block">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Logged in as
                  </p>
                  <p className="text-sm font-semibold text-mahindra-ink">{email}</p>
                </div>
              )}
              <button
                className="secondary-button px-3 py-2"
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>
      )}
      {children}
    </BrandedBackground>
  );
}
