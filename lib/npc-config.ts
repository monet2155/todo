import type { NPCType } from '@/types'

export const NPC_TYPES: NPCType[] = ['knight', 'rival', 'sage']

type NPCConfig = {
  label: string
  icon: string
  dialogBorder: string
  nameColor: string
}

const NPC_CONFIG: Record<NPCType, NPCConfig> = {
  knight: {
    label: '기사단장',
    icon: '⚔️',
    dialogBorder: 'border-yellow-500/50',
    nameColor: 'text-yellow-400',
  },
  rival: {
    label: '라이벌',
    icon: '🗡️',
    dialogBorder: 'border-red-500/50',
    nameColor: 'text-red-400',
  },
  sage: {
    label: '현자',
    icon: '📜',
    dialogBorder: 'border-blue-500/50',
    nameColor: 'text-blue-400',
  },
}

export function getNPCConfig(npcType: NPCType): NPCConfig {
  return NPC_CONFIG[npcType]
}
