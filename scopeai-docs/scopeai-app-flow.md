# App Flow Document
## ScopeAI — AI Scope Guard for Freelance Developers

**Version:** 1.0
**Date:** June 28, 2026
**Status:** Draft
**Author:** Generated for @saifbuilds

---

## Table of Contents

1. [Onboarding Flow (Developer)](#1-onboarding-flow-developer)
2. [Authentication Flows](#2-authentication-flows)
3. [Main Dashboard](#3-main-dashboard)
4. [Project Management Flow](#4-project-management-flow)
5. [Integration Management Flow](#5-integration-management-flow)
6. [Scope Alert Flow](#6-scope-alert-flow)
7. [Change Order Flow](#7-change-order-flow)
8. [Client Change Order Approval Flow](#8-client-change-order-approval-flow)
9. [Audit Trail and History](#9-audit-trail-and-history)
10. [Billing and Subscription Flow](#10-billing-and-subscription-flow)
11. [Settings Flow](#11-settings-flow)
12. [Edge Cases and Error States](#12-edge-cases-and-error-states)

---

## Notation Guide

- **Screen:** A distinct page or view the user sees
- **Action:** Something the user does (click, type, submit)
- **State:** A condition of the UI or data (empty, loading, error, success)
- **→** Means "leads to"
- **[ASSUMPTION]** marks decisions made without explicit specification

---

## 1. Onboarding Flow (Developer)

### Entry Point
New developer signs up for the first time and lands on the onboarding wizard.

---

### Screen 1.0 — Landing Page

**What the user sees:**
- Marketing headline, value proposition, social proof
- Two CTAs: "Start Free Trial" and "Sign In"

**Actions:**
- Click "Start Free Trial" → Screen 2.1 (Sign Up)
- Click "Sign In" → Screen 2.3 (Sign In)

---

### Screen 1.1 — Onboarding Wizard: Welcome

**Triggered:** Immediately after first-time sign-up and email verification.

**What the user sees:**
- "Welcome to ScopeAI, [Name]." heading
- Brief one-sentence description of what ScopeAI does
- Progress indicator: Step 1 of 5
- A "Let's get started" button
- A "Skip setup, take me to the dashboard" link (skip option)

**Actions:**
- Click "Let's get started" → Screen 1.2
- Click "Skip setup" → Dashboard (Screen 3.1, empty state)

---

### Screen 1.2 — Onboarding Step 1: Connect Slack

**What the user sees:**
- Step 1 of 5 progress indicator
- Heading: "Connect your Slack workspace"
- Subtext: "ScopeAI will monitor messages from clients in selected Slack channels."
- "Connect Slack" button (initiates OAuth)
- "Skip for now" link

**Actions:**
- Click "Connect Slack" → Browser redirects to Slack OAuth authorization page
  - **Success:** Slack redirects back to `/api/integrations/slack/callback` → integration saved → Screen 1.2 updates to show "Slack Connected ✓" with workspace name
  - **Error (user denies permission):** Returns to Screen 1.2 with an inline error: "Slack connection was cancelled. You can try again or skip this step."
  - **Error (OAuth failure):** Returns to Screen 1.2 with: "Something went wrong connecting Slack. Please try again."
- After successful Slack connection: "Next" button appears → Screen 1.3
- Click "Skip for now" → Screen 1.3

---

### Screen 1.3 — Onboarding Step 2: Connect Email

**What the user sees:**
- Step 2 of 5 progress indicator
- Heading: "Connect your email"
- Two options displayed as cards:
  - "Connect Gmail" button
  - "Connect Outlook" button
- Subtext: "ScopeAI will monitor emails from your client's email address."
- "Skip for now" link

**Actions:**
- Click "Connect Gmail" → Browser redirects to Google OAuth authorization page
  - **Success:** Returns to Screen 1.3 with "Gmail Connected ✓" and email address shown
  - **Error (user denies):** Inline error: "Gmail connection was cancelled. Try again or connect Outlook instead."
  - **Error (OAuth failure):** Inline error with retry option
- Click "Connect Outlook" → Browser redirects to Microsoft OAuth authorization page
  - **Success:** Returns to Screen 1.3 with "Outlook Connected ✓" and email address shown
  - **Error:** Same pattern as Gmail error
- Can connect both Gmail and Outlook [ASSUMPTION]
- After at least one email connected: "Next" button appears → Screen 1.4
- Click "Skip for now" → Screen 1.4

---

### Screen 1.4 — Onboarding Step 3: Create First Project

**What the user sees:**
- Step 3 of 5 progress indicator
- Heading: "Create your first project"
- Form fields:
  - Project name (required) — text input
  - Client name (required) — text input
  - Client email (required) — email input
- "Create Project" button
- "Skip for now" link

**States:**
- **Validation error:** Inline errors on empty required fields
- **Loading:** Button shows spinner while saving

**Actions:**
- Fill form + click "Create Project"
  - **Success:** Project created → Screen 1.5
  - **Error (duplicate email/name):** Inline error: "A project with this client already exists."
- Click "Skip for now" → Dashboard (Screen 3.1, empty state — no projects)

---

### Screen 1.5 — Onboarding Step 4: Define Scope

**What the user sees:**
- Step 4 of 5 progress indicator
- Heading: "Define your project scope for [Project Name]"
- Subtext: "This is what ScopeAI will use to detect out-of-scope requests. The more detailed, the better."
- Two tabs: "Type manually" (default) | "Upload document"

**Tab A — Type Manually:**
- Large text area with placeholder: "Describe everything included in this project: features, deliverables, pages, integrations, and anything explicitly excluded..."
- Character count / token estimate
- "Save Scope" button

**Tab B — Upload Document:**
- Drag-and-drop zone or "Choose file" button
- Accepted formats: PDF, DOCX
- Max file size: 10 MB [ASSUMPTION]
- After file selected: file name shown with a "Remove" option
- "Upload and Extract" button

**States:**
- **Empty text area + submit:** Inline error: "Please enter your project scope before continuing."
- **File uploading:** Progress bar with "Extracting text from document..."
- **File parse error:** "We couldn't read this file. Try a different file or paste your scope manually."
- **Success (either tab):** Brief confirmation: "Scope saved." → "Next" button appears

**Actions:**
- Save scope (text or upload) → Screen 1.6
- Click "Skip for now" → Screen 1.6 (scope left empty — warning shown)

---

### Screen 1.6 — Onboarding Step 5: Select Monitored Sources

**What the user sees:**
- Step 5 of 5 progress indicator
- Heading: "Tell ScopeAI where to watch for [Client Name]'s messages"
- **Slack section** (if Slack was connected):
  - List of channels from the connected workspace (fetched from Slack API)
  - Checkbox per channel with channel name
  - Search/filter channels input
  - "No channels found" empty state if workspace has no public channels
- **Email section** (if Gmail/Outlook was connected):
  - The connected email address is shown
  - Input field: "Client's email address to monitor" (pre-filled with client email from Step 3)
  - Developer can add multiple client email addresses [ASSUMPTION]
- If neither Slack nor email was connected: Warning banner: "You haven't connected any integrations yet. ScopeAI won't be able to monitor messages until you do. You can connect them from Settings > Integrations."
- "Finish Setup" button

**States:**
- **No sources selected (at least one integration connected):** Warning: "Select at least one channel or confirm the email address to enable monitoring."
- **Loading channels from Slack:** Skeleton list while fetching

**Actions:**
- Select channels / confirm email → Click "Finish Setup" → Screen 1.7

---

### Screen 1.7 — Onboarding Complete

**What the user sees:**
- Full-screen success state
- Heading: "ScopeAI is now watching [Project Name]"
- Summary of what was set up:
  - ✓ Connected: [Slack workspace name] (or "Not connected")
  - ✓ Connected: [Gmail/Outlook address] (or "Not connected")
  - ✓ Scope defined (or "No scope defined — add one from your project settings")
  - ✓ Monitoring: [N channels] and [client email]
- CTA: "Go to Dashboard" button

**Actions:**
- Click "Go to Dashboard" → Screen 3.1 (Dashboard, newly active state)

---

## 2. Authentication Flows

### Screen 2.1 — Sign Up (Email/Password)

**What the user sees:**
- "Create your ScopeAI account" heading
- Fields: Full name, Email address, Password (min 8 characters)
- "Create Account" button
- "Or continue with Google" button
- "Already have an account? Sign in" link

**Actions:**
- Fill form + click "Create Account"
  - **Validation errors:** Inline — invalid email format, password too short
  - **Email already registered:** "An account with this email already exists. Sign in instead?"
  - **Success:** Account created → Email verification sent → Screen 2.2

---

### Screen 2.2 — Email Verification

**What the user sees:**
- "Check your email" heading
- "We sent a verification link to [email]. Click it to activate your account."
- "Resend verification email" link (rate-limited: 1 resend per 60 seconds)
- "Wrong email? Sign up again" link

**States:**
- **Resend clicked:** Button disabled for 60 seconds; "Email resent" toast shown
- **Verification link clicked (in email):** Browser opens verification URL → account marked verified → redirect to onboarding wizard (Screen 1.1)
- **Verification link expired:** "This link has expired. Request a new one." with a "Resend" button

---

### Screen 2.3 — Sign In (Email/Password)

**What the user sees:**
- "Sign in to ScopeAI" heading
- Fields: Email address, Password
- "Sign In" button
- "Forgot password?" link
- "Or continue with Google" button
- "Don't have an account? Sign up" link

**Actions:**
- Fill form + click "Sign In"
  - **Invalid credentials:** "Incorrect email or password." (no differentiation for security)
  - **Unverified email:** "Please verify your email before signing in. Resend verification?"
  - **Rate limited (5 failed attempts):** "Too many attempts. Try again in 15 minutes."
  - **Success:** Redirect to Dashboard (Screen 3.1)

---

### Screen 2.4 — Sign In / Sign Up (Google OAuth)

**What the user sees:** (same button on both sign-up and sign-in screens)
- Clicking "Continue with Google" opens Google OAuth consent screen

**Actions:**
- **New user (email not in system):** Account created → email verified automatically → redirect to onboarding wizard (Screen 1.1)
- **Existing user:** Session created → redirect to Dashboard (Screen 3.1)
- **User denies Google permission:** Returns to sign-in/up page with: "Google sign-in was cancelled."

---

### Screen 2.5 — Forgot Password

**What the user sees:**
- "Reset your password" heading
- Email address field
- "Send Reset Link" button

**Actions:**
- Enter email + click "Send Reset Link"
  - **Any email (registered or not):** "If an account exists for [email], you'll receive a reset link shortly." (no email enumeration)
  - Email received → click link → Screen 2.6

---

### Screen 2.6 — Reset Password

**What the user sees:**
- "Set a new password" heading
- New password field (min 8 characters)
- Confirm new password field
- "Reset Password" button

**States:**
- **Expired or invalid link:** "This reset link has expired or is invalid. Request a new one." with link back to Screen 2.5
- **Success:** "Password updated. Sign in with your new password." → redirect to Screen 2.3

---

### Screen 2.7 — Session Expiry

**What the user sees:**
- Modal overlay on any authenticated page: "Your session has expired. Please sign in again."
- "Sign In" button

**Actions:**
- Click "Sign In" → current page URL saved → redirect to Screen 2.3 → after login, redirect back to original page

---

## 3. Main Dashboard

### Screen 3.1 — Dashboard (Return Visit)

**What the user sees:**
- **Top navigation / sidebar:**
  - ScopeAI logo
  - Navigation items: Dashboard, Projects, Alerts, Change Orders, Integrations, Settings
  - Unread alert count badge on "Alerts" nav item
  - User avatar / account dropdown in top-right
- **Dashboard body:**
  - Summary cards row:
    - "Open Alerts" — count of unreviewed alerts across all projects
    - "Pending Change Orders" — count of sent but not yet decided COs
    - "Active Projects" — count of active (non-archived) projects
    - "Total Recovered This Month" — sum of approved change order values [ASSUMPTION: shown as $0 until first approval]
  - "Recent Alerts" section — last 5 unreviewed alerts as cards (project name, message preview, time)
  - "Recent Change Orders" section — last 5 change orders with status badges
  - "Projects" section — all active projects as cards (name, client, open alert count, pending CO count)

**Empty State (no projects yet):**
- "You don't have any projects yet."
- CTA: "Create your first project" button → Project creation flow (Screen 4.1)
- Secondary: "Complete your setup" if onboarding was skipped

**Actions:**
- Click alert card → Screen 6.2 (Alert Detail)
- Click change order card → Screen 7.3 (Change Order Detail)
- Click project card → Screen 4.2 (Project Detail)
- Click "Create your first project" → Screen 4.1
- Click any nav item → respective section

---

## 4. Project Management Flow

### Screen 4.1 — Create New Project

**Triggered from:** Dashboard "Create project" button, Projects list "New Project" button.

**What the user sees:**
- Modal or dedicated page: "Create a New Project"
- Fields:
  - Project name (required)
  - Client name (required)
  - Client email (required, validated as email)
  - Notes / description (optional, not used for scope analysis)
- "Create Project" button
- "Cancel" button

**States:**
- **Validation errors:** Inline field errors
- **Loading:** Button spinner
- **Success:** Project created → redirect to Screen 4.2 (Project Detail) with a prompt to add scope

**Actions:**
- Submit valid form → Project created → Screen 4.2 (with "Define your scope" prompt banner)
- Cancel → back to previous screen

---

### Screen 4.2 — Project Detail Page

**What the user sees:**
- Project name as heading
- Client name and email shown below
- Tab navigation:
  - **Alerts** (default tab) — list of scope alerts for this project
  - **Change Orders** — list of change orders for this project
  - **Scope** — current scope definition with edit option
  - **Sources** — monitored Slack channels and email addresses
  - **History** — audit log for this project
- Action buttons: "Edit Project", "Archive Project"
- If no scope defined: Banner "No scope defined — ScopeAI can't detect out-of-scope requests yet. Add your scope."

**Alerts Tab:**
- Same layout as Screen 6.1 but filtered to this project

**Change Orders Tab:**
- Same layout as CO list but filtered to this project

**Scope Tab:**
- Displays current scope text with "Edit Scope" button
- Shows scope version number and last updated date
- "View Version History" link → scope version history view (Screen 4.5)

**Sources Tab:**
- Lists all monitored Slack channels linked to this project (with integration name)
- Lists all monitored client email addresses
- "Add Slack channel" button (opens channel selector if Slack is connected)
- "Add email address" button (opens input to add a client email)
- Remove button (×) per source

**History Tab:**
- Project-scoped audit log (see Section 9)

**Actions:**
- Click "Edit Project" → inline edit of project name, client name, client email → save → updates
- Click "Archive Project" → confirmation modal → "Archive this project? Monitoring will stop." → confirm → project archived; redirect to Projects list
- Click "Edit Scope" → Screen 4.3
- Click "Add Slack channel" → channel picker modal (Screen 5.3)
- Click "Add email address" → inline input for email address → add → source saved

---

### Screen 4.3 — Edit Scope

**What the user sees:**
- Full page or large modal: "Edit Project Scope"
- Current scope text in editable text area (pre-populated)
- "Upload new document" option (replaces current scope with extracted text from new file)
- "Save Scope" button
- "Cancel" button
- Warning: "Editing your scope will create a new version. All future alerts will use the updated scope."

**States:**
- **Loading (saving):** Button spinner
- **Success:** "Scope updated." toast → new scope version created → redirects back to Project Detail > Scope tab
- **Upload error:** "Could not extract text from this file. Try another file or paste your scope manually."

---

### Screen 4.4 — Projects List Page

**What the user sees:**
- Heading: "Projects"
- "New Project" button (top right)
- Filter tabs: "Active" | "Archived"
- Project cards, each showing:
  - Project name
  - Client name
  - Open alerts count
  - Pending change orders count
  - Last activity date
  - Quick action: "View" button

**Empty State (Active tab):**
- "No active projects. Create your first project to get started." + "New Project" button

**Empty State (Archived tab):**
- "No archived projects."

**Actions:**
- Click project card or "View" → Screen 4.2
- Click "New Project" → Screen 4.1

---

### Screen 4.5 — Scope Version History

**What the user sees:**
- Heading: "Scope Version History — [Project Name]"
- List of scope versions, newest first:
  - Version number
  - Date and time updated
  - Source type (manual / PDF upload / DOCX upload)
  - "View" button per version
- "Back to Project" link

**Actions:**
- Click "View" on a version → modal showing the full scope text for that version (read-only)

---

## 5. Integration Management Flow

### Screen 5.1 — Integrations Overview

**Route:** `/settings/integrations`

**What the user sees:**
- Heading: "Integrations"
- Three integration cards:
  - **Slack** — status: Connected / Not Connected; workspace name if connected
  - **Gmail** — status: Connected / Not Connected; email address if connected
  - **Outlook** — status: Connected / Not Connected; email address if connected
- Each card has: connect/reconnect button, disconnect button (if connected), status indicator

**States per card:**
- **Not Connected:** Gray status dot; "Connect" button
- **Connected (Active):** Green status dot; "Connected as [name]"; "Disconnect" button
- **Error / Expired:** Red status dot; "Reconnection required"; "Reconnect" button + warning: "This integration is disconnected. Messages from this source are not being monitored."

---

### Screen 5.2 — Connect Slack (OAuth Flow)

**Triggered from:** "Connect" button on Slack integration card (Screen 5.1) or Step 1 of onboarding.

1. Developer clicks "Connect Slack"
2. Browser redirects to Slack's OAuth authorization page (`https://slack.com/oauth/v2/authorize`)
3. Slack shows the developer which permissions ScopeAI is requesting
4. **Developer approves →** Slack redirects to `/api/integrations/slack/callback?code=...`
5. Backend exchanges code for access token; saves to `integrations` table (encrypted)
6. Browser redirects to Screen 5.1 with success toast: "Slack workspace '[Name]' connected."
7. **Developer denies →** Redirect to Screen 5.1 with error: "Slack connection was cancelled."
8. **OAuth error →** Redirect to Screen 5.1 with error: "Slack connection failed. Please try again."

---

### Screen 5.3 — Slack Channel Selector (Modal)

**Triggered from:** "Add Slack channel" on Project Sources tab.

**What the user sees:**
- Modal: "Select Slack Channels to Monitor"
- "For project: [Project Name]" subheading
- Search input to filter channels
- List of available channels from connected workspace (checkboxes)
- Already-monitored channels shown as checked and disabled
- "Add Selected Channels" button
- "Cancel" button

**States:**
- **Loading channels:** Skeleton list
- **No channels available:** "No channels found in your workspace."
- **Slack not connected:** "Connect Slack first to select channels." with link to integrations

**Actions:**
- Select channels + click "Add" → channels added to monitored sources → modal closes; Sources tab updates
- Cancel → modal closes, no change

---

### Screen 5.4 — Connect Gmail (OAuth Flow)

**Triggered from:** "Connect" button on Gmail card or Step 2 of onboarding.

1. Developer clicks "Connect Gmail"
2. Browser redirects to Google OAuth consent screen
3. Google shows scopes being requested (`gmail.readonly`) and [ASSUMPTION: verification warning for unverified apps shown to users outside the test user list]
4. **Developer approves →** Redirects to `/api/integrations/gmail/callback`
5. Backend stores encrypted tokens; sets up Gmail push notification watch
6. Redirect to Screen 5.1 with success toast: "Gmail account '[email]' connected."
7. **Developer denies / error →** Screen 5.1 with inline error

---

### Screen 5.5 — Connect Outlook (OAuth Flow)

**Triggered from:** "Connect" button on Outlook card or Step 2 of onboarding.

Same OAuth flow pattern as Gmail (Screen 5.4), using Microsoft identity platform (`login.microsoftonline.com`).

After backend saves tokens: Microsoft Graph webhook subscription is created for the user's inbox. Redirect to Screen 5.1 with success toast: "Outlook account '[email]' connected."

---

### Screen 5.6 — Disconnect Integration

**Triggered from:** "Disconnect" button on an integration card.

**What the user sees:**
- Confirmation modal: "Disconnect [Slack / Gmail / Outlook]?"
- Warning: "ScopeAI will stop monitoring messages from this integration. Any projects using it will no longer receive alerts from this source. This does not affect your existing alerts or change orders."
- "Disconnect" button (destructive style)
- "Cancel" button

**Actions:**
- Confirm disconnect → backend revokes OAuth token; marks integration as disconnected; cancels Gmail/Outlook webhook subscriptions → modal closes; integration card shows "Not Connected"
- Cancel → modal closes, no change

---

### Screen 5.7 — Re-authenticate Expired Integration

**Triggered from:** Automatic detection of expired/revoked token during webhook processing, OR developer clicking "Reconnect" on an error-state integration card.

**What the user sees:**
- In-app banner (persistent, visible on all pages): "[Slack/Gmail/Outlook] needs to be reconnected. Some messages may not be monitored." + "Reconnect Now" link
- Email notification sent to developer (if email notifications enabled)

**Actions:**
- Click "Reconnect Now" → same OAuth flow as initial connection (Screen 5.2, 5.4, or 5.5)
- Successful reconnect → banner dismissed; integration status returns to Active

---

## 6. Scope Alert Flow

### Screen 6.1 — Alerts Dashboard

**Route:** `/alerts` or `/projects/[id]` > Alerts tab

**What the user sees:**
- Heading: "Alerts"
- Filter controls:
  - Project dropdown (All Projects or specific project)
  - Status tabs: "Needs Review" (default) | "Snoozed" | "Dismissed" | "Confirmed"
  - Date range filter
- Alert list — each alert card shows:
  - Project name + colored dot
  - Source badge: Slack channel name or email address
  - Message preview (first 120 characters)
  - AI classification badge: "Out of Scope" or "Needs Review" (Unclear)
  - Confidence badge: High / Medium / Low
  - Time received (relative: "2 hours ago")
  - Quick actions: "Dismiss" | "Confirm" buttons (inline on card)

**Empty State — "Needs Review" tab:**
- Icon + "No alerts right now."
- Subtext: "ScopeAI is watching your projects. Alerts will appear here when a client message falls outside your scope."

**Empty State — no projects set up:**
- "Create a project and connect your integrations to start monitoring."

**Badge on nav:** Alert count badge updates in real time via SSE (or 30-second polling fallback).

**Actions:**
- Click alert card → Screen 6.2 (Alert Detail)
- Click "Dismiss" inline → alert status → Dismissed; card removed from "Needs Review" tab
- Click "Confirm" inline → alert status → Confirmed; prompts "Generate change order?" modal → yes → Screen 7.1 | no → alert remains confirmed

---

### Screen 6.2 — Alert Detail

**Route:** `/alerts/[alertId]` or `/projects/[id]/alerts/[alertId]`

**What the user sees:**
- Breadcrumb: Projects > [Project Name] > Alerts > Alert #[ID]
- **Client message panel:**
  - Source: "From [Sender Name] via [Slack #channel-name / Gmail / Outlook]"
  - Timestamp
  - Full message text (scrollable if long)
- **AI analysis panel:**
  - Classification badge: "Out of Scope" or "Needs Review"
  - Confidence level: High / Medium / Low
  - AI Explanation: Plain-English reasoning (2–3 sentences)
  - Scope Excerpt: Quoted portion of the scope document the AI referenced (highlighted or in a quote block)
  - Specific flagged request: What exactly the AI identified as out-of-scope
- **Developer action panel:**
  - "Mark as In-Scope (Dismiss)" button — secondary/gray
  - "Confirm as Out-of-Scope → Generate Change Order" button — primary/color
  - "Snooze — Review Later" button — tertiary/link style
  - "Mark as False Positive" checkbox (optional feedback, can be submitted alongside dismiss)
- Status indicator (if already actioned): "You dismissed this alert on [date]" or "Change order created"

**States:**
- **Already dismissed:** "In-Scope" badge on top; actions replaced with "This alert was marked as in-scope. Undo?" link
- **Already confirmed:** "Confirmed" badge; "View Change Order" button shown

**Actions:**
- Click "Mark as In-Scope" → confirmation (are you sure?) → alert dismissed → return to alert list
- Click "Mark as False Positive" + dismiss → same as above; false positive flag recorded for AI improvement
- Click "Confirm as Out-of-Scope" → Screen 7.1 (Change Order Generator)
- Click "Snooze" → modal: "Snooze until tomorrow?" → confirm → alert status → Snoozed; disappears from "Needs Review" until next day
- Click "Undo" (dismissed alert) → alert status → Needs Review; re-appears in list

---

### Bulk Alert Management

**What the user sees (on Screen 6.1):**
- Checkbox on each alert card (appears on hover)
- "Select All" checkbox in header
- Bulk action bar appears when ≥1 alert checked: "[N] selected" | "Dismiss All" | "Snooze All" | "Deselect"

**Actions:**
- "Dismiss All" → all selected alerts marked as in-scope → removed from Needs Review tab

---

## 7. Change Order Flow

### Screen 7.1 — Generate Change Order (from Alert)

**Triggered from:** "Confirm as Out-of-Scope → Generate Change Order" button on Screen 6.2.

**What the user sees:**
- Heading: "Generating change order…"
- Animated progress indicator (spinner or skeleton)
- Subtext: "ScopeAI is drafting a change order based on the client's request."

**States:**
- **Loading (AI generating):** Spinner shown for up to 30 seconds
- **Success:** Redirect to Screen 7.2 (Change Order Editor) with AI-generated content pre-filled
- **AI generation failure:** Error state with message: "We couldn't generate a draft automatically. You can write the change order manually." → Button: "Write Manually" → Screen 7.2 (empty form)

---

### Screen 7.2 — Change Order Editor

**Route:** `/projects/[id]/change-orders/new` (new) or `/projects/[id]/change-orders/[id]/edit` (editing draft)

**What the user sees:**
- Heading: "Change Order" with status badge: "Draft"
- **Left panel — Editor:**
  - Title field (pre-filled by AI, editable) — e.g., "Change Order: Additional Payment Integration"
  - Description field (pre-filled by AI, editable) — rich text; describes the out-of-scope work
  - Price field — currency + amount input (AI may suggest a price range [ASSUMPTION]; developer sets exact amount)
  - Timeline Impact field — text input, e.g., "+3 business days"
  - Terms field — text area with default terms [ASSUMPTION: developer sets default in Settings]
  - Expiry date — date picker, default: 7 days from today
  - "Send to:" — client name and email (pre-filled from project; editable)
  - AI-generated indicator: small "AI-drafted" badge on fields that were generated; disappears once developer edits
- **Right panel — Live Preview:**
  - Renders the change order exactly as the client will see it (the approval page)
  - Updates live as the developer types
- **Bottom action bar:**
  - "Save Draft" button (auto-save every 30 seconds as well)
  - "Preview as Client" button → opens preview in new tab (Screen 8.1 in preview mode)
  - "Send to Client" button (primary)
  - "Discard" link

**States:**
- **Auto-saving:** Small "Saving…" indicator in corner; "Saved" when complete
- **Unsaved changes on navigate away:** Browser confirmation: "You have unsaved changes. Leave anyway?"
- **Required field empty on "Send":** Inline validation — title and description are required; price is required

**Actions:**
- Edit any field → live preview updates
- Click "Save Draft" → draft saved; stays on same screen; toast: "Draft saved."
- Click "Send to Client" → sends email to client → Screen 7.3 (Change Order Detail, status: Sent)
- Click "Discard" → confirmation modal: "Discard this draft?" → confirm → draft deleted; redirect to Project Detail

---

### Screen 7.2b — Create Change Order Manually (No Alert)

**Triggered from:** "New Change Order" button on Project Detail > Change Orders tab.

Identical to Screen 7.2 but with all fields empty (no AI pre-fill). Developer writes everything from scratch. The "linked alert" association is empty.

---

### Screen 7.3 — Change Order Detail

**Route:** `/projects/[id]/change-orders/[id]`

**What the user sees:**
- Heading: "[Change Order Title]" with status badge
- Status badge options: Draft | Sent | Viewed | Approved | Rejected | Expired | Canceled
- **Status timeline:**
  - Created on [date]
  - Sent on [date] (if sent)
  - Viewed on [date] (if viewed) — tracked via pixel or link open [ASSUMPTION]
  - [Approved / Rejected / Expired] on [date]
- **Change order body:** Read-only view of all fields (title, description, price, timeline, terms, expiry)
- **Linked alert:** "Based on alert from [Slack #channel / Gmail] on [date]" with link to the original alert
- **Client info:** Name, email
- **Actions panel** (conditional on status):
  - **Draft:** "Edit Draft" button | "Send to Client" button | "Discard" link
  - **Sent / Viewed:** "Cancel Change Order" button | "Resend" button (if viewed or nearing expiry) | "Copy Approval Link" button
  - **Approved:** "View Approval" button (shows client's typed name as signature + approval date)
  - **Rejected:** "View Reason" (client's rejection message if provided) | "Create Revised Change Order" button
  - **Expired:** "Resend" button (creates a new change order copy with fresh expiry) | "Cancel" link
  - **Canceled:** No actions

---

### Screen 7.4 — Change Orders List

**Route:** `/change-orders` (global) or `/projects/[id]` > Change Orders tab

**What the user sees:**
- Heading: "Change Orders"
- Filter controls: Project dropdown, Status tabs (All / Draft / Pending / Approved / Rejected / Expired)
- Change order list — each row:
  - Title
  - Project name
  - Client name
  - Price (formatted as $X,XXX)
  - Status badge
  - Sent date or created date
  - "View" button

**Empty State:**
- "No change orders yet. Confirm an out-of-scope alert to generate your first one."

---

## 8. Client Change Order Approval Flow

### Who this serves
The client — a non-technical business owner or startup founder. They have **no ScopeAI account** and interact only through a unique link sent via email.

---

### Entry Point — Client Receives Email

**Email contents (sent by ScopeAI via Resend):**
- From: "[Developer Name] via ScopeAI" (using developer's name for recognition)
- Subject: "Change Order Request: [Change Order Title] — [Project Name]"
- Body:
  - Brief intro: "[Developer Name] has submitted a change order for your review."
  - Summary table: Title, Price, Timeline Impact
  - Large CTA button: "Review and Respond" → links to Screen 8.1
  - Footer: "This link expires on [date]. Questions? Reply to this email."

---

### Screen 8.1 — Client Change Order Approval Page

**Route:** `/co/[token]` (public, no authentication)

**What the client sees:**
- ScopeAI minimal branding (small "Powered by ScopeAI" footer — non-intrusive)
- Developer's name and project name at the top
- **Change order card:**
  - Title (bold, large)
  - Description of out-of-scope work (clear, plain language)
  - Price (formatted prominently: "$X,XXX USD")
  - Timeline impact (if specified): "Additional time: [N] days"
  - Terms (if included, in a collapsible section)
  - Expiry notice: "This change order expires on [date]"
- **Action buttons:**
  - "Approve this Change Order" (primary, green)
  - "Decline" (secondary, less prominent)

**States:**
- **Token valid, status = Sent:** Full page shown as described; first open triggers "Viewed" status update to developer
- **Token valid, status = Approved:** "This change order was approved on [date]. Thank you." — no action buttons
- **Token valid, status = Rejected:** "This change order was declined. Your developer has been notified." — no action buttons
- **Token valid, status = Canceled:** "This change order has been canceled by your developer. No action needed."
- **Token valid, but Expired:** Screen 8.4 — Expired state
- **Token invalid / not found:** Generic error: "This link is invalid or has been removed. Please contact your developer."
- **Mobile view:** Fully responsive; price and buttons prominent above the fold

---

### Screen 8.2 — Client Approves

**Triggered from:** Client clicks "Approve this Change Order" on Screen 8.1.

**What the client sees:**
- Modal or expanded section: "Approve this Change Order"
- "By typing your name below, you confirm you agree to the change order terms and authorize the additional cost of [Price]."
- Name input field (required): "Your full name"
- "Confirm Approval" button
- "Cancel" link

**States:**
- **Name field empty:** Inline error: "Please enter your name to approve."
- **Loading:** Button spinner
- **Success:** Screen 8.3 (Approval Confirmation)

**What happens in the background:**
- Change order status updated to "Approved"
- Client name recorded as digital signature in `change_order_events`
- Developer notified via in-app SSE event and email notification immediately

---

### Screen 8.3 — Approval Confirmation

**What the client sees:**
- Large checkmark ✓
- Heading: "Change Order Approved"
- Subtext: "Your approval has been recorded. [Developer Name] has been notified and will be in touch about next steps."
- "This page can be closed." message
- No further actions available

---

### Screen 8.2b — Client Rejects

**Triggered from:** Client clicks "Decline" on Screen 8.1.

**What the client sees:**
- Modal: "Decline this Change Order"
- Optional text area: "Reason for declining (optional)" — placeholder: "E.g., The price is too high, or this is already included in the original scope."
- "Confirm Decline" button
- "Cancel" link (returns to approval page)

**States:**
- **Success:** Screen 8.3b (Rejection Confirmation)

**What happens in the background:**
- Change order status → "Rejected"
- Rejection reason (if provided) saved in `change_order_events.metadata`
- Developer notified via in-app SSE and email immediately

---

### Screen 8.3b — Rejection Confirmation

**What the client sees:**
- Heading: "Change Order Declined"
- Subtext: "Your response has been recorded. [Developer Name] has been notified."
- "This page can be closed." message

---

### Screen 8.4 — Expired Change Order (Client View)

**Triggered:** Client opens a link after the change order expiry date.

**What the client sees:**
- Heading: "This Change Order Has Expired"
- Subtext: "This request is no longer active. If you still need to discuss this, please contact your developer directly."
- Developer's name shown; no email address exposed [ASSUMPTION: privacy]
- No approval or rejection buttons

---

## 9. Audit Trail and History

### Screen 9.1 — Project Audit Log

**Route:** `/projects/[id]` > History tab

**What the developer sees:**
- Heading: "Project History — [Project Name]"
- Filter controls:
  - Date range picker
  - Event type filter: All / Scope Events / Alert Events / Change Order Events / Integration Events
- Timeline list — each entry:
  - Event icon (colored by type)
  - Event description: e.g., "Scope updated to Version 2", "Alert #12 confirmed as out-of-scope", "Change Order sent to [Client Name]", "Client approved Change Order #3"
  - Actor: "You" / "AI" / "[Client Name]" / "System"
  - Timestamp (absolute)
  - Linked entity (clickable): e.g., link to the specific alert or change order referenced
- "Export" button (top right)

**Empty State:**
- "No events yet for this project."

**Actions:**
- Click event link → navigates to the related alert or change order detail page
- Click "Export" → Screen 9.2

---

### Screen 9.2 — Export Audit Log

**Triggered from:** "Export" button on Screen 9.1.

**What the developer sees:**
- Modal: "Export Project History"
- Options:
  - Format: PDF | CSV (radio selection)
  - Date range: All time (default) | Custom range
- "Export" button
- "Cancel" button

**States:**
- **Generating:** "Generating your export…" with spinner
- **Success:** File download triggers automatically; toast: "Export ready — downloading."
- **Error:** "Export failed. Please try again."

---

## 10. Billing and Subscription Flow

### [ASSUMPTION] Billing Model
- 14-day free trial, no credit card required, on a single plan [ASSUMPTION]
- After trial: $29/month (individual) or $49/month (agency, up to 5 projects) [ASSUMPTION]
- Payments via Paddle checkout overlay

---

### Screen 10.1 — Trial Banner (Logged-in, Trial Active)

**What the developer sees (persistent):**
- Top banner on all pages: "You're on a free trial — [N] days remaining. Upgrade to keep your projects monitored."
- "Upgrade Now" link → Screen 10.2

---

### Screen 10.2 — Billing / Upgrade Page

**Route:** `/settings/billing`

**What the developer sees:**
- Current plan status:
  - Trial: "Free Trial — expires [date]"
  - Active: Plan name, next billing date, amount
  - Past Due: Warning with "Update Payment Method" link
  - Canceled: "Canceled — access until [date]"
- Pricing plans (if on trial or free):
  - Plan cards with features and price
  - "Upgrade" button on each plan → initiates Paddle checkout
- If on paid plan:
  - "Cancel Subscription" link
  - "View Invoices" link → Screen 10.4
  - Payment method last 4 digits (shown via Paddle; not stored in ScopeAI)

---

### Screen 10.3 — Paddle Checkout

**Triggered from:** "Upgrade" button on Screen 10.2.

1. Paddle.js overlay opens in-browser (ScopeAI never sees card data)
2. Developer enters card details in Paddle's secure overlay
3. **Success:** Paddle sends `subscription.created` webhook → ScopeAI updates subscription status → overlay closes → Screen 10.2 updates to "Active" plan; success toast: "Subscription activated. Welcome!"
4. **Failure (card declined):** Paddle shows inline error; developer can retry
5. **Developer closes overlay without paying:** No subscription created; stays on Screen 10.2

---

### Screen 10.4 — Invoice History

**What the developer sees:**
- Table of invoices: Date | Amount | Status (Paid) | Download link
- Each invoice links to Paddle-hosted invoice PDF

---

### Screen 10.5 — Payment Failure State

**Triggered from:** Paddle `subscription.payment.failed` webhook.

**What the developer sees:**
- Persistent red banner on all pages: "Payment failed — please update your payment method to avoid losing access. You have [N] days remaining in your grace period."
- "Update Payment Method" button → opens Paddle's payment update overlay
- Email notification also sent to developer

**After grace period expires (7 days) [ASSUMPTION]:**
- Account restricted to read-only mode — no new alerts processed, integrations paused
- All pages show "Your subscription has lapsed" overlay with "Reactivate" button

---

### Screen 10.6 — Cancel Subscription

**Triggered from:** "Cancel Subscription" link on Screen 10.2.

**What the developer sees:**
- Modal: "Cancel your ScopeAI subscription?"
- Message: "Your subscription will remain active until [end of billing period date]. After that, ScopeAI will stop monitoring your projects."
- "Cancel Subscription" button (destructive)
- "Keep My Subscription" button

**Actions:**
- Confirm cancel → Paddle API cancels at period end → Screen 10.2 updates to show "Canceled — active until [date]"
- Keep subscription → modal closes, no change

---

## 11. Settings Flow

### Screen 11.1 — Profile Settings

**Route:** `/settings/profile`

**What the developer sees:**
- Fields: Full name (editable), Email address (read-only for OAuth users), Avatar upload
- "Save Changes" button

---

### Screen 11.2 — Notification Preferences

**Route:** `/settings/notifications`

**What the developer sees:**
- Toggle switches per notification type:
  - Email: New alert received
  - Email: Daily alert digest (time picker for preferred send time)
  - Email: Change order approved
  - Email: Change order rejected
  - Email: Change order expired
  - Email: Integration disconnected
  - In-app: New alert (badge + SSE push)
  - In-app: Change order status update
- "Save" button

---

### Screen 11.3 — AI Sensitivity Settings

**Route:** `/settings/ai`

**What the developer sees:**
- Heading: "Alert Sensitivity"
- Description: "Control how aggressively ScopeAI flags messages. Higher sensitivity = more alerts, including lower-confidence detections."
- Three-option radio selection:
  - **Conservative** — Only high-confidence out-of-scope flags (fewer alerts, less noise)
  - **Balanced** (default) — High and medium confidence flags
  - **Aggressive** — All flags including unclear/low-confidence (most alerts)
- Visual diagram showing what each setting catches
- "Save" button

---

### Screen 11.4 — Change Order Default Settings

**Route:** `/settings/change-orders`

**What the developer sees:**
- "Default Terms" text area — pre-populated on every new change order
- "Default Expiry" number input — days (default: 7)
- "Default Currency" dropdown
- "Save" button

---

### Screen 11.5 — Account Deletion

**Route:** `/settings/account`

**What the developer sees:**
- "Danger Zone" section at the bottom of account settings
- "Delete Account" button (red/destructive)

**Triggered from:** "Delete Account" click.

**What the developer sees:**
- Modal: "Permanently delete your account?"
- Warning: "This will permanently delete all your projects, alerts, change orders, and integrations. This cannot be undone."
- Type-to-confirm: "Type DELETE to confirm"
- "Delete My Account" button (disabled until correct text entered)
- "Cancel" button

**Actions:**
- Confirm deletion → account soft-deleted; active subscription canceled via Paddle API; all OAuth tokens revoked; session destroyed → redirect to landing page
- Cancel → modal closes

---

## 12. Edge Cases and Error States

### E-01 — Slack Message Cannot Be Analyzed (API Error)

**Scenario:** The AI analysis job fails after 3 retries (OpenAI API down, timeout, malformed response).

**What happens:**
- `ingested_messages.analysis_status` set to `'failed'`
- Developer receives in-app notification: "We couldn't analyze a message from [Slack #channel]. Review it manually."
- On alerts dashboard: A special "Manual Review Needed" card appears (distinct styling)
- Card shows the full message text with a note: "AI analysis unavailable. Review this message and decide if it's out of scope."
- Developer can manually mark as In-Scope or create a change order directly

---

### E-02 — AI Returns Inconclusive Result

**Scenario:** AI returns `classification: 'unclear'` with `confidence: 'low'`.

**What happens:**
- Alert is created and appears on the dashboard
- Alert card has a "Low Confidence" badge and distinct yellow/amber styling
- Alert detail page shows: "ScopeAI is uncertain about this request. Review the message and the AI's reasoning carefully before deciding."
- Developer can still dismiss, confirm, or snooze as normal
- If developer's AI sensitivity is set to "Conservative," this alert is suppressed (not shown) [ASSUMPTION]

---

### E-03 — Client Change Order Link Shared / Accessed Unexpectedly

**Scenario:** Client forwards the approval email, and a third party opens the link.

**What happens:**
- The link is still technically accessible (it's a public URL)
- However, the approval action requires the client to type their full name as a signature
- If the change order is already approved or rejected: the page shows a static "already decided" state — no further action possible
- [ASSUMPTION: the approval is single-use — once approved, the token cannot trigger a second approval action]
- No personally identifiable information about the developer is exposed beyond their name

---

### E-04 — Developer Loses Internet Mid-Session

**Scenario:** Developer is editing a change order draft and loses internet connection.

**What happens:**
- Auto-save attempts fail silently (with a "Save failed — check your connection" indicator)
- On reconnect: auto-save retries automatically
- If developer navigates away without saved changes: browser's built-in unload confirmation appears

---

### E-05 — Integration OAuth Token Expires Silently

**Scenario:** A Gmail or Outlook refresh token expires (e.g., user hasn't used ScopeAI in 90+ days, or user revoked access from their Google account settings).

**What happens:**
- Token refresh job (`refresh-oauth-tokens`) detects the failure
- Integration status updated to `'error'` in DB
- Developer receives in-app persistent banner: "[Gmail] needs to be reconnected." and email notification
- All monitored sources linked to this integration are paused (messages stop being ingested)
- No data is lost; re-authenticating restores all existing project/source configurations

---

### E-06 — Two Alerts Generated from the Same Client Message

**Scenario:** A webhook is delivered twice by Slack or Gmail (both services have at-least-once delivery guarantees).

**What happens:**
- The second ingestion is blocked by the UNIQUE constraint on `(project_id, provider, external_message_id)` in the `ingested_messages` table
- Background job detects the duplicate and discards it without creating a second alert
- Developer sees only one alert — no duplicate

---

### E-07 — Client Tries to Open Expired Change Order Link

**Scenario:** Client opens the approval link after the 7-day expiry.

**What happens:**
- Screen 8.4 shown: "This Change Order Has Expired"
- Developer receives no notification (they were already notified by the `expire-change-orders` scheduled job when expiry occurred)
- Developer can resend from Screen 7.3 (Change Order Detail)

---

### E-08 — Developer Sends Change Order to Wrong Client Email

**Scenario:** Developer sent the change order to an incorrect email address.

**What happens:**
- Change order status stays "Sent" (delivery confirmation from Resend is not linked to client action)
- Developer can: Cancel the change order (from Screen 7.3) → the original token is invalidated → create a new change order with the correct email
- [ASSUMPTION: no "resend to different email" option at MVP — developer must cancel and recreate]

---

### E-09 — Developer Has No Scope Defined and a Message Is Received

**Scenario:** A monitored Slack channel or email receives a message, but the project has no scope defined yet.

**What happens:**
- Message is ingested and stored in `ingested_messages`
- AI analysis job runs but detects empty scope → analysis skipped
- `analysis_status` set to `'skipped_no_scope'` [ASSUMPTION]
- Developer sees a dashboard prompt: "Project [Name] has no scope defined. Add a scope so ScopeAI can start detecting out-of-scope requests."
- The [N] unanalyzed messages are NOT retroactively analyzed when a scope is later added [ASSUMPTION: only future messages are analyzed against the new scope]

---

### E-10 — Outlook Webhook Subscription Renewal Fails

**Scenario:** The `refresh-outlook-webhooks` scheduled job fails to renew a Microsoft Graph subscription before it expires.

**What happens:**
- Microsoft stops sending webhook events for the affected subscription
- The job's failure is caught by Trigger.dev and retried; if all retries fail, an alert is logged in Sentry
- Developer receives an email and in-app notification: "Your Outlook integration needs attention. Some emails may not be monitored."
- Developer can trigger manual reconnect from Settings > Integrations (Screen 5.5), which creates a fresh webhook subscription

---

*End of ScopeAI App Flow Document v1.0*
*Date: June 28, 2026*
