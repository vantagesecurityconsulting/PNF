import { Loader2 } from 'lucide-react'

/** Inline / block loading spinner. */
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-green ${className}`} />
}

/** Full-area loading state with optional label (simulates API fetch delay). */
export function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-graytext ${className}`}>
      <Spinner size={28} />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}

export default Spinner
