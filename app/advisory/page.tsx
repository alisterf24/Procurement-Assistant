"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Home,
  Scale,
  Upload,
  X
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  analyzeQuotationFiles,
  type QuotationComparison,
  type QuotationSummary,
  type RecommendationTag
} from "@/lib/agent/quotationAgent";
import { useRef, useState } from "react";

type SelectedQuotationFile = {
  id: string;
  file: File;
};

type ScoreItem = {
  label: string;
  value: number;
  max: number;
};

const tagStyles: Record<RecommendationTag, string> = {
  "Best value": "border-emerald-100 bg-emerald-50 text-emerald-700",
  "Lowest price": "border-blue-100 bg-blue-50 text-blue-700",
  "Fastest delivery": "border-sky-100 bg-sky-50 text-sky-700",
  "Strong warranty": "border-teal-100 bg-teal-50 text-teal-700",
  "Needs clarification": "border-amber-100 bg-amber-50 text-amber-700",
  "Commercial risk": "border-red-100 bg-red-50 text-mahindra-red",
  "Comparable option": "border-zinc-200 bg-zinc-100 text-zinc-700"
};

export default function AdvisoryPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedQuotationFile[]>([]);
  const [comparison, setComparison] = useState<QuotationComparison | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationMessage, setValidationMessage] = useState("Upload at least two quotations.");

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      setValidationMessage("Upload at least two quotations.");
      return;
    }

    const incomingFiles = Array.from(files);
    const unsupportedFiles = incomingFiles.filter((file) => !isSupportedQuotationFile(file));
    const nextFiles = incomingFiles
      .filter((file) => isSupportedQuotationFile(file))
      .map((file, index) => ({
        id: createFileId(file, index),
        file
      }));

    if (nextFiles.length === 0) {
      setValidationMessage("Upload TXT or text-readable PDF quotations.");
      return;
    }

    setSelectedFiles((current) => {
      const existing = new Set(current.map((item) => item.id));
      const additions = nextFiles.filter((item) => !existing.has(item.id));

      if (additions.length === 0) {
        setValidationMessage(
          unsupportedFiles.length > 0
            ? "Only TXT and text-readable PDF quotations are supported."
            : "Files already selected."
        );
        return current;
      }

      setValidationMessage(
        unsupportedFiles.length > 0
          ? "Only TXT and text-readable PDF quotations are supported."
          : current.length + additions.length < 2 ? "Upload at least two quotations." : ""
      );

      return [
        ...current,
        ...additions
      ];
    });
    setComparison(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeFile(id: string) {
    setSelectedFiles((current) => {
      const nextFiles = current.filter((item) => item.id !== id);
      setValidationMessage(
        nextFiles.length < 2 ? "Upload at least two quotations." : ""
      );
      return nextFiles;
    });
    setComparison(null);
  }

  async function handleCompare() {
    if (selectedFiles.length < 2) {
      setValidationMessage("Upload at least two quotations.");
      return;
    }

    setValidationMessage("");
    setReviewing(true);
    setComparison(null);

    window.setTimeout(async () => {
      const nextComparison = await analyzeQuotationFiles(
        selectedFiles.map((item) => item.file)
      );

      setComparison(nextComparison);
      setReviewing(false);
    }, 650);
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="secondary-button px-3 py-2" href="/">
              <Home size={16} />
              Home
            </Link>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-mahindra-ink md:text-4xl">
              Procurement Advisory
            </h1>
          </div>
        </div>

        <section className="premium-card mt-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-mahindra-ink">Upload quotations</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-500">Minimum 2 files</p>
            </div>
            <button
              className="primary-button"
              disabled={selectedFiles.length < 2 || reviewing}
              onClick={handleCompare}
              type="button"
            >
              {reviewing ? "Reviewing..." : "Compare"}
            </button>
          </div>

          <label
            className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-7 text-center transition duration-200 sm:py-8 ${
              dragActive
                ? "border-mahindra-red bg-white"
                : "border-zinc-300 bg-white/[0.62] hover:border-mahindra-red hover:bg-white"
            }`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleFiles(event.dataTransfer.files);
            }}
          >
            <Upload className="text-mahindra-red" size={26} />
            <span className="mt-3 text-sm font-bold text-mahindra-ink">
              Select or drop quotation files
            </span>
            <span className="mt-1 text-xs font-semibold text-zinc-500">
              TXT or text-readable PDF
            </span>
            <input
              accept=".txt,.pdf,text/plain,application/pdf"
              className="sr-only"
              disabled={reviewing}
              multiple
              onChange={(event) => handleFiles(event.target.files)}
              ref={inputRef}
              type="file"
            />
          </label>

          <div className="mt-3 flex flex-col gap-2 text-sm font-bold sm:flex-row sm:items-center sm:justify-between">
            <p className={selectedFiles.length < 2 ? "text-mahindra-red" : "text-zinc-500"}>
              {selectedFiles.length < 2
                ? "Upload at least two quotations."
                : `${selectedFiles.length} files ready`}
            </p>
            {validationMessage && selectedFiles.length >= 2 && (
              <p className="text-zinc-500">{validationMessage}</p>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {selectedFiles.map(({ id, file }) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-mahindra-line bg-white/[0.78] px-3 py-2"
                  key={id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-mahindra-ink">
                      {file.name}
                    </p>
                    <p className="text-xs font-semibold text-zinc-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    aria-label={`Remove ${file.name}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition hover:border-mahindra-red hover:text-mahindra-red"
                    disabled={reviewing}
                    onClick={() => removeFile(id)}
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {reviewing && (
          <div className="mt-5 flex items-center gap-3 rounded-md border border-red-100 bg-red-50/80 px-4 py-3 text-sm font-bold text-mahindra-red shadow-sm">
            <span className="size-2 rounded-full bg-mahindra-red" />
            Reviewing quotations...
          </div>
        )}

        {comparison && !reviewing && (
          <div className="mt-6 space-y-6">
            {comparison.fileWarnings.length > 0 && (
              <div className="rounded-md border border-amber-100 bg-amber-50/85 px-4 py-3 text-sm font-bold leading-6 text-amber-800 shadow-sm">
                {comparison.fileWarnings[0]}
              </div>
            )}
            <DecisionSummary comparison={comparison} />
            <section className="grid gap-4 xl:grid-cols-2">
              {comparison.quotations.map((quotation) => (
                <QuotationCard key={quotation.id} quotation={quotation} />
              ))}
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function DecisionSummary({ comparison }: { comparison: QuotationComparison }) {
  return (
    <section className="premium-card p-5 sm:p-6">
      <div className="grid gap-3 md:grid-cols-5">
        <DecisionMetric
          label="Best value"
          value={comparison.bestValue?.vendorName ?? "Needs clarification"}
        />
        <DecisionMetric
          label="Lowest price"
          value={
            comparison.lowestPrice
              ? `${comparison.lowestPrice.vendorName} - ${formatPrice(comparison.lowestPrice)}`
              : "Needs clarification"
          }
        />
        <DecisionMetric
          label="Fastest delivery"
          value={
            comparison.fastestDelivery
              ? `${comparison.fastestDelivery.vendorName} - ${comparison.fastestDelivery.deliveryTimeline}`
              : "Needs clarification"
          }
        />
        <DecisionMetric
          label="Clarification"
          value={comparison.topClarificationNeeded}
        />
        <DecisionMetric
          label="Negotiate"
          value={comparison.topNegotiationLever}
        />
      </div>
      <p className="mt-4 rounded-md border border-zinc-200 bg-white/[0.72] px-4 py-3 text-sm font-semibold leading-6 text-mahindra-ink">
        {comparison.keyDecisionNote}
      </p>
    </section>
  );
}

function QuotationCard({ quotation }: { quotation: QuotationSummary }) {
  return (
    <article className="rounded-lg border border-white/80 bg-white/[0.9] p-5 shadow-[0_16px_48px_rgba(36,39,44,0.085)] backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-md border px-2.5 py-1 text-xs font-bold ${tagStyles[quotation.recommendationTag]}`}
            >
              {quotation.recommendationTag}
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
              {quotation.recommendationScore}/100
            </span>
          </div>
          <h2 className="mt-3 truncate text-xl font-bold text-mahindra-ink">
            {quotation.vendorName}
          </h2>
          <p className="mt-1 truncate text-xs font-semibold text-zinc-500">
            {quotation.fileName}
          </p>
        </div>
        <div className="rounded-md border border-red-100 bg-red-50/70 px-4 py-3 text-right">
          <p className="field-label text-mahindra-red">Price</p>
          <p className="mt-1 text-2xl font-bold text-mahindra-ink">
            {formatPrice(quotation)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoBlock label="Products" value={formatList(quotation.productsOffered)} />
        <InfoBlock label="Delivery" value={quotation.deliveryTimeline} />
        <InfoBlock label="Warranty" value={quotation.warranty} />
        <InfoBlock label="Support" value={quotation.supportSla} />
        <InfoBlock label="Payment" value={quotation.paymentTerms} />
        <InfoBlock label="Validity" value={quotation.quoteValidity} />
        <InfoBlock label="Taxes" value={quotation.taxes} />
        <InfoBlock label="Freight" value={quotation.freight} />
        <InfoBlock label="Unit price" value={formatUnitPrice(quotation)} />
        <InfoBlock label="Quantity" value={formatOptionalNumber(quotation.quantity)} />
        <InfoBlock label="Installation" value={quotation.installation} />
        <InfoBlock label="Compliance" value={formatList(quotation.complianceIndicators)} />
      </div>

      <ScoreBreakdown quotation={quotation} />

      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        <ListBlock
          icon={CheckCircle2}
          title="Pros"
          items={quotation.pros}
          tone="positive"
        />
        <ListBlock
          icon={AlertTriangle}
          title="Cons"
          items={quotation.cons}
          tone="caution"
        />
        <ListBlock
          icon={FileText}
          title="Risks"
          items={quotation.keyRisks}
          tone="risk"
        />
        <ListBlock
          icon={Scale}
          title="Negotiate"
          items={quotation.negotiationLevers}
          tone="neutral"
        />
      </div>
    </article>
  );
}

function DecisionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/80 bg-white/[0.72] p-4 shadow-sm">
      <p className="field-label">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-mahindra-ink">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-mahindra-mist p-3">
      <p className="field-label">{label}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-mahindra-ink">{value}</p>
    </div>
  );
}

function ScoreBreakdown({ quotation }: { quotation: QuotationSummary }) {
  const scores: ScoreItem[] = [
    { label: "Price", value: quotation.scoreBreakdown.priceCompetitiveness, max: 30 },
    { label: "Fit", value: quotation.scoreBreakdown.requirementFit, max: 15 },
    { label: "Delivery", value: quotation.scoreBreakdown.deliveryFulfillment, max: 15 },
    { label: "Warranty", value: quotation.scoreBreakdown.warrantySupport, max: 15 },
    { label: "Terms", value: quotation.scoreBreakdown.commercialTerms, max: 10 },
    { label: "Compliance", value: quotation.scoreBreakdown.complianceReliability, max: 10 },
    { label: "Complete", value: quotation.scoreBreakdown.completeness, max: 5 }
  ];

  return (
    <div className="mt-5 rounded-md border border-zinc-200 bg-white/[0.68] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="field-label">Evaluation</p>
        <p className="text-xs font-bold text-zinc-500">100 pts</p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {scores.map((score) => (
          <div key={score.label}>
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-mahindra-ink">
              <span>{score.label}</span>
              <span>
                {score.value}/{score.max}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-mahindra-red"
                style={{ width: `${Math.round((score.value / score.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListBlock({
  icon: Icon,
  title,
  items,
  tone
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  tone: "positive" | "caution" | "risk" | "neutral";
}) {
  const toneClass = {
    positive: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
    caution: "border-amber-100 bg-amber-50/80 text-amber-800",
    risk: "border-red-100 bg-red-50/80 text-mahindra-red",
    neutral: "border-zinc-200 bg-zinc-50/90 text-mahindra-ink"
  }[tone];

  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
        <Icon size={15} />
        {title}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm font-semibold leading-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatPrice(quotation: QuotationSummary) {
  if (quotation.quotedTotalPrice === null) {
    return "Needs clarification";
  }

  if (quotation.currency === "Needs clarification") {
    return `${formatAmount(quotation.quotedTotalPrice)} (currency needed)`;
  }

  return `${quotation.currency} ${formatAmount(quotation.quotedTotalPrice)}`;
}

function formatUnitPrice(quotation: QuotationSummary) {
  if (quotation.unitPrice === null) {
    return "Needs clarification";
  }

  if (quotation.currency === "Needs clarification") {
    return `${formatAmount(quotation.unitPrice)} (currency needed)`;
  }

  return `${quotation.currency} ${formatAmount(quotation.unitPrice)}`;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatOptionalNumber(value: number | null) {
  return value === null ? "Needs clarification" : String(value);
}

function formatList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "Needs clarification";
}

function formatFileSize(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function createFileId(file: File, index: number) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

function isSupportedQuotationFile(file: File) {
  return (
    file.type === "text/plain" ||
    file.type === "application/pdf" ||
    /\.(txt|pdf)$/i.test(file.name)
  );
}
