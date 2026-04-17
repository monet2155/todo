import type { Stats } from '@/types'
import { getStatPercent } from '@/lib/stats'
import StatBar from '@/components/ui/StatBar'
import CornerOrnament from '@/components/ui/CornerOrnament'

type Props = {
  stats: Stats
  totalCompleted: number
  streakDays: number
}

const STAT_CONFIG = [
  {
    key:     'strength'     as const,
    label:   '체력',
    labelEn: 'STR',
    color:   '#9B2D20',
  },
  {
    key:     'intelligence' as const,
    label:   '지력',
    labelEn: 'INT',
    color:   '#2E6B5A',
  },
  {
    key:     'charisma'     as const,
    label:   '매력',
    labelEn: 'CHA',
    color:   '#5C3580',
  },
]

export default function CharacterSheet({ stats, totalCompleted, streakDays }: Props) {
  return (
    <div className="relative px-4 py-5" style={{ border: '1px solid var(--border)' }}>
      {/* Corner ornaments */}
      <CornerOrnament
        className="absolute text-[color:var(--gold)]"
        style={{ top: -5, left: -5 } as React.CSSProperties}
        size={10}
      />
      <CornerOrnament
        className="absolute text-[color:var(--gold)]"
        style={{ top: -5, right: -5 } as React.CSSProperties}
        size={10}
      />
      <CornerOrnament
        className="absolute text-[color:var(--gold)]"
        style={{ bottom: -5, left: -5 } as React.CSSProperties}
        size={10}
      />
      <CornerOrnament
        className="absolute text-[color:var(--gold)]"
        style={{ bottom: -5, right: -5 } as React.CSSProperties}
        size={10}
      />

      {/* Header */}
      <div className="mb-4">
        <p className="section-label" style={{ color: 'var(--ink)' }}>
          S&nbsp;&nbsp;T&nbsp;&nbsp;A&nbsp;&nbsp;T&nbsp;&nbsp;U&nbsp;&nbsp;S
        </p>
        <div
          className="mt-2 h-px"
          style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}
        />
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {STAT_CONFIG.map(({ key, label, labelEn, color }) => {
          const value   = stats[key]
          const percent = getStatPercent(value)
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <p
                  className="section-label"
                  style={{ color: 'var(--ink-dim)', fontSize: '0.58rem', letterSpacing: '0.16em' }}
                >
                  {labelEn}&nbsp;&nbsp;{label}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '1.5rem',
                    color,
                    lineHeight: 1,
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {value}
                </span>
              </div>
              <StatBar value={percent} color={color} label={`${label} ${value}`} />
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div
        className="my-4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        }}
      />

      {/* Footer */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '1.375rem',
              color: 'var(--gold)',
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            {totalCompleted}
          </p>
          <p
            className="section-label mt-1"
            style={{ color: 'var(--ink-dim)', fontSize: '0.55rem' }}
          >
            완수
          </p>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <p
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '1.375rem',
                color: 'var(--gold)',
                lineHeight: 1,
                fontWeight: 400,
              }}
            >
              {streakDays}
            </p>
            <span
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.6rem',
                color: 'var(--ink)',
              }}
            >
              일
            </span>
          </div>
          <p
            className="section-label mt-1"
            style={{ color: 'var(--ink-dim)', fontSize: '0.55rem' }}
          >
            연속
          </p>
        </div>
      </div>
    </div>
  )
}
