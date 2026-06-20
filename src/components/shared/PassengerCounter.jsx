import { Minus, Plus, Users } from 'lucide-react'

/** Large +/- passenger counter for the driver app (0–20). */
export function PassengerCounter({ value = 0, onChange, min = 0, max = 20, label, disabled = false }) {
  const dec = () => !disabled && onChange?.(Math.max(min, value - 1))
  const inc = () => !disabled && onChange?.(Math.min(max, value + 1))

  return (
    <div className={disabled ? 'opacity-50' : ''}>
      {label && (
        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-graytext">
          <Users size={15} /> {label}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={dec}
          disabled={disabled || value <= min}
          aria-label="Decrease passengers"
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-line bg-surface text-white transition-all hover:border-green hover:bg-green-light active:scale-95 disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-surface"
        >
          <Minus size={28} strokeWidth={3} />
        </button>
        <div className="flex h-16 min-w-[88px] flex-1 items-center justify-center rounded-2xl bg-green-light">
          <span className="tabular text-4xl font-black text-green-dark">{value}</span>
        </div>
        <button
          onClick={inc}
          disabled={disabled || value >= max}
          aria-label="Increase passengers"
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-line bg-surface text-white transition-all hover:border-green hover:bg-green-light active:scale-95 disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-surface"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

export default PassengerCounter
