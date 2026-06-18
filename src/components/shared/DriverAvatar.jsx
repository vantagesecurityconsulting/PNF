/** Initials avatar in brand green. */
const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
}

export function DriverAvatar({ driver, size = 'md', className = '' }) {
  const initials = driver?.initials || '?'
  const onLeave = driver?.status === 'on-leave'
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-tight
        ${onLeave ? 'bg-gray-200 text-graytext' : 'bg-green text-white'}
        ${SIZES[size]} ${className}`}
      title={driver?.name}
    >
      {initials}
    </div>
  )
}

export default DriverAvatar
