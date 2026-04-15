# Implementation Plan: Chronicles of [나]

## Overview

RPG 스타일 일상 앱. 퀘스트 보드 → NPC 아침 브리핑 → 주간 시네마틱 영상 생성의 3개 핵심 루프를 순서대로 구축한다. 영상 파이프라인은 가장 리스크가 높으므로 Phase 3 초반에 API 스파이크로 먼저 검증한다.

## Dependency Graph

```
DB Schema + 타입
    │
    ├── Auth (profiles 테이블)
    │       │
    │       └── Onboarding (NPC 타입 선택)
    │               │
    │               ├── Quest API ──→ Quest Board UI
    │               │       │               │
    │               │       └── Stats 계산  └── Character Sheet UI
    │               │               │
    │               │               └── NPC 브리핑 API ──→ 브리핑 UI
    │               │                       │
    │               │               Completions 집계
    │               │                       │
    │               └───────────────→ Recap 스크립트 API
    │                                       │
    │                               [스파이크 검증 후]
    │                                       │
    │                               영상 생성 파이프라인
    │                                       │
    │                               Recap UI + 공유
```

## Architecture Decisions

- **App Router + Server Components:** 데이터 패칭은 서버 컴포넌트, 인터랙션은 클라이언트 컴포넌트로 분리
- **Supabase Realtime 미사용:** 영상 생성 상태는 클라이언트 폴링 (5초 간격)으로 단순하게 처리
- **영상 생성은 비동기:** API 라우트에서 즉시 `recaps.status = 'generating'` 반환 후 백그라운드 처리
- **Runway fallback:** 스파이크 결과에 따라 비용/속도 문제 시 stock 이미지 + Ken Burns 효과로 대체

---

## Phase 0: Foundation

### Task 1: 프로젝트 초기화

**Description:** Next.js 14 + TypeScript + Tailwind + Supabase CLI 세팅. 이후 모든 작업의 기반.

**Acceptance criteria:**
- [ ] `npm run dev` 실행 시 localhost:3000 접속 가능
- [ ] `npm run typecheck` 에러 없음
- [ ] Supabase 로컬 또는 클라우드 프로젝트 연결 확인 (환경변수 로드)
- [ ] `.env.local.example` 파일에 필요한 키 목록 정의

**Verification:**
- [ ] `npm run dev` 성공
- [ ] `npm run typecheck` 성공
- [ ] `npm run lint` 성공

**Dependencies:** None

**Files:**
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `next.config.ts`
- `.env.local.example`
- `lib/supabase.ts` (클라이언트/서버 분리)

**Scope:** S

---

### Task 2: DB 스키마 + 타입 생성

**Description:** 5개 테이블 마이그레이션 작성 및 적용. TypeScript 타입 자동 생성. 이후 모든 API와 컴포넌트가 이 타입을 참조한다.

**Acceptance criteria:**
- [ ] `profiles`, `quests`, `completions`, `stats`, `recaps` 테이블 생성됨
- [ ] 각 테이블 RLS 활성화 + "자기 데이터만 접근" 정책 적용
- [ ] `types/database.ts` 자동 생성 완료
- [ ] `types/index.ts`에 앱 도메인 타입 정의 (Quest, StatType, NPCType 등)

**Verification:**
- [ ] Supabase 대시보드에서 테이블 확인
- [ ] `npx supabase gen types typescript` 성공
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 1

**Files:**
- `supabase/migrations/001_initial_schema.sql`
- `types/database.ts`
- `types/index.ts`

**Scope:** S

---

### Task 3: 인증 + 온보딩

**Description:** Supabase Auth 이메일 로그인. 최초 가입 시 NPC 타입 선택 온보딩. 미인증 접근 시 리다이렉트.

**Acceptance criteria:**
- [ ] 회원가입 → 이메일 확인 → 로그인 → 로그아웃 플로우 동작
- [ ] 온보딩에서 NPC 3종(knight/rival/sage) 선택 + `profiles` 테이블에 저장
- [ ] 온보딩 완료 유저는 온보딩 스킵, 미완료 유저는 온보딩으로 리다이렉트
- [ ] 미인증 유저는 `/login`으로 리다이렉트 (미들웨어)

**Verification:**
- [ ] 회원가입 → 온보딩 → 대시보드 진입 수동 확인
- [ ] 로그아웃 후 대시보드 접근 시 `/login` 리다이렉트 확인
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 2

**Files:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/onboarding/page.tsx`
- `middleware.ts`
- `lib/auth.ts`

**Scope:** M

---

### Checkpoint 0: Foundation
- [ ] `npm run dev` + `npm run typecheck` + `npm run lint` 전부 통과
- [ ] 회원가입 → 온보딩 → 대시보드 진입 플로우 동작
- [ ] DB RLS 정책 확인

---

## Phase 1: Quest Board

### Task 4: 스탯 계산 로직 + 단위 테스트

**Description:** 퀘스트 등급별 XP 계산, 스탯 업데이트 함수. 순수 함수로 작성해 테스트 가능하게 유지.

**Acceptance criteria:**
- [ ] `calculateXP(grade)` → daily:5, weekly:15, main:30 반환
- [ ] `applyStatGain(userId, statType, xp)` → DB stats 업데이트
- [ ] 단위 테스트 커버리지 100%

**Verification:**
- [ ] `npm test` 통과

**Dependencies:** Task 2

**Files:**
- `lib/stats.ts`
- `tests/unit/stats.test.ts`

**Scope:** S

---

### Task 5: 퀘스트 CRUD API

**Description:** 퀘스트 생성/조회/완료/삭제 API 라우트. 완료 처리 시 completions 기록 + stats 업데이트 트리거.

**Acceptance criteria:**
- [ ] `POST /api/quests` — 퀘스트 생성, XP 자동 계산
- [ ] `GET /api/quests` — 오늘 + 진행중 퀘스트 목록 반환
- [ ] `PATCH /api/quests/[id]` — 완료 처리: `completions` 기록 + `stats` XP 증가
- [ ] `DELETE /api/quests/[id]` — 삭제
- [ ] 본인 퀘스트만 조작 가능 (RLS + 서버사이드 유저 확인)

**Verification:**
- [ ] `npm test` API 라우트 통합 테스트 통과
- [ ] curl 또는 Postman으로 각 엔드포인트 수동 확인

**Dependencies:** Task 4

**Files:**
- `app/api/quests/route.ts`
- `app/api/quests/[id]/route.ts`
- `tests/integration/quests.test.ts`

**Scope:** M

---

### Task 6: 퀘스트 보드 UI

**Description:** 오늘의 퀘스트 목록 화면. 등급별 섹션 분리, 완료 버튼, optimistic update, XP 획득 팝업 애니메이션.

**Acceptance criteria:**
- [ ] daily / weekly / main 섹션으로 퀘스트 분류 표시
- [ ] 완료 버튼 클릭 시 즉시 UI 업데이트 (optimistic), 이후 DB 반영
- [ ] 완료 시 `+15 지력` 형태 XP 팝업 텍스트 애니메이션
- [ ] 퀘스트 추가 모달: 제목, 등급, 스탯 타입, 마감일 입력
- [ ] 마감 지난 퀘스트 "지연됨" 뱃지 표시

**Verification:**
- [ ] 퀘스트 추가 → 완료 → 스탯 반영 수동 확인
- [ ] 새로고침 후 데이터 유지 확인
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 5

**Files:**
- `app/dashboard/page.tsx`
- `components/quest/QuestBoard.tsx`
- `components/quest/QuestCard.tsx`
- `components/quest/AddQuestModal.tsx`

**Scope:** M

---

### Task 7: 캐릭터 시트 UI

**Description:** 현재 스탯 수치 + 프로그레스바 사이드패널. 퀘스트 완료 시 실시간 반영.

**Acceptance criteria:**
- [ ] 체력 / 지력 / 카리스마 수치 + 프로그레스바 표시
- [ ] 퀘스트 완료 후 스탯 수치 즉시 갱신
- [ ] 총 완료 퀘스트 수, 연속 달성일 표시

**Verification:**
- [ ] 퀘스트 완료 후 스탯 변화 수동 확인
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 6

**Files:**
- `components/character-sheet/CharacterSheet.tsx`

**Scope:** S

---

### Checkpoint 1: Quest Board
- [ ] 퀘스트 추가 → 완료 → 스탯 증가 전체 플로우 동작
- [ ] 새로고침 후 데이터 유지
- [ ] `npm run typecheck` + `npm test` 통과

---

## Phase 2: NPC 아침 브리핑

### Task 8: NPC 프롬프트 + 브리핑 API

**Description:** NPC 타입별 GPT-4o 프롬프트 작성. 오늘 퀘스트 + 현재 스탯 + 지연 퀘스트 수를 입력받아 브리핑 대사 생성.

**Acceptance criteria:**
- [ ] `POST /api/briefing` — npc_type, quests[], stats 입력 → dialogue 스트리밍 반환
- [ ] knight: 경어, 충성스럽고 걱정하는 톤
- [ ] rival: 반말, 도발적이지만 결국 응원하는 톤
- [ ] sage: 경어, 철학적·은유적 톤
- [ ] 스탯 낮은 항목 + 지연 퀘스트를 대사에 반영

**Verification:**
- [ ] 3가지 NPC 타입 각각 수동으로 대사 생성 확인
- [ ] 스탯 낮음 → 걱정 톤, 높음 → 칭찬 톤 확인
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 5

**Files:**
- `app/api/briefing/route.ts`
- `lib/openai.ts`
- `lib/prompts/npc.ts`

**Scope:** M

---

### Task 9: 브리핑 UI

**Description:** 앱 첫 진입 시 표시되는 NPC 브리핑 화면. RPG 대화창 스타일 + 텍스트 타이핑 애니메이션.

**Acceptance criteria:**
- [ ] 하루 첫 진입 시 자동 표시 (localStorage로 날짜 체크)
- [ ] NPC 초상화 + 타이핑 애니메이션으로 대사 출력 (스트리밍)
- [ ] NPC 타입별 다른 초상화/아이콘 표시
- [ ] "퀘스트 수행하러 가기" 버튼 → 대시보드 이동
- [ ] 로딩 중 "브리핑 준비 중..." 상태 표시

**Verification:**
- [ ] 로그인 → 브리핑 → 대시보드 플로우 수동 확인
- [ ] 같은 날 재진입 시 브리핑 스킵 확인
- [ ] 3가지 NPC 타입 UI 수동 확인

**Dependencies:** Task 8

**Files:**
- `app/briefing/page.tsx`
- `components/npc-dialog/NPCDialog.tsx`
- `components/npc-dialog/TypingText.tsx`

**Scope:** M

---

### Checkpoint 2: NPC 브리핑
- [ ] 로그인 → 브리핑 → 퀘스트 보드 전체 플로우 동작
- [ ] NPC 3종 타입별 대사 생성 확인
- [ ] `npm run typecheck` + `npm test` 통과

---

## Phase 3: 시네마틱 회고 영상

### Task 10: [스파이크] 영상 파이프라인 API 검증

**Description:** Runway ML + ElevenLabs + Shotstack 조합으로 10초짜리 샘플 영상 1개 생성. 비용/속도/품질 검증 후 계속 진행 여부 결정. 실패 시 fallback(stock 이미지 + Ken Burns) 방향으로 전환.

**Acceptance criteria:**
- [ ] Runway Gen-3 Alpha API로 중세 판타지 장면 클립 1개 (3~5초) 생성 성공
- [ ] ElevenLabs API로 한국어 나레이션 mp3 생성 성공
- [ ] Shotstack API로 클립 + 음성 합성 → .mp4 출력 성공
- [ ] 총 생성 시간 측정 및 기록
- [ ] 클립 1개당 비용 측정 및 기록

**Verification:**
- [ ] `scripts/spike-video.ts` 실행 → .mp4 파일 생성 확인
- [ ] 생성 시간/비용을 `scripts/spike-results.md`에 기록

**Dependencies:** Task 1

**Files:**
- `scripts/spike-video.ts`
- `lib/runway.ts`
- `lib/elevenlabs.ts`
- `lib/shotstack.ts`
- `scripts/spike-results.md`

**Scope:** M

> ⚠️ **Go/No-Go 게이트:** 스파이크 결과 확인 후 진행. 영상당 비용 $1 초과 or 생성 10분 초과 시 fallback 전략으로 전환.

---

### Task 11: 시네마틱 스크립트 생성 API

**Description:** 주간 completions 데이터를 GPT-4o에 넘겨 중세 RPG 예고편 스크립트(scenes[]) 생성.

**Acceptance criteria:**
- [ ] `POST /api/recap/script` — week_number, year, user_id 입력 → scenes[] JSONB 반환
- [ ] 완료 퀘스트는 영웅적 서사로, 실패/지연 퀘스트는 비장한 실패 장면으로 각색
- [ ] 장면 4~6개, 각 3~6초, 총 60~90초 분량
- [ ] 각 scene에 `narration`, `visual_prompt`, `duration` 포함
- [ ] 데이터 없는 주차 요청 시 "기록 없음" 처리

**Verification:**
- [ ] 실제 completion 데이터로 스크립트 생성 수동 확인
- [ ] 실패 퀘스트 포함 시 유머러스한 장면 생성 확인
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 10, Task 5

**Files:**
- `app/api/recap/script/route.ts`
- `lib/prompts/cinematic.ts`

**Scope:** M

---

### Task 12: 영상 생성 파이프라인 API

**Description:** 스크립트 → Runway 클립 생성 → ElevenLabs 나레이션 → Shotstack 조립 → Supabase Storage 저장. 비동기 처리, 상태 관리.

**Acceptance criteria:**
- [ ] `POST /api/recap/generate` — recap_id 입력 → 즉시 `{ status: 'generating' }` 반환
- [ ] 백그라운드에서 순차 처리: Runway → ElevenLabs → Shotstack → Storage 업로드
- [ ] 각 단계 완료 시 `recaps.status` 업데이트
- [ ] 최종 완료 시 `recaps.video_url` + `status: 'done'` 저장
- [ ] 어느 단계든 실패 시 `status: 'failed'` + 에러 메시지 저장
- [ ] `GET /api/recap/[id]/status` — 현재 상태 반환 (폴링용)

**Verification:**
- [ ] 전체 파이프라인 실행 → .mp4 URL 생성 수동 확인
- [ ] 중간 실패 시 `status: 'failed'` 반영 확인
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 11

**Files:**
- `app/api/recap/generate/route.ts`
- `app/api/recap/[id]/status/route.ts`

**Scope:** L

---

### Task 13: 회고 UI + 공유

**Description:** 영상 생성 트리거, 폴링 로딩 화면, 영상 플레이어, SNS 공유. 퍼블릭 공유 URL 지원.

**Acceptance criteria:**
- [ ] 대시보드에 "이번 주 전설 만들기" 버튼
- [ ] 생성 중 로딩 화면: "전설을 기록하는 중..." + 진행 상태 (5초 폴링)
- [ ] 완료 시 인앱 영상 플레이어로 자동 전환
- [ ] "내 전설 공유하기" → 트위터/인스타 공유 (텍스트 + URL)
- [ ] `/recap/[id]` 퍼블릭 URL — 비로그인 접근 가능
- [ ] OG 태그 (title, description, 썸네일) 설정
- [ ] 이전 회고 목록 히스토리 표시

**Verification:**
- [ ] 전체 플로우 수동 확인: 버튼 클릭 → 로딩 → 영상 재생
- [ ] 공유 URL 비로그인 접근 확인
- [ ] OG 미리보기 확인 (og:image 등)
- [ ] `npm run typecheck` 성공

**Dependencies:** Task 12

**Files:**
- `app/recap/page.tsx`
- `app/recap/[id]/page.tsx`
- `components/video-player/VideoPlayer.tsx`
- `lib/share.ts`

**Scope:** M

---

### Checkpoint 3: 시네마틱 회고
- [ ] 퀘스트 완료 → 주간 회고 영상 생성 → 공유 전체 플로우 동작
- [ ] 퍼블릭 URL 비로그인 접근 확인
- [ ] `npm run typecheck` + `npm test` + `npm run build` 전부 통과

---

## 전체 태스크 순서

```
Phase 0:  T1 → T2 → T3
Phase 1:  T4 → T5 → T6 → T7
Phase 2:  T8 → T9
Phase 3:  T10(스파이크) → T11 → T12 → T13
```

**병렬 가능:**
- T4 + T3 (stats 로직과 auth는 독립적)
- T6 + T7 (UI 컴포넌트끼리)

---

## Risks and Mitigations

| 리스크 | 영향 | 대응 |
|---|---|---|
| Runway API 비용/속도 초과 | 높음 | T10 스파이크로 조기 검증. 초과 시 stock 이미지 + Ken Burns로 fallback |
| Shotstack 영상 조립 복잡도 | 중간 | Creatomate API로 대체 가능 |
| GPT 스크립트 퀄리티 | 낮음 | 프롬프트 튜닝으로 해결 가능. 대안 많음 |
| Vercel 서버리스 타임아웃 (영상 생성) | 높음 | `/api/recap/generate`를 즉시 반환 + 백그라운드 처리로 설계 |
| ElevenLabs 한국어 퀄리티 | 낮음 | 다국어 지원 voice 선택으로 해결 |

## Open Questions

- [ ] BGM 소스: 무료 라이선스 중세 오케스트라 트랙 선정 필요 (Pixabay 등)
- [ ] NPC 초상화 이미지: AI 생성 일러스트 3종 제작 필요 (Midjourney/DALL-E)
- [ ] Vercel 백그라운드 작업: Edge Runtime 제한으로 인해 Vercel Pro의 Background Functions 또는 별도 서버 필요할 수 있음
