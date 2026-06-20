/** Horizontal progress bar with optional label + percentage. */
export function ProgressBar({ value = 0, max = 100, label, showPct = true, color = 'green', className = '' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const barColor =
    color === 'green' ? 'bg-green' : color === 'amber' ? 'bg-amber' : color === 'red' ? 'bg-danger' : 'bg-green'

  return (
    <div className={className}>
      {(label || showPct) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && <span className="font-semibold text-white">{label}</span>}
          {showPct && <span className="tabular font-bold text-graytext">{pct}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
