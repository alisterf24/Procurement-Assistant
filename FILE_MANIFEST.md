# File Manifest

This document explains the main folders and files in the Procurement Assistant prototype.

## Root Files

- `package.json` - Project metadata, dependencies, and scripts.
- `pnpm-lock.yaml` - Dependency lockfile for pnpm-based installs.
- `pnpm-workspace.yaml` - pnpm workspace configuration.
- `README.md` - Setup, build, and deployment overview.
- `PROJECT_HANDOFF.md` - Full project context and handoff notes.
- `FILE_MANIFEST.md` - This file.
- `CONTINUE_IN_ENTERPRISE_PROMPT.md` - Ready-to-paste continuation prompt.
- `.gitignore` - Excludes dependencies, build output, env files, logs, screenshots, and local artifacts.
- `eslint.config.mjs` - ESLint configuration.
- `next.config.ts` - Next.js configuration.
- `tailwind.config.ts` - Tailwind theme configuration.
- `postcss.config.mjs` - PostCSS configuration for Tailwind.
- `tsconfig.json` - TypeScript compiler configuration.
- `next-env.d.ts` - Next.js TypeScript environment declarations.
- `.gitattributes` - Git line-ending or text handling configuration.

## `app/`

Next.js App Router pages and global styling.

- `app/layout.tsx` - Root application layout and metadata.
- `app/globals.css` - Tailwind layers, reusable UI classes, animated background CSS, refined buttons, inputs, cards, glass panels, and motion rules.
- `app/page.tsx` - Polished landing page with enterprise hero, capability highlights, and Hardware Procurement / Procurement Advisory action cards.
- `app/requirements/page.tsx` - Simplified laptop procurement requirement form with Basic Details and Laptop Requirement sections, sample load behavior, validation, hidden internal defaults, and requirement save.
- `app/recommendations/page.tsx` - Supplier recommendation page using the server-side discovery endpoint, concise requirement summary, top 10 public-source supplier cards, source information card, supplier selection, and RFQ preparation.
- `app/rfq/page.tsx` - Editable RFQ draft, selected supplier email display, selected supplier sidebar, simulated Send RFQ action, success popup, and sent summary.
- `app/advisory/page.tsx` - TXT/PDF quotation upload, validation, PDF readability warnings, deterministic extraction, vendor comparison, and decision summary.

## `app/api/`

Server-side API routes.

- `app/api/supplier-discovery/route.ts` - Supplier discovery endpoint that accepts a hardware requirement and returns ranked suppliers from the curated public-source registry, with demo-safe fallback behavior.

## `components/`

Reusable UI components.

- `components/app-shell.tsx` - Application shell, responsive desktop sidebar, mobile navigation strip, inner-page layout wrapper, and branded background integration.
- `components/branded-background.tsx` - Reusable animated enterprise background system with grid, diagonal shapes, ribbons, glass panels, and abstract procurement motifs.
- `components/agent-loading-modal.tsx` - Premium simulated processing modal used during analysis, matching, RFQ drafting, and simulated sending.
- `components/stepper.tsx` - Responsive workflow step indicator for Requirement, Supplier Matching, RFQ Draft, and Send Confirmation.

## `data/`

Fallback mock data for the supplier recommendation workflow.

- `data/suppliers.ts` - Fictional laptop supplier database with 10 demo suppliers and the `LaptopSupplier` type, used when supplier discovery needs a safe offline fallback.

## `lib/`

Shared types, state helpers, and deterministic logic.

- `lib/types.ts` - Shared TypeScript types including `LaptopRequirement`, legacy supplier types, and `RFQDraft`.
- `lib/use-demo-state.ts` - LocalStorage-backed demo state helper and workflow storage cleanup function.
- `lib/supplier-discovery.ts` - Server-side supplier discovery service, curated India-focused public-source supplier registry, ranking logic, source metadata, and public-source reachability checks.
- `lib/scoring.ts` - Early prototype scoring helpers and `defaultRequirement`; still used for some default utility values and currency formatting.
- `lib/mock-suppliers.ts` - Early prototype mock supplier data retained for compatibility. The current recommendation page uses `lib/supplier-discovery.ts` first and can fall back to `data/suppliers.ts`.

## `lib/agent/`

Deterministic procurement and quotation decision logic.

- `lib/agent/procurementAgent.ts` - Requirement analysis, supplier scoring, recommendation reasons, and RFQ email generation.
- `lib/agent/quotationAgent.ts` - TXT and local text-readable PDF quotation extraction, commercial analysis, scoring, comparison, risks, pros, cons, and recommendation logic.

## `public/`

Static assets.

- `public/favicon.svg` - Generic favicon. No actual Mahindra logo is used.

## Active Routes

- `/` - Landing page
- `/requirements` - Simplified requirement form
- `/recommendations` - Public-source supplier recommendations with fallback support
- `/rfq` - RFQ draft and simulated Send RFQ
- `/advisory` - TXT/PDF quotation upload and comparison
- `/api/supplier-discovery` - Server-side supplier discovery endpoint

## Important LocalStorage Keys

- `mm-sourcing-demo-state` - Demo workflow state.
- `mm-laptop-requirement` - Latest submitted procurement requirement.
- `mm-selected-laptop-suppliers` - Selected supplier records for RFQ.
- `mm-rfq-sent-log` - Simulated sent RFQ log.

## Files/Folders Intentionally Excluded From Handoff ZIP

- `node_modules/`
- `.next/`
- `.git/`
- `.vercel/`
- `.env`
- `.env.local`
- logs
- screenshots
- `*.tsbuildinfo`
- OS-specific files
