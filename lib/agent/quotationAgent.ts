export type QuotationInput = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  lastModified: number;
  text?: string;
  sourceWarning?: string;
};

export type RecommendationTag =
  | "Best value"
  | "Lowest price"
  | "Fastest delivery"
  | "Strong warranty"
  | "Needs clarification"
  | "Commercial risk"
  | "Comparable option";

export type QuotationSummary = {
  id: string;
  fileName: string;
  vendorName: string;
  productsOffered: string[];
  quotedTotalPrice: number | null;
  currency: string;
  quantity: number | null;
  unitPrice: number | null;
  deliveryTimeline: string;
  deliveryDays: number | null;
  warranty: string;
  warrantyMonths: number | null;
  supportSla: string;
  paymentTerms: string;
  quoteValidity: string;
  taxes: string;
  freight: string;
  installation: string;
  inclusionsExclusions: string[];
  complianceIndicators: string[];
  technicalFit: string;
  missingCommercialInfo: string[];
  keyRisks: string[];
  negotiationLevers: string[];
  pros: string[];
  cons: string[];
  recommendationTag: RecommendationTag;
  recommendationScore: number;
  scoreBreakdown: QuotationScoreBreakdown;
  sourceWarning?: string;
};

export type QuotationComparison = {
  quotations: QuotationSummary[];
  bestValue: QuotationSummary | null;
  lowestPrice: QuotationSummary | null;
  fastestDelivery: QuotationSummary | null;
  strongestWarranty: QuotationSummary | null;
  keyDecisionNote: string;
  topClarificationNeeded: string;
  topNegotiationLever: string;
  fileWarnings: string[];
};

export type QuotationScoreBreakdown = {
  priceCompetitiveness: number;
  requirementFit: number;
  deliveryFulfillment: number;
  warrantySupport: number;
  commercialTerms: number;
  complianceReliability: number;
  completeness: number;
};

type PriceCandidate = {
  value: number;
  currency: string | null;
  context: string;
  kind: "total" | "unit" | "other";
  priority: number;
};

const NEEDS_CLARIFICATION = "Needs clarification";
const READABLE_TEXT_LIMIT = 120000;
const emptyScoreBreakdown: QuotationScoreBreakdown = {
  priceCompetitiveness: 0,
  requirementFit: 0,
  deliveryFulfillment: 0,
  warrantySupport: 0,
  commercialTerms: 0,
  complianceReliability: 0,
  completeness: 0
};
const PDF_UNREADABLE_MESSAGE =
  "This PDF does not contain readable text. Please upload a text-readable PDF or TXT quotation.";

type PdfStream = {
  dictionary: string;
  bytes: Uint8Array;
};

export async function analyzeQuotationFiles(files: File[]): Promise<QuotationComparison> {
  const inputs = await Promise.all(
    files.map(async (file, index) => {
      let text = "";
      let sourceWarning: string | undefined;

      try {
        if (isPdfFile(file)) {
          text = sanitizeReadableText(await extractPdfText(file));

          if (!hasProcurementReadableText(text)) {
            sourceWarning = PDF_UNREADABLE_MESSAGE;
            text = "";
          }
        } else {
          text = sanitizeReadableText(await file.text());
        }
      } catch {
        text = "";
        sourceWarning = isPdfFile(file)
          ? PDF_UNREADABLE_MESSAGE
          : "This file could not be read. Please upload a TXT or text-readable PDF quotation.";
      }

      return {
        id: createStableId(file.name, file.size, file.lastModified, index),
        fileName: file.name,
        fileType: file.type || "unknown",
        fileSize: file.size,
        lastModified: file.lastModified,
        text,
        sourceWarning
      } satisfies QuotationInput;
    })
  );

  return compareQuotations(inputs.map((input) => extractQuotationSummary(input)));
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

async function extractPdfText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const streams = extractPdfStreams(bytes);
  const textChunks: string[] = [];

  for (const stream of streams) {
    const decodedStream = await decodePdfStream(stream);
    const streamText = extractTextFromPdfContentStream(decodedStream);

    if (streamText) {
      textChunks.push(streamText);
    }
  }

  if (textChunks.length === 0) {
    textChunks.push(extractLiteralPdfText(bytesToPdfString(bytes)));
  }

  return textChunks.join("\n");
}

function extractPdfStreams(bytes: Uint8Array): PdfStream[] {
  const markerText = bytesToPdfString(bytes);
  const streams: PdfStream[] = [];
  const streamMarker = "stream";
  const endMarker = "endstream";
  let searchIndex = 0;

  while (searchIndex < markerText.length) {
    const streamIndex = markerText.indexOf(streamMarker, searchIndex);

    if (streamIndex === -1) {
      break;
    }

    const endIndex = markerText.indexOf(endMarker, streamIndex + streamMarker.length);

    if (endIndex === -1) {
      break;
    }

    let dataStart = streamIndex + streamMarker.length;

    if (markerText[dataStart] === "\r" && markerText[dataStart + 1] === "\n") {
      dataStart += 2;
    } else if (markerText[dataStart] === "\n" || markerText[dataStart] === "\r") {
      dataStart += 1;
    }

    let dataEnd = endIndex;

    if (markerText[dataEnd - 2] === "\r" && markerText[dataEnd - 1] === "\n") {
      dataEnd -= 2;
    } else if (markerText[dataEnd - 1] === "\n" || markerText[dataEnd - 1] === "\r") {
      dataEnd -= 1;
    }

    streams.push({
      dictionary: markerText.slice(Math.max(0, streamIndex - 600), streamIndex),
      bytes: bytes.slice(dataStart, dataEnd)
    });

    searchIndex = endIndex + endMarker.length;
  }

  return streams;
}

async function decodePdfStream(stream: PdfStream) {
  let bytes = stream.bytes;

  if (/\/ASCII85Decode\b/.test(stream.dictionary)) {
    bytes = decodeAscii85(bytesToPdfString(bytes));
  }

  if (/\/FlateDecode\b/.test(stream.dictionary)) {
    const inflated = await inflatePdfStream(bytes);

    return bytesToPdfString(inflated);
  }

  return bytesToPdfString(bytes);
}

async function inflatePdfStream(bytes: Uint8Array) {
  if (typeof DecompressionStream === "undefined") {
    return bytes;
  }

  try {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("deflate"));

    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return bytes;
  }
}

function extractTextFromPdfContentStream(content: string) {
  const chunks: string[] = [];
  const textSections = content.match(/BT[\s\S]*?ET/g) ?? [];

  for (const section of textSections) {
    const strings = [
      ...extractPdfLiteralStrings(section),
      ...extractPdfHexStrings(section)
    ];

    if (strings.length > 0) {
      chunks.push(strings.join(" "));
    }
  }

  return normalizeExtractedPdfText(chunks.join("\n"));
}

function extractLiteralPdfText(content: string) {
  return normalizeExtractedPdfText([
    ...extractPdfLiteralStrings(content),
    ...extractPdfHexStrings(content)
  ].join("\n"));
}

function extractPdfLiteralStrings(content: string) {
  const values: string[] = [];
  const pattern = /\((?:\\.|[^\\()])*\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    values.push(decodePdfLiteralString(match[0].slice(1, -1)));
  }

  return values.filter(Boolean);
}

function extractPdfHexStrings(content: string) {
  const values: string[] = [];
  const pattern = /<([0-9A-Fa-f\s]+)>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    values.push(decodePdfHexString(match[1]));
  }

  return values.filter(Boolean);
}

function decodeAscii85(value: string) {
  const cleanValue = value
    .replace(/^<~/, "")
    .replace(/~>[\s\S]*$/, "")
    .replace(/\s+/g, "");
  const bytes: number[] = [];
  let group: number[] = [];

  for (const character of cleanValue) {
    if (character === "z" && group.length === 0) {
      bytes.push(0, 0, 0, 0);
      continue;
    }

    const code = character.charCodeAt(0);

    if (code < 33 || code > 117) {
      continue;
    }

    group.push(code - 33);

    if (group.length === 5) {
      appendAscii85Group(bytes, group, 4);
      group = [];
    }
  }

  if (group.length > 0) {
    const outputLength = group.length - 1;

    while (group.length < 5) {
      group.push(84);
    }

    appendAscii85Group(bytes, group, outputLength);
  }

  return new Uint8Array(bytes);
}

function appendAscii85Group(bytes: number[], group: number[], outputLength: number) {
  let value = 0;

  for (const digit of group) {
    value = value * 85 + digit;
  }

  const decoded = [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ];

  bytes.push(...decoded.slice(0, outputLength));
}

function decodePdfLiteralString(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, escaped: string) => {
      const replacements: Record<string, string> = {
        n: "\n",
        r: "\r",
        t: "\t",
        b: "\b",
        f: "\f",
        "(": "(",
        ")": ")",
        "\\": "\\"
      };

      return replacements[escaped] ?? escaped;
    })
    .replace(/\\(\d{1,3})/g, (_, octal: string) =>
      String.fromCharCode(Number.parseInt(octal, 8))
    );
}

function decodePdfHexString(value: string) {
  const cleanValue = value.replace(/\s+/g, "");
  const bytes: number[] = [];

  for (let index = 0; index < cleanValue.length; index += 2) {
    const byte = Number.parseInt(cleanValue.slice(index, index + 2).padEnd(2, "0"), 16);

    if (Number.isFinite(byte)) {
      bytes.push(byte);
    }
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = "";

    for (let index = 2; index < bytes.length; index += 2) {
      text += String.fromCharCode((bytes[index] << 8) + (bytes[index + 1] ?? 0));
    }

    return text;
  }

  return bytesToPdfString(new Uint8Array(bytes));
}

function normalizeExtractedPdfText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function bytesToPdfString(bytes: Uint8Array) {
  let value = "";
  const chunkSize = 8192;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    value += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }

  return value;
}

function hasProcurementReadableText(text: string) {
  return /\b(vendor|supplier|company|quotation|quote|product|model|quantity|unit price|total|delivery|warranty|payment|validity|gst)\b/i.test(text);
}

export function extractQuotationSummary(input: QuotationInput): QuotationSummary {
  const text = normalizeText(input.text ?? "");
  const vendorName = extractVendorName(text, input.fileName);
  const productsOffered = extractProducts(text, input.fileName);
  const quantity = extractQuantity(text);
  const priceCandidates = extractPriceCandidates(text);
  const unitPriceCandidate = priceCandidates.find((candidate) => candidate.kind === "unit");
  const totalPriceCandidate = selectTotalPrice(priceCandidates, quantity);
  const quotedTotalPrice =
    totalPriceCandidate?.value ??
    (quantity && unitPriceCandidate ? Math.round(quantity * unitPriceCandidate.value) : null);
  const unitPrice =
    unitPriceCandidate?.value ??
    (quotedTotalPrice && quantity ? Math.round(quotedTotalPrice / quantity) : null);
  const currency =
    totalPriceCandidate?.currency ??
    unitPriceCandidate?.currency ??
    detectCurrency(text) ??
    (quotedTotalPrice || unitPrice ? NEEDS_CLARIFICATION : NEEDS_CLARIFICATION);
  const delivery = extractDelivery(text);
  const warranty = extractWarranty(text);
  const supportSla = extractSupport(text);
  const paymentTerms = extractPaymentTerms(text);
  const quoteValidity = extractValidity(text);
  const taxes = extractTaxes(text);
  const freight = extractFreight(text);
  const installation = extractInstallation(text);
  const inclusionsExclusions = extractInclusionsExclusions(text);
  const complianceIndicators = extractComplianceIndicators(text);
  const technicalFit = extractTechnicalFit(text, productsOffered);
  const missingCommercialInfo = getMissingCommercialInfo({
    quotedTotalPrice,
    currency,
    quantity,
    productsOffered,
    deliveryTimeline: delivery.label,
    warranty: warranty.label,
    paymentTerms,
    quoteValidity,
    taxes
  });
  const keyRisks = buildInitialRisks({
    missingCommercialInfo,
    taxes,
    freight,
    paymentTerms,
    deliveryTimeline: delivery.label,
    warranty: warranty.label
  });
  if (input.sourceWarning) {
    addUnique(keyRisks, input.sourceWarning);
  }
  const pros = buildInitialPros({
    quotedTotalPrice,
    deliveryTimeline: delivery.label,
    warranty: warranty.label,
    supportSla,
    paymentTerms,
    quoteValidity,
    taxes,
    freight,
    installation,
    complianceIndicators
  });
  const cons = buildInitialCons({
    missingCommercialInfo,
    taxes,
    freight,
    paymentTerms
  });
  const negotiationLevers = buildNegotiationLevers({
    quotedTotalPrice,
    deliveryTimeline: delivery.label,
    warranty: warranty.label,
    supportSla,
    paymentTerms,
    quoteValidity,
    taxes,
    freight,
    installation,
    missingCommercialInfo
  });

  return {
    id: input.id,
    fileName: input.fileName,
    vendorName,
    productsOffered,
    quotedTotalPrice,
    currency,
    quantity,
    unitPrice,
    deliveryTimeline: delivery.label,
    deliveryDays: delivery.days,
    warranty: warranty.label,
    warrantyMonths: warranty.months,
    supportSla,
    paymentTerms,
    quoteValidity,
    taxes,
    freight,
    installation,
    inclusionsExclusions,
    complianceIndicators,
    technicalFit,
    missingCommercialInfo,
    keyRisks,
    negotiationLevers,
    pros,
    cons,
    recommendationTag: "Needs clarification",
    recommendationScore: 0,
    scoreBreakdown: emptyScoreBreakdown,
    sourceWarning: input.sourceWarning
  };
}

export function compareQuotations(quotations: QuotationSummary[]): QuotationComparison {
  const pricedQuotations = quotations.filter(
    (quotation) => quotation.quotedTotalPrice !== null
  );
  const lowestPrice = minBy(pricedQuotations, (quotation) => quotation.quotedTotalPrice ?? Infinity);
  const fastestDelivery = minBy(
    quotations.filter((quotation) => quotation.deliveryDays !== null),
    (quotation) => quotation.deliveryDays ?? Infinity
  );
  const strongestWarranty = maxBy(
    quotations.filter((quotation) => quotation.warrantyMonths !== null),
    (quotation) => quotation.warrantyMonths ?? -1
  );
  const lowestPriceValue = lowestPrice?.quotedTotalPrice ?? null;
  const scored = quotations.map((quotation) =>
    scoreQuotation(quotation, lowestPriceValue)
  );
  const bestValue =
    maxBy(
      scored.filter((quotation) => isDecisionReadyQuotation(quotation)),
      (quotation) => quotation.recommendationScore
    ) ?? null;

  const compared = scored.map((quotation) =>
    finalizeRecommendation(quotation, {
      bestValueId: bestValue?.id ?? null,
      lowestPriceId: lowestPrice?.id ?? null,
      fastestDeliveryId: fastestDelivery?.id ?? null,
      strongestWarrantyId: strongestWarranty?.id ?? null
    })
  );

  const resolvedBestValue =
    compared.find((quotation) => quotation.id === bestValue?.id) ?? null;
  const resolvedLowestPrice =
    compared.find((quotation) => quotation.id === lowestPrice?.id) ?? null;
  const resolvedFastestDelivery =
    compared.find((quotation) => quotation.id === fastestDelivery?.id) ?? null;
  const resolvedStrongestWarranty =
    compared.find((quotation) => quotation.id === strongestWarranty?.id) ?? null;
  const sortedQuotations = [...compared].sort(
    (a, b) => b.recommendationScore - a.recommendationScore
  );

  return {
    quotations: sortedQuotations,
    bestValue: resolvedBestValue,
    lowestPrice: resolvedLowestPrice,
    fastestDelivery: resolvedFastestDelivery,
    strongestWarranty: resolvedStrongestWarranty,
    keyDecisionNote: buildDecisionNote(resolvedBestValue, resolvedLowestPrice),
    topClarificationNeeded: findTopClarification(sortedQuotations),
    topNegotiationLever: findTopNegotiationLever(sortedQuotations),
    fileWarnings: sortedQuotations
      .map((quotation) => quotation.sourceWarning)
      .filter((warning): warning is string => Boolean(warning))
  };
}

function scoreQuotation(
  quotation: QuotationSummary,
  lowestPriceValue: number | null
): QuotationSummary {
  const scoreBreakdown: QuotationScoreBreakdown = {
    priceCompetitiveness: scorePrice(quotation, lowestPriceValue),
    requirementFit: scoreProductFit(quotation),
    deliveryFulfillment: scoreDelivery(quotation),
    warrantySupport: scoreWarranty(quotation),
    commercialTerms: scoreCommercialTerms(quotation),
    complianceReliability: scoreCompliance(quotation),
    completeness: Math.max(
      0,
      5 - Math.min(5, quotation.missingCommercialInfo.length)
    )
  };
  const recommendationScore =
    scoreBreakdown.priceCompetitiveness +
    scoreBreakdown.requirementFit +
    scoreBreakdown.deliveryFulfillment +
    scoreBreakdown.warrantySupport +
    scoreBreakdown.commercialTerms +
    scoreBreakdown.complianceReliability +
    scoreBreakdown.completeness;

  return {
    ...quotation,
    recommendationScore,
    scoreBreakdown
  };
}

function finalizeRecommendation(
  quotation: QuotationSummary,
  markers: {
    bestValueId: string | null;
    lowestPriceId: string | null;
    fastestDeliveryId: string | null;
    strongestWarrantyId: string | null;
  }
): QuotationSummary {
  const pros = [...quotation.pros];
  const cons = [...quotation.cons];
  const risks = [...quotation.keyRisks];
  const negotiationLevers = [...quotation.negotiationLevers];
  let recommendationTag: RecommendationTag = "Comparable option";

  if (quotation.id === markers.lowestPriceId) {
    addUnique(pros, "Lowest quoted total");
  } else if (quotation.quotedTotalPrice !== null) {
    addUnique(negotiationLevers, "Benchmark against lowest quoted total");
  }

  if (quotation.id === markers.fastestDeliveryId) {
    addUnique(pros, "Fastest delivery");
  }

  if (quotation.id === markers.strongestWarrantyId) {
    addUnique(pros, "Strong warranty position");
  }

  if (quotation.id === markers.bestValueId) {
    addUnique(pros, "Strongest value balance");
    recommendationTag = "Best value";
  } else if (quotation.missingCommercialInfo.length >= 4 || quotation.quotedTotalPrice === null) {
    recommendationTag = "Needs clarification";
  } else if (hasCommercialRisk(quotation)) {
    recommendationTag = "Commercial risk";
  } else if (quotation.id === markers.lowestPriceId) {
    recommendationTag = "Lowest price";
  } else if (quotation.id === markers.fastestDeliveryId) {
    recommendationTag = "Fastest delivery";
  } else if (quotation.id === markers.strongestWarrantyId) {
    recommendationTag = "Strong warranty";
  }

  if (quotation.missingCommercialInfo.length > 0) {
    addUnique(cons, `${quotation.missingCommercialInfo[0]} needs clarification`);
    addUnique(risks, `${quotation.missingCommercialInfo[0]} is missing`);
  }

  return {
    ...quotation,
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 5),
    keyRisks: risks.slice(0, 5),
    negotiationLevers: negotiationLevers.slice(0, 5),
    recommendationTag
  };
}

function extractVendorName(text: string, fileName: string) {
  const lines = getMeaningfulLines(text);
  const labelLinePattern = /^(vendor|supplier|company|seller|bidder|reseller|partner|vendor \/ supplier)$/i;
  const patterns = [
    {
      pattern: /(?:vendor|supplier|company|seller|bidder|reseller|partner|quoted by|quotation from|quote from|from)\s*[:\-]\s*([A-Za-z0-9&.,'() /-]{2,90})/i,
      explicit: true
    },
    {
      pattern: /(?:prepared by|submitted by|issued by|commercial offer by)\s*[:\-]\s*([A-Za-z0-9&.,'() /-]{2,90})/i,
      explicit: true
    },
    {
      pattern: /(?:^|\b)([A-Za-z0-9&.,'() /-]{2,90})\s+(?:quotation|quote|proposal|commercial offer)\b/i,
      explicit: false
    }
  ];

  for (const line of lines.slice(0, 60)) {
    if (labelLinePattern.test(line)) {
      const nextLine = lines[lines.indexOf(line) + 1];
      const candidate = cleanCandidate(nextLine ?? "");

      if (isValidExplicitVendorName(candidate)) {
        return candidate;
      }
    }

    for (const { pattern, explicit } of patterns) {
      const match = line.match(pattern);

      if (match?.[1]) {
        const candidate = cleanCandidate(match[1]);

        if (
          explicit
            ? isValidExplicitVendorName(candidate)
            : isLikelyVendorName(candidate)
        ) {
          return candidate;
        }
      }
    }
  }

  const headerCandidate = lines
    .slice(0, 12)
    .map((line) => extractLeadingCompanyName(cleanCandidate(line)))
    .find((line) => isLikelyVendorName(line));

  if (headerCandidate) {
    return headerCandidate;
  }

  const fileCandidate = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b(quotation|quote|rfq|commercial|proposal|laptop|hardware|vendor|response|final)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return fileCandidate ? toTitleCase(fileCandidate) : NEEDS_CLARIFICATION;
}

function extractProducts(text: string, fileName: string) {
  const products: string[] = [];
  const lines = getMeaningfulLines(text);
  const modelPattern =
    /\b(?:Dell\s+(?:Latitude|Precision|Vostro|XPS|OptiPlex)[A-Za-z0-9 -]*|HP\s+(?:EliteBook|ProBook|ZBook|Pavilion|Dragonfly)[A-Za-z0-9 -]*|Lenovo\s+(?:ThinkPad|ThinkBook|Yoga|Legion|IdeaPad)[A-Za-z0-9 -]*|Apple\s+MacBook[A-Za-z0-9 -]*|Acer\s+(?:TravelMate|Swift|Aspire)[A-Za-z0-9 -]*|Asus\s+(?:ExpertBook|Zenbook|Vivobook)[A-Za-z0-9 -]*)/gi;
  const textMatches = text.match(modelPattern) ?? [];

  textMatches.forEach((match) => addProduct(products, cleanCandidate(match)));

  for (const line of lines) {
    if (/^(sr\.?|item \/ model|description \/ configuration|qty|unit price(?:\s*\([^)]+\))?|total amount(?:\s*\([^)]+\))?|model \/ configuration)$/i.test(line)) {
      continue;
    }

    if (
      /^(?:item\s+\d+\s+description|product|model|item|description|make|part no|sku)\s*[:/-]/i.test(line) &&
      !/(subject|quotation|quote|rfq|payment|delivery|warranty|validity|tax|gst|freight|shipping|total|subtotal|installation|configuration included|compliance|authorized partner)/i.test(line)
    ) {
      const cleaned = cleanCandidate(
        line.replace(/^(?:item\s+\d+\s+description|product|model|item|description|make|part no|sku)\s*[:/-]\s*/i, "")
      );

      if (
        cleaned.length >= 4 &&
        cleaned.length <= 110 &&
        !/(standard accessories|deployment bundle|bag|mouse|keyboard|adapter)/i.test(cleaned)
      ) {
        addProduct(products, cleaned);
      }
    }
  }

  if (products.length === 0 && /(laptop|notebook|workstation)/i.test(fileName)) {
    products.push("Laptop quotation");
  }

  return products.slice(0, 4);
}

function extractQuantity(text: string) {
  const patterns = [
    /\b(?:qty|quantity|units|no\.?\s*of\s*units|volume)\s*[:\-]?\s*(\d{1,5})\b/i,
    /\b(\d{1,5})\s*(?:business\s+)?(?:units|nos|pcs|pieces|laptops|notebooks|systems|devices)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return Number(match[1]);
    }
  }

  return extractTableQuantity(text);
}

function extractPriceCandidates(text: string): PriceCandidate[] {
  const lines = getMeaningfulLines(text);
  const candidates: PriceCandidate[] = [];
  const currencyPricePattern =
    /(INR|Rs\.?|Rs|\u20b9|USD|\$|EUR|\u20ac)\s*([0-9][0-9,]*(?:\.\d{1,2})?)|([0-9][0-9,]*(?:\.\d{1,2})?)\s*(INR|USD|EUR)/gi;
  const amountPattern = /([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.\d{1,2})?|[0-9]{4,}(?:\.\d{1,2})?)/g;

  for (const line of lines) {
    let match: RegExpExecArray | null;

    while ((match = currencyPricePattern.exec(line)) !== null) {
      const rawCurrency = match[1] ?? match[4] ?? null;
      const rawAmount = match[2] ?? match[3] ?? "";
      const value = parseAmount(rawAmount);

      if (value !== null) {
        candidates.push({
          value,
          currency: normalizeCurrency(rawCurrency),
          context: line,
          kind: getPriceKind(line),
          priority: getPricePriority(line)
        });
      }
    }

    if (isPriceContext(line)) {
      while ((match = amountPattern.exec(line)) !== null) {
        const value = parseAmount(match[1]);

        if (value !== null) {
          candidates.push({
            value,
            currency: detectCurrency(line),
            context: line,
            kind: getPriceKind(line),
            priority: getPricePriority(line)
          });
        }
      }
    }
  }

  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1];

    if (isPriceContext(line) && isAmountOnlyLine(nextLine)) {
      const value = parseAmount(nextLine);

      if (value !== null && value >= 100) {
        candidates.push({
          value,
          currency: detectCurrency(`${line} ${nextLine}`),
          context: `${line} ${nextLine}`,
          kind: getPriceKind(line),
          priority: getPricePriority(line)
        });
      }
    }
  }

  candidates.push(...extractTablePriceCandidates(lines));

  return candidates.filter((candidate, index, all) =>
    all.findIndex(
      (other) => other.value === candidate.value && other.context === candidate.context
    ) === index
  );
}

function selectTotalPrice(candidates: PriceCandidate[], quantity: number | null) {
  const totalCandidates = candidates.filter((candidate) => candidate.kind === "total");

  if (totalCandidates.length > 0) {
    return maxBy(totalCandidates, (candidate) => candidate.priority * 1000000000 + candidate.value);
  }

  const nonUnitCandidates = candidates.filter((candidate) => candidate.kind !== "unit");

  if (nonUnitCandidates.length > 0) {
    return maxBy(nonUnitCandidates, (candidate) => candidate.priority * 1000000000 + candidate.value);
  }

  if (quantity && candidates.length > 1) {
    return maxBy(candidates, (candidate) => candidate.value);
  }

  return null;
}

function extractDelivery(text: string) {
  const patterns = [
    /(?:delivery|lead time|dispatch|fulfillment|supply|shipment|delivery timeline|delivery period)\D{0,45}(\d{1,3})\s*(business days|working days|calendar days|days|weeks|months)/i,
    /(\d{1,3})\s*(business days|working days|calendar days|days|weeks|months)\D{0,45}(?:delivery|lead time|dispatch|fulfillment|supply|shipment)/i,
    /(?:within|in)\s+(\d{1,3})\s*(business days|working days|calendar days|days|weeks|months)\s+(?:from|after)\s+(?:po|purchase order|order|advance|payment)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1] && match?.[2]) {
      const value = Number(match[1]);
      const days = toDays(value, match[2]);

      return {
        label: `${value} ${match[2].toLowerCase()}`,
        days
      };
    }
  }

  if (/\b(immediate delivery|ex[- ]stock|available now)\b/i.test(text)) {
    return { label: "Ready stock", days: 2 };
  }

  if (/\bready stock\b/i.test(text)) {
    return { label: "Ready stock", days: 2 };
  }

  return { label: NEEDS_CLARIFICATION, days: null };
}

function extractWarranty(text: string) {
  const patterns = [
    /(?:warranty|onsite warranty|support warranty|oem warranty)\D{0,45}(\d{1,2})\s*(years|year|yrs|yr|months|month)/i,
    /(\d{1,2})\s*(years|year|yrs|yr|months|month)\D{0,45}(?:warranty|onsite|support)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1] && match?.[2]) {
      const value = Number(match[1]);
      const months = toMonths(value, match[2]);

      return {
        label: `${value} ${normalizeDurationUnit(value, match[2])}`,
        months
      };
    }
  }

  return { label: NEEDS_CLARIFICATION, months: null };
}

function extractSupport(text: string) {
  const supportSignals = [
    { label: "24x7 support", pattern: /\b24x7 support\b/i },
    { label: "24/7 support", pattern: /\b24\/7 support\b/i },
    { label: "next business day", pattern: /\bnext business day\b/i },
    { label: "NBD", pattern: /\bNBD\b/i },
    { label: "onsite support", pattern: /\bonsite support\b/i },
    { label: "on-site support", pattern: /\bon-site support\b/i },
    { label: "SLA", pattern: /\bSLA\b/i },
    { label: "RMA", pattern: /\bRMA\b/i },
    { label: "replacement support", pattern: /\breplacement support\b/i },
    { label: "escalation", pattern: /\bescalation\b/i },
    { label: "service desk", pattern: /\bservice desk\b/i },
    { label: "helpdesk", pattern: /\bhelpdesk\b/i },
    { label: "back-to-back OEM support", pattern: /\bback-to-back OEM support\b/i }
  ];
  const found = supportSignals.filter((signal) =>
    signal.pattern.test(text)
  );

  return found.length > 0
    ? found.slice(0, 3).map((signal) => signal.label).join(", ")
    : NEEDS_CLARIFICATION;
}

function extractPaymentTerms(text: string) {
  const patterns = [
    /(?:payment terms|payment|commercial terms|billing terms|terms of payment)\s*[:\-]\s*([^\n.]{3,120})/i,
    /\b(?:net|credit)\s*(\d{1,3})\s*(?:days|day)\b/i,
    /\b(\d{1,3})%\s*(?:advance|upfront)\b/i,
    /\b(?:against delivery|on delivery|after delivery|against po|on purchase order)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[0]) {
      return cleanCandidate(
        match[0].replace(
          /^(payment terms|payment|commercial terms|billing terms|terms of payment|terms)\s*[:\-]\s*/i,
          ""
        )
      );
    }
  }

  return NEEDS_CLARIFICATION;
}

function extractValidity(text: string) {
  const patterns = [
    /(?:valid until|quote validity|quotation validity|offer validity|validity)\s*[:\-]?\s*(?:(?:quote validity|quotation validity|offer validity|validity)\s*[:\-]?\s*)?([A-Za-z0-9 ,/-]{3,80})/i,
    /\bvalid\s+(?:for|till|until)\s+([A-Za-z0-9 ,/-]{3,80})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return cleanCandidate(
        match[1].replace(
          /^(valid until|quote validity|quotation validity|offer validity|validity)\s*[:\-]?\s*/i,
          ""
        ).replace(/^valid\s+(for|till|until)\s+/i, "")
      );
    }
  }

  return NEEDS_CLARIFICATION;
}

function extractTaxes(text: string) {
  if (/\b(inclusive of GST|GST included|inclusive of taxes|taxes included|including GST|incl\.?\s*GST|tax inclusive)\b/i.test(text)) {
    return "Included";
  }

  if (/\b(exclusive of GST|GST extra|taxes extra|tax extra|exclusive of taxes|plus GST|GST additional|taxes additional|tax exclusive)\b/i.test(text)) {
    return "Extra";
  }

  const gstRate = text.match(/\b(?:GST|tax)\s*@?\s*(\d{1,2})%/i);

  if (gstRate?.[1]) {
    return `GST ${gstRate[1]}%`;
  }

  return NEEDS_CLARIFICATION;
}

function extractFreight(text: string) {
  if (/\b(freight|shipping|delivery charges?)\b.{0,30}\b(included|inclusive|free)\b/i.test(text)) {
    return "Included";
  }

  if (/\b(freight|shipping|delivery charges?)\b.{0,30}\b(extra|excluded|chargeable)\b/i.test(text)) {
    return "Extra";
  }

  return NEEDS_CLARIFICATION;
}

function extractInstallation(text: string) {
  if (/\b(installation|configuration|imaging|asset tagging)\b.{0,40}\b(included|inclusive)\b/i.test(text)) {
    return "Included";
  }

  if (/\b(installation|configuration|imaging|asset tagging)\b.{0,40}\b(extra|excluded|chargeable)\b/i.test(text)) {
    return "Extra";
  }

  return NEEDS_CLARIFICATION;
}

function extractInclusionsExclusions(text: string) {
  const values: string[] = [];

  if (/\b(docking|dock|bag|mouse|keyboard|adapter)\b/i.test(text)) {
    values.push("Accessories mentioned");
  }

  if (/\b(asset tagging|imaging|configuration)\b/i.test(text)) {
    values.push("Deployment services mentioned");
  }

  if (/\b(exclusion|excluded|not included)\b/i.test(text)) {
    values.push("Exclusions mentioned");
  }

  return values.length > 0 ? values : [NEEDS_CLARIFICATION];
}

function extractComplianceIndicators(text: string) {
  const indicatorPatterns = [
    { label: "OEM Authorized Partner", pattern: /\bOEM\s+Authorized\s+Partner\b/i },
    { label: "OEM Authorised Partner", pattern: /\bOEM\s+Authorised\s+Partner\b/i },
    { label: "Authorized reseller", pattern: /\bAuthorized\s+reseller\b/i },
    { label: "Authorised reseller", pattern: /\bAuthorised\s+reseller\b/i },
    { label: "Authorized partner", pattern: /\bAuthorized\s+partner\b/i },
    { label: "Authorised partner", pattern: /\bAuthorised\s+partner\b/i },
    { label: "OEM partner", pattern: /\bOEM\s+partner\b/i },
    { label: "Certified partner", pattern: /\bCertified\s+partner\b/i },
    { label: "GST Registered", pattern: /\bGST\s+Registered\b/i },
    { label: "GSTIN", pattern: /\bGSTIN\b/i },
    { label: "ISO 9001", pattern: /\bISO\s*9001\b/i },
    { label: "ISO 27001", pattern: /\bISO\s*27001\b/i },
    { label: "MSME", pattern: /\bMSME\b/i },
    { label: "GeM seller", pattern: /\bGeM\s+seller\b/i },
    { label: "RoHS", pattern: /\bRoHS\b/i },
    { label: "EPEAT", pattern: /\bEPEAT\b/i },
    { label: "Energy Star", pattern: /\bEnergy\s+Star\b/i }
  ];
  const values: string[] = [];

  indicatorPatterns.forEach(({ label, pattern }) => {
    if (pattern.test(text)) {
      addUnique(values, label);
    }
  });

  if (values.includes("OEM Authorized Partner")) {
    return values.filter((value) => value !== "Authorized partner");
  }

  if (values.includes("OEM Authorised Partner")) {
    return values.filter((value) => value !== "Authorised partner");
  }

  return values;
}

function extractTechnicalFit(text: string, productsOffered: string[]) {
  if (/\b(equivalent|substitute|alternate model|alternative model)\b/i.test(text)) {
    return "Equivalent offered";
  }

  if (
    productsOffered.length > 0 ||
    /\b(laptop|notebook|workstation|intel|ryzen|ram|ssd|windows)\b/i.test(text)
  ) {
    return "Aligned";
  }

  return NEEDS_CLARIFICATION;
}

function getMissingCommercialInfo(fields: {
  quotedTotalPrice: number | null;
  currency: string;
  quantity: number | null;
  productsOffered: string[];
  deliveryTimeline: string;
  warranty: string;
  paymentTerms: string;
  quoteValidity: string;
  taxes: string;
}) {
  const missing: string[] = [];

  if (fields.quotedTotalPrice === null) {
    missing.push("Price");
  }

  if (fields.quotedTotalPrice !== null && fields.currency === NEEDS_CLARIFICATION) {
    missing.push("Currency");
  }

  if (fields.quantity === null) {
    missing.push("Quantity");
  }

  if (fields.productsOffered.length === 0) {
    missing.push("Product details");
  }

  if (fields.deliveryTimeline === NEEDS_CLARIFICATION) {
    missing.push("Delivery");
  }

  if (fields.warranty === NEEDS_CLARIFICATION) {
    missing.push("Warranty");
  }

  if (fields.paymentTerms === NEEDS_CLARIFICATION) {
    missing.push("Payment terms");
  }

  if (fields.quoteValidity === NEEDS_CLARIFICATION) {
    missing.push("Validity");
  }

  if (fields.taxes === NEEDS_CLARIFICATION) {
    missing.push("Tax clarity");
  }

  return missing;
}

function buildInitialRisks(fields: {
  missingCommercialInfo: string[];
  taxes: string;
  freight: string;
  paymentTerms: string;
  deliveryTimeline: string;
  warranty: string;
}) {
  const risks: string[] = [];

  fields.missingCommercialInfo.forEach((item) => addUnique(risks, `${item} missing`));

  if (fields.taxes === "Extra") {
    addUnique(risks, "Taxes excluded");
  }

  if (fields.freight === "Extra") {
    addUnique(risks, "Freight excluded");
  }

  if (/\badvance|upfront\b/i.test(fields.paymentTerms)) {
    addUnique(risks, "Advance payment requirement");
  }

  if (fields.deliveryTimeline === NEEDS_CLARIFICATION) {
    addUnique(risks, "Delivery commitment unclear");
  }

  if (fields.warranty === NEEDS_CLARIFICATION) {
    addUnique(risks, "Warranty commitment unclear");
  }

  return risks.length > 0 ? risks : ["No major gaps detected"];
}

function buildInitialPros(fields: {
  quotedTotalPrice: number | null;
  deliveryTimeline: string;
  warranty: string;
  supportSla: string;
  paymentTerms: string;
  quoteValidity: string;
  taxes: string;
  freight: string;
  installation: string;
  complianceIndicators: string[];
}) {
  const pros: string[] = [];

  if (fields.quotedTotalPrice !== null) {
    pros.push("Price provided");
  }

  if (fields.deliveryTimeline !== NEEDS_CLARIFICATION) {
    pros.push("Delivery stated");
  }

  if (fields.warranty !== NEEDS_CLARIFICATION) {
    pros.push("Warranty stated");
  }

  if (fields.supportSla !== NEEDS_CLARIFICATION) {
    pros.push("Support details present");
  }

  if (fields.paymentTerms !== NEEDS_CLARIFICATION && fields.quoteValidity !== NEEDS_CLARIFICATION) {
    pros.push("Commercial terms stated");
  }

  if (fields.taxes === "Included") {
    pros.push("Taxes included");
  }

  if (fields.freight === "Included") {
    pros.push("Freight included");
  }

  if (fields.installation === "Included") {
    pros.push("Configuration included");
  }

  if (fields.complianceIndicators.length > 0) {
    pros.push("Compliance indicators present");
  }

  return pros.length > 0 ? pros : ["Quotation received"];
}

function buildInitialCons(fields: {
  missingCommercialInfo: string[];
  taxes: string;
  freight: string;
  paymentTerms: string;
}) {
  const cons: string[] = fields.missingCommercialInfo
    .slice(0, 3)
    .map((item) => `${item} not clear`);

  if (fields.taxes === "Extra") {
    addUnique(cons, "Taxes extra");
  }

  if (fields.freight === "Extra") {
    addUnique(cons, "Freight extra");
  }

  if (/\badvance|upfront\b/i.test(fields.paymentTerms)) {
    addUnique(cons, "Advance payment");
  }

  return cons.length > 0 ? cons : ["No major concern detected"];
}

function buildNegotiationLevers(fields: {
  quotedTotalPrice: number | null;
  deliveryTimeline: string;
  warranty: string;
  supportSla: string;
  paymentTerms: string;
  quoteValidity: string;
  taxes: string;
  freight: string;
  installation: string;
  missingCommercialInfo: string[];
}) {
  const levers: string[] = [];

  if (fields.quotedTotalPrice !== null) {
    levers.push("Request best-and-final price");
  }

  if (fields.taxes !== "Included") {
    levers.push("Clarify tax-inclusive landed cost");
  }

  if (fields.freight !== "Included") {
    levers.push("Seek freight inclusion");
  }

  if (fields.installation !== "Included") {
    levers.push("Include configuration services");
  }

  if (fields.warranty === NEEDS_CLARIFICATION || fields.supportSla === NEEDS_CLARIFICATION) {
    levers.push("Lock warranty and support SLA");
  }

  if (fields.paymentTerms === NEEDS_CLARIFICATION || /\badvance|upfront\b/i.test(fields.paymentTerms)) {
    levers.push("Improve payment terms");
  }

  if (fields.quoteValidity === NEEDS_CLARIFICATION) {
    levers.push("Extend quote validity");
  }

  if (fields.deliveryTimeline === NEEDS_CLARIFICATION) {
    levers.push("Confirm delivery commitment");
  }

  fields.missingCommercialInfo.slice(0, 2).forEach((item) => {
    addUnique(levers, `Clarify ${item.toLowerCase()}`);
  });

  return levers.length > 0 ? levers : ["Maintain quoted terms"];
}

function scorePrice(quotation: QuotationSummary, lowestPriceValue: number | null) {
  if (quotation.quotedTotalPrice === null || lowestPriceValue === null) {
    return 2;
  }

  const ratio = lowestPriceValue / quotation.quotedTotalPrice;
  const baseScore = Math.round(clamp(30 * ratio, 10, 30));

  if (quotation.taxes === "Extra" || quotation.freight === "Extra") {
    return Math.max(8, baseScore - 3);
  }

  return baseScore;
}

function scoreProductFit(quotation: QuotationSummary) {
  if (
    quotation.technicalFit === "Aligned" &&
    quotation.productsOffered.length > 0 &&
    quotation.quantity !== null
  ) {
    return 15;
  }

  if (quotation.technicalFit === "Aligned") {
    return 12;
  }

  if (quotation.technicalFit === "Equivalent offered") {
    return quotation.productsOffered.length > 0 ? 10 : 8;
  }

  return quotation.productsOffered.length > 0 ? 7 : 4;
}

function scoreDelivery(quotation: QuotationSummary) {
  if (quotation.deliveryDays === null) {
    return 3;
  }

  if (quotation.deliveryDays <= 7) {
    return 15;
  }

  if (quotation.deliveryDays <= 14) {
    return 12;
  }

  if (quotation.deliveryDays <= 30) {
    return 9;
  }

  return 5;
}

function scoreWarranty(quotation: QuotationSummary) {
  const hasSupport = quotation.supportSla !== NEEDS_CLARIFICATION;

  if (quotation.warrantyMonths === null) {
    return hasSupport ? 6 : 3;
  }

  if (quotation.warrantyMonths >= 36 && hasSupport) {
    return 15;
  }

  if (quotation.warrantyMonths >= 36) {
    return 13;
  }

  if (quotation.warrantyMonths >= 12 && hasSupport) {
    return 11;
  }

  if (quotation.warrantyMonths >= 12) {
    return 8;
  }

  return 5;
}

function scoreCommercialTerms(quotation: QuotationSummary) {
  let score = 0;

  if (quotation.paymentTerms !== NEEDS_CLARIFICATION) {
    score += /\badvance|upfront\b/i.test(quotation.paymentTerms) ? 1 : 3;
  }

  if (quotation.quoteValidity !== NEEDS_CLARIFICATION) {
    score += 2;
  }

  if (quotation.taxes === "Included") {
    score += 3;
  } else if (quotation.taxes !== NEEDS_CLARIFICATION) {
    score += 1;
  }

  if (quotation.freight === "Included") {
    score += 1;
  }

  if (
    quotation.paymentTerms !== NEEDS_CLARIFICATION &&
    /\b(net|credit|after delivery|on delivery|against delivery)\b/i.test(quotation.paymentTerms)
  ) {
    score += 2;
  }

  return clamp(score, 0, 10);
}

function scoreCompliance(quotation: QuotationSummary) {
  const hasAuthorization = quotation.complianceIndicators.some((indicator) =>
    /authorized|authorised|oem|certified/i.test(indicator)
  );

  if (quotation.complianceIndicators.length >= 3 && hasAuthorization) {
    return 10;
  }

  if (quotation.complianceIndicators.length >= 2) {
    return 8;
  }

  if (quotation.complianceIndicators.length === 1) {
    return hasAuthorization ? 6 : 5;
  }

  return 2;
}

function buildDecisionNote(
  bestValue: QuotationSummary | null,
  lowestPrice: QuotationSummary | null
) {
  if (!bestValue) {
    return "No quotation is decision-ready. Clarify commercial gaps before award.";
  }

  if (!lowestPrice) {
    return `${bestValue.vendorName} has the strongest available score, but quoted price needs clarification.`;
  }

  if (bestValue.id === lowestPrice.id) {
    return `${bestValue.vendorName} leads on value and price. Validate final landed cost.`;
  }

  return `${bestValue.vendorName} offers stronger value than the lowest-price quote after delivery, warranty, terms, and risk.`;
}

function findTopClarification(quotations: QuotationSummary[]) {
  for (const quotation of quotations) {
    if (quotation.missingCommercialInfo.length > 0) {
      return `${quotation.vendorName}: ${quotation.missingCommercialInfo[0]}`;
    }
  }

  for (const quotation of quotations) {
    const risk = quotation.keyRisks.find((item) => item !== "No major gaps detected");

    if (risk) {
      return `${quotation.vendorName}: ${risk}`;
    }
  }

  return "None";
}

function findTopNegotiationLever(quotations: QuotationSummary[]) {
  const bestValue = quotations[0];

  if (!bestValue) {
    return "None";
  }

  return bestValue.negotiationLevers[0] ?? "None";
}

function isDecisionReadyQuotation(quotation: QuotationSummary) {
  return (
    quotation.quotedTotalPrice !== null &&
    quotation.recommendationScore >= 55 &&
    quotation.missingCommercialInfo.length <= 3 &&
    quotation.productsOffered.length > 0
  );
}

function hasCommercialRisk(quotation: QuotationSummary) {
  return (
    quotation.taxes === "Extra" ||
    quotation.freight === "Extra" ||
    /\badvance|upfront\b/i.test(quotation.paymentTerms) ||
    quotation.missingCommercialInfo.length >= 3
  );
}

function isLikelyVendorName(value: string) {
  if (value.length < 2 || value.length > 90) {
    return false;
  }

  if (/\b(quotation|quote|proposal|laptop|notebook|payment|delivery|warranty|validity|total|amount|price)\b/i.test(value)) {
    return false;
  }

  return /\b(pvt|private|limited|ltd|llp|inc|corp|corporation|technologies|systems|solutions|enterprises|traders|computers|infotech|services|distributors|resellers|sales|agency|agencies)\b/i.test(
    value
  );
}

function extractLeadingCompanyName(value: string) {
  const match = value.match(
    /^(.+?\b(?:pvt\.?\s*ltd\.?|private\s+limited|limited|ltd\.?|llp|inc\.?|corp(?:oration)?|technologies|systems|solutions|enterprises|traders|computers|infotech|services|distributors|resellers)\b\.?)/i
  );

  return match?.[1] ? cleanCandidate(match[1]) : value;
}

function isValidExplicitVendorName(value: string) {
  if (value.length < 2 || value.length > 90) {
    return false;
  }

  if (/\b(quotation|quote|proposal|payment|delivery|warranty|validity|total|amount|price)\b/i.test(value)) {
    return false;
  }

  return /^[A-Za-z0-9&.,'() /-]+$/.test(value);
}

function getMeaningfulLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length < 180);
}

function extractTableQuantity(text: string) {
  const lines = getMeaningfulLines(text);

  for (let index = 0; index < lines.length; index += 1) {
    if (!isLikelyProductTableLine(lines[index])) {
      continue;
    }

    const nearbyLines = lines.slice(index + 1, index + 8);
    const quantityLine = nearbyLines.find((line) => /^\d{1,5}$/.test(line));

    if (quantityLine) {
      return Number(quantityLine);
    }
  }

  return null;
}

function sanitizeReadableText(rawText: string) {
  if (!rawText) {
    return "";
  }

  const controlMatches = rawText.match(/[\u0000-\u0008\u000E-\u001F]/g)?.length ?? 0;

  if (controlMatches / rawText.length > 0.08) {
    return "";
  }

  return rawText
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .slice(0, READABLE_TEXT_LIMIT);
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

function cleanCandidate(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/[|;]+$/g, "")
    .replace(/\b(email|phone|mobile)\b.*$/i, "")
    .trim();
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseAmount(value: string) {
  const numericValue = Number(
    value
      .replace(/(?:INR|Rs\.?|USD|EUR)/gi, "")
      .replace(/[\u20b9$€,\s]/g, "")
  );

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.round(numericValue);
}

function isAmountOnlyLine(value: string) {
  const normalizedValue = value
    .trim()
    .replace(/(?:INR|Rs\.?|USD|EUR)/gi, "")
    .replace(/[\u20b9$€\s]/g, "");

  return /^[0-9][0-9,]*(?:\.\d{1,2})?$/.test(normalizedValue);
}

function extractTablePriceCandidates(lines: string[]): PriceCandidate[] {
  const candidates: PriceCandidate[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!isLikelyProductTableLine(lines[index])) {
      continue;
    }

    const nearbyLines = lines.slice(index + 1, index + 9);
    const quantityIndex = nearbyLines.findIndex((line) => /^\d{1,5}$/.test(line));

    if (quantityIndex === -1) {
      continue;
    }

    const amountLines = nearbyLines
      .slice(quantityIndex + 1)
      .filter((line) => isAmountOnlyLine(line));
    const unitPrice = amountLines[0] ? parseAmount(amountLines[0]) : null;
    const totalPrice = amountLines[1] ? parseAmount(amountLines[1]) : null;

    if (unitPrice !== null) {
      candidates.push({
        value: unitPrice,
        currency: detectCurrency(amountLines[0]) ?? detectCurrency(lines.join(" ")),
        context: `Unit price ${amountLines[0]}`,
        kind: "unit",
        priority: 1
      });
    }

    if (totalPrice !== null) {
      candidates.push({
        value: totalPrice,
        currency: detectCurrency(amountLines[1]) ?? detectCurrency(lines.join(" ")),
        context: `Line total ${amountLines[1]}`,
        kind: "other",
        priority: 2
      });
    }
  }

  return candidates;
}

function isLikelyProductTableLine(line: string) {
  return (
    /\b(laptop|notebook|workstation)\b/i.test(line) &&
    !/\b(subject|quotation|quote|rfq|procurement|vendor confirms|commercially relevant fields)\b/i.test(line)
  );
}

function getPriceKind(line: string): PriceCandidate["kind"] {
  if (/\b(unit price|unit rate|rate per|per unit|unit cost|each)\b/i.test(line)) {
    return "unit";
  }

  if (
    /\b(grand total|total quoted|total amount|total price|total cost|net amount|landed cost|quote value|final total|payable|amount payable|order value|commercial value|subtotal)\b/i.test(
      line
    )
  ) {
    return "total";
  }

  return "other";
}

function getPricePriority(line: string) {
  if (/\b(grand total|final total|amount payable|net payable)\b/i.test(line)) {
    return 6;
  }

  if (/\b(final landed cost payable|landed cost payable)\b/i.test(line)) {
    return 5;
  }

  if (/\b(indicative landed cost|estimated landed cost)\b/i.test(line)) {
    return 3;
  }

  if (/\blanded cost\b/i.test(line)) {
    return 4;
  }

  if (/\b(total quoted|total amount|total price|total cost|quote value|order value)\b/i.test(line)) {
    return 4;
  }

  if (/\b(subtotal|before tax|taxable value)\b/i.test(line)) {
    return 2;
  }

  if (/\b(unit price|unit rate|per unit|rate per|each)\b/i.test(line)) {
    return 1;
  }

  return 3;
}

function isPriceContext(line: string) {
  return /\b(price|amount|total|cost|quote value|landed|commercial|subtotal|payable|taxable value|rate)\b/i.test(line);
}

function detectCurrency(text: string) {
  if (/\b(INR|Rs\.?)\b|\u20b9/i.test(text)) {
    return "INR";
  }

  if (/\bUSD\b|\$/i.test(text)) {
    return "USD";
  }

  if (/\bEUR\b|\u20ac/i.test(text)) {
    return "EUR";
  }

  return null;
}

function normalizeCurrency(value: string | null) {
  if (!value) {
    return null;
  }

  if (/^(INR|Rs\.?|\u20b9)$/i.test(value)) {
    return "INR";
  }

  if (/^(USD|\$)$/i.test(value)) {
    return "USD";
  }

  if (/^(EUR|\u20ac)$/i.test(value)) {
    return "EUR";
  }

  return value.toUpperCase();
}

function toDays(value: number, unit: string) {
  if (/week/i.test(unit)) {
    return value * 7;
  }

  if (/month/i.test(unit)) {
    return value * 30;
  }

  return value;
}

function toMonths(value: number, unit: string) {
  if (/year|yr/i.test(unit)) {
    return value * 12;
  }

  return value;
}

function normalizeDurationUnit(value: number, unit: string) {
  if (/year|yr/i.test(unit)) {
    return value === 1 ? "year" : "years";
  }

  return value === 1 ? "month" : "months";
}

function createStableId(fileName: string, fileSize: number, lastModified: number, index: number) {
  const input = `${fileName}:${fileSize}:${lastModified}:${index}`;
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return `quote-${hash.toString(16)}`;
}

function minBy<T>(items: T[], selector: (item: T) => number) {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((best, item) =>
    selector(item) < selector(best) ? item : best
  );
}

function maxBy<T>(items: T[], selector: (item: T) => number) {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((best, item) =>
    selector(item) > selector(best) ? item : best
  );
}

function addUnique(items: string[], item: string) {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function addProduct(items: string[], item: string) {
  const normalizedItem = item.toLowerCase();
  const hasSimilarProduct = items.some((existing) => {
    const normalizedExisting = existing.toLowerCase();

    return (
      normalizedExisting.includes(normalizedItem) ||
      normalizedItem.includes(normalizedExisting)
    );
  });

  if (!hasSimilarProduct) {
    items.push(item);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
