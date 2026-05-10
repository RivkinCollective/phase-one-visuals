![[OPENAI] 401 Authentication Fails (auth header format should be Bearer sk-...)
{"message":"401 Authentication Fails (auth header format should be Bearer sk-...)","status":401,"modelId":"deepseek-v4-flash","providerId":"openai"}[OPENAI] 401 Authentication Fails (auth header format should be Bearer sk-...)
{"message":"401 Authentication Fails (auth header format should be Bearer sk-...)","status":401,"modelId":"deepseek-v4-flash","providerId":"openai"}](image.png)# Phase One Visuals — Design System & Front-End Blueprint

> **Status:** Architectural Blueprint v1.0  
> **Context:** Modern rebuild preserving brand colors while elevating to current industry standards  
> **Target Aesthetic:** Studio-luxury editorial meets conversion-optimized utility

---

## 1. Visual Style Guide

### Preserved Color Palette — Recast for Modern Application

| Token | HEX | Role | Application |
|-------|-----|------|-------------|
| `--gold` | `#C8861A` | **Primary Accent / CTA** | Hero emphasis, gold buttons, italic headings, checkmark bullets, hover states, focus rings |
| `--gold-light` | `#E09B2A` | **Interactive Accent** | Button hover glow, active tab indicators |
| `--gold-pale` | `#FDF4E7` | **Soft Background Accent** | Glass card backgrounds, bento grid panel fills |
| `--black` | `#111111` | **Primary Text / Solid CTAs** | Headings, body text, filled buttons, "Request Quote" actions |
| `--charcoal` | `#2A2A2A` | **Secondary Text** | Subtitles, card descriptions (replacing --slate for some uses) |
| `--slate` | `#5A5A5A` | **Tertiary / Caption** | Meta text, footnotes, form labels |
| `--mist` | `#F8F6F2` | **Canvas Background** | Section backgrounds, card alternating fills |
| `--white` | `#FFFFFF` | **Surface / Card Fill** | Card backgrounds, modal surfaces, elevated panels |
| `--divider` | `#E8E0D4` | **Border / Hairline** | Subtle card borders, grid separators (low opacity) |

### New Tokens to Introduce

```css
:root {
  /* Elevation & Glass */
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px rgba(17, 17, 17, 0.06);
  --glass-blur: blur(12px);

  /* Bento Grid */
  --bento-gap: 16px;
  --bento-radius: 16px;

  /* Depth via layered shadows */
  --elevation-1: 0 1px 3px rgba(17, 17, 17, 0.04), 0 1px 2px rgba(17, 17, 17, 0.02);
  --elevation-2: 0 4px 12px rgba(17, 17, 17, 0.05), 0 2px 4px rgba(17, 17, 17, 0.03);
  --elevation-3: 0 12px 40px rgba(17, 17, 17, 0.07), 0 4px 12px rgba(17, 17, 17, 0.04);
  --elevation-4: 0 24px 60px rgba(17, 17, 17, 0.10), 0 8px 24px rgba(17, 17, 17, 0.06);

  /* Radius Scale */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* Transition Primitives */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 200ms;
  --duration-base: 350ms;
  --duration-slow: 600ms;
}
```

### Dark Mode Adjustments

```css
[data-theme="dark"] {
  --glass-bg: rgba(26, 26, 26, 0.7);
  --glass-border: rgba(255, 255, 255, 0.06);
  --elevation-1: 0 1px 3px rgba(0, 0, 0, 0.3);
  --elevation-2: 0 4px 12px rgba(0, 0, 0, 0.4);
  --elevation-3: 0 12px 40px rgba(0, 0, 0, 0.5);
  --elevation-4: 0 24px 60px rgba(0, 0, 0, 0.6);
}
```

### Application Principles

- **High-emphasis CTAs:** Use `--gold` for primary actions. The gold should always be the **eyeball magnet** — no more than 1-2 gold elements per viewport.
- **Secondary actions:** Use `--black` (dark theme: `--white`) filled buttons or outlined variants.
- **Surface hierarchy:** White cards sit on mist backgrounds. Elevation shadows create the z-axis hierarchy.
- **Glassy moments:** Use glassmorphism sparingly — navbar on scroll, modal overlays, feature cards.

---

## 2. Layout Strategy

### Grid System

Use a **12-column CSS Grid** as the backbone:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(16px, 2vw, 24px);
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 60px);
}
```

### Section Sizing

| Section | Behavior |
|---------|----------|
| **Hero** | Full viewport height, center-aligned, max-width 800px content column |
| **Process** | 4-step bento grid (2×2 on desktop, 1-column on mobile) |
| **Sectors** | 2-column split with hover-expand interaction (glass card on active side) |
| **Pricing** | 3-tab system with bento card layout inside each panel |
| **Coverage** | 50/50 split: content left, glass-framed map right |
| **Footer** | Dense bottom with pill-shaped sub-links, minimal |

### Whitespace Strategy

- **Section padding:** `120px 0` desktop → `80px 0` tablet → `60px 0` mobile
- **Card padding:** `32px` standard, `40px` for hero cards
- **Gap rhythm:** Use 8px base unit: `8px` `16px` `24px` `32px` `48px` `64px` `80px`
- **Content max-width:** 720px for reading comfort on text-heavy sections

### Immersive Hero Section

```
┌──────────────────────────────────────────────────────┐
│  [Subtle ambient gradient background animation]       │
│                                                       │
│           ✦ Small decorative brand badge             │
│                                                       │
│      Properties Sold Through                          │
│      Exceptional  [gold italic]  Visuals              │
│                                                       │
│    Premium content crafted for realtors...            │
│                                                       │
│    ┌──────────┐  ┌──────────┐                        │
│    │ View     │  │ Our      │                         │
│    │ Pricing  │  │ Services │                         │
│    └──────────┘  └──────────┘                        │
│                                                       │
│    Stats bar (subtle, below fold)                     │
└──────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### Buttons

| Variant | Bg | Text | Border | Hover | Radius |
|---------|----|------|--------|-------|--------|
| **Primary (Gold)** | `--gold` | White | None | Scale 1.02 + shadow lift + gold-light bg sweep | `--radius-md` |
| **Secondary (Black)** | `--black` | White | None | Scale 1.02 + gold bg sweep | `--radius-md` |
| **Outline** | Transparent | `--black` | 1.5px solid `--black` | Fill black, text white | `--radius-md` |
| **Ghost** | Transparent | `--slate` | None | Bg `--mist` + color `--black` | `--radius-md` |
| **Pill** | As primary | White | None | As primary | `--radius-full` |

**Dimensions:**
- Desktop: `height: 52px`, `padding: 0 32px`, `font-size: 13px`, `letter-spacing: 2px`
- Mobile: `height: 48px`, `padding: 0 24px`, `font-size: 12px`

**Interaction states:**
- Default: Flat with `--elevation-1`
- Hover: `transform: translateY(-2px)` + `--elevation-3` + gold bg reveal via pseudo-element
- Active: `transform: translateY(0) scale(0.98)` + flash overlay
- Focus-visible: Gold ring `0 0 0 3px var(--gold-pale), 0 0 0 5px var(--gold)`

### Input Fields

```css
.form-input {
  height: 52px;
  padding: 0 20px;
  border: 1.5px solid var(--divider);
  border-radius: var(--radius-md);
  background: var(--white);
  font-family: var(--sans);
  font-size: 15px;
  color: var(--black);
  transition: border-color var(--duration-fast) ease, 
              box-shadow var(--duration-fast) ease;
}

.form-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 4px var(--gold-pale);
  outline: none;
}

.form-input::placeholder {
  color: var(--slate);
  opacity: 0.6;
}

.form-textarea {
  min-height: 120px;
  padding: 16px 20px;
  resize: vertical;
}
```

**Layout:** Label-above pattern with 8px gap between label and input.  
**Error state:** Red border + red-tinted focus ring + inline error message below.

### Navigation Bar

```
┌──────────────────────────────────────────────────────┐
│ [📷 Book]    PHASE ONE VISUALS     [🌙] [☰]         │
└──────────────────────────────────────────────────────┘
```

- **Height:** 64px (desktop), 56px (mobile)
- **Background:** `--glass-bg` with `--glass-blur` on scroll; transparent at top
- **Border bottom:** Hairline `1px solid var(--divider)` with gold gradient accent line
- **Logo:** Left + centered (mobile), with smooth transition on scroll
- **Links:** Pill-shaped, emoji slide-in on hover (keep existing)
- **CTAs:** Book button on mobile left side, Book in desktop nav as gold pill

**Scrolled state:**
```css
nav.scrolled {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--elevation-2);
}
```

### Modal Overlay

- **Backdrop:** Dark with `backdrop-filter: blur(8px)`, enters with fade
- **Panel:** White surface, `--radius-xl`, `--elevation-4`, enters with scale + translateY spring
- **Close:** Top-right ghost button with hover ring
- **Content:** Internal 2-column grid for option cards
- **Transition:** 400ms `--ease-out-expo`

---

## 4. Typography & Hierarchy

### Font Pairing (Preserve Existing + Elevate)

| Role | Font | Weight | Size |
|------|------|--------|------|
| **Display / Hero H1** | `Playfair Display` | 900 italic (gold emphasis) | `clamp(44px, 6vw, 80px)` |
| **Section Heading H2** | `Playfair Display` | 700 | `clamp(32px, 4vw, 52px)` |
| **Card Title H3** | `Playfair Display` | 700 | `clamp(22px, 2.5vw, 28px)` |
| **Subheading / Nav** | `Montserrat` | 700 uppercase | `12-14px` / `4-6px letter-spacing` |
| **Body** | `DM Sans` | 300 / 400 / 500 | `15-17px` |
| **Caption / Meta** | `DM Sans` | 400 | `11-13px` |
| **Button** | `DM Sans` | 600 uppercase | `12-13px` / `2-3px letter-spacing` |

### Type Scale

```
Desktop:
  Hero H1: 72px (line-height: 1.05)
  H2:      48px (line-height: 1.1)
  H3:      32px (line-height: 1.2)
  H4:      24px (line-height: 1.3)
  Body:    16px (line-height: 1.7)
  Small:   14px (line-height: 1.6)
  Caption: 12px (line-height: 1.5)
  Button:  12px (letter-spacing: 2.5px)

Mobile:
  Hero H1: 36px (line-height: 1.1)
  H2:      28px
  H3:      22px
  Body:    15px
```

### Hierarchy Flow

1. **Hero H1** — Massive, commanding. The `em` tag wraps the key differentiator in gold italic.
2. **Section H2** — "Straightforward Pricing." with `em` on "Pricing." — always punch the brand word.
3. **Card H3** — Internal module headers (pricing plan names, sector headings).
4. **Body** — Clean, readable DM Sans with generous line-height.
5. **Meta** — Dimmed slate text for disclaimers, stats, labels.

### Responsive Typography Rules

- Never use fixed px for headings — always `clamp()` for fluid scaling
- Body text stays between 15-17px regardless of viewport
- Button text is the same size on mobile/desktop (12px)
- Letter-spacing scales down on small screens (tighten by 25%)

---

## 5. Interaction Design

### Animation Principles

- All motion uses `--ease-out-expo` for natural deceleration
- Duration: `200-400ms` for micro-interactions, `500-700ms` for section reveals
- No animation should exceed 800ms on initial load
- Respect `prefers-reduced-motion` globally

### Scroll-Triggered Animations

Use Intersection Observer with these classes:

| Class | Effect | Duration | Delay |
|-------|--------|----------|-------|
| `.reveal-up` | translateY(40px)→0 + opacity 0→1 | 600ms | Stagger 100ms |
| `.reveal-left` | translateX(-40px)→0 + opacity 0→1 | 500ms | Stagger 80ms |
| `.reveal-right` | translateX(40px)→0 + opacity 0→1 | 500ms | Stagger 80ms |
| `.reveal-scale` | scale(0.9)→1 + opacity 0→1 | 500ms | 100ms |
| `.reveal-rotate` | rotate(-2deg)→0 + opacity 0→1 | 600ms | 100ms |

**Stagger children:** When a `.reveal-stagger` container enters view, its children animate in sequence with `100ms` delay between each.

### Page Load Sequence

```
0ms:     Preloader (gold spinner + logo) — starts visible
200ms:   Navbar slides down from -64px to 0
300ms:   Hero heading fades up (split: first line then em line)
500ms:   Hero subtitle fades up
700ms:   CTA buttons fade up (staggered)
900ms:   Scroll arrow appears with bounce
4000ms:  Preloader hides (or earlier on load event)
```

### Micro-Interactions

| Element | Trigger | Response | Duration |
|---------|---------|----------|----------|
| Nav link | Hover | Emoji slides in from left, bg pill appears | 220ms |
| Button | Hover | Scale 1.02, shadow lift, bg sweep | 300ms |
| Button | Active (click) | Scale 0.98 flash overlay | 150ms |
| Card | Hover | translateY(-4px), shadow deepen | 350ms |
| Theme toggle | Click | Rotate 360deg, icon swap | 400ms |
| Input | Focus | Border gold, glow ring | 200ms |
| Scroll arrow | Hover | Circle fill intensifies, bounce speeds up | 300ms |
| Pricing tab | Active | Underline slide + gold text | 300ms |
| Mobile menu | Open | Drawer slides right, items stagger in | 500ms |

### Map Section Fix

The map loads via an iframe with no lazy wrappers. **Fix:** Replace the raw iframe with a **glass-card container**:

```html
<div class="coverage-map">
  <div class="map-loading-placeholder">
    <span>Loading map...</span>
  </div>
  <iframe 
    loading="lazy" 
    allowfullscreen 
    src="..." 
    onload="this.parentElement.classList.add('loaded')"
  />
</div>
```

```css
.coverage-map {
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  background: var(--mist);
  box-shadow: var(--elevation-2);
}

.coverage-map iframe {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
  display: block;
  filter: var(--map-filter);
}
```

### Performance Considerations

- All animations that trigger layout (width, height, top) are banned — use `transform` and `opacity` only
- Use `will-change: transform` sparingly on animated elements
- `content-visibility: auto` on off-screen sections
- Consider `requestAnimationFrame` for scroll-linked effects

---

## Implementation Roadmap

### Phase 1: Design Tokens & Global CSS
- Add new CSS custom properties to `global.css`
- Replace hardcoded values with token references

### Phase 2: Navigation Overhaul
- Convert nav to glass transparency at top, opaque on scroll
- Implement mobile drawer with spring animation
- Add scroll-progress indicator

### Phase 3: Hero Redesign
- Add ambient gradient background animation
- Split heading with staggered text reveal
- Add subtle particle or noise texture overlay

### Phase 4: Bento Grid Restructure
- Convert pricing cards to bento grid layout
- Add glassmorphism to feature cards
- Implement staggered scroll reveals

### Phase 5: Interaction Layer
- Add Intersection Observer for scroll animations
- Create micro-interaction CSS classes
- Implement reduced-motion support

### Phase 6: Map & Footer Polish
- Fix map iframe with lazy-load improvements
- Convert footer to bento/minimal layout

---

## Appendix: Dark Mode Map Fix

```css
[data-theme="dark"] .coverage-map {
  filter: brightness(0.7) saturate(0.8);
}

/* Ensure iframe inside map keeps its own rendering */
[data-theme="dark"] .coverage-map iframe {
  filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%);
  mix-blend-mode: normal;
}
```

---

## Appendix: Mobile Navigation Drawer

The current drawer slides from right. Enhancement:
- Add a semi-transparent overlay backdrop pressed behind the drawer
- The overlay closes the drawer on tap
- Drawer items animate with staggered `translateX(20px)→0` per item
- Drawer gets `backdrop-filter: blur(24px)` for frosted glass effect

---

> **Next step:** Review this blueprint, then we can implement Phase 1 (Design Tokens) directly in `global.css` and begin replacing component styles incrementally. Each phase is designed to be independently deployable without breaking existing functionality.