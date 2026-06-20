/**
 * Drivex logo — two right-pointing chevrons + "DRIVEX" wordmark (X in orange).
 * Client tag: Park N Fly.
 *  Chevron 1: #E8500A (solid)   Chevron 2: #FF6B2B @ 60%
 */

export function DrivexMark({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Drivex"
      fill="none"
    >
      {/* Chevron 1 (solid orange) */}
      <path
        d="M14 14 L34 32 L14 50"
        stroke="#E8500A"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chevron 2 (lighter orange, 60%) */}
      <path
        d="M30 14 L50 32 L30 50"
        stroke="#FF6B2B"
        strokeOpacity="0.6"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Backwards-compatible alias (older imports referenced ParkNFlyMark).
export const ParkNFlyMark = DrivexMark

/** Full lockup: chevrons + DRIVEX wordmark + optional "Park N Fly" tag. */
export function Logo({ size = 40, showWordmark = true, subtitle = 'Park N Fly', dark = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <DrivexMark size={size} />
      {showWordmark && (
        <div className="leading-none">
          <div
            className="font-semibold tracking-tight"
            style={{ fontSize: size * 0.4, letterSpacing: '-0.5px' }}
          >
            <span className={dark ? 'text-white' : 'text-white'}>DRIVE</span>
            <span className="text-brand">X</span>
          </div>
          {subtitle && (
            <div
              className="mt-1 inline-block rounded-full bg-white/5 px-2 py-0.5 font-medium uppercase text-muted"
              style={{ fontSize: Math.max(8, size * 0.18), letterSpacing: '1px' }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Logo
