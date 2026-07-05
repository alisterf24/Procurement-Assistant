import { mockSuppliers } from "@/lib/mock-suppliers";
import type { LaptopRequirement, RFQDraft, Supplier, SupplierRecommendation } from "@/lib/types";

export const defaultRequirement: LaptopRequirement = {
  requestTitle: "FY26 Enterprise Laptop Refresh",
  department: "Strategic Procurement",
  deliveryLocation: "Mumbai",
  requiredDeliveryDate: "2026-07-20",
  quantity: 120,
  budgetPerLaptop: 74000,
  priority: "High",
  laptopType: "Business Laptop",
  processor: "Intel i7",
  ramGb: 16,
  storageGb: 512,
  operatingSystem: "Windows 11 Pro",
  displaySize: "14 inch",
  brandPreference: "No Preference",
  warrantyRequirement: "3 years onsite",
  supportRequirement: "Next Business Day Support",
  securityRequirement: "TPM",
  preferredSupplierLocation: "Mumbai",
  minimumSupplierRating: "4.0",
  requiredCertifications: ["GST Registered", "OEM Authorized Partner"],
  enterpriseExperienceRequired: "Yes",
  maximumDeliveryTimeline: "15 days",
  budgetPerUnit: 74000,
  deliveryCity: "Mumbai",
  deliveryDays: 15,
  warrantyYears: 3,
  sustainabilityPriority: "preferred",
  notes: "Prefer OEM-authorized suppliers with enterprise support and buyback or e-waste handling."
};

export function scoreSuppliers(requirement: LaptopRequirement): SupplierRecommendation[] {
  return mockSuppliers
    .map((supplier) => {
      const priceFit = clamp(100 - Math.max(0, supplier.avgUnitPrice - requirement.budgetPerUnit) / 450, 35, 100);
      const deliveryFit = supplier.leadTimeDays <= requirement.deliveryDays ? 100 : clamp(100 - (supplier.leadTimeDays - requirement.deliveryDays) * 10, 40, 95);
      const stockFit = clamp((supplier.stockUnits / requirement.quantity) * 100, 50, 100);
      const warrantyFit = supplier.warrantyYears >= requirement.warrantyYears ? 100 : 65;
      const sustainabilityWeight = requirement.sustainabilityPriority === "high" ? 0.18 : requirement.sustainabilityPriority === "preferred" ? 0.12 : 0.07;
      const baseScore =
        priceFit * 0.2 +
        deliveryFit * 0.18 +
        stockFit * 0.12 +
        warrantyFit * 0.1 +
        supplier.complianceScore * 0.18 +
        supplier.serviceScore * 0.15 +
        supplier.sustainabilityScore * sustainabilityWeight;
      const score = Math.round(clamp(baseScore, 0, 99));
      const fit: SupplierRecommendation["fit"] =
        score >= 90 ? "Excellent" : score >= 84 ? "Strong" : "Conditional";

      return {
        ...supplier,
        score,
        fit,
        estimatedTotal: supplier.avgUnitPrice * requirement.quantity,
        rationale: buildRationale(requirement, supplier, score)
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function generateRFQDraft(
  requirement: LaptopRequirement,
  suppliers: SupplierRecommendation[],
  fromEmail = "procurement.manager@mahindra.com"
): RFQDraft {
  const supplierNames = suppliers.map((supplier) => supplier.name).join(", ");
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 5);

  return {
    subject: `RFQ: ${requirement.requestTitle || `${requirement.quantity} Enterprise Laptops`}`,
    body: `Dear Supplier Partner,

We invite ${supplierNames} to submit a commercial and technical quotation for the following laptop procurement requirement.

Requirement summary:
- Quantity: ${requirement.quantity} units
- Laptop type: ${requirement.laptopType}
- Processor: ${requirement.processor}
- Memory: ${requirement.ramGb} GB RAM
- Storage: ${requirement.storageGb} GB SSD
- Operating system: ${requirement.operatingSystem}
- Display size: ${requirement.displaySize}
- Brand preference: ${requirement.brandPreference}
- Target budget: INR ${formatCurrency(requirement.budgetPerUnit)} per unit
- Delivery location: ${requirement.deliveryCity}
- Required delivery window: ${requirement.deliveryDays} days
- Required delivery date: ${requirement.requiredDeliveryDate}
- Warranty expectation: ${requirement.warrantyRequirement}
- Support expectation: ${requirement.supportRequirement}
- Security requirement: ${requirement.securityRequirement}
- Required certifications: ${requirement.requiredCertifications.join(", ") || "No specific certification"}
- Enterprise experience required: ${requirement.enterpriseExperienceRequired}

Please include unit pricing, delivery schedule, warranty terms, OEM authorization status, support SLA, payment terms, and any sustainability or e-waste handling options.

Additional notes:
${requirement.notes || "No additional notes provided."}

Kindly submit your response by ${dueDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })}.

Regards,
Procurement Manager
From: ${fromEmail}
M&M AI Sourcing Assistant Demo`,
    aiNote:
      "This RFQ draft was generated based on the procurement requirement and selected supplier capabilities. No real email has been sent."
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}

function buildRationale(
  requirement: LaptopRequirement,
  supplier: Supplier,
  score: number
) {
  const rationale = [
    `${supplier.leadTimeDays}-day lead time against ${requirement.deliveryDays}-day target`,
    `${supplier.stockUnits} available units for ${requirement.quantity}-unit requirement`,
    `${supplier.warrantyYears}-year warranty coverage`
  ];

  if (supplier.avgUnitPrice <= requirement.budgetPerUnit) {
    rationale.push("Estimated unit price is within target budget");
  } else {
    rationale.push("Price is above target but offset by service or compliance strength");
  }

  if (score >= 90) {
    rationale.push("High compliance and service scores make this a top RFQ candidate");
  }

  return rationale;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
