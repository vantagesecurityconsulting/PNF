import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gauge, FileDown, ClipboardCheck, LogOut, Route, Users, Clock, AlertTriangle } from 'lucide-react'
import { useShiftStore, selectTripTotals } from '../../store/useShiftStore'
import { useToastStore } from '../../store/useToastStore'
import { getDriverById } from '../../data/mockDrivers'
import { getVehicleById } from '../../data/mockVehicles'
import { allInspectionItems } from '../../data/inspectionItems'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { Modal } from '../../components/shared/Modal'
import { formatDate, formatMinutes, minutesBetween } from '../../utils/formatters'
import { generateShiftReport, generateInspectionReport } from '../../utils/pdfGenerator'

export default function EndShift() {
  const navigate = useNavigate()
  const store = useShiftStore()
  const addToast = useToastStore((s) => s.addToast)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState('')

  const {
    shiftStarted,
    driverId,
    vehicleId,
    shiftDate,
    odoStart,
    odoEnd,
    startedAt,
    trips,
    inspectionResults,
    fuelLevel,
    inspectionNotes,
    inspectionSignature,
    inspectionComplete,
    setOdoEnd,
    endShift,
  } = store

  if (!shiftStarted) {
    navigate('/driver', { replace: true })
    return null
  }

  const driver = getDriverById(driverId)
  const vehicle = getVehicleById(vehicleId)
  const totals = selectTripTotals(trips)
  const odoEndNum = Number(odoEnd)
  const totalKm =
    odoEnd !== '' && !isNaN(odoEndNum) && odoEndNum >= Number(odoStart)
      ? odoEndNum - Number(odoStart)
      : null
  const shiftDuration = minutesBetween(startedAt, new Date().toISOString())

  const failedItems = allInspectionItems.filter((i) => inspectionResults[i.key] === 'fail')

  // Assemble report payloads from the live shift store.
  const buildShiftObj = () => ({
    date: shiftDate,
    startTime: startedAt,
    endTime: new Date().toISOString(),
    odoStart: Number(odoStart),
    odoEnd: totalKm != null ? odoEndNum : null,
    trips,
  })

  const buildInspectionObj = () => ({
    id: `INSP-LOCAL`,
    date: shiftDate,
    time: startedAt,
    results: inspectionResults,
    fuelLevel,
    notes: inspectionNotes,
    signature: inspectionSignature,
    overallResult: failedItems.length > 0 ? 'fail' : 'pass',
  })

  const downloadFull = () => {
    generateShiftReport({
      shift: buildShiftObj(),
      inspection: inspectionComplete ? buildInspectionObj() : null,
      driver,
      vehicle,
    })
    addToast('Full shift report downloaded', 'success')
  }

  const downloadInspection = () => {
    if (!inspectionComplete) {
      addToast('No completed inspection to export', 'warning')
      return
    }
    generateInspectionReport({
      inspection: buildInspectionObj(),
      driver,
      vehicle,
      shift: buildShiftObj(),
    })
    addToast('Inspection report downloaded', 'success')
  }

  const handleEndShift = () => {
    if (odoEnd === '' || isNaN(odoEndNum)) {
      setError('Enter the ending odometer reading first.')
      return
    }
    if (odoEndNum < Number(odoStart)) {
      setError('Ending odometer must be greater than the start reading.')
      return
    }
    setConfirmOpen(true)
  }

  const confirmEnd = () => {
    endShift()
    addToast('Shift ended. Thanks for your work today!', 'success')
    navigate('/driver')
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black tracking-tight text-ink">End of Shift</h1>

      {/* Summary */}
      <Card padded className="space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Info label="Driver" value={driver?.name} />
          <Info label="Vehicle" value={vehicle?.busNum} />
          <Info label="Date" value={formatDate(shiftDate)} />
          <Info label="Shift Duration" value={shiftDuration ? formatMinutes(shiftDuration) : '—'} />
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-black/5 pt-4">
          <Stat icon={Route} label="Trips" value={totals.totalTrips} />
          <Stat icon={Users} label="Total Pax" value={totals.totalPax} />
          <Stat icon={Clock} label="Pax →/←" value={`${totals.paxTo}/${totals.paxFrom}`} />
        </div>
      </Card>

      {/* Odometer */}
      <Card padded className="space-y-3">
        <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Gauge size={15} className="text-graytext" /> Odometer End (km)
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={odoEnd}
          onChange={(e) => {
            setOdoEnd(e.target.value)
            setError('')
          }}
          placeholder={`Greater than ${Number(odoStart).toLocaleString()}`}
          className="tabular h-12 w-full rounded-xl border border-gray-300 bg-white px-4 font-semibold text-ink outline-none focus:border-green"
        />
        <div className="flex items-center justify-between rounded-xl bg-green-light px-4 py-3">
          <span className="text-sm font-bold text-green-dark">Total Distance</span>
          <span className="tabular text-xl font-black text-green-dark">
            {totalKm != null ? `${totalKm.toLocaleString()} km` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-xs font-semibold text-graytext">
          <span>Start: {Number(odoStart).toLocaleString()} km</span>
          <span>End: {odoEnd ? odoEndNum.toLocaleString() : '—'} km</span>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
      </Card>

      {/* Inspection status */}
      {!inspectionComplete && (
        <Card padded className="flex items-center gap-3 border-amber/30 bg-amber/10 py-3">
          <AlertTriangle size={18} className="text-amber" />
          <span className="text-sm font-semibold text-amber">
            No inspection on file for this shift — the full report will omit it.
          </span>
        </Card>
      )}

      {/* PDF exports */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" icon={FileDown} onClick={downloadFull}>
          Full Shift Report
        </Button>
        <Button
          size="lg"
          variant="secondary"
          icon={ClipboardCheck}
          onClick={downloadInspection}
        >
          Inspection Report
        </Button>
      </div>

      <Button size="lg" variant="danger" fullWidth icon={LogOut} onClick={handleEndShift}>
        End Shift
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="End shift?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmEnd}>
              End Shift
            </Button>
          </>
        }
      >
        <p className="text-sm text-graytext">
          This will clear the current shift from the tablet. Make sure you've downloaded any reports
          you need — <span className="font-bold text-ink">{totals.totalTrips} trips</span> and{' '}
          <span className="font-bold text-ink">{totals.totalPax} passengers</span> will be submitted.
        </p>
      </Modal>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-graytext">{label}</div>
      <div className="font-extrabold text-ink">{value || '—'}</div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-offwhite px-3 py-2.5 text-center">
      <Icon size={15} className="mx-auto text-green" />
      <div className="tabular mt-1 text-lg font-black text-ink">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-graytext">{label}</div>
    </div>
  )
}
