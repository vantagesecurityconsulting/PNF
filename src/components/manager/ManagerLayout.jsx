import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Table2,
  Bus,
  Users,
  FileText,
  Settings as SettingsIcon,
  MapPin,
  Tablet,
  PanelLeftClose,
  PanelLeft,
  Menu,
} from 'lucide-react'
import { Logo, ParkNFlyMark } from '../shared/Logo'
import { useManagerStore } from '../../store/useManagerStore'

const NAV = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/trips', label: 'All Trips', icon: Table2 },
  { to: '/manager/fleet', label: 'Fleet', icon: Bus },
  { to: '/manager/drivers', label: 'Drivers', icon: Users },
  { to: '/manager/reports', label: 'Reports', icon: FileText },
  { to: '/manager/settings', label: 'Settings', icon: SettingsIcon },
]

export default function ManagerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const settings = useManagerStore((s) => s.settings)

  const sidebarWidth = collapsed ? 'lg:w-[76px]' : 'lg:w-64'

  const SidebarInner = ({ showLabels }) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-5">
        {showLabels ? (
          <Logo size={34} />
        ) : (
          <div className="mx-auto">
            <ParkNFlyMark size={34} />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                isActive ? 'bg-green-light text-green-dark' : 'text-graytext hover:bg-gray-100 hover:text-ink'
              } ${showLabels ? '' : 'justify-center'}`
            }
            title={item.label}
          >
            <item.icon size={20} strokeWidth={2.2} />
            {showLabels && item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: location pill + driver view link */}
      <div className="space-y-2 border-t border-black/5 px-3 py-4">
        <div
          className={`flex items-center gap-2 rounded-xl bg-green-light px-3 py-2 text-xs font-bold text-green-dark ${
            showLabels ? '' : 'justify-center'
          }`}
        >
          <MapPin size={15} />
          {showLabels && `${settings.locationName.split(',')[0]} · ${settings.locationCode}`}
        </div>
        <Link
          to="/driver"
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-graytext hover:bg-gray-100 ${
            showLabels ? '' : 'justify-center'
          }`}
          title="Switch to Driver View"
        >
          <Tablet size={15} />
          {showLabels && 'Switch to Driver View'}
        </Link>
        {showLabels && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-graytext hover:bg-gray-100 lg:flex"
          >
            <PanelLeftClose size={15} /> Collapse
          </button>
        )}
        {!showLabels && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden w-full items-center justify-center rounded-xl px-3 py-2 text-graytext hover:bg-gray-100 lg:flex"
            title="Expand sidebar"
          >
            <PanelLeft size={18} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-offwhite">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-black/5 bg-white transition-all lg:block ${sidebarWidth}`}
      >
        <div className="sticky top-0 h-screen">
          <SidebarInner showLabels={!collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 animate-slide-in bg-white shadow-slideover">
            <SidebarInner showLabels />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Logo size={30} />
          <div className="w-9" />
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
