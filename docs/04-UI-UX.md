# 04-UI-UX.md — Design System & Interaction Specifications

Argus Fin / SANGYAN — Tier-2/3 Bharat Investor Resilience Design System.

## 1. Design Principles
1. **One primary action per screen**: Always above the fold at 360×640 px without scrolling.
2. **Understand in 5 seconds**: Plain words + icons. Details live under collapsible "Why?" sections.
3. **First-class voice accessibility**: Unified mic and speaker controls on all text/response screens.
4. **Calm, never alarming**: No urgency tricks, countdown timers, flashing elements, or screaming red text.
5. **No colour-only encoding**: Every status has icon + label + distinct token colour. No green in result states.
6. **Public-good tone**: Neutral, respectful educational posture. Zero marketing superlatives or commercial CTAs.
7. **Byte efficiency**: Zero runtime font CDNs, zero icon/animation libraries, lightweight inline SVGs.

---

## 2. Design Tokens

### Core Color Palette
| Token | Hex | Usage | Contrast Ratio |
| :--- | :--- | :--- | :--- |
| `canvas` | `#FBF7F1` | Warm cream base page canvas | - |
| `surface` | `#FFFFFF` | Primary card and container surface | - |
| `surface-sunken` | `#F5EFE6` | Secondary wells, code blocks, previews | - |
| `border` | `#E8DDCF` | Soft 1px card and separator borders | - |
| `ink` | `#14181F` | Primary high-contrast typography | 13.8:1 on canvas |
| `ink-muted` | `#4A5361` | Secondary captions, helper text | 5.6:1 on canvas |
| `accent` | `#B84E00` | Warm golden-orange brand primary actions, links | 6.06:1 on canvas |
| `accent-ink` | `#FFFFFF` | Text on accent buttons and badges | 5.70:1 on accent |
| `accent-soft` | `#FFF3E0` | Active chips, bracketed tags, soft glow | - |
| `highlight` | `#F5A524` | Warm golden illustration accents & brand logo suffix | - |

#### Distinction Between Accent and Medium Risk
The brand `accent` (`#B84E00` / `#FFF3E0`) is a bright, high-energy golden-orange used for constructive user actions and brand identity. It is kept visually and semantically distinct from the **MEDIUM risk state** (`#6B2E05` deep burnt amber text on `#FFF4DB` warning background with `#B54708` border), ensuring users never confuse an interactive button or navigational highlight with an active fraud warning state.

### Risk States Palette (Zero Green Invariant)
| Band | Background | Border | Text | Icon | Meaning |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HIGH** | `#FDECEA` | `#B42318` | `#7A1410` | `alert-triangle` | Major red flags detected (7.8:1) |
| **MEDIUM** | `#FFF4DB` | `#B54708` | `#6B2E05` | `alert-circle` | Proceed with caution (7.6:1) |
| **LOW_SIGNALS** | `#EEF2F7` | `#475467` | `#1D2939` | `info` | Low risk signals found (11.2:1) |
| **CANNOT_VERIFY** | `#F3F0FA` | `#5B4B8A` | `#2E2552` | `question` | Inconclusive from available sources (9.4:1) |

---

## 3. Header & Navigation Behavior
- **Transparent Over Hero**: At top of scroll (`scrollY <= 40px`), the header is semi-transparent (`bg-canvas/40 backdrop-blur-sm border-transparent`) for an unconstrained hero visual.
- **Solid on Scroll**: Beyond 40px scroll, transitions smoothly to solid surface (`bg-surface/95 backdrop-blur-md border-border shadow-soft`).
- **Active Route Indication**: Active links are rendered with bold weight, `text-accent`, and a distinct 2px bottom border underline (`border-b-2 border-accent`), never relying on color alone.

---

## 4. Micro-Interactions & Hover Text Speed
- **Scramble / Decode Text Timing**: Total resolve duration is capped to ~150-250ms (default: 180ms) regardless of text string length.
- **Accessibility Invariant**: Disabled under `prefers-reduced-motion`. Never started scrambled on initial paint (hover/focus trigger only).
- **Safety Critical Exclusion**: Scramble animation is prohibited on primary safety CTAs, result cards, and calculation buttons.

---

## 5. Typography & Spacing
- **Fonts**: Self-hosted via Next.js subsetted Google Fonts (`Noto Sans`, `Noto Sans Devanagari`, `Noto Sans Tamil`).
- **Body Text**: 18px (`1.125rem`), line-height: `1.6` (Latin), `1.75` (Devanagari/Tamil).
- **Small Text**: Minimum 16px (`1rem`) to prevent Tier-3 squinting on low-DPI screens.
- **Headings**:
  - `H1`: `clamp(2.25rem, 7vw, 4rem)`, line-height: `1.1` (Latin), `1.35-1.45` (Indic).
  - `H2`: `clamp(1.5rem, 4vw, 2.25rem)`.
- **Touch Targets**: Minimum 48×48 px for all clickable targets.
- **Focus Rings**: 3px solid `accent` with 2px offset.
- **Motion**: `transform`/`opacity` max 600ms; strict `prefers-reduced-motion` compliance.

---

## 6. Primitives & Components
- `Button`: Primary (`bg-accent text-accent-ink hover:opacity-90`), Secondary (`bg-surface-sunken border-border text-ink hover:border-accent`), Quiet (`text-accent hover:underline`).
- `IconButton`: Min 48×48 px mic and speaker buttons with pressed/recording states.
- `Chip / Pill`: Neutral pill tags (e.g. `Free · No sign-up · Nothing is stored`).
- `BandBadge`: Icon + textual risk title + token color for the 4 risk bands.
- `LanguageSwitcher`: 3 visible chips in native script (`English`, `हिन्दी`, `தமிழ்`) with active state.
- `LadderChart`: Calibrated benchmark yield chart with dynamic off-scale break indicator and source citations.
- `CyberFraudMap`: State-wise cyber fraud awareness grid with population-normalized metrics.

---

## 7. Strict Copy Rules
- **Prohibited Words**: "safe", "secure", "guaranteed", "best", "fastest", "premium", "free trial", "upgrade", "get started now".
- **No Fear / Urgency**: Neutral phrasing; no pressure tactics or accusatory company labeling.
- **Translation Integrity**: Human-review markers (`_review: true`) for draft Indic strings.
