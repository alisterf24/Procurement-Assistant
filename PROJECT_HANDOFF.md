# Procurement Assistant - Project Handoff

## Project Name

Procurement Assistant

## Purpose

This is a demo-only procurement decision-support prototype for enterprise laptop sourcing. It helps a procurement manager create a hardware requirement, review fictional supplier recommendations, prepare an RFQ draft, record a simulated RFQ send, and compare received vendor quotations.

This prototype does not use OpenAI API, does not use external AI APIs, does not require API keys, and does not send real emails.

## Business Use Case

The prototype demonstrates a practical procurement workflow for sourcing laptops from enterprise IT suppliers and comparing vendor quotations after RFQs are issued. It is intended for client demos where a procurement team can evaluate supplier fit, commercial terms, delivery, warranty/support, compliance, risks, and negotiation opportunities.

## Target User

Primary user: Procurement manager or procurement head responsible for enterprise laptop procurement.

There is no login requirement. The landing page provides two entry points:

- Hardware Procurement
- Procurement Advisory

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- LocalStorage for demo state
- Mock supplier database in TypeScript
- Deterministic rule-based procurement logic
- Deterministic rule-based quotation comparison logic
- No backend API routes
- No real authentication
- No real email service

## Current App Flow

Hardware Procurement flow:

1. Landing page
2. Simplified laptop procurement requirement form
3. Simulated procurement analysis loading modal
4. Supplier recommendation page
5. Supplier selection for RFQ
6. Simulated RFQ preparation loading modal
7. Editable RFQ email page
8. Simulated RFQ send recording
9. Success popup
10. Sent RFQ summary

Procurement Advisory flow:

1. Landing page
2. Quotation upload page
3. Multiple TXT or text-readable PDF quotation file selection
4. Validation requiring at least two quotation files
5. Simulated quotation review loading state
6. Decision Summary
7. Vendor quotation comparison cards

## Pages Implemented

- `/` - minimal landing page with Hardware Procurement and Procurement Advisory actions
- `/requirements` - simplified laptop procurement requirement form with Basic Details and Laptop Requirement sections
- `/recommendations` - supplier recommendation and selection page
- `/rfq` - editable RFQ draft and simulated send page
- `/advisory` - quotation upload, deterministic extraction, comparison, and decision summary page

## Features Implemented

- Minimal no-login landing page
- Simplified hardware procurement requirement form
- Requirement intake shows only Basic Details and Laptop Requirement sections
- Hidden internal defaults keep supplier matching compatible with removed supplier-filter fields
- Load Sample Laptop Requirement button
- Required field validation
- Mock supplier database with 10 fictional suppliers
- Deterministic supplier scoring
- Procurement-focused requirement summary
- Supplier recommendation reasons
- Supplier selection validation
- RFQ subject/body generation
- Editable RFQ subject and body
- Simulated RFQ send recording
- Sent RFQ log in localStorage
- Multi-file TXT/PDF quotation upload
- Validation requiring at least two quotations before comparison
- Deterministic quotation extraction from TXT files, text-readable PDFs, filename, metadata, and stable fallback rules
- Local browser-side PDF text extraction for readable PDF streams
- Clear warning for scanned/image-only PDFs without readable text
- Deterministic vendor comparison scoring
- Decision Summary with best value, lowest price, fastest delivery, clarification, and negotiation focus
- Vendor cards showing price, products, delivery, warranty/support, payment/validity, compliance, risks, pros, cons, and recommendation
- Responsive desktop, tablet, and mobile layout

## Simulated Procurement Logic

The hardware procurement logic lives in `lib/agent/procurementAgent.ts`.

It is deterministic and rule-based. It does not call OpenAI, any external AI API, or any external service.

Agent functions:

- `analyzeRequirement(requirement)`
- `scoreSuppliers(requirement, suppliers)`
- `generateRecommendationReason(requirement, supplier, scoreBreakdown)`
- `generateRFQEmail(requirement, selectedSuppliers, loggedInUserEmail)`

The language is template-generated, but all results are deterministic.

## Deterministic Quotation Logic

The quotation comparison logic lives in `lib/agent/quotationAgent.ts`.

It is deterministic and rule-based. It does not call OpenAI, any external AI API, document-processing API, or external service.

Quotation agent exports include:

- `QuotationInput`
- `QuotationSummary`
- `QuotationComparison`
- `analyzeQuotationFiles()`
- `extractQuotationSummary()`
- `compareQuotations()`

The quotation logic extracts or infers procurement-relevant details such as vendor, products, total price, currency, quantity, unit price, delivery, warranty, support/SLA, payment terms, validity, taxes, freight, installation, compliance indicators, missing information, risks, pros, cons, recommendation tag, and score.

The comparison balances price, product fit, delivery, warranty/support, commercial terms, compliance/reliability, and completeness. Lowest price is not automatically treated as best value.

Supported advisory upload formats are TXT and text-readable PDF. PDF text is extracted locally in the browser from readable PDF content streams, including common compressed PDF streams. No files are sent to a backend or external document-processing service. Scanned/image-only PDFs are accepted without crashing and shown with a clarification warning.

## Mock Supplier Database

The current mock supplier database is in `data/suppliers.ts`.

It contains exactly 10 fictional laptop suppliers. Each supplier includes:

- id
- name
- email
- location
- service coverage
- laptop types supported
- brands supported
- certifications
- average delivery days
- rating
- risk level
- order capacity
- warranty and support capability
- security capabilities
- past enterprise experience
- price competitiveness
- description

All supplier emails use demo-safe fake domains such as `example.com`.

## Supplier Recommendation Logic

Supplier scoring is deterministic and based on a 100-point scoring model:

- Laptop type/category support: 20 points
- Brand match: 15 points
- Delivery timeline match: 15 points
- Location or service coverage match: 15 points
- Certification match: 15 points
- Rating meets minimum rating: 10 points
- Warranty/support match: 5 points
- Past enterprise experience: 5 points

The recommendation page sorts suppliers from highest score to lowest score and displays the match percentage, fit category, risk badge, supplier details, and recommendation reason.

The current hardware intake no longer exposes supplier-filter fields such as warranty, support, security, certifications, supplier rating, supplier preference, past enterprise experience, or delivery timeline expectation. These values are supplied as conservative internal defaults during requirement normalization so the existing deterministic scoring and RFQ flow remain stable.

## RFQ Draft Generation Logic

RFQ draft generation is handled by `generateRFQEmail` in `lib/agent/procurementAgent.ts`.

It uses:

- latest submitted requirement
- selected suppliers
- demo sender email fallback

It generates:

- specific RFQ subject
- professional supplier-neutral email body
- note explaining that the RFQ was prepared from the requirement and supplier capabilities

## Simulated Email Sending

No real emails are sent.

When the user records the RFQ send:

- a loading modal is shown
- a local sent log is created in localStorage
- a success popup is displayed
- the sent summary is shown in the RFQ sidebar

The sent log key is `mm-rfq-sent-log`.

## Login and Logout Behavior

There is no login, logout, account, or real authentication flow in the current application.

Users can open the hardware procurement flow at `/requirements` or the advisory flow at `/advisory` directly.

Workflow state is stored locally in the browser for the demo.

## LocalStorage and State Handling

Main localStorage keys:

- `mm-sourcing-demo-state`
- `mm-laptop-requirement`
- `mm-selected-laptop-suppliers`
- `mm-rfq-sent-log`

The requirement form can be completed manually or populated using `Load Sample Laptop Requirement`.

## UI/UX Design Approach

The prototype uses a restrained enterprise decision-support style:

- red, white, charcoal grey, and metallic grey palette
- subtle branded-style background without real company marks
- restrained cards and borders
- clear hierarchy
- short labels and minimal helper text
- procurement-focused summaries
- responsive layouts for desktop, tablet, and mobile

## Branding Approach

The user-facing app name is `Procurement Assistant`.

No actual Mahindra logo is used. User-facing references to M&M and Mahindra have been removed from the application UI.

## Demo-Only Scope

Demo-only behavior includes:

- no-login local prototype access
- deterministic procurement logic
- deterministic TXT/PDF quotation extraction and comparison
- mock suppliers
- fictional supplier data
- simulated RFQ email generation
- simulated RFQ send recording
- localStorage-only state

## Not Implemented

- real authentication
- real backend database
- real supplier APIs
- real email delivery
- OpenAI API or external AI API
- production-grade document parsing
- real OCR
- supplier response tracking
- approval workflow
- production-grade access control

## Known Limitations

- State is local to the browser using localStorage.
- Supplier scoring is deterministic and simplified for demo purposes.
- The hardware requirement page is intentionally simplified to initial request fields only. Supplier filtering details are handled later through supplier and quotation comparison.
- Quotation extraction is deterministic and demo-safe; TXT and text-readable PDF files are supported.
- Scanned/image-only PDFs do not use OCR and are reported as needing a text-readable PDF or TXT quotation.
- Missing quotation fields are surfaced as risks or clarification items.
- Legacy helper files `lib/scoring.ts` and `lib/mock-suppliers.ts` remain from early prototype stages. The active supplier recommendation flow uses `data/suppliers.ts` and `lib/agent/procurementAgent.ts`.
- No real integrations exist.

## Future Enhancement Ideas

- Add approval routing.
- Add PDF export for RFQ or comparison results.
- Add supplier response simulation.
- Add configurable scoring weights.
- Add multi-location procurement support.
- Add admin page for editing mock supplier data.
- Add demo export for quotation comparison summaries.

## How To Run Locally

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

This workspace currently includes `pnpm-lock.yaml`, so `pnpm install` and `pnpm dev` also work in pnpm-based environments.

## How To Build

```bash
npm run build
```

This runs the Next.js production build.

## How To Deploy On Vercel

Recommended Vercel settings:

- Framework preset: Next.js
- Install command: `npm install` or Vercel auto-detected package manager
- Build command: `npm run build`
- Output directory: Next.js default
- Environment variables: none required

No API keys are needed.

## What Should Be Done Next

Recommended next steps:

1. Push the clean project to GitHub.
2. Import the GitHub repository into Vercel.
3. Deploy using the default Next.js settings.
4. Run one production smoke test on the deployed URL.
5. Decide whether to keep or remove early legacy helper files after deployment.
