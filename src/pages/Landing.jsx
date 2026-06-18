import { Link } from 'react-router-dom'
import { Tablet, LayoutDashboard, ArrowRight } from 'lucide-react'
import { Logo } from '../components/shared/Logo'

/** Concept landing — lets stakeholders jump into either interface. */
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 py-12">
      <div className="mb-10 flex flex-col items-center text-center">
        <Logo size={56} dark />
        <p className="mt-6 max-w-md text-sm text-gray-400">
          Shuttle trip logging & fleet operations for Park'N Fly Halifax. Choose an interface to
          explore the concept.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        <Link
          to="/driver"
          className="group rounded-2xl border border-white/10 bg-white/5 p-7 transition-all hover:bg-white/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green text-white">
            <Tablet size={24} />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-white">Driver App</h2>
          <p className="mt-1 text-sm text-gray-400">
            Tablet-optimized in-bus trip logging, pre-trip inspections, and end-of-shift reports.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-green">
            Open driver app <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          to="/manager"
          className="group rounded-2xl border border-white/10 bg-white/5 p-7 transition-all hover:bg-white/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green text-white">
            <LayoutDashboard size={24} />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-white">Manager Dashboard</h2>
          <p className="mt-1 text-sm text-gray-400">
            Live fleet status, trip history, driver roster, analytics, and PDF report generation.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-green">
            Open dashboard <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      <p className="mt-10 text-xs text-gray-600">
        ShuttleLog v1.0 Concept · Built for Park'N Fly Halifax · June 2026
      </p>
    </div>
  )
}
