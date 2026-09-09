---
name: KrishiRaksha Agritech System
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
  tertiary: '#b20010'
  on-tertiary: '#ffffff'
  tertiary-container: '#d82324'
  on-tertiary-container: '#fff1ef'
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
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md-mobile:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  gutter-mobile: 1rem
  margin-mobile: 1rem
  touch-target-min: 3rem
---

## Brand & Style

This design system establishes a high-utility, vibrant agritech experience bridging community-driven social engagement with precision crop diagnostic intelligence. Built specifically for Indian agrarian environments, the design fuses the rich, energetic ergonomics of modern social networks (Instagram, WhatsApp) with the clarity, rigor, and instantaneous legibility of diagnostic field tools.

The interface prioritizes extreme outdoor visibility under harsh midday sunlight while maintaining visual warmth and approachability. The emotional resonance is grounded, optimistic, and empowering—treating the farmer not merely as a system operator, but as an informed steward and active community member. 

The aesthetic blends **Modern Agritech Tactility** with **Social Media Polish**:
- Crisp, high-contrast surface containment preventing glare washout.
- Rich botanical greens paired with sun-warmed harvest ambers.
- Chunky, touch-accessible hit targets tailored for single-handed mobile operation in the field.
- Visual clarity prioritizing bilingual literacy, iconography, and voice-first interaction primitives.

## Colors

The color architecture is built to ensure AA/AAA WCAG contrast indoors and outdoors, with distinct semantic roles tied to agricultural states and social mechanics:

- **Primary Green (`#15803D` / Deep Emerald `#0F5132`):** Represents crop vitality, successful validation, organic yield, and primary user progression. Used for dominant action buttons, healthy diagnostic readouts, and verified expert badges.
- **Secondary Warm Amber (`#D97706` / Bright Amber `#F59E0B`):** Represents harvest, sunlight, caution, and active community energy. Powers story ring gradients, pending diagnostic scans, and high-engagement social cues.
- **Tertiary Alert Red (`#DC2626`):** Dedicated to critical crop alerts, high infestation indices, disease outbreak perimeters, and destructive threshold warnings (IPM triggers).
- **Surface & Backgrounds (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`):** Pristine soft-slate whites prevent eye strain while avoiding dingy low-contrast grays under bright sunlight.
- **Borders & Dividers (`#E2E8F0`):** Precise delineations maintaining component separation on budget LCD screens.
- **Text & Foregrounds (`#0F172A`, `#334155`):** Deep slate blacks for immediate bilingual readability across variable screen qualities.

## Typography

The typographical engine leverages **Noto Sans** for all primary headings, titles, and body content to guarantee native typographic parity between Latin, Devanagari (Hindi, Marathi), and regional scripts. **Inter** is selectively utilized for compact numeric telemetry, AR viewfinder data overlays, and interface micro-labels.

Key operational guidelines:
- **Optical Height Alignment:** Devanagari characters feature an intrinsic top hanging line (*shirorekha*); line-height multipliers are widened (minimum `1.45x`–`1.6x`) across all body styles to completely prevent conjunct clipping.
- **Enhanced Weight Distribution:** Thin weights below `400` are strictly forbidden. Outdoor usability requires base weights to start at `400` (Regular) and emphasize `600` (SemiBold) for structural scanability.
- **Bilingual Stacking:** Where English and vernacular terms appear simultaneously (e.g., "Fall Armyworm / लष्करी अळी"), the primary language takes `title-md` and the translation takes `body-sm` in `#64748B`.

## Layout & Spacing

This design system uses a 4-column fluid layout on mobile screens (`< 600px`), shifting to an 8-column layout on tablets (`600px - 1023px`) and 12 columns for desktop/dashboard stations (`≥ 1024px`).

Layout rules:
- **Mobile-First Touch Architecture:** Minimum interactive touch target size is rigidly locked to `48px` (`3rem`) to accommodate gloved, wet, or weathered hands during field operations.
- **Edge Cushioning:** Screen borders maintain a fixed `16px` outer margin (`margin-mobile`), ensuring content does not crowd hardware bezels or curved screen edges.
- **Vertical Rhythm:** Modular 8-point vertical cadence (`8px`, `16px`, `24px`, `32px`) orchestrates structural breathing room, keeping dense pest data clusters visually navigable.

## Elevation & Depth

Visual hierarchy uses crisp boundary containment combined with ambient, naturalistic shadow projection. In outdoor light, soft shadows wash out; hence, physical elevation must always be reinforced with subtle surface borders (`#E2E8F0` or `#CBD5E1`).

- **Level 0 (Flat Surface):** `#FFFFFF` or `#F8FAFC`, paired with a 1px border (`#E2E8F0`). Used for standard list rows, read-only feeds, and static form plates.
- **Level 1 (Raised Card):** `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);` with a 1px border (`#E2E8F0`). Used for feed posts, diagnostic scorecards, and media previews.
- **Level 2 (Interactive Floating / Active Sheets):** `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.06);`. Used for bottom floating action bars, active filter pills, and audio player drawers.
- **Level 3 (Modals & Emergency Alerts):** `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08);`. Used for high-severity IPM outbreak popups and fullscreen AR target overlays.
- **Camera Viewfinder Scrim:** High-contrast reverse dark gradient overlays (`rgba(0, 0, 0, 0.65)` to transparent) ensure text legibility against unpredictable plant and soil imagery.

## Shapes

The interface embraces an approachable, organic roundedness (Level 2). This reflects natural curves found in agriculture while maintaining modern app ergonomics:

- **Base Radius (`0.5rem` / `8px`):** Used for micro-badges, inputs, inline severity tags, and alert banners.
- **Large Radius (`1rem` / `16px`):** Applied to feed cards, diagnostic summary containers, audio chat cards, and image viewports.
- **Extra Large Radius (`1.5rem` / `24px`):** Applied to bottom action sheets, sliding camera panels, and floating navigation pills.
- **Full Rounded / Pill (`9999px`):** Reserved for primary CTA buttons, WhatsApp share shortcuts, story circle frames, and filter chips.

## Components

### 1. Instagram-Style Story Rings
- **Visuals:** Circular avatar or crop preview wrapped in an offset 3px border gradient transitioning from Harvest Amber (`#F59E0B`) to Emerald Green (`#15803D`).
- **Unviewed vs. Viewed:** Unviewed stories carry the high-energy gradient ring with a 2px pure white separation gap. Viewed stories drop to a flat `#CBD5E1` neutral hairline ring. Live outbreak alerts replace the ring with pulsing Accent Red (`#DC2626`).

### 2. Social Agritech Feed Cards with WhatsApp Sharing
- **Header:** Farmer/KVK Scientist avatar, localized name, geotag (e.g., "Nashik, Maharashtra"), and verified agronomist badge.
- **Media Canvas:** 4:5 aspect ratio optimized for mobile phone crop captures.
- **Engagement Bar:** Dual action layout featuring native like/comment alongside a high-visibility, dedicated WhatsApp sharing button (styled in `#25D366` green background or emerald-tinted ghost state) containing pre-formatted bilingual crop health summaries.

### 3. Camera HUD & AR Viewfinder Guidance
- **Focus Reticle:** Dynamic bounding box in screen center. Default state is clean white (`#FFFFFF`) with dashed corners. Upon leaf/pest detection, transitions to solid Emerald Green (`#15803D`) or Alert Amber (`#F59E0B`).
- **Guidance Meters:** Real-time distance and illumination telemetry pills (e.g., "Too Dark - Turn on Torch", "Move 10cm Closer") positioned at the top third of the viewfinder using semi-translucent dark slate pills (`rgba(15, 23, 42, 0.75)` with blur).

### 4. Diagnostic Scorecards & Severity Meters
- **Container:** Level 1 elevated card with high-contrast header section.
- **Severity Gauge:** 5-segment segmented bar showing infestation scale (Green: Low, Amber: Moderate, Red: Critical).
- **IPM (Integrated Pest Management) Callout:** High-visibility banner framed with a thick 4px left-hand border in Alert Red (`#DC2626`) detailing immediate chemical/organic remedial actions with chemical formula name and dosage metrics clearly isolated.

### 5. Chat Conversation Bubbles & Voice Note Waveforms
- **Voice Note Player:** Chunky 48px play/pause button paired with dynamic audio frequency waveform bars. Progress state colored in Deep Emerald (`#15803D`) with remaining duration in bold `Inter` numbers.
- **Bubble Architecture:** Incoming messages (from agronomists or AI engine) anchored in `#F1F5F9` with sharp top-left corner; outgoing farmer messages in light emerald tint (`#DCFCE7`) with sharp top-right corner.

### 6. Buttons, Chips & Form Fields
- **Primary Button:** Pill-shaped, `#15803D` background, bold white text, minimum height `48px`.
- **Chips:** Filter and tag chips utilize pill radius with a 1px border (`#E2E8F0`). Active chips invert to solid Emerald or Amber with white text.
- **Input Fields:** Generous touch padding (`14px 16px`), 1.5px border resting at `#CBD5E1`, focusing to 2px `#15803D` with integrated mic icon button for voice-to-text input.