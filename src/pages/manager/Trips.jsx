import { useMemo, useState } from 'react'
import { Table2, FileDown, Filter, X } from 'lucide-react'
import { useScope } from '../../hooks/useScope'
import { useToastStore } from '../../store/useToastStore'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { DataTable } from '../../components/shared/DataTable'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { SlideOver } from '../../components/shared/SlideOver'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { formatTime, formatDateShort, formatMinutes, minutesBetween, formatDate } from '../../utils/formatters'
import { generateOperationsSummary } from '../../utils/pdfGenerator'
import { rangeSummary } from '../../utils/analytics'

export default function Trips() {
  const loading = useFakeLoad(800)
  const { trips, drivers, vehicles, inspections, shifts, referenceToday } = useScope()
  const addToast = useToastStore((s) => s.addToast)

  const getDriverName = (id) => drivers.find((d) => d.id === id)?.name || 'Unknown Driver'
  const getVehicleLabel = (id) => vehicles.find((v) => v.id === id)?.busNum || 'Unknown Vehicle'

  const [driverFilter, setDriverFilter] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    return trips
      .filter((t) => (driverFilter ? t.driverId === driverFilter : true))
      .filter((t) => (vehicleFilter ? t.vehicleId === vehicleFilter : true))
      .filter((t) => (statusFilter ? t.status === statusFilter : true))
      .filter((t) => (startDate ? t.date >= startDate : true))
      .filter((t) => (endDate ? t.date <= endDate : true))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        return (b.departLotTime || '') < (a.departLotTime || '') ? -1 : 1
      })
  }, [trips, driverFilter, vehicleFilter, statusFilter, startDate, endDate])

  const hasFilters = driverFilter || vehicleFilter || statusFilter || startDate || endDate
  const clearFilters = () => {
    setDriverFilter('')
    setVehicleFilter('')
    setStatusFilter('')
    setStartDate('')
    setEndDate('')
  }

  const exportPdf = () => {
    const dates = filtered.map((t) => t.date).sort()
    const start = startDate || dates[0] || referenceToday
    const end = endDate || dates[dates.length - 1] || referenceToday
    const summary = rangeSummary(shifts, inspections, drivers, vehicles, start, end)
    generateOperationsSummary({
      rangeLabel: `${formatDate(start)} – ${formatDate(end)}`,
      ...summary,
    })
    addToast(`Exported ${filtered.length} trips to PDF`, 'success')
  }

  const columns = [
    { key: 'date', header: 'Date', render: (t) => <span className="font-semibold">{formatDateShort(t.date)}</span> },
    { key: 'driver', header: 'Driver', render: (t) => getDriverName(t.driverId) },
    { key: 'vehicle', header: 'Vehicle', render: (t) => getVehicleLabel(t.vehicleId) },
    { key: 'tripNumber', header: 'Trip #', align: 'center', render: (t) => `#${t.tripNumber}` },
    { key: 'departLot', header: 'Depart Lot', className: 'tabular', render: (t) => formatTime(t.departLotTime) },
    { key: 'arriveAirport', header: 'Arr. Airport', className: 'tabular', render: (t) => formatTime(t.arriveAirportTime) },
    { key: 'departAirport', header: 'Dep. Airport', className: 'tabular', render: (t) => formatTime(t.departAirportTime) },
    { key: 'arriveLot', header: 'Arr. Lot', className: 'tabular', render: (t) => formatTime(t.arriveLotTime) },
    { key: 'paxTo', header: 'Pax →', align: 'center', className: 'tabular font-bold', render: (t) => t.paxToAirport ?? '—' },
    { key: 'paxFrom', header: 'Pax ←', align: 'center', className: 'tabular font-bold', render: (t) => (t.status === 'complete' ? t.paxFromAirport : '—') },
    {
      key: 'duration',
      header: 'Duration',
      className: 'tabular',
      render: (t) => formatMinutes(minutesBetween(t.departLotTime, t.arriveLotTime)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <Badge color={t.status === 'complete' ? 'green' : 'amber'} dot>
          {t.status === 'complete' ? 'Complete' : 'In Progress'}
        </Badge>
      ),
    },
  ]

  const selectCls =
    'h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-sm font-semibold text-ink outline-none focus:border-green'

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-graytext">
        <Filter size={14} /> Filters
      </span>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={selectCls} aria-label="Start date" />
      <span className="text-graytext">–</span>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={selectCls} aria-label="End date" />
      <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className={selectCls}>
        <option value="">All drivers</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className={selectCls}>
        <option value="">All vehicles</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.busNum}
          </option>
        ))}
      </select>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
        <option value="">Any status</option>
        <option value="complete">Complete</option>
        <option value="in-progress">In Progress</option>
      </select>
      {hasFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-bold text-danger hover:underline">
          <X size={13} /> Clear
        </button>
      )}
      <span className="ml-auto tabular text-xs font-bold text-graytext">{filtered.length} trips</span>
    </div>
  )

  if (loading) return <LoadingState label="Loading trips…" />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="All Trips"
        subtitle="Complete trip history across the fleet"
        icon={Table2}
        action={
          <Button icon={FileDown} onClick={exportPdf} disabled={filtered.length === 0}>
            Export PDF
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        filters={filters}
        onRowClick={setSelected}
        emptyTitle="No trips match your filters"
        emptyMessage="Try widening the date range or clearing filters."
      />

      {/* Detail slide-over */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Trip #${selected.tripNumber}` : ''}
        subtitle={
          selected
            ? `${formatDate(selected.date)} · ${getDriverName(selected.driverId)} · ${getVehicleLabel(selected.vehicleId)}`
            : ''
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge color={selected.status === 'complete' ? 'green' : 'amber'} dot>
                {selected.status === 'complete' ? 'Complete' : 'In Progress'}
              </Badge>
              <span className="tabular text-sm font-bold text-graytext">
                {formatMinutes(minutesBetween(selected.departLotTime, selected.arriveLotTime))}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
              <Timeline label="Departed parking lot" time={selected.departLotTime} color="green" />
              <Timeline label="Arrived at airport" time={selected.arriveAirportTime} color="amber" />
              <Timeline label="Departed airport" time={selected.departAirportTime} color="info" />
              <Timeline label="Arrived at parking lot" time={selected.arriveLotTime} color="green" last />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Passengers → Airport" value={selected.paxToAirport ?? 0} />
              <StatBox label="Passengers ← Airport" value={selected.status === 'complete' ? selected.paxFromAirport : '—'} />
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  )
}

function Timeline({ label, time, color, last }) {
  const dot = color === 'green' ? 'bg-green' : color === 'amber' ? 'bg-amber' : 'bg-info'
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${last ? '' : 'border-b border-black/5'}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
      <span className="tabular text-sm font-bold text-graytext">{formatTime(time)}</span>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-green-light px-4 py-3 text-center">
      <div className="tabular text-2xl font-black text-green-dark">{value}</div>
      <div className="mt-0.5 text-xs font-bold text-green-dark/70">{label}</div>
    </div>
  )
}
