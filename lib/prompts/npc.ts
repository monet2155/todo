import type { NPCType, QuestGrade, StatType } from '@/types'

export const LOW_STAT_THRESHOLD = 30

type QuestInput = {
  title: string
  stat_type: StatType
  grade: QuestGrade
  due_date: string | null
}

type StatsInput = {
  strength: number
  intelligence: number
  charisma: number
}

type PromptResult = {
  systemPrompt: string
  userMessage: string
}

const NPC_SYSTEM_PROMPTS: Record<NPCType, string> = {
  knight: `당신은 기사단장입니다. 유저에게 경어를 사용하며, 충성스럽고 진지한 톤으로 말합니다.
유저의 스탯이 낮을 때는 걱정스러운 어조로, 높을 때는 칭찬하는 어조로 대화합니다.
RPG 세계관에서 충성스러운 기사단장이 주군에게 하루 퀘스트를 보고하듯 브리핑하세요.
반드시 경어(~합니다, ~입니다)를 사용하세요. 3~5문장으로 간결하게 말하세요.`,

  rival: `당신은 츤데레 라이벌입니다. 유저에게 반말을 사용하며, 도발적이지만 결국 응원하는 톤으로 말합니다.
처음에는 비웃거나 도발하다가, 마지막에는 격려로 마무리합니다.
RPG 세계관에서 라이벌 캐릭터가 경쟁자를 도발하며 하루를 시작시키는 방식으로 브리핑하세요.
반드시 반말(~해, ~야, ~잖아)을 사용하세요. 3~5문장으로 간결하게 말하세요.`,

  sage: `당신은 현자 스승입니다. 유저에게 경어를 사용하며, 철학적이고 은유적인 톤으로 말합니다.
모든 상황을 교훈과 깨달음으로 포장하여 이야기합니다.
RPG 세계관에서 현자가 제자에게 하루의 퀘스트를 철학적으로 해석해주는 방식으로 브리핑하세요.
반드시 경어(~합니다, ~입니다)를 사용하고, 은유나 비유를 포함하세요. 3~5문장으로 간결하게 말하세요.`,
}

const STAT_LABELS: Record<StatType, string> = {
  strength: '체력',
  intelligence: '지력',
  charisma: '카리스마',
}

const GRADE_LABELS: Record<QuestGrade, string> = {
  daily: '일일',
  weekly: '주간',
  main: '메인 스토리',
}

export function buildNPCPrompt(
  npcType: NPCType,
  quests: QuestInput[],
  stats: StatsInput,
  overdueCount: number,
): PromptResult {
  const systemPrompt = NPC_SYSTEM_PROMPTS[npcType]

  const questLines =
    quests.length === 0
      ? '- 오늘 등록된 퀘스트가 없습니다.'
      : quests
          .map((q) => `- [${GRADE_LABELS[q.grade]}] ${q.title} (${STAT_LABELS[q.stat_type]} 관련)`)
          .join('\n')

  const lowStats = (Object.entries(stats) as [StatType, number][])
    .filter(([, v]) => v < LOW_STAT_THRESHOLD)
    .map(([k]) => STAT_LABELS[k])

  const lowStatLine =
    lowStats.length > 0 ? `\n낮은 스탯 (주의 필요): ${lowStats.join(', ')}` : ''

  const overdueeLine =
    overdueCount > 0 ? `\n지연/미완료 퀘스트 수: ${overdueCount}개` : ''

  const userMessage =
    `오늘의 퀘스트 목록:\n${questLines}` +
    `\n\n현재 스탯 — 체력: ${stats.strength}, 지력: ${stats.intelligence}, 카리스마: ${stats.charisma}` +
    lowStatLine +
    overdueeLine +
    '\n\n위 정보를 바탕으로 오늘 하루 아침 브리핑 대사를 생성해주세요.'

  return { systemPrompt, userMessage }
}
