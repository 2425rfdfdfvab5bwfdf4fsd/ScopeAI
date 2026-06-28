# Product Requirements Document (PRD)
## ScopeAI — AI Scope Guard for Freelance Developers

**Version:** 1.0
**Date:** June 28, 2026
**Status:** Draft
**Author:** Generated for @saifbuilds

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals and Success Metrics](#2-goals-and-success-metrics)
3. [Target Users and Personas](#3-target-users-and-personas)
4. [Features and Requirements](#4-features-and-requirements)
5. [User Stories](#5-user-stories)
6. [Acceptance Criteria Summary](#6-acceptance-criteria-summary)
7. [Assumptions and Constraints](#7-assumptions-and-constraints)
8. [Risks and Open Questions](#8-risks-and-open-questions)
9. [Out of Scope for MVP](#9-out-of-scope-for-mvp)

---

## 1. Product Overview

### Product Name
**ScopeAI**

### Tagline
*Stop doing free work. Every out-of-scope request — caught, documented, and billed.*

### Summary
ScopeAI is a web-based SaaS tool built for freelance developers and small dev agencies that automatically monitors client communication via Slack and email (Gmail/Outlook), compares incoming requests against the developer's original agreed project scope using an AI engine, and flags out-of-scope work in real time. When a request is flagged, the developer can generate a professional change order in seconds — AI-drafted, developer-reviewed, and sent directly to the client for approval. ScopeAI creates an auditable record of every scope decision, protecting the developer legally and financially.

### The Problem Being Solved

Scope creep is one of the most financially damaging and emotionally draining problems in freelance development:

- **57% of agencies** lose $1,000–$5,000 per month to unbilled scope creep
- **99% of freelance developers** fail to bill for all out-of-scope work
- Solo developers lose an estimated **$7,800–$15,600 per year** on average to free work
- The PMI 2025 report states that **52% of all projects fail** to meet original goals, with scope creep as the top reason
- The core mechanic: *"Clients adding 'small' requests that collectively consume 30% of a project's time — with no paper trail"*

The root cause is structural: there is no tool natively integrated into the developer workflow that catches these requests at the moment they arrive, before they become free work.

### The Solution
ScopeAI sits between the developer and their client communication channels. It reads every Slack message and email from clients, compares each one against the defined project scope using AI, and surfaces only the requests that fall outside what was agreed. The developer reviews the flag, confirms it, and generates a change order in one click. The client receives a professional approval request via email — no ScopeAI account required. Every action is logged in an immutable audit trail.

---

## 2. Goals and Success Metrics

### Business Goals

| Goal | Target | Timeframe |
|---|---|---|
| Reach paying customers | First paying customer | Month 1 post-launch |
| Monthly Recurring Revenue | $2,000 MRR | Month 3 post-launch |
| Monthly Recurring Revenue | $5,000 MRR | Month 6 post-launch |
| User retention | ≥ 70% monthly retention | Ongoing |
| Churn rate | < 5% monthly | Ongoing |
| Conversion rate (trial to paid) | ≥ 25% | Ongoing |

### Product Goals

1. A developer can set up a fully monitored project (Slack + email connected, scope defined) in under 10 minutes
2. The AI correctly flags out-of-scope requests with ≥ 85% accuracy (measured via developer feedback on alerts)
3. A developer can generate and send a change order from a flagged alert in under 2 minutes
4. A client can view and approve/reject a change order without creating a ScopeAI account
5. Every scope decision is logged and exportable for use in client disputes

### Success Metrics (KPIs)

| Metric | Target |
|---|---|
| Time-to-first-alert (after onboarding) | < 24 hours |
| Onboarding completion rate | ≥ 60% |
| Alert accuracy rate (positive feedback) | ≥ 85% |
| Change order send rate (alerts confirmed → orders sent) | ≥ 50% |
| Client approval rate (sent → approved) | ≥ 65% |
| Average revenue recovered per user per month | ≥ $500 |
| Support tickets per active user per month | < 0.5 |

### Anti-Goals (What ScopeAI Will NOT Do at MVP)

- ScopeAI will **not** be a full project management tool (no task boards, timelines, or Gantt charts)
- ScopeAI will **not** replace invoicing or accounting software
- ScopeAI will **not** monitor voice calls, video meetings, or SMS
- ScopeAI will **not** have a mobile app
- ScopeAI will **not** support team collaboration features (multi-seat accounts)
- ScopeAI will **not** integrate with tools beyond Slack, Gmail, and Outlook at MVP
- ScopeAI will **not** auto-send change orders without developer review and confirmation

---

## 3. Target Users and Personas

### Persona 1 — Primary: The Freelance Developer

**Name:** Saif (representative persona)
**Role:** Independent full-stack developer
**Revenue:** $5,000–$20,000/month from 4–8 active client projects
**Tools used daily:** VS Code, GitHub, Linear, Notion, Slack, Gmail, Figma, Loom

**Goals:**
- Maximize billable revenue without increasing client friction
- Protect project profitability by catching scope creep before it becomes free work
- Maintain professional, documented relationships with clients
- Spend less time on admin and more time on code

**Pain Points:**
- Clients send "quick requests" via Slack that collectively consume 20–30% of unbilled time
- No documentation exists when a client disputes what was agreed
- Writing change orders manually is awkward and kills project momentum
- Existing tools (Trello, Notion, ClickUp) do nothing to detect or flag scope changes

**Technical Comfort:** Expert — comfortable with OAuth flows, API keys, webhooks
**Willingness to Pay (WTP):** $29–$49/month if the tool provably recovers more than it costs
**Reachability:** X (Twitter), Indie Hackers, r/freelance, r/webdev

---

### Persona 2 — Secondary: The Small Dev Agency Principal

**Name:** Raza (representative persona)
**Role:** Founder/principal of a 3–5 person dev agency
**Revenue:** $15,000–$40,000/month across 8–15 client projects
**Tools used:** Slack, Notion, HubSpot, FreshBooks, GitHub

**Goals:**
- Enforce consistent scope management across all team members
- Reduce time spent by senior developers on admin and scope disputes
- Protect agency margins across a larger portfolio of projects
- Have a professional, defensible paper trail for every client

**Pain Points:**
- Scope creep multiplied across 10+ projects = significant monthly revenue leakage
- Junior team members don't recognize scope creep or feel uncomfortable raising it
- Change order conversations with clients are handled inconsistently across the team

**Technical Comfort:** High — but values simplicity; doesn't want to configure complex tools
**Willingness to Pay (WTP):** $49–$99/month if it replaces manual process for multiple projects
**Reachability:** LinkedIn, agency Slack communities, X

---

### Persona 3 — Tertiary: The Client (Change Order Recipient)

**Name:** Ahmed (representative persona)
**Role:** Founder or product manager at an early-stage startup or SMB
**Context:** Is a client of a freelance developer or small dev agency using ScopeAI

**Goals:**
- Understand clearly what falls outside the original agreement and why
- Make a quick, informed decision (approve or reject) without friction
- Trust that the developer is acting fairly and professionally

**Pain Points:**
- Feels surprised or defensive when told a request is "out of scope"
- Does not want to create an account in yet another tool
- Needs the change order to be clear, professional, and easy to act on

**Technical Comfort:** Low to medium — should require no technical knowledge
**Interaction with ScopeAI:** Receives a change order link via email; views and approves/rejects via a public web page; no account required

---

## 4. Features and Requirements

### Feature Priority Matrix

| Feature | Priority | Phase |
|---|---|---|
| Project creation and scope definition | Must-Have | MVP |
| Slack OAuth integration and message monitoring | Must-Have | MVP |
| Gmail OAuth integration and email monitoring | Must-Have | MVP |
| Outlook OAuth integration and email monitoring | Must-Have | MVP |
| AI scope comparison engine | Must-Have | MVP |
| Out-of-scope alert dashboard | Must-Have | MVP |
| Change order generation (AI-drafted) | Must-Have | MVP |
| Change order client approval workflow | Must-Have | MVP |
| Audit trail and history log | Must-Have | MVP |
| Multi-project management | Must-Have | MVP |
| Developer onboarding flow | Must-Have | MVP |
| Billing/subscription management (Paddle) | Must-Have | MVP |
| AI sensitivity settings | Should-Have | MVP |
| Change order default templates | Should-Have | MVP |
| Scope version history | Should-Have | MVP |
| Export audit trail (PDF/CSV) | Should-Have | MVP |
| False positive feedback (AI training signal) | Should-Have | MVP |
| Multi-seat / team accounts | Nice-to-Have | v2 |
| Mobile app | Nice-to-Have | v2 |
| Additional integrations (Teams, Discord) | Nice-to-Have | v2 |

---

### F-01: Project Creation and Scope Definition

**Description:** Developers can create a project inside ScopeAI, define the agreed scope (via document upload or manual text entry), and link it to a specific client. The scope becomes the reference document the AI uses to evaluate all incoming client messages.

**User Story:**
> As a freelance developer, I want to create a project and define its scope so that ScopeAI has a reference to compare client messages against.

**Acceptance Criteria:**
1. Developer can create a project with a name, client name, and client email
2. Developer can define scope by typing free text directly into a scope editor
3. Developer can upload a PDF or DOCX file as the scope document
4. Uploaded documents are parsed and stored as searchable text
5. Developer can edit the scope definition after project creation
6. Each scope edit creates a versioned record (scope history)
7. Developer can view the current scope at any time from the project detail page
8. Project creation takes fewer than 5 form fields to complete at minimum
9. Developer receives a confirmation when the project is live and being monitored
10. Developer can archive or delete a project

**Priority:** Must-Have
**Dependencies:** None

---

### F-02: Slack OAuth Integration and Message Monitoring

**Description:** Developers connect their Slack workspace to ScopeAI via OAuth. ScopeAI monitors selected channels for messages from clients and passes them to the AI engine for scope comparison.

**User Story:**
> As a freelance developer, I want to connect my Slack workspace so that ScopeAI can automatically read my client messages and flag out-of-scope requests.

**Acceptance Criteria:**
1. Developer can initiate Slack OAuth connection from the integrations settings page
2. After OAuth, developer selects which workspace channels to monitor per project
3. ScopeAI receives messages via the Slack Events API (not polling)
4. Only messages in selected channels are processed — no unselected channels are read
5. Developer can disconnect Slack at any time
6. Developer is notified if the Slack integration disconnects unexpectedly
7. Re-authentication is prompted when the OAuth token expires
8. Developer can add or remove monitored channels per project at any time
9. System handles Slack API rate limits gracefully without data loss
10. Message metadata (sender, timestamp, channel) is stored alongside message content

**Priority:** Must-Have
**Dependencies:** F-01 (project must exist before channels can be linked)

---

### F-03: Gmail OAuth Integration and Email Monitoring

**Description:** Developers connect their Gmail account to ScopeAI via Google OAuth. ScopeAI monitors incoming emails from client email addresses and passes them to the AI engine.

**User Story:**
> As a freelance developer, I want to connect my Gmail account so that ScopeAI monitors client emails and flags out-of-scope requests automatically.

**Acceptance Criteria:**
1. Developer can initiate Gmail OAuth connection from the integrations settings page
2. Developer specifies which client email addresses to monitor per project
3. ScopeAI receives new emails via Gmail push notifications (not polling) [ASSUMPTION: Google Cloud project is set up and Gmail API verified]
4. Only emails from specified client addresses are processed
5. Email subject, body, and sender are captured and stored
6. Email attachments are not processed by the AI at MVP (text content only) [ASSUMPTION]
7. Developer can disconnect Gmail at any time
8. Developer is notified if the Gmail integration disconnects unexpectedly
9. Re-authentication is prompted when the OAuth token expires
10. Developer can update the monitored email addresses per project at any time

**Priority:** Must-Have
**Dependencies:** F-01

---

### F-04: Outlook OAuth Integration and Email Monitoring

**Description:** Developers connect their Microsoft Outlook account to ScopeAI via Microsoft OAuth (Microsoft Graph API). ScopeAI monitors incoming emails from specified client addresses.

**User Story:**
> As a freelance developer who uses Outlook, I want to connect my email account so that ScopeAI monitors client emails and flags out-of-scope requests automatically.

**Acceptance Criteria:**
1. Developer can initiate Outlook OAuth connection from the integrations settings page
2. Developer specifies which client email addresses to monitor per project
3. ScopeAI receives new emails via Microsoft Graph webhook subscriptions
4. Only emails from specified client addresses are processed
5. Email subject, body, and sender are captured and stored
6. Developer can disconnect Outlook at any time
7. Developer is notified if the Outlook integration disconnects unexpectedly
8. Re-authentication is prompted when the OAuth token expires
9. Webhook subscriptions are renewed automatically before expiry (Microsoft Graph subscriptions expire after 4230 minutes)
10. Developer can update the monitored email addresses per project at any time

**Priority:** Must-Have
**Dependencies:** F-01

---

### F-05: AI Scope Comparison Engine

**Description:** Every message ingested from Slack or email is analyzed by an AI engine that compares the request against the project's defined scope. The engine produces a classification (in-scope / out-of-scope / unclear) and a confidence score, then creates an alert for out-of-scope and unclear results.

**User Story:**
> As a freelance developer, I want the AI to automatically compare client messages against my project scope so that I am alerted only when a request falls outside what was agreed.

**Acceptance Criteria:**
1. Every ingested message is sent to the AI engine within 2 minutes of receipt
2. The AI classifies each message as: In-Scope, Out-of-Scope, or Unclear
3. The AI provides a confidence score (High / Medium / Low) for each classification
4. The AI provides a plain-English explanation of why a message was flagged
5. The AI quotes the relevant portion of the scope document to support its decision
6. In-Scope messages are logged silently — no alert is created
7. Out-of-Scope and Unclear messages generate an alert for developer review
8. AI analysis is performed in the background and does not block the user interface
9. If the AI is unavailable, messages are queued and analyzed when service resumes
10. Developer can adjust the AI sensitivity threshold (aggressive / balanced / conservative)

**Priority:** Must-Have
**Dependencies:** F-01, F-02 or F-03 or F-04

---

### F-06: Out-of-Scope Alert Dashboard

**Description:** A central dashboard where developers review all AI-generated scope alerts across all projects. Each alert shows the flagged message, the AI's reasoning, and actions the developer can take.

**User Story:**
> As a freelance developer, I want to see all flagged client requests in one dashboard so that I can quickly decide which ones need a change order.

**Acceptance Criteria:**
1. Dashboard shows all unreviewed alerts across all projects, sorted by date (newest first)
2. Developer can filter alerts by project, status (unreviewed / dismissed / confirmed), and date range
3. Each alert card shows: project name, source (Slack/Gmail/Outlook), message preview, AI classification, confidence level, and time received
4. Developer can click an alert to view the full alert detail page
5. Alert detail page shows: full message, AI explanation, quoted scope excerpt, confidence score, and available actions
6. Developer can take one of three actions on an alert: Mark as In-Scope (dismiss), Confirm as Out-of-Scope (proceed to change order), or Snooze (review later)
7. Dismissed alerts are moved to a "Reviewed" tab and do not reappear
8. Snoozed alerts resurface after 24 hours [ASSUMPTION]
9. Developer receives an in-app notification and email digest for new unreviewed alerts
10. Empty state displays clearly when no alerts are pending

**Priority:** Must-Have
**Dependencies:** F-05

---

### F-07: Change Order Generation and Editing

**Description:** When a developer confirms an alert as out-of-scope, ScopeAI automatically generates a professional change order using AI. The developer can review and edit the draft before sending it to the client.

**User Story:**
> As a freelance developer, I want ScopeAI to generate a change order from a flagged alert so that I can send a professional request to my client without writing it from scratch.

**Acceptance Criteria:**
1. Developer can trigger change order generation from the alert detail page with one click
2. AI generates a draft change order within 30 seconds, including: title, description of out-of-scope work, recommended price, estimated timeline impact, and terms
3. Developer can edit all fields of the AI-generated draft
4. Developer can set a custom price and timeline impact
5. Developer can add or remove terms and conditions from the change order
6. Developer can preview the change order exactly as the client will see it before sending
7. Developer can save a draft and return to it later without losing edits
8. Developer can delete a draft change order (returns to alert detail)
9. AI-generated content is visually distinguished from developer-edited content
10. Change order includes a default expiry date (7 days) [ASSUMPTION], editable by developer

**Priority:** Must-Have
**Dependencies:** F-06

---

### F-08: Change Order Client Approval Workflow

**Description:** The developer sends the change order to the client via a unique, secure email link. The client views the change order on a public page (no account required) and approves or rejects it. The developer is notified of the client's decision.

**User Story:**
> As a freelance developer, I want my client to receive a professional change order via email and be able to approve or reject it without needing to create an account.

**Acceptance Criteria:**
1. Developer sends the change order to the client's email address with one click
2. Client receives a branded email containing a link to the change order approval page
3. The approval page is publicly accessible via a unique, secure, time-limited token — no login required
4. The approval page clearly displays: project name, description of out-of-scope work, price, timeline impact, and terms
5. Client can approve the change order with a single click and typed name (digital signature)
6. Client can reject the change order and optionally provide a reason
7. Developer receives an immediate in-app notification and email when the client acts
8. Approved change orders are logged in the audit trail and the project scope is updated to reflect the agreed addition [ASSUMPTION: developer confirms this update]
9. Rejected change orders show the client's reason to the developer
10. The approval link expires after 7 days [ASSUMPTION]; client sees a clear expired-link message
11. Developer can resend the change order or extend the expiry date
12. Developer can cancel a change order that has not yet been acted on

**Priority:** Must-Have
**Dependencies:** F-07

---

### F-09: Audit Trail and History Log

**Description:** An immutable, chronological log of all scope-related events for each project — ingested messages, AI decisions, developer actions, change orders sent, and client decisions.

**User Story:**
> As a freelance developer, I want a complete, exportable history of all scope decisions and change orders so that I have documentation if a client dispute arises.

**Acceptance Criteria:**
1. Every major action is logged automatically (no developer input required)
2. Log entries include: timestamp, event type, actor (developer / AI / client), and details
3. Logged events include: message ingested, alert created, alert dismissed, alert confirmed, change order generated, change order sent, change order approved/rejected, scope updated
4. Developer can view the audit log per project
5. Developer can filter the log by date range and event type
6. Developer can export the full audit log as a PDF or CSV
7. Log entries are immutable — no editing or deletion is possible
8. Log is retained for the lifetime of the account [ASSUMPTION]

**Priority:** Must-Have
**Dependencies:** All other must-have features

---

### F-10: Multi-Project Management

**Description:** Developers can manage multiple projects simultaneously within ScopeAI, each with its own scope, integrations, alerts, and change orders.

**User Story:**
> As a freelance developer managing multiple clients, I want to switch between projects easily so that ScopeAI covers my entire client portfolio.

**Acceptance Criteria:**
1. Developer can create unlimited projects [ASSUMPTION: within plan limits]
2. All projects are visible on the main dashboard with summary stats (open alerts, pending change orders)
3. Developer can switch between projects from any page via the sidebar
4. Each project has isolated scope, integrations, alerts, and audit log
5. Developer can archive a completed project without deleting its data
6. Developer can rename a project at any time
7. Developer can duplicate a project's scope definition when starting a similar new project [ASSUMPTION: nice-to-have, but included as should-have]

**Priority:** Must-Have
**Dependencies:** F-01

---

### F-11: Developer Onboarding Flow

**Description:** A guided onboarding wizard that walks new developers through connecting integrations, creating their first project, and defining scope — ensuring they reach the "first alert" milestone as quickly as possible.

**User Story:**
> As a new ScopeAI user, I want a guided setup process so that I can have my first project monitored within 10 minutes without reading documentation.

**Acceptance Criteria:**
1. Onboarding wizard launches automatically after first sign-up
2. Wizard includes: connect Slack → connect Gmail or Outlook → create first project → define scope → select monitored channels/emails → confirmation screen
3. Each step includes clear instructions and visual progress indicators
4. Developer can skip optional steps and complete them later from settings
5. Completion screen clearly states what ScopeAI is now monitoring
6. Developer can re-run the onboarding wizard from settings at any time
7. Onboarding completion rate is tracked as a product metric
8. If developer has already connected an integration, that step is shown as complete

**Priority:** Must-Have
**Dependencies:** F-01, F-02, F-03

---

### F-12: Billing and Subscription Management (Paddle)

**Description:** Developer users can subscribe to a paid plan via Paddle checkout, manage their subscription, and access billing history.

**User Story:**
> As a developer ready to pay for ScopeAI, I want to subscribe using a secure payment checkout and manage my subscription from within the app.

**Acceptance Criteria:**
1. Developer can view available pricing plans from within the app
2. Developer is directed to a Paddle-hosted checkout for payment (no card data touches ScopeAI servers)
3. Developer receives a confirmation email upon successful subscription
4. Developer can view their current plan and next billing date from the settings page
5. Developer can cancel their subscription from within the app
6. On cancellation, access continues until the end of the billing period
7. Developer receives an email notification on payment failure
8. On payment failure, developer is given a grace period of 7 days before access is restricted [ASSUMPTION]
9. Developer can access their invoice history from the settings page
10. Paddle webhooks update subscription status in ScopeAI in real time

**Priority:** Must-Have
**Dependencies:** None (can be built independently)

---

## 5. User Stories

### Developer — Onboarding and Setup

1. As a new user, I want to sign up with my Google account so that I can get started without creating a new password.
2. As a new user, I want to verify my email before accessing the app so that my account is secure.
3. As a new user, I want a step-by-step wizard so that I can set up my first project without needing documentation.
4. As a developer, I want to connect my Slack workspace via OAuth so that I don't have to manually share messages.
5. As a developer, I want to select specific Slack channels to monitor so that ScopeAI only processes relevant conversations.
6. As a developer, I want to connect my Gmail account so that client emails are monitored automatically.
7. As a developer, I want to connect my Outlook account so that I can use ScopeAI with Microsoft email.
8. As a developer, I want to define my project scope by uploading a PDF so that I don't have to retype an existing document.
9. As a developer, I want to type my project scope manually if I don't have a document so that I can get started quickly.

### Developer — Project Management

10. As a developer, I want to create multiple projects so that all my client engagements are covered.
11. As a developer, I want to view a summary of open alerts and pending change orders per project on my dashboard.
12. As a developer, I want to edit my project scope at any time so that scope additions from approved change orders are reflected.
13. As a developer, I want to view the version history of my project scope so that I have a record of what was agreed at each stage.
14. As a developer, I want to archive a completed project so that it doesn't clutter my active project list.

### Developer — Alert Management

15. As a developer, I want to see all unreviewed alerts in one place so that I don't miss any out-of-scope requests.
16. As a developer, I want to read the AI's reasoning for each alert so that I can make an informed decision quickly.
17. As a developer, I want to see the exact portion of my scope document that the AI references so that I can verify the decision.
18. As a developer, I want to dismiss an alert as in-scope so that false positives are removed without creating a change order.
19. As a developer, I want to give feedback when an alert is a false positive so that the AI improves over time.
20. As a developer, I want to snooze an alert so that I can review it after I finish my current work.
21. As a developer, I want to receive an email notification when new alerts are created so that I don't have to check the app constantly.

### Developer — Change Orders

22. As a developer, I want ScopeAI to generate a change order draft from a confirmed alert so that I don't spend time writing it from scratch.
23. As a developer, I want to edit the AI-generated change order before sending so that the wording matches my client relationship.
24. As a developer, I want to preview the change order as the client will see it so that it looks professional before I send it.
25. As a developer, I want to set the price and timeline impact manually so that I control the financial terms.
26. As a developer, I want to track the status of every sent change order (sent / viewed / approved / rejected / expired) from one view.
27. As a developer, I want to receive a notification the moment a client approves or rejects a change order.
28. As a developer, I want to resend an expired change order so that I have another opportunity to collect approval.
29. As a developer, I want to cancel a pending change order so that I can renegotiate with the client directly.
30. As a developer, I want to create a change order manually (without an alert) so that I can handle verbal scope changes.

### Client — Change Order Approval

31. As a client, I want to receive a clear email explaining that a change order has been sent so that I understand what is being requested.
32. As a client, I want to view the change order without creating an account so that there is no friction.
33. As a client, I want to understand clearly what the additional work is and what it costs before I approve.
34. As a client, I want to approve the change order with my name so that the agreement is documented.
35. As a client, I want to reject the change order and explain my reason so that the developer understands my position.
36. As a client, I want to see a confirmation screen after I approve or reject so that I know my action was recorded.
37. As a client, I want to see a clear message if the change order link has expired so that I know to contact my developer.

### Edge Cases

38. As a developer, I want to be notified if my Slack or email integration disconnects so that I don't miss monitoring.
39. As a developer, I want to re-authenticate my OAuth connection without losing my project configuration.
40. As a developer, I want to see a message if the AI could not analyze a specific message so that I can review it manually.
41. As a developer, I want the change order link to be secure so that a client cannot share it and have someone else approve on their behalf. [ASSUMPTION: token is single-use for the approval action itself]
42. As a developer, I want to export my audit log if I need to provide documentation to a client who disputes the scope.
43. As a developer whose subscription payment fails, I want a grace period and clear instructions so that I don't lose access abruptly.

---

## 6. Acceptance Criteria Summary

The following 20 acceptance criteria represent the top must-pass conditions for MVP launch readiness:

| # | Acceptance Criterion |
|---|---|
| 1 | Developer can complete full onboarding (sign up → connect integration → create project → define scope) in under 10 minutes |
| 2 | Slack OAuth connection succeeds and events are received via Slack Events API within 5 minutes of connection |
| 3 | Gmail OAuth connection succeeds and new emails trigger AI analysis within 2 minutes of receipt |
| 4 | Outlook OAuth connection succeeds and new emails trigger AI analysis within 2 minutes of receipt |
| 5 | AI correctly classifies out-of-scope messages with ≥ 85% accuracy based on developer feedback |
| 6 | Every AI alert includes the flagged message, AI explanation, confidence level, and relevant scope excerpt |
| 7 | Developer can dismiss an alert (mark as in-scope) in one click from the alert dashboard |
| 8 | Developer can generate a change order from a confirmed alert in one click |
| 9 | AI generates a complete change order draft (title, description, price, timeline, terms) within 30 seconds |
| 10 | Developer can edit all fields of the change order draft before sending |
| 11 | Client receives a change order email with a working approval link within 2 minutes of the developer clicking "Send" |
| 12 | Client can approve a change order on the public page without creating a ScopeAI account |
| 13 | Client can reject a change order with an optional reason without creating a ScopeAI account |
| 14 | Developer receives an in-app notification and email within 60 seconds of client approval or rejection |
| 15 | Change order approval link expires after 7 days and shows a clear expired-link message to the client |
| 16 | Every scope-related action is logged in the audit trail automatically |
| 17 | Developer can export the project audit trail as PDF or CSV |
| 18 | Paddle subscription checkout works end-to-end; developer receives confirmation email |
| 19 | Payment failure triggers a 7-day grace period with clear in-app and email notification to the developer |
| 20 | Disconnected Slack or email integration triggers an immediate in-app notification and email to the developer |

---

## 7. Assumptions and Constraints

### Technical Constraints

- **Solo builder:** All development is done by a single developer — architecture must prioritize simplicity and maintainability over scalability at MVP
- **10–15 hours/week:** Feature scope is constrained by available build time; MVP must be achievable within this capacity
- **No Stripe:** Pakistan-based developers cannot use Stripe without a foreign entity. Paddle or Dodo Payments is the payment processor
- **Gmail API verification:** Google requires verification of apps using sensitive OAuth scopes (reading email). This process can take 2–6 weeks. [RISK — see Section 8]
- **Slack app review:** Slack may require app review before public distribution if certain scopes are used. [RISK — see Section 8]
- **Web-only:** No mobile app is built at MVP; responsive design is required for the client-facing change order approval page
- **AI cost management:** OpenAI API costs must be monitored — high-volume message analysis could become expensive at scale

### Business Constraints

- **Zero marketing budget:** All user acquisition is via build-in-public content on X and the builder's existing network of 29+ past clients
- **Pakistan-based operation:** Payment processors, banking, and legal structures must support this jurisdiction
- **Solo operation:** No customer support team; product must be intuitive enough to minimize support tickets

### Product Assumptions That Could Invalidate This PRD

| Assumption | Risk if Wrong |
|---|---|
| Developers are willing to pay $19–$49/month for scope protection | Pricing must be validated with early users before committing to a tier structure |
| Slack and Gmail are the primary channels where scope creep originates | If most scope creep comes from video calls or WhatsApp, the integrations lose value |
| Developers want AI to draft change orders (not just flag alerts) | If developers prefer to write their own change orders, the AI generation feature is a distraction |
| Clients will approve change orders via email link without friction | If clients resist the process, the core workflow breaks down |
| AI can reliably detect out-of-scope requests from unstructured messages | Low AI accuracy would destroy user trust and lead to churn |
| Original scope can be meaningfully extracted from PDFs and text | Poorly written scope documents may produce poor AI results |

---

## 8. Risks and Open Questions

### Top 5 Product Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Gmail OAuth verification delay** — Google's sensitive scope review takes 2–6 weeks and may be rejected, delaying the Gmail integration | High | High | Apply for Google OAuth verification immediately; build Outlook integration in parallel so there is a working email option at launch |
| 2 | **AI accuracy is insufficient** — The AI flags too many false positives (alert fatigue) or misses real out-of-scope requests (trust erosion) | Medium | High | Implement developer feedback mechanism from day one; use few-shot prompting with scope document context; set a conservative default threshold |
| 3 | **Client friction on change order approval** — Clients resist or ignore the change order process, viewing it as adversarial | Medium | High | Design the client-facing page to be transparent, professional, and non-confrontational; add a negotiation path (reject + reason); educate developers on framing change orders positively |
| 4 | **Slack app review for public distribution** — Slack may require an app review process before the ScopeAI Slack app can be installed by external workspaces | Medium | Medium | Apply for Slack app review early; consider starting with a private Slack app distributed manually to the first 20 users to bypass review |
| 5 | **Low willingness to pay at the price point** — Freelance developers may not value scope protection enough to pay $29–$49/month, especially when used to free tools | Low-Medium | High | Validate pricing with the first 10 users before enabling billing; consider a free tier with a limit of 1 project and 5 alerts/month |

### Open Questions

1. **Free tier or trial?** Should ScopeAI offer a free plan (limited features) or a time-limited free trial (full features, 14 days)? This affects acquisition strategy significantly.
2. **Change order legally binding?** Should ScopeAI's change orders include explicit legal language making them binding? Or is this out of scope for MVP?
3. **Scope document quality baseline:** What guidance should ScopeAI provide to help developers write better scope definitions that produce more accurate AI results?
4. **Multi-seat teams:** At what point does adding team collaboration (shared projects, shared alerts) become a top user request? This could accelerate v2 priority.
5. **Pricing tiers:** Should pricing be based on number of projects, number of alerts, number of change orders, or flat-rate per seat?

---

## 9. Out of Scope for MVP

| Feature | Rationale for Deferral |
|---|---|
| **Mobile app (iOS/Android)** | Adds significant build time; primary use case (reviewing alerts and sending change orders) works well on desktop |
| **Multi-seat / team accounts** | Adds auth complexity; primary persona is solo developer at MVP |
| **Microsoft Teams integration** | Lower demand than Slack among freelance developer audience; add post-validation |
| **Discord integration** | Niche use case for MVP; evaluate based on user requests |
| **WhatsApp or SMS monitoring** | Requires carrier integration or third-party service; scope and compliance complexity |
| **Voice/video call monitoring** | Technically complex; most scope creep occurs in written communication |
| **Native invoicing / billing for clients** | FreshBooks, HubSpot, and others solve this; ScopeAI should integrate rather than replace |
| **AI model fine-tuning on user data** | Requires significant training data and infrastructure; use few-shot prompting at MVP |
| **Public API for third-party integrations** | Build direct integrations first; API access is a v2 growth lever |
| **Zapier / Make integration** | Evaluate after core integrations are validated |
| **Custom domain for client approval pages** | Nice branding touch; not essential for MVP functionality |
| **Multi-language support** | English-first at MVP; expand based on user geography post-launch |
| **Proposal generation** | Adjacent feature; valuable but separate from scope protection core workflow |
| **Contract generation** | Legal complexity; out of scope for an engineering-focused tool |

---

*End of ScopeAI Product Requirements Document v1.0*
*Date: June 28, 2026*
