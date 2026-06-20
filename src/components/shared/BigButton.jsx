import { Lock, Check } from 'lucide-react'
import { colorClass } from '../../utils/status'

/**
 * Large tap target for the driver app (min 56px height, here much larger).
 * color: green | amber | red | info | gray. Locked state shows a lock icon.
 */
export function BigButton({
  label,
  subLabel,
  icon: Icon,
  color = 'green',
  disabled = false,
  done = false,
  onClick,
  timestamp,
  className = '',
}) {
  const c = colorClass(color)

  if (done) {
    return (
      <div
        className={`flex w-full items-center gap-4 rounded-2xl border-2 border-green bg-green-light px-5 py-4 ${className}`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green text-white">
          <Check size={26} strokeWidth={3} />
        </div>
        <div className="flex-1 text-left">
          <div className="text-base font-extrabold text-green-dark">{label}</div>
          {subLabel && <div className="text-sm font-semibold text-green-dark/70">{subLabel}</div>}
        </div>
        {timestamp && <div className="tabular text-lg font-black text-green-dark">{timestamp}</div>}
      </div>
    )
  }

  if (disabled) {
    return (
      <div
        className={`flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-line bg-white/5 px-5 py-5 ${className}`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-muted">
          <Lock size={22} strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-left">
          <div className="text-base font-extrabold text-muted">{label}</div>
          {subLabel && <div className="text-sm font-semibold text-muted">{subLabel}</div>}
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`group flex min-h-[88px] w-full items-center gap-4 rounded-2xl px-5 py-5 text-white transition-all
        ${c.solidBg} ${c.solidHover} active:scale-[0.99] shadow-card
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green/30 ${className}`}
    >
      {Icon && (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Icon size={28} strokeWidth={2.4} />
        </div>
      )}
      <div className="flex-1 text-left">
        <div className="text-xl font-black tracking-tight">{label}</div>
        {subLabel && <div className="text-sm font-semibold text-white/85">{subLabel}</div>}
      </div>
    </button>
  )
}

export default BigButton
