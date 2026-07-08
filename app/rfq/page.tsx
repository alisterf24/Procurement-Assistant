"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Send,
  ShieldAlert,
  Users
} from "lucide-react";
import { AgentLoadingModal } from "@/components/agent-loading-modal";
import { AppShell } from "@/components/app-shell";
import { Stepper } from "@/components/stepper";
import { laptopSuppliers, type LaptopSupplier } from "@/data/suppliers";
import { generateRFQEmail } from "@/lib/agent/procurementAgent";
import type { RFQDraft } from "@/lib/types";
import { useDemoState } from "@/lib/use-demo-state";
import { useEffect, useState } from "react";

const selectedSuppliersStorageKey = "mm-selected-laptop-suppliers";
const sentLogStorageKey = "mm-rfq-sent-log";
const defaultAiNote =
  "This RFQ draft was generated from the procurement requirement and selected supplier capabilities.";
const defaultFromEmail = "procurement.team@example.com";

type SentEmailLog = {
  from: string;
  to: string[];
  subject: string;
  body: string;
  aiNote: string;
  sentAt: string;
  supplierCount: number;
};

export default function RFQPage() {
  const router = useRouter();
  const { requirement, selectedSupplierIds, rfqDraft, setRfqDraft } = useDemoState();
  const [selectedSuppliers, setSelectedSuppliers] = useState<LaptopSupplier[]>([]);
  const [fromEmail, setFromEmail] = useState(defaultFromEmail);
  const [drafting, setDrafting] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiNote, setAiNote] = useState(defaultAiNote);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentLog, setSentLog] = useState<SentEmailLog | null>(null);

  const recipientEmails = selectedSuppliers.map((supplier) => supplier.email);
  const recipientDisplay =
    recipientEmails.length > 0 ? recipientEmails.join(", ") : "No selected supplier emails found";

  useEffect(() => {
    const nextSelectedSuppliers = getSelectedSuppliers(selectedSupplierIds);
    const generatedDraft = generateRFQEmail(requirement, nextSelectedSuppliers, defaultFromEmail);
    const nextDraft = normalizeDraft(rfqDraft ?? generatedDraft);

    setFromEmail(defaultFromEmail);
    setSelectedSuppliers(nextSelectedSuppliers);
    setSubject(nextDraft.subject);
    setBody(nextDraft.body);
    setAiNote(nextDraft.aiNote);
  }, [requirement, rfqDraft, selectedSupplierIds]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDrafting(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  function handleSend() {
    setRfqDraft({ subject, body, aiNote });
    setSending(true);

    window.setTimeout(() => {
      const nextSentLog: SentEmailLog = {
        from: fromEmail,
        to: recipientEmails,
        subject,
        body,
        aiNote,
        sentAt: new Date().toISOString(),
        supplierCount: selectedSuppliers.length
      };

      localStorage.setItem(sentLogStorageKey, JSON.stringify(nextSentLog));
      setSentLog(nextSentLog);
      setSending(false);
      setSuccess(true);
    }, 1200);
  }

  return (
    <AppShell>
      <AgentLoadingModal
        open={drafting}
        title="Drafting RFQ"
        detail="Preparing RFQ draft..."
      />
      <AgentLoadingModal
        open={sending}
        title="Recording RFQ send"
        detail="Saving simulated send summary..."
      />

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mahindra-ink/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-green-100 bg-white/[0.95] p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-green-50 text-green-700">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-mahindra-ink">
              RFQ send recorded
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Sent summary saved locally. No real email was sent.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="secondary-button w-full" onClick={() => setSuccess(false)} type="button">
                View sent summary
              </button>
              <button className="primary-button w-full" onClick={() => router.push("/requirements")} type="button">
                Start another run
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 py-6 sm:py-8">
        <Stepper current={success || sentLog ? 3 : 2} />

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="agent-status-badge">
              <Mail size={15} />
              RFQ workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-mahindra-ink md:text-4xl">
              Editable RFQ Email
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 md:text-base">
              Review and edit the RFQ draft before simulated send.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="secondary-button" onClick={() => router.push("/recommendations")} type="button">
              <ArrowLeft size={18} />
              Back to supplier selection
            </button>
            <button
              className="primary-button"
              disabled={selectedSuppliers.length === 0 || sending}
              onClick={handleSend}
              type="button"
            >
              <Send size={18} />
              Record RFQ Send
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.68fr_0.32fr]">
          <section className="premium-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="field-label">Step 3</p>
                <h2 className="mt-2 text-2xl font-bold text-mahindra-ink">
                  RFQ Draft
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Editable before send.
                </p>
              </div>
              <button
                className="primary-button"
                disabled={selectedSuppliers.length === 0 || sending}
                onClick={handleSend}
                type="button"
              >
                <Send size={18} />
                Record RFQ Send
              </button>
            </div>

            <label className="mt-6 block">
              <span className="field-label">From</span>
              <input className="field-input" value={fromEmail} readOnly />
            </label>

            <label className="mt-4 block">
              <span className="field-label">To</span>
              <textarea
                className="field-input min-h-20 resize-y text-sm leading-6"
                readOnly
                value={recipientDisplay}
              />
            </label>

            <label className="mt-4 block">
              <span className="field-label">Subject</span>
              <textarea
                className="field-input min-h-16 resize-y leading-6"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>

            <label className="mt-4 block">
              <span className="field-label">Email body</span>
              <textarea
                className="field-input min-h-[520px] font-mono text-sm leading-6"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </label>

            <div className="mt-4 rounded-md border border-red-100 bg-red-50/70 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-mahindra-red">
                <FileText size={16} />
                Draft note
              </p>
              <p className="mt-2 text-sm leading-6 text-mahindra-ink">{aiNote}</p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="metric-tile">
              <div className="flex items-center justify-between gap-3">
                <p className="field-label">Selected suppliers</p>
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-mahindra-red">
                  {selectedSuppliers.length} selected
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {selectedSuppliers.length > 0 ? (
                  selectedSuppliers.map((supplier) => (
                    <div className="rounded-md border border-mahindra-line p-3" key={supplier.id}>
                      <p className="font-bold text-mahindra-ink">{supplier.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                        <MapPin size={14} />
                        {supplier.location}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                        <ShieldAlert size={14} />
                        {supplier.riskLevel} risk - {supplier.rating.toFixed(1)} rating
                      </p>
                      <p className="mt-1 break-all text-sm text-mahindra-red">{supplier.email}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-zinc-300 bg-white/60 p-3 text-sm font-semibold text-zinc-500">
                    No selected suppliers were found for this draft.
                  </div>
                )}
              </div>
            </div>

            <div className="metric-tile">
              <p className="field-label">Send readiness</p>
              <div className="mt-3 grid gap-3">
                <ReadinessMetric icon={Users} label="Suppliers" value={`${selectedSuppliers.length}`} />
                <ReadinessMetric icon={Mail} label="Recipient emails" value={`${recipientEmails.length}`} />
              </div>
            </div>

            <div className="metric-tile">
              <p className="field-label">Send mode</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Simulated only. A sent summary is saved locally.
              </p>
            </div>

            {sentLog && (
              <div className="rounded-lg border border-green-100 bg-white/[0.9] p-4 shadow-[0_14px_36px_rgba(36,39,44,0.08)] backdrop-blur-xl">
                <p className="field-label flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={15} />
                  Sent summary
                </p>
                <div className="mt-3 space-y-3 text-sm">
                  <SummaryRow label="From" value={sentLog.from} />
                  <SummaryRow label="To" value={sentLog.to.join(", ")} />
                  <SummaryRow label="Subject" value={sentLog.subject} />
                  <SummaryRow label="Sent timestamp" value={formatTimestamp(sentLog.sentAt)} />
                  <SummaryRow label="Number of suppliers" value={`${sentLog.supplierCount}`} />
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </AppShell>
  );
}

function getSelectedSuppliers(selectedSupplierIds: string[]) {
  const storedSuppliers = readStoredSelectedSuppliers();

  if (storedSuppliers.length > 0) {
    return storedSuppliers;
  }

  return laptopSuppliers.filter((supplier) => selectedSupplierIds.includes(supplier.id));
}

function readStoredSelectedSuppliers() {
  const storedValue = localStorage.getItem(selectedSuppliersStorageKey);

  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue) as LaptopSupplier[];

    return parsed.filter(
      (supplier) =>
        typeof supplier.id === "string" &&
        typeof supplier.name === "string" &&
        typeof supplier.email === "string" &&
        typeof supplier.location === "string" &&
        Array.isArray(supplier.brandsSupported)
    );
  } catch {
    return [];
  }
}

function normalizeDraft(draft: RFQDraft | { subject: string; body: string; aiNote?: string }) {
  return {
    subject: draft.subject,
    body: draft.body,
    aiNote: draft.aiNote ?? defaultAiNote
  };
}

function ReadinessMetric({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-mahindra-mist p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-1 font-bold text-mahindra-ink">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-mahindra-ink">{value}</p>
    </div>
  );
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
