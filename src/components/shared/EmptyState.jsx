import { Inbox } from 'lucide-react'

/** Friendly empty state for data views with no records. */
export function EmptyState({ icon: Icon = Inbox, title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-light text-green-dark">
        <Icon size={26} strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-white">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-graytext">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState
