export type LaptopRequirement = {
  requestTitle: string;
  department: string;
  deliveryLocation: string;
  requiredDeliveryDate: string;
  quantity: number;
  budgetPerLaptop: number;
  priority: "Low" | "Medium" | "High" | "Urgent";
  laptopType: "Business Laptop" | "Developer Laptop" | "Engineering Workstation" | "Executive Laptop";
  processor: string;
  ramGb: number;
  storageGb: number;
  operatingSystem: string;
  displaySize: "13 inch" | "14 inch" | "15.6 inch" | "16 inch";
  brandPreference: "Dell" | "HP" | "Lenovo" | "Apple" | "No Preference";
  warrantyRequirement: "1 year" | "3 years onsite" | "5 years onsite";
  supportRequirement: "Next Business Day Support" | "24x7 Support" | "Standard Support";
  securityRequirement: "TPM" | "Fingerprint Reader" | "IR Camera" | "BIOS Security" | "No Specific Requirement";
  preferredSupplierLocation: "Mumbai" | "Pune" | "Nashik" | "Bengaluru" | "Delhi NCR" | "Any";
  minimumSupplierRating: "3.5" | "4.0" | "4.5";
  requiredCertifications: string[];
  enterpriseExperienceRequired: "Yes" | "No";
  maximumDeliveryTimeline: "7 days" | "10 days" | "15 days" | "30 days";
  budgetPerUnit: number;
  deliveryCity: string;
  deliveryDays: number;
  warrantyYears: number;
  sustainabilityPriority: "standard" | "preferred" | "high";
  notes: string;
};

export type Supplier = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  region: string;
  leadTimeDays: number;
  avgUnitPrice: number;
  warrantyYears: number;
  complianceScore: number;
  serviceScore: number;
  sustainabilityScore: number;
  stockUnits: number;
  laptopLines: string[];
  certifications: string[];
};

export type SupplierRecommendation = Supplier & {
  score: number;
  fit: "Excellent" | "Strong" | "Conditional";
  rationale: string[];
  estimatedTotal: number;
};

export type RFQDraft = {
  subject: string;
  body: string;
  aiNote: string;
};
