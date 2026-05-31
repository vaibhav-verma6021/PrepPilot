import { cn } from '../lib/utils'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn('bg-surface border border-stroke rounded-card p-7 shadow-card', className)}
      {...props}
    >
      {children}
    </div>
  )
}
