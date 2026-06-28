# Technical Requirements Document (TRD)
## ScopeAI — AI Scope Guard for Freelance Developers

**Version:** 1.0
**Date:** June 28, 2026
**Status:** Draft
**Author:** Generated for @saifbuilds

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Recommended Tech Stack](#2-recommended-tech-stack)
3. [Frontend Requirements](#3-frontend-requirements)
4. [Backend Requirements](#4-backend-requirements)
5. [Database Design](#5-database-design)
6. [AI Integration Requirements](#6-ai-integration-requirements)
7. [Third-Party Integration Requirements](#7-third-party-integration-requirements)
8. [Authentication and Security](#8-authentication-and-security)
9. [Scalability and Performance](#9-scalability-and-performance)
10. [Deployment and DevOps](#10-deployment-and-devops)
11. [Testing Strategy](#11-testing-strategy)
12. [Technical Risks](#12-technical-risks)

---

## 1. System Architecture Overview

### High-Level Architecture

ScopeAI follows a **monolithic Next.js architecture** for MVP — combining frontend, backend API routes, and background job orchestration within a single deployable unit. This is the correct choice for a solo developer building an MVP with 10–15 hours/week; it eliminates inter-service complexity and deployment overhead while remaining decomposable into microservices post-MVP if needed.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  Browser (Developer)          Browser (Client, no account)  │
│  Next.js App Router UI        Public Change Order Page       │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│              Next.js (App Router + API Routes)               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │  Auth Layer  │  │  REST API     │  │  Webhook         │  │
│  │  (NextAuth)  │  │  (API Routes) │  │  Receivers       │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    BACKGROUND JOB LAYER                      │
│                   (Trigger.dev or BullMQ)                    │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │  Message     │  │  AI Analysis  │  │  Webhook         │  │
│  │  Ingestion   │  │  Jobs         │  │  Retry Jobs      │  │
│  └──────────────┘  └───────┬───────┘  └──────────────────┘  │
└───────────────────────────┬┴────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼──────┐   ┌────────▼──────────┐
│  PostgreSQL  │   │  OpenAI API   │   │  Third-Party APIs  │
│  (Neon/      │   │  (GPT-4o)     │   │  Slack Events API  │
│   Supabase)  │   │               │   │  Gmail API         │
│              │   │               │   │  Microsoft Graph   │
└──────────────┘   └───────────────┘   └────────────────────┘
```

### Component Breakdown

| Component | Technology | Responsibility |
|---|---|---|
| **Frontend** | Next.js 14 App Router + React | Developer UI, public change order approval page |
| **Backend API** | Next.js API Routes | Business logic, auth, data access |
| **Background Jobs** | Trigger.dev [RECOMMENDED] | Async message ingestion, AI analysis, webhook retries |
| **AI Layer** | OpenAI GPT-4o | Scope comparison, change order drafting |
| **Integration Layer** | Slack Events API, Gmail API, Microsoft Graph API | Receiving client messages |
| **Database** | PostgreSQL (Neon) | All persistent data |
| **File Storage** | Cloudflare R2 | Developer-uploaded scope documents |
| **Email** | Resend | Transactional emails (change orders, alerts, receipts) |
| **Payments** | Paddle | Subscription billing |

### Data Flow: Client Message → Alert

```
1. Client sends a message in a monitored Slack channel
        ↓
2. Slack Events API sends a POST webhook to /api/webhooks/slack
        ↓
3. Webhook receiver validates the Slack signature, acknowledges within 3 seconds
        ↓
4. Message is written to ingested_messages table (status: pending)
        ↓
5. A background AI analysis job is queued (Trigger.dev)
        ↓
6. Job fetches the message + associated project scope from the database
        ↓
7. Job sends both to OpenAI GPT-4o with a structured scope comparison prompt
        ↓
8. AI returns: classification (in-scope/out-of-scope/unclear), confidence, explanation, scope excerpt
        ↓
9. Result is written to scope_alerts table (if out-of-scope or unclear)
        ↓
10. ingested_messages record updated (status: analyzed)
        ↓
11. Developer receives in-app notification (via server-sent events or polling)
        ↓
12. Developer sees new alert on dashboard
```

---

## 2. Recommended Tech Stack

### Full Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Builder's expert stack; unified frontend + API; excellent ecosystem |
| **Language** | TypeScript | Type safety; reduces runtime bugs in a solo project with no QA |
| **Styling** | Tailwind CSS | Fastest path to production-quality UI; builder expertise assumed |
| **Component Library** | shadcn/ui | Unstyled, composable, Next.js-native; no vendor lock-in |
| **State Management** | TanStack Query (React Query) | Server state sync; automatic cache invalidation; no Redux boilerplate |
| **Database** | PostgreSQL via Neon | Serverless Postgres; generous free tier; excellent Prisma support |
| **ORM** | Prisma | Type-safe queries; migrations; builder familiarity with Node.js ecosystem |
| **Authentication** | NextAuth v5 (Auth.js) | Built for Next.js; supports Google OAuth + email/password; session management |
| **Background Jobs** | Trigger.dev | Purpose-built for Next.js background jobs; free tier; excellent DX |
| **AI/LLM** | OpenAI GPT-4o via official SDK | Best-in-class reasoning for structured classification tasks |
| **File Storage** | Cloudflare R2 | S3-compatible; no egress fees; cheap; works from Pakistan |
| **Email** | Resend | Modern API; excellent Next.js integration; generous free tier |
| **Payments** | Paddle | Works natively in Pakistan; handles VAT; recurring subscriptions |
| **Hosting** | Vercel | Zero-config Next.js deployment; generous hobby tier; global CDN |
| **Monitoring** | Sentry | Error tracking; performance monitoring; free tier sufficient for MVP |
| **Logging** | Axiom or Vercel Log Drains | Structured log storage beyond Vercel's default retention |

### Dependency Versions (as of June 2026) [ASSUMPTION — verify at build time]

- Next.js: 14.x
- React: 18.x
- TypeScript: 5.x
- Prisma: 5.x
- NextAuth: 5.x (Auth.js)
- TanStack Query: 5.x
- Trigger.dev: 3.x

---

## 3. Frontend Requirements

### Key Pages and Technical Requirements

| Page | Route | Description | Key Technical Requirements |
|---|---|---|---|
| Landing / Marketing | `/` | Public marketing page | Static generation (SSG); fast load; no auth required |
| Sign Up | `/auth/signup` | New account creation | Client-side form; Google OAuth button; email/password form |
| Sign In | `/auth/signin` | Returning user login | Same as sign up; redirect to dashboard on success |
| Dashboard | `/dashboard` | Alert summary + project list | Server component with Suspense; real-time alert count badge |
| Project Detail | `/projects/[id]` | Single project view with tabs | Tab navigation: Alerts, Change Orders, Scope, History |
| Alert Detail | `/projects/[id]/alerts/[alertId]` | Full alert view with actions | Optimistic UI for developer actions (dismiss / confirm) |
| Change Order Editor | `/projects/[id]/change-orders/new` | AI draft editor | Rich text editing; preview mode; auto-save draft |
| Change Order Detail | `/projects/[id]/change-orders/[id]` | View sent/approved/rejected CO | Status timeline; resend / cancel actions |
| Client Approval Page | `/co/[token]` | Public change order view | No auth; fully static-renderable; optimized for mobile |
| Integrations | `/settings/integrations` | OAuth connection management | OAuth redirect flows; connection status indicators |
| Billing | `/settings/billing` | Plan and subscription management | Paddle.js embed; invoice list |
| Settings | `/settings` | Profile, notifications, AI sensitivity | Standard settings form |
| Onboarding Wizard | `/onboarding` | Step-by-step first-time setup | Multi-step wizard; progress persistence in DB |

### State Management Approach

- **Server state** (projects, alerts, change orders): TanStack Query with server-side prefetching via Next.js Server Components
- **Local UI state** (modal open/close, wizard step, form state): React `useState` and `useReducer` — no global client state library needed at MVP
- **Form state**: React Hook Form + Zod for validation
- **No Redux / Zustand**: unnecessary complexity for a solo-built MVP with this data shape

### Real-Time Updates

**Approach:** Server-Sent Events (SSE) for new alert notifications [RECOMMENDED over WebSockets]

- **Why SSE over WebSockets:** SSE is unidirectional (server → client), simpler to implement, works natively with Next.js API routes, and is sufficient for the use case (notifying the developer of new alerts). WebSockets require a persistent connection server which adds deployment complexity on Vercel.
- **Implementation:** `/api/sse/alerts` endpoint streams events to the developer's browser. When a new alert is created by a background job, it writes to a lightweight pub/sub mechanism (Redis or Trigger.dev event) which triggers the SSE push.
- **Fallback:** If SSE connection drops, TanStack Query polling every 30 seconds as fallback.
- **Dashboard badge:** Alert count badge re-fetches every 30 seconds via TanStack Query as a lightweight fallback.

### Form Handling and Validation

- **Library:** React Hook Form + Zod
- **Client-side validation:** All forms validate on submit and on blur
- **Server-side validation:** All API routes re-validate with the same Zod schemas (never trust client input)
- **Error display:** Inline field-level errors; toast notifications for server errors

### Responsive Behavior

| Breakpoint | Requirement |
|---|---|
| Mobile (< 768px) | Client approval page must be fully functional; dashboard usable but not optimized |
| Tablet (768px–1024px) | Dashboard usable; sidebar collapses to icon-only |
| Desktop (> 1024px) | Primary target; full sidebar + content layout |

**Note:** The client-facing change order approval page is the only page that must be fully mobile-optimized at MVP, as clients may open it from their phone.

### Performance Requirements

| Metric | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5 seconds on dashboard |
| Time to Interactive (TTI) | < 3 seconds on dashboard |
| Client approval page LCP | < 1.5 seconds (public page, critical for trust) |
| API response time (p95) | < 500ms for all read endpoints |
| AI analysis completion | < 30 seconds per message (background job) |

---

## 4. Backend Requirements

### API Endpoint Groups

| Group | Method | Path | Auth | Description |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/[...nextauth]` | Public | NextAuth handler (sign in, sign up, OAuth callbacks) |
| **Users** | GET | `/api/users/me` | Developer | Get current user profile |
| **Users** | PATCH | `/api/users/me` | Developer | Update profile, notification preferences |
| **Projects** | GET | `/api/projects` | Developer | List all developer's projects |
| **Projects** | POST | `/api/projects` | Developer | Create new project |
| **Projects** | GET | `/api/projects/[id]` | Developer | Get project detail |
| **Projects** | PATCH | `/api/projects/[id]` | Developer | Update project name, client info |
| **Projects** | DELETE | `/api/projects/[id]` | Developer | Archive project (soft delete) |
| **Scopes** | GET | `/api/projects/[id]/scope` | Developer | Get current scope + version history |
| **Scopes** | PUT | `/api/projects/[id]/scope` | Developer | Update scope (creates new version) |
| **Scopes** | POST | `/api/projects/[id]/scope/upload` | Developer | Upload PDF/DOCX scope document |
| **Integrations** | GET | `/api/integrations` | Developer | List all connected integrations |
| **Integrations** | DELETE | `/api/integrations/[id]` | Developer | Disconnect an integration |
| **Integrations** | GET | `/api/integrations/slack/connect` | Developer | Initiate Slack OAuth flow |
| **Integrations** | GET | `/api/integrations/slack/callback` | Public | Slack OAuth callback handler |
| **Integrations** | GET | `/api/integrations/gmail/connect` | Developer | Initiate Gmail OAuth flow |
| **Integrations** | GET | `/api/integrations/gmail/callback` | Public | Gmail OAuth callback handler |
| **Integrations** | GET | `/api/integrations/outlook/connect` | Developer | Initiate Outlook OAuth flow |
| **Integrations** | GET | `/api/integrations/outlook/callback` | Public | Outlook OAuth callback handler |
| **Monitored Sources** | GET | `/api/projects/[id]/sources` | Developer | List monitored channels/emails per project |
| **Monitored Sources** | POST | `/api/projects/[id]/sources` | Developer | Add Slack channel or email to monitor |
| **Monitored Sources** | DELETE | `/api/projects/[id]/sources/[id]` | Developer | Remove monitored source |
| **Alerts** | GET | `/api/projects/[id]/alerts` | Developer | List alerts with filter/pagination |
| **Alerts** | GET | `/api/projects/[id]/alerts/[id]` | Developer | Get alert detail |
| **Alerts** | PATCH | `/api/projects/[id]/alerts/[id]` | Developer | Update alert status (dismiss / confirm / snooze) |
| **Change Orders** | GET | `/api/projects/[id]/change-orders` | Developer | List all change orders for a project |
| **Change Orders** | POST | `/api/projects/[id]/change-orders` | Developer | Create new change order (from alert or manual) |
| **Change Orders** | GET | `/api/projects/[id]/change-orders/[id]` | Developer | Get change order detail |
| **Change Orders** | PATCH | `/api/projects/[id]/change-orders/[id]` | Developer | Update draft change order |
| **Change Orders** | POST | `/api/projects/[id]/change-orders/[id]/send` | Developer | Send change order to client |
| **Change Orders** | POST | `/api/projects/[id]/change-orders/[id]/cancel` | Developer | Cancel a pending change order |
| **Change Orders** | POST | `/api/projects/[id]/change-orders/[id]/resend` | Developer | Resend expired change order |
| **Client Approval** | GET | `/api/co/[token]` | Public (token) | Get change order details via token |
| **Client Approval** | POST | `/api/co/[token]/approve` | Public (token) | Client approves change order |
| **Client Approval** | POST | `/api/co/[token]/reject` | Public (token) | Client rejects change order |
| **Audit Log** | GET | `/api/projects/[id]/audit` | Developer | List audit log entries for a project |
| **Audit Log** | POST | `/api/projects/[id]/audit/export` | Developer | Export audit log as PDF or CSV |
| **Billing** | GET | `/api/billing/plans` | Developer | List available Paddle plans |
| **Billing** | POST | `/api/billing/checkout` | Developer | Create Paddle checkout session |
| **Billing** | GET | `/api/billing/subscription` | Developer | Get current subscription status |
| **Billing** | POST | `/api/billing/cancel` | Developer | Cancel subscription via Paddle API |
| **Billing** | POST | `/api/billing/invoices` | Developer | List Paddle invoices |
| **Webhooks** | POST | `/api/webhooks/slack` | Public (signed) | Receive Slack Events API events |
| **Webhooks** | POST | `/api/webhooks/gmail` | Public (signed) | Receive Gmail push notifications |
| **Webhooks** | POST | `/api/webhooks/outlook` | Public (signed) | Receive Outlook/Graph webhooks |
| **Webhooks** | POST | `/api/webhooks/paddle` | Public (signed) | Receive Paddle billing events |
| **SSE** | GET | `/api/sse/alerts` | Developer | Server-sent events stream for real-time alerts |
| **AI** | POST | `/api/projects/[id]/ai/generate-co` | Developer | Generate AI change order draft for an alert |

### Background Jobs (Trigger.dev)

| Job | Trigger | Description | Failure Handling |
|---|---|---|---|
| `analyze-message` | Queued on message ingestion | Sends message + scope to OpenAI; creates alert | Retry 3x with exponential backoff; mark as failed after 3 attempts; notify developer |
| `ingest-slack-message` | Slack webhook received | Parse and store raw Slack message; queue analysis job | Dead letter queue; idempotency key prevents duplicates |
| `ingest-email-message` | Gmail/Outlook webhook received | Parse and store raw email; queue analysis job | Dead letter queue; idempotency key on email message ID |
| `send-change-order-email` | Developer clicks "Send" | Sends change order email to client via Resend | Retry 3x; if all fail, show error to developer |
| `expire-change-orders` | Scheduled: every 1 hour | Find change orders past expiry date; update status to expired; notify developer | Log failure; retry on next run |
| `send-alert-digest` | Scheduled: daily at 8am UTC | Send daily email digest of unreviewed alerts to developer | Log failure; skip if no unreviewed alerts |
| `refresh-outlook-webhooks` | Scheduled: every 60 hours | Renew Microsoft Graph webhook subscriptions before expiry (max ~4200 min) | Alert developer if renewal fails |
| `refresh-oauth-tokens` | Scheduled: every 50 minutes | Refresh expiring OAuth access tokens using stored refresh tokens | Mark integration as disconnected; notify developer |
| `paddle-webhook-handler` | Paddle webhook received | Update subscription status, plan, payment status in DB | Retry 5x; idempotency via Paddle event ID |

### Webhook Handling Requirements

All webhook endpoints must:
1. Respond with HTTP 200 within **3 seconds** (Slack requirement) — offload all work to background jobs
2. Validate the webhook signature before processing (Slack: `X-Slack-Signature`; Gmail: Google push notification auth token; Outlook: validation token on subscription creation; Paddle: `Paddle-Signature`)
3. Be idempotent — duplicate webhook deliveries must not create duplicate records (use unique message IDs as idempotency keys)
4. Never process the webhook payload synchronously within the request handler

### Queue and Job System

**[RECOMMENDED] Trigger.dev v3**

- Native Next.js + TypeScript support
- Handles retries, dead letter queues, scheduled jobs, and job observability out of the box
- Free tier: 500K job executions/month — sufficient for MVP
- No Redis or separate queue infrastructure required
- Dashboard for monitoring job runs and failures

**Alternative:** BullMQ + Redis (Upstash) — more control, slightly more complexity.

### Rate Limiting and Throttling

| Endpoint Group | Limit | Strategy |
|---|---|---|
| Auth endpoints (login, signup) | 10 requests / minute / IP | Upstash Redis rate limiter |
| Client approval endpoints (POST approve/reject) | 5 requests / minute / token | Upstash Redis rate limiter |
| AI generation endpoints | 10 requests / minute / user | Per-user rate limit |
| Webhook receivers | No user-facing rate limit (handle Slack/Google rate limits separately) | Signature validation as primary protection |
| All other API routes | 60 requests / minute / user | Per-user JWT-based rate limit |

**Library:** `@upstash/ratelimit` with Upstash Redis (serverless Redis; free tier sufficient for MVP).

### Error Handling Strategy

- All API routes return consistent error shapes: `{ error: string, code: string, details?: object }`
- HTTP status codes used correctly: 400 (validation), 401 (unauthenticated), 403 (unauthorized), 404 (not found), 422 (business logic error), 429 (rate limited), 500 (server error)
- All unhandled errors are captured by Sentry before returning a generic 500
- Integration errors (Slack API down, OpenAI unavailable) are caught and queued for retry — never surfaced as user-facing 500 errors

---

## 5. Database Design

### Schema Overview

All tables include: `id` (UUID, PK), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
Soft delete via `deleted_at TIMESTAMPTZ NULL` where applicable.

---

#### `users`
Stores developer accounts.

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) NOT NULL UNIQUE,
  name            VARCHAR(255),
  avatar_url      TEXT,
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash   TEXT,                          -- NULL for OAuth-only accounts
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
```

---

#### `accounts` (NextAuth OAuth accounts)
Stores OAuth provider tokens linked to users (NextAuth standard table).

```sql
CREATE TABLE accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider            VARCHAR(100) NOT NULL,         -- 'google', 'github'
  provider_account_id VARCHAR(255) NOT NULL,
  access_token        TEXT,                          -- encrypted at rest
  refresh_token       TEXT,                          -- encrypted at rest
  expires_at          BIGINT,
  token_type          VARCHAR(50),
  scope               TEXT,
  id_token            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

---

#### `sessions` (NextAuth sessions)

```sql
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires       TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
```

---

#### `subscriptions`
Paddle subscription data per user.

```sql
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paddle_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  paddle_customer_id    VARCHAR(255) NOT NULL,
  status                VARCHAR(50) NOT NULL,         -- 'trialing', 'active', 'past_due', 'canceled', 'paused'
  plan_id               VARCHAR(100) NOT NULL,
  plan_name             VARCHAR(100) NOT NULL,
  current_period_start  TIMESTAMPTZ NOT NULL,
  current_period_end    TIMESTAMPTZ NOT NULL,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT FALSE,
  trial_ends_at         TIMESTAMPTZ,
  grace_period_ends_at  TIMESTAMPTZ,                 -- set on payment failure
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_id ON subscriptions(paddle_subscription_id);
```

---

#### `notification_preferences`
Per-user notification settings.

```sql
CREATE TABLE notification_preferences (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_new_alert             BOOLEAN NOT NULL DEFAULT TRUE,
  email_alert_digest          BOOLEAN NOT NULL DEFAULT TRUE,
  email_co_approved           BOOLEAN NOT NULL DEFAULT TRUE,
  email_co_rejected           BOOLEAN NOT NULL DEFAULT TRUE,
  email_co_expired            BOOLEAN NOT NULL DEFAULT TRUE,
  email_integration_disconnect BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_new_alert            BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_co_status            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### `projects`
Each project a developer manages in ScopeAI.

```sql
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  client_name   VARCHAR(255) NOT NULL,
  client_email  VARCHAR(255) NOT NULL,
  status        VARCHAR(50) NOT NULL DEFAULT 'active',  -- 'active', 'archived'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
```

---

#### `project_scopes`
Versioned scope definitions for each project.

```sql
CREATE TABLE project_scopes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version        INTEGER NOT NULL DEFAULT 1,
  content_text   TEXT NOT NULL,                     -- parsed/extracted text content
  source_type    VARCHAR(50) NOT NULL,              -- 'manual', 'pdf_upload', 'docx_upload'
  file_url       TEXT,                              -- R2 URL if uploaded from file
  file_name      VARCHAR(255),
  is_current     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, version)
);

CREATE INDEX idx_project_scopes_project_id ON project_scopes(project_id);
CREATE INDEX idx_project_scopes_current ON project_scopes(project_id, is_current);
```

---

#### `integrations`
OAuth connections (Slack workspace, Gmail account, Outlook account) per user.

```sql
CREATE TABLE integrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider            VARCHAR(50) NOT NULL,            -- 'slack', 'gmail', 'outlook'
  provider_account_id VARCHAR(255) NOT NULL,           -- Slack workspace ID, Gmail address, Outlook UPN
  display_name        VARCHAR(255),                    -- e.g., "My Workspace", "saif@gmail.com"
  access_token        TEXT NOT NULL,                   -- encrypted at rest
  refresh_token       TEXT,                            -- encrypted at rest
  token_expires_at    TIMESTAMPTZ,
  scopes              TEXT,                            -- space-separated OAuth scopes granted
  status              VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'disconnected', 'error'
  metadata            JSONB,                           -- provider-specific data (team_id, etc.)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider, provider_account_id)
);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(user_id, provider);
```

---

#### `monitored_sources`
Specific Slack channels or email addresses being monitored per project.

```sql
CREATE TABLE monitored_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  source_type     VARCHAR(50) NOT NULL,               -- 'slack_channel', 'email_address'
  source_id       VARCHAR(255) NOT NULL,              -- Slack channel ID or email address
  source_name     VARCHAR(255),                       -- Display name
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, source_type, source_id)
);

CREATE INDEX idx_monitored_sources_project_id ON monitored_sources(project_id);
CREATE INDEX idx_monitored_sources_integration_id ON monitored_sources(integration_id);
```

---

#### `ingested_messages`
Raw messages pulled from Slack or email.

```sql
CREATE TABLE ingested_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  monitored_source_id   UUID NOT NULL REFERENCES monitored_sources(id),
  provider              VARCHAR(50) NOT NULL,           -- 'slack', 'gmail', 'outlook'
  external_message_id   VARCHAR(500) NOT NULL,          -- Slack ts, Gmail message ID, Outlook item ID
  sender_name           VARCHAR(255),
  sender_email          VARCHAR(255),
  subject               TEXT,                           -- email subject
  content               TEXT NOT NULL,                  -- message body / email body
  received_at           TIMESTAMPTZ NOT NULL,
  analysis_status       VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'analyzing', 'analyzed', 'failed'
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, provider, external_message_id)    -- prevents duplicate ingestion
);

CREATE INDEX idx_ingested_messages_project_id ON ingested_messages(project_id);
CREATE INDEX idx_ingested_messages_status ON ingested_messages(analysis_status);
CREATE INDEX idx_ingested_messages_external_id ON ingested_messages(provider, external_message_id);
```

---

#### `scope_alerts`
AI analysis results for out-of-scope or unclear messages.

```sql
CREATE TABLE scope_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ingested_message_id UUID NOT NULL REFERENCES ingested_messages(id),
  project_scope_id    UUID NOT NULL REFERENCES project_scopes(id),  -- which scope version was used
  classification      VARCHAR(50) NOT NULL,              -- 'out_of_scope', 'unclear'
  confidence          VARCHAR(20) NOT NULL,              -- 'high', 'medium', 'low'
  ai_explanation      TEXT NOT NULL,                    -- AI's plain-English reasoning
  scope_excerpt       TEXT,                             -- relevant portion of scope document quoted
  developer_action    VARCHAR(50),                      -- NULL, 'dismissed', 'confirmed', 'snoozed'
  snoozed_until       TIMESTAMPTZ,
  false_positive      BOOLEAN NOT NULL DEFAULT FALSE,    -- developer feedback
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scope_alerts_project_id ON scope_alerts(project_id);
CREATE INDEX idx_scope_alerts_action ON scope_alerts(developer_action);
CREATE INDEX idx_scope_alerts_created_at ON scope_alerts(project_id, created_at DESC);
```

---

#### `clients`
Client contact records owned by a developer.

```sql
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  company     VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, email)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
```

---

#### `change_orders`
Full change order records.

```sql
CREATE TABLE change_orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope_alert_id      UUID REFERENCES scope_alerts(id),   -- NULL if manually created
  client_id           UUID REFERENCES clients(id),
  title               VARCHAR(500) NOT NULL,
  description         TEXT NOT NULL,
  price               DECIMAL(10,2),
  currency            VARCHAR(10) NOT NULL DEFAULT 'USD',
  timeline_impact     TEXT,
  terms               TEXT,
  status              VARCHAR(50) NOT NULL DEFAULT 'draft',
  -- 'draft', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'canceled'
  approval_token      VARCHAR(255) UNIQUE,               -- secure random token for client link
  approval_token_expires_at TIMESTAMPTZ,
  sent_at             TIMESTAMPTZ,
  viewed_at           TIMESTAMPTZ,
  decided_at          TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  ai_generated        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
CREATE INDEX idx_change_orders_token ON change_orders(approval_token);
```

---

#### `change_order_events`
Timeline of all actions on a change order (sent, viewed, approved, rejected, etc.).

```sql
CREATE TABLE change_order_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  event_type      VARCHAR(100) NOT NULL,     -- 'sent', 'viewed', 'approved', 'rejected', 'expired', 'canceled', 'resent'
  actor           VARCHAR(50) NOT NULL,      -- 'developer', 'client', 'system'
  metadata        JSONB,                     -- e.g., rejection reason, client IP
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_co_events_change_order_id ON change_order_events(change_order_id);
```

---

#### `audit_logs`
Immutable event log — no updates or deletes allowed.

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),   -- NULL for client or system actions
  event_type  VARCHAR(100) NOT NULL,
  actor       VARCHAR(50) NOT NULL,        -- 'developer', 'client', 'ai', 'system'
  entity_type VARCHAR(100),               -- 'project', 'scope', 'alert', 'change_order'
  entity_id   UUID,
  description TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — this table is append-only
);

CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id, created_at DESC);
```

### Relationships Summary

- `users` → `projects` (1:many)
- `users` → `integrations` (1:many)
- `users` → `subscriptions` (1:1)
- `users` → `clients` (1:many)
- `projects` → `project_scopes` (1:many, versioned)
- `projects` → `monitored_sources` (1:many)
- `projects` → `ingested_messages` (1:many)
- `projects` → `scope_alerts` (1:many)
- `projects` → `change_orders` (1:many)
- `projects` → `audit_logs` (1:many)
- `integrations` → `monitored_sources` (1:many)
- `ingested_messages` → `scope_alerts` (1:1)
- `scope_alerts` → `change_orders` (1:0..1, optional)
- `change_orders` → `change_order_events` (1:many)

### Indexing Strategy

- All foreign keys are indexed
- `created_at DESC` indexes on high-read tables (alerts, audit logs, change orders)
- Composite indexes on `(project_id, status)` for filtered dashboard queries
- Unique constraint on `ingested_messages(provider, external_message_id)` prevents duplicate processing

### Data Retention and Soft Delete

- `users`, `projects`: soft delete via `deleted_at` timestamp
- `ingested_messages`, `scope_alerts`, `change_orders`: retained indefinitely while account is active; soft delete cascade on project deletion
- `audit_logs`: append-only, no deletion
- On account cancellation: data retained for 90 days, then permanently deleted [ASSUMPTION]

---

## 6. AI Integration Requirements

### Scope Comparison Engine — Technical Flow

```
1. Background job receives: { messageContent, projectScopeText, projectId, messageId }
        ↓
2. Construct structured prompt (see below)
        ↓
3. Send to OpenAI GPT-4o with JSON mode enabled
        ↓
4. Parse structured JSON response
        ↓
5. Write result to scope_alerts (if out_of_scope or unclear)
        ↓
6. Update ingested_messages.analysis_status = 'analyzed'
        ↓
7. Emit SSE event to developer's browser session
```

### Prompt Engineering Approach

**System Prompt:**
```
You are ScopeAI, an expert project scope analyst for software development projects.
Your job is to determine whether a client's message contains a request that falls
outside the originally agreed project scope.

You must be precise, fair, and evidence-based. Only flag requests as out-of-scope
if there is clear evidence in the scope document that the request was not included.
If the scope document is ambiguous, classify as 'unclear' rather than 'out_of_scope'.

Always respond in valid JSON matching the provided schema.
```

**User Prompt (constructed per analysis):**
```
PROJECT SCOPE DOCUMENT:
---
{scope_content_text}
---

CLIENT MESSAGE:
---
{message_content}
---

Analyze whether the client's message contains any request that falls outside the
project scope above. Respond with a JSON object matching this exact schema:

{
  "classification": "in_scope" | "out_of_scope" | "unclear",
  "confidence": "high" | "medium" | "low",
  "explanation": "Plain English explanation of why this is or is not in scope (2-3 sentences)",
  "scope_excerpt": "The exact portion of the scope document most relevant to this decision (or null if not applicable)",
  "flagged_request": "The specific request in the client message that may be out of scope (or null if in scope)"
}
```

**Model:** `gpt-4o` with `response_format: { type: "json_object" }`

**Why GPT-4o:** Best reasoning quality for nuanced scope analysis; fast enough for background processing; cost-effective at MVP scale (~$0.005 per analysis at average message+scope length).

### Scope Storage and Retrieval

- Scope text is stored in `project_scopes.content_text` (plain text, extracted from PDF/DOCX at upload time)
- For PDF/DOCX parsing: use `pdf-parse` (PDF) and `mammoth` (DOCX) Node.js libraries
- Scope text is fetched directly from the database per analysis — no vector embeddings at MVP [ASSUMPTION: scope documents are short enough (< 10,000 tokens) to fit in context window]
- If scope text exceeds 8,000 tokens [ASSUMPTION threshold], truncate with a warning to the developer

### Confidence Scoring and Flagging Thresholds

| AI Classification | Confidence | Action |
|---|---|---|
| `in_scope` | Any | No alert created; message logged silently |
| `out_of_scope` | High | Alert created; badge shown |
| `out_of_scope` | Medium | Alert created; badge shown |
| `out_of_scope` | Low | Alert created; labeled "Low Confidence — Review Carefully" |
| `unclear` | Any | Alert created; labeled "AI Uncertain — Your Review Needed" |

**Developer AI Sensitivity Setting:**
- **Conservative** (default): Only flag `out_of_scope` with High or Medium confidence
- **Balanced**: Flag all `out_of_scope` plus `unclear` with Medium+ confidence
- **Aggressive**: Flag all `out_of_scope` and `unclear` regardless of confidence

### Token Usage and Cost Management

| Item | Estimate |
|---|---|
| Average scope document | 1,500 tokens |
| Average client message | 150 tokens |
| System prompt | 200 tokens |
| Total input per analysis | ~1,850 tokens |
| GPT-4o input cost | $0.0025 / 1K tokens |
| Cost per analysis | ~$0.005 |
| 100 messages/month/user | ~$0.50/month/user |
| At 100 active users | ~$50/month AI cost |

Cost is manageable at MVP scale. At $5K MRR (~150 users), expected AI cost is ~$75/month.

**Controls:**
- Rate limit AI analysis to max 200 messages/day/project to prevent runaway costs
- Log token usage per analysis in `audit_logs.metadata`
- Alert builder (via Sentry or email) if monthly AI spend exceeds $100

### Fallback Behavior When AI is Unavailable

1. Message is stored in `ingested_messages` with `analysis_status = 'pending'`
2. Background job retries 3 times with exponential backoff (1min, 5min, 15min)
3. After 3 failures, `analysis_status = 'failed'`; developer is notified with option to manually review the message
4. A "Manual Review" state is available on the dashboard for failed analyses

---

## 7. Third-Party Integration Requirements

### Slack Integration

**OAuth Scopes Required:**
- `channels:history` — Read messages in public channels
- `groups:history` — Read messages in private channels
- `im:history` — Read direct messages (if applicable)
- `channels:read` — List available channels for selection
- `groups:read` — List private channels
- `team:read` — Get workspace info for display
- `users:read` — Identify message senders

**Event API Setup:**
- Enable Slack Events API in the Slack App configuration
- Subscribe to `message.channels` and `message.groups` event types
- Slack sends a `url_verification` challenge on webhook setup — handle immediately
- Set request URL to: `https://scopeai.com/api/webhooks/slack`

**Message Filtering:**
- Only process messages from monitored channels linked to an active project
- Filter out bot messages (`subtype: 'bot_message'`) — only process human messages
- Filter out message edits (`subtype: 'message_changed'`) at MVP [ASSUMPTION]
- Filter out thread replies to reduce noise [ASSUMPTION — revisit if users request it]

**Rate Limits:** Slack Event API has no documented rate limit on incoming events; outgoing API calls (listing channels, etc.) are limited to ~50 requests/minute — use caching.

**App Distribution:** [DECISION NEEDED] Private app distribution (manual install link) for first 20 users avoids Slack's app review process. Public distribution requires Slack review (~2–4 weeks).

---

### Gmail Integration

**OAuth Scopes Required:**
- `https://www.googleapis.com/auth/gmail.readonly` — Read emails [SENSITIVE SCOPE — requires Google verification]

**[CRITICAL RISK]** The `gmail.readonly` scope is a sensitive scope requiring Google's OAuth verification process, which takes 2–6 weeks and requires a privacy policy, security review, and often a video demonstration. Plan for this.

**Alternative approach for pre-verification MVP:** Use `https://www.googleapis.com/auth/gmail.metadata` (not sensitive) to see email metadata + `https://mail.google.com/` (restricted scope) — however, most useful scopes require verification. **Recommendation:** Apply for verification immediately; use the unverified app with developer's own accounts and early testers (Google allows up to 100 test users for unverified apps).

**Push Notifications vs. Polling:**
- [RECOMMENDED] Gmail Push Notifications via Cloud Pub/Sub — real-time; no polling overhead
- Requires Google Cloud project with Pub/Sub enabled
- Gmail sends a notification to the Pub/Sub topic when new messages arrive
- ScopeAI subscribes to the topic via a push subscription to `/api/webhooks/gmail`
- Watch subscriptions expire after 7 days — the `refresh-gmail-watches` scheduled job renews them

**Handling Attachments:** Email attachments are not processed at MVP. Text content only.

---

### Outlook / Microsoft Graph Integration

**OAuth Scopes Required (Microsoft Graph):**
- `Mail.Read` — Read user's email
- `User.Read` — Get user profile info
- `offline_access` — Get refresh tokens

**Webhook Subscriptions (Microsoft Graph):**
- Subscribe to `created` events on the `/me/messages` resource
- Webhook URL: `https://scopeai.com/api/webhooks/outlook`
- Subscriptions expire after **4,230 minutes (~70 hours)** — the `refresh-outlook-webhooks` scheduled job (runs every 60 hours) renews all active subscriptions
- On subscription creation, Microsoft sends a validation request with a `validationToken` — must be echoed back within 10 seconds

**Token Refresh:** Microsoft OAuth access tokens expire after 1 hour. Refresh tokens are valid for 90 days (if not used) or up to 14 days of inactivity. The `refresh-oauth-tokens` job runs every 50 minutes.

---

### Paddle Integration

**Setup:**
- Use Paddle Billing (not Classic) — modern API, better webhook support
- Integrate `@paddle/paddle-js` frontend SDK for checkout overlays
- Products and prices created in Paddle dashboard (not via API at MVP)

**Subscription Flow:**
1. Developer clicks upgrade → frontend calls `/api/billing/checkout`
2. Backend creates a Paddle checkout session and returns a checkout URL or overlay token
3. Developer completes checkout in Paddle-hosted overlay
4. Paddle sends `subscription.created` webhook to `/api/webhooks/paddle`
5. Backend updates `subscriptions` table and activates developer's account

**Key Webhook Events to Handle:**
- `subscription.created` — activate subscription
- `subscription.updated` — update plan or status
- `subscription.canceled` — mark as canceled, set access until period end
- `subscription.payment.failed` — set grace period, notify developer
- `subscription.payment.succeeded` — clear grace period, send receipt

**Webhook Validation:** Verify `Paddle-Signature` header using Paddle's webhook secret.

---

## 8. Authentication and Security

### Authentication Flow (Developer Users)

1. **Email/Password:** Standard credentials stored as bcrypt hash (cost factor 12) in `users.password_hash`
2. **Google OAuth:** Via NextAuth Google provider — token stored in `accounts` table
3. **Session:** NextAuth database sessions stored in `sessions` table; session cookie is HTTP-only, Secure, SameSite=Lax
4. **JWT:** Not used for sessions (database sessions preferred for immediate revocability)

### Client Approval Link Security

1. On change order creation, generate a cryptographically random 48-character URL-safe token (`crypto.randomBytes(36).toString('base64url')`)
2. Store hashed version in `change_orders.approval_token` (SHA-256 hash — never store raw token in DB)
3. Set `approval_token_expires_at` to 7 days from creation [ASSUMPTION]
4. Client link format: `https://scopeai.com/co/{raw_token}`
5. On access: hash the token, look up in DB, validate expiry, validate status is 'sent' or 'viewed'
6. Approval and rejection are one-time actions — once a decision is made, the token is invalidated
7. Token is never logged in plaintext

### OAuth Token Storage

- All OAuth `access_token` and `refresh_token` values are encrypted at rest using AES-256-GCM before storage
- Encryption key stored as an environment variable (never in code or DB)
- Tokens are decrypted in memory only when needed for an API call
- Tokens are never returned to the frontend — all OAuth operations are server-side

### Data Encryption

| Data | Protection Method |
|---|---|
| Passwords | bcrypt (cost factor 12) |
| OAuth tokens | AES-256-GCM encryption at rest |
| Data in transit | TLS 1.3 (enforced by Vercel and Neon) |
| Scope documents (R2) | Cloudflare R2 server-side encryption (AES-256) |
| Session cookies | HTTP-only, Secure, SameSite=Lax |
| Change order tokens | SHA-256 hash stored; raw token only in URL |

### Secrets Management

- All secrets (OpenAI API key, Slack app credentials, Google OAuth credentials, Paddle webhook secret, encryption key, database URL) stored as Vercel Environment Variables
- Never committed to source code or `.env` files in the repository
- `.env.local` used for local development only; `.gitignore` enforced
- Rotate credentials immediately if a breach is suspected

### OWASP Top 10 — Relevant Controls for ScopeAI

| OWASP Risk | ScopeAI Control |
|---|---|
| A01 Broken Access Control | All API routes check `session.user.id` === resource owner; no direct object references without ownership check |
| A02 Cryptographic Failures | AES-256 for OAuth tokens; bcrypt for passwords; TLS for transit |
| A03 Injection | Prisma ORM with parameterized queries; no raw SQL with user input |
| A05 Security Misconfiguration | Vercel enforces HTTPS; security headers set via Next.js config (CSP, HSTS, X-Frame-Options) |
| A07 Identification and Authentication Failures | NextAuth handles session management; rate limiting on auth endpoints; email verification required |
| A08 Software and Data Integrity Failures | Paddle and Slack webhook signatures validated before processing |
| A09 Security Logging and Monitoring Failures | Sentry for error tracking; audit_logs table for all sensitive actions |
| A10 Server-Side Request Forgery | No user-supplied URLs are fetched server-side; all external calls use hardcoded API endpoints |

---

## 9. Scalability and Performance

### Load Estimates

| Metric | MVP (Launch) | $5K MRR (~150 users) |
|---|---|---|
| Active users | 10–30 | 150 |
| Projects | 30–100 | 500 |
| Messages ingested/day | 50–200 | 1,500 |
| AI analyses/day | 50–200 | 1,500 |
| API requests/day | 2,000–5,000 | 30,000 |
| Concurrent users (peak) | 5–10 | 30–50 |

At these scales, a single Vercel deployment with a Neon serverless PostgreSQL instance is sufficient. No horizontal scaling needed at MVP.

### Database Connection Pooling

- **Neon serverless** uses connection pooling via PgBouncer automatically
- Prisma configured with `connection_limit` appropriate for serverless (default 1 connection per serverless function instance)
- Use Prisma's `@prisma/adapter-neon` for native Neon serverless compatibility
- Add `?pgbouncer=true&connection_limit=1` to the DATABASE_URL for serverless environments

### Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|---|---|---|---|
| Current project scope | In-memory (per request) | Request lifetime | N/A |
| Alert count badge | TanStack Query client cache | 30 seconds | On new SSE event |
| User subscription status | TanStack Query client cache | 5 minutes | On subscription webhook |
| Slack channel list | Server-side (Upstash Redis) | 10 minutes | On integration reconnect |
| Paddle plan list | Server-side (Upstash Redis) | 1 hour | Manual invalidation |

---

## 10. Deployment and DevOps

### Recommended Deployment Stack

| Service | Purpose | Cost at MVP |
|---|---|---|
| **Vercel** | Next.js hosting | Free hobby tier → Pro ($20/month) when needed |
| **Neon** | Serverless PostgreSQL | Free tier (0.5 GB storage, 190 hrs compute) → Scale tier |
| **Cloudflare R2** | File storage (scope documents) | Free (10 GB/month) |
| **Upstash Redis** | Rate limiting, caching | Free tier (10K commands/day) |
| **Trigger.dev** | Background jobs | Free (500K executions/month) |
| **Resend** | Transactional email | Free (3K emails/month) |
| **Sentry** | Error tracking | Free (5K errors/month) |

### Environment Strategy

| Environment | Purpose | Database |
|---|---|---|
| `local` | Development | Local PostgreSQL or Neon dev branch |
| `staging` | Pre-production testing | Neon staging branch (branched from production schema) |
| `production` | Live users | Neon production database |

### CI/CD Pipeline

- **GitHub** as source control
- **Vercel GitHub integration** for automatic deployments:
  - Every push to `main` → deploys to production
  - Every pull request → deploys to a preview URL (staging equivalent)
- **Pre-deploy checks** (GitHub Actions):
  - `tsc --noEmit` (TypeScript type check)
  - `prisma validate` (schema validation)
  - `eslint` (linting)
- **Database migrations:** Run `prisma migrate deploy` as part of the Vercel build command

### Migration Strategy

```
Build command: prisma migrate deploy && next build
```

- All schema changes via Prisma migrations (never direct SQL on production)
- Migrations are run automatically on deploy
- Breaking migrations (column drops, type changes) are done in two deploys: additive first, then cleanup

### Monitoring and Alerting

- **Sentry:** Automatic error capture; alert builder via email on new error types
- **Vercel Analytics:** Core Web Vitals monitoring
- **Trigger.dev dashboard:** Background job success/failure rates
- **Upstash:** Redis usage monitoring
- **Custom:** A simple `/api/healthcheck` endpoint returning system status (DB connectivity, integration status)

---

## 11. Testing Strategy

### Unit Testing

- **Framework:** Vitest (fast, TypeScript-native, compatible with Next.js)
- **What to test:**
  - Zod validation schemas
  - Utility functions (token generation, scope text parsing, prompt construction)
  - Webhook signature validation functions
  - Change order status transition logic
- **Coverage target:** 80% on utility and validation modules [ASSUMPTION]

### Integration Testing

- **Framework:** Vitest + `@testing-library/react` for component tests
- **How to test OAuth flows:** Use mock OAuth providers in test environment; Neon database branches for isolated test DBs
- **How to test webhooks:** Use `ngrok` locally to expose webhook endpoints; use Slack's "Send test event" and Gmail's Pub/Sub test tool
- **Paddle testing:** Paddle sandbox environment with test card numbers

### End-to-End Testing

- **Framework:** Playwright [RECOMMENDED]
- **Critical paths to cover:**
  - Onboarding wizard (sign up → connect integration → create project → define scope)
  - Alert flow (receive webhook → alert created → developer dismisses or confirms)
  - Change order flow (generate draft → edit → send → client approves)
  - Billing flow (upgrade to paid plan → Paddle checkout → subscription active)
- **Run in CI:** Playwright tests run on pull requests via GitHub Actions against the Vercel preview deployment

### AI Output Testing

- Maintain a **golden test set** of 20–30 sample (message, scope, expected classification) pairs
- Run the golden set against the live OpenAI API before deploying prompt changes
- Manual spot-check: weekly review of the last 20 developer dismissals ("false positive" feedback) to identify prompt improvements
- Do not rely on automated AI testing for binary pass/fail — treat AI quality as a continuous improvement loop

### MVP Launch Readiness Checklist

- [ ] Full onboarding flow works end-to-end in staging
- [ ] Slack webhook receives and processes test messages correctly
- [ ] Gmail push notification receives and processes test emails correctly
- [ ] Outlook webhook receives and processes test emails correctly
- [ ] AI analysis produces correct classification on 5 test messages
- [ ] Change order email delivers within 2 minutes in staging
- [ ] Client approval page works on mobile (iPhone Safari, Android Chrome)
- [ ] Paddle checkout completes successfully with test card
- [ ] Paddle webhook updates subscription status correctly
- [ ] Payment failure webhook correctly applies grace period
- [ ] Session expiry redirects to sign-in correctly
- [ ] Disconnected integration triggers in-app notification and email
- [ ] Audit log records all events correctly
- [ ] PDF export of audit log generates correctly
- [ ] Rate limiting blocks excessive requests correctly
- [ ] All environment variables set in Vercel production
- [ ] Sentry connected and receiving errors from production
- [ ] Webhook signature validation tested with invalid signatures (should reject)
- [ ] Change order token expiry tested (expired link shows correct message)
- [ ] Database backup verified (Neon automatic backups enabled)

---

## 12. Technical Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Gmail OAuth sensitive scope verification delay** — Google's review of `gmail.readonly` takes 2–6 weeks; rejection is possible | High | High | Apply for verification on day 1 of development. Build with up to 100 test users allowed on unverified app. Prioritize Outlook as the parallel email integration — it has no equivalent review process. |
| 2 | **Slack app review for public distribution** — Installing ScopeAI into external Slack workspaces requires Slack's app review if the app requests sensitive scopes | Medium | High | Start with private Slack app (manual install URL) for the first 20–30 users. Submit for Slack review in parallel. `channels:history` and `groups:history` may require justification. |
| 3 | **AI hallucination / low accuracy in scope detection** — The LLM may produce false positives (alert fatigue) or false negatives (missed scope creep), destroying user trust | Medium | High | Use GPT-4o (best available reasoning model). Implement developer feedback loop (mark as false positive) from day one. Set conservative defaults. Build the golden test set early and test on every prompt change before deploy. |
| 4 | **Outlook webhook subscription expiry causing silent monitoring gaps** — Microsoft Graph webhook subscriptions expire every ~70 hours; if the renewal job fails, the project stops being monitored without the developer knowing | Medium | Medium | Build renewal job with retry logic and failure alerting. Store `webhook_expires_at` in the integrations table and surface it in the UI. Send email alert to developer 12 hours before expiry as a backup. |
| 5 | **Vercel serverless timeout on long AI jobs** — Vercel serverless functions time out after 10 seconds on hobby tier (60 seconds on Pro); AI analysis jobs triggered synchronously would fail | Low (if architecture is correct) | High | This risk is mitigated by the architecture: all AI analysis runs in Trigger.dev background jobs, not in Vercel serverless functions. Trigger.dev has no timeout constraints. Document this architectural decision as a constraint. |

---

*End of ScopeAI Technical Requirements Document v1.0*
*Date: June 28, 2026*
