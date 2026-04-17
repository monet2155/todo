type Props = {
  value: number     // 0–100
  color: string
  segments?: number // default 12
  label: string
}

export default function StatBar({ value, color, segments = 12, label }: Props) {
  const filled = Math.round((Math.max(0, Math.min(value, 100)) / 100) * segments)

  return (
    <div
      className="flex gap-[3px] items-center h-[6px]"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      {Array.from({ length: segments }, (_, i) => {
        const isFilled = i < filled
        const isTip    = i === filled - 1 && filled > 0
        return (
          <div
            key={i}
            className={`flex-1 h-full transition-all duration-500 ${isTip ? 'animate-tip-pulse' : ''}`}
            style={
              isFilled
                ? {
                    background: color,
                    opacity: 0.85 + (i / segments) * 0.15,
                  }
                : {
                    background: 'var(--card)',
                    border: '1px solid color-mix(in srgb, var(--border) 30%, transparent)',
                  }
            }
          />
        )
      })}
    </div>
  )
}
