import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Route, ArrowRight } from 'lucide-react'
import { useManagerStore } from '../../store/useManagerStore'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { Card } from '../../components/shared/Card'
import { Badge } from '../../components/shared/Badge'
import { DriverAvatar } from '../../components/shared/DriverAvatar'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { driverStats } from '../../utils/analytics'

export default function Drivers() {
  const loading = useFakeLoad(800)
  const navigate = useNavigate()
  const store = useManagerStore()
  const { drivers, shifts, inspections, referenceToday } = store

  const cards = useMemo(
    () =>
      drivers.map((d) => ({
        driver: d,
        stats: driverStats(d.id, shifts, inspections, referenceToday),
      })),
    [drivers, shifts, inspections, referenceToday],
  )

  if (loading) return <LoadingState label="Loading drivers…" />

  return (
    <div className="space-y-6">
      <SectionHeader title="Driver Roster" subtitle="Team overview & shift performance" icon={Users} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ driver, stats }) => {
          const onShift = stats.onShiftToday
          const onLeave = driver.status === 'on-leave'
          return (
            <Card
              key={driver.id}
              hover
              onClick={() => navigate(`/manager/drivers/${driver.id}`)}
              className="group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <DriverAvatar driver={driver} size="lg" />
                  <div>
                    <div className="text-base font-extrabold text-ink">{driver.name}</div>
                    <div className="text-xs font-semibold text-graytext">{driver.employeeId}</div>
                  </div>
                </div>
                <Badge color={onLeave ? 'gray' : onShift ? 'green' : 'amber'} dot>
                  {onLeave ? 'On Leave' : onShift ? 'On Shift' : 'Off Shift'}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/5 pt-4 text-center">
                <Metric label="Today" value={stats.todayTrips} sub="trips" />
                <Metric label="Today" value={stats.todayPax} sub="pax" />
                <Metric label="Compliance" value={`${stats.complianceRate}%`} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-graytext">
                  <Route size={13} /> {stats.totalTrips} trips · {stats.shiftCount} shifts
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-green opacity-0 transition-opacity group-hover:opacity-100">
                  View <ArrowRight size={13} />
                </span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Metric({ label, value, sub }) {
  return (
    <div>
      <div className="tabular text-xl font-black text-ink">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-graytext">
        {label} {sub && <span className="lowercase">{sub}</span>}
      </div>
    </div>
  )
}
