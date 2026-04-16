type Props = {
  value: number     // 0–100
  color: string     // CSS color value
  segments?: number // default 20
  label: string
}

export default function StatBar({ value, color, segments = 20, label }: Props) {
  const filled = Math.round((Math.max(0, Math.min(value, 100)) / 100) * segments)

  return (
    <div
      className="flex gap-[2px] items-center h-[7px]"
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
            className={`flex-1 h-full rounded-[1px] transition-all duration-500 ${isTip ? 'animate-tip-pulse' : ''}`}
            style={
              isFilled
                ? { background: color, boxShadow: `0 0 4px ${color}90` }
                : { background: '#252220', border: '1px solid #2A4A3E25' }
            }
          />
        )
      })}
    </div>
  )
}
