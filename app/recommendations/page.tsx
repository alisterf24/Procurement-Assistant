"use client";

import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Globe2,
  Mail,
  MapPin,
  Phone,
  XCircle
} from "lucide-react";
import { AgentLoadingModal } from "@/components/agent-loading-modal";
import { AppShell } from "@/components/app-shell";
import { Stepper } from "@/components/stepper";
import type { LaptopSupplier } from "@/data/suppliers";
import {
  generateRFQEmail,
  scoreSuppliers
} from "@/lib/agent/procurementAgent";
import { defaultRequirement } from "@/lib/scoring";
import type { PublicSupplier, SupplierDiscoveryResult } from "@/lib/supplier-discovery";
import { useDemoState } from "@/lib/use-demo-state";
import type { LaptopRequirement } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

const selectedSuppliersStorageKey = "mm-selected-laptop-suppliers";
const defaultFromEmail = "procurement.team@example.com";

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
  const [suppliers, setSuppliers] = useState<PublicSupplier[]>([]);
  const [sourceInfo, setSourceInfo] = useState<SupplierDiscoveryResult["sourceInfo"] | null>(null);

  const resolvedRequirement = useMemo(
    () => getStoredRequirement(requirement),
    [requirement]
  );
  const requirementSummaryItems = useMemo(
    () => getRequirementSummaryItems(resolvedRequirement),
    [resolvedRequirement]
  );
  const selectedRecommendations = useMemo(
    () => suppliers.filter((supplier) => selectedIds.includes(supplier.id)),
    [selectedIds, suppliers]
  );

  useEffect(() => {
    let cancelled = false;

    async function runSupplierDiscovery() {
      setMatching(true);
      setValidationMessage("");

      try {
        const response = await fetch("/api/supplier-discovery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ requirement: resolvedRequirement })
        });

        if (!response.ok) {
          throw new Error("Supplier discovery failed.");
        }

        const discovery = (await response.json()) as SupplierDiscoveryResult;

        if (!cancelled) {
          setSuppliers(discovery.suppliers);
          setSourceInfo(discovery.sourceInfo);
        }
      } catch {
        if (!cancelled) {
          const fallbackSuppliers = scoreSuppliers(resolvedRequirement)
            .slice(0, 10)
            .map((recommendation) =>
              toFallbackPublicSupplier(recommendation.supplier)
            );

          setSuppliers(fallbackSuppliers);
          setSourceInfo({
            sourceType: "Offline demo supplier database",
            sourcesChecked: fallbackSuppliers.length,
            sourcesUsed: fallbackSuppliers.length,
            query: "Offline fallback supplier scoring",
            note:
              "Live supplier discovery was unavailable, so this demo used the existing offline supplier database.",
            sources: fallbackSuppliers.map((supplier) => ({
              name: supplier.name,
              url: supplier.sourceUrl,
              available: true
            }))
          });
        }
      } finally {
        window.setTimeout(() => {
          if (!cancelled) {
            setMatching(false);
          }
        }, 900);
      }
    }

    runSupplierDiscovery();

    return () => {
      cancelled = true;
    };
  }, [resolvedRequirement]);

  useEffect(() => {
    if (hydrated) {
      const validSupplierIds = new Set(suppliers.map((supplier) => supplier.id));
      setSelectedIds(
        selectedSupplierIds.filter((supplierId) => validSupplierIds.has(supplierId))
      );
    }
  }, [hydrated, selectedSupplierIds, suppliers]);

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

    const selectedSuppliers = selectedRecommendations;
    setPreparingRfq(true);

    window.setTimeout(() => {
      setSelectedSupplierIds(selectedIds);
      localStorage.setItem(
        selectedSuppliersStorageKey,
        JSON.stringify(selectedSuppliers)
      );
      setRfqDraft(generateRFQEmail(resolvedRequirement, selectedSuppliers, defaultFromEmail));
      router.push("/rfq");
    }, 1200);
  }

  return (
    <AppShell>
      <AgentLoadingModal
        open={matching}
        title="Matching suppliers"
        detail="Comparing requirement with supplier capabilities..."
      />
      <AgentLoadingModal
        open={preparingRfq}
        title="Preparing RFQ"
        detail="Preparing supplier selection for RFQ generation..."
      />

      <main className="mx-auto max-w-7xl px-5 py-6 sm:py-8">
        <Stepper current={1} />

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="agent-status-badge">
              <BadgeCheck size={15} />
              Supplier matching
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-mahindra-ink md:text-4xl">
              Supplier Recommendations
            </h1>
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
            <section className="premium-card p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="field-label">Section 1</p>
                  <h2 className="mt-1 text-2xl font-bold text-mahindra-ink">
                    Requirement Summary
                  </h2>
                </div>
                <div className="rounded-md border border-red-100 bg-red-50/70 px-4 py-3 text-sm font-semibold text-mahindra-red">
                  {suppliers.length} suppliers ranked
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {requirementSummaryItems.map((item) => (
                  <SummaryCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
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
                  Top 10 public-source matches
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {suppliers.map((supplier, index) => (
                  <SupplierCard
                    index={index}
                    key={supplier.id}
                    supplier={supplier}
                    selected={selectedIds.includes(supplier.id)}
                    onToggle={() => toggleSupplier(supplier.id)}
                  />
                ))}
              </div>
            </section>

            {sourceInfo && <SourceInfoCard sourceInfo={sourceInfo} />}

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
                  {selectedRecommendations.map((supplier) => (
                    <div
                      className="rounded-md border border-red-100 bg-red-50/60 p-4"
                      key={supplier.id}
                    >
                      <p className="font-bold text-mahindra-ink">
                        {supplier.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {supplier.publicEmail} - {supplier.location}
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
  supplier,
  index,
  selected,
  onToggle
}: {
  supplier: PublicSupplier;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`group rounded-lg border bg-white/[0.9] p-5 shadow-[0_16px_48px_rgba(36,39,44,0.085)] backdrop-blur-2xl transition duration-200 hover:shadow-[0_20px_56px_rgba(36,39,44,0.11)] sm:p-6 ${
        selected
          ? "border-mahindra-red ring-2 ring-red-100"
          : index < 3
            ? "border-red-100"
            : "border-white/80"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
              Rank {index + 1}
            </span>
            <span className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold text-mahindra-red">
              {supplier.sourceType}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-mahindra-ink">{supplier.name}</h3>
          <p className="mt-2 flex items-start gap-1.5 text-sm leading-6 text-zinc-600">
            <MapPin className="mt-1 shrink-0" size={15} />
            <span>{supplier.address || supplier.location}</span>
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 bg-mahindra-mist px-3 py-2 text-sm font-bold text-mahindra-ink">
          Score {supplier.relevanceScore}/100
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoLine icon={Mail} label="Email ID" value={supplier.publicEmail} />
        <InfoLine icon={Phone} label="Contact number" value={supplier.publicContactNumber} />
        <InfoLine icon={Globe2} label="Website/source" value={supplier.websiteUrl} href={supplier.sourceUrl} />
        <InfoLine icon={BadgeCheck} label="Credibility" value={supplier.credibilitySignal} />
        <InfoLine label="Brands handled" value={supplier.brandsSupported.join(", ")} />
        <InfoLine label="Budget/rating" value={supplier.budgetRange !== "Not publicly disclosed" ? supplier.budgetRange : `Rating signal: ${supplier.rating.toFixed(1)}/5`} />
      </div>

      <div className="mt-5 rounded-md border border-zinc-200 bg-white/[0.68] p-4">
        <p className="field-label">Primary benchmarking points</p>
        <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-mahindra-ink">
          {supplier.benchmarkingPoints.slice(0, 4).map((point) => (
            <li className="flex gap-2" key={point}>
              <CheckCircle2 className="mt-1 shrink-0 text-mahindra-red" size={15} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
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

function InfoLine({
  icon: Icon,
  label,
  value,
  href
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="rounded-md bg-mahindra-mist p-3">
      <p className="field-label flex items-center gap-1.5">
        {Icon && <Icon size={14} />}
        {label}
      </p>
      {href ? (
        <a
          className="mt-1 inline-flex items-center gap-1 break-all text-sm font-bold leading-6 text-mahindra-red hover:underline"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {value}
          <ExternalLink size={14} />
        </a>
      ) : (
        <p className="mt-1 break-words text-sm font-bold leading-6 text-mahindra-ink">{value}</p>
      )}
    </div>
  );
}

function SourceInfoCard({
  sourceInfo
}: {
  sourceInfo: SupplierDiscoveryResult["sourceInfo"];
}) {
  return (
    <section className="premium-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-mahindra-red">
          <FileSearch size={20} />
        </div>
        <div>
          <p className="field-label">Source information</p>
          <h2 className="mt-1 text-xl font-bold text-mahindra-ink">
            {sourceInfo.sourceType}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
            {sourceInfo.note}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <SummaryCard label="Sources checked" value={`${sourceInfo.sourcesChecked}`} />
        <SummaryCard label="Sources used" value={`${sourceInfo.sourcesUsed}`} />
        <SummaryCard label="Search query" value={sourceInfo.query} />
      </div>

      <div className="mt-5 rounded-md border border-zinc-200 bg-white/[0.68] p-4">
        <p className="field-label">Sources used</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sourceInfo.sources.slice(0, 10).map((source) => (
            <a
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold text-mahindra-ink transition hover:border-mahindra-red hover:text-mahindra-red"
              href={source.url}
              key={source.url}
              rel="noreferrer"
              target="_blank"
            >
              {source.name}
              <ExternalLink size={13} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/80 bg-white/[0.72] p-4 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</p>
      <p className="mt-2 text-base font-bold leading-6 text-mahindra-ink">{value}</p>
    </div>
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

  try {
    return {
      ...defaultRequirement,
      ...JSON.parse(storedRequirement)
    };
  } catch {
    window.localStorage.removeItem("mm-laptop-requirement");
    return requirement ?? defaultRequirement;
  }
}

function getRequirementSummaryItems(requirement: LaptopRequirement) {
  return [
    { label: "Request title", value: requirement.requestTitle },
    { label: "Business unit / department", value: requirement.department },
    { label: "Delivery location", value: requirement.deliveryLocation },
    { label: "Required delivery date", value: formatRequirementDate(requirement.requiredDeliveryDate) },
    { label: "Quantity", value: `${requirement.quantity} units` },
    { label: "Budget range / estimated budget", value: `INR ${formatAmount(requirement.quantity * requirement.budgetPerLaptop)}` },
    { label: "Laptop category", value: requirement.laptopType },
    { label: "Processor class", value: requirement.processor },
    { label: "RAM", value: `${requirement.ramGb} GB` },
    { label: "Storage", value: formatStorage(requirement.storageGb) },
    { label: "Operating system", value: requirement.operatingSystem },
    { label: "Preferred brand", value: requirement.brandPreference }
  ];
}

function formatRequirementDate(value: string) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function formatAmount(value: number) {
  if (!Number.isFinite(value)) {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatStorage(storageGb: number) {
  if (!Number.isFinite(Number(storageGb))) {
    return "Not specified";
  }

  return storageGb >= 1024 ? `${storageGb / 1024} TB SSD` : `${storageGb} GB SSD`;
}

function toFallbackPublicSupplier(supplier: LaptopSupplier): PublicSupplier {
  return {
    ...supplier,
    address: supplier.location,
    publicEmail: supplier.email,
    publicContactNumber: "Demo supplier contact only",
    websiteUrl: "https://example.com",
    sourceUrl: "https://example.com",
    sourceType: "Offline demo supplier database",
    enterpriseRelevance: supplier.supplierDescription,
    benchmarkingPoints: [
      `${supplier.location} supplier with ${supplier.serviceCoverage.join(", ")} coverage`,
      `Handles ${supplier.brandsSupported.join(", ")} laptop procurement`,
      `${supplier.rating.toFixed(1)}/5 demo supplier rating`
    ],
    credibilitySignal: "Fictional demo supplier record",
    budgetRange: "Not publicly disclosed",
    relevanceScore: Math.round(supplier.rating * 20)
  };
}
