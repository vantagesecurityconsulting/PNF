import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fuel, PenLine, Save, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react'
import { useShiftStore } from '../../store/useShiftStore'
import { useManagerStore } from '../../store/useManagerStore'
import { useToastStore } from '../../store/useToastStore'
import { inspectionGroups, fuelLevels } from '../../data/inspectionItems'
import { InspectionToggle } from '../../components/shared/InspectionToggle'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { PhotoUploader } from '../../components/shared/PhotoUploader'

export default function Inspection() {
  const navigate = useNavigate()
  const shiftStarted = useShiftStore((s) => s.shiftStarted)
  const driverId = useShiftStore((s) => s.driverId)
  const results = useShiftStore((s) => s.inspectionResults)
  const fuelLevel = useShiftStore((s) => s.fuelLevel)
  const notes = useShiftStore((s) => s.inspectionNotes)
  const signature = useShiftStore((s) => s.inspectionSignature)
  const inspectionComplete = useShiftStore((s) => s.inspectionComplete)
  const setItem = useShiftStore((s) => s.setInspectionItem)
  const setFuelLevel = useShiftStore((s) => s.setFuelLevel)
  const setNotes = useShiftStore((s) => s.setInspectionNotes)
  const setSignature = useShiftStore((s) => s.setInspectionSignature)
  const photos = useShiftStore((s) => s.inspectionPhotos)
  const setPhotos = useShiftStore((s) => s.setInspectionPhotos)
  const saveInspection = useShiftStore((s) => s.saveInspection)
  const addToast = useToastStore((s) => s.addToast)

  const [error, setError] = useState('')

  const drivers = useManagerStore((s) => s.drivers)
  const checklist = useManagerStore((s) => s.checklist)
  const driver = drivers.find((d) => d.id === driverId)

  // Only show items that are active in the manager's checklist config.
  const groups = useMemo(() => {
    const isActive = (key) => checklist.find((c) => c.key === key)?.active ?? true
    return inspectionGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => isActive(i.key)) }))
      .filter((g) => g.items.length > 0)
  }, [checklist])

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups])
  const checkedCount = allItems.filter((i) => results[i.key] != null).length
  const failedItems = allItems.filter((i) => results[i.key] === 'fail')

  if (!shiftStarted) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="text-center">
          <AlertTriangle className="mx-auto text-amber" size={28} />
          <p className="mt-2 font-semibold text-white">Start a shift to run an inspection.</p>
          <Button className="mt-4" onClick={() => navigate('/driver')}>
            Go to Shift Start
          </Button>
        </Card>
      </div>
    )
  }

  const handleSave = () => {
    if (checkedCount < allItems.length) {
      setError(`Please check all ${allItems.length} items (${checkedCount} done).`)
      return
    }
    if (!fuelLevel) {
      setError('Please select a fuel level.')
      return
    }
    if (!signature.trim()) {
      setError('Please type your name to sign.')
      return
    }
    setError('')
    saveInspection()
    addToast(
      failedItems.length > 0
        ? `Inspection saved with ${failedItems.length} failed item(s) — flagged for review.`
        : 'Inspection saved — vehicle cleared for service.',
      failedItems.length > 0 ? 'warning' : 'success',
    )
    navigate('/driver/log')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Pre-Trip Inspection</h1>
          <p className="text-sm text-graytext">
            {checkedCount} of {allItems.length} items checked
          </p>
        </div>
        {inspectionComplete && (
          <span className="flex items-center gap-1.5 rounded-full bg-green-light px-3 py-1.5 text-sm font-bold text-green-dark">
            <CheckCircle2 size={16} /> Completed
          </span>
        )}
      </div>

      {/* Progress */}
      <Card padded>
        <ProgressBar value={checkedCount} max={allItems.length} label="Inspection progress" />
        {failedItems.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            <AlertTriangle size={16} /> {failedItems.length} item(s) marked as FAIL
          </div>
        )}
      </Card>

      {/* Groups */}
      {groups.map((group) => {
        const groupChecked = group.items.filter((i) => results[i.key] != null).length
        return (
          <Card key={group.key} padded className="space-y-2.5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-white">
                <span className="text-lg">{group.icon}</span> {group.label}
              </h2>
              <span className="tabular text-xs font-bold text-graytext">
                {groupChecked}/{group.items.length}
              </span>
            </div>
            {group.items.map((item) => (
              <InspectionToggle
                key={item.key}
                itemKey={item.key}
                label={item.label}
                value={results[item.key]}
                onChange={setItem}
              />
            ))}
          </Card>
        )
      })}

      {/* Fuel + notes + signature */}
      <Card padded className="space-y-5">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-white">
            <Fuel size={15} className="text-graytext" /> Fuel Level
          </label>
          <div className="relative">
            <select
              value={fuelLevel}
              onChange={(e) => setFuelLevel(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-line bg-surface px-4 pr-10 font-semibold text-white outline-none focus:border-green"
            >
              <option value="">Select fuel level…</option>
              {fuelLevels.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute right-3 top-3.5 text-graytext" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-white">Overall Condition Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Note any defects, observations, or items needing follow-up…"
            className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-white outline-none focus:border-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-white">Defect / Condition Photos (optional)</label>
          <PhotoUploader value={photos} onChange={setPhotos} max={6} label="Add Photo" />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-white">
            <PenLine size={15} className="text-graytext" /> Driver Signature (type your name)
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={driver?.name || 'Type your full name'}
            className="h-12 w-full rounded-xl border border-line bg-surface px-4 font-semibold italic text-white outline-none focus:border-green"
            style={{ fontFamily: 'Georgia, serif' }}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <Button size="lg" fullWidth icon={Save} onClick={handleSave}>
          Save Inspection
        </Button>
      </Card>
    </div>
  )
}
