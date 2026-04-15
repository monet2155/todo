import type { Quest, QuestGrade, StatType } from '@/types'

export const STAT_LABELS: Record<StatType, string> = {
  strength: '체력',
  intelligence: '지력',
  charisma: '카리스마',
}

export const GRADE_LABELS: Record<QuestGrade, string> = {
  daily: '일일',
  weekly: '주간',
  main: '메인 스토리',
}

export function isOverdue(dueDate: string | null, now: Date = new Date()): boolean {
  if (!dueDate) return false
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dueDate)
  const dueLocal = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  return dueLocal < today
}

export function groupQuestsByGrade(quests: Quest[]): Record<QuestGrade, Quest[]> {
  const groups: Record<QuestGrade, Quest[]> = { daily: [], weekly: [], main: [] }
  for (const q of quests) {
    groups[q.grade].push(q)
  }
  return groups
}
