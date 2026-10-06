# Audit: Andropedia recruitment site

Scope: the recruitment flow (`/join`, `POST /api/recruitment`, Google Sheet delivery, confirmation email), the emailed-code login, and the shared plumbing around them. Impact is **high**, **medium** or **low**. `[x]` means fixed on branch `feat/recruitment-polish`.

Baseline before this branch: `next build` passes; `eslint` reports 3 errors and 27 warnings; there are no tests.

## Bugs
- [ ] high: A transient Google Sheets error (timeout, 429, 5xx) fails the application immediately with a 503, so the applicant loses their answers. There are no retries.
- [ ] high: Nothing is saved anywhere else when the Sheet is unreachable, so an outage means lost applications.
- [ ] medium: The confirmation email is sent inside the request, so a slow SMTP server delays or times out the response after the application was already saved.
- [ ] medium: Duplicate check compares lower-cased emails only. `name+tag@gmail.com` and dotted Gmail variants bypass the one-application-per-email rule.
- [ ] medium: If the Sheet tab is empty, rows are appended with no header row, and the resend script (which skips row 1) then skips the first application.
- [ ] low: The honeypot success response returns a fixed fake reference (`REC-00000000`).
- [ ] low: Lint errors in `domains/page.tsx` (setState in effect, `any`) and `ParticleHeroCanvas.tsx` (`prefer-const`).

## Security
- [ ] high: No security headers (no `nosniff`, framing protection, referrer policy, HSTS) and `X-Powered-By` is exposed.
- [ ] high: Request bodies are read with `request.json()` with no size limit.
- [ ] medium: Rate limits are in memory per server instance, so they barely work on serverless hosting. No `Retry-After` header on 429s.
- [ ] medium: Client IP is taken from the first `x-forwarded-for` entry only, with no fallback header.
- [ ] medium: No option to accept only college email domains.
- [ ] medium: Environment variables are read ad hoc with no validation. A missing production secret is only discovered when a request fails.
- [ ] medium: Query parameters on `/api/tasks` and `/api/leaderboard` are not validated.
- [ ] low: `/api/member-photo/[id]` proxies Google Drive for any valid-looking id with no rate limit.

## Validation and error handling
- [ ] high: No application deadline or open/close control, on the server or in the UI.
- [ ] medium: Some zod messages leak to users ("Invalid input: expected string, received undefined").
- [ ] medium: API error responses are not one consistent shape.
- [ ] medium: No `not-found` page or error boundary; an unexpected render error shows the framework default.
- [ ] low: Logging is unstructured `console.error`, with no request context or application reference.

## Accessibility
- [ ] high: Form inputs have no `aria-invalid` / `aria-describedby`, errors are not announced, and moving between steps does not move focus.
- [ ] medium: Inputs only change border colour on focus, and buttons have no visible `focus-visible` style.
- [ ] medium: Small helper text uses `text-slate-500` on a near-black background, below the contrast target.
- [ ] low: Animations do not respect `prefers-reduced-motion`.

## Performance
- [ ] medium: The entire `/join` page is one client component, so the static overview, steps and FAQ ship as JavaScript.
- [ ] medium: Raw `<img>` tags for avatars, with no lazy loading or async decoding.
- [ ] low: Public read APIs (`/api/members`, `/api/weeks`, `/api/leaderboard`) send no cache headers.
- [ ] low: 17 unused imports/variables.

## UX/UI polish
- [ ] high: A half-filled application is lost on refresh or accidental navigation.
- [ ] medium: No visible deadline or "applications closed" state.
- [ ] medium: No toasts; draft/network feedback is limited to inline text.
- [ ] low: The confirmation screen has no way to copy the reference ID.

## Missing features for a recruitment site
- [ ] high: Open/close dates and a kill switch, enforced on the server.
- [ ] high: A durable outbox so an accepted application is never lost when the Sheet is down, plus a way to flush it (script and protected cron endpoint).
- [ ] medium: Sheet header row created automatically.
- [ ] medium: Optional allow-list of email domains.
- [ ] medium: Health check endpoint for hosting and uptime monitors.
- [ ] medium: SEO basics: per-page metadata, `metadataBase`, Open Graph image, `sitemap.xml`, `robots.txt`.

## Tests
- [ ] high: No automated tests of any kind.
- [ ] medium: No tests for the recruitment validation, the cycle (open/close) rules, email normalisation, or the end-to-end application route.
