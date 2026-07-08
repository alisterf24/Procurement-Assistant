# Continue This Project In Another ChatGPT/Codex Session

Paste this prompt into the new ChatGPT Enterprise or Codex session:

```text
You are continuing an existing project called "Procurement Assistant".

Important:
- This is an existing implemented project, not a new build.
- Do not rebuild the app from scratch.
- Continue from the current implementation.
- Read PROJECT_HANDOFF.md first.
- Read FILE_MANIFEST.md second.
- Read README.md.
- Then inspect the codebase before making changes.
- Preserve the demo-only behavior unless I explicitly ask to change it.
- Do not add OpenAI API.
- Do not add any external AI API.
- Do not add real email sending.
- Do not require API keys.
- Do not use the actual Mahindra logo.
- Do not reintroduce user-facing M&M or Mahindra branding.

Project summary:
Procurement Assistant is a demo-only enterprise procurement decision-support prototype. It includes a hardware procurement flow for laptop sourcing and a procurement advisory flow for comparing received vendor quotations.

The application uses:
- Next.js App Router
- TypeScript
- Tailwind CSS
- LocalStorage state
- Server-side supplier discovery API route
- Curated India-focused public-source supplier registry
- Fictional supplier data as a safe offline fallback
- Deterministic supplier recommendation fallback logic
- Deterministic TXT/PDF quotation extraction and comparison logic
- Simulated RFQ generation
- Simulated RFQ send recording

There is no login flow. Users start from the landing page and choose:
- Hardware Procurement
- Procurement Advisory

Current UI/navigation:
- The landing page is a polished enterprise hero with concise capability highlights and two premium action cards.
- Inner pages use a responsive sidebar with Home, Hardware Procurement, and Procurement Advisory.
- The previous inner-page top-right navigation buttons have been replaced by the sidebar/mobile nav.
- Mobile inner pages use a compact navigation strip.

Current hardware procurement flow:
Landing page -> Hardware Procurement -> simplified laptop requirement form -> supplier recommendation -> select suppliers -> RFQ draft -> edit email -> Send RFQ -> success popup and sent summary.

Current hardware requirement form:
- Shows only Basic Details and Laptop Requirement sections.
- Does not expose supplier preference, warranty, support, security, certification, supplier rating, enterprise experience, or delivery timeline expectation fields.
- Uses internal defaults for removed supplier-filter fields so supplier recommendations and RFQ generation continue to work.

Current supplier recommendation flow:
- The page calls `/api/supplier-discovery`.
- The server route uses `lib/supplier-discovery.ts`.
- Supplier discovery accepts the hardware requirement and builds a search-style query from laptop category, preferred brand, India, enterprise laptop supplier, reseller, authorized partner, and corporate laptop dealer terms.
- Live public-source reachability checks are attempted only where technically possible.
- The active supplier list comes from a curated India-focused public-source registry when live search is unavailable.
- The UI clearly labels the source mode and shows only publicly available business details.
- If supplier discovery fails, the page falls back to the existing fictional supplier database so the demo remains usable.
- Do not add paid search APIs, API keys, unrestricted scraping, LinkedIn scraping, private data scraping, login-protected scraping, or bot-protection bypass.

Current RFQ page:
- Shows selected supplier email IDs in the To field.
- Keeps the editable RFQ subject and body generated from the hardware requirement.
- Does not show the draft note section.
- Does not show Send readiness or Send mode cards.
- The send action is labeled Send RFQ.
- Clicking Send RFQ is simulated only and displays "RFQ sent successfully."

Current procurement advisory flow:
Landing page -> Procurement Advisory -> upload at least two TXT or text-readable PDF quotation files -> reviewing quotations loading state -> Decision Summary -> vendor quotation comparison cards.

Procurement Advisory notes:
- TXT files are read directly.
- Text-readable PDFs are extracted locally in the browser.
- Scanned/image-only PDFs are not OCR processed and should show a readable-text warning.
- No uploaded quotation file is sent to a backend or external service.

Before making changes:
1. Read PROJECT_HANDOFF.md.
2. Read FILE_MANIFEST.md.
3. Read README.md.
4. Inspect package.json and the app routes.
5. Inspect lib/agent/procurementAgent.ts and lib/agent/quotationAgent.ts.
6. Inspect app/api/supplier-discovery/route.ts and lib/supplier-discovery.ts if working on supplier recommendations.
7. Inspect current styling/components before changing UI.
8. Run or verify the build only when the task affects code.

Good next tasks:
- Deployment support
- Vercel smoke testing
- Small bug fixes
- Focused UI polish
- Documentation updates
- Demo-only enhancements that preserve deterministic behavior
- Configurable scoring weights
- Exporting demo comparison summaries
- Focused UI polish that keeps the sidebar/navigation structure intact

Guardrails:
- Keep the app demo-only.
- Keep state localStorage-based unless explicitly asked otherwise.
- Keep supplier data demo-safe. Public-source supplier registry entries must use only public business information; fictional supplier data remains the fallback.
- Keep email sending simulated only.
- Keep all AI-like behavior deterministic and rule-based.
- Keep quotation parsing local and deterministic.
- Do not add real authentication or a backend login system.
- Do not add external AI services.
- Do not add paid APIs.
- Do not add API keys.
- Do not scrape private, login-protected, restricted, or LinkedIn sources.
- Do not add heavy UI frameworks.
- Keep the UI restrained, enterprise-ready, and procurement-focused.
- Lowest price should not automatically be treated as the best vendor.
```
