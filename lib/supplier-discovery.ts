import type { LaptopSupplier } from "@/data/suppliers";
import type { LaptopRequirement } from "@/lib/types";

export type SupplierSourceType =
  | "Curated public-source registry"
  | "Live public-source check"
  | "Offline demo supplier database";

export type PublicSupplier = LaptopSupplier & {
  address: string;
  publicEmail: string;
  publicContactNumber: string;
  websiteUrl: string;
  sourceUrl: string;
  sourceType: SupplierSourceType;
  enterpriseRelevance: string;
  benchmarkingPoints: string[];
  credibilitySignal: string;
  budgetRange: string;
  relevanceScore: number;
};

export type SupplierDiscoveryResult = {
  suppliers: PublicSupplier[];
  sourceInfo: {
    sourceType: SupplierSourceType;
    sourcesChecked: number;
    sourcesUsed: number;
    query: string;
    note: string;
    sources: Array<{
      name: string;
      url: string;
      available: boolean;
    }>;
  };
};

type RegistrySupplier = Omit<
  PublicSupplier,
  | "averageDeliveryDays"
  | "rating"
  | "riskLevel"
  | "minOrderQuantity"
  | "maxOrderCapacity"
  | "warrantySupport"
  | "supportCapability"
  | "securityCapabilities"
  | "pastEnterpriseExperience"
  | "priceCompetitiveness"
  | "supplierDescription"
  | "relevanceScore"
>;

const NOT_DISCLOSED = "Not publicly disclosed";

const publicSupplierRegistry: RegistrySupplier[] = [
  {
    id: "team-computers",
    name: "Team Computers Pvt. Ltd.",
    email: "sales.india@teamcomputers.com",
    publicEmail: "sales.india@teamcomputers.com",
    publicContactNumber: "1800 102 4200 / 1800 11 4200",
    location: "New Delhi",
    address: "No.1, Mohammadpur, Bhikaji Cama Place, New Delhi - 110066, India",
    serviceCoverage: ["Delhi NCR", "Mumbai", "Pune", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Apple"],
    certifications: ["Public corporate contact listed", "Enterprise IT solutions provider"],
    websiteUrl: "https://teamcomputers.com/",
    sourceUrl: "https://teamcomputers.com/contact-us/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "Enterprise IT solutions provider with end-user device and digital workplace offerings.",
    benchmarkingPoints: [
      "Public head office, email, and toll-free numbers listed",
      "End User Devices and Digital Workplace offerings",
      "Multi-city India presence for enterprise support"
    ],
    credibilitySignal: "Public contact page with head office and India presence",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "redington",
    name: "Redington Limited",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Public branch phone numbers listed",
    location: "Chennai",
    address: "India-focused technology distribution organization with listed branch presence",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad", "Kolkata", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "Apple", "Microsoft", "Cisco", "Google", "IBM"],
    certifications: ["Public branch contact listings", "Technology distributor"],
    websiteUrl: "https://redingtongroup.com/",
    sourceUrl: "https://redingtongroup.com/contact-us/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "Large technology distribution and supply-chain organization serving enterprise and channel needs.",
    benchmarkingPoints: [
      "Public India contact and branch information",
      "Computing and enterprise solution categories listed",
      "Dell appears in featured brand listings"
    ],
    credibilitySignal: "Public corporate site with India contact/branch listings",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "supertron-electronics",
    name: "Supertron Electronics Pvt. Ltd.",
    email: "frontdesk@supertronindia.com",
    publicEmail: "frontdesk@supertronindia.com",
    publicContactNumber: "033-4037 1000",
    location: "Kolkata",
    address: "Supertron House 2, Cooper Lane, Off R N Mukherjee Road, Kolkata, 700001",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad", "Kolkata", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Acer", "Asus"],
    certifications: ["IT Distribution", "Value Added Distribution", "Public branch contacts listed"],
    websiteUrl: "https://www.supertronindia.com/",
    sourceUrl: "https://www.supertronindia.com/contact-us/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "IT and telecom distribution organization with broad India branch coverage.",
    benchmarkingPoints: [
      "Public head office email and phone listed",
      "Multiple India branch locations listed",
      "IT Distribution and Value Added Distribution verticals"
    ],
    credibilitySignal: "Public contact page with head office and branch listings",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "ingram-micro-india",
    name: "Ingram Micro India",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Not publicly disclosed",
    location: "India",
    address: "India operations of global technology distributor",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Apple", "Microsoft"],
    certifications: ["Global technology distributor", "Public corporate presence"],
    websiteUrl: "https://www.ingrammicro.com/",
    sourceUrl: "https://www.ingrammicro.com/en-in",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "Global technology distribution company with India presence and broad OEM channel relevance.",
    benchmarkingPoints: [
      "Large global technology distributor",
      "Relevant for reseller/channel procurement",
      "Suitable benchmark source for OEM availability"
    ],
    credibilitySignal: "Public global distributor website",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "rashi-peripherals",
    name: "Rashi Peripherals Limited",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Not publicly disclosed",
    location: "Mumbai",
    address: "Mumbai-headquartered India IT distribution company",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Acer", "Asus"],
    certifications: ["IT distribution", "Public corporate presence"],
    websiteUrl: "https://www.rptechindia.com/",
    sourceUrl: "https://www.rptechindia.com/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "India IT distribution organization relevant to multi-brand laptop sourcing.",
    benchmarkingPoints: [
      "India-focused IT distribution presence",
      "Multi-brand channel relevance",
      "Useful benchmark for reseller availability"
    ],
    credibilitySignal: "Public corporate website",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "savex-technologies",
    name: "Savex Technologies Pvt. Ltd.",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Not publicly disclosed",
    location: "Mumbai",
    address: "Mumbai-based ICT distribution company",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["HP", "Lenovo", "Dell", "Apple", "Acer"],
    certifications: ["ICT distribution", "Public corporate presence"],
    websiteUrl: "https://www.savex.in/",
    sourceUrl: "https://www.savex.in/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "ICT distribution company relevant for enterprise endpoint and hardware channel sourcing.",
    benchmarkingPoints: [
      "India ICT distribution relevance",
      "Multi-brand endpoint sourcing benchmark",
      "Suitable for channel availability checks"
    ],
    credibilitySignal: "Public corporate website",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "iris-global",
    name: "Iris Global Services Pvt. Ltd.",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Not publicly disclosed",
    location: "New Delhi",
    address: "New Delhi-based IT distribution and supply organization",
    serviceCoverage: ["Delhi NCR", "Mumbai", "Pune", "Bengaluru", "Chennai", "Hyderabad", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Acer", "Asus"],
    certifications: ["IT distribution", "Public corporate presence"],
    websiteUrl: "https://www.irisglobal.in/",
    sourceUrl: "https://www.irisglobal.in/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "IT distribution and supply organization relevant to enterprise laptop procurement.",
    benchmarkingPoints: [
      "India IT distribution relevance",
      "Useful source for enterprise device availability",
      "Multi-brand procurement benchmark"
    ],
    credibilitySignal: "Public corporate website",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "softcell-technologies",
    name: "Softcell Technologies Global Pvt. Ltd.",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Not publicly disclosed",
    location: "Mumbai",
    address: "India technology solutions provider with enterprise IT focus",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Microsoft", "Apple"],
    certifications: ["Enterprise technology solutions", "Public corporate presence"],
    websiteUrl: "https://www.softcell.com/",
    sourceUrl: "https://www.softcell.com/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "Enterprise technology solutions provider relevant to endpoint and IT procurement.",
    benchmarkingPoints: [
      "Enterprise IT solutions relevance",
      "Multi-brand endpoint procurement benchmark",
      "Useful for corporate device sourcing"
    ],
    credibilitySignal: "Public corporate website",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "orient-technologies",
    name: "Orient Technologies Ltd.",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Not publicly disclosed",
    location: "Mumbai",
    address: "Mumbai-based IT solutions and infrastructure services company",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Microsoft"],
    certifications: ["IT infrastructure solutions", "Public corporate presence"],
    websiteUrl: "https://www.orientindia.in/",
    sourceUrl: "https://www.orientindia.in/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "IT infrastructure and solutions provider relevant to corporate laptop and endpoint sourcing.",
    benchmarkingPoints: [
      "Enterprise IT infrastructure relevance",
      "Corporate endpoint sourcing benchmark",
      "India service presence"
    ],
    credibilitySignal: "Public corporate website",
    budgetRange: NOT_DISCLOSED
  },
  {
    id: "dynacons-systems",
    name: "Dynacons Systems & Solutions Ltd.",
    email: "Not publicly disclosed",
    publicEmail: "Not publicly disclosed",
    publicContactNumber: "Not publicly disclosed",
    location: "Mumbai",
    address: "Mumbai-based IT infrastructure and managed services company",
    serviceCoverage: ["Mumbai", "Pune", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Microsoft"],
    certifications: ["IT infrastructure services", "Public corporate presence"],
    websiteUrl: "https://dynacons.com/",
    sourceUrl: "https://dynacons.com/",
    sourceType: "Curated public-source registry",
    enterpriseRelevance: "IT infrastructure and managed services company relevant to enterprise endpoint rollout.",
    benchmarkingPoints: [
      "IT infrastructure services relevance",
      "Corporate endpoint rollout benchmark",
      "India enterprise service orientation"
    ],
    credibilitySignal: "Public corporate website",
    budgetRange: NOT_DISCLOSED
  }
];

export async function discoverSuppliers(
  requirement: LaptopRequirement
): Promise<SupplierDiscoveryResult> {
  const query = buildSupplierSearchQuery(requirement);
  const rankedSuppliers = rankSuppliers(requirement, publicSupplierRegistry)
    .slice(0, 10);
  const sourceChecks = await checkPublicSources(rankedSuppliers);
  const availableSourceUrls = new Set(
    sourceChecks.filter((source) => source.available).map((source) => source.url)
  );
  const suppliers = rankedSuppliers.map((supplier) =>
    toPublicSupplier(supplier, availableSourceUrls.has(supplier.sourceUrl))
  );
  const liveSourceCount = sourceChecks.filter((source) => source.available).length;

  return {
    suppliers,
    sourceInfo: {
      sourceType: "Curated public-source registry",
      sourcesChecked: sourceChecks.length,
      sourcesUsed: suppliers.length,
      query,
      note:
        liveSourceCount > 0
          ? "Supplier source pages were checked server-side where reachable. Suppliers are ranked from a curated public-source registry; only publicly available business details are shown."
          : "Live source checks were unavailable in this environment. Suppliers are ranked from a curated public-source registry; only publicly available business details are shown.",
      sources: sourceChecks
    }
  };
}

export function buildSupplierSearchQuery(requirement: LaptopRequirement) {
  const brand =
    requirement.brandPreference && requirement.brandPreference !== "No Preference"
      ? `${requirement.brandPreference} `
      : "";

  return [
    `${brand}${requirement.laptopType}`,
    "India",
    "enterprise laptop supplier",
    "reseller",
    "authorized partner",
    "corporate laptop dealer"
  ].join(" ");
}

function rankSuppliers(requirement: LaptopRequirement, suppliers: RegistrySupplier[]) {
  return suppliers
    .map((supplier) => ({
      supplier,
      score: scorePublicSupplier(requirement, supplier)
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ supplier, score }) => ({ ...supplier, relevanceScore: score }));
}

function scorePublicSupplier(requirement: LaptopRequirement, supplier: RegistrySupplier) {
  let score = 0;

  if (
    requirement.brandPreference === "No Preference" ||
    supplier.brandsSupported.includes(requirement.brandPreference)
  ) {
    score += 18;
  }

  if (/enterprise|corporate|it solutions|distribution|infrastructure/i.test(supplier.enterpriseRelevance)) {
    score += 15;
  }

  if (supplier.serviceCoverage.some((location) => /india|pan india/i.test(location))) {
    score += 12;
  }

  if (/authorized|oem|partner|distributor/i.test([...supplier.certifications, supplier.credibilitySignal].join(" "))) {
    score += 12;
  }

  if (isPublicContactAvailable(supplier.publicEmail)) {
    score += 8;
  }

  if (isPublicContactAvailable(supplier.publicContactNumber)) {
    score += 7;
  }

  if (
    supplier.serviceCoverage.includes(requirement.deliveryLocation) ||
    supplier.serviceCoverage.some((location) => /pan india/i.test(location))
  ) {
    score += 10;
  }

  if (supplier.sourceUrl && supplier.websiteUrl) {
    score += 8;
  }

  if (supplier.benchmarkingPoints.length >= 3) {
    score += 5;
  }

  if (supplier.laptopTypesSupported.includes(requirement.laptopType)) {
    score += 5;
  }

  return score;
}

function isPublicContactAvailable(value: string) {
  return Boolean(value && value !== NOT_DISCLOSED && !/^Public branch/i.test(value));
}

function toPublicSupplier(
  supplier: RegistrySupplier & { relevanceScore: number },
  sourceAvailable: boolean
): PublicSupplier {
  return {
    ...supplier,
    averageDeliveryDays: 14,
    rating: Math.max(3.5, Math.min(5, Number((supplier.relevanceScore / 20).toFixed(1)))),
    riskLevel: sourceAvailable ? "Low" : "Medium",
    minOrderQuantity: 1,
    maxOrderCapacity: 1000,
    warrantySupport: ["Not publicly disclosed"],
    supportCapability: ["Not publicly disclosed"],
    securityCapabilities: ["Not publicly disclosed"],
    pastEnterpriseExperience: /enterprise|corporate|distribution|infrastructure/i.test(
      supplier.enterpriseRelevance
    ),
    priceCompetitiveness: "Medium",
    supplierDescription: supplier.enterpriseRelevance,
    sourceType: "Curated public-source registry"
  };
}

async function checkPublicSources(suppliers: RegistrySupplier[]) {
  const checks = await Promise.all(
    suppliers.map(async (supplier) => ({
      name: supplier.name,
      url: supplier.sourceUrl,
      available: await isSourceReachable(supplier.sourceUrl)
    }))
  );

  return checks;
}

async function isSourceReachable(url: string) {
  if (typeof fetch !== "function") {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal
    });

    return response.ok || response.status === 405 || response.status === 403;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
