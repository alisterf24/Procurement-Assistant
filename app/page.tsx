"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function LandingPage() {
  return (
    <AppShell compact>
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-5 py-10">
        <section className="w-full max-w-xl rounded-lg border border-white/80 bg-white/[0.9] p-6 text-center shadow-[0_18px_56px_rgba(36,39,44,0.1)] backdrop-blur-2xl sm:p-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-mahindra-ink md:text-5xl">
            Procurement Assistant
          </h1>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link className="primary-button min-h-12 w-full" href="/requirements">
              Hardware Procurement
            </Link>
            <Link className="secondary-button min-h-12 w-full" href="/advisory">
              Procurement Advisory
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
