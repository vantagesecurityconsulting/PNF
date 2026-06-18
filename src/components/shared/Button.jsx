/** Reusable button with variants, sizes, hover + active states. */

const VARIANTS = {
  primary:
    'bg-green text-white hover:bg-green-dark active:bg-green-dark shadow-sm disabled:bg-green/40',
  secondary:
    'bg-white text-ink border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50',
  ghost: 'bg-transparent text-ink hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50',
  danger: 'bg-danger text-white hover:brightness-95 active:brightness-90 disabled:opacity-50',
  dark: 'bg-ink text-white hover:bg-black active:bg-black disabled:opacity-50',
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
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1
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
