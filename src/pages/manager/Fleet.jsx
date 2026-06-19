import { useMemo, useState } from 'react'
import { Bus, Wrench, Save, CheckCircle2, XCircle, Route, Calendar, Plus, AlertTriangle, Power, Fuel, Sheet } from 'lucide-react'
import { downloadCSV } from '../../utils/csv'
import { useManagerStore } from '../../store/useManagerStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useScope } from '../../hooks/useScope'
import { useToastStore } from '../../store/useToastStore'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { DataTable } from '../../components/shared/DataTable'
import { StatusBadge, Badge } from '../../components/shared/Badge'
import { SlideOver } from '../../components/shared/SlideOver'
import { Modal } from '../../components/shared/Modal'
import { Button } from '../../components/shared/Button'
import { Card } from '../../components/shared/Card'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { formatDate, formatNumber } from '../../utils/formatters'
import { getItemLabel } from '../../data/inspectionItems'
import { vehicleStats, fuelStats } from '../../utils/analytics'
import { getFailedItems } from '../../data/mockInspections'
import { VEHICLE_STATUS } from '../../utils/status'

const emptyForm = { busNum: '', make: '', model: '', year: '', capacity: '', odometer: '' }

export default function Fleet() {
  const loading = useFakeLoad(800)
  const { vehicles, shifts, inspections, drivers, activeLocationId, referenceToday } = useScope()
  const updateMaintenanceNotes = useManagerStore((s) => s.updateMaintenanceNotes)
  const setVehicleStatus = useManagerStore((s) => s.setVehicleStatus)
  const addVehicle = useManagerStore((s) => s.addVehicle)
  const addToast = useToastStore((s) => s.addToast)

  const [selectedId, setSelectedId] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErr, setFormErr] = useState('')

  const selected = vehicles.find((v) => v.id === selectedId)
  const driverName = (id) => drivers.find((d) => d.id === id)?.name || '—'

  const currentDriver = (vehicleId) => {
    const shift = shifts.find((s) => s.date === referenceToday && s.vehicleId === vehicleId && s.status === 'active')
    return shift ? driverName(shift.driverId) : '—'
  }

  const openVehicle = (v) => {
    setSelectedId(v.id)
    setNotesDraft(v.maintenanceNotes || '')
  }

  const saveNotes = () => {
    updateMaintenanceNotes(selectedId, notesDraft)
    addToast('Maintenance notes saved', 'success')
  }

  const submitVehicle = () => {
    if (!form.busNum.trim() || !form.make.trim() || !form.model.trim()) {
      setFormErr('Bus number, make, and model are required.')
      return
    }
    addVehicle({ ...form, locationId: activeLocationId })
    addToast(`${form.busNum} added to the fleet`, 'success')
    setAddOpen(false)
    setForm(emptyForm)
    setFormErr('')
  }

  const stats = useMemo(
    () => (selected ? vehicleStats(selected.id, shifts, inspections, referenceToday) : null),
    [selected, shifts, inspections, referenceToday],
  )
  const fuel = useMemo(() => (selected ? fuelStats(selected.id, shifts) : null), [selected, shifts])

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
        ) : v.inspectionResult === 'fail' ? (
          <span className="inline-flex items-center gap-1 font-bold text-danger"><XCircle size={15} /> Fail</span>
        ) : (
          <span className="text-graytext">—</span>
        ),
    },
    { key: 'nextServiceDue', header: 'Next Service', render: (v) => formatDate(v.nextServiceDue) },
  ]

  const inputCls = 'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-green'

  const exportCsv = () => {
    downloadCSV('shuttlelog-fleet', vehicles, [
      { header: 'Bus #', value: (v) => v.busNum },
      { header: 'Make', value: (v) => v.make },
      { header: 'Model', value: (v) => v.model },
      { header: 'Year', value: (v) => v.year },
      { header: 'Capacity', value: (v) => v.capacity },
      { header: 'Status', value: (v) => v.status },
      { header: 'Odometer', value: (v) => v.odometer },
      { header: 'Last Inspection', value: (v) => v.lastInspection || '' },
      { header: 'Inspection Result', value: (v) => v.inspectionResult || '' },
      { header: 'Next Service Due', value: (v) => v.nextServiceDue || '' },
    ])
    addToast(`Exported ${vehicles.length} vehicles to CSV`, 'success')
  }

  if (loading) return <LoadingState label="Loading fleet…" />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fleet Status"
        subtitle="Vehicle roster, inspection results & maintenance"
        icon={Bus}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Sheet} onClick={exportCsv} disabled={vehicles.length === 0}>
              CSV
            </Button>
            <Button icon={Plus} onClick={() => setAddOpen(true)}>Add Vehicle</Button>
          </div>
        }
      />

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(VEHICLE_STATUS).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs font-semibold text-graytext">
            {meta.dot} {meta.label}
          </span>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        onRowClick={openVehicle}
        rowKey={(v) => v.id}
        emptyTitle="No vehicles yet"
        emptyMessage="Add a vehicle to this location's fleet to get started."
      />

      {/* Detail slide-over */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.busNum}
        subtitle={selected ? `${selected.make} ${selected.model} · ${selected.year}` : ''}
      >
        {selected && stats && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={selected.status} />
              <div className="flex gap-2">
                {selected.status !== 'out-of-service' ? (
                  <Button size="sm" variant="danger" icon={Power} onClick={() => { setVehicleStatus(selected.id, 'out-of-service', 'Manually downed for maintenance'); addToast(`${selected.busNum} downed for maintenance`, 'warning') }}>
                    Down for Maintenance
                  </Button>
                ) : (
                  <Button size="sm" icon={CheckCircle2} onClick={() => { setVehicleStatus(selected.id, 'active'); addToast(`${selected.busNum} returned to service`, 'success') }}>
                    Return to Service
                  </Button>
                )}
              </div>
            </div>

            {/* Down reason callout */}
            {selected.status === 'out-of-service' && selected.downReason && (
              <div className="flex items-start gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" /> {selected.downReason}
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <MiniStat icon={Route} label="Trips / wk" value={stats.weekTrips} />
              <MiniStat icon={Calendar} label="Total Trips" value={stats.totalTrips} />
              <MiniStat icon={CheckCircle2} label="Inspections" value={stats.inspectionCount} />
            </div>

            <Card padded>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="Odometer" value={`${formatNumber(selected.odometer)} km`} />
                <Info label="Capacity" value={`${selected.capacity} pax`} />
                <Info label="Last Inspection" value={formatDate(selected.lastInspection)} />
                <Info label="Next Service" value={formatDate(selected.nextServiceDue)} />
              </div>
            </Card>

            {/* Fuel economy & log */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-graytext">
                <Fuel size={14} /> Fuel Economy
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat icon={Fuel} label="Avg L/100km" value={fuel.avgL100 ?? '—'} />
                <MiniStat icon={Fuel} label="Total Litres" value={fuel.totalLitres} />
                <MiniStat icon={Fuel} label="Fill-ups" value={fuel.fills} />
              </div>
              {fuel.entries.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-black/5 bg-white">
                  <div className="grid grid-cols-4 gap-2 border-b border-black/5 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-graytext">
                    <span>Date</span><span className="text-right">Litres</span><span className="text-right">km</span><span className="text-right">L/100km</span>
                  </div>
                  {fuel.entries.slice(0, 8).map((e, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 border-b border-black/5 px-3 py-2 text-sm last:border-0">
                      <span className="font-semibold text-ink">{formatDate(e.date)}</span>
                      <span className="tabular text-right">{e.litres} L</span>
                      <span className="tabular text-right">{e.km != null ? formatNumber(e.km) : '—'}</span>
                      <span className="tabular text-right font-bold text-ink">{e.l100 ?? '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-graytext">No fuel logged for this vehicle yet.</p>
              )}
            </div>

            {/* Inspection history */}
            <div>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-graytext">Inspection History</h3>
              <div className="space-y-2">
                {stats.inspections.slice(0, 10).map((insp) => {
                  const failed = getFailedItems(insp)
                  const result = insp.overallResult
                  const badge = result === 'pass'
                    ? { color: 'green', label: 'Pass' }
                    : result === 'incomplete' || insp.complete === false
                      ? { color: 'amber', label: 'Incomplete' }
                      : { color: 'red', label: 'Fail' }
                  return (
                    <Card key={insp.id} padded>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-ink">{formatDate(insp.date)}</span>
                        <Badge color={badge.color} dot>{badge.label}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-graytext">
                        {driverName(insp.driverId)} · Fuel: {insp.fuelLevel || '—'}
                      </div>
                      {failed.length > 0 && (
                        <div className="mt-2 rounded-lg bg-danger/10 px-3 py-2">
                          <div className="text-xs font-bold text-danger">Failed items:</div>
                          <ul className="mt-1 space-y-0.5">
                            {failed.map((k) => (
                              <li key={k} className="text-xs font-semibold text-danger">• {getItemLabel(k)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {insp.photos?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {insp.photos.map((src, i) => (
                            <a key={i} href={src} target="_blank" rel="noreferrer" className="block h-14 w-14 overflow-hidden rounded-lg border border-black/10">
                              <img src={src} alt={`inspection photo ${i + 1}`} className="h-full w-full object-cover" />
                            </a>
                          ))}
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

            {/* Maintenance notes */}
            <div>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-graytext">Maintenance Notes</h3>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-green"
              />
              <Button className="mt-2" size="sm" icon={Save} onClick={saveNotes}>Save Notes</Button>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Add vehicle modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Vehicle to Fleet"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button icon={Plus} onClick={submitVehicle}>Add Vehicle</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Bus Number"><input className={inputCls} value={form.busNum} onChange={(e) => setForm({ ...form, busNum: e.target.value })} placeholder="Bus 5" /></FormField>
          <FormField label="Year"><input className={inputCls} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" /></FormField>
          <FormField label="Make"><input className={inputCls} value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Ford" /></FormField>
          <FormField label="Model"><input className={inputCls} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Transit 350" /></FormField>
          <FormField label="Capacity"><input className={inputCls} type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="12" /></FormField>
          <FormField label="Odometer (km)"><input className={inputCls} type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="0" /></FormField>
        </div>
        {formErr && <p className="mt-3 text-sm font-semibold text-danger">{formErr}</p>}
      </Modal>
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

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-graytext">{label}</label>
      {children}
    </div>
  )
}
