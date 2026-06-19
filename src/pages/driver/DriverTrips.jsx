import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Route, Users, Clock, Bus, Pencil } from 'lucide-react'
import { useShiftStore, selectTripTotals } from '../../store/useShiftStore'
import { Card } from '../../components/shared/Card'
import { EmptyState } from '../../components/shared/EmptyState'
import { Button } from '../../components/shared/Button'
import { Modal } from '../../components/shared/Modal'
import { PassengerCounter } from '../../components/shared/PassengerCounter'
import { formatTime, formatMinutes, toTimeInput, fromTimeInput } from '../../utils/formatters'

export default function DriverTrips() {
  const navigate = useNavigate()
  const shiftStarted = useShiftStore((s) => s.shiftStarted)
  const trips = useShiftStore((s) => s.trips)
  const shiftDate = useShiftStore((s) => s.shiftDate)
  const updateCompletedTrip = useShiftStore((s) => s.updateCompletedTrip)
  const [expanded, setExpanded] = useState(null)
  const [editTrip, setEditTrip] = useState(null) // draft being edited

  if (!shiftStarted) {
    navigate('/driver', { replace: true })
    return null
  }

  const totals = selectTripTotals(trips)

  const openEdit = (trip) => setEditTrip({ ...trip })
  const saveEdit = () => {
    const { tripNumber, departLotTime, arriveAirportTime, departAirportTime, arriveLotTime, paxToAirport, paxFromAirport } = editTrip
    updateCompletedTrip(tripNumber, { departLotTime, arriveAirportTime, departAirportTime, arriveLotTime, paxToAirport, paxFromAirport })
    setEditTrip(null)
  }
  const setEditField = (field, val) => setEditTrip((t) => ({ ...t, [field]: val }))
  const setEditTime = (field, val) => setEditField(field, val ? fromTimeInput(val, shiftDate) : null)

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black tracking-tight text-ink">Today's Trips</h1>

      {/* Running totals */}
      <div className="grid grid-cols-3 gap-3">
        <TotalCard icon={Route} label="Trips" value={totals.totalTrips} />
        <TotalCard icon={Users} label="Pax →" value={totals.paxTo} />
        <TotalCard icon={Users} label="Pax ←" value={totals.paxFrom} />
      </div>

      {trips.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bus}
            title="No trips logged yet"
            message="Completed trips will appear here. Head to the Trip Log to start your first run."
            action={<Button onClick={() => navigate('/driver/log')}>Go to Trip Log</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {[...trips].reverse().map((trip) => {
            const open = expanded === trip.tripNumber
            return (
              <Card key={trip.id} padded={false} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(open ? null : trip.tripNumber)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-light font-black text-green-dark">
                      {trip.tripNumber}
                    </div>
                    <div>
                      <div className="font-extrabold text-ink">Trip {trip.tripNumber}</div>
                      <div className="text-xs font-semibold text-graytext">
                        {formatTime(trip.departLotTime)} – {formatTime(trip.arriveLotTime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 tabular text-sm font-bold text-ink">
                        <Clock size={13} /> {formatMinutes(trip.durationMin)}
                      </div>
                      <div className="text-xs font-semibold text-graytext">
                        {(trip.paxToAirport || 0) + (trip.paxFromAirport || 0)} pax
                      </div>
                    </div>
                    {open ? <ChevronUp size={18} className="text-graytext" /> : <ChevronDown size={18} className="text-graytext" />}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-black/5 bg-offwhite/50 px-5 py-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      <Detail label="Left lot" value={formatTime(trip.departLotTime)} />
                      <Detail label="Arrived airport" value={formatTime(trip.arriveAirportTime)} />
                      <Detail label="Left airport" value={formatTime(trip.departAirportTime)} />
                      <Detail label="Arrived lot" value={formatTime(trip.arriveLotTime)} />
                      <Detail label="Passengers → airport" value={trip.paxToAirport} />
                      <Detail label="Passengers ← airport" value={trip.paxFromAirport} />
                    </div>
                    <Button className="mt-3" size="sm" variant="secondary" icon={Pencil} onClick={() => openEdit(trip)}>
                      Edit trip
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
      {/* Edit completed trip */}
      <Modal
        open={!!editTrip}
        onClose={() => setEditTrip(null)}
        title={editTrip ? `Edit Trip ${editTrip.tripNumber}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTrip(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </>
        }
      >
        {editTrip && (
          <div className="space-y-3">
            <EditTimeRow label="Left lot" field="departLotTime" value={editTrip.departLotTime} onChange={setEditTime} />
            <EditTimeRow label="Arrived airport" field="arriveAirportTime" value={editTrip.arriveAirportTime} onChange={setEditTime} />
            <EditTimeRow label="Left airport" field="departAirportTime" value={editTrip.departAirportTime} onChange={setEditTime} />
            <EditTimeRow label="Arrived lot" field="arriveLotTime" value={editTrip.arriveLotTime} onChange={setEditTime} />
            <div className="grid grid-cols-2 gap-3 border-t border-black/5 pt-3">
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-graytext">Pax → airport</div>
                <PassengerCounter value={editTrip.paxToAirport} onChange={(v) => setEditField('paxToAirport', v)} />
              </div>
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-graytext">Pax ← airport</div>
                <PassengerCounter value={editTrip.paxFromAirport} onChange={(v) => setEditField('paxFromAirport', v)} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function EditTimeRow({ label, field, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        type="time"
        value={toTimeInput(value)}
        onChange={(e) => onChange(field, e.target.value)}
        className="tabular h-10 rounded-lg border border-gray-300 bg-white px-3 font-semibold text-ink outline-none focus:border-green"
      />
    </div>
  )
}

function TotalCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-card">
      <Icon size={16} className="mx-auto text-green" />
      <div className="tabular mt-1 text-2xl font-black text-ink">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-graytext">{label}</div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-graytext">{label}</span>
      <span className="tabular font-bold text-ink">{value}</span>
    </div>
  )
}
