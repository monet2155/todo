import type { QuestGrade, StatType } from '@/types'

type CompletedQuest = {
  title: string
  grade: QuestGrade
  stat_type: StatType
  completed_at: string
}

type FailedQuest = {
  title: string
  grade: QuestGrade
}

type PromptResult = {
  systemPrompt: string
  userMessage: string
}

const GRADE_LABELS: Record<QuestGrade, string> = {
  daily: '일일',
  weekly: '주간',
  main: '메인 스토리',
}

export function buildCinematicPrompt(
  userName: string,
  completions: CompletedQuest[],
  failedQuests: FailedQuest[],
  weekNumber: number,
  year: number,
): PromptResult {
  const systemPrompt = `당신은 RPG 세계관의 전설 기록자입니다. 유저의 한 주 활동 데이터를 바탕으로 중세 판타지 영화 예고편 스타일의 시네마틱 스크립트를 작성하세요.

출력 형식은 반드시 다음 JSON 구조를 따라야 합니다:
{
  "title": "CHRONICLES OF [이름] — [연도]년 [주차]주차",
  "scenes": [
    {
      "narration": "한국어 나레이션 텍스트",
      "visual_prompt": "영어 Midjourney/Runway 스타일 시각 프롬프트",
      "duration": 3
    }
  ]
}

규칙:
- scenes 배열은 4~6개
- 각 scene duration은 3~6초
- 완료 퀘스트는 영웅적으로 각색
- 실패/미완료 퀘스트는 비장하거나 유머러스하게 각색
- 기록이 없으면 "아직 전설이 시작되지 않았다" 분위기로 작성
- narration은 한국어, visual_prompt는 영어
- JSON만 출력하고 다른 텍스트는 포함하지 말 것`

  const completionLines =
    completions.length === 0
      ? '- 완료한 퀘스트 없음'
      : completions
          .map((c) => `- [${GRADE_LABELS[c.grade]}] ${c.title} (완료: ${c.completed_at.slice(0, 10)})`)
          .join('\n')

  const failedLines =
    failedQuests.length === 0
      ? '- 없음'
      : failedQuests.map((q) => `- [${GRADE_LABELS[q.grade]}] ${q.title}`).join('\n')

  const userMessage = `용사 이름: ${userName}
기간: ${year}년 ${weekNumber}주차

완료한 퀘스트:
${completionLines}

실패/미완료 퀘스트:
${failedLines}

위 데이터를 바탕으로 시네마틱 스크립트 JSON을 생성해주세요.`

  return { systemPrompt, userMessage }
}
