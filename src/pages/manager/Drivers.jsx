import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Route, ArrowRight, Plus, StickyNote, Sheet, Trophy } from 'lucide-react'
import { downloadCSV } from '../../utils/csv'
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

  const leaderboard = useMemo(
    () => [...cards].filter((c) => c.stats.totalTrips > 0).sort((a, b) => b.stats.totalTrips - a.stats.totalTrips).slice(0, 5),
    [cards],
  )

  const exportCsv = () => {
    downloadCSV('shuttlelog-staff', cards, [
      { header: 'Name', value: (c) => c.driver.name },
      { header: 'Employee #', value: (c) => c.driver.employeeId },
      { header: 'Status', value: (c) => c.driver.status },
      { header: 'Total Trips', value: (c) => c.stats.totalTrips },
      { header: 'Total Passengers', value: (c) => c.stats.totalPax },
      { header: 'Shifts', value: (c) => c.stats.shiftCount },
      { header: 'Avg Trips/Shift', value: (c) => c.stats.avgTripsPerShift },
      { header: 'Compliance %', value: (c) => c.stats.complianceRate },
    ])
    addToast(`Exported ${cards.length} staff to CSV`, 'success')
  }

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
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Sheet} onClick={exportCsv} disabled={cards.length === 0}>
              CSV
            </Button>
            <Button icon={Plus} onClick={() => setAddOpen(true)}>Add Staff</Button>
          </div>
        }
      />

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card padded>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Trophy size={18} className="text-amber" /> Leaderboard
            <span className="text-xs font-semibold text-graytext">by total trips</span>
          </h2>
          <div className="mt-3 space-y-1.5">
            {leaderboard.map(({ driver, stats }, i) => (
              <button
                key={driver.id}
                onClick={() => navigate(`/manager/drivers/${driver.id}`)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-gray-50"
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  i === 0 ? 'bg-amber text-white' : i === 1 ? 'bg-gray-300 text-ink' : i === 2 ? 'bg-amber/40 text-amber' : 'bg-gray-100 text-graytext'
                }`}>
                  {i + 1}
                </span>
                <DriverAvatar driver={driver} size="sm" />
                <span className="flex-1 truncate text-sm font-bold text-ink">{driver.name}</span>
                <span className="tabular text-sm font-bold text-ink">{stats.totalTrips} trips</span>
                <span className="tabular hidden w-20 text-right text-xs font-semibold text-graytext sm:inline">{stats.totalPax} pax</span>
                <span className="tabular hidden w-16 text-right text-xs font-semibold text-graytext sm:inline">{stats.complianceRate}%</span>
              </button>
            ))}
          </div>
        </Card>
      )}

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
