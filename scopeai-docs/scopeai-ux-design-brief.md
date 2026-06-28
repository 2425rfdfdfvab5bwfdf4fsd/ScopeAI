# UI/UX Design Brief
## ScopeAI — AI Scope Guard for Freelance Developers

**Version:** 1.0
**Date:** June 28, 2026
**Status:** Draft
**Author:** Generated for @saifbuilds

---

## Table of Contents

1. [Design Goals](#1-design-goals)
2. [UX Principles](#2-ux-principles)
3. [Visual Style and Brand Direction](#3-visual-style-and-brand-direction)
4. [Color Palette](#4-color-palette)
5. [Typography](#5-typography)
6. [Design System and Components](#6-design-system-and-components)
7. [Layout and Navigation](#7-layout-and-navigation)
8. [Key Screen Requirements](#8-key-screen-requirements)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Empty States and Loading States](#10-empty-states-and-loading-states)
11. [AI UI Patterns](#11-ai-ui-patterns)

---

## 1. Design Goals

### Primary Design Goals

ScopeAI's design must accomplish three things above all else:

1. **Make the right action obvious in under 5 seconds.** A developer opening ScopeAI during a busy workday needs to see immediately what needs their attention, take one decisive action, and get back to work. Every screen should have a single clear primary action.

2. **Make the developer feel in control, not overwhelmed.** AI is doing significant work in the background. The design must make that feel like a quiet, reliable assistant — not an unpredictable black box. The developer always has the final say; the design reinforces this at every step.

3. **Make clients feel the developer is professional, not adversarial.** The client-facing change order page is a trust surface. A client who receives a well-designed, clear, professional page is far more likely to approve than one who receives something that looks like an invoice demand. The design of this page directly impacts revenue recovery.

### The Single Most Important UX Outcome — Developer

> A developer confirms a new out-of-scope alert and sends a professional change order to their client in under 2 minutes, without leaving ScopeAI.

Every design decision in the authenticated app is evaluated against this benchmark.

### The Single Most Important UX Outcome — Client

> A client opens a change order link on their phone, reads it in 30 seconds, understands exactly what they're being asked to approve and why, and approves with confidence — without friction, confusion, or distrust.

Every design decision on the public approval page is evaluated against this benchmark.

---

## 2. UX Principles

### P1 — Signal Over Noise

**Description:** Show the developer only what requires their attention. Suppress everything that doesn't.

**Applied to ScopeAI:** The alert dashboard shows only unreviewed alerts by default. In-scope messages are never surfaced. The dashboard summary cards show the smallest useful set of numbers. Notification badges are accurate and never inflated.

---

### P2 — One Primary Action Per Screen

**Description:** Every screen has one obvious next step. Secondary and tertiary actions are visually subordinate.

**Applied to ScopeAI:** On the alert detail page, "Confirm as Out-of-Scope → Generate Change Order" is the primary button. "Dismiss" is secondary. "Snooze" is a text link. On the change order editor, "Send to Client" is the one prominent CTA. This hierarchy is enforced through size, color weight, and placement — not just labels.

---

### P3 — Confidence Before Action

**Description:** Before a developer takes an irreversible action (sending a change order, dismissing an alert), give them enough context to feel confident — not anxious.

**Applied to ScopeAI:** The alert detail view shows the full original message, the AI's reasoning, and the exact scope excerpt quoted. The change order editor has a live client preview. The "Send to Client" button is not the first thing the developer sees — they review first, then send.

---

### P4 — Transparent AI

**Description:** Never hide that AI made a decision. Always show what the AI saw, what it concluded, and why. Give the developer the ability to disagree.

**Applied to ScopeAI:** AI-generated content is visually labeled. Confidence levels are displayed clearly. Developers can dismiss alerts as false positives and give feedback. The AI is framed as a recommendation engine, not an authority.

---

### P5 — Professional by Default

**Description:** ScopeAI outputs (change orders, emails) should look like they came from a senior professional, not a startup MVP. The developer should feel proud to send them.

**Applied to ScopeAI:** Change order default templates use clear, professional language. The client approval page has generous whitespace, strong typography, and a restrained color palette. Nothing about the client-facing design should feel "beta" or "early-stage."

---

### P6 — Zero Surprise

**Description:** Destructive or consequential actions always require confirmation. Status changes are always communicated. Nothing happens silently in a way that could confuse or alarm the developer.

**Applied to ScopeAI:** Archiving a project, sending a change order, disconnecting an integration — all require an explicit confirmation step. When a client approves or rejects a change order, the developer is notified immediately (not at their next login). Integration disconnections surface as persistent banners, not buried in a settings log.

---

### P7 — Fast Perceived Performance

**Description:** The app should feel fast. Use skeleton screens, optimistic UI updates, and background loading to eliminate wait states that break flow.

**Applied to ScopeAI:** Alert status changes (dismiss, confirm, snooze) are optimistically applied in the UI before the server confirms. The dashboard uses skeleton cards while data loads. The AI generation screen uses a purposeful loading animation (not a generic spinner) to set the right expectation.

---

## 3. Visual Style and Brand Direction

### Overall Aesthetic Direction

**Direction: Confident Utility**

ScopeAI's visual language is clean, data-dense where it needs to be, and restrained everywhere else. It is not minimal to the point of emptiness — it has substance and structure. It is not playful or colorful — it is professional and direct. It earns trust through precision, not personality.

The aesthetic sits between **Linear** (ruthless clarity, developer-grade precision) and **Notion** (calm density, no visual noise) — with a sharper, more decisive edge closer to Linear. It is unmistakably a tool built by a developer for developers.

**What this means in practice:**
- Dark sidebar, light content area (or full dark mode as an option)
- Tight grid, consistent spacing, no decorative elements
- Color used only to communicate meaning (status, action type, severity) — never decoration
- Monospace font used sparingly for code-adjacent data (message excerpts, scope text)
- Micro-interactions that feel native to the web, not "animated for the sake of animation"

---

### Reference Products (Mood Board Direction)

| Reference | What to Borrow |
|---|---|
| **Linear** | The ruthless information hierarchy; sidebar navigation weight; status badge design; dark/light mode execution; the sense that every pixel is intentional |
| **Vercel Dashboard** | Clean data tables; deployment status timelines; the way complex state is communicated without visual clutter |
| **Resend** | How a developer-focused product handles empty states; the confidence of monochrome with strategic color accents |
| **Clerk (auth UI)** | How auth flows can be trustworthy and fast without feeling corporate; the sign-in page as a first impression of product quality |
| **Loom (change order email)** | How a shared link from a professional tool sets expectations before the recipient even clicks |

---

### What to Avoid

- **Consumer-app patterns:** Rounded "bubbly" UI, emoji-heavy empty states, pastel gradient backgrounds, animated illustrations — none of this belongs in a tool a developer uses to protect their income
- **Enterprise bloat:** Overly complex navigation, settings pages with 40 options, modal-on-modal interactions
- **AI-washing aesthetics:** Purple gradients, "neural network" background patterns, glowing orbs — ScopeAI's AI should feel quiet and functional, not performative
- **Alert fatigue design:** Red badges everywhere, excessive warning icons, everything feeling urgent — ScopeAI must feel calm even when there are 10 unreviewed alerts
- **Low-contrast "startup chic":** Light gray text on white, hairline borders that disappear on bright monitors — prioritize legibility

---

## 4. Color Palette

### Primary Color

**Indigo / Slate Blue**

- Primary: `#4F46E5` (Indigo 600)
- Primary hover: `#4338CA` (Indigo 700)
- Primary subtle (backgrounds): `#EEF2FF` (Indigo 50)

**Rationale:** Indigo communicates professionalism, trust, and precision — aligned with developer tooling (VS Code's accent colors, Linear's brand). It avoids the aggression of pure red/orange and the coldness of pure blue. It reads as authoritative without being corporate. It works equally well on light and dark backgrounds and has excellent contrast ratios with white text (WCAG AA at all standard sizes).

---

### Secondary / Accent Color

**Slate (neutral grey-blue)**

- Used for: sidebar backgrounds, secondary text, borders, inactive states
- Slate 50: `#F8FAFC` — page backgrounds
- Slate 100: `#F1F5F9` — card backgrounds, hover states
- Slate 200: `#E2E8F0` — borders, dividers
- Slate 500: `#64748B` — secondary text, placeholder text
- Slate 700: `#334155` — primary body text (light mode)
- Slate 900: `#0F172A` — headings, sidebar background

---

### Semantic Colors

| Purpose | Color | Hex | Usage |
|---|---|---|---|
| **Success / Approved** | Emerald | `#10B981` | Approved badge, connection status active, saved state |
| **Success bg** | Emerald light | `#ECFDF5` | Success alert backgrounds |
| **Warning / Unclear** | Amber | `#F59E0B` | Low-confidence alert badge, trial expiry banner |
| **Warning bg** | Amber light | `#FFFBEB` | Warning state backgrounds |
| **Danger / Out of Scope** | Rose | `#F43F5E` | Out-of-scope alert badge, destructive action buttons, payment failure banner |
| **Danger bg** | Rose light | `#FFF1F2` | Danger state backgrounds |
| **Neutral / Dismissed** | Slate | `#94A3B8` | Dismissed alert badge, inactive states |
| **Info / AI** | Violet | `#7C3AED` | AI-generated content indicator, AI badge |
| **Info bg** | Violet light | `#F5F3FF` | AI content background tint |

---

### Background and Surface Colors (Light Mode)

| Surface | Color | Hex |
|---|---|---|
| Page background | Slate 50 | `#F8FAFC` |
| Card / panel background | White | `#FFFFFF` |
| Sidebar background | Slate 900 | `#0F172A` |
| Sidebar hover | Slate 800 | `#1E293B` |
| Input background | White | `#FFFFFF` |
| Input border | Slate 200 | `#E2E8F0` |
| Input border (focus) | Indigo 500 | `#6366F1` |

---

### Dark Mode Consideration

**[RECOMMENDED] Dark mode in v2, not MVP.**

Rationale: The primary target audience (developers) strongly prefers dark mode, but implementing it correctly from the start adds meaningful build time for a solo developer at MVP. Attempting it poorly (color inversion, low-contrast dark surfaces) is worse than not having it.

**MVP approach:** Build the light theme to be genuinely excellent. Use the dark sidebar + light content layout (a common developer-tool hybrid) to partially satisfy dark mode preferences without the full implementation cost. Add full dark mode as the first v2 design feature.

---

## 5. Typography

### Font Family

**Primary: Inter**

- Source: Google Fonts (free) or Fontsource npm package
- Usage: All UI text — headings, body, labels, buttons
- Rationale: Inter is the de facto standard for developer-facing SaaS tools (Linear, Vercel, Resend, Clerk). It renders exceptionally well at all sizes on screen, was designed specifically for UI (not print), and carries no stylistic personality that would conflict with ScopeAI's professional tone. It is immediately recognizable as "serious software."

**Secondary: JetBrains Mono**

- Usage: Code-adjacent text only — message excerpts from Slack/email, scope document text previews, audit log event metadata
- Rationale: Using a monospace font for client message content visually separates "raw data" (what the client said) from "UI" (what ScopeAI is telling the developer). This reinforces the cognitive model: the message is evidence; the surrounding UI is ScopeAI's analysis.

---

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `heading-xl` | 30px / 1.875rem | 700 (Bold) | 1.2 | Page titles (Dashboard heading) |
| `heading-lg` | 24px / 1.5rem | 700 (Bold) | 1.25 | Section headings, modal titles |
| `heading-md` | 20px / 1.25rem | 600 (Semibold) | 1.3 | Card headings, subsection titles |
| `heading-sm` | 16px / 1rem | 600 (Semibold) | 1.4 | Table headers, group labels |
| `body-lg` | 16px / 1rem | 400 (Regular) | 1.6 | Primary body text, form instructions |
| `body-md` | 14px / 0.875rem | 400 (Regular) | 1.5 | Secondary body, card descriptions |
| `body-sm` | 13px / 0.8125rem | 400 (Regular) | 1.5 | Timestamps, metadata, help text |
| `label` | 12px / 0.75rem | 500 (Medium) | 1.4 | Form labels, badge text, nav labels |
| `mono-md` | 14px / 0.875rem | 400 (Regular) | 1.6 | Message excerpts, scope text |
| `mono-sm` | 13px / 0.8125rem | 400 (Regular) | 1.5 | Audit log entries, code snippets |

---

### Font Weight Usage

| Weight | Usage |
|---|---|
| 400 — Regular | Body text, descriptions, secondary content |
| 500 — Medium | Navigation items, form labels, slightly emphasized UI text |
| 600 — Semibold | Subheadings, button text, card titles |
| 700 — Bold | Page headings, alert titles, prices on change orders |

---

### Spacing and Line Height Recommendations

- **Paragraph spacing:** 1.5× body font size between paragraphs
- **Heading margin-bottom:** 0.75rem before the content that follows
- **Section spacing:** 2rem between distinct content sections on a page
- **Card padding:** 24px (1.5rem) on desktop; 16px (1rem) on mobile
- **Form field spacing:** 20px (1.25rem) between field groups

---

## 6. Design System and Components

### Component Library

**[RECOMMENDED] shadcn/ui**

**Why shadcn/ui for ScopeAI:**
- Not a component library in the traditional sense — it is a collection of unstyled, composable primitives that are copied into the project as source code, giving full control over every pixel
- Built on Radix UI primitives (accessible, keyboard-navigable, WAI-ARIA compliant by default)
- Native Next.js + Tailwind CSS integration — zero configuration
- The visual output is modern and neutral — easy to match ScopeAI's aesthetic without fighting the library's default personality
- No vendor lock-in, no bundle size from unused components, no breaking upgrades
- Widely used in the developer ecosystem — familiar to anyone who might read or contribute to the codebase

**Alternative considered:** Chakra UI — rejected because the default visual style is distinctly "startup-ish" and requires significant overriding to achieve ScopeAI's tone.

---

### Core Components to Design/Customize First

Priority order for the MVP build:

| Priority | Component | Notes |
|---|---|---|
| 1 | **Alert Card** | The most-seen component; used on every dashboard visit |
| 2 | **Status Badge** | Used everywhere — alerts, change orders, integrations |
| 3 | **Sidebar Navigation** | Sets the visual tone for the entire authenticated app |
| 4 | **Data Table** | Used for change orders list, audit log |
| 5 | **Button variants** | Primary, secondary, destructive, ghost — all needed |
| 6 | **Modal / Dialog** | Used for confirmations, channel selectors |
| 7 | **Form components** | Input, textarea, select, file upload — used throughout |
| 8 | **Toast / Notification** | System feedback after every action |
| 9 | **Change Order Card** | Client-facing — highest trust requirement |
| 10 | **AI Analysis Panel** | Unique to ScopeAI — needs custom design |
| 11 | **Empty State** | Multiple variants needed (no projects, no alerts, etc.) |
| 12 | **Progress / Wizard Step indicator** | Onboarding flow |

---

### Icon Set

**[RECOMMENDED] Lucide React**

- Reason: Default icon set for shadcn/ui; consistent 24px grid; clean, geometric strokes; MIT license; excellent TypeScript types
- Usage: 20px icons for navigation and inline UI; 16px for badge/label contexts; 24px for feature illustrations in empty states
- Do not mix icon sets — Lucide only, for visual consistency

---

### Data Display Components

**Alert list:** Cards with left-colored border (color = classification severity) are preferred over plain rows. The colored left border is a familiar pattern from Slack, Linear, and GitHub that communicates status at a glance without requiring a badge scan.

**Change order status:** Pill badges with semantic colors (see Color Palette section). Status text is always sentence-case ("Approved" not "APPROVED").

**Confidence levels:**

| Confidence | Badge Color | Badge Text |
|---|---|---|
| High | Emerald | High Confidence |
| Medium | Amber | Medium Confidence |
| Low | Rose | Low Confidence |
| Unclear | Violet | AI Uncertain |

**Audit log:** Timeline layout (vertical line with event dots) preferred over a flat table — it communicates chronology more naturally and feels less like a spreadsheet.

**Prices:** Always displayed with currency symbol, comma-formatted, 2 decimal places. Large price display (on change order approval page): bold, 24px+, Slate 900. Never display "0.00" — show "—" if no price set.

---

## 7. Layout and Navigation

### Navigation Pattern

**[RECOMMENDED] Fixed left sidebar (desktop) + top bar**

Rationale:
- The developer will switch frequently between sections (Alerts → Projects → Change Orders) during a single work session — sidebar allows one-click access without losing context
- Matches the navigation pattern of the tools developers use daily (Linear, GitHub, Vercel, Notion) — zero learning curve
- Sidebar provides space for project-level quick navigation as the developer scales to multiple projects
- Top bar handles: user account, global search (v2), notification bell

**Sidebar structure:**

```
─────────────────────
  ScopeAI logo
─────────────────────
  Dashboard
  Alerts          [N]   ← unread badge
  Change Orders
  Projects
─────────────────────
  Integrations
  Settings
─────────────────────
  [User avatar]
  [Plan badge]
─────────────────────
```

**Sidebar widths:**
- Expanded: 240px
- Collapsed (icon-only): 64px — collapse trigger is a toggle icon at the bottom; state persisted in localStorage

**Mobile (< 768px):** Sidebar hidden; hamburger icon in top bar opens a slide-in drawer overlay.

---

### Dashboard Layout

**Two-column grid on desktop:**
- Left (wider): Alert list / primary content
- Right (narrower, ~320px): Summary cards, project quick-switcher

**On tablet (768px–1024px):** Single column; summary cards collapse into a horizontal scrolling row above the main content.

---

### Alert List Layout

**Card-based list (not a table)** for the alert dashboard.

Each alert card:
- Left: colored vertical border (Rose for Out-of-Scope, Amber for Unclear)
- Top row: Project name (small, Slate 500) | Source badge (Slack / Gmail / Outlook) | Confidence badge | Timestamp
- Middle: Message preview text (body-md, 2 lines max, truncated with "…")
- Bottom row: AI classification badge | Quick action buttons (Dismiss / Confirm)

Rationale for cards over table: Alert cards contain heterogeneous data (a Slack message preview is structurally different from an email subject line). Cards handle this gracefully; tables would require many empty cells or awkward column definitions.

---

### Change Order Layout

**Table-based list** for the change orders view (unlike alerts, change orders have consistent, scannable data: title, project, client, price, status, date).

Change order table columns: Title | Project | Client | Price | Status | Sent Date | Action

Change order detail page: Single-column, document-like layout — mirrors the way a professional contract is read. This is intentional — it sets the psychological expectation that this is a formal agreement.

---

### Responsive Behavior — Minimum Required Breakpoints (MVP)

| Breakpoint | Target | Required |
|---|---|---|
| 375px (mobile) | Client approval page fully functional | Yes — required at MVP |
| 768px (tablet) | Dashboard usable; sidebar collapses | Yes — required at MVP |
| 1024px (desktop) | Full layout; primary design target | Yes — required at MVP |
| 1440px (wide desktop) | Max content width capped at 1280px | Nice to have |

---

## 8. Key Screen Requirements

### Screen: Main Dashboard

**Layout direction:** Two-column on desktop — metric cards row at top, then alert list (left, wider) + project summary list (right, narrower).

**Key elements:**
- 4 summary metric cards (horizontal row): Open Alerts, Pending Change Orders, Active Projects, Revenue Recovered This Month
- "Recent Alerts" section with 5 most recent unreviewed alert cards + "View all alerts" link
- "Projects" section: project list with alert and CO counts per project

**Critical UX considerations:**
- The unread alert count on the sidebar badge and on the "Open Alerts" card must always match — inconsistency here destroys trust in the numbers
- "Revenue Recovered This Month" card should be the most visually prominent metric card — it is the core value proof point. Use a slightly larger number or accent color to draw the eye
- If there are zero open alerts: the alert section should feel calm (not empty/sad). "All clear — no alerts to review." with a checkmark, not a gray void

---

### Screen: Alert Detail View

**Layout direction:** Two-column on desktop — client message (left panel) + AI analysis + actions (right panel).

**Key elements:**
- **Left panel — Client Message:**
  - Source header: Avatar/icon for source type (Slack logo, Gmail logo, Outlook logo) + sender name + channel/address + timestamp
  - Full message text in a distinct visual container — monospace font (JetBrains Mono), slightly tinted background (Slate 50 or Indigo 50 tint) to distinguish "raw data" from ScopeAI's UI
  - Scrollable if the message is long
- **Right panel — AI Analysis:**
  - AI badge at the top: small "Analyzed by ScopeAI AI" label with the Violet AI color — makes clear this panel is AI-generated
  - Classification + confidence in a clear header
  - AI explanation in body-md text — readable, plain English
  - Scope excerpt in a quote block (left border in Indigo, italic text) — visually distinct from the AI explanation
  - Flagged request highlighted (bold or underlined within the explanation)
- **Action panel** (below or in the right column):
  - "Confirm as Out-of-Scope" — primary button (Indigo, full width of right panel)
  - "Mark as In-Scope (Dismiss)" — secondary button
  - "Snooze" — text link
  - "False positive" checkbox (small, below the buttons)

**Critical UX considerations:**
- The AI analysis panel must never feel like it is commanding the developer. Language: "ScopeAI detected this as potentially out-of-scope" — not "This is out-of-scope."
- The developer should read the message first, then the analysis. Layout order enforces this.
- On low-confidence alerts: add a soft amber banner at the top of the right panel: "ScopeAI is not confident about this flag. Review carefully."

---

### Screen: Change Order Editor

**Layout direction:** Two-panel side by side — editor (left) + live client preview (right).

**Key elements:**
- **Editor panel (left):**
  - Section labels above each field group
  - Title: text input, bold — visible in preview immediately
  - Description: textarea, rich text (bold, bullets, basic formatting) — most important field
  - Price: currency selector + number input — displayed prominently in preview
  - Timeline Impact: short text input
  - Terms: textarea, collapsed by default with "Add terms" expand trigger
  - Expiry: date picker
  - Send to: pre-filled client name + email, editable
  - AI-drafted badge: small "AI-drafted" label on fields that came from AI; disappears when developer edits that field
- **Preview panel (right):**
  - Static header: "Client will see this"
  - Renders the change order approval page in real time
  - Mobile preview toggle button (shows the 375px mobile rendering)
  - Subtle background: slightly darker than editor panel to differentiate

**Critical UX considerations:**
- Auto-save indicator ("Saving…" → "Saved 2s ago") must be visible but unobtrusive — bottom corner of the editor panel
- "Send to Client" button must be positioned below the full form — the developer should have reviewed everything before the send button comes into view
- If a required field (title, description) is empty: the send button is disabled with a tooltip explaining what is missing — do not wait for them to click and see an error

---

### Screen: Client Change Order Approval Page

**Layout direction:** Single column, centered, max-width 640px — document-like. This is the most important page to get right.

**Key elements:**
- **Header:**
  - Developer name + "via ScopeAI" in small text — personalizes it; the developer's name is the trust anchor, not ScopeAI's brand
  - Project name
  - "Change Order Request" label (not "Invoice" — softer, more collaborative framing)
- **Change order body:**
  - Title: large, bold (heading-lg), Slate 900
  - Description: body-lg, generous line height — most important section; client must read it
  - Price: very large display (28px+, Bold, Indigo or Slate 900) — with currency; never hide the price
  - Timeline impact: if present, shown as a secondary stat below price ("Timeline: +3 days")
  - Terms: collapsible section ("View terms →") — present but not front-and-center
  - Expiry notice: small, Slate 500, bottom of the body: "This request expires [date]"
- **Action section:**
  - "Approve this Change Order" — large, full-width, Emerald (green) primary button
  - "Decline" — smaller, ghost/text style below the approve button — present but not equally weighted
  - Visual separation between the two so a client doesn't accidentally decline

**Critical UX considerations:**
- This page must render flawlessly on mobile (iPhone Safari) — clients will open email links on their phone
- No ScopeAI signup CTAs, upsells, or promotional content — the client should never feel like they're being marketed to while reviewing a financial request
- The "Powered by ScopeAI" attribution should be a 12px gray footer note — present for brand awareness but never distracting
- After approval: a clean, full-page confirmation with the developer's name — "Your approval has been sent to [Developer Name]." The client should feel they've completed something, not that they've been processed by software.
- The rejection path should be easy to find but not visually equivalent to approval — declining should feel like a considered choice, not an accidental tap

---

### Screen: Project Setup / Scope Definition

**Layout direction:** Single column, focused, max-width 800px — wizard-style.

**Key elements:**
- Progress indicator at the top (step dots or numbered steps)
- Tab switcher: "Type manually" | "Upload document"
- Textarea (manual): large, minimum 200px height, monospace-adjacent styling with subtle grid lines to suggest "document entry"
- Upload zone: dashed border, centered icon + "Drop PDF or DOCX here" text + "or browse" link; clear file size limit displayed
- After file upload: file name shown with size, "Remove" button, and "Extracting text…" progress state
- Scope word/token count displayed below the textarea (developer feedback on scope completeness)
- Contextual tip below the textarea: "Tip: The more specific your scope, the more accurate ScopeAI's detection will be. Include what is explicitly excluded as well as what is included."

**Critical UX considerations:**
- This screen has the highest "activation" impact — if the developer writes a poor scope, the entire product underperforms. Invest in microcopy that guides better input.
- Do not validate scope quality (too complex for MVP); instead, use character count and completeness hints as gentle nudges

---

### Screen: Integration Connection Screen

**Layout direction:** Three cards in a row on desktop (Slack, Gmail, Outlook); stacked on mobile.

**Key elements per card:**
- Integration logo (official brand logo)
- Integration name
- Status indicator: green dot ("Connected as [name]") / gray dot ("Not connected") / red dot ("Reconnect required")
- Short description of what this integration does for ScopeAI
- Primary action button: "Connect" / "Disconnect" / "Reconnect"
- If connected: small metadata below button (e.g., "Connected [date]", workspace name or email)

**Critical UX considerations:**
- If an integration is in error state: the card border changes to Rose, and a short error message replaces the metadata line ("Disconnected — messages may be missed.")
- OAuth flows open in the same tab (not a popup) — more reliable across browsers and less likely to be blocked

---

### Screen: Onboarding Wizard

**Layout direction:** Centered, max-width 560px, full page (no sidebar during onboarding).

**Key elements:**
- ScopeAI logo at top
- Step counter: "Step 2 of 5" in small text, plus a progress bar
- Step title (heading-lg)
- Step body (instructions, max 2 short sentences)
- Primary action (e.g., "Connect Slack" button or form)
- "Skip for now" link — always present, always text link (never a button, never prominently placed)

**Critical UX considerations:**
- The onboarding wizard is the developer's first experience with the product. It must feel fast. Do not add explanatory copy that makes it feel like reading documentation.
- Each step should be completable in under 60 seconds
- Show a "You're almost done" message on Step 4 or 5 to reinforce momentum
- The completion screen ("ScopeAI is now watching your project") is a moment of psychological payoff — use it deliberately. A brief, satisfying animation or illustration here is the one place where a small emotional design touch is warranted

---

## 9. Accessibility Requirements

### Minimum Compliance Level

**WCAG 2.1 Level AA** — required for all screens including the public client approval page.

---

### Client Approval Page — Specific Requirements

The client approval page has the highest accessibility stakes because:
- The client user base is unknown — could include users with low vision, motor disabilities, or screen readers
- The page cannot require a ScopeAI account, so there is no user profile to customize from

Requirements:
- All text must meet WCAG AA contrast ratio (4.5:1 for body text, 3:1 for large text)
- "Approve" and "Decline" buttons must be visually distinct (not just color-differentiated — include distinct labels and sizes)
- The approval name input must have a visible label (not just placeholder text)
- The entire form must be completable via keyboard only
- All interactive elements must have focus rings (never `outline: none` without a replacement)
- The price must not be communicated by color alone — the currency symbol and number together carry the meaning

---

### Keyboard Navigation Requirements

- All interactive elements (buttons, links, inputs, modals) must be reachable via Tab key
- Modals must trap focus while open and return focus to the trigger element on close
- Dropdowns and select menus must be navigable with arrow keys
- The alert detail page actions (Dismiss / Confirm / Snooze) must all be triggerable by keyboard
- Custom components (file upload zone, AI sensitivity slider) must have keyboard equivalents

---

### Color Contrast Requirements

| Context | Minimum Ratio | Target |
|---|---|---|
| Body text on white | 4.5:1 | 7:1 preferred |
| Body text on Slate 50 | 4.5:1 | 6:1 preferred |
| White text on Indigo 600 (primary button) | 4.5:1 | Verify: #4F46E5 + white = 5.07:1 ✓ |
| White text on Emerald 500 (approve button) | 4.5:1 | Verify at implementation |
| Badge text on badge background | 4.5:1 | All semantic badge combos must be verified |
| Sidebar white text on Slate 900 | 4.5:1 | Passes comfortably |

**Tooling:** Use the `axe` browser extension and Vercel's accessibility checks during development. Run Lighthouse accessibility audit before launch.

---

### Additional Accessibility Considerations

- All images (icons used semantically) must have `aria-label` or `aria-hidden="true"` as appropriate
- Form errors must be announced to screen readers via `aria-live` regions
- The SSE-driven alert badge update must not announce to screen readers on every update — only when the developer is on the alerts page (use `aria-live="polite"`)
- Loading states must use `aria-busy="true"` on the container being updated

---

## 10. Empty States and Loading States

### Empty State Design Direction

Empty states in ScopeAI must never feel like failures. They are either "you haven't set this up yet" (instructional) or "everything is working and nothing needs your attention" (success).

**Tone:** Calm, direct, and action-oriented. No sad illustrations, no "Oops!" language, no excessive copy.

**Structure for every empty state:**
1. A simple icon or minimal illustration (Lucide icon at 48px, Slate 300 color — not colorful)
2. One-line heading (what is empty and why it's fine or what to do)
3. One-sentence explanation (optional, only if genuinely useful)
4. One CTA button (only when there is a clear next action)

| Screen | Empty State Heading | CTA |
|---|---|---|
| Dashboard — no projects | "Create your first project to start monitoring." | "New Project" button |
| Alerts — Needs Review (none) | "All clear — no alerts to review." | None (this is a success state) |
| Alerts — Dismissed (none) | "No dismissed alerts." | None |
| Change Orders — none | "No change orders yet. Confirm an alert to generate one." | None |
| Projects — none | "No projects. Let's fix that." | "Create project" |
| Audit Log — empty | "No events recorded yet for this project." | None |
| Integrations — none connected | "Connect Slack or email to start monitoring." | "Connect Slack" button |

---

### Loading State Patterns

**Skeleton screens** (not spinners) for all data-loaded content:

- Dashboard metric cards: rectangular skeleton blocks at the size of the cards
- Alert list: 3–4 skeleton alert card outlines (gray rounded rectangles, subtle pulse animation)
- Change order list: skeleton table rows
- Audit log: skeleton timeline entries

**Spinners** reserved for:
- Button loading states (the button itself shows a spinner while the action is processing)
- The AI generation loading screen (full-page loading state with intentional copy: "ScopeAI is analyzing the request and drafting your change order…")
- File upload progress

**Skeleton animation:** CSS pulse animation (`opacity: 1 → 0.5 → 1`, 1.5s ease-in-out, infinite) — not a shimmer effect (shimmer adds visual complexity for no additional clarity).

---

### Error State Design Direction

**Page-level errors (network failure, server error):**
- Inline error message in the content area — not a full-page takeover
- Icon (Lucide `AlertTriangle`, Rose color) + error message + "Try again" button
- Message: specific where possible ("Could not load your alerts — check your connection.") not generic ("Something went wrong.")

**Form validation errors:**
- Inline, below the field
- Rose 500 text
- `aria-live` region for screen reader announcement

**Integration error states:**
- Persistent banner at the top of the content area (not a modal)
- Never block the user from using the rest of the app

---

## 11. AI UI Patterns

### Distinguishing AI-Generated Content from Developer-Authored Content

**In the Change Order Editor:**
- Fields pre-filled by AI display a small "AI-drafted" label to the top-right of the field label, in Violet (#7C3AED), with a small sparkle or magic-wand icon (16px)
- Once a developer clicks into a field and changes the content, the "AI-drafted" label disappears — the content is now the developer's
- This communicates: "The AI gave you a starting point; you're in charge of the final version."

**In the Audit Log:**
- AI actions are attributed as "AI" with a distinct icon (robot-head or sparkle) — distinct from "You" (developer) and "[Client Name]" (client)

---

### Displaying Scope Detection Confidence Levels

**In alert cards (list view):**
- Confidence displayed as a colored pill badge (see Color Palette > Semantic Colors)
- Position: top-right of the alert card, after the classification badge
- Do not use percentage numbers (e.g., "87% confident") — they imply false precision from a language model. Use qualitative labels: High / Medium / Low.

**In alert detail view:**
- Confidence is repeated in the AI analysis panel header
- Low confidence: add an amber banner above the AI explanation: "ScopeAI detected this with low confidence. Review the message and reasoning carefully before acting."

---

### Handling AI Uncertainty / Low-Confidence Flags

**Visual treatment for "Unclear" classification:**
- Alert card left border: Amber (not Rose — Rose is reserved for confirmed Out-of-Scope)
- Badge: "AI Uncertain" in Amber
- Alert detail: AI analysis panel header changes to: "ScopeAI needs your judgment on this one."
- The action options remain the same — dismiss, confirm, snooze — but the framing shifts from "the AI caught something" to "the AI is asking you to decide"

**Developer can set AI sensitivity (Settings > AI):**
- Conservative mode: Unclear/Low-confidence alerts are suppressed — developer only sees High/Medium Out-of-Scope
- Balanced (default): All Out-of-Scope + High/Medium Unclear
- Aggressive: Everything, including Low-confidence Unclear

The current sensitivity setting is displayed as a small badge in the Alerts section header: "Sensitivity: Balanced" with a link to settings. This ensures developers always know why they might be seeing more or fewer alerts.

---

### Showing the Developer That the AI Is Actively Monitoring

**Integration status indicator (persistent, unobtrusive):**
- In the sidebar footer, a small status line: "● Monitoring 3 projects" in Emerald green
- If monitoring is partial (some integrations down): "● Monitoring 2 projects (1 paused)" in Amber, with a link to integrations
- If all monitoring is down: "● Monitoring paused" in Rose, with a link to integrations

**On the project detail page:**
- A small status bar below the project name: "Watching #client-channel and client@email.com — Last message analyzed: 2 hours ago"
- This "last analyzed" timestamp is the most important trust signal — it tells the developer the AI is actually running, not just connected

**AI analysis timestamp on alerts:**
- Each alert card and detail view shows "Analyzed by ScopeAI AI · [time]" in Slate 500 / body-sm — small, unobtrusive, but present

---

### The AI Generation Loading Screen (Change Order Draft)

This is the one screen where a deliberate, purposeful loading state is warranted. The developer has just confirmed a scope violation and clicked "Generate Change Order" — they're in a moment of momentum.

**Design:**
- Full content area (not full browser window) — sidebar still visible
- Centered layout
- A simple, looping animation: three dots in Indigo pulsing in sequence (not a spinner)
- Heading: "Drafting your change order…"
- Subtext (rotating, one at a time, every 3 seconds):
  - "Reading the client's request…"
  - "Checking your project scope…"
  - "Drafting the description…"
  - "Almost done…"
- This copy sets expectations and makes the wait feel purposeful — not broken

**If AI takes longer than 15 seconds:** Add a reassurance line below the subtext: "This is taking a moment — complex requests take a little longer."

**If AI fails:** Replace the animation with an error state: "Couldn't generate a draft. You can write this one manually." + "Write Manually" button.

---

*End of ScopeAI UI/UX Design Brief v1.0*
*Date: June 28, 2026*
