import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Wrench, Bus, TriangleAlert, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useScope } from '../../hooks/useScope'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { Card } from '../../components/shared/Card'
import { Badge } from '../../components/shared/Badge'
import { EmptyState } from '../../components/shared/EmptyState'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { buildAlerts } from '../../utils/analytics'

const CAT_ICON = { Maintenance: Wrench, Fleet: Bus, Incident: TriangleAlert, Compliance: ShieldCheck }
const SEV = { high: { color: 'red', label: 'High' }, medium: { color: 'amber', label: 'Medium' }, low: { color: 'gray', label: 'Low' } }

export default function Alerts() {
  const loading = useFakeLoad(600)
  const navigate = useNavigate()
  const { vehicles, incidents, drivers, shifts, inspections, referenceToday } = useScope()

  const alerts = useMemo(
    () => buildAlerts({ vehicles, incidents, drivers, shifts, inspections }, referenceToday),
    [vehicles, incidents, drivers, shifts, inspections, referenceToday],
  )

  const counts = {
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
  }

  if (loading) return <LoadingState label="Checking for alerts…" />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Alerts & Maintenance"
        subtitle="Everything that needs attention, in one place"
        icon={Bell}
      />

      {alerts.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="All clear"
            message="No maintenance, fleet, incident, or compliance issues need attention right now."
          />
        </Card>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2 text-sm font-bold text-danger">
              {counts.high} high priority
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-amber/10 px-4 py-2 text-sm font-bold text-amber">
              {counts.medium} to review
            </div>
          </div>

          <div className="space-y-2.5">
            {alerts.map((a) => {
              const Icon = CAT_ICON[a.category] || Bell
              const sev = SEV[a.severity]
              return (
                <Card key={a.id} padded hover onClick={() => navigate(a.link)} className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.severity === 'high' ? 'bg-danger/10 text-danger' : a.severity === 'medium' ? 'bg-amber/10 text-amber' : 'bg-white/5 text-graytext'}`}>
                    <Icon size={20} strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-extrabold text-white">{a.title}</span>
                      <Badge color={sev.color}>{a.category}</Badge>
                    </div>
                    <div className="truncate text-sm text-graytext">{a.detail}</div>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-graytext" />
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
