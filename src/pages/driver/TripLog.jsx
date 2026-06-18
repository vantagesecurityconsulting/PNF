import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, PlaneLanding, PlaneTakeoff, MapPin, AlertTriangle, ArrowRight, Clock } from 'lucide-react'
import { useShiftStore, selectTripTotals } from '../../store/useShiftStore'
import { useToastStore } from '../../store/useToastStore'
import { TripStatusStrip } from '../../components/shared/TripStatusStrip'
import { BigButton } from '../../components/shared/BigButton'
import { PassengerCounter } from '../../components/shared/PassengerCounter'
import { Card } from '../../components/shared/Card'
import { formatTime, formatMinutes, elapsedSince, minutesBetween } from '../../utils/formatters'

export default function TripLog() {
  const navigate = useNavigate()
  const shiftStarted = useShiftStore((s) => s.shiftStarted)
  const inspectionComplete = useShiftStore((s) => s.inspectionComplete)
  const step = useShiftStore((s) => s.currentStep)
  const tripNum = useShiftStore((s) => s.currentTripNum)
  const currentTrip = useShiftStore((s) => s.currentTrip)
  const trips = useShiftStore((s) => s.trips)
  const logStep = useShiftStore((s) => s.logStep)
  const setPaxToAirport = useShiftStore((s) => s.setPaxToAirport)
  const setPaxFromAirport = useShiftStore((s) => s.setPaxFromAirport)
  const addToast = useToastStore((s) => s.addToast)

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
          disabled={step < 1}
          onClick={() => handleStep(1)}
        />

        {/* Passengers to airport — shown before/at airport arrival */}
        {step <= 2 && (
          <Card className="bg-white">
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
          disabled={step < 2}
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
          disabled={step < 3}
          onClick={() => handleStep(3)}
        />

        {/* Passengers from airport — shown at step 3 */}
        {step === 3 && (
          <Card className="bg-white">
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
          disabled={step < 4}
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
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-card">
      <div className="text-xs font-bold uppercase tracking-wide text-graytext">{label}</div>
      <div className="tabular text-2xl font-black text-ink">{value}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-graytext">{label}</span>
      <span className="tabular font-bold text-ink">{value}</span>
    </div>
  )
}
