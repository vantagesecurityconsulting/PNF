import { useMemo, useState } from 'react'
import { Bus, Wrench, Save, CheckCircle2, XCircle, Route, Calendar } from 'lucide-react'
import { useManagerStore } from '../../store/useManagerStore'
import { useToastStore } from '../../store/useToastStore'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { DataTable } from '../../components/shared/DataTable'
import { StatusBadge, Badge } from '../../components/shared/Badge'
import { SlideOver } from '../../components/shared/SlideOver'
import { Button } from '../../components/shared/Button'
import { Card } from '../../components/shared/Card'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { formatDate, formatNumber } from '../../utils/formatters'
import { getDriverName } from '../../data/mockDrivers'
import { getItemLabel } from '../../data/inspectionItems'
import { vehicleStats } from '../../utils/analytics'
import { getFailedItems } from '../../data/mockInspections'
import { deriveLiveStatus, VEHICLE_STATUS } from '../../utils/status'

export default function Fleet() {
  const loading = useFakeLoad(800)
  const store = useManagerStore()
  const { vehicles, shifts, inspections, drivers, referenceToday } = store
  const updateMaintenanceNotes = useManagerStore((s) => s.updateMaintenanceNotes)
  const setVehicleStatus = useManagerStore((s) => s.setVehicleStatus)
  const addToast = useToastStore((s) => s.addToast)

  const [selectedId, setSelectedId] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')

  const selected = vehicles.find((v) => v.id === selectedId)

  // Current driver per vehicle (today)
  const currentDriver = (vehicleId) => {
    const shift = shifts.find((s) => s.date === referenceToday && s.vehicleId === vehicleId && s.status === 'active')
    return shift ? getDriverName(shift.driverId) : '—'
  }

  const openVehicle = (v) => {
    setSelectedId(v.id)
    setNotesDraft(v.maintenanceNotes || '')
  }

  const saveNotes = () => {
    updateMaintenanceNotes(selectedId, notesDraft)
    addToast('Maintenance notes saved', 'success')
  }

  const stats = useMemo(
    () => (selected ? vehicleStats(selected.id, shifts, inspections, referenceToday) : null),
    [selected, shifts, inspections, referenceToday],
  )

  const columns = [
    {
      key: 'busNum',
      header: 'Bus #',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-light text-green-dark">
            <Bus size={16} />
          </div>
          <span className="font-extrabold text-ink">{v.busNum}</span>
        </div>
      ),
    },
    { key: 'model', header: 'Make / Model', render: (v) => `${v.make} ${v.model}` },
    { key: 'year', header: 'Year', align: 'center', className: 'tabular' },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
    { key: 'driver', header: 'Current Driver', render: (v) => currentDriver(v.id) },
    { key: 'odometer', header: 'Odometer', align: 'right', className: 'tabular', render: (v) => `${formatNumber(v.odometer)} km` },
    { key: 'lastInspection', header: 'Last Inspection', render: (v) => formatDate(v.lastInspection) },
    {
      key: 'inspectionResult',
      header: 'Result',
      align: 'center',
      render: (v) =>
        v.inspectionResult === 'pass' ? (
          <span className="inline-flex items-center gap-1 font-bold text-green"><CheckCircle2 size={15} /> Pass</span>
        ) : (
          <span className="inline-flex items-center gap-1 font-bold text-danger"><XCircle size={15} /> Fail</span>
        ),
    },
    { key: 'nextServiceDue', header: 'Next Service', render: (v) => formatDate(v.nextServiceDue) },
  ]

  if (loading) return <LoadingState label="Loading fleet…" />

  return (
    <div className="space-y-6">
      <SectionHeader title="Fleet Status" subtitle="Vehicle roster, inspection results & maintenance" icon={Bus} />

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(VEHICLE_STATUS).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs font-semibold text-graytext">
            {meta.dot} {meta.label}
          </span>
        ))}
      </div>

      <DataTable columns={columns} data={vehicles} onRowClick={openVehicle} rowKey={(v) => v.id} />

      {/* Detail slide-over */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.busNum}
        subtitle={selected ? `${selected.make} ${selected.model} · ${selected.year}` : ''}
      >
        {selected && stats && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={selected.status} />
              <div className="flex gap-2">
                {selected.status !== 'out-of-service' ? (
                  <Button size="sm" variant="secondary" icon={Wrench} onClick={() => { setVehicleStatus(selected.id, 'out-of-service'); addToast(`${selected.busNum} marked out of service`, 'warning') }}>
                    Out of Service
                  </Button>
                ) : (
                  <Button size="sm" icon={CheckCircle2} onClick={() => { setVehicleStatus(selected.id, 'active'); addToast(`${selected.busNum} returned to service`, 'success') }}>
                    Return to Service
                  </Button>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <MiniStat icon={Route} label="Trips / wk" value={stats.weekTrips} />
              <MiniStat icon={Calendar} label="Total Trips" value={stats.totalTrips} />
              <MiniStat icon={CheckCircle2} label="Inspections" value={stats.inspectionCount} />
            </div>

            {/* Vehicle info */}
            <Card padded>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="Odometer" value={`${formatNumber(selected.odometer)} km`} />
                <Info label="Capacity" value={`${selected.capacity} pax`} />
                <Info label="Last Inspection" value={formatDate(selected.lastInspection)} />
                <Info label="Next Service" value={formatDate(selected.nextServiceDue)} />
              </div>
            </Card>

            {/* Inspection history */}
            <div>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-graytext">
                Inspection History
              </h3>
              <div className="space-y-2">
                {stats.inspections.slice(0, 10).map((insp) => {
                  const failed = getFailedItems(insp)
                  return (
                    <Card key={insp.id} padded>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-ink">{formatDate(insp.date)}</span>
                        <Badge color={insp.overallResult === 'pass' ? 'green' : 'red'} dot>
                          {insp.overallResult === 'pass' ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-graytext">
                        {getDriverName(insp.driverId)} · Fuel: {insp.fuelLevel}
                      </div>
                      {failed.length > 0 && (
                        <div className="mt-2 rounded-lg bg-danger/10 px-3 py-2">
                          <div className="text-xs font-bold text-danger">Failed items:</div>
                          <ul className="mt-1 space-y-0.5">
                            {failed.map((k) => (
                              <li key={k} className="text-xs font-semibold text-danger">
                                • {getItemLabel(k)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  )
                })}
                {stats.inspections.length === 0 && (
                  <p className="text-sm text-graytext">No inspection records for this vehicle.</p>
                )}
              </div>
            </div>

            {/* Maintenance notes (editable) */}
            <div>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-graytext">
                Maintenance Notes
              </h3>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-green"
              />
              <Button className="mt-2" size="sm" icon={Save} onClick={saveNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-card">
      <Icon size={16} className="mx-auto text-green" />
      <div className="tabular mt-1 text-xl font-black text-ink">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-graytext">{label}</div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-graytext">{label}</div>
      <div className="font-extrabold text-ink">{value}</div>
    </div>
  )
}
