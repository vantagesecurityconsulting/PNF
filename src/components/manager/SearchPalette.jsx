import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Bus, TriangleAlert, Building2, CornerDownLeft } from 'lucide-react'
import { useScope } from '../../hooks/useScope'
import { useManagerStore } from '../../store/useManagerStore'
import { useAuthStore } from '../../store/useAuthStore'

/** Cmd/Ctrl+K global search across staff, vehicles, incidents, and (owner) locations. */
export function SearchPalette({ open, onClose }) {
  const navigate = useNavigate()
  const { drivers, vehicles, incidents } = useScope()
  const locations = useManagerStore((s) => s.locations)
  const isOwner = useAuthStore((s) => s.currentUser?.role === 'owner')
  const inputRef = useRef(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (open) {
      setQ('')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    const out = []
    drivers.forEach((d) => {
      if (d.name.toLowerCase().includes(term) || (d.employeeId || '').toLowerCase().includes(term)) {
        out.push({ id: `d-${d.id}`, icon: Users, label: d.name, sub: `Staff · ${d.employeeId}`, to: `/manager/drivers/${d.id}` })
      }
    })
    vehicles.forEach((v) => {
      if ([v.busNum, v.make, v.model].join(' ').toLowerCase().includes(term)) {
        out.push({ id: `v-${v.id}`, icon: Bus, label: v.busNum, sub: `Vehicle · ${v.make} ${v.model}`, to: '/manager/fleet' })
      }
    })
    incidents.forEach((i) => {
      if ([i.type, i.description, i.severity].join(' ').toLowerCase().includes(term)) {
        out.push({ id: `i-${i.id}`, icon: TriangleAlert, label: i.type, sub: `Incident · ${i.severity} · ${i.status}`, to: '/manager/incidents' })
      }
    })
    if (isOwner) {
      locations.forEach((l) => {
        if ([l.name, l.city, l.code].join(' ').toLowerCase().includes(term)) {
          out.push({ id: `l-${l.id}`, icon: Building2, label: l.city, sub: `Location · ${l.code}`, to: '/manager/admin/locations' })
        }
      })
    }
    return out.slice(0, 12)
  }, [q, drivers, vehicles, incidents, locations, isOwner])

  if (!open) return null

  const go = (to) => {
    onClose()
    navigate(to)
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg animate-fade-in overflow-hidden rounded-2xl bg-surface shadow-card-hover">
        <form
          onSubmit={(e) => { e.preventDefault(); if (results[0]) go(results[0].to) }}
          className="flex items-center gap-3 border-b border-line px-4 py-3"
        >
          <Search size={18} className="text-graytext" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search staff, vehicles, incidents…"
            className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-graytext"
          />
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-graytext">ESC</kbd>
        </form>

        <div className="max-h-[50vh] overflow-y-auto">
          {q.trim() === '' ? (
            <p className="px-4 py-6 text-center text-sm text-graytext">Type to search across the dashboard.</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-graytext">No matches for “{q}”.</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onClick={() => go(r.to)}
                className="flex w-full items-center gap-3 border-b border-line px-4 py-2.5 text-left last:border-0 hover:bg-green-light/40"
              >
                <r.icon size={18} className="shrink-0 text-graytext" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white">{r.label}</div>
                  <div className="truncate text-xs text-graytext">{r.sub}</div>
                </div>
                {i === 0 && <CornerDownLeft size={14} className="text-graytext" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPalette
