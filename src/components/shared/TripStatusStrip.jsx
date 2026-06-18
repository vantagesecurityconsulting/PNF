import { Bus, PlaneLanding, PlaneTakeoff, MapPin } from 'lucide-react'
import { TRIP_STEPS, stepToFleetStatus, colorClass } from '../../utils/status'

const STEP_ICONS = { 1: Bus, 2: PlaneLanding, 3: PlaneTakeoff, 4: MapPin }

/**
 * Driver app status strip — shows the current step, trip number, and a
 * color that reflects the live status (green/amber/blue/gray).
 */
export function TripStatusStrip({ step = 1, tripNum = 1 }) {
  const meta = stepToFleetStatus(step)
  const c = colorClass(meta.color)
  const Icon = STEP_ICONS[step] || Bus
  const stepLabel = TRIP_STEPS.find((s) => s.step === step)?.label || ''

  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl ${c.solidBg} px-5 py-4 text-white shadow-card`}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
          <Icon size={26} strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-white/80">
            Trip {tripNum} · Step {step} of 4
          </div>
          <div className="text-lg font-black tracking-tight">{stepLabel}</div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
          {meta.label}
        </span>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-1.5 w-6 rounded-full ${n <= step ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TripStatusStrip
