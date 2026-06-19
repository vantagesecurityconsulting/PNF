import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Route, ArrowRight, Plus, StickyNote } from 'lucide-react'
import { useManagerStore } from '../../store/useManagerStore'
import { useScope } from '../../hooks/useScope'
import { useToastStore } from '../../store/useToastStore'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { Card } from '../../components/shared/Card'
import { Badge } from '../../components/shared/Badge'
import { Modal } from '../../components/shared/Modal'
import { Button } from '../../components/shared/Button'
import { DriverAvatar } from '../../components/shared/DriverAvatar'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { driverStats } from '../../utils/analytics'

export default function Drivers() {
  const loading = useFakeLoad(800)
  const navigate = useNavigate()
  const { drivers, shifts, inspections, activeLocationId, referenceToday } = useScope()
  const addStaff = useManagerStore((s) => s.addStaff)
  const addToast = useToastStore((s) => s.addToast)

  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [err, setErr] = useState('')

  const cards = useMemo(
    () => drivers.map((d) => ({ driver: d, stats: driverStats(d.id, shifts, inspections, referenceToday) })),
    [drivers, shifts, inspections, referenceToday],
  )

  const submit = () => {
    if (!name.trim() || !employeeId.trim()) {
      setErr('Name and employee number are required.')
      return
    }
    addStaff({ name: name.trim(), employeeId: employeeId.trim(), locationId: activeLocationId })
    addToast(`${name.trim()} added to staff`, 'success')
    setAddOpen(false)
    setName('')
    setEmployeeId('')
    setErr('')
  }

  const inputCls = 'h-11 w-full rounded-xl border border-gray-300 bg-white px-4 font-semibold text-ink outline-none focus:border-green'

  if (loading) return <LoadingState label="Loading staff…" />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Staff Roster"
        subtitle="Team overview & shift performance"
        icon={Users}
        action={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add Staff</Button>}
      />

      {cards.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <p className="font-semibold text-ink">No staff at this location yet.</p>
            <Button className="mt-4" icon={Plus} onClick={() => setAddOpen(true)}>Add your first staff member</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ driver, stats }) => {
            const onShift = stats.onShiftToday
            const onLeave = driver.status === 'on-leave'
            return (
              <Card key={driver.id} hover onClick={() => navigate(`/manager/drivers/${driver.id}`)} className="group">
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
                  {driver.notes ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber" title="Has manager notes">
                      <StickyNote size={13} /> Note
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-green opacity-0 transition-opacity group-hover:opacity-100">
                      View <ArrowRight size={13} />
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add staff modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Staff Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button icon={Plus} onClick={submit}>Add Staff</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-graytext">Full Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-graytext">Employee Number</label>
            <input className={inputCls} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP-100" />
          </div>
          {err && <p className="text-sm font-semibold text-danger">{err}</p>}
        </div>
      </Modal>
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
