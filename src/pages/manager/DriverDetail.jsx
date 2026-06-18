import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Route, Users, ShieldCheck, CalendarClock, Bus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useManagerStore } from '../../store/useManagerStore'
import { getDriverById } from '../../data/mockDrivers'
import { getVehicleLabel } from '../../data/mockVehicles'
import { Card } from '../../components/shared/Card'
import { Badge } from '../../components/shared/Badge'
import { KpiCard } from '../../components/shared/KpiCard'
import { DriverAvatar } from '../../components/shared/DriverAvatar'
import { DataTable } from '../../components/shared/DataTable'
import { Button } from '../../components/shared/Button'
import { EmptyState } from '../../components/shared/EmptyState'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { driverStats, driverDailySeries } from '../../utils/analytics'
import { formatDateShort, formatTime, formatMinutes, minutesBetween } from '../../utils/formatters'

export default function DriverDetail() {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const loading = useFakeLoad(700, [driverId])
  const store = useManagerStore()
  const { shifts, inspections, referenceToday } = store

  const driver = getDriverById(driverId)
  const stats = useMemo(
    () => driverStats(driverId, shifts, inspections, referenceToday),
    [driverId, shifts, inspections, referenceToday],
  )
  const series = useMemo(
    () => driverDailySeries(driverId, shifts, referenceToday, 30),
    [driverId, shifts, referenceToday],
  )

  if (!driver) {
    return (
      <EmptyState
        icon={Users}
        title="Driver not found"
        message="This driver does not exist in the roster."
        action={<Button onClick={() => navigate('/manager/drivers')}>Back to Roster</Button>}
      />
    )
  }

  if (loading) return <LoadingState label="Loading driver…" />

  const shiftColumns = [
    { key: 'date', header: 'Date', render: (s) => <span className="font-semibold">{formatDateShort(s.date)}</span> },
    { key: 'vehicle', header: 'Vehicle', render: (s) => getVehicleLabel(s.vehicleId) },
    {
      key: 'trips',
      header: 'Trips',
      align: 'center',
      className: 'tabular font-bold',
      render: (s) => s.trips.filter((t) => t.status === 'complete').length,
    },
    {
      key: 'pax',
      header: 'Passengers',
      align: 'center',
      className: 'tabular',
      render: (s) =>
        s.trips.reduce((sum, t) => sum + (t.paxToAirport || 0) + (t.paxFromAirport || 0), 0),
    },
    { key: 'start', header: 'Start', className: 'tabular', render: (s) => formatTime(s.startTime) },
    { key: 'end', header: 'End', className: 'tabular', render: (s) => formatTime(s.endTime) },
    {
      key: 'duration',
      header: 'Duration',
      className: 'tabular',
      render: (s) => formatMinutes(minutesBetween(s.startTime, s.endTime)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <Badge color={s.status === 'active' ? 'amber' : 'green'} dot>
          {s.status === 'active' ? 'Active' : 'Complete'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Link to="/manager/drivers" className="inline-flex items-center gap-1.5 text-sm font-bold text-graytext hover:text-ink">
        <ArrowLeft size={16} /> Back to roster
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <DriverAvatar driver={driver} size="xl" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-ink">{driver.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-graytext">
              <span className="font-semibold">{driver.employeeId}</span>
              <Badge color={driver.status === 'on-leave' ? 'gray' : stats.onShiftToday ? 'green' : 'amber'} dot>
                {driver.status === 'on-leave' ? 'On Leave' : stats.onShiftToday ? 'On Shift' : 'Off Shift'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Trips" value={stats.totalTrips} icon={Route} color="green" />
        <KpiCard label="Total Passengers" value={stats.totalPax} icon={Users} color="info" />
        <KpiCard label="Avg Trips / Shift" value={stats.avgTripsPerShift} icon={CalendarClock} color="amber" />
        <KpiCard label="Inspection Compliance" value={`${stats.complianceRate}%`} icon={ShieldCheck} color="green" />
      </div>

      {/* 30-day chart */}
      <Card padded>
        <h2 className="mb-4 text-base font-extrabold text-ink">Trips per Day — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={series} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ececea" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12, fontWeight: 600 }}
              cursor={{ fill: 'rgba(63,174,41,0.08)' }}
            />
            <Bar dataKey="trips" name="Trips" fill="#3fae29" radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Shift history */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-ink">
          <Bus size={18} className="text-green" /> Shift History
          <span className="text-sm font-semibold text-graytext">(last {Math.min(14, stats.shifts.length)})</span>
        </h2>
        <DataTable
          columns={shiftColumns}
          data={stats.shifts.slice(0, 14)}
          rowKey={(s) => s.id}
          emptyTitle="No shifts recorded"
          emptyMessage="This driver has no shift history yet."
        />
      </div>
    </div>
  )
}
