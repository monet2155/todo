import type { Stats } from '@/types'
import { getStatPercent } from '@/lib/stats'
import StatBar from '@/components/ui/StatBar'

type Props = {
  stats: Stats
  totalCompleted: number
  streakDays: number
}

const STAT_CONFIG = [
  {
    key: 'strength' as const,
    labelEn: 'STRENGTH',
    labelKo: '체력',
    color: '#C0392B',
  },
  {
    key: 'intelligence' as const,
    labelEn: 'INTELLIGENCE',
    labelKo: '지력',
    color: '#1A5F7A',
  },
  {
    key: 'charisma' as const,
    labelEn: 'CHARISMA',
    labelKo: '매력',
    color: '#6B3FA0',
  },
]

export default function CharacterSheet({ stats, totalCompleted, streakDays }: Props) {
  return (
    /* Wrapper for drop-shadow following clip-path shape */
    <div style={{ filter: 'drop-shadow(0 0 1px #2A4A3E80) drop-shadow(0 8px 32px #00000060)' }}>
      <div className="stat-panel p-5 space-y-4">

        {/* Header */}
        <div>
          <p
            className="text-[0.6rem] tracking-[0.28em] uppercase font-inter"
            style={{ color: '#6A6560' }}
          >
            S T A T U S
          </p>
          <div className="mt-1.5 h-px" style={{ background: 'linear-gradient(90deg, #D4A01760, transparent)' }} />
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {STAT_CONFIG.map(({ key, labelEn, color }) => {
            const value = stats[key]
            const percent = getStatPercent(value)
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <p
                    className="text-[0.6rem] tracking-[0.14em] uppercase font-inter"
                    style={{ color: '#6A6560' }}
                  >
                    {labelEn}
                  </p>
                  <span
                    className="font-cinzel-deco leading-none"
                    style={{ fontSize: '1.75rem', color, lineHeight: 1 }}
                  >
                    {value}
                  </span>
                </div>
                <StatBar value={percent} color={color} label={labelEn} />
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div
          className="h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #2A4A3E, transparent)' }}
        />

        {/* Footer stats */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p
              className="font-cinzel-deco leading-none"
              style={{ fontSize: '1.5rem', color: '#D4A017' }}
            >
              {totalCompleted}
            </p>
            <p
              className="text-[0.58rem] tracking-[0.1em] uppercase mt-1 font-inter"
              style={{ color: '#6A6560' }}
            >
              QUESTS DONE
            </p>
          </div>
          <div>
            <p
              className="font-cinzel-deco leading-none"
              style={{ fontSize: '1.5rem', color: '#D4A017' }}
            >
              {streakDays}
            </p>
            <p
              className="text-[0.58rem] tracking-[0.1em] uppercase mt-1 font-inter"
              style={{ color: '#6A6560' }}
            >
              STREAK DAYS
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
