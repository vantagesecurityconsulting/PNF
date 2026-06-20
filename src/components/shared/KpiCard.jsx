import { TrendingUp, TrendingDown } from 'lucide-react'
import { colorClass } from '../../utils/status'

/** Dashboard KPI tile: label, big value, optional delta + icon. */
export function KpiCard({ label, value, delta, deltaLabel, icon: Icon, color = 'green', className = '' }) {
  const c = colorClass(color)
  const hasDelta = delta !== undefined && delta !== null
  const up = Number(delta) >= 0

  return (
    <div className={`rounded-2xl bg-surface p-4 shadow-card border border-line ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-graytext">{label}</span>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.chipBg} ${c.chipText}`}>
            <Icon size={16} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div className="mt-2 tabular text-3xl font-black tracking-tight text-white">{value}</div>
      {hasDelta && (
        <div
          className={`mt-1 flex items-center gap-1 text-xs font-bold ${
            up ? 'text-green' : 'text-danger'
          }`}
        >
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span className="tabular">
            {up ? '+' : ''}
            {delta}
            {deltaLabel ? ` ${deltaLabel}` : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export default KpiCard
