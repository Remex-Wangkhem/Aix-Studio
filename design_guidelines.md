# EVEDA AIX STUDIO - Design Guidelines

## Design Approach
**Design System Foundation**: Material Design 3 + Linear-inspired minimalism for enterprise SaaS
- Rationale: Information-dense admin platform requiring clarity, efficiency, and professional polish
- References: Linear (typography & spacing), Stripe (data presentation), Vercel (dashboard layouts)

## Core Design Principles
1. **Clarity over decoration**: Every element serves a functional purpose
2. **Predictable patterns**: Consistent component behavior across admin and user interfaces
3. **Data-first design**: Information hierarchy optimized for scanning and quick actions
4. **Professional authority**: Enterprise-grade aesthetic matching deep blue/teal brand

---

## Typography System

**Font Stack**: Inter (Google Fonts) for all text
- **Display/Headers**: Inter 600-700 (Semibold-Bold)
  - H1: text-4xl lg:text-5xl font-bold
  - H2: text-3xl lg:text-4xl font-semibold
  - H3: text-2xl font-semibold
  - H4: text-xl font-semibold
- **Body Text**: Inter 400-500 (Regular-Medium)
  - Primary: text-base font-normal
  - Secondary: text-sm font-normal
  - Labels: text-sm font-medium
  - Captions: text-xs font-medium
- **Code/Monospace**: 'JetBrains Mono' for API keys, JSON, code snippets

---

## Layout & Spacing System

**Tailwind Spacing Primitives**: 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8, space-y-12
- Card gaps: gap-4, gap-6
- Page margins: px-4 md:px-6 lg:px-8

**Grid System**:
- Admin tables: Full-width with max-w-7xl container
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Settings forms: Single column max-w-2xl for focus
- Sidebar navigation: Fixed 64px (collapsed) / 256px (expanded)

---

## Component Library

### Navigation
- **Top Bar**: Fixed header with logo (left), breadcrumbs (center), user menu (right), h-16, border-b
- **Sidebar**: Collapsible navigation, icon-only when collapsed, grouped menu sections with dividers
- **Breadcrumbs**: Home > Section > Page pattern with slash separators

### Data Display
- **Tables**: Striped rows, sortable headers, action column (right-aligned), sticky header on scroll
- **Cards**: Rounded-lg, border, shadow-sm hover:shadow-md transition, header with actions
- **Stats**: Large number (text-3xl font-bold), label below (text-sm), optional trend indicator
- **Code Blocks**: Dark background, syntax highlighting, copy button (top-right)

### Forms & Inputs
- **Text Inputs**: Border, rounded-md, px-4 py-2, focus ring (2px offset), label above, helper text below
- **Dropdowns**: Native select styled or custom dropdown with search for model/endpoint selectors
- **Toggles**: Switch component for boolean settings (freeze endpoint, enable/disable)
- **API Key Display**: Monospace font, copy button, "shown once" warning for new keys

### Chat Interface
- **Message Bubbles**: User (right-aligned, brand color), Assistant (left-aligned, neutral), System (full-width, muted)
- **Input Area**: Fixed bottom, textarea with auto-expand, send button (right), file upload (left), model selector (top-right of input)
- **Streaming Indicator**: Animated dots while generating, typing cursor effect
- **Message Actions**: Edit, rerun, copy icons on hover, timestamp subtle

### Admin Controls
- **Model Connector Cards**: Service name, status badge (green/red dot), health check timestamp, edit/delete actions
- **Endpoint Builder**: Multi-step form or modal with tabs (Settings, Prompt, Limits, Access)
- **Billing Dashboard**: Revenue chart, usage metrics grid, invoice table with download actions

### Overlays
- **Modals**: Centered, max-w-2xl, blur backdrop, slide-up animation, header with close X
- **Drawers**: Slide from right for details/settings, full-height, close on backdrop click
- **Toasts**: Top-right corner, auto-dismiss, success/error/info variants with icons

---

## Responsive Behavior
- **Mobile (< 768px)**: Hamburger menu, stacked cards, simplified tables (show key columns only)
- **Tablet (768-1024px)**: Collapsed sidebar by default, 2-column grids
- **Desktop (> 1024px)**: Expanded sidebar, 3-column grids, full feature set

---

## Animations
**Minimal and purposeful only**:
- Sidebar expand/collapse: 200ms ease
- Modal/drawer entry: 150ms slide + fade
- Hover states: 100ms color/shadow transition
- Streaming text: Typing cursor blink
- NO scroll animations, parallax, or decorative motion

---

## Images & Icons

**Icons**: Heroicons (outline for navigation, solid for actions) via CDN
- Navigation: 24px icons
- Buttons: 20px icons
- Table actions: 16px icons

**Images**:
- **Logo**: EVEDA AIX STUDIO wordmark (top-left, white on dark header)
- **Empty States**: Simple illustrations for "no models configured", "no conversations", "no billing data"
- **Hero Section** (Marketing/Onboarding only): Abstract tech/AI visualization with blurred glass button overlays
- NO images in admin interface (data-first design)

---

## Page-Specific Layouts

### Chat Playground
- Left sidebar: Conversation history (256px), collapsible
- Center: Chat messages (max-w-4xl), scroll to bottom on new message
- Right sidebar: Model settings panel (320px), collapsible, sticky position

### Admin Dashboard
- Grid of stat cards (4 across desktop)
- Charts: Usage over time (line), top models (bar), revenue (area)
- Recent activity table below

### Model Connector Management
- Table view with service name, URL, protocol, status, actions
- "Add Connector" button (top-right), opens modal/drawer
- Each row expandable to show linked endpoints

### Endpoint Builder
- Two-column layout: Form (left, max-w-2xl) + Live preview (right, sticky)
- Sections: Basic Info, Model Selection, Prompt Template, Runtime Settings, Access Control
- Generate API Key button at bottom, shows key in modal with copy + warning

### Billing Interface
- Tab navigation: Overview, Plans, Usage, Invoices
- Stripe elements embedded for payment method management
- Usage table with customer, endpoint, tokens, cost columns, export CSV

---

## Branding Integration
- **Portal Name**: "EVEDA AIX STUDIO" in header, login page, page titles
- **Color References**: Deep blue (primary accent), teal (secondary/success), white (text on dark)
- **Professional Tone**: Technical precision, no playful copy, confidence without jargon