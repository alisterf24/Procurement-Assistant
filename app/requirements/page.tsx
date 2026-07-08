"use client";

import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ClipboardList,
  Cpu,
  RotateCcw,
  Search
} from "lucide-react";
import { AgentLoadingModal } from "@/components/agent-loading-modal";
import { AppShell } from "@/components/app-shell";
import { Stepper } from "@/components/stepper";
import { defaultRequirement, formatCurrency } from "@/lib/scoring";
import { useDemoState } from "@/lib/use-demo-state";
import type { LaptopRequirement } from "@/lib/types";
import { useEffect, useState } from "react";

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
const operatingSystems = ["Windows 11 Pro", "Ubuntu Linux", "No OS", "No Preference"];
const brandPreferences: LaptopRequirement["brandPreference"][] = [
  "Dell",
  "HP",
  "Lenovo",
  "Apple",
  "No Preference"
];
const departments = [
  "Strategic Procurement",
  "Product Engineering",
  "IT Operations",
  "Finance",
  "Sales",
  "Manufacturing"
];
const deliveryLocations = ["Mumbai", "Pune", "Nashik", "Bengaluru", "Delhi NCR"];

const internalDefaults: Pick<
  LaptopRequirement,
  | "priority"
  | "displaySize"
  | "warrantyRequirement"
  | "supportRequirement"
  | "securityRequirement"
  | "preferredSupplierLocation"
  | "minimumSupplierRating"
  | "requiredCertifications"
  | "enterpriseExperienceRequired"
  | "maximumDeliveryTimeline"
  | "deliveryDays"
  | "warrantyYears"
  | "notes"
> = {
  priority: "Medium",
  displaySize: "14 inch",
  warrantyRequirement: "1 year",
  supportRequirement: "Standard Support",
  securityRequirement: "No Specific Requirement",
  preferredSupplierLocation: "Any",
  minimumSupplierRating: "3.5",
  requiredCertifications: [],
  enterpriseExperienceRequired: "No",
  maximumDeliveryTimeline: "30 days",
  deliveryDays: 30,
  warrantyYears: 1,
  notes: ""
};

const blankRequirement: LaptopRequirement = {
  ...defaultRequirement,
  ...internalDefaults,
  requestTitle: "",
  department: "",
  deliveryLocation: "",
  deliveryCity: "",
  requiredDeliveryDate: "",
  quantity: "" as unknown as number,
  budgetPerLaptop: "" as unknown as number,
  budgetPerUnit: "" as unknown as number,
  laptopType: "" as LaptopRequirement["laptopType"],
  processor: "",
  ramGb: "" as unknown as number,
  storageGb: "" as unknown as number,
  operatingSystem: "",
  brandPreference: "" as LaptopRequirement["brandPreference"]
};

const sampleRequirement: LaptopRequirement = {
  ...defaultRequirement,
  ...internalDefaults,
  requestTitle: "Q3 Laptop Refresh for Product Engineering",
  department: "Product Engineering",
  deliveryLocation: "Pune",
  deliveryCity: "Pune",
  requiredDeliveryDate: "2026-08-05",
  quantity: 85,
  budgetPerLaptop: 92000,
  budgetPerUnit: 92000,
  laptopType: "Developer Laptop",
  processor: "Intel i7",
  ramGb: 32,
  storageGb: 1024,
  operatingSystem: "Windows 11 Pro",
  brandPreference: "Lenovo"
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
  const [loadingDetail, setLoadingDetail] = useState("Reviewing requirement...");

  useEffect(() => {
    if (hydrated) {
      setForm(blankRequirement);
    }
  }, [hydrated]);

  function updateField<K extends keyof LaptopRequirement>(key: K, value: LaptopRequirement[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function loadSampleRequirement() {
    setForm(sampleRequirement);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRequirement = normalizeRequirement(form);

    setLoadingDetail("Reviewing requirement...");
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
        title="Reviewing requirement"
        detail={loadingDetail}
      />

      <main className="mx-auto max-w-6xl px-5 py-6 sm:py-8">
        <Stepper current={0} />

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="agent-status-badge">
              <ClipboardList size={15} />
              Requirement workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-mahindra-ink md:text-4xl">
              Create Laptop Sourcing Event
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 md:text-base">
              Capture the procurement request and core laptop specification.
            </p>
          </div>
          <button className="secondary-button" onClick={loadSampleRequirement} type="button">
            <RotateCcw size={17} />
            Load Sample Laptop Requirement
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <FormSection
            icon={BriefcaseBusiness}
            eyebrow="Section 1"
            title="Basic Details"
            description="Demand, delivery location, date, quantity, and budget."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Request Title"
                value={form.requestTitle}
                onChange={(value) => updateField("requestTitle", value)}
                placeholder="Example: Q3 laptop refresh"
                required
              />
              <SelectField
                label="Business Unit / Department"
                value={form.department}
                onChange={(value) => updateField("department", value)}
                options={departments}
                placeholder="Select department"
                required
              />
              <SelectField
                label="Delivery Location"
                value={form.deliveryLocation}
                onChange={(value) => updateField("deliveryLocation", value)}
                options={deliveryLocations}
                placeholder="Select delivery location"
                required
              />
              <label>
                <span className="field-label">Required Delivery Date</span>
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
                placeholder="Enter quantity"
                required
              />
              <NumberField
                label="Budget Range / Estimated Budget"
                min={10000}
                step={1000}
                value={form.budgetPerLaptop}
                onChange={(value) => updateField("budgetPerLaptop", value as LaptopRequirement["budgetPerLaptop"])}
                placeholder="Budget per laptop"
                required
              />
            </div>
          </FormSection>

          <FormSection
            icon={Cpu}
            eyebrow="Section 2"
            title="Laptop Requirement"
            description="Core device class and configuration."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SelectField
                label="Laptop Category"
                value={form.laptopType}
                onChange={(value) => updateField("laptopType", value as LaptopRequirement["laptopType"])}
                options={laptopTypes}
                placeholder="Select laptop category"
                required
              />
              <SelectField
                label="Processor Class"
                value={form.processor}
                onChange={(value) => updateField("processor", value)}
                options={processors}
                placeholder="Select processor class"
                required
              />
              <SelectField
                label="RAM"
                value={String(form.ramGb)}
                onChange={(value) => updateField("ramGb", Number(value))}
                options={ramOptions.map((option) => ({
                  label: `${option} GB`,
                  value: String(option)
                }))}
                placeholder="Select RAM"
                required
              />
              <SelectField
                label="Storage"
                value={storageValue(form.storageGb)}
                onChange={(value) => updateField("storageGb", Number(value))}
                options={storageOptions.map((option) => ({
                  label: option.label,
                  value: String(option.value)
                }))}
                placeholder="Select storage"
                required
              />
              <SelectField
                label="Operating System"
                value={form.operatingSystem}
                onChange={(value) => updateField("operatingSystem", value)}
                options={operatingSystems}
                placeholder="Select operating system"
                required
              />
              <SelectField
                label="Preferred Brand"
                value={form.brandPreference}
                onChange={(value) => updateField("brandPreference", value as LaptopRequirement["brandPreference"])}
                options={brandPreferences}
                placeholder="Select preferred brand"
                required
              />
            </div>
          </FormSection>

          <div className="flex flex-col gap-3 rounded-lg border border-white/80 bg-white/[0.9] p-4 shadow-[0_18px_48px_rgba(36,39,44,0.09)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-mahindra-ink">
                Estimated value: INR {formatCurrency(getEstimatedValue(form))}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Requirement will be saved locally for this run.
              </p>
            </div>
            <button className="primary-button" type="submit">
              <Search size={18} />
              Find Suppliers
            </button>
          </div>
        </form>
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
    <section className="premium-card p-5 transition duration-200 hover:shadow-[0_20px_56px_rgba(36,39,44,0.105)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-mahindra-red shadow-inner">
          <Icon size={20} />
        </div>
        <div>
          <p className="field-label">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold leading-tight text-mahindra-ink">{title}</h2>
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
  placeholder,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
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
  placeholder,
  required = false
}: {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  step?: number;
  placeholder?: string;
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
        placeholder={placeholder}
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
  placeholder,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
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
            </option>
          );
        })}
      </select>
    </label>
  );
}

function normalizeRequirement(requirement: LaptopRequirement): LaptopRequirement {
  return {
    ...requirement,
    ...internalDefaults,
    budgetPerUnit: requirement.budgetPerLaptop,
    deliveryCity: requirement.deliveryLocation,
    sustainabilityPriority: "standard"
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

function storageValue(value: number) {
  return Number.isFinite(Number(value)) ? String(value) : "";
}
