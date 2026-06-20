/** Reusable button with variants, sizes, hover + active states. */

const VARIANTS = {
  primary:
    'bg-brand text-white hover:bg-brand-light active:bg-brand-light disabled:bg-brand/40',
  secondary:
    'bg-transparent text-brand border border-brand hover:bg-brand/10 active:bg-brand/15 disabled:opacity-50',
  ghost: 'bg-transparent text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-50',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95 disabled:opacity-50',
  dark: 'bg-surface text-white border border-line hover:bg-white/5 disabled:opacity-50',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-14 px-6 text-base gap-2.5',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-base
        disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'lg' ? 20 : 16} strokeWidth={2.4} />}
      {children}
      {IconRight && <IconRight size={size === 'lg' ? 20 : 16} strokeWidth={2.4} />}
    </button>
  )
}

export default Button
