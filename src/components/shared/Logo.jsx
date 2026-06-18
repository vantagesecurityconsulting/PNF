/**
 * Park'N Fly logo — recreated inline as SVG (no external image files).
 * Green rectangle, white car silhouette, black airplane.
 */

export function ParkNFlyMark({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Park'N Fly"
    >
      <rect width="64" height="64" rx="10" fill="#3fae29" />
      {/* car silhouette */}
      <path
        d="M11 41c0-3 2-5.5 5.5-6.5l3.8-6.8c.9-1.6 2.6-2.7 4.5-2.7h9.4c1.9 0 3.6 1 4.5 2.7l2.7 5.2c3.8 1 5.6 3.6 5.6 7.4v2.6c0 1-.8 1.8-1.8 1.8h-2.4a3.6 3.6 0 0 1-7.2 0H23.1a3.6 3.6 0 0 1-7.2 0h-2.6c-1 0-1.8-.8-1.8-1.8V41z"
        fill="#ffffff"
      />
      {/* airplane */}
      <path
        d="M39 14l14.5 6.2-14.2 2.1-2.8 5.9-2.1-.8 1-5.9-5-1.1 2-3 4.1 1L39 14z"
        fill="#111111"
      />
    </svg>
  )
}

/** Full lockup: mark + "Park'N Fly" / ShuttleLog wordmark. */
export function Logo({ size = 40, showWordmark = true, subtitle = 'ShuttleLog', dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <ParkNFlyMark size={size} />
      {showWordmark && (
        <div className="leading-none">
          <div
            className={`font-black tracking-tight ${dark ? 'text-white' : 'text-ink'}`}
            style={{ fontSize: size * 0.42 }}
          >
            Park'N Fly
          </div>
          {subtitle && (
            <div
              className="font-extrabold tracking-tight text-green"
              style={{ fontSize: size * 0.32, marginTop: 2 }}
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
