import type { NPCType } from '@/types'

export const NPC_TYPES: NPCType[] = ['knight', 'rival', 'sage']

type NPCConfig = {
  label: string
  icon: string
  color: string
  dialogBorder: string
  nameColor: string
}

const NPC_CONFIG: Record<NPCType, NPCConfig> = {
  knight: {
    label: '기사단장',
    icon: '⚔️',
    color: '#B8860B',
    dialogBorder: 'border-yellow-500/50',
    nameColor: 'text-yellow-400',
  },
  rival: {
    label: '라이벌',
    icon: '🗡️',
    color: '#9B2D20',
    dialogBorder: 'border-red-500/50',
    nameColor: 'text-red-400',
  },
  sage: {
    label: '현자',
    icon: '📜',
    color: '#2E6B5A',
    dialogBorder: 'border-blue-500/50',
    nameColor: 'text-blue-400',
  },
}

export function getNPCConfig(npcType: NPCType): NPCConfig {
  return NPC_CONFIG[npcType]
}
