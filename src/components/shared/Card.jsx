/** Surface card container. */
export function Card({ children, className = '', padded = true, hover = false, ...props }) {
  return (
    <div
      className={`rounded-xl bg-surface border border-line
        ${hover ? 'transition-colors hover:border-brand/40 cursor-pointer' : ''}
        ${padded ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
