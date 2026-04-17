# Chronicles of 나 — Design System V2

> **코드네임: 우리의 서책 (The Chronicle Book)**
> 앱 자체가 연대기다. UI는 살아있는 필사본이다.

---

## 0. V1 → V2 전환 근거

### V1의 강점 (유지)
- Obangsaek 색채 의미론 — 색이 원소를 의미하는 시스템
- 한국 정체성 — 한자 없이 형태와 색으로만 전달
- 어두운 단일 테마
- Hahmlet 폰트 — 유지

### V1의 문제
| 문제 | 원인 | V2 해법 |
|---|---|---|
| "RPG 클리셰" 느낌 | Cinzel + clip-path octagon + glow = 범용 판타지 게임 UI | 필사본 editorial 방향으로 전환 |
| 이모지 남발 (⚔️🦁🎬) | 아이콘 시스템 없이 이모지로 대체 | Lucide 아이콘 + 커스텀 SVG 인장 |
| 레이아웃 평범함 | 사이드바 + 메인 = 어느 대시보드나 똑같음 | Folio 양면 레이아웃 |
| 폰트 충돌 | Cinzel(로마자) + Hahmlet(한국어) 미학이 이질적 | Cormorant Garamond + Gowun Batang으로 통일 |
| 모션 산만함 | 인터랙션마다 다른 스타일 | 잉크 번짐 단일 원칙 |

---

## 1. 컨셉 & 철학

### 핵심 은유: 살아있는 필사본

사용자가 앱을 열 때마다, **한 권의 연대기를 펼치는 것**이다.

- Dashboard = 펼쳐진 책 (folio 양면)
- 퀘스트 카드 = 필사본 항목 (decorative initial + 여백 인장)
- 스탯 패널 = 책 여백 주석 (marginalia)
- 브리핑 = 봉인된 서한을 뜯는 의식
- 리캡 = 챕터 마지막 삽화

### 세 가지 설계 원칙 (V1 계승, 재해석)

#### 1. 여백이 호흡한다
V1: "채우지 않는다"  
V2: **여백은 종이의 질감이다.** 빈 공간도 parchment 텍스처를 가진다. 단순히 비운 것이 아니라 의도된 여백.

#### 2. 색은 원소다 (V1 동일)
오방색 의미론 유지. 단, 채도를 낮춰 고미술품의 색으로.  
새 팔레트는 "갓 칠한 단청"이 아니라 **"50년 된 단청의 빛"**.

#### 3. 장식이 구조다 (V1 동일, 형태 변경)
V1: Dancheong stripe, clip-path octagon  
V2: **코너 오너먼트**, **장정 금선 (binding line)**, **초서 드롭캡** — 모두 구조와 장식을 동시에 담당.

---

## 2. 색채 시스템 V2

### 배경 레이어 — 옻칠 단계

```
heuk-deep:    #0D0B08   → 가장 어두운 배경 (바탕)
lacquer:      #181411   → 기본 배경
aged-panel:   #211D19   → 패널 배경
manuscript:   #2A2420   → 카드 / 모달 배경
manuscript+:  #332D27   → 호버 상태
```

V1보다 **더 따뜻하고 더 어둠** — blue-black이 아닌 brown-black.  
이유: 옻칠의 깊이. 순수 검정은 싸 보인다.

### 오방색 V2 — "50년 된 빛"

| 토큰 | Hex | V1 비교 | 역할 |
|---|---|---|---|
| `gold-antique` | `#B8860B` | `#D4A017` (-25% brightness) | CTA, XP, 1순위 강조 |
| `gold-gilt` | `#D4A827` | `#F5C518` (-15% brightness) | 하이라이트, 완료 |
| `crimson-aged` | `#9B2D20` | `#C0392B` (-20% brightness) | 근력, 위험, 메인 퀘스트 |
| `teal-celadon` | `#2E6B5A` | `#1A5F7A` (more green) | 지력, 지혜, 평온 |
| `violet-court` | `#5C3580` | `#6B3FA0` (-15% brightness) | 매력, 희귀 |
| `parchment` | `#E8DBBE` | `#F0EAD6` (-5% brightness) | 기본 텍스트 |
| `ink-faded` | `#8B7B60` | `stone-400` | 보조 텍스트 |
| `celadon-border` | `#3D6B5E` | `#2A4A3E` | 기본 테두리 |

### 사용 규칙

```
배경:    heuk-deep → lacquer → aged-panel → manuscript
텍스트:  parchment(기본) / ink-faded(보조) / gold-antique(강조)
테두리:  celadon-border(기본) / gold-antique(활성/호버)
스탯:    crimson-aged(근력) / teal-celadon(지력) / violet-court(매력)
```

### 텍스처 레이어

모든 배경 패널에 CSS noise 텍스처 적용:

```css
/* 종이/양피지 질감 */
.parchment-texture {
  background-image:
    url("data:image/svg+xml,..."),  /* SVG noise */
    radial-gradient(ellipse at 30% 20%, rgba(184,134,11,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(46,107,90,0.03) 0%, transparent 60%);
}
```

---

## 3. 타이포그래피 시스템 V2

### 폰트 교체 근거

| V1 | V2 | 이유 |
|---|---|---|
| Cinzel | **Cormorant Garamond** | Cinzel은 로마 대문자만. Cormorant는 소문자도 아름답고, 획 대비가 극적, old-style 숫자 지원 |
| Inter | **DM Mono** (숫자/데이터) + **Lora** (본문) | Inter는 중립적 → 개성 없음. DM Mono는 스탯 숫자에 정확성, Lora는 따뜻한 서체 |
| Hahmlet | **Hahmlet** (유지) | 한국어 최선. 계속 사용 |
| Noto Sans KR | **Gowun Batang** | 더 전통적인 한국 명조. 필사본 느낌에 맞음 |
| Cinzel Decorative | **Cormorant SC** | 소문자 대문자체, 더 정교함 |

### 타입 스케일

| 레벨 | 크기 | 폰트 | 자간 | 용도 |
|---|---|---|---|---|
| Display | 3rem / 300 | Cormorant Garamond | -0.02em | 페이지 타이틀 |
| Heading 1 | 1.875rem / 600 | Cormorant Garamond | -0.01em | 섹션 헤딩 |
| Heading 2 | 1.375rem / 600 | Cormorant Garamond | 0 | 카드 타이틀 |
| Caption UI | 0.6875rem / 400 | Cormorant SC | 0.12em | 섹션 라벨 (대문자) |
| Body | 1rem / 400 | Lora / Hahmlet | 0 | 설명, NPC 대화 |
| Small | 0.8125rem / 400 | Lora / Gowun Batang | 0 | 날짜, 메타데이터 |
| Stat Number | 2.5rem / 300 | Cormorant Garamond | -0.03em | 스탯 수치 (old-style) |
| Data Mono | 0.875rem / 400 | DM Mono | 0.04em | XP, 코드, 타임스탬프 |

### 한국어 규칙

- 퀘스트 제목, NPC 대화: Hahmlet (붓 서체 느낌)
- 날짜, 메타: Gowun Batang (전통 명조)
- 버튼, UI 라벨: Gowun Batang
- 영문 혼용 시: Cormorant + Hahmlet 혼합 (자연스럽게 흐름)

---

## 4. 레이아웃 시스템 V2 — Folio 양면

### 컨셉: 펼쳐진 책

V1의 "사이드바 + 메인" 구조를 **좌우 양면 레이아웃**으로 전환.

```
Desktop (≥1024px):
┌──────────────────────┬──────────────────────────┐
│    좌면 (LEFT PAGE)   │    우면 (RIGHT PAGE)      │
│    240px 고정        │    flex-grow              │
│                      │                          │
│  Chronicles of 나     │  [퀘스트 보드]            │
│  ─────────────────── │                          │
│  [Character Sheet]   │                          │
│                      │                          │
│  [Navigation Links]  │                          │
└──────────────────────┴──────────────────────────┘
          ▲ binding-line (2px, gold-antique + shadow)
```

### Binding Line (장정선)

두 면의 경계는 단순 divider가 아닌 **책의 제본선**:

```css
.binding-line {
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--gold-antique) 20%,
    var(--gold-antique) 80%,
    transparent
  );
  box-shadow: 0 0 8px rgba(184,134,11,0.3);
}
```

### 그리드 시스템

```
xs (< 640px):    1 column, 16px gutter
sm (640-768px):  1 column, 24px gutter
md (768-1024px): 1 column (사이드바 없음, bottom nav)
lg (≥ 1024px):  240px sidebar + flex-grow main (folio)
xl (≥ 1280px):  280px sidebar + flex-grow main
```

### 상단 Running Header

책의 러닝 헤더처럼:

```
좌면 상단: Chronicles of 나                    우면 상단: 퀘스트 보드
           (in Cormorant SC, 0.65rem, gold)              (section name)
```

---

## 5. 컴포넌트 설계 V2

### 5-1. 퀘스트 카드 → 필사본 항목 (Manuscript Entry)

```
┌── [LEFT MARGIN] ──┬────────────────────────────────────────┐
│                   │                                        │
│  [등급 인장]       │  보고서 마왕 처치                       │
│  (seal SVG)       │  (Hahmlet, 1.125rem)                   │
│                   │                                        │
│  [완료: 붉은 도장]  │  INT  +30    D-3 남음                  │
│                   │  (DM Mono, celadon / gold)             │
└───────────────────┴────────────────────────────────────────┘
```

**여백 인장 (Margin Seal):**
- Main Quest: 육각 윤곽 + 내부 선 패턴, crimson-aged
- Weekly: 팔각 윤곽, violet-court
- Daily: 원형 윤곽, teal-celadon

V1과의 차이:
- ❌ Clip-path 제거
- ❌ 3D hover tilt 제거 (산만함)
- ✅ 좌측 여백에 인장 배치 (책처럼)
- ✅ 세로 구분선 1px으로 여백/내용 분리
- ✅ 완료 시: 붉은 도장이 좌측 인장 위에 겹침 (seal over seal)

**호버 상태:**
```css
.quest-entry:hover {
  background: var(--manuscript+);
  border-color: var(--gold-antique);
  /* shadow는 없음 — 테두리로 충분 */
}
```

**완료 애니메이션 재설계:**
```
1. 완료 버튼 클릭 → 버튼 disabled + spinner (2px gold ring)
2. 400ms → 왼쪽 인장 위에 붉은 wax seal 드롭 (scale 2→1, 0.3s)
3. 200ms → 텍스트 opacity 0.4 (완료됨)
4. 300ms → 카드 height collapse + XP 팝업 (DM Mono, gold)
5. 스탯 바: 이전값→새값 카운트업 (Cormorant numerals)
```

---

### 5-2. 스탯 패널 → 책 여백 주석 (Marginalia)

V1의 clip-path octagon → V2의 **코너 오너먼트 프레임**

```
┌─◈──────────────────────◈─┐
│ S T A T U S               │  (Cormorant SC, 0.6rem, gold-antique)
│ ─────────────────────── │
│                            │
│  67                        │  (Cormorant, 2.5rem, crimson-aged)
│  Strength                  │  (Cormorant SC, 0.6rem, ink-faded)
│  ▓▓▓▓▓▓▓▓░░░░░░░          │  (세그먼트 바, 12세그먼트)
│                            │
│  54                        │  (teal-celadon)
│  Intelligence              │
│  ▓▓▓▓▓▓▓░░░░░░░           │
│                            │
│  32                        │  (violet-court)
│  Charisma                  │
│  ▓▓▓▓▓░░░░░░░░            │
│                            │
│ ─────────────────────── │
│  42 완수  ·  7일 연속      │  (DM Mono, 0.8rem)
└─◈──────────────────────◈─┘
```

**코너 오너먼트 ◈:**
```tsx
// components/ui/CornerOrnament.tsx
// 작은 마름모 + 가는 선 — 순수 CSS/SVG
```

V1과의 차이:
- ❌ clip-path, scanline, backdrop-blur 제거 (과잉)
- ✅ 코너 오너먼트로 프레임 효과
- ✅ 스탯 수치: Cormorant old-style numerals
- ✅ 세그먼트 바: 12칸 (V1 20칸은 너무 세밀)

---

### 5-3. 네비게이션 → 책갈피 탭

**Desktop 좌면:**
```
좌면 하단에 세로 수직 네비:
  ─ Quest Board  (활성: gold line 왼쪽)
  ─ Briefing
  ─ Recap
```

**Mobile Bottom Nav:**
```
[Quest Board]  [Briefing]  [Recap]
하단 고정, backdrop-blur, 1px celadon top border
```

---

### 5-4. 버튼

V1: clip-path octagon, gold background  
V2: **가는 테두리 직사각형 + hover fill**

```
기본:     1px solid gold-antique, transparent bg, gold-antique text
호버:     bg gold-antique, text heuk-deep (반전)
클릭:     scale(0.97)
비활성:   opacity 0.4, pointer-events none
```

타이포:
```
CTA 버튼:  Cormorant SC, 0.75rem, letter-spacing 0.12em
Secondary: Cormorant SC, 0.7rem, letter-spacing 0.1em
```

---

### 5-5. 빈 상태 → 해치 필사체

V1: 이모지 + 해치 텍스트  
V2: **해치 선화 SVG + 필사체 스타일 텍스트**

```
       [Haechi SVG — 96px, 1px stroke, gold-antique]
       
  아직 기록되지 않은 모험
  
  첫 번째 임무를 등록하고 전설을 시작하세요.

       [ 퀘스트 등록하기 ]
```

---

## 6. 모션 시스템 V2 — 잉크 번짐 원칙

**V1 문제:** 각 인터랙션마다 다른 모션 스타일.  
**V2 원칙:** 모든 모션은 **잉크가 종이에 스미는 물리**를 따른다.

### 잉크 모션 패밀리

| 모션 이름 | 속성 | 값 | 적용처 |
|---|---|---|---|
| `ink-appear` | opacity 0→1, blur 4px→0 | 0.35s ease-out | 텍스트 등장 |
| `ink-rise` | translateY 8px→0 + opacity | 0.4s ease-out | 카드 등장 |
| `ink-stamp` | scale 1.5→1, opacity 0→1 | 0.25s ease-out | 도장/인장 |
| `ink-collapse` | height →0, opacity 1→0 | 0.3s ease-in | 퀘스트 완료 collapse |
| `ink-count` | 숫자 카운트업 | rAF | 스탯 수치 |
| `page-fade` | opacity 0→1 | 0.5s | 페이지 전환 |

### 스태거 패턴

```
페이지 진입: 첫 방문만
  0ms:    좌면 (character sheet) ink-appear
  100ms:  NPC 배너 ink-rise
  200ms:  첫 번째 퀘스트 ink-rise
  280ms:  두 번째 퀘스트
  360ms:  세 번째 퀘스트
  ...     (80ms씩)
```

재방문 (당일 세션 내): 애니메이션 없음.

### Reduced Motion 대응

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## 7. 화면별 UX 설계 V2

### 7-1. 대시보드 (퀘스트 보드)

#### 정보 계층 (V1과 동일, 구현만 변경)

```
1순위: 오늘 기한 / 기한 초과 퀘스트
2순위: 메인 스토리 퀘스트
3순위: 주간 / 일일 퀘스트
4순위: NPC 한마디 배너 (상단)
5순위: 스탯 (좌면 항상 노출)
```

#### Desktop 레이아웃

```
┌──────────────────────────┬─────────────────────────────────────┐
│ Chronicles of 나    LEFT  │  RIGHT    Quest Board               │
│ ─────────────────────── │ ─────────────────────────────────── │
│                          │                                     │
│ ┌──────────────────────┐ │ ┌─ NPC 배너 ──────────────────────┐ │
│ │ S T A T U S          │ │ │  "전하, 지력이 위태롭습니다..."   │ │
│ │ ◈────────────────◈  │ │ │                [ 브리핑 시작 → ] │ │
│ │  67                  │ │ └─────────────────────────────────┘ │
│ │  Strength  ▓▓▓░░░   │ │                                     │
│ │  54                  │ │ MAIN STORY                          │
│ │  Intelligence ▓▓░░  │ │ ┌── [◈]  보고서 마왕 처치 ─────────┐ │
│ │  32                  │ │ │         INT +30 · D-3 · ⚠긴급   │ │
│ │  Charisma  ▓░░░░    │ │ │                        [완료하기] │ │
│ │ ◈────────────────◈  │ │ └─────────────────────────────────┘ │
│ └──────────────────────┘ │                                     │
│                          │ WEEKLY                              │
│ ──────────────────────   │ ┌── [◈]  주간 독서 ────────────────┐ │
│ Quest Board ←현재        │ │         CHA +20 · D-5            │ │
│ Briefing                 │ │                        [완료하기] │ │
│ Recap                    │ └─────────────────────────────────┘ │
│                          │                                     │
│ ──────────────────────   │ DAILY                               │
│ 42 완수  ·  🔥 7일        │ ...                                 │
└──────────────────────────┴─────────────────────────────────────┘
```

#### Mobile 레이아웃

```
┌────────────────────────────────┐
│ Chronicles of 나               │  ← 상단 헤더 (Cormorant, 1rem)
│ STR 67  INT 54  CHA 32  🔥7일  │  ← 컴팩트 스탯 1줄
├────────────────────────────────┤
│ NPC 배너                       │
│ "전하, 지력이 위태롭습니다..."   │
│                  [브리핑 →]    │
├────────────────────────────────┤
│ MAIN STORY                     │
│ ┌──────────────────────────┐   │
│ │ [◈]  보고서 마왕 처치     │   │
│ │      INT +30 · ⚠긴급     │   │
│ │               [완료하기]  │   │
│ └──────────────────────────┘   │
│ ...                            │
├────────────────────────────────┤
│ [퀘스트]   [브리핑]   [리캡]    │  ← 하단 고정 네비
└────────────────────────────────┘
```

#### NPC 배너 (V1 개선)

V1: 템플릿 텍스트  
V2: **동일 — 템플릿 텍스트 유지** (AI 호출 없음, 빠름)

추가 개선:
- NPC 아이콘 (Lucide 기반 커스텀) 좌측에 배치
- 배너 배경: `manuscript` + 좌측 NPC 색상 accent bar 4px
- "브리핑 시작" 링크만 있으면 충분, 버튼 크기 줄임

---

### 7-2. NPC 브리핑

**V2 컨셉: 봉인 서한 개봉**

```
[전체 화면 배경: lacquer + 미세 노이즈 텍스처]

         ┌─────────────────────────────────┐
         │  [코너 오너먼트]         [◈]    │
         │                                 │
         │  [NPC 아이콘]  Guardian Knight  │  ← Cormorant SC
         │  ─────────────────────────── │
         │                                 │
         │  "전하, 지력이 위태롭습니다.     │  ← Hahmlet 1rem, parchment
         │   오늘 밤 반드시 갈고 닦으소서.  │
         │   그 임무들이 그대를 기다립니다." │
         │                             ▋   │  ← blinking cursor
         │                                 │
         │  ─────────────────────────── │
         │  [퀘스트 시작하기 →]            │  ← 완료 후 등장
         │                                 │
         │  [◈]                   [◈]    │
         └─────────────────────────────────┘

              ⚔  ─  🗡  ─  📜               ← NPC 변경 (아이콘만)
```

**변경사항:**
- 창호 격자 SVG 코너 → 코너 오너먼트 (더 단순)
- 배경 Haechi 실루엣 유지 (10% opacity)
- NPC별 색상 accent: 헤더 좌측 4px 수직 바

---

### 7-3. 리캡 목록 & 상세

#### 목록 페이지

```
┌────────────────────────────────────────────┐
│ Chronicles of 나  /  Recap                  │
├────────────────────────────────────────────┤
│                                            │
│ 이번 주 리캡                               │
│ ┌──────────────────────────────────────┐   │
│ │  Week 15, 2025                       │   │
│ │  완료 퀘스트 12개 · INT 주도          │   │
│ │  [영상 생성하기]  또는  [생성 중...]   │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ 이전 기록                                  │
│ ┌──────┐  ┌──────┐  ┌──────┐             │
│ │ Ep11 │  │ Ep10 │  │ Ep 9 │             │
│ │ W14  │  │ W13  │  │ W12  │             │
│ └──────┘  └──────┘  └──────┘             │
└────────────────────────────────────────────┘
```

#### 상세 페이지 (개별 리캡)

```
┌─────────────────────────────────────────┐
│  ← 뒤로    Episode 12  ·  Week 15, 2025 │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │       [16:9 Video Player]       │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  "보고서 마왕과의 전투"                  │  (Cormorant, 1.5rem)
│                                         │
│  장면 목록                              │  (Cormorant SC label)
│  ─────────────────────────────────     │
│  1  지력의 위기    INT 퀘스트 3개       │
│  2  근력의 재건    STR 퀘스트 완주      │
│  3  결말          모든 임무 완수        │
│                                         │
│                      [ 공유하기 ↗ ]     │
└─────────────────────────────────────────┘
```

---

### 7-4. 온보딩 (NPC 선택)

**V2: 세 개의 필사본 카드**

V1: 이모지 카드  
V2: **아이콘 + 조각된 느낌의 카드**

```
          Chronicles of 나

     동반자를 선택하세요

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  [기사 아이콘]│ │[라이벌 아이콘]│ │[현자 아이콘] │
│             │ │             │ │             │
│  Guardian   │ │   Rival     │ │    Sage     │
│  Knight     │ │             │ │             │
│             │ │             │ │             │
│ 충직하고     │ │ 도발적이고   │ │ 조용하고    │
│ 걱정이 많다  │ │ 강하다       │ │ 시적이다    │
└─────────────┘ └─────────────┘ └─────────────┘
```

카드 hover: celadon-border → NPC 색상 테두리 + 카드 slight rise  
카드 선택: wax seal stamp animation + 화면 전환

---

### 7-5. 로그인 / 회원가입

**V2: 좌측 브랜드, 우측 폼 — 분할 화면**

```
┌────────────────────┬─────────────────────────┐
│                    │                         │
│   Chronicles of 나  │   로그인               │
│                    │                         │
│   "당신의 모험이    │   이메일 ____________   │
│    기다리고 있습니다" │   비밀번호 __________   │
│                    │                         │
│   [해치 선화]       │   [로그인하기]           │
│                    │                         │
│                    │   계정이 없으신가요?       │
│                    │   회원가입 →             │
└────────────────────┴─────────────────────────┘
```

---

## 8. 아이콘 시스템

V1: 이모지 (⚔️🦁🎬) — 플랫폼마다 다르게 보임  
V2: **Lucide React 기반 커스텀 SVG 조합**

| 용도 | 아이콘 | Lucide |
|---|---|---|
| 퀘스트 보드 | Scroll | `scroll` |
| 브리핑 | MessageSquare | `message-square` |
| 리캡 | Film | `film` |
| 완료 버튼 | Check | `check` |
| 퀘스트 추가 | Plus | `plus` |
| 기한 경고 | AlertTriangle | `alert-triangle` |
| 스트릭 | Flame | `flame` |
| NPC Knight | Shield | `shield` |
| NPC Rival | Swords | `swords` |
| NPC Sage | BookOpen | `book-open` |

이모지는 전부 제거. 단, 빈 상태 Haechi는 커스텀 SVG 선화 유지.

---

## 9. 접근성 (Accessibility)

- 색 대비: WCAG AA 이상 (parchment on lacquer = 12:1)
- 포커스 링: `outline: 1.5px solid gold-antique`, `outline-offset: 3px`
- 스크린 리더: 모든 아이콘 `aria-label`, NPC 타이핑 텍스트 `aria-live`
- Reduced motion: 모든 애니메이션 비활성화 가능
- 키보드 내비게이션: 탭 순서 논리적 유지

---

## 10. 구현 우선순위

### Phase 1 — 기반 (디자인 토큰 + 전역)
1. `tailwind.config.ts` — 새 색상 토큰, 폰트 변수, 새 keyframes
2. `globals.css` — 텍스처 레이어, 코너 오너먼트, 새 컴포넌트 base 스타일
3. `app/layout.tsx` — 폰트 교체 (Cormorant Garamond, DM Mono, Lora, Gowun Batang)

### Phase 2 — 셸 레이아웃
4. `app/dashboard/layout.tsx` (또는 신규) — Folio 양면 레이아웃 구현
5. 네비게이션 컴포넌트 (Desktop / Mobile)
6. `CornerOrnament.tsx` — 재사용 가능한 코너 오너먼트

### Phase 3 — 핵심 컴포넌트
7. `QuestCard` — 필사본 항목 스타일 재설계
8. `CharacterSheet` — 코너 오너먼트 프레임, Cormorant 숫자
9. `StatBar` — 12세그먼트, 새 색상
10. `NPCBanner` — NPC accent bar 스타일

### Phase 4 — 페이지별
11. `briefing/page.tsx` — 봉인 서한 레이아웃
12. `recap/page.tsx` — 에피소드 그리드
13. `recap/[id]/page.tsx` — 영상 + 장면 목록
14. `onboarding/page.tsx` — 세 카드 선택 화면
15. `login/page.tsx`, `signup/page.tsx` — 분할 화면

### Phase 5 — 모션 & 폴리싱
16. 잉크 번짐 모션 keyframes 통일
17. 완료 도장 애니메이션 재구현
18. 빈 상태 Haechi 커스텀 SVG

---

## 11. 변경하지 않는 것

| 항목 | 유지 이유 |
|---|---|
| Supabase 연동 전체 | 백엔드 변경 없음 |
| API routes 모두 | 기능 동일 |
| Obangsaek 의미론 | 색의 의미는 V2에도 동일 |
| 다크 단일 테마 | RPG 분위기 유지 |
| Hahmlet 폰트 | 한국어 최선 |
| 애니메이션 트리거 로직 | 완료, 스탯 업, 팝업 등 |
| 세션 기반 첫 방문 판단 | 진입 애니메이션 조건 |

---

## 부록 A — 폰트 설정 코드

```ts
// app/layout.tsx
import { Cormorant_Garamond, DM_Mono, Lora } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-lora',
})

// Korean: Hahmlet, Gowun Batang (next/font/google)
import { Hahmlet, Gowun_Batang } from 'next/font/google'

const hahmlet = Hahmlet({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-hahmlet',
})

const gowunBatang = Gowun_Batang({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-gowun',
})
```

---

## 부록 B — 핵심 CSS 변수

```css
:root {
  /* 배경 레이어 */
  --heuk-deep:    #0D0B08;
  --lacquer:      #181411;
  --aged-panel:   #211D19;
  --manuscript:   #2A2420;
  --manuscript+:  #332D27;

  /* 오방색 V2 */
  --gold-antique: #B8860B;
  --gold-gilt:    #D4A827;
  --crimson-aged: #9B2D20;
  --teal-celadon: #2E6B5A;
  --violet-court: #5C3580;

  /* 테두리 */
  --celadon-border: #3D6B5E;

  /* 텍스트 */
  --parchment:    #E8DBBE;
  --ink-faded:    #8B7B60;

  /* 폰트 */
  --font-display: var(--font-cormorant), 'Gowun Batang', serif;
  --font-body:    var(--font-lora), var(--font-hahmlet), serif;
  --font-mono:    var(--font-dm-mono), monospace;
  --font-korean:  var(--font-hahmlet), var(--font-gowun), serif;
}
```

---

*문서 버전: V2.0 | 2026-04-17*
*이전 문서: DESIGN.md, DESIGN_SYSTEM.md, DESIGN_UX.md*
