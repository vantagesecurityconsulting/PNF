import { useEffect } from 'react'
import { X } from 'lucide-react'

/** Right-side slide-over panel for detail views. */
export function SlideOver({ open, onClose, title, subtitle, children, width = 'max-w-xl' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute right-0 top-0 flex h-full w-full ${width} animate-slide-in flex-col border-l border-line bg-offwhite`}
      >
        <div className="flex items-start justify-between border-b border-line bg-surface px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-graytext">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-graytext hover:bg-white/5"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default SlideOver
