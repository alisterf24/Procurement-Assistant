import { laptopSuppliers, type LaptopSupplier } from "@/data/suppliers";
import type { LaptopRequirement, RFQDraft } from "@/lib/types";

export type RequirementSummary = {
  itemRequired: string;
  quantity: number;
  location: string;
  timeline: string;
  keyTechnicalRequirements: string[];
  keySupplierSelectionCriteria: string[];
};

export type RequirementAnalysis = {
  title: string;
  summary: string;
  shortSummary: RequirementSummary;
  riskFlags: string[];
  recommendedStrategy: string;
};

export type SupplierScoreBreakdown = {
  laptopTypeCategorySupport: number;
  brandMatch: number;
  deliveryTimelineMatch: number;
  locationOrServiceCoverageMatch: number;
  certificationMatch: number;
  ratingMeetsMinimum: number;
  warrantySupportMatch: number;
  pastEnterpriseExperience: number;
  totalScore: number;
  matchPercentage: number;
};

export type SupplierRecommendation = {
  supplier: LaptopSupplier;
  scoreBreakdown: SupplierScoreBreakdown;
  matchPercentage: number;
  recommendationReason: string;
  fitCategory: "Excellent" | "Strong" | "Moderate" | "Limited";
};

const REQUIREMENT_STORAGE_KEY = "mm-laptop-requirement";

const MAX_POINTS = {
  laptopTypeCategorySupport: 20,
  brandMatch: 15,
  deliveryTimelineMatch: 15,
  locationOrServiceCoverageMatch: 15,
  certificationMatch: 15,
  ratingMeetsMinimum: 10,
  warrantySupportMatch: 5,
  pastEnterpriseExperience: 5
} satisfies Record<keyof Omit<SupplierScoreBreakdown, "totalScore" | "matchPercentage">, number>;

export function analyzeRequirement(requirement?: LaptopRequirement): RequirementAnalysis {
  const resolvedRequirement = resolveRequirement(requirement);
  const estimatedValue = resolvedRequirement.quantity * resolvedRequirement.budgetPerLaptop;
  const riskFlags = buildRequirementRiskFlags(resolvedRequirement);

  return {
    title: resolvedRequirement.requestTitle,
    summary:
      `The simulated AI agent has analyzed ${resolvedRequirement.quantity} ${resolvedRequirement.laptopType.toLowerCase()} units for ${resolvedRequirement.department}. ` +
      `The event targets ${resolvedRequirement.deliveryLocation} delivery within ${resolvedRequirement.maximumDeliveryTimeline}, with an estimated sourcing value of INR ${formatCurrency(estimatedValue)}.`,
    shortSummary: {
      itemRequired: resolvedRequirement.laptopType,
      quantity: resolvedRequirement.quantity,
      location: resolvedRequirement.deliveryLocation,
      timeline: resolvedRequirement.maximumDeliveryTimeline,
      keyTechnicalRequirements: [
        `${resolvedRequirement.processor} processor`,
        `${resolvedRequirement.ramGb} GB RAM`,
        `${formatStorage(resolvedRequirement.storageGb)} storage`,
        `${resolvedRequirement.operatingSystem}`,
        `${resolvedRequirement.displaySize} display`,
        `${resolvedRequirement.securityRequirement} security`
      ],
      keySupplierSelectionCriteria: [
        `${resolvedRequirement.preferredSupplierLocation} supplier preference`,
        `${resolvedRequirement.minimumSupplierRating}+ minimum supplier rating`,
        `${resolvedRequirement.requiredCertifications.join(", ") || "No mandatory certification"}`,
        `${resolvedRequirement.warrantyRequirement} warranty`,
        `${resolvedRequirement.supportRequirement}`,
        `Enterprise experience required: ${resolvedRequirement.enterpriseExperienceRequired}`
      ]
    },
    riskFlags,
    recommendedStrategy:
      riskFlags.length > 0
        ? "Prioritize suppliers with confirmed stock, strong delivery coverage, and proven enterprise rollout experience before issuing the RFQ."
        : "Proceed with the highest-scoring suppliers and use delivery SLA, warranty support, and certification compliance as RFQ evaluation levers."
  };
}

export function scoreSuppliers(
  requirement?: LaptopRequirement,
  suppliers: LaptopSupplier[] = laptopSuppliers
): SupplierRecommendation[] {
  const resolvedRequirement = resolveRequirement(requirement);

  return suppliers
    .map((supplier) => {
      const scoreBreakdown = buildScoreBreakdown(resolvedRequirement, supplier);
      const matchPercentage = scoreBreakdown.matchPercentage;

      return {
        supplier,
        scoreBreakdown,
        matchPercentage,
        recommendationReason: generateRecommendationReason(
          resolvedRequirement,
          supplier,
          scoreBreakdown
        ),
        fitCategory: getFitCategory(matchPercentage)
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export function generateRecommendationReason(
  requirement: LaptopRequirement,
  supplier: LaptopSupplier,
  scoreBreakdown: SupplierScoreBreakdown
): string {
  const strengths = getStrengthPhrases(requirement, supplier, scoreBreakdown);
  const watchItems = getWatchItems(requirement, supplier, scoreBreakdown);
  const fitCategory = getFitCategory(scoreBreakdown.matchPercentage).toLowerCase();

  return [
    `Recommended as a ${fitCategory} match at ${scoreBreakdown.matchPercentage}% because ${supplier.name} ${strengths.join(", ")}.`,
    watchItems.length
      ? `The simulated AI agent also notes ${watchItems.join(", ")} as follow-up points before final award.`
      : "The simulated AI agent found no major fit gaps for this requirement."
  ].join(" ");
}

export function generateRFQEmail(
  requirement: LaptopRequirement,
  selectedSuppliers: LaptopSupplier[],
  loggedInUserEmail: string
): RFQDraft {
  const analysis = analyzeRequirement(requirement);
  const responseDate = addDays(new Date(), 5);
  const selectedSupplierCapabilities = summarizeSelectedSupplierCapabilities(selectedSuppliers);

  return {
    subject: `RFQ Invitation - Procurement of ${requirement.quantity} ${requirement.laptopType}s for ${requirement.deliveryLocation}`,
    body: `Dear Supplier Partner,

We are inviting commercial quotations for a laptop procurement sourcing event. Please review the requirement below and share your best technical and commercial offer.

Procurement requirement summary:
- Request title: ${requirement.requestTitle}
- Business unit / department: ${requirement.department}
- Item required: ${analysis.shortSummary.itemRequired}
- Quantity: ${analysis.shortSummary.quantity} units
- Delivery location: ${analysis.shortSummary.location}
- Required delivery date: ${formatDisplayDate(requirement.requiredDeliveryDate)}
- Expected delivery timeline: ${analysis.shortSummary.timeline}
- Priority: ${requirement.priority}

Laptop specifications:
- Laptop type: ${requirement.laptopType}
- Processor: ${requirement.processor}
- RAM: ${requirement.ramGb} GB
- Storage: ${formatStorage(requirement.storageGb)}
- Operating system: ${requirement.operatingSystem}
- Display size: ${requirement.displaySize}
- Brand preference: ${requirement.brandPreference}
- Security requirement: ${requirement.securityRequirement}
- Budget per laptop: INR ${formatCurrency(requirement.budgetPerLaptop)}

Warranty and support requirements:
- Warranty expectation: ${requirement.warrantyRequirement}
- Support expectation: ${requirement.supportRequirement}

Certification and compliance expectations:
- Required certifications: ${requirement.requiredCertifications.join(", ") || "No specific certification"}
- Past enterprise experience required: ${requirement.enterpriseExperienceRequired}
- Minimum supplier rating considered for shortlist: ${requirement.minimumSupplierRating}

Please include the following in your response:
- Commercial quotation with unit price, applicable taxes, and total landed cost
- Confirmed delivery timeline and stock availability
- Warranty terms and support SLA
- Payment terms
- Quote validity period
- Certification, compliance, and OEM authorization details where applicable
- Any assumptions, exclusions, or dependencies

Additional requirement notes:
${requirement.notes || "No additional notes provided."}

Please submit your response by ${formatDisplayDate(responseDate.toISOString().slice(0, 10))}.

Regards,
Procurement Manager
From: ${loggedInUserEmail}

M&M AI Sourcing Assistant Demo`,
    aiNote:
      "This RFQ draft was generated based on the procurement requirement and selected supplier capabilities. " +
      `${selectedSupplierCapabilities} No real email has been sent.`
  };
}

function buildScoreBreakdown(
  requirement: LaptopRequirement,
  supplier: LaptopSupplier
): SupplierScoreBreakdown {
  const laptopTypeCategorySupport = supplier.laptopTypesSupported.includes(requirement.laptopType)
    ? MAX_POINTS.laptopTypeCategorySupport
    : 0;
  const brandMatch = scoreBrandMatch(requirement, supplier);
  const deliveryTimelineMatch = scoreDeliveryTimeline(requirement, supplier);
  const locationOrServiceCoverageMatch = scoreLocationCoverage(requirement, supplier);
  const certificationMatch = scoreCertificationMatch(requirement, supplier);
  const ratingMeetsMinimum =
    supplier.rating >= Number(requirement.minimumSupplierRating)
      ? MAX_POINTS.ratingMeetsMinimum
      : 0;
  const warrantySupportMatch = scoreWarrantyAndSupport(requirement, supplier);
  const pastEnterpriseExperience =
    requirement.enterpriseExperienceRequired === "No" || supplier.pastEnterpriseExperience
      ? MAX_POINTS.pastEnterpriseExperience
      : 0;
  const totalScore =
    laptopTypeCategorySupport +
    brandMatch +
    deliveryTimelineMatch +
    locationOrServiceCoverageMatch +
    certificationMatch +
    ratingMeetsMinimum +
    warrantySupportMatch +
    pastEnterpriseExperience;

  return {
    laptopTypeCategorySupport,
    brandMatch,
    deliveryTimelineMatch,
    locationOrServiceCoverageMatch,
    certificationMatch,
    ratingMeetsMinimum,
    warrantySupportMatch,
    pastEnterpriseExperience,
    totalScore,
    matchPercentage: totalScore
  };
}

function scoreBrandMatch(requirement: LaptopRequirement, supplier: LaptopSupplier) {
  if (requirement.brandPreference === "No Preference") {
    return MAX_POINTS.brandMatch;
  }

  return supplier.brandsSupported.includes(requirement.brandPreference)
    ? MAX_POINTS.brandMatch
    : 0;
}

function scoreDeliveryTimeline(requirement: LaptopRequirement, supplier: LaptopSupplier) {
  const requestedDays = Number(requirement.maximumDeliveryTimeline.split(" ")[0]);

  if (supplier.averageDeliveryDays <= requestedDays) {
    return MAX_POINTS.deliveryTimelineMatch;
  }

  const delay = supplier.averageDeliveryDays - requestedDays;

  if (delay <= 3) {
    return 10;
  }

  if (delay <= 7) {
    return 6;
  }

  return 0;
}

function scoreLocationCoverage(requirement: LaptopRequirement, supplier: LaptopSupplier) {
  if (requirement.preferredSupplierLocation === "Any") {
    return supplier.serviceCoverage.includes(requirement.deliveryLocation)
      ? MAX_POINTS.locationOrServiceCoverageMatch
      : 12;
  }

  if (supplier.location === requirement.preferredSupplierLocation) {
    return MAX_POINTS.locationOrServiceCoverageMatch;
  }

  if (supplier.serviceCoverage.includes(requirement.preferredSupplierLocation)) {
    return 12;
  }

  if (supplier.serviceCoverage.includes(requirement.deliveryLocation)) {
    return 10;
  }

  return 0;
}

function scoreCertificationMatch(requirement: LaptopRequirement, supplier: LaptopSupplier) {
  if (requirement.requiredCertifications.length === 0) {
    return MAX_POINTS.certificationMatch;
  }

  const matchedCount = requirement.requiredCertifications.filter((certification) =>
    supplier.certifications.includes(certification)
  ).length;

  return Math.round((matchedCount / requirement.requiredCertifications.length) * MAX_POINTS.certificationMatch);
}

function scoreWarrantyAndSupport(requirement: LaptopRequirement, supplier: LaptopSupplier) {
  const warrantyMatch = supplier.warrantySupport.includes(requirement.warrantyRequirement);
  const supportMatch = supplier.supportCapability.includes(requirement.supportRequirement);

  if (warrantyMatch && supportMatch) {
    return MAX_POINTS.warrantySupportMatch;
  }

  if (warrantyMatch || supportMatch) {
    return 3;
  }

  return 0;
}

function resolveRequirement(requirement?: LaptopRequirement) {
  if (requirement) {
    return requirement;
  }

  if (typeof window !== "undefined") {
    const storedRequirement = window.localStorage.getItem(REQUIREMENT_STORAGE_KEY);

    if (storedRequirement) {
      return JSON.parse(storedRequirement) as LaptopRequirement;
    }
  }

  throw new Error("A laptop procurement requirement is required for simulated agent analysis.");
}

function getStrengthPhrases(
  requirement: LaptopRequirement,
  supplier: LaptopSupplier,
  scoreBreakdown: SupplierScoreBreakdown
) {
  const strengths: string[] = [];

  if (scoreBreakdown.laptopTypeCategorySupport === MAX_POINTS.laptopTypeCategorySupport) {
    strengths.push(`supports ${requirement.laptopType.toLowerCase()} procurement`);
  }

  if (scoreBreakdown.locationOrServiceCoverageMatch >= 12) {
    strengths.push(`covers ${requirement.deliveryLocation} delivery`);
  }

  if (supplier.certifications.includes("OEM Authorized Partner")) {
    strengths.push("has OEM authorization");
  }

  if (scoreBreakdown.certificationMatch === MAX_POINTS.certificationMatch) {
    strengths.push("matches the required certifications");
  }

  if (scoreBreakdown.warrantySupportMatch === MAX_POINTS.warrantySupportMatch) {
    strengths.push(`meets the ${requirement.warrantyRequirement} warranty and ${requirement.supportRequirement} support requirement`);
  }

  if (scoreBreakdown.pastEnterpriseExperience === MAX_POINTS.pastEnterpriseExperience) {
    strengths.push("has strong enterprise procurement experience");
  }

  if (scoreBreakdown.deliveryTimelineMatch === MAX_POINTS.deliveryTimelineMatch) {
    strengths.push(`can meet the ${requirement.maximumDeliveryTimeline} delivery timeline`);
  }

  if (strengths.length === 0) {
    strengths.push("has partial alignment with the sourcing requirement");
  }

  return strengths.slice(0, 5);
}

function getWatchItems(
  requirement: LaptopRequirement,
  supplier: LaptopSupplier,
  scoreBreakdown: SupplierScoreBreakdown
) {
  const watchItems: string[] = [];

  if (scoreBreakdown.brandMatch === 0) {
    watchItems.push(`${requirement.brandPreference} brand availability should be confirmed`);
  }

  if (scoreBreakdown.deliveryTimelineMatch < MAX_POINTS.deliveryTimelineMatch) {
    watchItems.push(`average delivery is ${supplier.averageDeliveryDays} days versus the ${requirement.maximumDeliveryTimeline} target`);
  }

  if (scoreBreakdown.certificationMatch < MAX_POINTS.certificationMatch) {
    watchItems.push("certification coverage is incomplete");
  }

  if (scoreBreakdown.ratingMeetsMinimum === 0) {
    watchItems.push(`rating ${supplier.rating} is below the ${requirement.minimumSupplierRating} minimum`);
  }

  if (scoreBreakdown.warrantySupportMatch < MAX_POINTS.warrantySupportMatch) {
    watchItems.push("warranty or support commitment needs confirmation");
  }

  if (scoreBreakdown.pastEnterpriseExperience === 0) {
    watchItems.push("enterprise procurement experience is limited");
  }

  return watchItems.slice(0, 3);
}

function buildRequirementRiskFlags(requirement: LaptopRequirement) {
  const flags: string[] = [];

  if (requirement.priority === "Urgent") {
    flags.push("Urgent priority may limit supplier response time.");
  }

  if (Number(requirement.maximumDeliveryTimeline.split(" ")[0]) <= 7) {
    flags.push("Seven-day delivery target requires confirmed supplier stock.");
  }

  if (requirement.requiredCertifications.includes("ISO 27001")) {
    flags.push("ISO 27001 requirement narrows the eligible supplier pool.");
  }

  return flags;
}

function getFitCategory(matchPercentage: number): SupplierRecommendation["fitCategory"] {
  if (matchPercentage >= 85) {
    return "Excellent";
  }

  if (matchPercentage >= 72) {
    return "Strong";
  }

  if (matchPercentage >= 55) {
    return "Moderate";
  }

  return "Limited";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function formatStorage(storageGb: number) {
  return storageGb >= 1024 ? `${storageGb / 1024} TB SSD` : `${storageGb} GB SSD`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function summarizeSelectedSupplierCapabilities(selectedSuppliers: LaptopSupplier[]) {
  if (selectedSuppliers.length === 0) {
    return "No suppliers are currently selected for the RFQ draft.";
  }

  const uniqueLocations = new Set(selectedSuppliers.map((supplier) => supplier.location));
  const uniqueBrands = new Set(selectedSuppliers.flatMap((supplier) => supplier.brandsSupported));
  const uniqueCertifications = new Set(
    selectedSuppliers.flatMap((supplier) => supplier.certifications)
  );

  return `${selectedSuppliers.length} supplier${selectedSuppliers.length === 1 ? " was" : "s were"} selected, covering ${Array.from(uniqueLocations).join(", ")} with supported brands including ${Array.from(uniqueBrands).slice(0, 5).join(", ")} and certifications including ${Array.from(uniqueCertifications).slice(0, 4).join(", ")}.`;
}
