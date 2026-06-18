import { useState } from 'react'
import { Settings as SettingsIcon, MapPin, ListChecks, Bell, Database, Save, Check } from 'lucide-react'
import { useManagerStore } from '../../store/useManagerStore'
import { useToastStore } from '../../store/useToastStore'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { ParkNFlyMark } from '../../components/shared/Logo'
import { inspectionGroups } from '../../data/inspectionItems'

const NOTIFICATION_LABELS = {
  failedInspectionAlerts: 'Failed inspection alerts',
  dailySummaryEmail: 'Daily summary email',
  shiftReminderTexts: 'Shift reminder texts to drivers',
  maintenanceDueAlerts: 'Maintenance-due alerts',
}

export default function Settings() {
  const store = useManagerStore()
  const { settings, checklist } = store
  const updateSettings = useManagerStore((s) => s.updateSettings)
  const toggleNotification = useManagerStore((s) => s.toggleNotification)
  const toggleChecklistItem = useManagerStore((s) => s.toggleChecklistItem)
  const addToast = useToastStore((s) => s.addToast)

  const [locName, setLocName] = useState(settings.locationName)
  const [locCode, setLocCode] = useState(settings.locationCode)

  const saveLocation = () => {
    updateSettings({ locationName: locName, locationCode: locCode })
    addToast('Location settings saved', 'success')
  }

  const activeCount = checklist.filter((c) => c.active).length

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Location, checklist & integration configuration" icon={SettingsIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Location */}
        <Card padded>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <MapPin size={18} className="text-green" /> Location
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-graytext">
                Location Name
              </label>
              <input
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-green"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-graytext">
                Location Code
              </label>
              <input
                value={locCode}
                onChange={(e) => setLocCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="h-10 w-32 rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold uppercase tracking-wider text-ink outline-none focus:border-green"
              />
            </div>
            <Button size="sm" icon={Save} onClick={saveLocation}>
              Save Location
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card padded>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Bell size={18} className="text-green" /> Notification Preferences
          </h2>
          <div className="mt-4 space-y-1">
            {Object.entries(NOTIFICATION_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-ink">{label}</span>
                <Toggle checked={settings.notifications[key]} onChange={() => toggleNotification(key)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Inspection checklist manager */}
      <Card padded>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <ListChecks size={18} className="text-green" /> Inspection Checklist
          </h2>
          <span className="tabular text-sm font-bold text-graytext">
            {activeCount} of {checklist.length} items active
          </span>
        </div>
        <p className="mt-1 text-sm text-graytext">
          Toggle items on or off. Inactive items are hidden from the driver pre-trip inspection.
        </p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {inspectionGroups.map((group) => (
            <div key={group.key}>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-ink">
                <span>{group.icon}</span> {group.label}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const cfg = checklist.find((c) => c.key === item.key)
                  const active = cfg?.active ?? true
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg border border-black/5 bg-white px-3 py-2"
                    >
                      <span className={`text-sm font-semibold ${active ? 'text-ink' : 'text-gray-400 line-through'}`}>
                        {item.label}
                      </span>
                      <Toggle checked={active} onChange={() => toggleChecklistItem(item.key)} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Airtable integration placeholder */}
      <Card padded className="border-dashed border-2 border-gray-200 bg-gray-50/60">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-card">
              <Database size={24} className="text-graytext" />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
                Airtable Integration
                <span className="rounded-full bg-amber/15 px-2 py-0.5 text-xs font-bold text-amber">
                  Coming Soon
                </span>
              </h2>
              <p className="mt-0.5 max-w-md text-sm text-graytext">
                Connect ShuttleLog to the <span className="font-semibold">ParkNFly_Halifax</span> Airtable base
                to sync drivers, vehicles, shifts, trips, and inspections in real time.
              </p>
            </div>
          </div>
          <Button variant="secondary" disabled>
            Connect Airtable
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2 pb-2 text-xs text-graytext">
        <ParkNFlyMark size={18} />
        ShuttleLog v1.0 Concept · Built for Park'N Fly Halifax · June 2026
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-green' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
