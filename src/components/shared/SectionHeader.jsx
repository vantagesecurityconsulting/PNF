/** Page / section heading with optional subtitle and right-side action. */
export function SectionHeader({ title, subtitle, action, className = '', icon: Icon }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-light text-green-dark">
            <Icon size={20} strokeWidth={2.4} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-graytext">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default SectionHeader
