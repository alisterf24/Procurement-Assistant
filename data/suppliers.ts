export type LaptopSupplier = {
  id: string;
  name: string;
  email: string;
  location: string;
  serviceCoverage: string[];
  laptopTypesSupported: string[];
  brandsSupported: string[];
  certifications: string[];
  averageDeliveryDays: number;
  rating: number;
  riskLevel: "Low" | "Medium" | "High";
  minOrderQuantity: number;
  maxOrderCapacity: number;
  warrantySupport: string[];
  supportCapability: string[];
  securityCapabilities: string[];
  pastEnterpriseExperience: boolean;
  priceCompetitiveness: "Low" | "Medium" | "High";
  supplierDescription: string;
};

export const laptopSuppliers: LaptopSupplier[] = [
  {
    id: "technova-systems",
    name: "TechNova Systems Pvt. Ltd.",
    email: "rfq.technova@example.com",
    location: "Mumbai",
    serviceCoverage: ["Mumbai", "Pune", "Nashik", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Executive Laptop", "Developer Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo"],
    certifications: ["GST Registered", "ISO 9001", "OEM Authorized Partner"],
    averageDeliveryDays: 9,
    rating: 4.6,
    riskLevel: "Low",
    minOrderQuantity: 25,
    maxOrderCapacity: 900,
    warrantySupport: ["3 years onsite", "5 years onsite"],
    supportCapability: ["Next Business Day Support", "24x7 Support"],
    securityCapabilities: ["TPM", "Fingerprint Reader", "BIOS Security"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "Medium",
    supplierDescription:
      "Strong Mumbai enterprise supplier with mature laptop rollout processes, asset tagging support, and reliable OEM coordination for large sourcing events."
  },
  {
    id: "enterpriseedge-it",
    name: "EnterpriseEdge IT Solutions",
    email: "sourcing.enterpriseedge@example.com",
    location: "Pune",
    serviceCoverage: ["Pune", "Mumbai", "Bengaluru"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop"],
    brandsSupported: ["Dell", "Lenovo", "HP"],
    certifications: ["GST Registered", "ISO 9001"],
    averageDeliveryDays: 6,
    rating: 4.4,
    riskLevel: "Low",
    minOrderQuantity: 15,
    maxOrderCapacity: 520,
    warrantySupport: ["1 year", "3 years onsite"],
    supportCapability: ["Next Business Day Support", "Standard Support"],
    securityCapabilities: ["TPM", "BIOS Security"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "Medium",
    supplierDescription:
      "Pune-based supplier known for fast fulfillment, practical configuration support, and quick response on mid-sized laptop procurement requirements."
  },
  {
    id: "primecompute-technologies",
    name: "PrimeCompute Technologies",
    email: "bids.primecompute@example.com",
    location: "Nashik",
    serviceCoverage: ["Nashik", "Mumbai", "Pune"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop"],
    brandsSupported: ["HP", "Lenovo"],
    certifications: ["GST Registered"],
    averageDeliveryDays: 12,
    rating: 3.8,
    riskLevel: "Medium",
    minOrderQuantity: 10,
    maxOrderCapacity: 300,
    warrantySupport: ["1 year", "3 years onsite"],
    supportCapability: ["Standard Support"],
    securityCapabilities: ["TPM", "No Specific Requirement"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "High",
    supplierDescription:
      "Lower-cost Nashik supplier suited for budget-sensitive business laptop purchases, with acceptable enterprise experience but moderate delivery and compliance risk."
  },
  {
    id: "nexora-digital-supplies",
    name: "Nexora Digital Supplies",
    email: "enterprise.nexora@example.com",
    location: "Bengaluru",
    serviceCoverage: ["Bengaluru", "Pune", "Mumbai", "Hyderabad"],
    laptopTypesSupported: ["Developer Laptop", "Engineering Workstation", "Business Laptop"],
    brandsSupported: ["Dell", "Lenovo", "Apple"],
    certifications: ["GST Registered", "ISO 9001", "OEM Authorized Partner"],
    averageDeliveryDays: 8,
    rating: 4.5,
    riskLevel: "Low",
    minOrderQuantity: 20,
    maxOrderCapacity: 650,
    warrantySupport: ["3 years onsite", "5 years onsite"],
    supportCapability: ["24x7 Support", "Next Business Day Support"],
    securityCapabilities: ["TPM", "Fingerprint Reader", "IR Camera", "BIOS Security"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "Medium",
    supplierDescription:
      "Bengaluru supplier with strong developer laptop and workstation capability, well suited for engineering teams requiring higher RAM and SSD configurations."
  },
  {
    id: "infracore-it-distribution",
    name: "InfraCore IT Distribution",
    email: "rfq.infracore@example.com",
    location: "Delhi NCR",
    serviceCoverage: ["Delhi NCR", "Mumbai", "Pune", "Bengaluru", "Pan India logistics"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Apple"],
    certifications: ["GST Registered", "ISO 9001", "OEM Authorized Partner"],
    averageDeliveryDays: 11,
    rating: 4.2,
    riskLevel: "Low",
    minOrderQuantity: 50,
    maxOrderCapacity: 1800,
    warrantySupport: ["1 year", "3 years onsite", "5 years onsite"],
    supportCapability: ["Next Business Day Support", "24x7 Support", "Standard Support"],
    securityCapabilities: ["TPM", "Fingerprint Reader", "IR Camera", "BIOS Security"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "Medium",
    supplierDescription:
      "Delhi NCR supplier with high capacity and broad national fulfillment coverage for large enterprise sourcing events and multi-location deployments."
  },
  {
    id: "apexworkstation-solutions",
    name: "ApexWorkstation Solutions",
    email: "premium.apexworkstation@example.com",
    location: "Mumbai",
    serviceCoverage: ["Mumbai", "Delhi NCR", "Bengaluru", "Pune"],
    laptopTypesSupported: ["Executive Laptop", "Engineering Workstation", "Developer Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo", "Apple"],
    certifications: ["GST Registered", "ISO 9001", "ISO 27001", "OEM Authorized Partner"],
    averageDeliveryDays: 10,
    rating: 4.8,
    riskLevel: "Low",
    minOrderQuantity: 20,
    maxOrderCapacity: 700,
    warrantySupport: ["3 years onsite", "5 years onsite"],
    supportCapability: ["24x7 Support", "Next Business Day Support"],
    securityCapabilities: ["TPM", "Fingerprint Reader", "IR Camera", "BIOS Security"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "Low",
    supplierDescription:
      "Premium high-rating supplier for executive laptops and engineering workstations, offering strong service assurance at a higher expected cost profile."
  },
  {
    id: "metrolink-it-vendors",
    name: "MetroLink IT Vendors",
    email: "quotes.metrolink@example.com",
    location: "Mumbai",
    serviceCoverage: ["Mumbai", "Nashik", "Pune"],
    laptopTypesSupported: ["Business Laptop"],
    brandsSupported: ["HP", "Lenovo"],
    certifications: ["GST Registered"],
    averageDeliveryDays: 14,
    rating: 3.6,
    riskLevel: "Medium",
    minOrderQuantity: 10,
    maxOrderCapacity: 260,
    warrantySupport: ["1 year", "3 years onsite"],
    supportCapability: ["Standard Support"],
    securityCapabilities: ["TPM", "No Specific Requirement"],
    pastEnterpriseExperience: false,
    priceCompetitiveness: "High",
    supplierDescription:
      "Budget supplier with competitive pricing for standard business laptops, but lower rating and limited enterprise support depth compared with larger vendors."
  },
  {
    id: "securebyte-hardware-services",
    name: "SecureByte Hardware Services",
    email: "secure.rfq@example.com",
    location: "Bengaluru",
    serviceCoverage: ["Bengaluru", "Pune", "Delhi NCR", "Mumbai"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo"],
    certifications: ["GST Registered", "ISO 27001", "OEM Authorized Partner"],
    averageDeliveryDays: 9,
    rating: 4.7,
    riskLevel: "Low",
    minOrderQuantity: 25,
    maxOrderCapacity: 600,
    warrantySupport: ["3 years onsite", "5 years onsite"],
    supportCapability: ["24x7 Support", "Next Business Day Support"],
    securityCapabilities: ["TPM", "Fingerprint Reader", "IR Camera", "BIOS Security"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "Medium",
    supplierDescription:
      "Security-focused supplier with ISO 27001 certification, strong endpoint security options, and good fit for controlled enterprise laptop deployments."
  },
  {
    id: "velocitytech-procurement",
    name: "VelocityTech Procurement",
    email: "oem.velocitytech@example.com",
    location: "Pune",
    serviceCoverage: ["Pune", "Mumbai", "Nashik", "Delhi NCR", "Bengaluru"],
    laptopTypesSupported: ["Business Laptop", "Developer Laptop", "Engineering Workstation", "Executive Laptop"],
    brandsSupported: ["Dell", "HP", "Lenovo"],
    certifications: ["GST Registered", "ISO 9001", "OEM Authorized Partner"],
    averageDeliveryDays: 8,
    rating: 4.5,
    riskLevel: "Low",
    minOrderQuantity: 30,
    maxOrderCapacity: 1000,
    warrantySupport: ["1 year", "3 years onsite", "5 years onsite"],
    supportCapability: ["Next Business Day Support", "24x7 Support", "Standard Support"],
    securityCapabilities: ["TPM", "Fingerprint Reader", "BIOS Security"],
    pastEnterpriseExperience: true,
    priceCompetitiveness: "Medium",
    supplierDescription:
      "OEM-authorized Dell, HP, and Lenovo supplier with balanced pricing, dependable delivery, and strong coverage for enterprise laptop refresh programs."
  },
  {
    id: "digitalgrid-enterprise-supplies",
    name: "DigitalGrid Enterprise Supplies",
    email: "rfq.digitalgrid@example.com",
    location: "Delhi NCR",
    serviceCoverage: ["Delhi NCR", "Mumbai", "Pune"],
    laptopTypesSupported: ["Business Laptop", "Executive Laptop"],
    brandsSupported: ["Dell", "HP"],
    certifications: ["GST Registered"],
    averageDeliveryDays: 22,
    rating: 3.4,
    riskLevel: "High",
    minOrderQuantity: 20,
    maxOrderCapacity: 420,
    warrantySupport: ["1 year"],
    supportCapability: ["Standard Support"],
    securityCapabilities: ["TPM", "No Specific Requirement"],
    pastEnterpriseExperience: false,
    priceCompetitiveness: "Medium",
    supplierDescription:
      "Supplier with weaker delivery timelines and higher operational risk, best treated as a fallback option when preferred suppliers cannot meet demand."
  }
];
