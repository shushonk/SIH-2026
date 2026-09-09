---
name: Agro-Surveillance & Field Clinical System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f493f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7a6e'
  outline-variant: '#becabc'
  surface-tint: '#006d30'
  primary: '#00652c'
  on-primary: '#ffffff'
  primary-container: '#15803d'
  on-primary-container: '#d3ffd5'
  inverse-primary: '#79db8d'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#4f576d'
  on-tertiary: '#ffffff'
  tertiary-container: '#676f86'
  on-tertiary-container: '#f2f3ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#95f8a7'
  primary-fixed-dim: '#79db8d'
  on-primary-fixed: '#00210a'
  on-primary-fixed-variant: '#005323'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  metric-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.03em
  code-data:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
---

## Brand & Style

This design system delivers an executive-grade, field-resilient interface tailored for the critical workflow of rural crop diagnostics, regional epidemiological tracking, and district agricultural decision-making. 

The aesthetic marries **high-density data systems** with **organic, authoritative vitality**. It avoids naive pastoral tropes in favor of an institutional, analytical, yet profoundly human instrument:
- **Tone:** Authoritative, vigilant, clinical, and reassuring.
- **Visual Stance:** Precision enterprise meets resilient field utility. It incorporates high-legibility typographic hierarchies, rugged tap boundaries for high-glare field inspections, and dense, scannable data layouts for district-level monitoring rooms.
- **Motion & Micro-interactions:** Functional and low-latency. Transitions prioritize immediate status comprehension (e.g., infestation rate changes, regional risk shifts) rather than decorative delays.

## Colors

The palette balances clinical precision with natural biological signifiers, ensuring high visibility under bright outdoor sunlight as well as calibrated desktop command screens.

### Palette Roles
- **Primary (Verdant Canopy):** `#15803D` (Base Primary) anchoring safe conditions, confirmed crop health, and core CTAs. Supported by `#0F5132` (Deep Forest) for commanding headers and high-contrast text on light fields, and `#22C55E` (Field Sprout) for active telemetry pings and positive delta metrics.
- **Secondary (Harvest Gold & Amber):** `#D97706` (Ripened Wheat) for seasonal warnings, stress advisories, and triage queues; `#F59E0B` for accent notifications and localized crop vulnerability states.
- **Tertiary & Neutral Structural (Deep Slate & Navy):** `#0F172A` (Ink Navy) delivers authoritative contrast for tabular telemetry and executive headlines; `#1E293B` and `#334155` govern structural containers, toolbars, and inactive sub-indicators.
- **Canvas & Surface:** Pure `#F8FAFC` (Clean Canvas) provides maximum contrast ratio against direct glare, with `#FFFFFF` reserved for elevated diagnostic cards and `#F1F5F9` for data-dense telemetry tracks.
- **Semantic Outbreak Tiers:**
  - **Severe / Pathogen Outbreak:** `#DC2626` (Red Alert) paired with `#FEF2F2` tinted backgrounds.
  - **Advisory / Early Vector:** `#EAB308` (Warning Ochre) paired with `#FEFCE8` tinted backgrounds.
  - **Nominal / Controlled:** `#15803D` paired with `#F0FDF4`.
- **Borders & Dividers:** Subtle structural lines rendered in `#E2E8F0`, hardening to `#CBD5E1` for actionable form states.

## Typography

The typographic hierarchy accommodates dual operational modes: rapid scanability of biological indices by field personnel, and multilingual precision across Devanagari (Hindi, Marathi) and Latin scripts.

- **Display & Headings:** `Plus Jakarta Sans` provides geometric legibility with humanist warmth, softening diagnostic severity while maintaining strict structural weight.
- **Body & Clinical Tabular Data:** `Inter` handles operational copy, tables, diagnostic parameters, and numerical metrics. With tabular lining enabled (`tnum`), numbers align vertically across district triage matrices.
- **Indic Script Support (Devanagari):** All type roles inherit fallback pairing to `Noto Sans Devanagari`. Typographic line heights have been systematically budgeted with a 15–20% buffer over standard Latin metrics to prevent diacritic clipping in Hindi and Marathi terminology (e.g., 'शेतकरी नोंदणी' or 'कीटक प्रादुर्भाव सूचना').
- **Executive Metric Typography:** Large metric callouts (`metric-stat`) employ tight negative tracking to pack high-magnitude telemetry (e.g., "94.2% Hectares Monitored") cleanly inside compact card architectures.

## Layout & Spacing

The layout is built upon an 8-point base grid system, operating within a hybrid framework:
- **Field Command Web (Desktop / Tablet):** 12-column fluid grid system with `1.5rem` gutters and max container constraints capped at `1440px`. Outbreak maps and multi-zone triage queues support full-bleed viewport modes with pinned clinical control rails.
- **Farmer & Extension Mobile Viewports:** Single-column stacked cards utilizing `1rem` screen margin rails. Action touchpoints are calibrated to minimum 48px heights to ensure error-free operation in dirty, wet, or bright outdoor field settings.

### Breakpoint Structure
- **Mobile (`< 640px`):** Single column, bottom-pinned workflow trays, stacked metric badges, high-contrast linear tables.
- **Tablet (`640px – 1024px`):** 6 to 8 columns, split diagnostic viewport (camera/telemetry left, diagnostic outcome right).
- **Desktop (`> 1024px`):** 12 columns, tripartite structure: District Navigation / Real-time Outbreak GIS / Clinical Detail Dossier.

## Elevation & Depth

To maximize legibility and minimize UI clutter under sunlight, depth is established via **tonal layering and low-contrast perimeter strokes** rather than deep, heavy drop shadows.

- **Level 0 (Field Canvas):** `#F8FAFC`. Base backdrop across dashboards and mobile workflows.
- **Level 1 (Card & Module Layer):** Solid `#FFFFFF` fill framed by a crisp `1px` border of `#E2E8F0`. Shadows are ambient and soft: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05)`.
- **Level 2 (Hover & Interactive Containers):** Raised triage items and active field reports transition to `box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08)`, border tone shifts to `#CBD5E1`.
- **Level 3 (Emergency Flyouts, GIS Modals, Action Drawers):** `box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.12)`, border tone remains `#CBD5E1`.
- **Outbreak Severity Flares:** Alert panels do not rely on shadow depth; they use inner-edge left accent borders (`4px solid #DC2626` or `#D97706`) paired with low-opacity structural tinted backdrops (`#FEF2F2` or `#FEFCE8`).

## Shapes

The design system employs a **soft-rectilinear (Level 1)** geometry (`0.25rem` to `0.5rem`). This geometric discipline communicates institutional rigor, allows high information density without wasted corner radius padding, and preserves clean alignments across complex clinical and tabular layouts.

- **Inputs, Buttons, and Selectors:** `0.375rem` (6px) rounded corners.
- **Diagnostic Cards & Metric Tiles:** `0.5rem` (8px) rounded corners.
- **Tags, Micro-Badges, and Severity Pills:** Distinct exception—fully rounded (`9999px`) to create an immediate visual separation between structural layout cards and categorical state metadata.

## Components

### Buttons & Action Triggers
- **Primary Action (Diagnostic Confirm / Dispatch):** Solid `#15803D` background, text `#FFFFFF`, font weight 600. Active state dips to `#0F5132`. Minimum touch targets are 48px on mobile views and 40px on desktop systems.
- **Secondary Action (Filter / Export / Calibration):** White background, `1px solid #E2E8F0`, text `#0F172A`. Hover transitions surface to `#F8FAFC` and border to `#CBD5E1`.
- **Critical Alert Trigger (Epidemic Warning):** Solid `#DC2626`, text `#FFFFFF`. Pulsing radar ring on key triage hubs.

### Status Badges & Outbreak Pills
- Pill-shaped components (`rounded-full`) with uppercase or medium-weight label text (`label-sm`).
- **Critical Contagion:** Background `#FEF2F2`, border `1px solid #FCA5A5`, text `#991B1B`.
- **Monitoring / Moderate:** Background `#FEFCE8`, border `1px solid #FDE047`, text `#854D0E`.
- **Healthy Crop Tissue:** Background `#F0FDF4`, border `1px solid #86EFAC`, text `#166534`.

### Clinical Diagnostic Cards
- White background (`#FFFFFF`), `1px solid #E2E8F0`, `8px` corner radius.
- Includes header with localized crop species tag, confidence percentage index, and timestamp.
- Incorporates thumbnail media slots with high-contrast bounding boxes indicating detected pathogen regions (leaf spot, rust, stem rot).

### Tabular Telemetry & Field Inspection Lists
- Strict alternation or border-separated rows with 1px `#F1F5F9`.
- High vertical padding density (8px–12px) on desktop to prioritize scannability of dozens of district taluks simultaneously.
- Embedded sparklines use `#22C55E` for improving metrics and `#DC2626` for outbreak proliferation rates.

### Form Inputs & Specimen Selectors
- Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`.
- Focus state: `2px solid #15803D` with an offset highlight ring `rgba(21, 128, 61, 0.15)`. No default browser outlines.
- Field labels are styled in `label-md` with multilingual support consideration (accommodating script line-height adjustments for Hindi/Marathi prompts).