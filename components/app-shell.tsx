"use client";

import { BarChart3, Cpu, Home, Laptop, Menu } from "lucide-react";
import { BrandedBackground } from "@/components/branded-background";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export function AppShell({ children, compact = false }: AppShellProps) {
  const pathname = usePathname();

  return (
    <BrandedBackground variant={compact ? "hero" : "workspace"}>
      {compact ? (
        children
      ) : (
        <div className="min-h-screen lg:pl-72">
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/70 bg-white/[0.76] px-4 py-5 shadow-[18px_0_60px_rgba(36,39,44,0.075)] backdrop-blur-2xl lg:block">
            <Link className="group flex items-center gap-3 rounded-lg px-2 py-2 transition duration-300 hover:bg-white/75" href="/">
              <div className="flex size-11 items-center justify-center rounded-lg bg-mahindra-red text-white shadow-[0_14px_32px_rgba(215,25,32,0.22)] transition duration-300 group-hover:-translate-y-0.5">
                <Cpu size={21} />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-mahindra-ink">
                  Procurement Assistant
                </p>
                <p className="mt-0.5 text-xs font-semibold text-zinc-500">
                  Enterprise workspace
                </p>
              </div>
            </Link>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => (
                <SidebarLink
                  active={getNavActiveState(pathname, item.href)}
                  href={item.href}
                  icon={item.icon}
                  key={item.href}
                  label={item.label}
                />
              ))}
            </nav>

            <div className="absolute inset-x-4 bottom-5 rounded-lg border border-white/80 bg-white/[0.58] p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                Demo mode
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-mahindra-ink">
                Local deterministic workflow. No real emails or paid APIs.
              </p>
            </div>
          </aside>

          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/[0.82] px-4 py-3 shadow-[0_12px_34px_rgba(36,39,44,0.06)] backdrop-blur-2xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link className="flex items-center gap-2" href="/">
                <div className="flex size-9 items-center justify-center rounded-lg bg-mahindra-red text-white shadow-[0_10px_24px_rgba(215,25,32,0.18)]">
                  <Cpu size={18} />
                </div>
                <span className="text-sm font-black text-mahindra-ink">
                  Procurement Assistant
                </span>
              </Link>
              <Menu className="text-zinc-500" size={20} />
            </div>
            <nav className="mt-3 grid grid-cols-3 gap-2">
              {navItems.map((item) => (
                <MobileNavLink
                  active={getNavActiveState(pathname, item.href)}
                  href={item.href}
                  icon={item.icon}
                  key={item.href}
                  label={item.shortLabel}
                />
              ))}
            </nav>
          </header>

          <div className="min-h-screen">{children}</div>
        </div>
      )}
    </BrandedBackground>
  );
}

const navItems = [
  {
    href: "/",
    label: "Home",
    shortLabel: "Home",
    icon: Home
  },
  {
    href: "/requirements",
    label: "Hardware Procurement",
    shortLabel: "Hardware",
    icon: Laptop
  },
  {
    href: "/advisory",
    label: "Procurement Advisory",
    shortLabel: "Advisory",
    icon: BarChart3
  }
];

function SidebarLink({
  active,
  href,
  icon: Icon,
  label
}: {
  active: boolean;
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition duration-300 ${
        active
          ? "bg-mahindra-ink text-white shadow-[0_16px_36px_rgba(36,39,44,0.18)]"
          : "text-zinc-600 hover:bg-white/75 hover:text-mahindra-ink hover:shadow-[0_12px_28px_rgba(36,39,44,0.07)]"
      }`}
      href={href}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-md transition duration-300 group-hover:-translate-y-0.5 ${
          active ? "bg-white/14 text-white" : "bg-zinc-100 text-mahindra-red"
        }`}
      >
        <Icon size={18} />
      </span>
      {label}
    </Link>
  );
}

function MobileNavLink({
  active,
  href,
  icon: Icon,
  label
}: {
  active: boolean;
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      className={`flex min-h-10 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-bold transition duration-300 ${
        active
          ? "border-mahindra-red bg-mahindra-red text-white shadow-[0_10px_22px_rgba(215,25,32,0.18)]"
          : "border-white/80 bg-white/[0.78] text-zinc-600 hover:border-mahindra-red hover:text-mahindra-red"
      }`}
      href={href}
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}

function getNavActiveState(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/requirements") {
    return ["/requirements", "/recommendations", "/rfq"].some((route) =>
      pathname.startsWith(route)
    );
  }

  return pathname.startsWith(href);
}
