export function LogoSvg({
  className = "",
  width = 400,
  height = 100,
  showText = true,
}: {
  className?: string
  width?: number
  height?: number
  showText?: boolean
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      fill="none"
      stroke="#D2B877"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={className}
    >
      <g strokeWidth="4">
        <rect x="5" y="5" width="90" height="90" rx="10" ry="10" />
        <path d="M20 55 L45 30 L58 50 L68 40 L80 55 Z" />
        <path
          d="M20 55
               A30 30 0 0 0 80 55
               Q80 85 50 85
               Q20 85 20 55 Z"
          fill="none"
        />
        <circle cx="75" cy="25" r="5" />
      </g>

      {showText && (
        <g fill="#D2B877" stroke="none" fontFamily="serif" fontSize="70">
          <text x="110" y="75">
            Pocket Curator
          </text>
        </g>
      )}
    </svg>
  )
}
