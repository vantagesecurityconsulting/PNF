import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
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
  TriangleAlert,
  Building2,
  UserCog,
  LogOut,
  ChevronDown,
  Bell,
  Search,
} from 'lucide-react'
import { Logo, ParkNFlyMark } from '../shared/Logo'
import { useManagerStore } from '../../store/useManagerStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useScope } from '../../hooks/useScope'
import { buildAlerts } from '../../utils/analytics'
import { SearchPalette } from './SearchPalette'

const NAV = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/trips', label: 'All Trips', icon: Table2 },
  { to: '/manager/fleet', label: 'Fleet', icon: Bus },
  { to: '/manager/drivers', label: 'Staff', icon: Users },
  { to: '/manager/incidents', label: 'Incidents', icon: TriangleAlert },
  { to: '/manager/alerts', label: 'Alerts', icon: Bell, badge: 'alerts' },
  { to: '/manager/reports', label: 'Reports', icon: FileText },
  { to: '/manager/settings', label: 'Settings', icon: SettingsIcon },
]

const OWNER_NAV = [
  { to: '/manager/admin/locations', label: 'Locations', icon: Building2 },
  { to: '/manager/admin/managers', label: 'Managers', icon: UserCog },
]

export default function ManagerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const locations = useManagerStore((s) => s.locations)
  const currentUser = useAuthStore((s) => s.currentUser)
  const activeLocationId = useAuthStore((s) => s.activeLocationId)
  const setActiveLocation = useAuthStore((s) => s.setActiveLocation)
  const logout = useAuthStore((s) => s.logout)

  const isOwner = currentUser?.role === 'owner'
  const activeLocation = locations.find((l) => l.id === activeLocationId)

  const scope = useScope()
  const alertCount = buildAlerts(scope, scope.referenceToday).length

  const handleLogout = () => {
    logout()
    navigate('/manager/login')
  }

  const sidebarWidth = collapsed ? 'lg:w-[76px]' : 'lg:w-64'

  const SidebarInner = ({ showLabels }) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-5">
        {showLabels ? <Logo size={34} /> : <div className="mx-auto"><ParkNFlyMark size={34} /></div>}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <button
          onClick={() => { setSearchOpen(true); setMobileOpen(false) }}
          className={`mb-1 flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-graytext transition-colors hover:bg-gray-50 ${showLabels ? '' : 'justify-center'}`}
          title="Search (⌘K)"
        >
          <Search size={20} strokeWidth={2.2} />
          {showLabels && <span className="flex-1 text-left">Search</span>}
          {showLabels && <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold">⌘K</kbd>}
        </button>
        {NAV.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            showLabels={showLabels}
            badge={item.badge === 'alerts' ? alertCount : 0}
            onNavigate={() => setMobileOpen(false)}
          />
        ))}

        {isOwner && (
          <>
            <div className={`px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 ${showLabels ? '' : 'text-center'}`}>
              {showLabels ? 'Owner Admin' : '•••'}
            </div>
            {OWNER_NAV.map((item) => (
              <NavItem key={item.to} item={item} showLabels={showLabels} onNavigate={() => setMobileOpen(false)} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="space-y-2 border-t border-black/5 px-3 py-4">
        {/* Location switcher / label */}
        {isOwner && showLabels ? (
          <div className="relative">
            <select
              value={activeLocationId || ''}
              onChange={(e) => setActiveLocation(e.target.value)}
              className="h-9 w-full appearance-none rounded-xl bg-green-light px-3 pr-8 text-xs font-bold text-green-dark outline-none"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.city} · {l.code}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-green-dark" />
          </div>
        ) : (
          <div className={`flex items-center gap-2 rounded-xl bg-green-light px-3 py-2 text-xs font-bold text-green-dark ${showLabels ? '' : 'justify-center'}`}>
            <MapPin size={15} />
            {showLabels && (activeLocation ? `${activeLocation.city} · ${activeLocation.code}` : '—')}
          </div>
        )}

        {/* Current user */}
        {showLabels && currentUser && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-black text-white">
              {currentUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-xs font-bold text-ink">{currentUser.name}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-graytext">{currentUser.role}</div>
            </div>
          </div>
        )}

        <Link
          to="/driver"
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-graytext hover:bg-gray-100 ${showLabels ? '' : 'justify-center'}`}
          title="Switch to Driver View"
        >
          <Tablet size={15} />
          {showLabels && 'Switch to Driver View'}
        </Link>

        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10 ${showLabels ? '' : 'justify-center'}`}
          title="Sign out"
        >
          <LogOut size={15} />
          {showLabels && 'Sign Out'}
        </button>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-graytext hover:bg-gray-100 lg:flex ${showLabels ? '' : 'justify-center'}`}
        >
          {showLabels ? <><PanelLeftClose size={15} /> Collapse</> : <PanelLeft size={18} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-offwhite">
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 border-r border-black/5 bg-white transition-all lg:block ${sidebarWidth}`}>
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

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

function NavItem({ item, showLabels, onNavigate, badge = 0 }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
          isActive ? 'bg-green-light text-green-dark' : 'text-graytext hover:bg-gray-100 hover:text-ink'
        } ${showLabels ? '' : 'justify-center'}`
      }
      title={item.label}
    >
      <span className="relative">
        <item.icon size={20} strokeWidth={2.2} />
        {badge > 0 && !showLabels && (
          <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white" />
        )}
      </span>
      {showLabels && <span className="flex-1">{item.label}</span>}
      {showLabels && badge > 0 && (
        <span className="tabular flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
