import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TriangleAlert, Send, CheckCircle2 } from 'lucide-react'
import { useShiftStore } from '../../store/useShiftStore'
import { useManagerStore } from '../../store/useManagerStore'
import { useToastStore } from '../../store/useToastStore'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { formatTime } from '../../utils/formatters'
import { INCIDENT_TYPES, INCIDENT_SEVERITY } from '../../data/mockIncidents'

export default function IncidentReport() {
  const navigate = useNavigate()
  const shiftStarted = useShiftStore((s) => s.shiftStarted)
  const driverId = useShiftStore((s) => s.driverId)
  const vehicleId = useShiftStore((s) => s.vehicleId)
  const locationId = useShiftStore((s) => s.locationId)
  const shiftDate = useShiftStore((s) => s.shiftDate)
  const incidents = useShiftStore((s) => s.incidents)
  const addShiftIncident = useShiftStore((s) => s.addShiftIncident)

  const drivers = useManagerStore((s) => s.drivers)
  const addIncident = useManagerStore((s) => s.addIncident)
  const addToast = useToastStore((s) => s.addToast)

  const driver = drivers.find((d) => d.id === driverId)

  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('Low')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  if (!shiftStarted) {
    navigate('/driver', { replace: true })
    return null
  }

  const submit = () => {
    if (!type) return setError('Please select an incident type.')
    if (!description.trim()) return setError('Please describe what happened.')
    const now = new Date().toISOString()
    const payload = {
      date: shiftDate,
      time: now,
      driverId,
      vehicleId,
      locationId,
      type,
      severity,
      description: description.trim(),
      reportedBy: driver?.name || 'Driver',
    }
    // File immediately to the manager system of record…
    addIncident(payload)
    // …and keep a local copy for this shift's record / report.
    addShiftIncident(payload)
    addToast('Incident report submitted to management', severity === 'Critical' || severity === 'High' ? 'warning' : 'success')
    setType('')
    setSeverity('Low')
    setDescription('')
    setError('')
  }

  const inputCls = 'h-12 w-full rounded-xl border border-gray-300 bg-white px-4 font-semibold text-ink outline-none focus:border-green'

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-ink">
          <TriangleAlert className="text-amber" size={24} /> Report an Incident
        </h1>
        <p className="text-sm text-graytext">File a report for collisions, injuries, hazards, or near misses.</p>
      </div>

      <Card padded className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink">Incident Type</label>
          <select value={type} onChange={(e) => { setType(e.target.value); setError('') }} className={inputCls}>
            <option value="">Select type…</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink">Severity</label>
          <div className="grid grid-cols-4 gap-2">
            {INCIDENT_SEVERITY.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`h-11 rounded-xl border-2 text-sm font-bold transition-colors ${
                  severity === s
                    ? s === 'Low'
                      ? 'border-gray-400 bg-gray-100 text-ink'
                      : s === 'Medium'
                        ? 'border-amber bg-amber/10 text-amber'
                        : 'border-danger bg-danger/10 text-danger'
                    : 'border-gray-200 text-graytext hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink">What happened?</label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError('') }}
            rows={5}
            placeholder="Describe the incident: where, when, who was involved, any injuries or damage…"
            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-green"
          />
        </div>

        {error && <p className="text-sm font-semibold text-danger">{error}</p>}

        <Button size="lg" fullWidth icon={Send} onClick={submit}>
          Submit Incident Report
        </Button>
      </Card>

      {/* Filed this shift */}
      {incidents.length > 0 && (
        <Card padded>
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-graytext">Filed This Shift</h2>
          <div className="space-y-2">
            {incidents.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between rounded-xl bg-offwhite px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green" />
                  <div>
                    <div className="text-sm font-bold text-ink">{inc.type}</div>
                    <div className="text-xs text-graytext">{formatTime(inc.time)}</div>
                  </div>
                </div>
                <Badge color={inc.severity === 'Low' ? 'gray' : inc.severity === 'Medium' ? 'amber' : 'red'}>
                  {inc.severity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
