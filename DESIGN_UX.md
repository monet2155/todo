# UX Design: Chronicles of [나]

> 화면별 UX 명세. 기능 개발 전 해당 화면 섹션을 읽을 것.
> 컨셉과 원칙은 [`DESIGN.md`](./DESIGN.md), 컴포넌트 명세는 [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

---

## Reference Points

| Reference | What we borrow |
|---|---|
| **Lineage (리니지)** | Heavy panel borders, seal/badge grade system, HP/MP bar layout, item rarity color tiers, gothic serif headings |
| **VR game stat windows** (SAO, Cyberpunk HUD) | Semi-transparent hologram panels, angular clip-path frames, scanlines, glow edges, count-up number animation |
| **Joseon palace** | Dancheong stripe, giwa divider, scroll-style cards, Haechi guardian |

---

## Screen 1 — Main Dashboard (Quest Board)

### 핵심 전제

메인 화면은 **생산성 앱의 대시보드**가 아니다.
유저는 매일 이 화면을 열 때 **자신의 전쟁 사령부에 입성**한다.

- 정보가 먼저가 아니라, **분위기가 먼저다**
- 유저를 환영하는 NPC가 있고, 임무가 벽에 걸려 있고, 내 상태가 부유하고 있다
- 첫 3초 안에 "오늘 할 일 1순위"가 눈에 보여야 한다
- 완료 행위 자체가 **쾌감**이어야 한다

### 정보 계층 (Information Hierarchy)

```
1순위 — 오늘 가장 긴급한 퀘스트 (기한 임박 / 메인 스토리)
2순위 — 스트릭 일수 + 현재 스탯 요약
3순위 — 나머지 퀘스트 목록
4순위 — NPC 한마디 (브리핑 진입점)
```

### 레이아웃 — Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ◈ Chronicles of [나]          ← 사이드바 상단 brand mark             │
│  ─────────────────────                                               │
│  ⚔  Quest Board      │  ┌─ NPC 한마디 배너 ───────────────────────┐ │
│  👤 Briefing         │  │  ⚔  "오늘도 임무가 쌓여 있습니다, 전하." │ │
│  🎬 Recap            │  │                    [ 브리핑 시작하기 → ] │ │
│                      │  └─────────────────────────────────────────┘ │
│  ─────────────────── │                                               │
│  [Character Sheet]   │  ┌─ MAIN STORY ──────────────────────────┐   │
│                      │  │ ⬡  보고서 마왕 처치                    │   │
│  67  54  32          │  │    INT +30 · 오늘 마감 · ⚠ 3시간 남음 │   │
│  STR INT CHA         │  │                          [ 완료하기 ] │   │
│                      │  └───────────────────────────────────────┘   │
│  ───────────────────  │                                               │
│  42       7 days     │  ┌─ WEEKLY ──────────────────────────────┐   │
│  QUESTS   STREAK     │  │ ◈  주간 독서 퀘스트                   │   │
│                      │  │    CHA +20 · D-3                      │   │
│                      │  │                          [ 완료하기 ] │   │
│                      │  └───────────────────────────────────────┘   │
│                      │                                               │
│                      │  ┌─ DAILY ───────────────────────────────┐   │
│                      │  │ ○  오전 운동                          │   │
│                      │  │    STR +15                            │   │
│                      │  │                          [ 완료하기 ] │   │
│                      │  └───────────────────────────────────────┘   │
│                      │                                               │
└──────────────────────────────────────────────────────────────────────┘
```

**레이아웃 결정의 이유:**
- 사이드바 Character Sheet 상주: 퀘스트 완료 시 스탯이 실시간으로 오르는 걸 바로 본다
- NPC 배너가 퀘스트 목록 위: NPC가 맥락을 설정한 뒤 퀘스트가 펼쳐진다
- 메인 스토리가 항상 맨 위: 위→아래로 읽으면 자연스럽게 우선순위 순서

### 레이아웃 — Mobile (< 1024px)

```
┌─────────────────────────────────┐
│  ┌─ 스탯 컴팩트 바 ────────────┐ │  ← 헤더 하단 고정
│  │  STR 67  INT 54  CHA 32    │ │
│  │  ◈ 스트릭  7일             │ │
│  └─────────────────────────────┘ │
│                                  │
│  ┌─ NPC 한마디 배너 ───────────┐ │
│  │  "오늘도 임무가..."          │ │
│  │           [ 브리핑 → ]      │ │
│  └─────────────────────────────┘ │
│                                  │
│  ── MAIN STORY ──────────────── │
│  ┌─────────────────────────────┐ │
│  │ ⬡  보고서 마왕 처치         │ │
│  │    INT +30  ·  ⚠ 3시간     │ │
│  │              [ 완료하기 ]   │ │
│  └─────────────────────────────┘ │
│                                  │
│  ── WEEKLY / DAILY ────────────  │
│  ...                             │
│                                  │
├──────────────────────────────────┤
│  ⚔ 퀘스트   👤 브리핑   🎬 리캡  │
└──────────────────────────────────┘
```

**모바일 전용:**
- 스탯 컴팩트 바: 숫자 3개 + 스트릭 1줄 요약. 전체 패널은 사이드 드로어
- 섹션 헤더: GiwaDivider 대신 텍스트 헤더 + 1px 라인

### 페이지 진입 애니메이션 (매일 첫 열람)

```
0ms     → 배경 노이즈 + 창살 패턴 fade-in (200ms)
100ms   → NPC 배너 slide-down + fade-in
300ms   → 섹션 헤더 "MAIN STORY" fade-in
400ms   → 첫 번째 퀘스트 카드 slide-up (translateY 12px → 0)
500ms   → 두 번째 퀘스트 카드 (staggered)
600ms   → 세 번째 퀘스트 카드
700ms   → 사이드바 Character Sheet + 스탯 바 fill animation
```

**스탯 바 fill:** 0 → 현재 값 (0.8s ease-out). 숫자도 카운트업.
매일 여는 화면에서 이 애니메이션이 "오늘 내 상태 확인"의 의식이 된다.

**재방문 (당일 2회+):** 진입 애니메이션 없음. 즉시 렌더링.
`sessionStorage`로 당일 첫 방문 여부 판단.

### 퀘스트 완료 플로우

화면을 떠나지 않는다. 모든 피드백이 그 자리에서.

```
1. [ 완료하기 ] 클릭
   → 버튼 scale(0.96) + 로딩 (dancheong shimmer)

2. 성공 응답
   → 카드 중앙에 도장(seal) 오버레이 등장 600ms
   → 도장 사라지며 카드 opacity 50% + scale 0.98
   → 카드 height: 0 → 목록에서 제거 (250ms)
   → XP 팝업이 카드 위치에서 float-up

3. 사이드바 스탯 바 → 새 값으로 animate

4. 모든 퀘스트 완료 시
   → 오방색 파티클 버스트
   → Haechi 등장 + gold glow
   → "오늘의 모든 임무 완수!" (Cinzel, gold)
```

### 퀘스트 정렬 순서

```
1. 기한 초과 (오버듀)   ← 빨간 경고 — 이걸 먼저 봐야 함
2. 메인 스토리          ← 항상 중요
3. 오늘 마감            ← 긴급
4. 주간 퀘스트
5. 일일 퀘스트
6. 완료된 퀘스트        ← 맨 아래, opacity 50%
```

완료된 퀘스트는 숨기지 않는다. 당일 성취가 보여야 동기부여가 된다.

### NPC 배너 — 컨텍스트 설정자

장식이 아니다. **오늘 유저 상태를 한 문장으로 요약하고 행동을 유도한다.**

```
스탯이 낮을 때:    "전하, 지력이 위태롭습니다. 오늘 반드시 갈고 닦으소서."
스트릭 위기일 때:  "오늘 퀘스트를 완수하지 않으면 3일 연속의 기록이 끊깁니다."
모두 완료했을 때:  "오늘의 임무를 모두 완수하셨습니다. 내일을 기다리겠습니다."
퀘스트 없을 때:   "오늘은 임무가 없습니다. 새 퀘스트를 등록하시겠습니까?"
```

이 텍스트는 **OpenAI가 아니라 사전 정의된 템플릿**. 빠르고 비용 없음.
GPT 브리핑은 클릭 후 브리핑 페이지에서만.

---

## Screen 2 — NPC Briefing

### 컨셉

유저가 브리핑 페이지에 들어오는 것은 **전하가 조정에 입성**하는 것.
NPC와의 대화는 게임 RPG의 대화창 — 화려하고 조용하다.

### 레이아웃

```
┌─────────────────────────────────────────────┐
│  (배경: 전체 화면 어두운 Haechi 실루엣 + grain) │
│                                             │
│     ╔═══════════════════════════════╗       │
│     ║ [3px dancheong stripe]        ║       │
│     ║  ⚔  Guardian Knight          ║       │
│     ╠═══════════════════════════════╣       │
│     ║                               ║       │
│     ║  "전하, 지력이 위태롭습니다.   ║       │
│     ║   오늘 밤 반드시 갈고           ║       │
│     ║   닦으소서."              ▋    ║       │
│     ║                               ║       │
│     ╠═══════════════════════════════╣       │
│     ║  [ 퀘스트 시작하기 → ]         ║       │
│     ╚═══════════════════════════════╝       │
│                                             │
│     NPC 변경:  ⚔  🗡  📜               │
└─────────────────────────────────────────────┘
```

- Dialog max-width: 640px, 수직 중앙
- 배경: Haechi 실루엣 + 10% opacity, grain, 창살 패턴
- NPC 변경 버튼: 하단 3개 아이콘 — 클릭 시 대화창 재렌더링

### Dialog 구조

```
╔══════════════════════════════════╗
║ [3px dancheong stripe header]    ║
║  ⚔  Guardian Knight             ║  ← Cinzel, NPC color, icon left
╠══════════════════════════════════╣  ← 1px divider in NPC color
║                                  ║
║  "My liege, your intelligence    ║  ← typing text, 1rem Inter/Noto
║   is running low. The mission    ║
║   demands focus tonight."        ║
║                               ▋  ║  ← blinking cursor
║                                  ║
╠══════════════════════════════════╣
║  [ Begin Quests → ]              ║  ← CTA, appears after typing ends
╚══════════════════════════════════╝
```

Corner decoration: 창호 lattice SVG (4 corners, abstract, globally readable).

### NPC별 색상

| NPC | Border/glow | Name color | Tone |
|---|---|---|---|
| Guardian Knight | gold (#D4A017) | gold | Loyal, formal, worried |
| Rival | crimson (#C0392B) | crimson | Bold, provocative |
| Sage | teal (#1A5F7A) | teal | Quiet, poetic, long-view |

---

## Screen 3 — Recap

### 컨셉

한 주의 모험을 **영웅서사 영상**으로 본다. 영화 오프닝처럼.

### 레이아웃

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │          [16:9 Video Player]        │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Episode 12  ·  Week 15, 2025              │
│  "보고서 마왕과의 전투"                      │
│                                             │
│  ─── Scene List ─────────────────────────  │
│  1.  지력의 위기 · INT 퀘스트 3개           │
│  2.  근력의 재건 · STR 퀘스트 완주          │
│  3.  결말 · 모든 임무 완수                  │
│                                             │
│                          [ Twitter 공유 ]  │
│                          [ 링크 복사 ]      │
└─────────────────────────────────────────────┘
```

- Video player: play/pause 클릭, 풀스크린 버튼
- 생성 중: 오방색 conic-gradient 스피너 + "영상을 제작 중입니다..." 텍스트
- 공유 버튼: video player 우하단에 float

### 생성 대기 상태

```
┌────────────────────────────────────────┐
│                                        │
│    [오방색 conic-gradient spinner]      │
│                                        │
│    영상을 제작 중입니다                  │
│    완성까지 약 5분이 소요됩니다.          │
│                                        │
│    이 페이지를 닫아도 괜찮습니다.         │
│    완성되면 알림을 드립니다.             │
│                                        │
└────────────────────────────────────────┘
```

### 히스토리 목록 (recap/ 페이지)

이번 주 리캡 + 이전 리캡 썸네일 그리드.

```
┌─────────────────────────────────────────┐
│  이번 주 리캡                           │
│  [ 영상 생성하기 ] 또는 생성 중 상태     │
├─────────────────────────────────────────┤
│  이전 리캡                              │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ Ep11 │ │ Ep10 │ │ Ep 9 │           │
│  └──────┘ └──────┘ └──────┘           │
└─────────────────────────────────────────┘
```

---

## Screen 4 — Onboarding (Companion Selection)

### 컨셉

처음 진입 시 NPC 동반자를 선택. **Lineage 클래스 선택 화면** 레퍼런스.
배경: 전체 화면 Haechi 실루엣, 어두운, grain.

### 레이아웃

```
                Chronicles of [나]
                나만의 동반자를 선택하세요

     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │    ⚔     │   │    🗡    │   │    📜    │
     │          │   │          │   │          │
     │  Guardian │   │  Rival   │   │   Sage   │
     │  Knight  │   │          │   │          │
     └──────────┘   └──────────┘   └──────────┘

  충직하고 걱정이 많다.  도발적이고 강하다.  조용하고 시적이다.
  전하를 위해 걱정한다.  마음은 따뜻하다.  큰 그림을 본다.
```

### 인터랙션

- Hover: 카드 5px float up + NPC color glow 강화
- Select: seal stamp animation + 오방색 color flash 화면 가득
- 완료 후: 메인 화면으로 transition (게임 시작 연출)

---

## Screen 5 — Stat Panel (Character Sheet)

### 컨셉

VR 게임의 부유하는 stat window. 오방색으로 재해석.

### 레이아웃

```
┌─ S T A T U S ─────────────────────────┐  ← 0.65rem letter-spacing 0.3em
│ ─────────────────────────── gold line │
│                                        │
│  67          ← 2.25rem Cinzel Deco, jeok
│  STRENGTH    ← 0.6rem, stone-500
│  [■■■■■■■■□□□□□□□]  ← segmented bar
│                                        │
│  54          ← cheong
│  INTELLIGENCE
│  [████████░░░░░░░]
│                                        │
│  32          ← violet
│  CHARISMA
│  [█████░░░░░░░░░░]
│                                        │
│ ──────────────────────────────────── │
│  42            7                       │
│  QUESTS DONE   STREAK DAYS            │
└────────────────────────────────────────┘
```

Panel: hologram clip-path + scanline + gold corner accents.
모바일: 컴팩트 바 (STR 67 / INT 54 / CHA 32 / 🔥 7일) 1줄 요약.

---

## Shared Interaction Patterns

| Action | Feedback | Implementation |
|---|---|---|
| Quest complete | Seal stamp → collapse → XP popup | `setTimeout` chain |
| Stat update | Count-up from prev value | `useEffect` + rAF |
| Button hover | Gold glow pulse | `box-shadow` transition |
| Button click | `scale(0.96)` → normal | `active:scale-[0.96]` |
| Modal enter | `scale(0.94) + fade` → normal | CSS keyframe |
| Page enter | Staggered fade-up | `animation-delay` |
| Video generating | Obangsaek spinner | `conic-gradient` rotate |
| NPC text done | Cursor stops + CTA button pulses | `TypingText` `onComplete` |

---

## Empty States

Haechi speaks when there's nothing to show.

**Quest board empty:**
```
      (Haechi SVG — 120px, gold glow halo)

  모험이 아직 시작되지 않았습니다

  첫 번째 임무를 등록하고 전설을 시작하세요.

       [ + 첫 퀘스트 등록하기 ]
```

**Error state:**
Haechi angry posture (jeok color outline) + error message in Hahmlet jeok + retry button.

**Briefing — NPC 미선택:**
3개 companion 실루엣 barely visible, 선택 유도.
