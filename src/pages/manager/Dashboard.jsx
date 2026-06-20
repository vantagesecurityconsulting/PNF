import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Route,
  Users,
  Bus,
  Pause,
  AlertTriangle,
  Activity,
  FileText,
  Wrench,
  Send,
  TrendingUp,
  TriangleAlert,
  Bell,
  ChevronRight,
  Timer,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useManagerStore, selectTodayKpisFor } from '../../store/useManagerStore'
import { useScope } from '../../hooks/useScope'
import { useToastStore } from '../../store/useToastStore'
import { KpiCard } from '../../components/shared/KpiCard'
import { VehicleCard } from '../../components/shared/VehicleCard'
import { Card } from '../../components/shared/Card'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { LoadingState } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { Modal } from '../../components/shared/Modal'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { buildDailyTrend, buildActivityFeed, buildAlerts, timingStats } from '../../utils/analytics'
import { deriveLiveStatus, colorClass } from '../../utils/status'
import { formatTime, formatDate, formatMinutes } from '../../utils/formatters'
import { generateOperationsSummary } from '../../utils/pdfGenerator'
import { rangeSummary } from '../../utils/analytics'

export default function Dashboard() {
  const navigate = useNavigate()
  const loading = useFakeLoad(800)
  const store = useManagerStore()
  const addToast = useToastStore((s) => s.addToast)
  const flagVehicle = useManagerStore((s) => s.flagVehicle)
  const markReportGenerated = useManagerStore((s) => s.markReportGenerated)

  const { drivers, vehicles, shifts, trips, inspections, incidents, activeLocationId, referenceToday } = useScope()
  const kpis = selectTodayKpisFor(store, activeLocationId)
  const alerts = useMemo(
    () => buildAlerts({ vehicles, incidents, drivers, shifts, inspections }, referenceToday),
    [vehicles, incidents, drivers, shifts, inspections, referenceToday],
  )

  const [flagOpen, setFlagOpen] = useState(false)
  const [flagVehicleId, setFlagVehicleId] = useState('')

  const todayShifts = useMemo(
    () => shifts.filter((s) => s.date === referenceToday),
    [shifts, referenceToday],
  )

  // Live status per vehicle
  const fleet = useMemo(() => {
    return vehicles.map((v) => {
      const shift = todayShifts.find((s) => s.vehicleId === v.id)
      const live = shift ? deriveLiveStatus(shift) : { key: 'in-lot', label: 'In Lot', color: 'gray', step: 1 }
      const driver = shift ? drivers.find((d) => d.id === shift.driverId) : null
      const completedToday = shift ? shift.trips.filter((t) => t.status === 'complete').length : 0
      const lastEvent = shift
        ? shift.trips
            .flatMap((t) => [t.departLotTime, t.arriveAirportTime, t.departAirportTime, t.arriveLotTime])
            .filter(Boolean)
            .sort()
            .pop()
        : null
      return { vehicle: v, live, driverName: driver?.name, tripCount: completedToday, lastUpdate: lastEvent }
    })
  }, [vehicles, todayShifts, drivers])

  const timing = useMemo(() => {
    const d = new Date(`${referenceToday}T12:00:00`)
    d.setDate(d.getDate() - 6)
    const cutoff = d.toISOString().slice(0, 10)
    return timingStats(trips.filter((t) => t.date >= cutoff))
  }, [trips, referenceToday])

  const trend = useMemo(() => buildDailyTrend(trips, referenceToday), [trips, referenceToday])
  const feed = useMemo(
    () => buildActivityFeed(shifts, referenceToday, drivers, vehicles, 30),
    [shifts, referenceToday, drivers, vehicles],
  )

  const generateTodayReport = () => {
    const summary = rangeSummary(shifts, inspections, drivers, vehicles, referenceToday, referenceToday)
    generateOperationsSummary({ rangeLabel: formatDate(referenceToday), ...summary })
    markReportGenerated('operations')
    addToast("Today's operations report generated", 'success')
  }

  const confirmFlag = () => {
    if (!flagVehicleId) return
    flagVehicle(flagVehicleId, true)
    const v = vehicles.find((x) => x.id === flagVehicleId)
    addToast(`${v?.busNum} flagged for maintenance`, 'warning')
    setFlagOpen(false)
    setFlagVehicleId('')
  }

  if (loading) return <LoadingState label="Loading dashboard…" />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Operations Dashboard"
        subtitle={`${formatDate(referenceToday)} · Halifax YHZ · live fleet overview`}
        icon={Activity}
        action={
          <Button icon={FileText} onClick={generateTodayReport}>
            Today's Report
          </Button>
        }
      />

      {/* KPI bar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard label="Trips Today" value={kpis.totalTrips} icon={Route} color="green" />
        <KpiCard label="Passengers" value={kpis.totalPax} icon={Users} color="info" />
        <KpiCard label="Active Vehicles" value={kpis.activeVehicles} icon={Bus} color="green" />
        <KpiCard label="Idle / In Lot" value={kpis.idleVehicles} icon={Pause} color="amber" />
        <KpiCard
          label="Flagged / Down"
          value={kpis.flaggedItems}
          icon={AlertTriangle}
          color={kpis.flaggedItems > 0 ? 'red' : 'gray'}
        />
        <KpiCard
          label="Open Incidents"
          value={kpis.openIncidents}
          icon={TriangleAlert}
          color={kpis.openIncidents > 0 ? 'red' : 'gray'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left/main column */}
        <div className="space-y-6 xl:col-span-2">
          {/* Live fleet */}
          <div>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-graytext">
              Live Fleet Status
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {fleet.map((f) => (
                <VehicleCard
                  key={f.vehicle.id}
                  vehicle={f.vehicle}
                  driverName={f.driverName}
                  liveStatus={f.live}
                  tripCount={f.tripCount}
                  lastUpdate={f.lastUpdate}
                  onClick={() => navigate('/manager/fleet')}
                />
              ))}
            </div>
          </div>

          {/* Trend chart */}
          <Card padded>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green" />
              <h2 className="text-base font-extrabold text-white">Trips Completed by Hour</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececea" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12, fontWeight: 600 }}
                  labelFormatter={(l) => `${l} hour`}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Line type="monotone" dataKey="today" name="Today" stroke="#3fae29" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="yesterday" name="Yesterday" stroke="#1976D2" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                <Line type="monotone" dataKey="avg" name="7-day avg" stroke="#f5a623" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Operations timing (last 7 days) */}
          <Card padded>
            <div className="mb-3 flex items-center gap-2">
              <Timer size={18} className="text-green" />
              <h2 className="text-base font-extrabold text-white">Operations Timing</h2>
              <span className="text-xs font-semibold text-graytext">last 7 days avg</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <TimingStat label="Trip Duration" value={timing.avgDuration} />
              <TimingStat label="Airport Dwell" value={timing.avgDwell} />
              <TimingStat label="Lot → Airport" value={timing.avgLegOut} />
              <TimingStat label="Airport → Lot" value={timing.avgLegBack} />
              <TimingStat label="Turnaround" value={timing.avgTurnaround} />
            </div>
            {timing.count === 0 && (
              <p className="mt-2 text-sm text-graytext">No completed trips in the last 7 days.</p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card padded={false}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-white">
                <Bell size={18} className={alerts.length ? 'text-danger' : 'text-green'} /> Alerts
                {alerts.length > 0 && (
                  <span className="tabular flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
                    {alerts.length}
                  </span>
                )}
              </h2>
              <button onClick={() => navigate('/manager/alerts')} className="flex items-center gap-1 text-xs font-bold text-green">
                View all <ChevronRight size={14} />
              </button>
            </div>
            {alerts.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm font-semibold text-graytext">All clear — nothing needs attention.</div>
            ) : (
              alerts.slice(0, 4).map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(a.link)}
                  className="flex w-full items-center gap-3 border-b border-line px-5 py-3 text-left last:border-0 hover:bg-white/5"
                >
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.severity === 'high' ? 'bg-danger' : a.severity === 'medium' ? 'bg-amber' : 'bg-white/20'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-white">{a.title}</div>
                    <div className="truncate text-xs text-graytext">{a.detail}</div>
                  </div>
                </button>
              ))
            )}
          </Card>

          {/* Quick actions */}
          <Card padded>
            <h2 className="mb-3 text-base font-extrabold text-white">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="secondary" fullWidth icon={FileText} onClick={generateTodayReport}>
                Generate Today's Report
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={Wrench}
                onClick={() => setFlagOpen(true)}
              >
                Flag Vehicle for Maintenance
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={Send}
                onClick={() => addToast('Shift reminder sent to all active drivers', 'success')}
              >
                Send Shift Reminder
              </Button>
            </div>
          </Card>

          {/* Activity feed */}
          <Card padded={false}>
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-extrabold text-white">Recent Activity</h2>
              <p className="text-xs text-graytext">Today's trip events</p>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {feed.length === 0 ? (
                <EmptyState title="No activity yet" message="Trip events will stream in here." />
              ) : (
                feed.map((e, i) => {
                  const c = colorClass(e.color)
                  return (
                    <div key={i} className="flex items-start gap-3 border-b border-line px-5 py-3 last:border-0">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${c.solidBg}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white">{e.type}</div>
                        <div className="text-xs text-graytext">
                          {e.driver} · {e.vehicle} · Trip {e.tripNum} · {e.pax} pax
                        </div>
                      </div>
                      <span className="tabular shrink-0 text-xs font-bold text-graytext">
                        {formatTime(e.time)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Flag vehicle modal */}
      <Modal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        title="Flag Vehicle for Maintenance"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFlagOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmFlag} disabled={!flagVehicleId}>
              Flag Vehicle
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-graytext">
          Select a vehicle to flag. Flagged vehicles are removed from active dispatch until cleared.
        </p>
        <div className="space-y-2">
          {vehicles.map((v) => (
            <label
              key={v.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${
                flagVehicleId === v.id ? 'border-danger bg-danger/5' : 'border-line hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="flagVehicle"
                  checked={flagVehicleId === v.id}
                  onChange={() => setFlagVehicleId(v.id)}
                  className="accent-danger"
                />
                <span className="font-bold text-white">{v.busNum}</span>
                <span className="text-sm text-graytext">
                  {v.make} {v.model}
                </span>
              </div>
              <Badge color={v.status === 'flagged' ? 'red' : v.status === 'active' ? 'green' : 'amber'}>
                {v.status}
              </Badge>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}

function TimingStat({ label, value }) {
  return (
    <div className="rounded-xl bg-offwhite px-3 py-2.5 text-center">
      <div className="tabular text-lg font-black text-white">{value != null ? formatMinutes(value) : '—'}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-graytext">{label}</div>
    </div>
  )
}
