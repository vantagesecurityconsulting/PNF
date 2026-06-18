import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Gauge, Calendar, User, Bus, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useShiftStore } from '../../store/useShiftStore'
import { useToastStore } from '../../store/useToastStore'
import { mockDrivers } from '../../data/mockDrivers'
import { mockVehicles } from '../../data/mockVehicles'
import { Button } from '../../components/shared/Button'
import { Card } from '../../components/shared/Card'
import { formatDate, hoursSince, formatDate as fd } from '../../utils/formatters'
import { todayKey } from '../../utils/formatters'

export default function DriverApp() {
  const navigate = useNavigate()
  const startShift = useShiftStore((s) => s.startShift)
  const shiftStarted = useShiftStore((s) => s.shiftStarted)
  const addToast = useToastStore((s) => s.addToast)

  const [driverId, setDriverId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [odoStart, setOdoStart] = useState('')
  const [errors, setErrors] = useState({})

  const today = new Date()
  const availableDrivers = mockDrivers.filter((d) => d.status === 'active')

  const selectedVehicle = useMemo(
    () => mockVehicles.find((v) => v.id === vehicleId),
    [vehicleId],
  )

  // Last inspection warning (>24hrs ago)
  const inspectionWarning = useMemo(() => {
    if (!selectedVehicle) return null
    const hrs = hoursSince(`${selectedVehicle.lastInspection}T08:00:00`)
    return {
      stale: hrs > 24,
      date: selectedVehicle.lastInspection,
      failed: selectedVehicle.inspectionResult === 'fail',
    }
  }, [selectedVehicle])

  const onVehicleChange = (id) => {
    setVehicleId(id)
    const v = mockVehicles.find((x) => x.id === id)
    if (v) setOdoStart(String(v.odometer))
  }

  const validate = () => {
    const e = {}
    if (!driverId) e.driverId = 'Please select your name'
    if (!vehicleId) e.vehicleId = 'Please select a vehicle'
    if (!odoStart || isNaN(Number(odoStart))) e.odoStart = 'Enter a valid odometer reading'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleStart = () => {
    if (!validate()) return
    startShift({
      driverId,
      vehicleId,
      shiftDate: todayKey(),
      odoStart: Number(odoStart),
    })
    addToast('Shift started — drive safe!', 'success')
    navigate('/driver/inspection')
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tight text-ink">Start Your Shift</h1>
        <p className="mt-1 text-sm text-graytext">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {shiftStarted && (
        <Card className="mb-5 border-green/30 bg-green-light">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green" size={22} />
            <div className="flex-1 text-sm font-semibold text-green-dark">
              You already have an active shift in progress.
            </div>
            <Button size="sm" onClick={() => navigate('/driver/log')}>
              Resume
            </Button>
          </div>
        </Card>
      )}

      <Card className="space-y-5">
        {/* Driver */}
        <Field label="Driver" icon={User} error={errors.driverId}>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className={inputCls(errors.driverId)}
          >
            <option value="">Select your name…</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} · {d.employeeId}
              </option>
            ))}
          </select>
        </Field>

        {/* Vehicle */}
        <Field label="Vehicle / Bus" icon={Bus} error={errors.vehicleId}>
          <select
            value={vehicleId}
            onChange={(e) => onVehicleChange(e.target.value)}
            className={inputCls(errors.vehicleId)}
          >
            <option value="">Select a vehicle…</option>
            {mockVehicles.map((v) => (
              <option key={v.id} value={v.id} disabled={v.status === 'out-of-service'}>
                {v.busNum} — {v.make} {v.model} ({v.year})
                {v.status === 'flagged' ? ' ⚠ flagged' : ''}
              </option>
            ))}
          </select>
        </Field>

        {/* Inspection status for chosen vehicle */}
        {selectedVehicle && inspectionWarning && (
          <div
            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
              inspectionWarning.failed || inspectionWarning.stale
                ? 'bg-amber/10 text-amber'
                : 'bg-green-light text-green-dark'
            }`}
          >
            {inspectionWarning.failed || inspectionWarning.stale ? (
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <div className="font-semibold">
              Last inspection: {formatDate(selectedVehicle.lastInspection)}
              {inspectionWarning.failed && ' — previous inspection FAILED. '}
              {inspectionWarning.stale
                ? ' (over 24 hrs ago — new pre-trip inspection required).'
                : !inspectionWarning.failed && ' — current.'}
            </div>
          </div>
        )}

        {/* Odometer */}
        <Field label="Odometer Start (km)" icon={Gauge} error={errors.odoStart}>
          <input
            type="number"
            inputMode="numeric"
            value={odoStart}
            onChange={(e) => setOdoStart(e.target.value)}
            placeholder="e.g. 87432"
            className={`tabular ${inputCls(errors.odoStart)}`}
          />
        </Field>

        {/* Date (read-only) */}
        <Field label="Shift Date" icon={Calendar}>
          <input
            type="text"
            readOnly
            value={fd(today)}
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-semibold text-graytext"
          />
        </Field>

        <Button size="lg" fullWidth icon={Play} onClick={handleStart}>
          Start Shift
        </Button>
      </Card>
    </div>
  )
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink">
        {Icon && <Icon size={15} className="text-graytext" />} {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-semibold text-danger">{error}</p>}
    </div>
  )
}

const inputCls = (error) =>
  `h-12 w-full rounded-xl border bg-white px-4 font-semibold text-ink outline-none transition-colors focus:border-green ${
    error ? 'border-danger' : 'border-gray-300'
  }`
