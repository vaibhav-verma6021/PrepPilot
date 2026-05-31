import { cn } from '../lib/utils'

export default function Input({ label, error, id, as: Tag = 'input', className = '', ...props }) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-2 tracking-[0.01em]">
          {label}
        </label>
      )}
      <Tag
        id={id}
        className={cn(
          'w-full bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
          'text-[15px] text-ink placeholder:text-dim',
          'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10',
          'transition-all duration-150',
          error && 'border-hazard focus:border-hazard focus:ring-hazard/10',
          className
        )}
        {...props}
      />
      {error && <span className="text-[13px] text-hazard font-medium">{error}</span>}
    </div>
  )
}
