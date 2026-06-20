import { Bus, Clock, Route } from 'lucide-react'
import { Badge } from './Badge'
import { colorClass } from '../../utils/status'
import { timeAgo } from '../../utils/formatters'

/**
 * Live fleet vehicle card (dashboard). Shows bus number, driver, current
 * live status pill, last update time, and today's trip count.
 */
export function VehicleCard({ vehicle, driverName, liveStatus, tripCount = 0, lastUpdate, onClick }) {
  const color = liveStatus?.color || 'gray'
  const c = colorClass(color)

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition-all hover:shadow-card-hover ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.chipBg} ${c.chipText}`}>
            <Bus size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white">{vehicle.busNum}</div>
            <div className="text-xs font-semibold text-graytext">
              {vehicle.make} {vehicle.model}
            </div>
          </div>
        </div>
        <Badge color={color} dot>
          {liveStatus?.label || 'In Lot'}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
        <span className="font-semibold text-white">{driverName || 'Unassigned'}</span>
        <span className="flex items-center gap-1 tabular font-bold text-graytext">
          <Route size={14} /> {tripCount}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-xs text-graytext">
        <Clock size={12} />
        {lastUpdate ? `Updated ${timeAgo(lastUpdate)}` : 'No activity today'}
      </div>
    </button>
  )
}

export default VehicleCard
