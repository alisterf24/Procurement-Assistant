# Procurement Assistant

Procurement Assistant is a demo-only procurement decision-support prototype. It includes a hardware sourcing flow and a quotation comparison advisory flow.

The prototype uses deterministic local logic, a curated public-source supplier registry with offline fallback support, browser localStorage, and simulated RFQ sending. No API keys, paid APIs, external AI services, real authentication, or real email delivery are required.

## Current Experience

- Modern landing page with Hardware Procurement and Procurement Advisory action cards.
- Responsive sidebar navigation on inner pages for Home, Hardware Procurement, and Procurement Advisory.
- Hardware Procurement flow for laptop requirements, supplier recommendations, RFQ draft generation, and simulated Send RFQ.
- Procurement Advisory flow for TXT/PDF quotation comparison and deterministic decision support.
- Demo-only state stored locally in the browser.

## Routes

- `/` - Landing page
- `/requirements` - Hardware procurement requirement form
- `/recommendations` - Supplier recommendations and selection
- `/rfq` - Editable RFQ draft and simulated Send RFQ summary
- `/advisory` - Quotation upload and comparison
- `/api/supplier-discovery` - Server-side supplier discovery endpoint

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- LocalStorage for demo state
- Deterministic rule-based procurement logic
- Server-side supplier discovery utility and API route
- Curated India-focused public-source supplier registry
- Deterministic TXT/PDF quotation comparison logic

## Demo Guardrails

- No OpenAI API.
- No external AI API.
- No paid search APIs or API keys.
- No real email sending.
- No real authentication.
- No unrestricted scraping, LinkedIn scraping, private data scraping, login-protected scraping, or bot-protection bypass.
- Supplier discovery falls back safely so the demo remains usable if live public-source checks are unavailable.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

This workspace also includes `pnpm-lock.yaml`, so pnpm-based environments can use:

```bash
pnpm install
pnpm dev
```

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deployment

Recommended Vercel settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: Next.js default
- Environment variables: none required
