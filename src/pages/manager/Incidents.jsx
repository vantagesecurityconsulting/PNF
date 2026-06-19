import { useMemo, useState } from 'react'
import { TriangleAlert, FileDown, Filter } from 'lucide-react'
import { useManagerStore } from '../../store/useManagerStore'
import { useScope } from '../../hooks/useScope'
import { useToastStore } from '../../store/useToastStore'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { DataTable } from '../../components/shared/DataTable'
import { Badge } from '../../components/shared/Badge'
import { SlideOver } from '../../components/shared/SlideOver'
import { Button } from '../../components/shared/Button'
import { Card } from '../../components/shared/Card'
import { LoadingState } from '../../components/shared/Spinner'
import { useFakeLoad } from '../../hooks/useFakeLoad'
import { formatDate, formatTime, formatDateTime } from '../../utils/formatters'
import { getVehicleLabel } from '../../data/mockVehicles'
import { INCIDENT_STATUS, INCIDENT_SEVERITY } from '../../data/mockIncidents'
import { generateIncidentReport } from '../../utils/pdfGenerator'

const SEVERITY_COLOR = { Low: 'gray', Medium: 'amber', High: 'red', Critical: 'red' }

export default function Incidents() {
  const loading = useFakeLoad(700)
  const { incidents, drivers, vehicles } = useScope()
  const updateIncident = useManagerStore((s) => s.updateIncident)
  const markReportGenerated = useManagerStore((s) => s.markReportGenerated)
  const addToast = useToastStore((s) => s.addToast)

  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')

  const driverName = (id) => drivers.find((d) => d.id === id)?.name || '—'
  const vehicleName = (id) => vehicles.find((v) => v.id === id)?.busNum || getVehicleLabel(id)

  const filtered = useMemo(
    () =>
      incidents
        .filter((i) => (statusFilter ? i.status === statusFilter : true))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [incidents, statusFilter],
  )

  const selected = incidents.find((i) => i.id === selectedId)

  const open = (inc) => {
    setSelectedId(inc.id)
    setNotesDraft(inc.managerNotes || '')
  }

  const setStatus = (status) => {
    updateIncident(selectedId, { status })
    addToast(`Incident marked ${INCIDENT_STATUS[status].label}`, status === 'resolved' ? 'success' : 'warning')
  }

  const saveNotes = () => {
    updateIncident(selectedId, { managerNotes: notesDraft })
    addToast('Incident notes saved', 'success')
  }

  const exportPdf = (inc) => {
    generateIncidentReport({
      incident: inc,
      driverName: driverName(inc.driverId),
      vehicleName: vehicleName(inc.vehicleId),
    })
    markReportGenerated('incident')
    addToast('Incident report downloaded', 'success')
  }

  const columns = [
    { key: 'date', header: 'Date', render: (i) => <span className="font-semibold">{formatDate(i.date)}</span> },
    { key: 'type', header: 'Type', render: (i) => <span className="font-bold text-ink">{i.type}</span> },
    { key: 'severity', header: 'Severity', render: (i) => <Badge color={SEVERITY_COLOR[i.severity] || 'gray'}>{i.severity}</Badge> },
    { key: 'driver', header: 'Driver', render: (i) => driverName(i.driverId) },
    { key: 'vehicle', header: 'Vehicle', render: (i) => vehicleName(i.vehicleId) },
    {
      key: 'status',
      header: 'Status',
      render: (i) => {
        const m = INCIDENT_STATUS[i.status] || INCIDENT_STATUS.open
        return <Badge color={m.color} dot>{m.label}</Badge>
      },
    },
  ]

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-graytext">
        <Filter size={14} /> Status
      </span>
      {['', 'open', 'reviewing', 'resolved'].map((s) => (
        <button
          key={s || 'all'}
          onClick={() => setStatusFilter(s)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            statusFilter === s ? 'bg-green text-white' : 'bg-white text-graytext hover:bg-gray-100'
          }`}
        >
          {s ? INCIDENT_STATUS[s].label : 'All'}
        </button>
      ))}
      <span className="ml-auto tabular text-xs font-bold text-graytext">{filtered.length} incidents</span>
    </div>
  )

  if (loading) return <LoadingState label="Loading incidents…" />

  return (
    <div className="space-y-6">
      <SectionHeader title="Incident Reports" subtitle="Driver-filed incidents — review, resolve & export" icon={TriangleAlert} />

      <DataTable
        columns={columns}
        data={filtered}
        filters={filters}
        onRowClick={open}
        emptyTitle="No incidents"
        emptyMessage="Incident reports filed by drivers will appear here."
      />

      <SlideOver
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.type}
        subtitle={selected ? `${formatDateTime(selected.time)} · ${vehicleName(selected.vehicleId)}` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={SEVERITY_COLOR[selected.severity] || 'gray'}>{selected.severity} severity</Badge>
              <Badge color={INCIDENT_STATUS[selected.status].color} dot>{INCIDENT_STATUS[selected.status].label}</Badge>
            </div>

            <Card padded>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="Reported by" value={selected.reportedBy || driverName(selected.driverId)} />
                <Info label="Vehicle" value={vehicleName(selected.vehicleId)} />
                <Info label="Date" value={formatDate(selected.date)} />
                <Info label="Time" value={formatTime(selected.time)} />
              </div>
            </Card>

            <div>
              <h3 className="mb-1.5 text-sm font-extrabold uppercase tracking-wide text-graytext">Description</h3>
              <p className="rounded-xl bg-white p-4 text-sm leading-relaxed text-ink shadow-card">{selected.description}</p>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-extrabold uppercase tracking-wide text-graytext">Manager Notes</h3>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-green"
              />
              <Button className="mt-2" size="sm" onClick={saveNotes}>Save Notes</Button>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-extrabold uppercase tracking-wide text-graytext">Update Status</h3>
              <div className="flex gap-2">
                {Object.entries(INCIDENT_STATUS).map(([key, m]) => {
                  const activeBorder =
                    m.color === 'green' ? 'border-green' : m.color === 'amber' ? 'border-amber' : 'border-danger'
                  return (
                    <button
                      key={key}
                      onClick={() => setStatus(key)}
                      className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
                        selected.status === key
                          ? `${activeBorder} bg-gray-50 text-ink`
                          : 'border-gray-200 text-graytext hover:bg-gray-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button fullWidth variant="secondary" icon={FileDown} onClick={() => exportPdf(selected)}>
              Download Incident Report PDF
            </Button>
          </div>
        )}
      </SlideOver>
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
