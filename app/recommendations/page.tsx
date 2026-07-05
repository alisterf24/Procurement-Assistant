"use client";

import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  XCircle
} from "lucide-react";
import { AgentLoadingModal } from "@/components/agent-loading-modal";
import { AppShell } from "@/components/app-shell";
import { Stepper } from "@/components/stepper";
import type { LaptopSupplier } from "@/data/suppliers";
import {
  analyzeRequirement,
  generateRFQEmail,
  scoreSuppliers,
  type SupplierRecommendation
} from "@/lib/agent/procurementAgent";
import { defaultRequirement } from "@/lib/scoring";
import { useDemoState } from "@/lib/use-demo-state";
import type { LaptopRequirement } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

const selectedSuppliersStorageKey = "mm-selected-laptop-suppliers";

export default function RecommendationsPage() {
  const router = useRouter();
  const {
    hydrated,
    requirement,
    selectedSupplierIds,
    setSelectedSupplierIds,
    setRfqDraft
  } = useDemoState();
  const [matching, setMatching] = useState(true);
  const [preparingRfq, setPreparingRfq] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const resolvedRequirement = useMemo(
    () => getStoredRequirement(requirement),
    [requirement]
  );
  const analysis = useMemo(
    () => analyzeRequirement(resolvedRequirement),
    [resolvedRequirement]
  );
  const supplierRecommendations = useMemo(
    () => scoreSuppliers(resolvedRequirement),
    [resolvedRequirement]
  );
  const selectedRecommendations = useMemo(
    () =>
      supplierRecommendations.filter((recommendation) =>
        selectedIds.includes(recommendation.supplier.id)
      ),
    [selectedIds, supplierRecommendations]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMatching(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) {
      const validSupplierIds = new Set(
        supplierRecommendations.map((recommendation) => recommendation.supplier.id)
      );
      setSelectedIds(
        selectedSupplierIds.filter((supplierId) => validSupplierIds.has(supplierId))
      );
    }
  }, [hydrated, selectedSupplierIds, supplierRecommendations]);

  function toggleSupplier(id: string) {
    setValidationMessage("");
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((supplierId) => supplierId !== id)
        : [...current, id]
    );
  }

  function handleGenerateRFQ() {
    if (selectedRecommendations.length === 0) {
      setValidationMessage("Select at least one supplier before generating an RFQ.");
      return;
    }

    const selectedSuppliers = selectedRecommendations.map(
      (recommendation) => recommendation.supplier
    );
    setPreparingRfq(true);

    window.setTimeout(() => {
      const loggedInUserEmail =
        localStorage.getItem("mm-sourcing-user") ?? "procurement.manager@mahindra.com";
      setSelectedSupplierIds(selectedIds);
      localStorage.setItem(
        selectedSuppliersStorageKey,
        JSON.stringify(selectedSuppliers)
      );
      setRfqDraft(generateRFQEmail(resolvedRequirement, selectedSuppliers, loggedInUserEmail));
      router.push("/rfq");
    }, 1200);
  }

  return (
    <AppShell>
      <AgentLoadingModal
        open={matching}
        title="Matching suppliers"
        detail="AI Agent is matching your requirement with supplier capabilities..."
      />
      <AgentLoadingModal
        open={preparingRfq}
        title="Preparing RFQ"
        detail="Preparing supplier selection for RFQ generation..."
      />

      <main className="mx-auto max-w-7xl px-5 py-6">
        <Stepper current={1} />

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="agent-status-badge">
              <Bot size={15} />
              Simulated AI supplier matching
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-mahindra-ink md:text-4xl">
              Supplier Recommendations
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 md:text-base">
              Ranked supplier matches are generated from deterministic rules across capability fit, location coverage, delivery timeline, certifications, rating, support, and enterprise experience.
            </p>
          </div>
          <button className="primary-button" onClick={handleGenerateRFQ} type="button">
            <Mail size={18} />
            Generate RFQ for Selected Suppliers
          </button>
        </div>

        {validationMessage && (
          <div className="mt-5 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-mahindra-red">
            <AlertCircle size={18} />
            {validationMessage}
          </div>
        )}

        {!matching && (
          <div className="mt-6 space-y-6">
            <section className="premium-card p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="field-label">Section 1</p>
                  <h2 className="mt-1 text-2xl font-bold text-mahindra-ink">
                    AI Requirement Summary
                  </h2>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                    {analysis.summary}
                  </p>
                </div>
                <div className="rounded-md border border-red-100 bg-red-50/70 px-4 py-3 text-sm font-semibold text-mahindra-red">
                  {supplierRecommendations.length} suppliers scanned
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Item required" value={analysis.shortSummary.itemRequired} />
                <SummaryCard label="Quantity" value={`${analysis.shortSummary.quantity} units`} />
                <SummaryCard label="Location" value={analysis.shortSummary.location} />
                <SummaryCard label="Timeline" value={analysis.shortSummary.timeline} />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <SummaryList
                  title="Key technical requirements"
                  items={analysis.shortSummary.keyTechnicalRequirements}
                />
                <SummaryList
                  title="Key supplier selection criteria"
                  items={analysis.shortSummary.keySupplierSelectionCriteria}
                />
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="field-label">Section 2</p>
                  <h2 className="mt-1 text-2xl font-bold text-mahindra-ink">
                    Recommended Suppliers
                  </h2>
                </div>
                <div className="hidden rounded-md border border-white/80 bg-white/[0.82] px-3 py-2 text-xs font-bold text-zinc-600 shadow-sm backdrop-blur md:block">
                  Top 3 are highlighted
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {supplierRecommendations.map((recommendation, index) => (
                  <SupplierCard
                    index={index}
                    key={recommendation.supplier.id}
                    recommendation={recommendation}
                    selected={selectedIds.includes(recommendation.supplier.id)}
                    onToggle={() => toggleSupplier(recommendation.supplier.id)}
                  />
                ))}
              </div>
            </section>

            <section className="premium-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="field-label">Section 3</p>
                  <h2 className="mt-1 text-2xl font-bold text-mahindra-ink">
                    Selected Suppliers Summary
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Select one or more suppliers to carry forward into the RFQ draft step.
                  </p>
                </div>
                <button className="primary-button" onClick={handleGenerateRFQ} type="button">
                  <Mail size={18} />
                  Generate RFQ for Selected Suppliers
                </button>
              </div>

              {selectedRecommendations.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {selectedRecommendations.map((recommendation) => (
                    <div
                      className="rounded-md border border-red-100 bg-red-50/60 p-4"
                      key={recommendation.supplier.id}
                    >
                      <p className="font-bold text-mahindra-ink">
                        {recommendation.supplier.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {recommendation.matchPercentage}% match - {recommendation.supplier.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-md border border-dashed border-zinc-300 bg-white/60 p-5 text-sm font-semibold text-zinc-500">
                  No suppliers selected yet.
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function SupplierCard({
  recommendation,
  index,
  selected,
  onToggle
}: {
  recommendation: SupplierRecommendation;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const supplier = recommendation.supplier;
  const topRecommended = index < 3;

  return (
    <article
      className={`group rounded-lg border bg-white/[0.9] p-5 shadow-[0_18px_54px_rgba(36,39,44,0.1)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_76px_rgba(36,39,44,0.15)] ${
        selected
          ? "border-mahindra-red ring-2 ring-red-100"
          : topRecommended
            ? "border-red-100"
            : "border-white/80"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {topRecommended && (
              <span className="inline-flex items-center gap-1 rounded-md bg-mahindra-red px-2.5 py-1 text-xs font-bold text-white">
                <Award size={14} />
                Top {index + 1}
              </span>
            )}
            <RiskBadge riskLevel={supplier.riskLevel} />
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
              {recommendation.fitCategory} fit
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-mahindra-ink">{supplier.name}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {supplier.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail size={15} />
              {supplier.email}
            </span>
          </div>
        </div>

        <div className="min-w-28 rounded-md bg-gradient-to-br from-mahindra-ink to-zinc-700 px-4 py-3 text-center text-white shadow-[0_14px_34px_rgba(36,39,44,0.18)]">
          <p className="text-3xl font-bold leading-none">{recommendation.matchPercentage}%</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
            Match
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mahindra-red to-red-400 transition-all duration-700"
            style={{ width: `${recommendation.matchPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <Metric icon={Star} label="Rating" value={supplier.rating.toFixed(1)} />
        <Metric icon={Clock} label="Delivery" value={`${supplier.averageDeliveryDays} days`} />
        <Metric icon={ShieldCheck} label="Capacity" value={`${supplier.maxOrderCapacity} units`} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <BadgeGroup title="Brands supported" items={supplier.brandsSupported} />
        <BadgeGroup title="Certifications" items={supplier.certifications} />
        <BadgeGroup title="Warranty / support" items={[...supplier.warrantySupport, ...supplier.supportCapability]} />
        <BadgeGroup title="Security capabilities" items={supplier.securityCapabilities} />
      </div>

      <div className="mt-5 rounded-md border border-red-100 bg-red-50/60 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-mahindra-red">
          <Sparkles size={16} />
          AI recommendation reason
        </div>
        <p className="text-sm leading-6 text-mahindra-ink">
          {recommendation.recommendationReason}
        </p>
      </div>

      <button
        className={selected ? "primary-button mt-5 w-full" : "secondary-button mt-5 w-full"}
        onClick={onToggle}
        type="button"
      >
        {selected ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        {selected ? "Selected for RFQ" : "Select supplier"}
      </button>
    </article>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/80 bg-white/[0.72] p-4 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-mahindra-ink">{value}</p>
    </div>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-white/80 bg-white/[0.68] p-4">
      <p className="field-label">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <CheckCircle2 className="mt-1 shrink-0 text-mahindra-red" size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({
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

function BadgeGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="field-label">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700"
            key={item}
          >
            <BadgeCheck size={13} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function RiskBadge({ riskLevel }: { riskLevel: LaptopSupplier["riskLevel"] }) {
  const styles = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    High: "bg-red-50 text-mahindra-red border-red-100"
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold ${styles[riskLevel]}`}
    >
      <ShieldAlert size={14} />
      {riskLevel} risk
    </span>
  );
}

function getStoredRequirement(requirement: LaptopRequirement): LaptopRequirement {
  if (typeof window === "undefined") {
    return requirement;
  }

  const storedRequirement = window.localStorage.getItem("mm-laptop-requirement");
  if (!storedRequirement) {
    return requirement ?? defaultRequirement;
  }

  return {
    ...defaultRequirement,
    ...JSON.parse(storedRequirement)
  };
}
