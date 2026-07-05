"use client";

import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  Cpu,
  FileText,
  MapPin,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { AgentLoadingModal } from "@/components/agent-loading-modal";
import { AppShell } from "@/components/app-shell";
import { Stepper } from "@/components/stepper";
import { defaultRequirement, formatCurrency } from "@/lib/scoring";
import { useDemoState } from "@/lib/use-demo-state";
import type { LaptopRequirement } from "@/lib/types";
import { useEffect, useState } from "react";

const priorities: LaptopRequirement["priority"][] = ["Low", "Medium", "High", "Urgent"];
const laptopTypes: LaptopRequirement["laptopType"][] = [
  "Business Laptop",
  "Developer Laptop",
  "Engineering Workstation",
  "Executive Laptop"
];
const processors = ["Intel i5", "Intel i7", "Intel i9", "AMD Ryzen 5", "AMD Ryzen 7"];
const ramOptions = [8, 16, 32, 64];
const storageOptions = [
  { label: "256 GB SSD", value: 256 },
  { label: "512 GB SSD", value: 512 },
  { label: "1 TB SSD", value: 1024 },
  { label: "2 TB SSD", value: 2048 }
];
const operatingSystems: LaptopRequirement["operatingSystem"][] = [
  "Windows 11 Pro",
  "Windows 11 Home",
  "Ubuntu Linux",
  "No OS"
];
const displaySizes: LaptopRequirement["displaySize"][] = ["13 inch", "14 inch", "15.6 inch", "16 inch"];
const brandPreferences: LaptopRequirement["brandPreference"][] = ["Dell", "HP", "Lenovo", "Apple", "No Preference"];
const warrantyRequirements: LaptopRequirement["warrantyRequirement"][] = [
  "1 year",
  "3 years onsite",
  "5 years onsite"
];
const supportRequirements: LaptopRequirement["supportRequirement"][] = [
  "Next Business Day Support",
  "24x7 Support",
  "Standard Support"
];
const securityRequirements: LaptopRequirement["securityRequirement"][] = [
  "TPM",
  "Fingerprint Reader",
  "IR Camera",
  "BIOS Security",
  "No Specific Requirement"
];
const supplierLocations: LaptopRequirement["preferredSupplierLocation"][] = [
  "Mumbai",
  "Pune",
  "Nashik",
  "Bengaluru",
  "Delhi NCR",
  "Any"
];
const supplierRatings: LaptopRequirement["minimumSupplierRating"][] = ["3.5", "4.0", "4.5"];
const certificationOptions = ["GST Registered", "ISO 9001", "ISO 27001", "OEM Authorized Partner"];
const deliveryTimelineOptions: LaptopRequirement["maximumDeliveryTimeline"][] = [
  "7 days",
  "10 days",
  "15 days",
  "30 days"
];

const blankRequirement: LaptopRequirement = {
  ...defaultRequirement,
  requestTitle: "",
  department: "",
  deliveryLocation: "",
  requiredDeliveryDate: "",
  quantity: "" as unknown as number,
  budgetPerLaptop: "" as unknown as number,
  priority: "" as LaptopRequirement["priority"],
  laptopType: "" as LaptopRequirement["laptopType"],
  processor: "",
  ramGb: "" as unknown as number,
  storageGb: "" as unknown as number,
  operatingSystem: "",
  displaySize: "" as LaptopRequirement["displaySize"],
  brandPreference: "" as LaptopRequirement["brandPreference"],
  warrantyRequirement: "" as LaptopRequirement["warrantyRequirement"],
  supportRequirement: "" as LaptopRequirement["supportRequirement"],
  securityRequirement: "" as LaptopRequirement["securityRequirement"],
  preferredSupplierLocation: "" as LaptopRequirement["preferredSupplierLocation"],
  minimumSupplierRating: "" as LaptopRequirement["minimumSupplierRating"],
  requiredCertifications: [],
  enterpriseExperienceRequired: "" as LaptopRequirement["enterpriseExperienceRequired"],
  maximumDeliveryTimeline: "" as LaptopRequirement["maximumDeliveryTimeline"],
  budgetPerUnit: "" as unknown as number,
  deliveryCity: "",
  deliveryDays: "" as unknown as number,
  warrantyYears: "" as unknown as number,
  notes: ""
};

const sampleRequirement: LaptopRequirement = {
  ...defaultRequirement,
  requestTitle: "Q3 Laptop Refresh for Product Engineering",
  department: "Product Engineering",
  deliveryLocation: "Pune",
  requiredDeliveryDate: "2026-08-05",
  quantity: 85,
  budgetPerLaptop: 92000,
  budgetPerUnit: 92000,
  priority: "Urgent",
  laptopType: "Developer Laptop",
  processor: "Intel i7",
  ramGb: 32,
  storageGb: 1024,
  operatingSystem: "Windows 11 Pro",
  displaySize: "15.6 inch",
  brandPreference: "Lenovo",
  warrantyRequirement: "3 years onsite",
  warrantyYears: 3,
  supportRequirement: "24x7 Support",
  securityRequirement: "TPM",
  preferredSupplierLocation: "Pune",
  deliveryCity: "Pune",
  minimumSupplierRating: "4.0",
  requiredCertifications: ["GST Registered", "ISO 27001", "OEM Authorized Partner"],
  enterpriseExperienceRequired: "Yes",
  maximumDeliveryTimeline: "10 days",
  deliveryDays: 10,
  notes: "Include docking compatibility, enterprise imaging support, and asset tagging before dispatch."
};

export default function RequirementsPage() {
  const router = useRouter();
  const {
    hydrated,
    setRequirement,
    setRecommendations,
    setSelectedSupplierIds
  } = useDemoState();
  const [form, setForm] = useState<LaptopRequirement>(blankRequirement);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(
    "AI Agent is analyzing your laptop procurement requirement..."
  );
  const [certificationError, setCertificationError] = useState("");

  useEffect(() => {
    if (hydrated) {
      setForm(blankRequirement);
    }
  }, [hydrated]);

  function updateField<K extends keyof LaptopRequirement>(key: K, value: LaptopRequirement[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCertification(certification: string) {
    setCertificationError("");
    setForm((current) => {
      const exists = current.requiredCertifications.includes(certification);
      return {
        ...current,
        requiredCertifications: exists
          ? current.requiredCertifications.filter((item) => item !== certification)
          : [...current.requiredCertifications, certification]
      };
    });
  }

  function loadSampleRequirement() {
    setCertificationError("");
    setForm(sampleRequirement);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRequirement = normalizeRequirement(form);

    if (nextRequirement.requiredCertifications.length === 0) {
      setCertificationError("Select at least one required certification.");
      return;
    }

    setLoadingDetail("AI Agent is analyzing your laptop procurement requirement...");
    setLoading(true);

    setTimeout(() => {
      setLoadingDetail("Scanning supplier database...");
    }, 1000);

    setTimeout(() => {
      setRequirement(nextRequirement);
      setRecommendations([]);
      setSelectedSupplierIds([]);
      localStorage.setItem("mm-laptop-requirement", JSON.stringify(nextRequirement));
      router.push("/recommendations");
    }, 2000);
  }

  return (
    <AppShell>
      <AgentLoadingModal
        open={loading}
        title="Simulated AI sourcing agent"
        detail={loadingDetail}
      />

      <main className="mx-auto max-w-7xl px-5 py-6">
        <Stepper current={0} />

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="agent-status-badge">
              <Sparkles size={15} />
              Requirement workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-mahindra-ink md:text-4xl">
              Create Laptop Sourcing Event
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 md:text-base">
              Capture demand, technical specifications, supplier preferences, and sourcing constraints before the simulated AI agent ranks eligible vendors.
            </p>
          </div>
          <button className="secondary-button" onClick={loadSampleRequirement} type="button">
            <RotateCcw size={17} />
            Load Sample Laptop Requirement
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormSection
              icon={ClipboardList}
              eyebrow="Section 1"
              title="Basic Details"
              description="Define the business need, delivery context, quantity, budget, and priority."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Request title"
                  value={form.requestTitle}
                  onChange={(value) => updateField("requestTitle", value)}
                  required
                />
                <SelectField
                  label="Business unit / department"
                  value={form.department}
                  onChange={(value) => updateField("department", value)}
                  options={["Strategic Procurement", "Product Engineering", "IT Operations", "Finance", "Sales", "Manufacturing"]}
                  placeholder="Select department"
                  required
                />
                <SelectField
                  label="Delivery location"
                  value={form.deliveryLocation}
                  onChange={(value) => updateField("deliveryLocation", value)}
                  options={supplierLocations.filter((location) => location !== "Any")}
                  placeholder="Select delivery location"
                  required
                />
                <label>
                  <span className="field-label">Required delivery date</span>
                  <input
                    className="field-input"
                    type="date"
                    value={form.requiredDeliveryDate}
                    onChange={(event) => updateField("requiredDeliveryDate", event.target.value)}
                    required
                  />
                </label>
                <NumberField
                  label="Quantity"
                  min={1}
                  value={form.quantity}
                  onChange={(value) => updateField("quantity", value as LaptopRequirement["quantity"])}
                  required
                />
                <NumberField
                  label="Budget per laptop"
                  min={10000}
                  step={1000}
                  value={form.budgetPerLaptop}
                  onChange={(value) => updateField("budgetPerLaptop", value as LaptopRequirement["budgetPerLaptop"])}
                  required
                />
                <SelectField
                  label="Priority"
                  value={form.priority}
                  onChange={(value) => updateField("priority", value as LaptopRequirement["priority"])}
                  options={priorities}
                  placeholder="Select priority"
                  required
                />
              </div>
            </FormSection>

            <FormSection
              icon={Cpu}
              eyebrow="Section 2"
              title="Laptop Requirement"
              description="Choose the device class, operating system, hardware profile, warranty, support, and security expectations."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SelectField label="Laptop type" value={form.laptopType} onChange={(value) => updateField("laptopType", value as LaptopRequirement["laptopType"])} options={laptopTypes} placeholder="Select laptop type" required />
                <SelectField label="Processor" value={form.processor} onChange={(value) => updateField("processor", value)} options={processors} placeholder="Select processor" required />
                <SelectField label="RAM" value={String(form.ramGb)} onChange={(value) => updateField("ramGb", Number(value))} options={ramOptions.map(String)} suffix="GB" placeholder="Select RAM" required />
                <SelectField label="Storage" value={String(form.storageGb)} onChange={(value) => updateField("storageGb", Number(value))} options={storageOptions.map((option) => ({ label: option.label, value: String(option.value) }))} placeholder="Select storage" required />
                <SelectField label="Operating system" value={form.operatingSystem} onChange={(value) => updateField("operatingSystem", value)} options={operatingSystems} placeholder="Select operating system" required />
                <SelectField label="Display size" value={form.displaySize} onChange={(value) => updateField("displaySize", value as LaptopRequirement["displaySize"])} options={displaySizes} placeholder="Select display size" required />
                <SelectField label="Brand preference" value={form.brandPreference} onChange={(value) => updateField("brandPreference", value as LaptopRequirement["brandPreference"])} options={brandPreferences} placeholder="Select brand preference" required />
                <SelectField label="Warranty requirement" value={form.warrantyRequirement} onChange={(value) => updateField("warrantyRequirement", value as LaptopRequirement["warrantyRequirement"])} options={warrantyRequirements} placeholder="Select warranty" required />
                <SelectField label="Support requirement" value={form.supportRequirement} onChange={(value) => updateField("supportRequirement", value as LaptopRequirement["supportRequirement"])} options={supportRequirements} placeholder="Select support" required />
                <label className="md:col-span-2 xl:col-span-3">
                  <span className="field-label">Security requirement</span>
                  <select
                    className="field-input"
                    value={form.securityRequirement}
                    onChange={(event) => updateField("securityRequirement", event.target.value as LaptopRequirement["securityRequirement"])}
                    required
                  >
                    <option value="" disabled>
                      Select security requirement
                    </option>
                    {securityRequirements.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </FormSection>

            <FormSection
              icon={PackageCheck}
              eyebrow="Section 3"
              title="Supplier Preferences"
              description="Set vendor location, quality threshold, required certifications, enterprise experience, and delivery timeline."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Preferred supplier location" value={form.preferredSupplierLocation} onChange={(value) => updateField("preferredSupplierLocation", value as LaptopRequirement["preferredSupplierLocation"])} options={supplierLocations} placeholder="Select supplier location" required />
                <SelectField label="Minimum supplier rating" value={form.minimumSupplierRating} onChange={(value) => updateField("minimumSupplierRating", value as LaptopRequirement["minimumSupplierRating"])} options={supplierRatings} placeholder="Select minimum rating" required />
                <SelectField label="Past enterprise experience required" value={form.enterpriseExperienceRequired} onChange={(value) => updateField("enterpriseExperienceRequired", value as LaptopRequirement["enterpriseExperienceRequired"])} options={["Yes", "No"]} placeholder="Select Yes or No" required />
                <SelectField label="Maximum delivery timeline" value={form.maximumDeliveryTimeline} onChange={(value) => updateField("maximumDeliveryTimeline", value as LaptopRequirement["maximumDeliveryTimeline"])} options={deliveryTimelineOptions} placeholder="Select delivery timeline" required />
              </div>

              <fieldset className="mt-4">
                <legend className="field-label">Required certifications</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {certificationOptions.map((certification) => {
                    const active = form.requiredCertifications.includes(certification);
                    return (
                      <button
                        className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition duration-200 ${
                          active
                            ? "border-mahindra-red bg-red-50 text-mahindra-red shadow-[0_10px_26px_rgba(215,25,32,0.12)]"
                            : "border-white/80 bg-white/[0.78] text-mahindra-ink hover:border-red-100 hover:bg-white"
                        }`}
                        key={certification}
                        onClick={() => toggleCertification(certification)}
                        type="button"
                      >
                        <BadgeCheck size={17} />
                        {certification}
                      </button>
                    );
                  })}
                </div>
                {certificationError && (
                  <p className="mt-2 text-sm font-semibold text-mahindra-red">{certificationError}</p>
                )}
              </fieldset>
            </FormSection>

            <FormSection
              icon={FileText}
              eyebrow="Section 4"
              title="Additional Notes"
              description="Add any non-standard technical, delivery, support, asset tagging, or procurement instructions."
            >
              <label>
                <span className="field-label">Special requirement</span>
                <textarea
                  className="field-input min-h-36 resize-y"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Example: Include docking compatibility, device imaging, e-waste support, or staggered delivery needs."
                />
              </label>
            </FormSection>

            <div className="flex flex-col gap-3 rounded-lg border border-white/80 bg-white/[0.88] p-4 shadow-[0_18px_48px_rgba(36,39,44,0.09)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-mahindra-ink">
                  Estimated sourcing value: INR {formatCurrency(getEstimatedValue(form))}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Requirement will be saved locally and analyzed by deterministic mock logic.
                </p>
              </div>
              <button className="primary-button" type="submit">
                <Sparkles size={18} />
                Find Suppliers
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="metric-tile sticky top-24">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-md bg-red-50 text-mahindra-red">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="field-label">Simulated AI helper</p>
                  <h2 className="text-lg font-bold text-mahindra-ink">
                    Supplier matching preview
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                The simulated AI agent will analyze your laptop procurement requirement, compare supplier fit, score vendors against budget, stock, delivery, compliance, and service signals, then recommend suppliers for RFQ.
              </p>
              <div className="mt-5 space-y-3">
                <SummaryRow icon={Building2} label="Department" value={form.department || "Not selected"} />
                <SummaryRow icon={MapPin} label="Delivery" value={form.deliveryLocation || "Not selected"} />
                <SummaryRow icon={CalendarDays} label="Timeline" value={form.maximumDeliveryTimeline || "Not selected"} />
                <SummaryRow icon={ShieldCheck} label="Certifications" value={`${form.requiredCertifications.length} selected`} />
              </div>
            </div>

            <div className="metric-tile">
              <p className="field-label">Demo guardrails</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                No OpenAI API, external AI service, real email, real authentication, or official logo is used.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}

type SelectOption = string | { label: string; value: string };

function FormSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  children
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="premium-card p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_68px_rgba(36,39,44,0.13)]">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-mahindra-red shadow-inner">
          <Icon size={22} />
        </div>
        <div>
          <p className="field-label">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-mahindra-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
  required = false
}: {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  step?: number;
  required?: boolean;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        min={min}
        onChange={(event) =>
          onChange(event.target.value === "" ? "" : Number(event.target.value))
        }
        required={required}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  suffix,
  placeholder,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  suffix?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <select
        className="field-input"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const labelValue = typeof option === "string" ? option : option.label;
          const optionValue = typeof option === "string" ? option : option.value;
          return (
            <option key={optionValue} value={optionValue}>
              {labelValue}
              {suffix ? ` ${suffix}` : ""}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/80 bg-white/[0.68] p-3">
      <Icon className="shrink-0 text-mahindra-red" size={18} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-mahindra-ink">{value}</p>
      </div>
    </div>
  );
}

function normalizeRequirement(requirement: LaptopRequirement): LaptopRequirement {
  const maximumDeliveryTimeline = requirement.maximumDeliveryTimeline || "30 days";
  const warrantyRequirement = requirement.warrantyRequirement || "1 year";

  return {
    ...requirement,
    budgetPerUnit: requirement.budgetPerLaptop,
    deliveryCity: requirement.deliveryLocation,
    deliveryDays: Number(maximumDeliveryTimeline.split(" ")[0]),
    warrantyYears: Number(warrantyRequirement.split(" ")[0]),
    sustainabilityPriority: requirement.priority === "Urgent" ? "high" : requirement.priority === "High" ? "preferred" : "standard"
  };
}

function getEstimatedValue(requirement: LaptopRequirement) {
  const quantity = Number(requirement.quantity);
  const budgetPerLaptop = Number(requirement.budgetPerLaptop);

  if (!Number.isFinite(quantity) || !Number.isFinite(budgetPerLaptop)) {
    return 0;
  }

  return quantity * budgetPerLaptop;
}
