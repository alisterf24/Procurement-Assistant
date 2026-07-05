# M&M AI Sourcing Assistant

M&M AI Sourcing Assistant is a demo-only laptop procurement sourcing prototype for a procurement manager. It walks through requirement intake, deterministic supplier matching, RFQ draft generation, and simulated RFQ sending.

This is a demo-only prototype. The AI agent is simulated using deterministic rule-based logic and templates. No real supplier emails are sent.

## Demo Notes

- No OpenAI API is required.
- No external AI API is used.
- No API keys or environment variables are required.
- No real email service is connected.
- RFQ sending is simulated and stored locally for the demo session.
- Supplier data is fictional and stored in the project.
- The UI uses a Mahindra-inspired enterprise theme, but does not use the actual Mahindra logo.

## Sample Login

- Email: `procurement.manager@mahindra.com`
- Password: any value

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- LocalStorage for demo session state
- Mock supplier database
- Deterministic simulated AI procurement agent

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

## Build

Create a production build:

```bash
npm run build
```

Run the production build locally:

```bash
npm run start
```

## Vercel Deployment

This project is ready to deploy on Vercel as a public demo website.

Recommended Vercel settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: use the Next.js default
- Environment variables: none required

Because the AI agent, supplier data, authentication, and email sending are simulated locally, no API keys, email credentials, or external services are needed for deployment.
