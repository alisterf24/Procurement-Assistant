"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  ArrowRight,
  BarChart3,
  FileCheck2,
  Laptop,
  MailCheck,
  Network
} from "lucide-react";

export default function LandingPage() {
  return (
    <AppShell compact>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8">
        <section className="w-full">
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="agent-status-badge">
                <Network size={15} />
                Enterprise procurement workspace
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-mahindra-ink sm:text-6xl lg:text-7xl">
                Procurement Assistant
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-zinc-600 sm:text-lg">
                Source laptop suppliers, prepare RFQs, and compare vendor quotations with a focused decision-support workflow.
              </p>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
                <CapabilityItem icon={Network} label="Supplier discovery" />
                <CapabilityItem icon={MailCheck} label="RFQ generation" />
                <CapabilityItem icon={BarChart3} label="Quotation comparison" />
                <CapabilityItem icon={FileCheck2} label="Decision support" />
              </div>
            </div>

            <div className="grid gap-4">
              <ActionCard
                description="Create a laptop requirement, review recommended suppliers, and generate a supplier-ready RFQ."
                href="/requirements"
                icon={Laptop}
                label="Start sourcing"
                title="Hardware Procurement"
                tone="primary"
              />
              <ActionCard
                description="Upload received quotations and compare price, delivery, warranty, risk, and commercial terms."
                href="/advisory"
                icon={BarChart3}
                label="Compare quotes"
                title="Procurement Advisory"
                tone="secondary"
              />
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function CapabilityItem({
  icon: Icon,
  label
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/75 bg-white/[0.64] px-4 py-3 text-sm font-bold text-mahindra-ink shadow-[0_10px_26px_rgba(36,39,44,0.055)] backdrop-blur-xl">
      <span className="flex size-8 items-center justify-center rounded-md bg-red-50 text-mahindra-red">
        <Icon size={17} />
      </span>
      {label}
    </div>
  );
}

function ActionCard({
  description,
  href,
  icon: Icon,
  label,
  title,
  tone
}: {
  description: string;
  href: string;
  icon: React.ElementType;
  label: string;
  title: string;
  tone: "primary" | "secondary";
}) {
  return (
    <Link
      className="group relative overflow-hidden rounded-xl border border-white/80 bg-white/[0.84] p-6 shadow-[0_24px_70px_rgba(36,39,44,0.12)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-red-100 hover:bg-white hover:shadow-[0_30px_90px_rgba(36,39,44,0.16)] sm:p-7"
      href={href}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mahindra-red via-red-300 to-transparent opacity-80" />
      <div className="flex items-start justify-between gap-5">
        <div
          className={`flex size-12 items-center justify-center rounded-lg shadow-inner transition duration-300 group-hover:-translate-y-0.5 ${
            tone === "primary"
              ? "bg-mahindra-red text-white"
              : "bg-mahindra-ink text-white"
          }`}
        >
          <Icon size={24} />
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-mahindra-ink transition duration-300 group-hover:bg-mahindra-red group-hover:text-white">
          <ArrowRight size={19} />
        </span>
      </div>
      <h2 className="mt-6 text-2xl font-black tracking-tight text-mahindra-ink">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-zinc-600">
        {description}
      </p>
      <p className="mt-5 inline-flex items-center gap-2 text-sm font-black text-mahindra-red">
        {label}
        <ArrowRight size={16} />
      </p>
    </Link>
  );
}
