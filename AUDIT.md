# Audit: Andropedia recruitment site

Scope: the recruitment flow (`/join`, `POST /api/recruitment`, Google Sheet delivery, confirmation email), the emailed-code login, and the shared plumbing around them. Impact is **high**, **medium** or **low**. `[x]` means fixed on branch `feat/recruitment-polish`; `[ ]` means still open (see the notes).

Baseline before this branch: `next build` passes; `eslint` reported 3 errors and 27 warnings; there were no tests.
Now: build passes, `eslint` reports 0 errors and 13 warnings, 85 tests pass.

## Bugs
- [x] high: A transient Google Sheets error (timeout, 429, 5xx) failed the application immediately. Now retried with backoff, 10 s timeouts, and a retry first checks the reference so it never writes a row twice.
- [x] high: Nothing was saved anywhere else when the Sheet was unreachable. Now a durable Postgres outbox keeps the application, and `flushOutbox` copies it to the Sheet later.
- [x] medium: The confirmation email was sent inside the request. Now sent after the response (`after()`), and queued applications are emailed too.
- [x] medium: Gmail dots and `+tag` aliases bypassed the one-application-per-email rule. Now normalised for duplicate detection (the sheet check, the outbox and the unique constraint).
- [x] medium: Empty Sheet tab got no header row. The header row is now written automatically.
- [x] low: The honeypot returned a fixed fake reference. Now a random reference.
- [x] low: Lint errors in `domains/page.tsx` and `ParticleHeroCanvas.tsx`.
- [ ] low: Duplicate check plus append is still not atomic across several server instances. Two submissions for the same email landing on different instances in the same instant could both pass (the outbox path is protected by a unique constraint; the Sheet path is not). The dashboard should treat the earliest row per email as the real one.

## Security
- [x] high: Security headers added (`nosniff`, framing blocked, referrer policy, permissions policy, a safe CSP subset, HSTS in production); `X-Powered-By` removed.
- [x] high: Request bodies now have size limits (16 KB to 32 KB) and return 413.
- [ ] medium: Rate limits are still in memory per server instance. Added `Retry-After` and an `x-real-ip` fallback, but a durable limiter (database or Redis) is the real fix on serverless hosting. Login codes are already limited per email in the database.
- [x] medium: Client IP now falls back to `x-real-ip`.
- [x] medium: Environment is validated centrally (`src/lib/env.ts`); problems are reported by `/api/health` (detailed list only with the bearer secret).
- [x] medium: Query parameters on `/api/tasks` and `/api/leaderboard` are validated.
- [ ] low: `/api/member-photo/[id]` has no rate limit.

## Validation and error handling
- [x] high: Open/close and a deadline are enforced on the server (`RECRUITMENT_OPEN`, `RECRUITMENT_OPENS_AT`, `RECRUITMENT_CLOSES_AT`) and shown in the form.
- [x] medium: Raw zod messages no longer leak ("This field is required." instead).
- [x] medium: API errors share one shape (`{ success: false, error, fieldErrors? }`) in the recruitment, login, leaderboard, weeks, members and body-reading paths.
- [x] medium: Added a 404 page and a route error boundary.
- [x] low: Structured logger (JSON in production, no emails or answers in logs) used by the recruitment and login routes and the outbox.
- [ ] low: A few older routes still use plain `console.error`.

## Accessibility
- [x] high: Join form has `aria-invalid`, `aria-describedby`, `aria-required`; focus moves to the step heading and to the first invalid field; fieldset/legend for the domain choice; step labels for screen readers.
- [x] medium: Visible focus rings (global rule plus on form controls).
- [x] medium: Helper text on `/join` raised to a higher-contrast colour. A full-site contrast audit was not done.
- [x] low: `prefers-reduced-motion` honoured for CSS (global rule) and for framer-motion (`MotionConfig reducedMotion="user"`).

## Performance
- [x] medium: `/join` is a server component; only the form is a client component. The FAQ uses native `<details>`.
- [ ] medium: Avatars are still raw `<img>` (now `loading="lazy"` and `decoding="async"`). Moving to `next/image` needs the remote hosts (Google Drive proxy, Unsplash demo images) configured.
- [x] medium: The home page embedded the full Domains, Team, Projects and Events pages (about 9,600 px for the team alone, loaded up front). It is now a short overview (about 4,700 px) with a core-team preview and links to the real pages; the navbar and footer link to those pages.
- [x] low: Cache headers on `/api/members`, `/api/weeks`, `/api/leaderboard` and `/api/recruitment/status`.
- [x] low: Removed 16 unused imports/variables and a wasted `/api/tasks` request on the admin page.

## UX/UI polish
- [x] high: Autosave of the in-progress application (localStorage, 14 days, never saves consent, "Start over").
- [x] medium: Deadline banner with days left, and an "applications closed / open soon" panel.
- [x] medium: Toasts for draft restored, reference copied and connection problems.
- [x] low: Copy button for the reference ID on the confirmation screen.
- [x] low: Mobile-first form: 16 px inputs, full-width buttons, stacked controls on small screens. Checked in code; not checked on a real phone-width browser window.

## Missing features for a recruitment site
- [x] high: Open/close dates and a kill switch, enforced on the server.
- [x] high: Outbox so an accepted application is never lost, with a script and a protected endpoint to flush it (no `vercel.json` cron: hobby plans only allow daily crons).
- [x] medium: Sheet header row created automatically.
- [x] medium: Optional allow-list of email domains.
- [x] medium: `/api/health`.
- [x] medium: SEO: per-page metadata for `/join`, `metadataBase`, title template, Open Graph and Twitter tags with a generated share image, `sitemap.xml`, `robots.txt`, private portal marked noindex.
- [ ] medium: Applicants cannot look up the status of an application. This needs applicant accounts or a reference-plus-email lookup against the Sheet, and was deliberately left out (the admins' dashboard owns status).

## Tests
- [x] high: 85 tests (`npm test`): validation, deadline rules, email normalisation, rate limiter, sheet row building and formula injection, retries, http helpers, env checks, the full application route (success, duplicates, simultaneous submissions, validation, honeypot, rate limit, allow-list, closed and not-yet-open, outbox fallback, total failure) and the outbox flush.
- [ ] medium: No component tests for the form (would need jsdom and testing-library). The form was exercised by hand in a real browser instead.
- [ ] medium: Google Sheets and SMTP calls are tested through fakes only. They have never run against a real sheet or mail provider.

## Update (2026-10-09)
- The recruitment outbox was removed. `Application` rows are the source of truth; `npm run recruitment:retry` re-syncs rows with no Sheet copy or no confirmation email.
- Rate limits are now shared through Postgres (`RateLimit`), falling back to memory if the database is down. This closes the "in memory per instance" item above.
- Added: applicant status lookup, admin applicant review with decision emails, `Project` model and API (the `/projects` page no longer ships invented projects), real home-page leaderboard, graded-task emails, add-member and create-week forms, audit log viewer.
- Tests now cover login codes, sessions, the role guard, task submission, grading and every admin route.
- Still open: the new migrations (`drop_recruitment_outbox`, `rate_limit`, `projects`) have not been applied to the live database, and mail and the Sheet have not been checked end to end against the real services.
