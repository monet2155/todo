# Design System: Chronicles of [나]

> 구현 명세서. 컴포넌트 작업 전 이 파일을 참조할 것.
> 컨셉과 원칙은 [`DESIGN.md`](./DESIGN.md), 화면별 UX는 [`DESIGN_UX.md`](./DESIGN_UX.md).

---

## Spatial System

### Base Unit

All spacing is multiples of **4px**. The "feel" unit is **8px**.

```
4px  — micro gap (icon ↔ label, badge ↔ border)
8px  — tight spacing (within a component)
16px — standard padding (card interior, input padding)
24px — component gap (between items in a list)
32px — section gap (between major layout blocks)
48px — section breathing room (top of page, between sections)
64px — page-level dramatic space (hero area, empty states)
```

### Page Layout

```
Desktop (≥ 1024px):
┌──────────────────────────────────────────────────────┐
│  Sidebar 240px fixed  │  Main content area flex-1    │
│                       │  max-width 800px, centered    │
│  Nav + CharacterSheet │  Quest Board / Briefing       │
│  always visible       │                               │
└──────────────────────────────────────────────────────┘

Mobile (< 1024px):
┌─────────────────────┐
│  Main content       │
│  full width, px-4   │
├─────────────────────┤
│  Bottom tab bar     │
│  h-16 fixed         │
└─────────────────────┘
```

**Page max-width:** `1280px`
**Content max-width:** `800px` — quest board, briefing

### Asymmetric Layout Principle

Reject equal-column grid. The main content is always dominant:

```
Desktop dashboard:  Quest board (65%) | Stat panel (35%)
Briefing page:      NPC dialog centered, max-width 640px, surrounded by negative space
Recap page:         Video 16:9 centered, scene list below, share bar floating bottom-right
```

---

## Atmosphere & Texture

The background is not a solid color. It has **three layers of atmosphere**.

### Layer 1 — Warm base

```css
body {
  background-color: #0F0E0C; /* warmer than #111111 — like old paper seen in candlelight */
}
```

Do not use pure `#000000` or `#111111`. The warmth is the difference between a game world and a terminal.

### Layer 2 — Noise grain

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
}
```

3% noise grain removes the flatness that makes UIs look AI-generated.

### Layer 3 — 창살 lattice (extremely subtle)

Joseon window lattice at 4% opacity. Invisible at first glance but felt — the background has *depth*.

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.04;
  background-image:
    linear-gradient(#D4A017 1px, transparent 1px),
    linear-gradient(90deg, #D4A017 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}
```

The radial mask fades toward the edges — atmospheric, not wallpaper.

### Panel Depth System

```
Level 0 — Page background:   #0F0E0C
Level 1 — Sidebar/layout:    #141210  (paulownia-dark)
Level 2 — Primary panels:    #1C1A18  (paulownia)
Level 3 — Cards:             #252220  (ebony)
Level 4 — Modal / popover:   #2C2927  (ebony+, with backdrop blur)
Level 5 — Tooltip:           #332F2B  (topmost)
```

### Directional Border Light

Borders are not uniform. Light comes from the top-left (candlelight).

```css
.panel {
  border-top: 1px solid #2A4A3E;    /* patina — brightest */
  border-left: 1px solid #243D33;   /* slightly dimmer */
  border-right: 1px solid #1A2E27;  /* dimmer still */
  border-bottom: 1px solid #151F1B; /* darkest — shadow side */
}

.panel:focus-within {
  border-top-color: #D4A01780; /* hwang at 50% on active panels */
}
```

---

## Component Specifications

### Button System

Three variants. Each has a clear job. Do not add more variants.

#### Primary — CTA

```css
.btn-primary {
  background: #D4A017;
  color: #0F0E0C;
  font-family: var(--font-cinzel);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 10px 24px;
  border: none;
  clip-path: polygon(
    0 6px, 6px 0,
    calc(100% - 6px) 0, 100% 6px,
    100% calc(100% - 6px), calc(100% - 6px) 100%,
    6px 100%, 0 calc(100% - 6px)
  ); /* angled corners — not rounded */
  transition: background 150ms, box-shadow 200ms, transform 100ms;
}
.btn-primary:hover {
  background: #F5C518;
  box-shadow: 0 0 20px #D4A01770, 0 0 40px #D4A01730;
}
.btn-primary:active {
  transform: scale(0.96);
  box-shadow: none;
}
```

**Important:** clip-path angled corners replace `border-radius`. Never use `rounded-*` on primary buttons.

#### Secondary — Ghost

```css
.btn-secondary {
  background: transparent;
  color: #F0EAD6;
  border: 1px solid #2A4A3E;
  font-family: var(--font-cinzel);
  font-size: 0.875rem;
  letter-spacing: 0.06em;
  padding: 10px 24px;
  border-radius: 2px;
  transition: border-color 200ms, color 200ms, box-shadow 200ms;
}
.btn-secondary:hover {
  border-color: #D4A01760;
  color: #D4A017;
  box-shadow: inset 0 0 16px #D4A01710;
}
```

#### Danger — Destructive

```css
.btn-danger {
  background: transparent;
  color: #C0392B;
  border: 1px solid #C0392B50;
  font-size: 0.875rem;
  letter-spacing: 0.04em;
  padding: 8px 20px;
  border-radius: 2px;
  transition: background 150ms, box-shadow 150ms;
}
.btn-danger:hover {
  background: #C0392B15;
  box-shadow: 0 0 12px #C0392B40;
}
```

---

### Card / Panel Anatomy

Every panel has the same four-layer anatomy.

```
┌── [dancheong stripe 3px] ──────────────────────────┐
│                                                     │
│  [left accent strip 2px, in grade/type color]       │
│                                                     │
│  [content zone — 16px padding]                      │
│                                                     │
│  [footer zone — actions, metadata, 12px top border] │
└─────────────────────────────────────────────────────┘
```

```css
.card {
  background: #252220;
  border-top: 1px solid #2A4A3E;
  border-left: 1px solid #243D33;
  border-right: 1px solid #1A2E27;
  border-bottom: 1px solid #151F1B;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* Dancheong stripe */
.card::before {
  content: '';
  display: block;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    #D4A017 0px, #D4A017 6px,
    #C0392B 6px, #C0392B 12px,
    #1A5F7A 12px, #1A5F7A 18px,
    #6B3FA0 18px, #6B3FA0 24px,
    #2A4A3E 24px, #2A4A3E 30px
  );
}

/* Left accent strip — color set by --card-accent variable */
.card::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 0;
  width: 2px;
  bottom: 0;
  background: var(--card-accent, #2A4A3E);
}

/* Hover — gold bleeding from top-left */
.card:hover {
  border-top-color: #D4A01750;
  border-left-color: #D4A01730;
  box-shadow: 0 0 0 1px #D4A01710, 0 4px 24px #00000060;
  transform: translateY(-1px);
  transition: all 200ms ease-out;
}
```

---

### Stat Bar — Segmented

Do not use a smooth gradient fill bar. Use a segmented system.

```
Strength  [■■■■■■■■□□□□□□□]  67
```

```css
.stat-bar {
  display: flex;
  gap: 1px;
  align-items: center;
  height: 8px;
}

.stat-bar__segment {
  flex: 1;
  height: 100%;
  border-radius: 1px;
  background: #252220;
  border: 1px solid #2A4A3E30;
  transition: background 400ms ease-out, box-shadow 400ms ease-out;
}

.stat-bar__segment--filled {
  background: var(--stat-color);
  box-shadow: 0 0 4px var(--stat-color-glow);
  border-color: transparent;
}

/* Tip pulse — only on the last filled segment */
.stat-bar__segment--tip {
  animation: tip-pulse 2s ease-in-out infinite;
}

@keyframes tip-pulse {
  0%, 100% { box-shadow: 0 0 4px var(--stat-color-glow); }
  50%       { box-shadow: 0 0 10px var(--stat-color-glow), 0 0 20px var(--stat-color-glow); }
}
```

**Number display — editorial tension:**
```
67        ← 2.25rem Cinzel Decorative, obangsaek color, line-height 1
STRENGTH  ← 0.6rem Inter, stone-500, letter-spacing 0.16em
```

The number dominates. The label is a whisper below it.

---

### Quest Card

```css
/* Paper-warp hover */
.quest-card {
  transition: transform 200ms ease-out;
  transform-style: preserve-3d;
  perspective: 800px;
}
.quest-card:hover {
  transform: rotateX(1deg) rotateY(-0.5deg) translateY(-2px);
}
```

**Grade badge shapes:**
```css
/* Hexagon — Main quest */
.badge--main {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: #C0392B;
  box-shadow: 0 0 8px #C0392B80;
  width: 20px; height: 22px;
}
/* Octagon — Weekly */
.badge--weekly {
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  background: #6B3FA0;
  width: 20px; height: 20px;
}
/* Circle — Daily */
.badge--daily {
  border-radius: 50%;
  background: #1A5F7A;
  box-shadow: 0 0 6px #1A5F7A80;
  width: 18px; height: 18px;
}
```

**Urgency via color (not just text):**

| 상태 | --card-accent | 추가 효과 |
|---|---|---|
| 기본 | `#2A4A3E` (patina) | — |
| 오늘 마감 | `#E07B39` (ember) | — |
| 3시간 이내 | `#E07B39` (ember) | 카드 전체 ember glow |
| 기한 초과 | `#C0392B` (jeok) | title → jeok color |
| 완료 | `#F5C518` (gilded) | opacity 50%, 체크 오버레이 |

---

### Stat Panel — Hologram HUD

```css
.stat-panel {
  background: rgba(15, 14, 12, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  clip-path: polygon(
    0 16px, 16px 0,
    calc(100% - 16px) 0, 100% 16px,
    100% calc(100% - 16px), calc(100% - 16px) 100%,
    16px 100%, 0 calc(100% - 16px)
  );
  border: 1px solid #2A4A3E50;
  position: relative;
  padding: 20px 24px;
}

/* Scanline overlay */
.stat-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.08) 3px,
    rgba(0, 0, 0, 0.08) 4px
  );
}

/* Gold corner accent marks */
.stat-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(135deg, #D4A01740 0 20px, transparent 20px) top left,
    linear-gradient(225deg, #D4A01740 0 20px, transparent 20px) top right,
    linear-gradient(315deg, #D4A01740 0 20px, transparent 20px) bottom right,
    linear-gradient(45deg, #D4A01740 0 20px, transparent 20px) bottom left;
  background-size: 20px 20px;
  background-repeat: no-repeat;
}
```

Header: `S T A T U S` — 0.65rem / letter-spacing: 0.3em / stone-400.
Below: 1px gold line, then stat rows.

---

### NPC Dialog

```css
.dialog--knight { --npc-glow: #D4A017; }
.dialog--rival  { --npc-glow: #C0392B; }
.dialog--sage   { --npc-glow: #1A5F7A; }

.dialog {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--npc-glow) 30%, transparent),
    0 0 24px color-mix(in srgb, var(--npc-glow) 20%, transparent),
    0 8px 48px #00000080;
}
```

Corner decoration: small SVG lattice (창호 inspired) at each corner, abstract enough to read globally.

---

### Navigation

**Desktop sidebar active indicator:**
```css
.nav-item--active {
  color: #D4A017;
  position: relative;
}
.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0; top: 4px; bottom: 4px;
  width: 2px;
  background: #D4A017;
  box-shadow: 0 0 8px #D4A01780;
}
```

**Mobile tab bar — indicator above, not below:**
```css
.tab-bar {
  background: #141210;
  border-top: 1px solid #2A4A3E;
  height: 64px;
}
.tab-item--active::before {
  content: '';
  position: absolute;
  top: 0; left: 16px; right: 16px;
  height: 2px;
  background: #D4A017;
  box-shadow: 0 0 8px #D4A01780;
}
```

The indicator descends from above — like a royal seal being stamped down.

---

### Form Inputs

```css
.input {
  background: #1C1A18;
  border: 1px solid #2A4A3E;
  border-radius: 2px;
  color: #F0EAD6;
  font-family: var(--font-inter);
  font-size: 0.875rem;
  padding: 10px 14px;
  width: 100%;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.input:focus {
  border-color: #D4A01780;
  box-shadow: 0 0 0 3px #D4A01715;
}
.input::placeholder {
  color: #5A5550;
}
```

Select: custom-styled, no browser default arrow, SVG chevron in patina color.

---

### Modal / Overlay

```css
.modal-overlay {
  background: rgba(15, 14, 12, 0.85);
  backdrop-filter: blur(4px);
}

.modal {
  background: #2C2927;
  border-top: 1px solid #2A4A3E;
  border-left: 1px solid #243D33;
  border-right: 1px solid #1A2E27;
  border-bottom: 1px solid #151F1B;
  border-radius: 4px;
  box-shadow: 0 24px 80px #00000090;
  max-width: 480px;
  width: 100%;
  animation: modal-enter 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
```

---

### Loading State — Dancheong Shimmer Skeleton

Do not use gray `animate-pulse`. Use obangsaek shimmer.

```css
@keyframes dancheong-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #1C1A18 0%,
    #2A4A3E30 20%,
    #D4A01720 40%,
    #C0392B10 50%,
    #2A4A3E30 60%,
    #1C1A18 80%
  );
  background-size: 800px 100%;
  animation: dancheong-shimmer 1.8s infinite linear;
  border-radius: 2px;
}
```

---

### Toast / Notification

Position: top-right (desktop) / top-center (mobile). Duration: 3s → slide-up + fade.

```
Success: patina border + faint gold glow
Error:   jeok border + faint crimson glow
```

Structure: 3px dancheong stripe top + icon + short message + stat gained (in obangsaek color).

---

## Motion & Animation

| Trigger | Animation | Implementation |
|---|---|---|
| Page enter (첫 방문) | Staggered: bg → NPC 배너 → 카드들 → stat panel | CSS animation-delay |
| Stat bar fill | 0 → current value, 0.8s ease-out | CSS width transition |
| Stat number | Count-up, 0.4s | `requestAnimationFrame` loop |
| Quest complete | Seal stamp → fade + collapse → XP popup | `setTimeout` chain |
| XP popup | Float up + fade out | `animate-xp-popup` |
| NPC dialogue | Typing cursor | `TypingText` component |
| Button hover | Gold glow pulse | `box-shadow` transition |
| Button click | `scale(0.96)` → `scale(1)` | `active:scale-[0.96]` |
| Modal enter | `scale(0.94) + opacity 0` → normal | CSS keyframe |
| Card hover | Paper-warp 3D tilt + translateY(-1px) | CSS perspective + transform |
| Video loading | Obangsaek conic-gradient spinner | `conic-gradient` rotate |
| All quests done | 오방색 파티클 버스트 + Haechi | Canvas or CSS animation |

---

## Typography — Editorial Tension

**Key principle:** Giant numbers + whisper-level labels. Never uniform sizing.

```
S T A T U S                    ← 0.65rem Inter, letter-spacing 0.3em, stone-500
─ ─ ─ ─ ─ ─ ─ ─

67                             ← 2.25rem Cinzel Decorative, jeok, line-height 1
S T R E N G T H               ← 0.6rem Inter, letter-spacing 0.16em, stone-500

[■■■■■■■■□□□□□□□]

54                             ← 2.25rem Cinzel Decorative, cheong
I N T E L L I G E N C E      ← 0.6rem

─────────────────────────────

42           7                 ← 1.875rem Cinzel Deco, side by side
QUESTS DONE  STREAK DAYS      ← 0.6rem captions below
```

---

## Implementation Roadmap

1. **Font setup** — Cinzel + Cinzel Decorative + Inter (EN) / Hahmlet + Noto Sans KR (KR) via `next/font`
2. **CSS variables** — register color tokens in `globals.css`
3. **Tailwind extension** — add color tokens to `tailwind.config.ts`
4. **Background layers** — warm base + noise grain + 창살 lattice in `globals.css`
5. **Dancheong stripe** — `DancheongStripe` component
6. **Giwa divider** — `GiwaDivider` SVG component
7. **Quest card** — grade badge shapes + left accent + paper-warp hover + urgency color system
8. **Stat panel** — hologram HUD: clip-path + scanline + corner accents + segmented bar
9. **NPC dialog** — dancheong header + obangsaek glow + 창호 corner SVG
10. **Skeleton** — dancheong shimmer replacing gray pulse
11. **Haechi SVG** — empty state + error state + completion
12. **Video loading spinner** — obangsaek conic-gradient

---

## Anti-Patterns — Explicitly Banned

| Banned Pattern | Why | Alternative |
|---|---|---|
| `text-white` (`#FFFFFF`) | Cold, flat — kills warmth | Use `#F0EAD6` (baek) |
| Purple-to-blue gradients | #1 "AI UI" signature | Obangsaek gradients only |
| `rounded-lg` / `rounded-xl` on panels | Bootstrap/Material feel | `rounded` (4px) or `clip-path` |
| Gray `animate-pulse` skeleton | No design intent | Dancheong shimmer skeleton |
| Uniform border on all 4 sides | Flat, lifeless | Directional candlelight borders |
| `hover:bg-*` only hover state | No personality | Gold bleeding border + glow |
| Even font sizing across a card | Boring hierarchy | Editorial tension: huge number + whisper label |
| `shadow-md` / `shadow-lg` everywhere | Generic depth | Only shadows on modals and floating elements |
| Emoji icons as UI icons | Breaks aesthetic | SVG icons with obangsaek color fills |
| Bottom tab underline indicator | Mobile OS default | Top-line indicator descending like a stamp |
| Smooth gradient stat bar | Generic health bar feel | Segmented dots with tip pulse |
| Blue focus ring (`ring-blue-500`) | Browser default | `ring-1 ring-[#D4A017]` with glow |
| Cards that look like product tiles | E-commerce feel | Left accent strip + angular corners |
| `border-radius: 0.75rem+` on anything | SaaS dashboard feel | Max 4px radius, or clip-path |
