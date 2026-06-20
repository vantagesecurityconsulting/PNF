import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, PlaneLanding, PlaneTakeoff, MapPin, AlertTriangle, ArrowRight, Clock, Undo2, XCircle, Pencil, Coffee, Play } from 'lucide-react'
import { useShiftStore, selectTripTotals, selectOnBreak } from '../../store/useShiftStore'
import { useToastStore } from '../../store/useToastStore'
import { TripStatusStrip } from '../../components/shared/TripStatusStrip'
import { BigButton } from '../../components/shared/BigButton'
import { PassengerCounter } from '../../components/shared/PassengerCounter'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { Modal } from '../../components/shared/Modal'
import { formatTime, formatMinutes, elapsedSince, minutesBetween, toTimeInput, fromTimeInput } from '../../utils/formatters'

export default function TripLog() {
  const navigate = useNavigate()
  const shiftStarted = useShiftStore((s) => s.shiftStarted)
  const inspectionComplete = useShiftStore((s) => s.inspectionComplete)
  const step = useShiftStore((s) => s.currentStep)
  const tripNum = useShiftStore((s) => s.currentTripNum)
  const currentTrip = useShiftStore((s) => s.currentTrip)
  const trips = useShiftStore((s) => s.trips)
  const shiftDate = useShiftStore((s) => s.shiftDate)
  const logStep = useShiftStore((s) => s.logStep)
  const setPaxToAirport = useShiftStore((s) => s.setPaxToAirport)
  const setPaxFromAirport = useShiftStore((s) => s.setPaxFromAirport)
  const undoLastStep = useShiftStore((s) => s.undoLastStep)
  const cancelCurrentTrip = useShiftStore((s) => s.cancelCurrentTrip)
  const setCurrentTripTime = useShiftStore((s) => s.setCurrentTripTime)
  const breaks = useShiftStore((s) => s.breaks)
  const startBreak = useShiftStore((s) => s.startBreak)
  const endBreak = useShiftStore((s) => s.endBreak)
  const addToast = useToastStore((s) => s.addToast)

  const onBreak = selectOnBreak(breaks)

  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  // live clock for elapsed times
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!shiftStarted) navigate('/driver', { replace: true })
  }, [shiftStarted, navigate])

  if (!shiftStarted) return null

  const totals = selectTripTotals(trips)
  const lastTrip = trips[trips.length - 1]

  const tripInProgress = step > 1
  const canUndo = step > 1 || (!currentTrip.departLotTime && trips.length > 0)

  const handleUndo = () => {
    undoLastStep()
    addToast('Last step undone', 'warning')
  }
  const handleCancel = () => {
    cancelCurrentTrip()
    setCancelOpen(false)
    addToast('Current trip cleared', 'warning')
  }
  const editTime = (field, value) => {
    setCurrentTripTime(field, value ? fromTimeInput(value, shiftDate) : null)
  }

  const handleStep = (n) => {
    logStep(n)
    const labels = {
      1: 'Departed parking lot',
      2: 'Arrived at airport',
      3: 'Departed airport',
      4: 'Trip complete — saved',
    }
    addToast(labels[n], n === 4 ? 'success' : 'success')
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {!inspectionComplete && (
        <Card padded className="flex items-center gap-3 border-amber/30 bg-amber/10 py-3">
          <AlertTriangle size={20} className="shrink-0 text-amber" />
          <span className="flex-1 text-sm font-semibold text-amber">
            Pre-trip inspection not yet completed.
          </span>
          <button
            onClick={() => navigate('/driver/inspection')}
            className="flex items-center gap-1 text-sm font-bold text-amber"
          >
            Do it now <ArrowRight size={15} />
          </button>
        </Card>
      )}

      <TripStatusStrip step={step} tripNum={tripNum} />

      {/* Mis-tap recovery controls */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" icon={Undo2} onClick={handleUndo} disabled={!canUndo}>
          Undo last step
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={Pencil}
          onClick={() => setEditOpen(true)}
          disabled={!currentTrip.departLotTime}
        >
          Edit times
        </Button>
        {tripInProgress && (
          <Button size="sm" variant="ghost" icon={XCircle} onClick={() => setCancelOpen(true)} className="text-danger">
            Cancel trip
          </Button>
        )}
        {onBreak ? (
          <Button size="sm" icon={Play} onClick={() => { endBreak(); addToast('Break ended — welcome back', 'success') }}>
            End break
          </Button>
        ) : (
          step === 1 && (
            <Button size="sm" variant="secondary" icon={Coffee} onClick={() => { startBreak(); addToast('Break started', 'warning') }}>
              Start break
            </Button>
          )
        )}
      </div>

      {onBreak && (
        <Card padded className="flex items-center gap-3 border-amber/30 bg-amber/10 py-3">
          <Coffee size={20} className="shrink-0 text-amber" />
          <span className="flex-1 text-sm font-semibold text-amber">
            On break — trip logging is paused. Tap “End break” to resume.
          </span>
        </Card>
      )}

      {/* Running totals */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Trips Completed" value={totals.totalTrips} />
        <MiniStat label="Total Passengers" value={totals.totalPax} />
      </div>

      {/* Step buttons */}
      <div className="space-y-3">
        <BigButton
          label="1 · Depart Parking Lot"
          subLabel={currentTrip.departLotTime ? null : 'Tap when leaving the lot'}
          icon={Bus}
          color="green"
          done={!!currentTrip.departLotTime}
          timestamp={currentTrip.departLotTime ? formatTime(currentTrip.departLotTime) : null}
          disabled={step < 1 || onBreak}
          onClick={() => handleStep(1)}
        />

        {/* Passengers to airport — shown before/at airport arrival */}
        {step <= 2 && (
          <Card className="bg-surface">
            <PassengerCounter
              label="Passengers to Airport"
              value={currentTrip.paxToAirport}
              onChange={setPaxToAirport}
              disabled={step < 1}
            />
          </Card>
        )}

        <BigButton
          label="2 · Arrive at Airport"
          subLabel={
            step === 2 && currentTrip.departLotTime
              ? `En route · ${elapsedSince(currentTrip.departLotTime)}`
              : currentTrip.arriveAirportTime
                ? null
                : 'Unlocks after Step 1'
          }
          icon={PlaneLanding}
          color="amber"
          done={!!currentTrip.arriveAirportTime}
          timestamp={currentTrip.arriveAirportTime ? formatTime(currentTrip.arriveAirportTime) : null}
          disabled={step < 2 || onBreak}
          onClick={() => handleStep(2)}
        />

        <BigButton
          label="3 · Depart Airport"
          subLabel={
            step === 3 && currentTrip.arriveAirportTime
              ? `At airport · ${elapsedSince(currentTrip.arriveAirportTime)}`
              : currentTrip.departAirportTime
                ? null
                : 'Unlocks after Step 2'
          }
          icon={PlaneTakeoff}
          color="info"
          done={!!currentTrip.departAirportTime}
          timestamp={currentTrip.departAirportTime ? formatTime(currentTrip.departAirportTime) : null}
          disabled={step < 3 || onBreak}
          onClick={() => handleStep(3)}
        />

        {/* Passengers from airport — shown at step 3 */}
        {step === 3 && (
          <Card className="bg-surface">
            <PassengerCounter
              label="Passengers from Airport"
              value={currentTrip.paxFromAirport}
              onChange={setPaxFromAirport}
            />
          </Card>
        )}

        <BigButton
          label="4 · Arrive at Parking Lot"
          subLabel={
            step === 4 && currentTrip.departAirportTime
              ? `Returning · ${elapsedSince(currentTrip.departAirportTime)}`
              : 'Unlocks after Step 3'
          }
          icon={MapPin}
          color="green"
          disabled={step < 4 || onBreak}
          onClick={() => handleStep(4)}
        />
      </div>

      {/* Last completed trip summary */}
      {lastTrip && step === 1 && (
        <Card className="border-green/30 bg-green-light/60">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-green-dark">
              Trip {lastTrip.tripNumber} saved ✓
            </h3>
            <span className="flex items-center gap-1 tabular text-sm font-bold text-green-dark">
              <Clock size={14} /> {formatMinutes(lastTrip.durationMin)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <SummaryRow label="Left lot" value={formatTime(lastTrip.departLotTime)} />
            <SummaryRow label="At airport" value={formatTime(lastTrip.arriveAirportTime)} />
            <SummaryRow label="Left airport" value={formatTime(lastTrip.departAirportTime)} />
            <SummaryRow label="At lot" value={formatTime(lastTrip.arriveLotTime)} />
            <SummaryRow label="Pax → airport" value={lastTrip.paxToAirport} />
            <SummaryRow label="Pax ← airport" value={lastTrip.paxFromAirport} />
          </div>
        </Card>
      )}

      {/* Edit current-trip times */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Trip ${tripNum} Times`}
        footer={<Button onClick={() => setEditOpen(false)}>Done</Button>}
      >
        <p className="mb-3 text-sm text-graytext">Correct any mistapped time for the current trip.</p>
        <div className="space-y-3">
          <TimeEditRow label="Departed lot" field="departLotTime" value={currentTrip.departLotTime} onChange={editTime} />
          <TimeEditRow label="Arrived airport" field="arriveAirportTime" value={currentTrip.arriveAirportTime} onChange={editTime} />
          <TimeEditRow label="Departed airport" field="departAirportTime" value={currentTrip.departAirportTime} onChange={editTime} />
          <TimeEditRow label="Arrived lot" field="arriveLotTime" value={currentTrip.arriveLotTime} onChange={editTime} />
        </div>
      </Modal>

      {/* Cancel trip confirm */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel current trip?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>Keep Trip</Button>
            <Button variant="danger" onClick={handleCancel}>Discard Trip</Button>
          </>
        }
      >
        <p className="text-sm text-graytext">
          This clears the in-progress trip's logged times and starts the trip over. Completed trips are not affected.
        </p>
      </Modal>
    </div>
  )
}

function TimeEditRow({ label, field, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-white">{label}</span>
      <input
        type="time"
        value={toTimeInput(value)}
        disabled={!value}
        onChange={(e) => onChange(field, e.target.value)}
        className="tabular h-10 rounded-lg border border-line bg-surface px-3 font-semibold text-white outline-none focus:border-green disabled:bg-white/5 disabled:text-muted"
      />
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-surface px-4 py-3 shadow-card">
      <div className="text-xs font-bold uppercase tracking-wide text-graytext">{label}</div>
      <div className="tabular text-2xl font-black text-white">{value}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-graytext">{label}</span>
      <span className="tabular font-bold text-white">{value}</span>
    </div>
  )
}
