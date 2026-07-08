# Procurement Assistant

Procurement Assistant is a demo-only procurement decision-support prototype. It includes a hardware sourcing flow and a quotation comparison advisory flow.

The prototype uses deterministic local logic, fictional supplier data, browser localStorage, and simulated RFQ sending. No API keys, external services, real authentication, or real email delivery are required.

## Routes

- `/` - Minimal landing page
- `/requirements` - Hardware procurement requirement form
- `/recommendations` - Supplier recommendations and selection
- `/rfq` - Editable RFQ draft and simulated send summary
- `/advisory` - Quotation upload and comparison

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- LocalStorage for demo state
- Deterministic rule-based procurement logic

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
