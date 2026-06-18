import { colorClass } from '../../utils/status'
import { VEHICLE_STATUS, stepToFleetStatus } from '../../utils/status'

/** Generic colored chip. */
export function Badge({ children, color = 'gray', dot = false, className = '' }) {
  const c = colorClass(color)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${c.chipBg} ${c.chipText} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${c.solidBg}`} />}
      {children}
    </span>
  )
}

/** Vehicle roster status badge (active/idle/flagged/out-of-service). */
export function StatusBadge({ status, className = '' }) {
  const meta = VEHICLE_STATUS[status] || VEHICLE_STATUS.idle
  return (
    <Badge color={meta.color} dot className={className}>
      {meta.label}
    </Badge>
  )
}

/** Live fleet status pill driven by the trip step (1–4). */
export function FleetStatusBadge({ step, className = '' }) {
  const meta = stepToFleetStatus(step)
  return (
    <Badge color={meta.color} dot className={className}>
      {meta.label}
    </Badge>
  )
}

export default Badge
