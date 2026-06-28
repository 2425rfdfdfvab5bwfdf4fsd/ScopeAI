# Backend Schema Document
## ScopeAI — AI Scope Guard for Freelance Developers

**Version:** 1.0
**Date:** June 28, 2026
**Status:** Draft
**Author:** Generated for @saifbuilds

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [Relationships Diagram](#2-relationships-diagram)
3. [User Roles and Permissions](#3-user-roles-and-permissions)
4. [API Endpoints](#4-api-endpoints)
5. [Validation Rules](#5-validation-rules)
6. [Security Considerations](#6-security-considerations)
7. [Background Jobs and Queues](#7-background-jobs-and-queues)
8. [File Storage](#8-file-storage)

---

## 1. Database Schema

### Stack
- **Database:** PostgreSQL (hosted on Neon — serverless PostgreSQL)
- **ORM:** Prisma 5.x
- **Migration tool:** `prisma migrate` (version-controlled migration files)
- **UUID generation:** `gen_random_uuid()` (PostgreSQL built-in, requires `pgcrypto` extension)
- **Timestamps:** All in UTC, stored as `TIMESTAMPTZ`

### Conventions
- Every table has: `id UUID PRIMARY KEY`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Soft delete via `deleted_at TIMESTAMPTZ NULL` where data must be recoverable
- Audit log table is **append-only** — no `updated_at`, no soft delete
- All OAuth tokens stored **encrypted** — never in plaintext
- Foreign key references use `ON DELETE CASCADE` where child records are owned by parent; `ON DELETE SET NULL` where the relationship is optional

---

### Table 1: `users`

**Purpose:** Stores developer accounts — the primary authenticated users of ScopeAI.

```sql
CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) NOT NULL UNIQUE,
  name              VARCHAR(255),
  avatar_url        TEXT,
  email_verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  password_hash     TEXT,
  -- NULL for Google OAuth-only accounts; bcrypt hash (cost 12) for email/password accounts
  onboarding_completed BOOLEAN  NOT NULL DEFAULT FALSE,
  onboarding_step   SMALLINT    NOT NULL DEFAULT 0,
  -- Tracks wizard progress (0=not started, 1=slack, 2=email, 3=project, 4=scope, 5=sources, 6=done)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

---

### Table 2: `accounts`

**Purpose:** Stores NextAuth OAuth provider records linked to users (Google OAuth sign-in).

```sql
CREATE TABLE accounts (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider              VARCHAR(100) NOT NULL,
  -- 'google'
  provider_account_id   VARCHAR(255) NOT NULL,
  access_token          TEXT,
  -- AES-256-GCM encrypted before storage
  refresh_token         TEXT,
  -- AES-256-GCM encrypted before storage
  expires_at            BIGINT,
  -- Unix timestamp of access token expiry
  token_type            VARCHAR(50),
  scope                 TEXT,
  id_token              TEXT,
  -- AES-256-GCM encrypted before storage
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

---

### Table 3: `sessions`

**Purpose:** Database sessions for authenticated developers (NextAuth database strategy).

```sql
CREATE TABLE sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  expires       TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);
-- For cleanup job: find expired sessions efficiently
```

---

### Table 4: `verification_tokens`

**Purpose:** Email verification and password reset tokens (NextAuth standard + custom reset flow).

```sql
CREATE TABLE verification_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL,
  -- email address
  token      VARCHAR(500) NOT NULL UNIQUE,
  -- hashed token (SHA-256); raw token sent only in email
  type       VARCHAR(50)  NOT NULL DEFAULT 'email_verification',
  -- 'email_verification' | 'password_reset'
  expires    TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  -- No updated_at — tokens are created and consumed, not updated
);

CREATE INDEX idx_verification_tokens_identifier ON verification_tokens(identifier);
CREATE INDEX idx_verification_tokens_expires ON verification_tokens(expires);
```

---

### Table 5: `subscriptions`

**Purpose:** Tracks Paddle subscription state per user. Updated via Paddle webhooks.

```sql
CREATE TABLE subscriptions (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paddle_subscription_id  VARCHAR(255) NOT NULL UNIQUE,
  paddle_customer_id      VARCHAR(255) NOT NULL,
  paddle_transaction_id   VARCHAR(255),
  -- Latest transaction ID
  status                  VARCHAR(50)  NOT NULL,
  -- 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled'
  plan_id                 VARCHAR(100) NOT NULL,
  -- Paddle price ID
  plan_name               VARCHAR(100) NOT NULL,
  -- Human-readable: 'Individual' | 'Agency'
  billing_interval        VARCHAR(20)  NOT NULL DEFAULT 'month',
  -- 'month' | 'year'
  unit_price_cents        INTEGER      NOT NULL,
  -- Price in cents (e.g., 2900 = $29.00)
  currency                VARCHAR(10)  NOT NULL DEFAULT 'USD',
  current_period_start    TIMESTAMPTZ  NOT NULL,
  current_period_end      TIMESTAMPTZ  NOT NULL,
  trial_ends_at           TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN      NOT NULL DEFAULT FALSE,
  canceled_at             TIMESTAMPTZ,
  grace_period_ends_at    TIMESTAMPTZ,
  -- Set on payment failure; access restricted after this date
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_id ON subscriptions(paddle_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

### Table 6: `notification_preferences`

**Purpose:** Per-user opt-in/opt-out settings for each notification type.

```sql
CREATE TABLE notification_preferences (
  id                            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  -- One row per user
  email_new_alert               BOOLEAN NOT NULL DEFAULT TRUE,
  email_daily_digest            BOOLEAN NOT NULL DEFAULT TRUE,
  email_digest_hour_utc         SMALLINT NOT NULL DEFAULT 8,
  -- Hour (0–23) to send daily digest; default 8am UTC
  email_co_approved             BOOLEAN NOT NULL DEFAULT TRUE,
  email_co_rejected             BOOLEAN NOT NULL DEFAULT TRUE,
  email_co_expired              BOOLEAN NOT NULL DEFAULT TRUE,
  email_integration_disconnect  BOOLEAN NOT NULL DEFAULT TRUE,
  email_payment_failed          BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_new_alert              BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_co_status_change       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### Table 7: `projects`

**Purpose:** Each project a developer manages in ScopeAI. One project = one client engagement.

```sql
CREATE TABLE projects (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  client_name  VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  notes        TEXT,
  -- Optional internal notes; not used for scope analysis
  status       VARCHAR(50)  NOT NULL DEFAULT 'active',
  -- 'active' | 'archived'
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
```

---

### Table 8: `project_scopes`

**Purpose:** Versioned scope definitions. Each edit creates a new version; only one version is `is_current = TRUE` per project at any time.

```sql
CREATE TABLE project_scopes (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version       SMALLINT     NOT NULL DEFAULT 1,
  content_text  TEXT         NOT NULL,
  -- Full extracted/typed scope text used for AI analysis
  source_type   VARCHAR(50)  NOT NULL,
  -- 'manual' | 'pdf_upload' | 'docx_upload'
  file_url      TEXT,
  -- Cloudflare R2 object URL; NULL for manual entry
  file_name     VARCHAR(500),
  file_size_bytes INTEGER,
  char_count    INTEGER      NOT NULL DEFAULT 0,
  -- Pre-computed character count; used for UI display and token estimation
  is_current    BOOLEAN      NOT NULL DEFAULT TRUE,
  -- Only one TRUE per project; enforced by partial unique index
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, version)
);

CREATE INDEX idx_project_scopes_project_id ON project_scopes(project_id);
CREATE UNIQUE INDEX idx_project_scopes_current
  ON project_scopes(project_id)
  WHERE is_current = TRUE;
-- Enforces only one current scope per project at the DB level
```

**Scope version update procedure:**
1. `BEGIN TRANSACTION`
2. `UPDATE project_scopes SET is_current = FALSE WHERE project_id = $1 AND is_current = TRUE`
3. `INSERT INTO project_scopes (..., version = prev_version + 1, is_current = TRUE) VALUES (...)`
4. `COMMIT`

---

### Table 9: `clients`

**Purpose:** Client contact records owned by a developer. Shared across projects for the same client.

```sql
CREATE TABLE clients (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  company    VARCHAR(255),
  notes      TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, email)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
```

---

### Table 10: `integrations`

**Purpose:** OAuth connections per user — one record per connected Slack workspace, Gmail account, or Outlook account.

```sql
CREATE TABLE integrations (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider              VARCHAR(50)  NOT NULL,
  -- 'slack' | 'gmail' | 'outlook'
  provider_account_id   VARCHAR(255) NOT NULL,
  -- Slack: team_id; Gmail: email address; Outlook: UPN (user principal name)
  display_name          VARCHAR(255),
  -- e.g., "My Agency Workspace" or "saif@gmail.com"
  access_token_enc      TEXT         NOT NULL,
  -- AES-256-GCM encrypted access token
  refresh_token_enc     TEXT,
  -- AES-256-GCM encrypted refresh token (NULL for Slack if not available)
  token_expires_at      TIMESTAMPTZ,
  -- NULL if token does not expire (some Slack tokens)
  scopes_granted        TEXT,
  -- Space-separated list of OAuth scopes granted
  status                VARCHAR(50)  NOT NULL DEFAULT 'active',
  -- 'active' | 'disconnected' | 'error' | 'token_expired'
  error_message         TEXT,
  -- Last error if status = 'error' or 'token_expired'
  metadata              JSONB,
  -- Provider-specific extras:
  -- Slack: { team_id, team_name, bot_user_id }
  -- Gmail: { history_id, watch_expiry }
  -- Outlook: { subscription_id, subscription_expiry, user_id }
  last_token_refresh_at TIMESTAMPTZ,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider, provider_account_id)
);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(user_id, provider);
CREATE INDEX idx_integrations_status ON integrations(status);
-- For scheduled jobs that need to find active integrations or expired tokens
```

---

### Table 11: `monitored_sources`

**Purpose:** Specific Slack channels or email addresses being monitored per project. A source links a project to a specific integration (e.g., #client-updates in Workspace X is monitored for Project Y).

```sql
CREATE TABLE monitored_sources (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  integration_id UUID         NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  source_type    VARCHAR(50)  NOT NULL,
  -- 'slack_channel' | 'email_address'
  source_id      VARCHAR(500) NOT NULL,
  -- Slack: channel_id (e.g., "C01234ABCDE"); Email: client email address
  source_name    VARCHAR(500),
  -- Slack: "#channel-name"; Email: "client@company.com"
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, source_type, source_id)
);

CREATE INDEX idx_monitored_sources_project_id ON monitored_sources(project_id);
CREATE INDEX idx_monitored_sources_integration_id ON monitored_sources(integration_id);
CREATE INDEX idx_monitored_sources_lookup
  ON monitored_sources(integration_id, source_id, is_active);
-- Critical index: used by webhook handler to find which project a message belongs to
```

---

### Table 12: `ingested_messages`

**Purpose:** Raw messages ingested from Slack or email. Each record is one client message, stored before AI analysis begins.

```sql
CREATE TABLE ingested_messages (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  monitored_source_id  UUID         NOT NULL REFERENCES monitored_sources(id),
  integration_id       UUID         NOT NULL REFERENCES integrations(id),
  provider             VARCHAR(50)  NOT NULL,
  -- 'slack' | 'gmail' | 'outlook'
  external_message_id  VARCHAR(1000) NOT NULL,
  -- Slack: message ts (e.g., "1234567890.123456"); Gmail: message ID; Outlook: item ID
  sender_name          VARCHAR(255),
  sender_email         VARCHAR(255),
  sender_slack_user_id VARCHAR(100),
  -- Slack-specific; NULL for email
  subject              TEXT,
  -- Email subject; NULL for Slack messages
  content              TEXT         NOT NULL,
  -- Message body / email body (plain text; HTML stripped)
  content_length       INTEGER      NOT NULL DEFAULT 0,
  -- Pre-computed; used for token estimation
  received_at          TIMESTAMPTZ  NOT NULL,
  -- Original message timestamp from the provider
  analysis_status      VARCHAR(50)  NOT NULL DEFAULT 'pending',
  -- 'pending' | 'analyzing' | 'analyzed' | 'failed' | 'skipped_no_scope'
  analysis_attempts    SMALLINT     NOT NULL DEFAULT 0,
  -- Number of AI analysis attempts (max 3 before marking 'failed')
  last_analysis_error  TEXT,
  -- Last error message from AI analysis job
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, provider, external_message_id)
  -- Idempotency: prevents duplicate ingestion from duplicate webhook deliveries
);

CREATE INDEX idx_ingested_messages_project_id ON ingested_messages(project_id);
CREATE INDEX idx_ingested_messages_status ON ingested_messages(analysis_status);
CREATE INDEX idx_ingested_messages_created ON ingested_messages(project_id, created_at DESC);
CREATE INDEX idx_ingested_messages_external
  ON ingested_messages(provider, external_message_id);
-- Fast lookup for idempotency check in webhook handler
```

---

### Table 13: `scope_alerts`

**Purpose:** AI analysis results for messages classified as out-of-scope or unclear. One alert per flagged message.

```sql
CREATE TABLE scope_alerts (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ingested_message_id  UUID         NOT NULL UNIQUE REFERENCES ingested_messages(id),
  -- One alert per message maximum
  project_scope_id     UUID         NOT NULL REFERENCES project_scopes(id),
  -- Which scope version was active when this alert was generated
  classification       VARCHAR(50)  NOT NULL,
  -- 'out_of_scope' | 'unclear'
  confidence           VARCHAR(20)  NOT NULL,
  -- 'high' | 'medium' | 'low'
  ai_explanation       TEXT         NOT NULL,
  -- Plain-English reasoning from the AI (2–3 sentences)
  scope_excerpt        TEXT,
  -- Exact portion of the scope document the AI cited
  flagged_request      TEXT,
  -- The specific request within the client message that was flagged
  ai_tokens_used       INTEGER,
  -- Total tokens consumed by this analysis (input + output); for cost tracking
  ai_model_used        VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
  developer_action     VARCHAR(50),
  -- NULL (unreviewed) | 'dismissed' | 'confirmed' | 'snoozed'
  action_taken_at      TIMESTAMPTZ,
  snoozed_until        TIMESTAMPTZ,
  is_false_positive    BOOLEAN      NOT NULL DEFAULT FALSE,
  -- Developer feedback: marked as false positive when dismissing
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scope_alerts_project_id ON scope_alerts(project_id);
CREATE INDEX idx_scope_alerts_action ON scope_alerts(project_id, developer_action);
CREATE INDEX idx_scope_alerts_created ON scope_alerts(project_id, created_at DESC);
CREATE INDEX idx_scope_alerts_snoozed ON scope_alerts(snoozed_until)
  WHERE developer_action = 'snoozed';
-- For the job that resurfaces snoozed alerts
```

---

### Table 14: `change_orders`

**Purpose:** Full change order records — from AI draft through client decision.

```sql
CREATE TABLE change_orders (
  id                        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id                UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope_alert_id            UUID         REFERENCES scope_alerts(id) ON DELETE SET NULL,
  -- NULL if change order was created manually (not from an alert)
  client_id                 UUID         REFERENCES clients(id) ON DELETE SET NULL,
  -- Linked client record; may be NULL if client was not saved to clients table
  client_name               VARCHAR(255) NOT NULL,
  -- Denormalized: stored directly so it survives client record deletion
  client_email              VARCHAR(255) NOT NULL,
  -- Denormalized: same reason
  title                     VARCHAR(500) NOT NULL,
  description               TEXT         NOT NULL,
  price_cents               INTEGER,
  -- Price in smallest currency unit (cents); NULL if not set
  currency                  VARCHAR(10)  NOT NULL DEFAULT 'USD',
  timeline_impact           TEXT,
  -- e.g., "+3 business days"; NULL if not specified
  terms                     TEXT,
  -- Change order terms and conditions; NULL if not specified
  status                    VARCHAR(50)  NOT NULL DEFAULT 'draft',
  -- 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'canceled'
  approval_token_hash       VARCHAR(500) UNIQUE,
  -- SHA-256 hash of the raw token; raw token only exists in the email link
  approval_token_expires_at TIMESTAMPTZ,
  expires_at                TIMESTAMPTZ,
  -- When the change order expires (developer-configurable, default +7 days from sent_at)
  sent_at                   TIMESTAMPTZ,
  viewed_at                 TIMESTAMPTZ,
  -- First time client opened the approval link
  decided_at                TIMESTAMPTZ,
  -- When client approved or rejected
  ai_generated              BOOLEAN      NOT NULL DEFAULT FALSE,
  -- TRUE if description was AI-drafted
  version                   SMALLINT     NOT NULL DEFAULT 1,
  -- Incremented on resend (a resend creates a new token + resets expiry)
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_change_orders_status ON change_orders(project_id, status);
CREATE INDEX idx_change_orders_token ON change_orders(approval_token_hash);
-- Fast lookup for client approval endpoint
CREATE INDEX idx_change_orders_expires ON change_orders(expires_at)
  WHERE status = 'sent' OR status = 'viewed';
-- For expiry job: only scan non-final status records
CREATE INDEX idx_change_orders_created ON change_orders(project_id, created_at DESC);
```

---

### Table 15: `change_order_events`

**Purpose:** Append-only timeline of all actions on a change order. Used for the status timeline UI and audit trail.

```sql
CREATE TABLE change_order_events (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID         NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  event_type      VARCHAR(100) NOT NULL,
  -- 'created' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired'
  -- | 'canceled' | 'resent' | 'draft_saved' | 'draft_edited'
  actor           VARCHAR(50)  NOT NULL,
  -- 'developer' | 'client' | 'system'
  actor_name      VARCHAR(255),
  -- For client events: client's typed name (approval signature)
  rejection_reason TEXT,
  -- Client's optional rejection reason
  metadata        JSONB,
  -- Additional context: { client_ip_country, resent_from_co_id, ... }
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  -- No updated_at — this is an append-only event log
);

CREATE INDEX idx_co_events_change_order_id ON change_order_events(change_order_id);
CREATE INDEX idx_co_events_created ON change_order_events(change_order_id, created_at ASC);
```

---

### Table 16: `audit_logs`

**Purpose:** Immutable, project-scoped event log of all significant actions. Used for the project History tab and for developer export in case of disputes.

```sql
CREATE TABLE audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  -- NULL for client or system actions
  event_type  VARCHAR(100) NOT NULL,
  -- 'project_created' | 'scope_updated' | 'integration_connected'
  -- | 'integration_disconnected' | 'source_added' | 'source_removed'
  -- | 'message_ingested' | 'alert_created' | 'alert_dismissed'
  -- | 'alert_confirmed' | 'alert_snoozed' | 'co_created' | 'co_sent'
  -- | 'co_viewed' | 'co_approved' | 'co_rejected' | 'co_expired'
  -- | 'co_canceled' | 'co_resent'
  actor       VARCHAR(50)  NOT NULL,
  -- 'developer' | 'client' | 'ai' | 'system'
  entity_type VARCHAR(100),
  -- 'project' | 'scope' | 'integration' | 'alert' | 'change_order' | 'message'
  entity_id   UUID,
  -- ID of the entity the event relates to
  description TEXT         NOT NULL,
  -- Human-readable event description: "Scope updated to version 3"
  metadata    JSONB,
  -- Additional data: { version, source_name, confidence, price_cents, ... }
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  -- Append-only: no updated_at, no deleted_at, no soft delete
);

CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id, created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(project_id, event_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

---

### Table 17: `webhook_events`

**Purpose:** Raw incoming webhook payloads from Slack, Gmail, Outlook, and Paddle. Used for idempotency checking, debugging, and replay.

```sql
CREATE TABLE webhook_events (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        VARCHAR(50)  NOT NULL,
  -- 'slack' | 'gmail' | 'outlook' | 'paddle'
  external_id     VARCHAR(500),
  -- Provider's event ID for idempotency (Slack: event_id; Paddle: event ID)
  event_type      VARCHAR(200),
  -- Provider's event type string (e.g., 'message', 'subscription.created')
  payload         JSONB        NOT NULL,
  -- Full raw webhook payload
  status          VARCHAR(50)  NOT NULL DEFAULT 'received',
  -- 'received' | 'processed' | 'failed' | 'duplicate'
  processing_error TEXT,
  -- Error message if status = 'failed'
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_provider ON webhook_events(provider, created_at DESC);
CREATE INDEX idx_webhook_events_external_id ON webhook_events(provider, external_id);
-- Fast idempotency lookup: "have we seen this Slack event_id before?"
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
```

---

## 2. Relationships Diagram

```
users
  │
  ├──── accounts (1:many — OAuth providers linked to user)
  ├──── sessions (1:many — active login sessions)
  ├──── subscriptions (1:1 — one active subscription per user)
  ├──── notification_preferences (1:1 — one row per user)
  ├──── clients (1:many — client contacts owned by developer)
  ├──── integrations (1:many — Slack/Gmail/Outlook OAuth connections)
  │
  └──── projects (1:many — all projects owned by developer)
            │
            ├──── project_scopes (1:many — versioned; only one is_current=TRUE)
            │
            ├──── monitored_sources (1:many — Slack channels or email addresses)
            │         └──── integrations (many:1 — each source belongs to one integration)
            │
            ├──── ingested_messages (1:many — raw client messages)
            │         └──── monitored_sources (many:1 — message came from this source)
            │
            ├──── scope_alerts (1:many — AI flags)
            │         ├──── ingested_messages (1:1 — one alert per message)
            │         └──── project_scopes (many:1 — which scope version was used)
            │
            ├──── change_orders (1:many — all COs for the project)
            │         ├──── scope_alerts (many:1, optional — CO may have no linked alert)
            │         ├──── clients (many:1, optional — linked client record)
            │         └──── change_order_events (1:many — append-only event timeline)
            │
            └──── audit_logs (1:many — project-scoped event history)
```

### Relationship Types Summary

| Relationship | Type | Notes |
|---|---|---|
| users → projects | 1:many | User owns all their projects |
| users → integrations | 1:many | User can connect multiple OAuth accounts |
| users → subscriptions | 1:1 | One active subscription per user |
| users → clients | 1:many | Client contacts are per-developer |
| projects → project_scopes | 1:many (versioned) | One is_current=TRUE enforced by partial unique index |
| projects → monitored_sources | 1:many | Each project monitors specific channels/emails |
| integrations → monitored_sources | 1:many | A source belongs to one integration |
| projects → ingested_messages | 1:many | All raw messages per project |
| monitored_sources → ingested_messages | 1:many | Message came through this source |
| ingested_messages → scope_alerts | 1:0..1 | At most one alert per message |
| project_scopes → scope_alerts | 1:many | Multiple alerts can reference same scope version |
| projects → change_orders | 1:many | All COs per project |
| scope_alerts → change_orders | 1:0..1 | One alert may lead to one CO |
| clients → change_orders | 1:many | One client may have multiple COs |
| change_orders → change_order_events | 1:many | Timeline events per CO |
| projects → audit_logs | 1:many | All events for a project |

---

## 3. User Roles and Permissions

### Role: Developer (Authenticated User)

The developer is the primary SaaS user. They own all data they create.

**Can:**
- Read, create, update, and delete their own projects, scopes, integrations, monitored sources, alerts, change orders, and clients
- View their own subscription and billing information
- Export their own audit logs
- Manage their account and notification preferences

**Cannot:**
- Access any other developer's data (enforced at API level by ownership check: `project.user_id = session.user.id`)
- Read, modify, or delete another developer's records in any table
- Access the change order approval endpoint with a developer session (it is a separate public endpoint)

---

### Role: Client (Unauthenticated, Token-Based)

The client interacts only through a unique, time-limited, hashed change order approval token. They have no ScopeAI account.

**Can:**
- Read the change order data associated with their specific token (title, description, price, terms, expiry)
- Submit an approval (POST with name signature)
- Submit a rejection (POST with optional reason)

**Cannot:**
- Read any other change order or any other ScopeAI data
- Approve or reject after the token has expired
- Approve or reject a change order that is already in a final state (approved / rejected / canceled / expired)
- Make any other API call — all other endpoints require developer authentication

---

### Role: System / Background Jobs

Background jobs (Trigger.dev) run with a service-level API key, not as a user session.

**Can:**
- Read integrations, monitored sources, ingested messages, project scopes
- Write to ingested_messages (update status), scope_alerts (create), audit_logs (append), change_orders (update status on expiry), integrations (update status on token error)
- Queue and execute AI analysis
- Send transactional emails via Resend

**Cannot:**
- Perform actions that require developer intent (create/delete projects, send change orders, dismiss alerts)

---

### Multi-Tenancy / Data Isolation

**Enforcement strategy:** Application-level row ownership checks (not PostgreSQL row-level security at MVP [ASSUMPTION: RLS added in v2 if compliance requirements emerge]).

Every API route that accesses project-scoped data follows this pattern:

```typescript
// Example: Get alert by ID
const alert = await prisma.scopeAlerts.findFirst({
  where: {
    id: alertId,
    project: {
      user_id: session.user.id  // ← ownership check
    }
  }
});

if (!alert) {
  return res.status(404).json({ error: 'Not found' });
  // 404 (not 403) — do not reveal that the resource exists
}
```

This pattern is applied consistently across all routes. A developer can never access another developer's data by guessing UUIDs because every query is scoped to `user_id`.

---

## 4. API Endpoints

### Auth Endpoints

| Method | Path | Auth | Request Body | Response | Notes |
|---|---|---|---|---|---|
| POST | `/api/auth/[...nextauth]` | Public | Provider-specific | NextAuth response | Handles all NextAuth routes |
| POST | `/api/auth/register` | Public | `{ name, email, password }` | `{ message }` | Creates account; sends verification email |
| POST | `/api/auth/verify-email` | Public | `{ token }` | `{ message }` | Marks email as verified |
| POST | `/api/auth/forgot-password` | Public | `{ email }` | `{ message }` | Sends reset email (always 200) |
| POST | `/api/auth/reset-password` | Public | `{ token, password }` | `{ message }` | Sets new password; invalidates token |

---

### User Endpoints

| Method | Path | Auth | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/users/me` | Developer | — | `{ user }` | Returns current user profile |
| PATCH | `/api/users/me` | Developer | `{ name?, avatar_url? }` | `{ user }` | Update profile |
| GET | `/api/users/me/notification-preferences` | Developer | — | `{ preferences }` | — |
| PUT | `/api/users/me/notification-preferences` | Developer | `{ ...preferences }` | `{ preferences }` | Full replacement |

---

### Project Endpoints

| Method | Path | Auth | Request Body / Params | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/projects` | Developer | `?status=active\|archived` | `{ projects[] }` | — |
| POST | `/api/projects` | Developer | `{ name, client_name, client_email, notes? }` | `{ project }` | Creates project + default notification prefs |
| GET | `/api/projects/[id]` | Developer | — | `{ project }` | Includes open alert count and pending CO count |
| PATCH | `/api/projects/[id]` | Developer | `{ name?, client_name?, client_email?, notes?, status? }` | `{ project }` | — |
| DELETE | `/api/projects/[id]` | Developer | — | `{ message }` | Soft delete; monitoring paused |

---

### Scope Endpoints

| Method | Path | Auth | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/projects/[id]/scope` | Developer | — | `{ current_scope, versions[] }` | versions[] is summary list |
| GET | `/api/projects/[id]/scope/[version]` | Developer | — | `{ scope }` | Read specific version |
| PUT | `/api/projects/[id]/scope` | Developer | `{ content_text }` | `{ scope }` | Creates new version; old marked is_current=FALSE |
| POST | `/api/projects/[id]/scope/upload` | Developer | `FormData { file }` | `{ scope }` | Parses PDF/DOCX; stores text; creates new version |

---

### Integration Endpoints

| Method | Path | Auth | Request Body / Params | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/integrations` | Developer | — | `{ integrations[] }` | All connected integrations |
| DELETE | `/api/integrations/[id]` | Developer | — | `{ message }` | Disconnects; revokes token; removes webhooks |
| GET | `/api/integrations/slack/connect` | Developer | — | Redirect to Slack OAuth | — |
| GET | `/api/integrations/slack/callback` | Public | `?code&state` | Redirect to app | Exchanges code; saves encrypted tokens |
| GET | `/api/integrations/slack/channels` | Developer | `?integration_id` | `{ channels[] }` | Lists available channels from Slack API |
| GET | `/api/integrations/gmail/connect` | Developer | — | Redirect to Google OAuth | — |
| GET | `/api/integrations/gmail/callback` | Public | `?code&state` | Redirect to app | Exchanges code; sets up Gmail watch |
| GET | `/api/integrations/outlook/connect` | Developer | — | Redirect to Microsoft OAuth | — |
| GET | `/api/integrations/outlook/callback` | Public | `?code&state` | Redirect to app | Exchanges code; creates Graph webhook subscription |

---

### Monitored Sources Endpoints

| Method | Path | Auth | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/projects/[id]/sources` | Developer | — | `{ sources[] }` | — |
| POST | `/api/projects/[id]/sources` | Developer | `{ integration_id, source_type, source_id, source_name }` | `{ source }` | Adds channel or email |
| PATCH | `/api/projects/[id]/sources/[sourceId]` | Developer | `{ is_active }` | `{ source }` | Enable/disable monitoring |
| DELETE | `/api/projects/[id]/sources/[sourceId]` | Developer | — | `{ message }` | Removes source from monitoring |

---

### Alert Endpoints

| Method | Path | Auth | Request Body / Params | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/alerts` | Developer | `?project_id&action&page&limit` | `{ alerts[], total, page }` | Global alert list with pagination |
| GET | `/api/projects/[id]/alerts` | Developer | `?action&page&limit` | `{ alerts[], total }` | Project-scoped alert list |
| GET | `/api/projects/[id]/alerts/[alertId]` | Developer | — | `{ alert, message }` | Full detail including original message |
| PATCH | `/api/projects/[id]/alerts/[alertId]` | Developer | `{ action: 'dismiss'\|'confirm'\|'snooze', is_false_positive? }` | `{ alert }` | Updates developer_action |
| POST | `/api/projects/[id]/alerts/bulk-action` | Developer | `{ alert_ids[], action }` | `{ updated_count }` | Bulk dismiss or snooze |

---

### Change Order Endpoints

| Method | Path | Auth | Request Body / Params | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/change-orders` | Developer | `?project_id&status&page&limit` | `{ change_orders[], total }` | Global CO list |
| GET | `/api/projects/[id]/change-orders` | Developer | `?status&page&limit` | `{ change_orders[] }` | Project-scoped |
| POST | `/api/projects/[id]/change-orders` | Developer | `{ scope_alert_id?, title, description, price_cents?, currency?, timeline_impact?, terms?, expires_in_days? }` | `{ change_order }` | Creates draft CO |
| GET | `/api/projects/[id]/change-orders/[coId]` | Developer | — | `{ change_order, events[] }` | Full detail with event timeline |
| PATCH | `/api/projects/[id]/change-orders/[coId]` | Developer | `{ title?, description?, price_cents?, ... }` | `{ change_order }` | Update draft only; 422 if not draft |
| POST | `/api/projects/[id]/change-orders/[coId]/send` | Developer | — | `{ change_order }` | Generates token; sends email; status → sent |
| POST | `/api/projects/[id]/change-orders/[coId]/cancel` | Developer | — | `{ change_order }` | Status → canceled; token invalidated |
| POST | `/api/projects/[id]/change-orders/[coId]/resend` | Developer | `{ expires_in_days? }` | `{ change_order }` | New token; new expiry; sends fresh email |
| POST | `/api/projects/[id]/ai/generate-change-order` | Developer | `{ scope_alert_id }` | `{ draft_change_order }` | AI generates draft; not saved until developer confirms |

---

### Client Approval Endpoints (Public — Token Auth)

| Method | Path | Auth | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/co/[token]` | Public (token) | — | `{ change_order }` | Returns limited fields; marks 'viewed' on first access |
| POST | `/api/co/[token]/approve` | Public (token) | `{ client_name }` | `{ message }` | Validates token; records approval; notifies developer |
| POST | `/api/co/[token]/reject` | Public (token) | `{ reason? }` | `{ message }` | Validates token; records rejection; notifies developer |

**Token validation rules applied to all `/api/co/[token]/*` endpoints:**
1. Hash the raw token (SHA-256); look up `change_orders.approval_token_hash`
2. If not found → 404 (generic "not found")
3. If found but `approval_token_expires_at` < NOW() → 410 Gone with `{ code: 'EXPIRED' }`
4. If found but status is already a final state (approved / rejected / canceled) → 409 Conflict with `{ code: 'ALREADY_DECIDED' }`
5. Otherwise → proceed

---

### Audit Log Endpoints

| Method | Path | Auth | Request Body / Params | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/projects/[id]/audit` | Developer | `?event_type&start_date&end_date&page&limit` | `{ events[], total }` | — |
| POST | `/api/projects/[id]/audit/export` | Developer | `{ format: 'pdf'\|'csv', start_date?, end_date? }` | File download | Generates and streams export |

---

### Billing Endpoints

| Method | Path | Auth | Request Body | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/billing/subscription` | Developer | — | `{ subscription }` | Current plan and status |
| GET | `/api/billing/plans` | Public | — | `{ plans[] }` | Available Paddle plans |
| POST | `/api/billing/checkout` | Developer | `{ plan_id }` | `{ checkout_url }` | Creates Paddle checkout session |
| POST | `/api/billing/cancel` | Developer | — | `{ message }` | Cancels at period end via Paddle API |
| GET | `/api/billing/invoices` | Developer | — | `{ invoices[] }` | From Paddle API |

---

### Webhook Endpoints (Public — Signature-Validated)

| Method | Path | Validates | Action |
|---|---|---|---|
| POST | `/api/webhooks/slack` | `X-Slack-Signature` (HMAC-SHA256) | Saves to webhook_events; queues ingest job |
| POST | `/api/webhooks/gmail` | Google push notification auth | Saves to webhook_events; queues ingest job |
| POST | `/api/webhooks/outlook` | Validation token on setup; HMAC on events | Saves to webhook_events; queues ingest job |
| POST | `/api/webhooks/paddle` | `Paddle-Signature` (HMAC-SHA256) | Updates subscription status |

**All webhook handlers must:**
1. Validate signature synchronously — reject (401) if invalid
2. Return HTTP 200 within 3 seconds (Slack requirement)
3. Write raw payload to `webhook_events` table for auditability
4. Queue processing as a background job — never process synchronously in the handler
5. Check `webhook_events.external_id` for duplicates before queuing (idempotency)

---

### SSE Endpoint

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/sse/alerts` | Developer | `text/event-stream` — real-time alert count and new alert events |

**Events emitted:**
- `alert_created` — `{ alert_id, project_id, classification, confidence }`
- `co_approved` — `{ co_id, project_id, client_name }`
- `co_rejected` — `{ co_id, project_id, rejection_reason }`
- `integration_disconnected` — `{ integration_id, provider }`

---

## 5. Validation Rules

### `users`

| Field | Validation Rule |
|---|---|
| `email` | Valid email format (RFC 5322); max 255 chars; unique |
| `password` | Min 8 chars; max 128 chars; must contain at least one letter and one number [ASSUMPTION] |
| `name` | Max 255 chars; strip leading/trailing whitespace |

---

### `projects`

| Field | Validation Rule |
|---|---|
| `name` | Required; max 255 chars; strip whitespace |
| `client_name` | Required; max 255 chars |
| `client_email` | Required; valid email format; max 255 chars |
| `notes` | Optional; max 5,000 chars |

---

### `project_scopes`

| Field | Validation Rule |
|---|---|
| `content_text` | Required; min 50 chars [ASSUMPTION]; max 50,000 chars |
| File upload | PDF or DOCX only; max 10 MB; file must be parseable |

---

### `integrations`

| Field | Validation Rule |
|---|---|
| `provider` | Must be one of: 'slack', 'gmail', 'outlook' |
| `provider_account_id` | Required; max 255 chars |

---

### `monitored_sources`

| Field | Validation Rule |
|---|---|
| `source_type` | Must be 'slack_channel' or 'email_address' |
| `source_id` | For email: valid email format; for Slack: valid channel ID format (starts with 'C') |
| `integration_id` | Must belong to the same user as the project |

---

### `change_orders`

| Field | Validation Rule |
|---|---|
| `title` | Required; min 5 chars; max 500 chars |
| `description` | Required; min 20 chars; max 10,000 chars |
| `price_cents` | Optional; if provided: integer ≥ 0; max 10,000,000 (=$100,000) |
| `currency` | Must be a valid ISO 4217 currency code (e.g., 'USD', 'GBP', 'EUR') |
| `client_email` | Required; valid email format |
| `expires_in_days` | Integer; min 1; max 90 [ASSUMPTION] |
| `terms` | Optional; max 5,000 chars |
| **Business rule** | A change order cannot be sent without `title` and `description` |
| **Business rule** | A change order in 'approved', 'rejected', 'canceled', or 'expired' status cannot be edited |
| **Business rule** | Only draft change orders can be edited via PATCH |

---

### Client Approval (`/api/co/[token]`)

| Field | Validation Rule |
|---|---|
| `client_name` (approve) | Required; min 2 chars; max 255 chars; strip whitespace |
| `reason` (reject) | Optional; max 1,000 chars |

---

### Input Sanitization

- All string inputs are trimmed of leading/trailing whitespace before storage
- HTML is stripped from all fields except `description` and `terms` in change orders (where basic formatting is allowed; sanitized with a whitelist: `<b>`, `<i>`, `<ul>`, `<ol>`, `<li>`, `<br>`)
- All API inputs are validated using **Zod** schemas on the server side — client-side validation is duplicated from the same schemas but never trusted alone
- SQL injection: mitigated entirely by Prisma's parameterized queries — no raw SQL with user input

---

## 6. Security Considerations

### OAuth Token Storage

All OAuth access and refresh tokens stored in the `integrations` and `accounts` tables are encrypted before writing and decrypted in memory only when needed for an API call.

**Encryption scheme:** AES-256-GCM
- Key source: `process.env.TOKEN_ENCRYPTION_KEY` (32-byte random key; base64-encoded)
- Per-token IV: 12-byte random IV generated at encryption time; prepended to ciphertext
- Authentication tag: 16 bytes; appended to ciphertext
- Stored format: `base64(iv) + "." + base64(ciphertext + authTag)`
- The plaintext token is never returned via any API response

**Key rotation:** [ASSUMPTION] Token re-encryption on key rotation is a v2 concern. At MVP, use a single key and document the rotation procedure.

---

### Change Order Token Security

| Property | Value |
|---|---|
| Generation | `crypto.randomBytes(36).toString('base64url')` — 48 URL-safe characters |
| Storage | SHA-256 hash only; raw token never stored |
| Transmission | Raw token in email URL only; HTTPS enforced |
| Expiry | `approval_token_expires_at` checked on every access |
| Single-use decision | Once approved or rejected, token cannot trigger a second decision (status check) |
| Rate limiting | 5 requests/minute/token on all `/api/co/*` endpoints |
| No session required | Client endpoint uses only the hashed token — no cookies, no sessions |

---

### Fields Never Returned to Frontend

| Table | Fields Never Exposed via API |
|---|---|
| `users` | `password_hash` |
| `accounts` | `access_token`, `refresh_token`, `id_token` |
| `integrations` | `access_token_enc`, `refresh_token_enc` |
| `change_orders` | `approval_token_hash` |
| `verification_tokens` | `token` (hash) |

Prisma `select` or `omit` is used on every query to explicitly exclude these fields — never rely on "we just won't return it" logic in the route handler.

---

### SQL Injection Prevention

Prisma ORM uses parameterized queries for all database operations. No raw SQL with user-supplied input is used at MVP. If raw SQL is ever needed (e.g., for complex aggregations), use Prisma's `$queryRaw` with tagged template literals — never string concatenation.

---

### Rate Limiting on Sensitive Endpoints

| Endpoint Group | Limit | Window | Strategy |
|---|---|---|---|
| POST `/api/auth/register` | 5 requests | 15 minutes / IP | Upstash Redis |
| POST `/api/auth/forgot-password` | 3 requests | 15 minutes / IP | Upstash Redis |
| POST `/api/auth/reset-password` | 5 requests | 15 minutes / IP | Upstash Redis |
| GET/POST `/api/co/[token]/*` | 10 requests | 1 minute / token | Upstash Redis |
| POST `/api/projects/[id]/ai/generate-change-order` | 10 requests | 1 minute / user | Upstash Redis |
| All authenticated API routes | 120 requests | 1 minute / user | Upstash Redis |

---

### GDPR / Data Retention Considerations [ASSUMPTION]

- Developer can delete their account at any time; all associated data is soft-deleted immediately and hard-deleted after 90 days
- Change orders (once sent and decided) are retained for the life of the account — they are legal records
- Audit logs are retained for the life of the account — they exist specifically for dispute resolution
- Client email addresses are stored to support change order delivery; no marketing use
- Privacy policy must be published before launch (required for Google OAuth verification)

---

## 7. Background Jobs and Queues

**Job system:** Trigger.dev v3
**Configuration:** Jobs defined as TypeScript functions; deployed with the Next.js application.

---

### Job 1: `ingest-slack-message`

| Property | Value |
|---|---|
| **Trigger** | Slack webhook received and validated at `/api/webhooks/slack` |
| **Input** | `{ webhook_event_id, slack_event_payload }` |
| **Steps** | 1. Parse Slack event; extract channel_id, user_id, text, ts, team_id |
| | 2. Look up `monitored_sources` by `integration_id + source_id = channel_id + is_active = true` |
| | 3. If no matching source → mark webhook_event as 'processed' (not monitored); exit |
| | 4. Look up user name from Slack API (cached in Redis 10min) |
| | 5. Check `ingested_messages` for duplicate (provider + external_message_id) |
| | 6. If duplicate → mark webhook_event as 'duplicate'; exit |
| | 7. Insert into `ingested_messages` with `analysis_status = 'pending'` |
| | 8. Queue `analyze-message` job with the new `ingested_message_id` |
| | 9. Append to `audit_logs`: 'message_ingested' |
| **Failure** | Retry 3× with exponential backoff (30s, 2min, 10min); on final failure: mark webhook_event as 'failed'; log to Sentry |
| **Idempotency** | Unique constraint on `(project_id, provider, external_message_id)` prevents duplicate inserts |

---

### Job 2: `ingest-email-message`

| Property | Value |
|---|---|
| **Trigger** | Gmail or Outlook webhook received and validated |
| **Input** | `{ webhook_event_id, provider, integration_id }` |
| **Steps** | 1. Fetch new emails from Gmail API or Microsoft Graph API using stored tokens |
| | 2. For each new email: check sender against `monitored_sources` for the integration |
| | 3. If sender matches a monitored source → check for duplicate; insert `ingested_messages` |
| | 4. Queue `analyze-message` job for each new message |
| | 5. Update `integrations.metadata` with new Gmail `history_id` |
| **Failure** | Retry 3×; on OAuth error: mark integration as 'token_expired'; notify developer |
| **Idempotency** | Gmail message ID / Outlook item ID used as `external_message_id`; unique constraint prevents duplicates |

---

### Job 3: `analyze-message`

| Property | Value |
|---|---|
| **Trigger** | Queued by `ingest-slack-message` or `ingest-email-message` |
| **Input** | `{ ingested_message_id }` |
| **Steps** | 1. Fetch `ingested_messages` record |
| | 2. Fetch project's current scope (`project_scopes WHERE is_current = TRUE`) |
| | 3. If no scope exists → set `analysis_status = 'skipped_no_scope'`; exit |
| | 4. Update `analysis_status = 'analyzing'`; increment `analysis_attempts` |
| | 5. Build prompt (system prompt + scope text + message content) |
| | 6. Call OpenAI GPT-4o with `response_format: json_object` |
| | 7. Parse JSON response: `{ classification, confidence, explanation, scope_excerpt, flagged_request }` |
| | 8. If `classification = 'in_scope'` → update `analysis_status = 'analyzed'`; exit |
| | 9. If `classification = 'out_of_scope'` or `'unclear'` → insert `scope_alerts` |
| | 10. Update `analysis_status = 'analyzed'` |
| | 11. Append to `audit_logs`: 'alert_created' |
| | 12. Emit SSE event to developer's browser (via pub/sub or direct notification) |
| | 13. If developer's `notification_preferences.email_new_alert = TRUE` → queue alert email |
| **Failure** | Retry 3× (analysis_attempts tracks count); after 3 failures: `analysis_status = 'failed'`; log error; notify developer via in-app alert |
| **Token logging** | Store `ai_tokens_used` in `scope_alerts` for cost tracking |
| **Cost guard** | If project has processed > 200 messages today → skip and log warning [ASSUMPTION] |

---

### Job 4: `generate-change-order-draft`

| Property | Value |
|---|---|
| **Trigger** | Developer clicks "Generate Change Order" on an alert |
| **Input** | `{ scope_alert_id, user_id }` |
| **Steps** | 1. Fetch alert, original message, project scope |
| | 2. Build CO generation prompt |
| | 3. Call OpenAI GPT-4o; parse: `{ title, description, suggested_price_range }` |
| | 4. Return draft fields to frontend (not saved to DB until developer confirms) |
| **Failure** | Return error to frontend; developer writes manually |
| **Timeout** | 30 second max; if exceeded → return error |

---

### Job 5: `send-change-order-email`

| Property | Value |
|---|---|
| **Trigger** | Developer clicks "Send to Client" on a change order |
| **Input** | `{ change_order_id }` |
| **Steps** | 1. Fetch change order; generate raw approval token |
| | 2. Hash token (SHA-256); store hash + expiry in `change_orders` |
| | 3. Update `change_orders.status = 'sent'`, `sent_at = NOW()` |
| | 4. Build email (HTML + plain text) with approval link |
| | 5. Send via Resend API |
| | 6. Insert `change_order_events` record: `{ event_type: 'sent', actor: 'developer' }` |
| | 7. Append to `audit_logs`: 'co_sent' |
| **Failure** | Retry 3×; if all fail: revert status to 'draft'; notify developer of failure |

---

### Job 6: `expire-change-orders`

| Property | Value |
|---|---|
| **Trigger** | Scheduled: every 1 hour |
| **Input** | None |
| **Steps** | 1. Find all change orders WHERE `status IN ('sent', 'viewed') AND expires_at < NOW()` |
| | 2. For each: update `status = 'expired'` |
| | 3. Insert `change_order_events`: `{ event_type: 'expired', actor: 'system' }` |
| | 4. Append to `audit_logs`: 'co_expired' |
| | 5. If `notification_preferences.email_co_expired = TRUE` → send email to developer |
| **Failure** | Log failure to Sentry; retry on next hourly run |

---

### Job 7: `send-alert-digest`

| Property | Value |
|---|---|
| **Trigger** | Scheduled: per-user based on `notification_preferences.email_digest_hour_utc` |
| **Input** | `{ user_id }` |
| **Steps** | 1. Find all unreviewed alerts (`developer_action IS NULL`) for the user |
| | 2. If count = 0 → skip (no email sent) |
| | 3. Build digest email summarizing alerts by project |
| | 4. Send via Resend |
| **Failure** | Log; skip until next scheduled run |

---

### Job 8: `refresh-oauth-tokens`

| Property | Value |
|---|---|
| **Trigger** | Scheduled: every 45 minutes |
| **Input** | None |
| **Steps** | 1. Find all integrations WHERE `token_expires_at < NOW() + INTERVAL '30 minutes'` AND `status = 'active'` AND `refresh_token_enc IS NOT NULL` |
| | 2. For each: decrypt refresh token; call provider's token refresh endpoint |
| | 3. Encrypt and store new access token + expiry |
| | 4. If refresh fails (expired/revoked): update `status = 'token_expired'`; notify developer |
| **Failure** | Individual integration failures are handled gracefully; job continues to next integration |

---

### Job 9: `refresh-outlook-webhooks`

| Property | Value |
|---|---|
| **Trigger** | Scheduled: every 60 hours (Microsoft Graph subscriptions expire at ~70 hours) |
| **Input** | None |
| **Steps** | 1. Find all active Outlook integrations (`provider = 'outlook' AND status = 'active'`) |
| | 2. For each: call Microsoft Graph `PATCH /subscriptions/{id}` to extend expiry |
| | 3. Update `integrations.metadata.subscription_expiry` |
| | 4. If renewal fails: mark integration as 'error'; notify developer |
| **Failure** | Log to Sentry; notify developer; job retries affected integration next run |

---

### Job 10: `cleanup-expired-sessions`

| Property | Value |
|---|---|
| **Trigger** | Scheduled: daily at 2am UTC |
| **Input** | None |
| **Steps** | 1. `DELETE FROM sessions WHERE expires < NOW()` |
| | 2. `DELETE FROM verification_tokens WHERE expires < NOW()` |
| **Failure** | Log; retry next day |

---

### Job 11: `handle-paddle-webhook`

| Property | Value |
|---|---|
| **Trigger** | Paddle webhook received at `/api/webhooks/paddle` |
| **Input** | `{ webhook_event_id, paddle_event_type, paddle_payload }` |
| **Steps** | 1. Identify `paddle_event_type` |
| | 2. Route to sub-handler based on event type |
| | 3. `subscription.created` → create `subscriptions` record |
| | 4. `subscription.updated` → update status, plan, period dates |
| | 5. `subscription.canceled` → set `cancel_at_period_end = TRUE` or `canceled_at` |
| | 6. `subscription.payment.failed` → set `grace_period_ends_at = NOW() + 7 days`; notify developer |
| | 7. `subscription.payment.succeeded` → clear `grace_period_ends_at`; send receipt email |
| **Idempotency** | Check `webhook_events.external_id` for Paddle event ID before processing |
| **Failure** | Retry 5×; after all retries failed: alert builder via Sentry (Paddle will retry from their side too) |

---

## 8. File Storage

### Storage Provider: Cloudflare R2

**Why R2:** S3-compatible API (minimal code change if migrating); no egress fees (unlike AWS S3); generous free tier (10 GB storage, 1M Class B operations/month); works reliably from Pakistan; straightforward integration via AWS SDK v3.

---

### File Upload Flow (Scope Documents)

```
1. Developer selects PDF or DOCX file in the UI
2. Frontend sends POST /api/projects/[id]/scope/upload (multipart form data)
3. Backend validates: file type (PDF or DOCX only), file size (max 10 MB)
4. Backend uploads file to R2:
   - Bucket: scopeai-scope-documents
   - Key: {user_id}/{project_id}/{timestamp}-{random}.pdf
   - Content-Type: application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document
   - ACL: private (files are NOT publicly accessible)
5. Backend parses text from file:
   - PDF: using pdf-parse npm package
   - DOCX: using mammoth npm package
6. Extracted text stored in project_scopes.content_text
7. R2 object URL stored in project_scopes.file_url
8. Response to frontend: { scope } (with content_text preview)
```

---

### File Access

Scope document files stored in R2 are **private** — they are never served directly to the browser via a public URL.

If a developer needs to re-download their original file (v2 feature [ASSUMPTION]):
- Backend generates a pre-signed R2 URL (valid for 15 minutes)
- Pre-signed URL is returned to the frontend and used for the download
- The pre-signed URL is generated server-side only; never stored

---

### File Type and Size Limits

| Property | Value |
|---|---|
| Accepted formats | PDF (`.pdf`), DOCX (`.docx`) |
| Max file size | 10 MB |
| Max extracted text length | 50,000 characters (truncated with warning if exceeded) |
| MIME type validation | Validated server-side using `file-type` npm package (not just extension check) |

---

### File Security

- Files are stored under `{user_id}/` prefix — each user's files are in their own namespace
- Bucket is private — no public listing, no public read access
- R2 credentials (Account ID, Access Key ID, Secret Access Key) stored as Vercel environment variables
- On account deletion: all files in `{user_id}/` prefix are deleted from R2 as part of the cleanup job
- No file content is ever served inline in API responses — only the extracted text

---

*End of ScopeAI Backend Schema Document v1.0*
*Date: June 28, 2026*
