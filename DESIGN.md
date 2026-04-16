# Design: Chronicles of [나]

> "Korean myth lives here"
> A guardian Haechi watches the quest board. Dancheong colors blaze across the stat panel.

**관련 문서:**
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — 컴포넌트 명세, 공간 시스템, Anti-patterns (구현 시 참조)
- [`DESIGN_UX.md`](./DESIGN_UX.md) — 화면별 UX 명세 (기능 개발 전 참조)

---

## Concept

**Korean Fantasy RPG** — the aesthetic of Joseon palace culture fused with MMORPG epic storytelling.

The user is a hero in a kingdom. Quests are royal decrees. Stats are the flow of body, mind, and spirit.
No Chinese characters anywhere — the Korean identity comes through shape, color, and atmosphere, not script.

---

### Three Core Principles of Korean Design

These principles are the foundation of every visual decision in this product.
When in doubt about a design choice, come back to these three.

#### 1. 여백 — Negative Space Speaks

Korean aesthetics *remove* to communicate.
Chinese design fills. Japanese design refines. Korean design **breathes**.

The Buncheong ware pot is not perfectly round — and that imperfection is the beauty.
The Dalhangari moon jar is not fully white — the slight warmth is the point.

**Applied here:**
- Panels do not pack every pixel. Whitespace is not empty — it is atmosphere.
- Stat bars do not stretch wall-to-wall. The unfilled portion has weight.
- Cards have internal padding that feels generous, not cramped.
- The quest board is a wall you can read, not a grid you scan frantically.

**Rule:** If a layout feels crowded, remove something. Never add more to fix a cluttered design.

---

#### 2. 자연 — Form and Color from Nature

Obangsaek (오방색) is not an arbitrary palette.
Each color is a natural element: earth (gold), sky (blue-green), fire (crimson), water (black), metal (white).
Joseon roof curves (giwa) follow the arc of a hill, not a compass.

**Applied here:**
- Colors carry elemental meaning, not just visual hierarchy. Gold = XP and growth. Crimson = strength and urgency. Teal = wisdom and calm.
- Shape language uses arcs, not just right angles. Giwa curves separate sections. Stat bars have a slight curve to their tip.
- Nothing is perfectly symmetrical. Badge shapes vary by quest type — hexagon, octagon, circle — as naturally as stones by a river.

**Rule:** Every color choice must have a meaning. Decorative-only color additions are rejected.

---

#### 3. 장식이 구조다 — Decoration Is Structure

Dancheong (단청) is not decoration applied on top of a building.
It *is* the wood-protection layer — function that became beautiful.
Haechi is not a lawn ornament. It is a fire-deterrent guardian — function made mythic.

**Applied here:**
- The dancheong stripe at the top of every panel is also a visual anchor that tells the user "this is a primary container."
- The Haechi mascot is also the empty-state communicator, warning NPC, and onboarding guide — not just a brand element.
- The giwa SVG divider is also a scroll affordance cue — it signals "more content below."
- Angular clip-path corners on the stat panel are also the visual language that distinguishes it from quest cards.

**Rule:** If a decoration serves no structural or communicative purpose, it does not belong.

---

### Mood Keywords
- Grand but warm
- Mysterious but playful
- Ancient-feeling but instantly readable

### Visual Reference Keywords
`Gyeongbokgung palace at night`, `dancheong patterns close-up`, `Haechi stone statue`, `joseon folk painting`, `obangsaek ceremonial cloth`

---

## Global-First Language Rules

- **No Chinese characters (한자)** anywhere in the UI — ever
- Color and pattern names in the design doc are internal shorthand only; they never appear in the product
- All UI copy is Korean or English depending on locale — no mixed script
- Fantasy names (Haechi, Dancheong, Obangsaek) are used as internal design language, not shown to users raw

---

## Color System

### Base Palette — Obangsaek mapped to game elements

| Color Name | Role in product | Hex | Tailwind approx |
|---|---|---|---|
| **Hwang** (Gold) | Primary accent, XP, CTA, legendary tier | `#D4A017` | `yellow-500` |
| **Jeok** (Crimson) | Strength stat, danger, main quest | `#C0392B` | `red-600` |
| **Cheong** (Teal-Blue) | Intelligence stat, wisdom, sage NPC | `#1A5F7A` | `cyan-800` |
| **Baek** (Warm White) | Body text, completed state, guardian NPC | `#F0EAD6` | `stone-100` |
| **Heuk** (Ink Black) | Background base, rival NPC | `#0F0E0C` | `gray-950` |

### Extended Palette

| Token name | Hex | Use |
|---|---|---|
| `paulownia` | `#1C1A18` | Panel background — dark warm brown |
| `ebony` | `#252220` | Card / modal background |
| `patina` | `#2A4A3E` | Border default — bronze-green |
| `violet` | `#6B3FA0` | Charisma stat — royal purple (outside obangsaek) |
| `gilded` | `#F5C518` | Brighter gold — achievement badges, completion |
| `ember` | `#E07B39` | Warning, overdue — dancheong orange |

### Color Usage Rules

```
Background layers:  #0F0E0C → paulownia(#1C1A18) → ebony(#252220)
Text:               baek(#F0EAD6) body  /  stone-400 secondary
Accent:             hwang(#D4A017) — CTA, headings, XP gains
Stat colors:        jeok = Strength  /  cheong = Intelligence  /  violet = Charisma
Borders:            patina(#2A4A3E) default  /  hwang(#D4A017) active / hover
```

---

## Typography

### Font Strategy — Global + Korean

The app targets global users. Display text must read beautifully in both English and Korean.

| Role | English font | Korean font | Notes |
|---|---|---|---|
| **Display** — page titles, quest names, NPC names | **Cinzel** | **Hahmlet** | Cinzel: ancient Roman serif, pure fantasy feel. Hahmlet: brush-stroke serif, Korean traditional. |
| **Body** — descriptions, labels, dates | **Inter** | **Noto Sans KR** | Clean, readable at all sizes. |
| **Stat numbers** — XP, level, streak | **Cinzel Decorative** | **Hahmlet Bold** | Numerals feel inscribed, monumental. |

```ts
// app/layout.tsx — next/font setup
import { Cinzel, Cinzel_Decorative, Inter } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' })
const cinzelDeco = Cinzel_Decorative({ subsets: ['latin'], weight: '700', variable: '--font-cinzel-deco' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Hahmlet + Noto Sans KR via Google Fonts (Korean subsets)
```

### Type Scale

| Level | Size | Font | Usage |
|---|---|---|---|
| Display | 2.5rem / 700 | Cinzel / Hahmlet | Page title, recap video title |
| Heading 1 | 1.75rem / 700 | Cinzel / Hahmlet | Section headings |
| Heading 2 | 1.25rem / 600 | Cinzel / Hahmlet | Card titles, NPC names |
| Body | 1rem / 400 | Inter / Noto Sans KR | Quest descriptions, UI labels |
| Caption | 0.75rem / 400 | Inter / Noto Sans KR | Dates, badges, secondary info |
| Stat Number | 2.25rem / 700 | Cinzel Deco / Hahmlet | Stat values — dominates the label below it |

---

## Visual Motifs

### 1. Dancheong Stripe — Panel accent band
A 3px horizontal stripe at the top of major panels, cycling through obangsaek colors. Pure CSS — no images.

```css
.dancheong-stripe::before {
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
```

### 2. Giwa Curve — Section divider
Traditional roof tile silhouette as SVG section divider between content blocks.

```tsx
// components/ui/GiwaDivider.tsx
export function GiwaDivider() {
  return (
    <div className="relative h-6 overflow-hidden my-4" aria-hidden>
      <svg viewBox="0 0 400 24" className="w-full fill-[#1C1A18] stroke-[#2A4A3E]">
        <path d="M0,24 Q50,0 100,24 Q150,0 200,24 Q250,0 300,24 Q350,0 400,24 L400,24 L0,24 Z" />
      </svg>
    </div>
  )
}
```

### 3. Haechi — Mascot & guardian icon
Haechi is the mythical creature that judges right from wrong. Used as:
- Empty state illustration on the quest board
- Welcome silhouette on onboarding
- Completion stamp animation trigger
- Error state (angry posture, jeok color)

No text label needed — Haechi is recognizable by silhouette and functions like a brand mascot.

### 4. Quest Grade Seals — Visual-only badge system
Grade badges use shape + color, no text labels needed:

```
Main quest  →  hexagon, jeok(crimson) fill + hwang(gold) border
Weekly      →  octagon, violet fill
Daily       →  circle, cheong(teal) fill
Overdue     →  rectangle, ember(orange) fill
Complete    →  gilded(bright gold) circle + checkmark ✓
```

---

## Dark Mode

**Single dark theme only.** No light mode.

Rationale:
- RPG and mythic atmosphere peaks on dark backgrounds
- Obangsaek colors read most vividly against near-black
- Halves design and engineering complexity for MVP

```
body:      #0F0E0C  (warm black — not pure, like old paper in candlelight)
panels:    #1C1A18  (paulownia)
cards:     #252220  (ebony)
modals:    #2C2927  (ebony+)
```
