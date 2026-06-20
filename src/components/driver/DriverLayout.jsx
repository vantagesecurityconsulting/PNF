import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Bus, ClipboardList, Search, FileText, MonitorCog, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ParkNFlyMark } from '../shared/Logo'
import { DriverAvatar } from '../shared/DriverAvatar'
import { useShiftStore } from '../../store/useShiftStore'
import { useManagerStore } from '../../store/useManagerStore'
import { formatDate } from '../../utils/formatters'

const TABS = [
  { to: '/driver/log', label: 'Trip Log', icon: Bus },
  { to: '/driver/trips', label: 'My Trips', icon: ClipboardList },
  { to: '/driver/inspection', label: 'Inspection', icon: Search },
  { to: '/driver/incident', label: 'Incident', icon: TriangleAlert },
  { to: '/driver/end-shift', label: 'End Shift', icon: FileText },
]

export default function DriverLayout() {
  const location = useLocation()
  const shiftStarted = useShiftStore((s) => s.shiftStarted)
  const driverId = useShiftStore((s) => s.driverId)
  const vehicleId = useShiftStore((s) => s.vehicleId)
  const shiftDate = useShiftStore((s) => s.shiftDate)

  const drivers = useManagerStore((s) => s.drivers)
  const vehicles = useManagerStore((s) => s.vehicles)
  const driver = drivers.find((d) => d.id === driverId)
  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const onStartScreen = location.pathname === '/driver'

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col bg-offwhite">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          <ParkNFlyMark size={32} />
          <div className="leading-none">
            <div className="text-sm font-semibold tracking-tight text-white">
              DRIVE<span className="text-brand">X</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
              Park N Fly · Driver
            </div>
          </div>
        </div>

        {shiftStarted && driver ? (
          <div className="flex items-center gap-2.5">
            <div className="text-right leading-tight">
              <div className="text-sm font-extrabold text-white">{driver.name}</div>
              <div className="text-[11px] font-semibold text-graytext">
                {vehicle?.busNum} · {formatDate(shiftDate)}
              </div>
            </div>
            <DriverAvatar driver={driver} size="sm" />
          </div>
        ) : (
          <Link
            to="/manager"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-graytext hover:bg-white/5"
          >
            <MonitorCog size={15} /> Manager View
          </Link>
        )}
      </header>

      {/* Page content */}
      <main className={`flex-1 px-4 py-5 ${shiftStarted ? 'pb-28' : ''}`}>
        <Outlet />
      </main>

      {/* Bottom tab bar (only during an active shift) */}
      {shiftStarted && !onStartScreen && (
        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-3xl border-t border-line bg-surface px-2 py-1.5 shadow-[0_-2px_12px_rgba(17,17,17,0.06)]">
          <div className="flex items-stretch justify-around">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-bold transition-colors ${
                    isActive ? 'bg-brand/15 text-brand' : 'text-graytext hover:bg-white/5'
                  }`
                }
              >
                <tab.icon size={22} strokeWidth={2.2} />
                {tab.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
