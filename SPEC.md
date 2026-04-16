# Spec: Chronicles of [나]

> "당신의 하루가 전설이 된다"
> 평범한 일상을 RPG 서사로 변환하는 웹앱

---

## Objective

### 배경
"내가 주인공이 되고 싶다"는 욕망에서 출발. 기존 투두앱은 지루하고, 자기계발 앱은 부담스럽다. 일상을 RPG처럼 프레이밍하면 귀찮은 할일도 퀘스트가 되고, 나의 한 주가 시네마틱 영상으로 남는다.

### 유저
- 투두앱 쓰다 흥미 잃은 사람
- RPG 게임 좋아하는 사람
- 자기 일상을 재미있게 기록/공유하고 싶은 사람

### 성공 기준
- [ ] 퀘스트 등록 → 완료 → 스탯 증가 플로우가 3초 이내 동작
- [ ] 매일 아침 NPC 브리핑이 오늘 퀘스트 + 현재 스탯 반영해서 생성됨
- [ ] 주간 시네마틱 영상이 실제 재생 가능한 .mp4로 생성됨
- [ ] 생성된 영상을 SNS 공유 링크로 내보낼 수 있음
- [ ] 영상 생성 시간 5분 이내

---

## Tech Stack

| 레이어 | 기술 | 버전 |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| DB / Auth / Storage | Supabase | latest |
| AI 대사/스크립트 | OpenAI GPT-4o | API |
| 영상 클립 생성 | Runway ML Gen-3 Alpha | API |
| 나레이션 음성 | ElevenLabs | API |
| 영상 조립 | Shotstack | API |
| 배포 | Vercel | - |

---

## Commands

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 타입 체크
npm run typecheck

# 린트
npm run lint

# 테스트
npm test

# Supabase 타입 생성
npx supabase gen types typescript --local > types/database.ts

# Supabase 마이그레이션 적용
npx supabase db push
```

---

## Project Structure

```
chronicles/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 인증 페이지 (로그인, 회원가입)
│   │   ├── login/
│   │   └── signup/
│   ├── onboarding/             # NPC 타입 선택
│   ├── dashboard/              # 메인 퀘스트 보드
│   ├── briefing/               # 아침 브리핑 화면
│   ├── recap/                  # 시네마틱 회고 화면
│   │   └── [id]/               # 개별 회고 영상 페이지
│   └── api/                    # API Routes
│       ├── quests/             # 퀘스트 CRUD
│       ├── briefing/           # NPC 브리핑 생성
│       └── recap/
│           ├── script/         # 스크립트 생성
│           └── generate/       # 영상 생성 파이프라인
│
├── components/
│   ├── quest/                  # 퀘스트 보드, 퀘스트 카드, 추가 모달
│   ├── character-sheet/        # 스탯 패널
│   ├── npc-dialog/             # RPG 대화창 컴포넌트
│   └── video-player/           # 회고 영상 플레이어
│
├── lib/
│   ├── supabase.ts             # Supabase 클라이언트
│   ├── openai.ts               # OpenAI 클라이언트
│   ├── runway.ts               # Runway ML 클라이언트
│   ├── elevenlabs.ts           # ElevenLabs 클라이언트
│   ├── shotstack.ts            # Shotstack 클라이언트
│   ├── stats.ts                # 스탯 계산 로직
│   └── prompts/
│       ├── npc.ts              # NPC 타입별 프롬프트
│       └── cinematic.ts        # 시네마틱 스크립트 프롬프트
│
├── types/
│   ├── database.ts             # Supabase 자동 생성 타입
│   └── index.ts                # 앱 도메인 타입
│
├── supabase/
│   └── migrations/             # DB 마이그레이션 파일
│
└── tests/
    ├── unit/                   # 단위 테스트 (stats, prompts)
    └── integration/            # API 라우트 통합 테스트
```

---

## Data Model

```sql
-- 유저 프로필 (Supabase auth.users 확장)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users,
  name        TEXT NOT NULL,
  npc_type    TEXT NOT NULL CHECK (npc_type IN ('knight', 'rival', 'sage')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 퀘스트
CREATE TABLE quests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  title       TEXT NOT NULL,
  grade       TEXT NOT NULL CHECK (grade IN ('daily', 'weekly', 'main')),
  stat_type   TEXT NOT NULL CHECK (stat_type IN ('strength', 'intelligence', 'charisma')),
  xp          INTEGER NOT NULL DEFAULT 10,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 완료 기록
CREATE TABLE completions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id      UUID NOT NULL REFERENCES quests(id),
  user_id       UUID NOT NULL REFERENCES profiles(id),
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  week_number   INTEGER NOT NULL  -- EXTRACT(WEEK FROM completed_at)
);

-- 스탯
CREATE TABLE stats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES profiles(id),
  strength      INTEGER NOT NULL DEFAULT 0,
  intelligence  INTEGER NOT NULL DEFAULT 0,
  charisma      INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 시네마틱 회고
CREATE TABLE recaps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  week_number INTEGER NOT NULL,
  year        INTEGER NOT NULL,
  script      JSONB,             -- scenes[] 구조
  video_url   TEXT,              -- Supabase Storage URL
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'generating', 'done', 'failed')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number, year)
);
```

---

## Code Style

TypeScript 엄격 모드. 함수형 컴포넌트, async/await, 명시적 반환 타입.

```typescript
// lib/stats.ts — 스탯 계산 예시
import type { Database } from '@/types/database'

type StatType = 'strength' | 'intelligence' | 'charisma'
type Quest = Database['public']['Tables']['quests']['Row']

export function calculateXP(grade: Quest['grade']): number {
  const xpMap = { daily: 5, weekly: 15, main: 30 } as const
  return xpMap[grade]
}

export async function applyStatGain(
  userId: string,
  statType: StatType,
  xp: number,
): Promise<void> {
  // Supabase RPC 또는 upsert
}
```

**네이밍 규칙:**
- 컴포넌트: PascalCase (`QuestCard.tsx`)
- 유틸/훅: camelCase (`useQuests.ts`)
- API 라우트: kebab-case 폴더 (`/api/recap/generate`)
- DB 컬럼: snake_case
- 상수: UPPER_SNAKE_CASE

---

## Feature Specs

### 1. Quest Board

**퀘스트 등록 시 유저가 지정:**
- 제목 (자유 텍스트)
- 등급: 일일 / 주간 / 메인 스토리
- 스탯 타입: 체력 / 지력 / 카리스마
- 마감일 (선택)

**완료 처리:**
- 완료 버튼 클릭 → optimistic update → DB 반영
- `completions` 테이블에 기록
- 해당 `stat_type` XP += `calculateXP(grade)`
- 완료 애니메이션: XP 획득 팝업 텍스트

**실패/미루기:**
- 마감일 지난 퀘스트는 "지연됨" 뱃지
- 별도 페널티 없음 (NPC가 다음 브리핑에서 언급)

---

### 2. NPC 아침 브리핑

**트리거:** 앱 첫 진입 시 (하루 1회, 이후엔 스킵 가능)

**입력 데이터:**
- 오늘 날짜 + 요일
- 오늘의 퀘스트 목록
- 현재 스탯 수치
- 지연된 퀘스트 수

**NPC 타입별 말투:**

| NPC | 말투 | 특징 |
|---|---|---|
| `knight` (기사단장) | 경어, 충성스럽고 진지 | 스탯 낮으면 걱정, 높으면 칭찬 |
| `rival` (츤데레 라이벌) | 반말, 도발적이지만 응원 | 실패하면 비웃다가 결국 격려 |
| `sage` (현자 스승) | 경어, 철학적, 은유적 | 모든 걸 교훈으로 포장 |

**UI:** RPG 대화창 — NPC 초상화 + 텍스트 타이핑 애니메이션

---

### 3. 시네마틱 회고 영상

**트리거:**
- 매주 일요일 자정 자동 생성 (Supabase Cron 또는 Vercel Cron)
- 대시보드에서 수동 요청 가능

**영상 파이프라인:**

```
1. GPT-4o — 주간 데이터 → 극적 스크립트 생성 (scenes[])
2. Runway Gen-3 — 장면별 3~5초 영상 클립 생성
3. ElevenLabs — 전체 나레이션 mp3 생성 (한국어)
4. Shotstack — 클립 + 나레이션 + BGM 합성 → .mp4
5. Supabase Storage — 완성 영상 저장
```

**스크립트 출력 구조:**
```json
{
  "title": "CHRONICLES OF 홍길동 — 2026년 16주차",
  "scenes": [
    {
      "narration": "2026년 4월 둘째 주...",
      "visual_prompt": "medieval kingdom panorama, golden dawn, epic wide shot",
      "duration": 3
    },
    {
      "narration": "그는 보고서라는 이름의 마왕과 마주했다",
      "visual_prompt": "dark lord silhouette on throne, dramatic lighting, ominous",
      "duration": 4
    },
    {
      "narration": "3번의 미루기 끝에... 화요일 밤 11시... 그는 마침내 제출 버튼을 눌렀다",
      "visual_prompt": "knight raising glowing sword, triumphant, particle effects",
      "duration": 6
    },
    {
      "narration": "그러나... 이번 주 운동 달성률: 0%",
      "visual_prompt": "hero collapsed on ground, comedic expression, peaceful",
      "duration": 4
    },
    {
      "narration": "다음 주, 전설은 계속된다",
      "visual_prompt": "epic logo reveal, CHRONICLES OF, cinematic",
      "duration": 4
    }
  ]
}
```

**생성 상태 관리:**
- `pending` → `generating` → `done` / `failed`
- UI에서 폴링으로 상태 확인 (5초 간격)
- 완료 시 영상 플레이어 표시

**공유:**
- `/recap/[id]` 공개 URL (로그인 불필요)
- 트위터/인스타 공유 버튼 (Open Graph 썸네일 포함)

---

## Testing Strategy

- **단위 테스트 (Vitest):** `lib/stats.ts`, `lib/prompts/` 순수 함수
- **통합 테스트:** API 라우트 (`/api/quests`, `/api/briefing`)
- **E2E 미포함:** MVP 단계에서는 수동 테스트로 대체
- **커버리지 목표:** 비즈니스 로직 (stats, prompts) 80% 이상

```bash
# 단위 테스트
npm test

# 커버리지
npm run test:coverage
```

---

## Boundaries

**Always:**
- 커밋 전 `npm run typecheck` + `npm run lint` 통과
- API 키는 `.env.local`에만, 절대 코드에 하드코딩 금지
- Supabase RLS 정책 — 모든 테이블 자기 데이터만 접근
- DB 스키마 변경 시 마이그레이션 파일 생성

**Ask First:**
- 외부 API (Runway, ElevenLabs, Shotstack) 교체
- DB 스키마 파괴적 변경 (컬럼 삭제, 타입 변경)
- 새 npm 패키지 추가

**Never:**
- `.env.local` 커밋
- `any` 타입 사용
- Supabase RLS 비활성화
- 실패하는 테스트를 skip 처리

---

## Open Questions

| 질문 | 결정 |
|---|---|
| BGM은 어떤 스타일? | 미결 — 추후 논의 |
| Runway 비용이 너무 높으면? | **fallback 없음** — 요금제/상품 가격 조정으로 퀄리티 유지. Runway 영상 품질을 그대로 사용. |
| 영상 생성 실패 시 유저에게 어떻게 알림? | **인앱 토스트 + 재시도 버튼** (기존 구현 유지) |
| NPC 초상화 이미지 소스? | **관리자 콘솔에서 AI 생성 이미지 추가/삭제** — 관리자 콘솔 구축 후 처리. 미결. |
| Vercel 백그라운드 작업 처리 방식? | **Vercel Pro Background Functions** — `maxDuration = 900` 설정. 고정 비용 없이 Pro 플랜에 포함. |
