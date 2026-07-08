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
- Fictional supplier data
- Deterministic supplier recommendation logic
- Deterministic TXT/PDF quotation extraction and comparison logic
- Simulated RFQ generation
- Simulated RFQ send recording

There is no login flow. Users start from the landing page and choose:
- Hardware Procurement
- Procurement Advisory

Current hardware procurement flow:
Landing page -> Hardware Procurement -> simplified laptop requirement form -> supplier recommendation -> select suppliers -> RFQ draft -> edit email -> simulated send recording -> success popup and sent summary.

Current hardware requirement form:
- Shows only Basic Details and Laptop Requirement sections.
- Does not expose supplier preference, warranty, support, security, certification, supplier rating, enterprise experience, or delivery timeline expectation fields.
- Uses internal defaults for removed supplier-filter fields so supplier recommendations and RFQ generation continue to work.

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
6. Inspect current styling/components before changing UI.
7. Run or verify the build only when the task affects code.

Good next tasks:
- Deployment support
- Vercel smoke testing
- Small bug fixes
- Focused UI polish
- Documentation updates
- Demo-only enhancements that preserve deterministic behavior
- Configurable scoring weights
- Exporting demo comparison summaries

Guardrails:
- Keep the app demo-only.
- Keep state localStorage-based unless explicitly asked otherwise.
- Keep supplier data fictional.
- Keep email sending simulated only.
- Keep all AI-like behavior deterministic and rule-based.
- Keep quotation parsing local and deterministic.
- Do not add real authentication or a backend login system.
- Do not add external services.
- Do not add API keys.
- Do not add heavy UI frameworks.
- Keep the UI restrained, enterprise-ready, and procurement-focused.
- Lowest price should not automatically be treated as the best vendor.
```
