type Props = {
  className?: string
  style?: React.CSSProperties
  size?: number
}

export default function CornerOrnament({ className = '', style, size = 10 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Center diamond */}
      <rect
        x="3.2" y="3.2" width="3.6" height="3.6"
        transform="rotate(45 5 5)"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      {/* Arms */}
      <line x1="5" y1="0"   x2="5" y2="2.7"   stroke="currentColor" strokeWidth="0.7" />
      <line x1="5" y1="7.3" x2="5" y2="10"    stroke="currentColor" strokeWidth="0.7" />
      <line x1="0"   y1="5" x2="2.7"   y2="5" stroke="currentColor" strokeWidth="0.7" />
      <line x1="7.3" y1="5" x2="10"    y2="5" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  )
}
