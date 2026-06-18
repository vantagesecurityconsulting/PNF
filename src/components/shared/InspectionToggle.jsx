import { Check, X } from 'lucide-react'

/** Pass / Fail toggle for a single inspection item. value: 'pass'|'fail'|null */
export function InspectionToggle({ itemKey, label, value, onChange, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3">
      <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(itemKey, 'pass')}
          aria-pressed={value === 'pass'}
          aria-label={`${label} pass`}
          className={`flex h-10 w-12 items-center justify-center rounded-lg border-2 font-bold transition-all active:scale-95
            ${
              value === 'pass'
                ? 'border-green bg-green text-white'
                : 'border-gray-200 bg-white text-gray-400 hover:border-green hover:text-green'
            }`}
        >
          <Check size={20} strokeWidth={3} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(itemKey, 'fail')}
          aria-pressed={value === 'fail'}
          aria-label={`${label} fail`}
          className={`flex h-10 w-12 items-center justify-center rounded-lg border-2 font-bold transition-all active:scale-95
            ${
              value === 'fail'
                ? 'border-danger bg-danger text-white'
                : 'border-gray-200 bg-white text-gray-400 hover:border-danger hover:text-danger'
            }`}
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

export default InspectionToggle
