# Implementation Plan & Development Roadmap
## ScopeAI — AI Scope Guard for Freelance Developers

**Version:** 1.0
**Date:** June 28, 2026
**Status:** Draft
**Author:** Generated for @saifbuilds

---

## Table of Contents

1. [MVP Scope Definition](#1-mvp-scope-definition)
2. [Phased Development Roadmap](#2-phased-development-roadmap)
3. [Task Dependency Map](#3-task-dependency-map)
4. [Top 20 Implementation Tasks in Order](#4-top-20-implementation-tasks-in-order)
5. [Testing Plan](#5-testing-plan)
6. [Deployment Plan](#6-deployment-plan)
7. [Launch Checklist](#7-launch-checklist)
8. [Risks and Mitigation](#8-risks-and-mitigation)
9. [Future Improvements — v2 Backlog](#9-future-improvements--v2-backlog)
10. [Success Milestones](#10-success-milestones)

---

## 1. MVP Scope Definition

### The Single Most Important User Action MVP Must Support End-to-End

> A developer receives a client message in Slack or email → ScopeAI flags it as out-of-scope → developer confirms it → ScopeAI generates a change order → developer sends it → client approves it via email link.

Every MVP feature either directly enables this flow or is required to get the developer to the point of running it (auth, onboarding, billing).

---

### Included in MVP

| Feature | Why It's In |
|---|---|
| Email/password sign up and Google OAuth sign in | Required for access |
| Email verification | Required for Gmail OAuth verification (Google policy) |
| Onboarding wizard (5 steps) | Critical for activation — developers who don't complete setup never see value |
| Project creation with client name and email | Core data model |
| Scope definition (manual text entry) | Required for AI analysis |
| Scope definition (PDF and DOCX upload with text extraction) | Reduces friction for developers with existing scope documents |
| Slack OAuth integration and message monitoring (Events API) | Primary message source for most freelance developers |
| Gmail OAuth integration and email monitoring (push notifications) | Second primary message source |
| Outlook OAuth integration and email monitoring (Graph webhooks) | Third primary message source |
| AI scope comparison engine (GPT-4o) | Core product feature |
| Out-of-scope alert dashboard with filter tabs | Core product feature |
| Alert detail view with AI reasoning and scope excerpt | Required for developer trust and action |
| Alert actions: dismiss, confirm, snooze, false positive feedback | Required for usability |
| Bulk alert dismiss | Quality of life; prevents alert fatigue |
| AI change order draft generation | Core product feature |
| Change order editor with live client preview | Required for developer confidence before sending |
| Change order send (email via Resend) | Core product feature |
| Client change order approval page (public, no account required) | Core product feature |
| Client approve with name signature | Core product feature |
| Client reject with optional reason | Core product feature |
| Change order status tracking (sent / viewed / approved / rejected / expired) | Required for developer awareness |
| Change order resend and cancel | Required for managing real-world client interactions |
| Manual change order creation (without alert) | Required for verbal scope changes |
| Audit trail (project history) | Required for dispute protection |
| Audit log export (PDF and CSV) | Required for dispute protection |
| Multi-project management | Freelancers have multiple clients |
| Scope version history | Required for audit trail completeness |
| Integration management (connect, disconnect, re-auth) | Required for operational reliability |
| Notification preferences | Required for developers who don't want email spam |
| AI sensitivity settings (Conservative / Balanced / Aggressive) | Required to reduce false positive alert fatigue |
| Default change order settings (terms, expiry, currency) | Saves time per order |
| Paddle billing integration (subscription, checkout, webhook handling) | Required for revenue |
| 14-day free trial, no credit card required | Required for low-friction acquisition |
| Payment failure grace period (7 days) | Required for fair customer treatment |
| Account deletion | Legal requirement (GDPR) |
| SSE real-time alert notifications | Required for timely developer response |
| Security: AES-256 token encryption, hashed approval tokens, rate limiting | Required before launch |

---

### Explicitly Excluded from MVP

| Feature | Rationale |
|---|---|
| Mobile app (iOS / Android) | Adds 8+ weeks; primary use case works on desktop |
| Multi-seat / team accounts | Auth complexity; primary persona is solo developer |
| Microsoft Teams integration | Lower demand than Slack among freelance devs |
| Discord integration | Niche; evaluate post-launch |
| WhatsApp / SMS monitoring | Carrier integration complexity and compliance risk |
| Voice / video call transcription | Major ML infrastructure; out of scope |
| Invoicing / payment collection | FreshBooks, Wave, and others solve this |
| AI model fine-tuning | Requires training data; use few-shot prompting at MVP |
| Public REST API | Build integrations first; API is v2 leverage |
| Zapier / Make integration | Evaluate after core integrations validated |
| Custom domain for approval pages | Nice branding; not essential |
| Dark mode | Build light theme excellently; dark mode is v2 |
| Multi-language support | English first |
| Proposal / contract generation | Adjacent feature; separate product surface |
| Global search | v2; not enough content at MVP to justify |

---

## 2. Phased Development Roadmap

**Capacity assumption:** 10–15 hours/week (12 hours average). Hours per phase are best estimates — track actuals and adjust.

---

### Phase 0: Foundation
**Goal:** Working Next.js app deployed to production with auth, DB, and CI/CD pipeline running.
**Duration:** 2 weeks (24 hours)
**Blocks:** Everything else

| Task | Est. Hours |
|---|---|
| Initialize Next.js 14 project with TypeScript and Tailwind CSS | 2 |
| Configure ESLint, Prettier, Husky pre-commit hooks | 1 |
| Set up GitHub repo with branch protection rules | 0.5 |
| Create Neon PostgreSQL database (production + development branches) | 1 |
| Configure Prisma with initial connection and base schema | 2 |
| Set up NextAuth v5 with email/password and Google OAuth provider | 3 |
| Implement email verification flow (send verification link via Resend) | 2 |
| Set up Vercel project; connect to GitHub for auto-deploy | 1 |
| Configure all environment variables in Vercel (dev + production) | 1 |
| Set up Sentry for error tracking | 1 |
| Set up Trigger.dev project and connect to Next.js | 2 |
| Set up Cloudflare R2 bucket for file storage | 1 |
| Set up Upstash Redis for rate limiting | 1 |
| Write and run first Prisma migration with `users`, `sessions`, `accounts`, `verification_tokens` tables | 2 |
| Build basic sign up, sign in, sign out flows (UI + API) | 3 |
| Verify: sign up → verify email → sign in → session persists → sign out works end-to-end | 1 |

**Done criteria:** A developer can sign up, verify their email, and sign in on the production Vercel URL. Sentry is receiving errors. Trigger.dev is connected.

---

### Phase 1: Core Data Model
**Goal:** Full CRUD for projects, scopes, clients — the structural backbone of the product.
**Duration:** 2 weeks (24 hours)
**Blocks:** Phase 2 (integrations need projects to link to), Phase 3 (AI needs scopes)

| Task | Est. Hours |
|---|---|
| Run Prisma migration: `projects`, `project_scopes`, `clients`, `notification_preferences` tables | 2 |
| Build project list page (all projects, empty state) | 2 |
| Build project creation form and API (`POST /api/projects`) | 2 |
| Build project detail page with tab navigation (Alerts / Change Orders / Scope / Sources / History) | 3 |
| Build scope definition — manual text entry tab (editor + save + version creation) | 3 |
| Build scope definition — file upload tab (PDF and DOCX parsing with pdf-parse + mammoth) | 3 |
| Build scope version history view | 2 |
| Build project archive/delete (soft delete) | 1 |
| Build project edit (name, client name, client email) | 1 |
| Build notification preferences page (all toggles) | 1 |
| Add `onboarding_step` tracking to users table; API to update it | 1 |
| Build file upload to Cloudflare R2 (server-side via AWS SDK v3) | 2 |
| Verify: create project → add scope manually → upload PDF → view scope → edit scope → version history shows both versions | 1 |

**Done criteria:** Developer can create a project, define scope via text and PDF, and view scope version history — all persisted correctly.

---

### Phase 2: Integrations
**Goal:** Slack, Gmail, and Outlook connected via OAuth. Messages ingested from all three into the database.
**Duration:** 4 weeks (48 hours) — longest phase due to API complexity and approval concerns
**Blocks:** Phase 3 (AI needs ingested messages to analyze)

| Task | Est. Hours |
|---|---|
| Run Prisma migration: `integrations`, `monitored_sources`, `ingested_messages`, `webhook_events` tables | 2 |
| Build integrations overview page (3 cards: Slack, Gmail, Outlook) with status indicators | 2 |
| **Slack:** Create Slack app in Slack API console; configure OAuth scopes and redirect URI | 1 |
| **Slack:** Build Slack OAuth connect flow (`/api/integrations/slack/connect` + callback) | 3 |
| **Slack:** Implement Slack Events API webhook receiver (`/api/webhooks/slack`) with signature validation | 2 |
| **Slack:** Build `ingest-slack-message` Trigger.dev job | 3 |
| **Slack:** Build Slack channel selector (fetch channels from API + modal UI) | 2 |
| **Slack:** Build monitored sources management (add/remove channels per project) | 2 |
| **Slack:** End-to-end test: send a message in a connected Slack channel → it appears in `ingested_messages` | 2 |
| **Gmail:** Create Google Cloud project; configure OAuth consent screen; request gmail.readonly scope | 2 |
| **Gmail:** Build Gmail OAuth connect flow (connect + callback) | 3 |
| **Gmail:** Set up Gmail push notifications via Cloud Pub/Sub | 3 |
| **Gmail:** Build Gmail webhook receiver (`/api/webhooks/gmail`) | 2 |
| **Gmail:** Build `ingest-email-message` Trigger.dev job (Gmail variant) | 3 |
| **Gmail:** End-to-end test: send email to connected account → it appears in `ingested_messages` | 2 |
| **Outlook:** Register Microsoft Entra app; configure Graph API scopes | 1 |
| **Outlook:** Build Outlook OAuth connect flow (connect + callback) | 3 |
| **Outlook:** Implement Graph webhook subscription creation on connect | 2 |
| **Outlook:** Build Outlook webhook receiver (`/api/webhooks/outlook`) with validation token handling | 2 |
| **Outlook:** Build `ingest-email-message` Trigger.dev job (Outlook variant) | 2 |
| **Outlook:** Build `refresh-outlook-webhooks` scheduled job (every 60 hours) | 2 |
| **Outlook:** End-to-end test: send email to connected Outlook → it appears in `ingested_messages` | 2 |
| Build `refresh-oauth-tokens` scheduled job (every 45 minutes) | 2 |
| Build integration disconnect flow (revoke tokens, cancel webhooks, deactivate sources) | 2 |
| Build re-authentication flow for expired tokens | 2 |
| Build `cleanup-expired-sessions` scheduled job (daily) | 0.5 |
| Build in-app integration error banner (persistent when integration disconnected) | 1 |

**Done criteria:** Slack messages and Gmail/Outlook emails from monitored sources are ingested into `ingested_messages` automatically, within 2 minutes of receipt.

**⚠️ Critical parallel task:** Apply for Google OAuth sensitive scope verification on **Day 1 of Phase 2**. Process takes 2–6 weeks. Use test user list (up to 100) during development.

---

### Phase 3: AI Engine
**Goal:** Every ingested message is analyzed against the project scope. Alerts created for out-of-scope and unclear messages.
**Duration:** 2 weeks (24 hours)
**Blocks:** Phase 4 (change orders need alerts)

| Task | Est. Hours |
|---|---|
| Run Prisma migration: `scope_alerts` table | 1 |
| Set up OpenAI SDK (`openai` npm package) and configure API key | 0.5 |
| Write scope comparison prompt (system prompt + user prompt template) | 3 |
| Build `analyze-message` Trigger.dev job (full implementation) | 4 |
| Build AI analysis retry logic (3 attempts; exponential backoff) | 2 |
| Handle `analysis_status = 'skipped_no_scope'` (no scope defined) | 1 |
| Handle `analysis_status = 'failed'` (notify developer; manual review card) | 2 |
| Build alert list page (all projects view) with filter tabs | 3 |
| Build alert card component (source badge, classification badge, confidence badge, quick actions) | 2 |
| Build alert detail page (message panel + AI analysis panel + action panel) | 4 |
| Build alert actions API: dismiss, confirm, snooze, false positive (`PATCH /api/projects/[id]/alerts/[id]`) | 2 |
| Build bulk alert dismiss (select multiple + dismiss all) | 1 |
| Build SSE endpoint (`/api/sse/alerts`) for real-time alert badge updates | 2 |
| Build AI sensitivity settings page (Conservative / Balanced / Aggressive) | 1 |
| Build `send-alert-digest` scheduled job (daily email per user notification prefs) | 2 |
| Build alert count badge on sidebar nav (updates via SSE or 30s polling fallback) | 1 |
| Verify end-to-end: client sends out-of-scope message → AI analyzes → alert appears on dashboard within 2 minutes | 2 |
| Test with 20 sample messages against a real scope document; verify accuracy ≥ 85% | 3 |

**Done criteria:** Out-of-scope client messages from Slack/email appear as alerts on the dashboard within 2 minutes. AI accuracy is ≥ 85% on the golden test set.

---

### Phase 4: Change Orders
**Goal:** Full change order lifecycle — AI draft generation, editor with live preview, send, client approval page.
**Duration:** 3 weeks (36 hours)
**Blocks:** Phase 5 (billing can be built in parallel after Phase 4 starts)

| Task | Est. Hours |
|---|---|
| Run Prisma migration: `change_orders`, `change_order_events` tables | 1 |
| Build AI change order draft generation (Trigger.dev job + API endpoint) | 4 |
| Build AI draft generation loading screen (animated; rotating copy) | 1 |
| Build change order editor page (left: form fields; right: live preview) | 5 |
| Build auto-save for change order drafts (every 30 seconds) | 1 |
| Build change order preview (renders exactly as client will see it) | 2 |
| Build mobile preview toggle in the editor | 1 |
| Build change order send flow (token generation, SHA-256 hash, email delivery via Resend) | 3 |
| Build `send-change-order-email` Trigger.dev job | 2 |
| Build client change order approval page (`/co/[token]`) — public, no auth | 4 |
| Build client approval flow: name input + confirm → API + developer notification | 2 |
| Build client rejection flow: optional reason + confirm → API + developer notification | 1 |
| Build expired/invalid link states on the approval page | 1 |
| Build change order detail page (status timeline, all fields, conditional actions) | 3 |
| Build change order list page (global + project-scoped, filter by status) | 2 |
| Build change order cancel and resend flows | 2 |
| Build manual change order creation (no linked alert) | 1 |
| Build `expire-change-orders` scheduled job (hourly) | 1 |
| Build SSE events for co_approved and co_rejected (developer notified in real time) | 1 |
| Build default change order settings (terms, expiry, currency) in Settings | 1 |
| Verify end-to-end: alert → generate draft → edit → send → client opens link on mobile → approves → developer sees "Approved" in 60 seconds | 3 |

**Done criteria:** Developer can generate a change order from an alert, send it to a client, and the client can approve or reject it on a mobile device without a ScopeAI account.

---

### Phase 5: Billing
**Goal:** Paddle subscription flow fully working. Developers can pay and their accounts are managed correctly.
**Duration:** 2 weeks (24 hours)
**Can run in parallel with Phase 4 after Week 1 of Phase 4**

| Task | Est. Hours |
|---|---|
| Run Prisma migration: `subscriptions` table | 1 |
| Create Paddle account; configure products and prices in Paddle dashboard | 2 |
| Install and configure Paddle.js frontend SDK | 1 |
| Build billing settings page (current plan, upgrade CTA, invoice list) | 2 |
| Build `POST /api/billing/checkout` → returns Paddle checkout URL | 2 |
| Build `GET /api/billing/subscription` → returns current subscription status | 1 |
| Build Paddle webhook receiver (`/api/webhooks/paddle`) with signature validation | 2 |
| Build `handle-paddle-webhook` Trigger.dev job (all subscription event types) | 3 |
| Build subscription-gated middleware (restrict access for lapsed accounts) | 2 |
| Build trial status banner ("X days remaining in your free trial") | 1 |
| Build payment failure banner + grace period state | 2 |
| Build subscription cancellation flow (cancel at period end via Paddle API) | 2 |
| Build post-cancellation state (access until period end; clear messaging) | 1 |
| Send receipt/confirmation email on successful subscription (via Resend) | 1 |
| Test full billing flow end-to-end with Paddle sandbox: trial → upgrade → pay → subscription active → cancel → period ends → access restricted | 3 |
| Test payment failure webhook → grace period applied → grace period email sent | 2 |

**Done criteria:** A developer can start a free trial, upgrade to a paid plan via Paddle, and their subscription state is reflected correctly in the app in real time.

---

### Phase 6: Polish and Launch Prep
**Goal:** Product feels complete, trustworthy, and ready for the first external users. No rough edges.
**Duration:** 3 weeks (36 hours)

| Task | Est. Hours |
|---|---|
| Build onboarding wizard (5-step: connect Slack → connect email → create project → define scope → select sources → complete) | 5 |
| Build onboarding completion screen ("ScopeAI is now watching [Project Name]") | 1 |
| Build all empty states (no projects, no alerts, no change orders, no history, no integrations) | 3 |
| Build skeleton loading states for all data-loaded pages | 2 |
| Build all toast notifications (success, error, warning) | 1 |
| Build all confirmation modals (archive project, delete account, cancel CO, disconnect integration) | 2 |
| Build "Manual Review" card for AI analysis failures | 1 |
| Build account deletion flow (type DELETE to confirm) | 1 |
| Build profile settings page (name, avatar) | 1 |
| Build forgot password and reset password flows | 2 |
| Implement all rate limiting (Upstash Redis) on sensitive endpoints | 2 |
| Implement security headers in Next.js config (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | 1 |
| Add Prisma `select`/`omit` to all API routes — ensure no sensitive fields returned | 2 |
| Audit all API routes: verify ownership check (`user_id = session.user.id`) on every route | 2 |
| Run Lighthouse audit on dashboard, alert detail, and client approval page; fix any score < 90 | 2 |
| Run axe accessibility audit on all pages; fix all critical and serious issues | 2 |
| Test client approval page on iPhone Safari 17 and Android Chrome — fully functional | 2 |
| Write privacy policy page (required for Google OAuth and Paddle) | 2 |
| Write terms of service page | 1 |
| Build landing page (marketing page at `/`) | 4 |
| Set up custom domain (scopeai.co or similar) in Vercel | 1 |
| Run full end-to-end test of the entire developer journey (onboarding → alert → CO → client approves → audit log) | 3 |

**Done criteria:** The full user journey works without rough edges. Privacy policy and terms are live. Landing page is live. No accessibility critical issues.

---

### Phase 7: Public Launch
**Goal:** First external users acquired and monitored.
**Duration:** 1 week (10 hours)
**Runs after Phase 6 is complete and Google OAuth verification is approved**

| Task | Est. Hours |
|---|---|
| Final production smoke test (all integrations, billing, AI, client approval page) | 2 |
| Enable Paddle live mode (switch from sandbox to production) | 1 |
| Verify Sentry is receiving real production errors | 0.5 |
| Write launch thread for X (@saifbuilds) — problem, solution, demo GIF, CTA | 2 |
| Direct message 10–15 warm contacts from existing 29+ client network | 1 |
| Post on Indie Hackers ("I'm building ScopeAI — first 10 users get lifetime discount") | 0.5 |
| Post on r/freelance and r/webdev (soft launch, value-first framing) | 0.5 |
| Set up a simple feedback collection (Typeform or Notion form) for early users | 0.5 |
| Monitor Sentry, Trigger.dev dashboard, and Vercel logs for the first 48 hours | 2 |

**Done criteria:** ScopeAI is live. First external users can sign up, onboard, and use the product.

---

### Phase Summary

| Phase | Name | Duration | Hours | Cumulative Hours |
|---|---|---|---|---|
| 0 | Foundation | 2 weeks | 24 | 24 |
| 1 | Core Data Model | 2 weeks | 24 | 48 |
| 2 | Integrations | 4 weeks | 48 | 96 |
| 3 | AI Engine | 2 weeks | 24 | 120 |
| 4 | Change Orders | 3 weeks | 36 | 156 |
| 5 | Billing | 2 weeks | 24 | 180 |
| 6 | Polish & Launch Prep | 3 weeks | 36 | 216 |
| 7 | Public Launch | 1 week | 10 | 226 |
| **Total** | | **~19 weeks** | **~226 hours** | |

**At 12 hours/week:** 226 ÷ 12 = **~19 weeks from start to launch** (~5 months).

**Optimization opportunity:** Phase 5 (Billing) can begin in parallel with Phase 4 Week 2 onward, saving approximately 2 weeks. Realistic optimistic timeline: **17 weeks (~4 months).**

---

## 3. Task Dependency Map

### Critical Path

The following sequence cannot be parallelized — each step blocks the next:

```
Phase 0: Foundation (auth, DB, deployment)
    ↓
Phase 1: Core Data Model (projects, scopes)
    ↓
Phase 2: Integrations (Slack, Gmail, Outlook — message ingestion)
    ↓
Phase 3: AI Engine (alert creation from ingested messages)
    ↓
Phase 4: Change Orders (requires confirmed alerts)
    ↓
Phase 6: Polish (requires all features to exist)
    ↓
Phase 7: Launch
```

### Tasks That Can Be Parallelized

| Primary Task (on critical path) | Parallel Task |
|---|---|
| Phase 2: Slack integration | Apply for Google OAuth verification (start immediately) |
| Phase 4, Week 2+: Change order editor | Phase 5: Billing (entire phase) |
| Phase 4: Change order send flow | Phase 5: Paddle webhook handler |
| Phase 6: Polish | Create landing page content and copy |
| Any phase | Write privacy policy and terms of service |

### Highest-Risk Tasks (Most Likely to Exceed Estimate)

| Task | Risk | Mitigation |
|---|---|---|
| Gmail push notification setup (Pub/Sub) | Google Cloud setup is complex; scope verification adds weeks | Start immediately in Phase 2; use test user list during dev |
| AI prompt engineering | Getting ≥ 85% accuracy may require many prompt iterations | Allocate 3 full hours for testing; maintain golden test set |
| Client approval page on iPhone Safari | Mobile Safari has specific quirks with OAuth-adjacent pages | Test on real device early; use Playwright mobile emulation |
| Slack app review (if needed for public dist.) | Review takes 2–4 weeks | Use private install URL for first 20 users |
| Paddle webhook reliability in Trigger.dev | Paddle retries; must handle idempotency correctly | Test with Paddle sandbox webhook simulator |

---

## 4. Top 20 Implementation Tasks in Order

| Priority | Task | Phase | Est. Hours | Blocks |
|---|---|---|---|---|
| 1 | Set up Next.js, TypeScript, Tailwind, Prisma, Neon, Vercel | 0 | 4 | Everything |
| 2 | Implement NextAuth (email/password + Google OAuth) + email verification | 0 | 5 | All auth-gated features |
| 3 | Set up Trigger.dev + Sentry + Upstash + Cloudflare R2 | 0 | 4 | All background jobs, rate limiting, file storage |
| 4 | Core DB schema migration (all 17 tables) | 0–1 | 3 | All data features |
| 5 | Project CRUD + project detail page with tab navigation | 1 | 5 | Integrations, AI, change orders |
| 6 | Scope definition (manual + file upload) + version history | 1 | 8 | AI engine |
| 7 | Apply for Google OAuth sensitive scope verification | 2 | 2 | Gmail integration going live |
| 8 | Slack OAuth connect + Events API webhook + `ingest-slack-message` job | 2 | 10 | AI analysis of Slack messages |
| 9 | Gmail OAuth connect + Pub/Sub push notifications + `ingest-email-message` job | 2 | 10 | AI analysis of Gmail messages |
| 10 | Outlook OAuth connect + Graph webhooks + `ingest-email-message` job | 2 | 9 | AI analysis of Outlook messages |
| 11 | `refresh-oauth-tokens` + `refresh-outlook-webhooks` scheduled jobs | 2 | 4 | Integration reliability |
| 12 | `analyze-message` Trigger.dev job (full AI implementation + retries) | 3 | 6 | Alert creation |
| 13 | Alert list + alert detail + alert action API (dismiss / confirm / snooze) | 3 | 9 | Change order generation |
| 14 | SSE real-time alert notifications | 3 | 2 | Developer awareness without refresh |
| 15 | AI change order draft generation job + editor UI with live preview | 4 | 9 | Change order send |
| 16 | Change order send (token, email, status tracking) | 4 | 5 | Client approval |
| 17 | Client change order approval page (public, mobile-optimized) + approve/reject API | 4 | 7 | Core value delivery to client |
| 18 | Paddle billing (checkout, webhook handler, subscription state, trial + grace period) | 5 | 18 | Revenue |
| 19 | Onboarding wizard + all empty states + all loading states + all toast notifications | 6 | 12 | Activation rate |
| 20 | Security hardening (security headers, ownership audit, rate limiting, sensitive field omit) | 6 | 7 | Safe public launch |

---

## 5. Testing Plan

### Testing by Phase

| Phase | What to Test | How |
|---|---|---|
| 0 | Auth flow (sign up → verify email → sign in → sign out) | Manual, all browsers |
| 0 | Google OAuth sign in | Manual |
| 0 | CI pipeline: TypeScript errors block deploy | Push a type error; confirm Vercel blocks |
| 1 | Project CRUD | Manual |
| 1 | PDF and DOCX upload → text extraction | Manual with real documents (good + edge cases: scanned PDF, password-protected) |
| 1 | Scope version history | Manual |
| 2 | Slack webhook signature validation | Send request with invalid signature → must reject 401 |
| 2 | Slack message ingestion | Send real Slack message in monitored channel → verify DB record |
| 2 | Gmail ingestion | Send email from monitored address → verify DB record within 2 minutes |
| 2 | Outlook ingestion | Same as Gmail |
| 2 | Duplicate webhook delivery | Send same Slack event_id twice → only one `ingested_messages` record |
| 2 | Token refresh | Manually expire a test access token → verify refresh job restores it |
| 3 | AI analysis accuracy | Run golden test set (25 messages) → verify ≥ 85% correct classification |
| 3 | AI retry on OpenAI failure | Mock OpenAI API failure → verify 3 retries → 'failed' status → developer notified |
| 3 | Alert dashboard | Verify filter tabs, badge counts, sorting |
| 3 | Alert actions | Dismiss, confirm, snooze — verify status changes and UI updates |
| 3 | SSE | Open alerts page; trigger a new alert via a Slack message → badge updates without refresh |
| 4 | Change order AI generation | Confirm alert → generate → verify draft fields populated |
| 4 | Change order send | Send to real email → verify email received; client link works |
| 4 | Client approval on mobile | Open approval link on iPhone Safari → approve → developer notified |
| 4 | Client rejection on mobile | Same flow; reject with reason |
| 4 | Expired link | Wait past expiry (or manually set expiry to past) → client sees expired message |
| 4 | Resend | Expire a CO; resend → new token; old link now invalid (returns expired) |
| 5 | Paddle sandbox checkout | Full checkout with test card → subscription created |
| 5 | Paddle payment failure | Use Paddle sandbox decline card → grace period applied; email sent |
| 5 | Subscription cancellation | Cancel → access until period end → lapse → access restricted |
| 6 | Onboarding wizard | New account → complete all 5 steps → verify monitoring is set up |
| 6 | Security headers | Run securityheaders.com against production URL |
| 6 | Accessibility | axe browser extension on all key pages; client approval page required score: 0 critical violations |
| 6 | Lighthouse | Performance ≥ 90, Accessibility ≥ 90 on dashboard and client approval page |

---

### How to Test OAuth Flows Without Real Accounts

- **Slack:** Use a personal Slack workspace (free) with a test channel. Create a test account as the "client."
- **Gmail:** Use a separate personal Gmail account as the "developer" account; send test emails from a second Gmail as the "client."
- **Outlook:** Use a free Microsoft account (`@outlook.com`); same pattern.
- **Local webhook testing:** Use `ngrok` to expose `localhost:3000` as a public URL for webhook testing. Set webhook URLs to `https://[your-ngrok-id].ngrok.io/api/webhooks/slack` etc. during development.
- **Trigger.dev dev mode:** Run `npx trigger.dev@latest dev` locally to test background jobs without deploying.

---

### AI Quality Testing

Maintain a **golden test set** of 25 (message, scope, expected classification) pairs covering:
- 10 clear out-of-scope cases (new feature requests, redesign requests, third-party integrations not in scope)
- 10 clear in-scope cases (bug fixes, content updates, things explicitly listed in scope)
- 5 genuinely ambiguous cases (expect 'unclear' classification)

Run the golden test set:
- Before any prompt change
- Before any GPT model change
- Weekly during the first month post-launch

Track pass rate in a simple spreadsheet. Target: ≥ 85% on out-of-scope and in-scope cases; 60%+ on ambiguous cases getting 'unclear' (not 'in_scope').

---

### Client Approval Flow — End-to-End Test Devices

Before launch, test the client approval page on:
- [ ] iPhone 14, iOS 17, Safari
- [ ] Samsung Galaxy S23, Android 14, Chrome
- [ ] iPad, Safari
- [ ] Desktop: Chrome, Firefox, Safari, Edge

---

### MVP Launch Readiness Manual Checklist

Run this checklist against the production environment before announcing the launch:
- [ ] Sign up → email verification → sign in → onboarding wizard completes successfully
- [ ] Slack message from a monitored channel creates an alert within 2 minutes
- [ ] Gmail email from a monitored address creates an alert within 2 minutes
- [ ] Outlook email from a monitored address creates an alert within 2 minutes
- [ ] Alert detail page shows AI explanation and scope excerpt
- [ ] Confirm alert → generate change order → AI draft appears within 30 seconds
- [ ] Edit change order → live preview updates in real time
- [ ] Send change order → client receives email within 2 minutes
- [ ] Client approval page loads on mobile in < 2 seconds
- [ ] Client approves → developer receives in-app notification within 60 seconds
- [ ] Client rejects with reason → developer sees reason
- [ ] Expired change order link shows correct expired message
- [ ] Audit log shows all events above
- [ ] Export audit log as PDF → PDF downloads with all events
- [ ] Paddle checkout works with live Paddle (not sandbox) test card
- [ ] Payment failure → grace period email sent to developer
- [ ] Account deletion → all data removed; session destroyed
- [ ] securityheaders.com scores B or above on production URL
- [ ] Sentry connected → throw a test error → appears in Sentry
- [ ] Privacy policy and terms of service pages accessible from footer
- [ ] Google OAuth verification approved (or test user workaround confirmed for first 100 users)

---

## 6. Deployment Plan

### Hosting Stack

| Service | Purpose | Cost at Launch |
|---|---|---|
| Vercel | Next.js hosting | Free (Hobby) → Pro $20/month at first paying customer |
| Neon | PostgreSQL | Free tier → Scale $19/month at ~50 users |
| Cloudflare R2 | File storage | Free (10 GB) |
| Upstash Redis | Rate limiting + caching | Free (10K cmd/day) |
| Trigger.dev | Background jobs | Free (500K exec/month) |
| Resend | Transactional email | Free (3K emails/month) |
| Sentry | Error tracking | Free (5K errors/month) |

**Total infrastructure cost at launch: $0/month.** First cost hits at first paying customer (Vercel Pro or Neon Scale).

---

### CI/CD Pipeline

```
Developer pushes to GitHub
        ↓
GitHub Actions runs pre-deploy checks:
  - tsc --noEmit (TypeScript check)
  - prisma validate (schema check)
  - eslint (lint check)
        ↓
  If checks pass:
        ↓
Vercel picks up the push:
  - For PRs → deploys to preview URL (staging equivalent)
  - For main branch → deploys to production
        ↓
Vercel build command:
  - prisma generate
  - prisma migrate deploy
  - next build
        ↓
Vercel deploys new version (zero-downtime rolling deploy)
```

### Environment Strategy

| Environment | Branch | Database | Trigger.dev |
|---|---|---|---|
| Local development | Any feature branch | Neon dev branch | Trigger.dev dev mode (local) |
| Preview (PR) | Pull request | Neon dev branch | Trigger.dev dev mode |
| Production | `main` | Neon production branch | Trigger.dev production |

### Migration Strategy

- All schema changes via Prisma migrations (`prisma migrate dev` locally → creates migration file → committed to git)
- `prisma migrate deploy` runs automatically as part of Vercel build — migrations apply before the new code goes live
- **Breaking changes** (column drops, type changes) use a two-deploy approach:
  - Deploy 1: Add new column (additive)
  - Deploy 2: Remove old column after verifying new code is stable
- **Never** run `prisma migrate reset` or `prisma db push` against production

### Zero-Downtime Deployment

Vercel's default rolling deployment provides zero-downtime for the Next.js application. Database migrations run before new code is live — additive migrations (new columns, new tables) are safe. Non-additive migrations require the two-deploy pattern described above.

---

## 7. Launch Checklist

### Pre-Launch: Technical

- [ ] All 20 items in the MVP Launch Readiness Manual Checklist (Section 5) pass
- [ ] Paddle live mode enabled; live webhook URL configured
- [ ] All environment variables set correctly in Vercel production (not dev values)
- [ ] Custom domain connected and HTTPS certificate active
- [ ] `robots.txt` and `sitemap.xml` present (landing page indexed; app routes excluded)
- [ ] Security headers verified (securityheaders.com ≥ B)
- [ ] Rate limiting verified on auth endpoints (try 6 failed logins → blocked)
- [ ] Sentry alert rules configured (email builder on first occurrence of any new error type)
- [ ] Neon automatic backups verified (Neon enables daily backups by default)
- [ ] Trigger.dev job monitoring enabled (email on job failure)
- [ ] Google Analytics or Plausible connected to landing page [ASSUMPTION: optional; Plausible preferred for privacy]

---

### Pre-Launch: Product

- [ ] Onboarding wizard tested by at least 2 non-builder testers (friends or past clients)
- [ ] Landing page live with headline, value proposition, demo, and CTA
- [ ] Pricing page live with plan details
- [ ] Privacy policy live (required for Google OAuth)
- [ ] Terms of service live
- [ ] FAQ page (optional but reduces support questions)
- [ ] Support email configured (e.g., support@scopeai.co) — even if it's just a personal inbox
- [ ] Trial plan confirmed as 14 days, no credit card

---

### Pre-Launch: Marketing (Build-in-Public on X)

- [ ] Write the launch tweet thread: problem → solution → how it works → demo GIF → pricing → CTA
- [ ] Record a 90-second Loom demo of the full flow (Slack message → alert → change order → client approves)
- [ ] Screenshot the client approval page on mobile (key visual for the thread)
- [ ] Identify the top 10 people from the warm network most likely to be the first users
- [ ] DM those 10 people 48 hours before launch ("I'm launching in 2 days — you're one of the first I'm telling")
- [ ] Schedule the launch thread for peak X engagement time (Tuesday–Thursday, 9am–12pm EST)
- [ ] Post in Indie Hackers "What are you building?" thread 1 week before launch

---

### First 10 Users Acquisition Plan

ScopeAI has a significant distribution advantage: 29+ past clients in the warm network, plus a public @saifbuilds X presence.

**Step 1 — Warm outreach (before public launch, target: 5 users):**
- Identify the 10 past clients most likely to benefit (those who experienced scope creep firsthand)
- Send a personal, direct message — not a newsletter blast: "I built something specifically because of what happened on [project name]. I'd love for you to be the first to try it."
- Offer: lifetime 50% discount for the first 10 users who sign up before launch

**Step 2 — Public X launch (target: 3–5 additional users):**
- Launch thread with the demo video and the specific data point: "99% of freelance devs don't bill for all out-of-scope work. I built ScopeAI to fix that."
- Reply to every comment; follow up with everyone who engages

**Step 3 — Community posts (target: 2–5 additional users):**
- Indie Hackers: post in "I shipped" and link in the weekly thread
- r/freelance: value-first post about scope creep (not an ad); mention ScopeAI in comments if appropriate
- r/webdev: same approach

**Target:** 10 signed-up users within 7 days of launch. 3 paying users within 30 days.

---

## 8. Risks and Mitigation

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Gmail OAuth sensitive scope verification is delayed or rejected** — Google's review of `gmail.readonly` takes 2–6 weeks and can be rejected if the privacy policy or security review is insufficient | High | High | Apply on Day 1 of Phase 2. Publish privacy policy before applying. Record a video walkthrough of the Gmail integration as Google requires. Use the 100 test user allowance during development — the first 100 users can still use Gmail before verification completes. Build Outlook integration in parallel as a fully functional alternative. If rejected, challenge or reapply with corrections. |
| 2 | **Slack app review required for public distribution** — Installing ScopeAI into external Slack workspaces may require Slack's app review process if certain scopes trigger it | Medium | High | Start with a private Slack app distributed via a manual install URL for the first 20–30 users — this bypasses the public app review entirely. Submit for Slack app directory listing in parallel. `channels:history` may require business justification. Have the privacy policy and a clear use-case description ready. |
| 3 | **AI scope detection accuracy below 85%** — GPT-4o may produce too many false positives (alert fatigue leads to churn) or miss real out-of-scope requests (product fails its core promise) | Medium | High | Build the golden test set before writing production prompts. Iterate on the prompt until ≥ 85% accuracy is reached. Implement the false positive feedback mechanism on Day 1. Monitor false positive rate from real users weekly. Add "AI uncertainty" framing for low-confidence flags so developers don't blindly trust them. |
| 4 | **Solo developer burnout at 10–15 hrs/week over 19 weeks** — Sustained part-time development alongside other work is mentally taxing; scope creep in the build itself is a real risk | Medium | High | Time-box each phase strictly. Cut scope ruthlessly if running over — the MVP feature list already has a tight boundary. Take one planned "rest week" after Phase 2 (the most complex integration phase). Ship to first users after Phase 4 is done if billing can be added post-launch temporarily [ASSUMPTION: this is a last resort]. |
| 5 | **First paying customer takes too long (>60 days)** — Zero MRR past 2 months post-launch creates financial and motivational pressure | Medium | High | Do not wait for the app to be "perfect" before telling the warm network. Announce publicly on X while in Phase 5 (billing) — build anticipation. Offer lifetime founding member pricing to the first 10 users. If no paying customers by Day 30 post-launch: schedule 1:1 calls with 5 free trial users to understand blockers. |

---

## 9. Future Improvements — v2 Backlog

Prioritized by user demand signal and revenue impact:

| Priority | Feature | Trigger to Build |
|---|---|---|
| 1 | **Dark mode** | Most-requested feature from early users; design system is already built for it |
| 2 | **Multi-seat / team accounts** | First agency user asks "can my team share this?" |
| 3 | **Microsoft Teams integration** | 3+ user requests; currently deferred due to Slack focus |
| 4 | **Mobile app (React Native + Expo)** | 10+ users request mobile alerts |
| 5 | **AI accuracy improvement (fine-tuning or embeddings)** | False positive rate > 15% sustained over 30 days |
| 6 | **Change order legally binding language / e-signature** | User asks "is this legally binding?" more than once per week |
| 7 | **Stripe integration (via foreign entity)** | If Pakistan banking situation changes or builder sets up foreign entity |
| 8 | **Zapier / Make integration** | 5+ user requests for automation |
| 9 | **Proposal generation (pre-project)** | Users who are happy with change orders ask "can you help with the original proposal too?" |
| 10 | **Public API for third-party integrations** | First developer asks for API access |
| 11 | **Custom domain for client approval pages** | Agency user asks "can my clients see my brand, not ScopeAI?" |
| 12 | **Scope quality score / suggestions** | Users writing poor scopes get bad AI results; tool can help them write better scopes |
| 13 | **WhatsApp integration** | 10+ Pakistan/South Asia users request it (WhatsApp is primary in the region) |
| 14 | **Multi-language support** | First non-English user signs up and requests it |
| 15 | **Row-level security in PostgreSQL** | Compliance requirement from an enterprise customer |

---

## 10. Success Milestones

### Week 1 After Launch

| Metric | Target | What It Tells You |
|---|---|---|
| Sign-ups | 10+ | The warm network responded |
| Onboarding completion rate | ≥ 50% | Product is understandable without support |
| Integrations connected | ≥ 7 | Users are getting to the monitoring step |
| First alert generated | ≥ 1 | The core AI flow works in production with real data |
| Support messages | < 5 | Onboarding is clear enough; no critical UX gaps |

---

### Month 1 After Launch

| Metric | Target | What It Tells You |
|---|---|---|
| Total sign-ups | 40–60 | Launch momentum; community posts working |
| Trial → paid conversion | ≥ 3 paying users | Product delivers enough value to pay for it |
| MRR | $87+ (3 × $29/month) | First revenue milestone |
| Monthly churn | 0% (too early to measure) | — |
| Change orders sent | ≥ 20 total | Users are reaching the core value action |
| Change orders approved by clients | ≥ 10 | Clients are accepting the process |
| False positive rate (from feedback) | ≤ 20% | AI is accurate enough to trust |
| Support tickets | < 10 total | Product is stable |

---

### Month 3 After Launch

| Metric | Target | What It Tells You |
|---|---|---|
| MRR | $500–$1,000 | Product-market fit signal emerging |
| Active users | 20–35 (paying) | Retention is working |
| Monthly churn | < 10% | Users are finding ongoing value |
| Avg. change orders per user per month | ≥ 3 | Regular use, not just one-time exploration |
| NPS (informal) | ≥ 40 | Users would recommend it |
| Most-requested v2 feature | Identified | Tells you what to build next |

---

### $2,000 MRR Milestone

**What it takes:** 69 users at $29/month, or 41 users at $49/month, or a mix.

**Path to get there:**
- Months 1–2: Warm network + X launch = 0–$500 MRR
- Month 3: Consistent X posting (1 build-in-public update per week) + Indie Hackers = $500–$1,000 MRR
- Month 4–5: Word-of-mouth from happy users + direct outreach to freelance developer communities = $1,000–$2,000 MRR

**Key lever:** Every satisfied user is a potential referral to 3–5 developer peers who have the same problem. Build a simple referral incentive (1 free month for each referral) once you hit $500 MRR.

---

### $5,000 MRR Milestone

**What it takes:** ~172 users at $29/month, or ~102 users at $49/month.

**Path to get there (Months 6–12):**
- Introduce agency plan ($49/month) targeting small dev agencies with 3–10 active projects
- Launch an affiliate program (20% recurring commission)
- SEO content: "freelance scope creep tools", "how to send a change order" — organic traffic over time
- Consider ProductHunt launch at $1,000 MRR for a traffic spike
- Add multi-seat pricing once 5+ agencies are paying

**At $5K MRR:** Consider moving from 10–15 hrs/week to full-time on ScopeAI.

---

*End of ScopeAI Implementation Plan v1.0*
*Date: June 28, 2026*
