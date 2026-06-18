import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

const TYPES = {
  success: { icon: CheckCircle2, ring: 'border-green', bar: 'bg-green', iconColor: 'text-green' },
  warning: { icon: AlertTriangle, ring: 'border-amber', bar: 'bg-amber', iconColor: 'text-amber' },
  error: { icon: XCircle, ring: 'border-danger', bar: 'bg-danger', iconColor: 'text-danger' },
}

/** Global toast host — render once near the app root. */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const meta = TYPES[t.type] || TYPES.success
        const Icon = meta.icon
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-md animate-toast-in items-center gap-3 overflow-hidden rounded-xl border-l-4 ${meta.ring} bg-white px-4 py-3 shadow-card-hover`}
            role="status"
          >
            <Icon size={20} className={meta.iconColor} strokeWidth={2.4} />
            <span className="flex-1 text-sm font-semibold text-ink">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-graytext hover:text-ink"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastHost
