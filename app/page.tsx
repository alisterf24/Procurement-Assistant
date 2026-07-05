"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Bot, ClipboardList, FileText, LockKeyhole, Mail, ShieldCheck, Star, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useDemoState } from "@/lib/use-demo-state";
import { useState } from "react";

const DEMO_EMAIL = "procurement.manager@mahindra.com";

export default function LoginPage() {
  const router = useRouter();
  const { resetDemo } = useDemoState();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetDemo();
    localStorage.setItem("mm-sourcing-user", email.trim() || DEMO_EMAIL);
    router.push("/requirements");
  }

  return (
    <AppShell compact>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10">
        <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="agent-status-badge">
              <ShieldCheck size={18} />
              Demo-only enterprise prototype
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-mahindra-ink md:text-6xl">
                M&M AI Sourcing Assistant
              </h1>
              <p className="text-xl font-semibold text-mahindra-red">
                AI-powered Laptop Procurement Sourcing Event Assistant
              </p>
              <p className="max-w-2xl text-lg leading-8 text-zinc-600">
                A simulated sourcing workspace for laptop procurement managers,
                with deterministic supplier scoring, mock RFQ drafting, and no
                external AI, email, logo, or authentication services.
              </p>
            </div>
            <div className="grid max-w-3xl grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                { label: "Requirement intake", icon: ClipboardList },
                { label: "Supplier scoring", icon: Users },
                { label: "RFQ drafting", icon: FileText },
                { label: "Simulated AI Agent", icon: Bot }
              ].map(({ label, icon: Icon }) => (
                  <div
                    className="group rounded-lg border border-white/70 bg-white/[0.84] p-3 text-sm font-bold text-mahindra-charcoal shadow-[0_16px_44px_rgba(36,39,44,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-red-100 hover:bg-white/[0.95] hover:shadow-[0_22px_58px_rgba(36,39,44,0.12)] sm:p-4"
                    key={label}
                  >
                    <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-red-50 text-mahindra-red transition duration-300 group-hover:bg-mahindra-red group-hover:text-white sm:mb-3 sm:size-9">
                      <Icon size={18} />
                    </div>
                    {label}
                  </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-white/80 bg-white/[0.91] p-6 shadow-[0_28px_80px_rgba(36,39,44,0.16)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_34px_92px_rgba(36,39,44,0.2)]"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="field-label flex items-center gap-2">
                  <Star className="text-mahindra-red" size={14} />
                  Secure demo access
                </p>
                <h2 className="mt-2 text-2xl font-bold text-mahindra-ink">
                  Procurement manager login
                </h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-red-50 text-mahindra-red shadow-inner">
                <LockKeyhole size={22} />
              </div>
            </div>

            <label className="block">
              <span className="field-label">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-5 text-zinc-500" size={18} />
                <input
                  className="field-input pl-10"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-label="Demo email"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="field-label">Password</span>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter any value"
                aria-label="Demo password"
                autoComplete="current-password"
              />
            </label>

            <button className="primary-button mt-6 w-full" type="submit">
              Continue to sourcing workspace
              <ArrowRight size={18} />
            </button>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
