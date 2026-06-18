/** Surface card container. */
export function Card({ children, className = '', padded = true, hover = false, ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-card border border-black/5
        ${hover ? 'transition-shadow hover:shadow-card-hover cursor-pointer' : ''}
        ${padded ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
