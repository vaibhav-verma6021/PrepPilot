import { cn } from '../lib/utils'

export default function StatCard({ icon, label, value, highlight = false }) {
  return (
    <div className={cn(
      'relative overflow-hidden bg-surface border border-stroke rounded-card px-6 py-[22px] pb-6',
      'flex flex-col gap-1.5 shadow-card transition-all duration-150 hover:-translate-y-0.5',
      highlight && 'border-brand/25 bg-gradient-to-br from-surface to-brand/[0.04]'
    )}>
      {highlight && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-full" />
      )}

      <div className="flex items-start justify-between mb-1">
        <span className={cn(
          'text-[11px] font-bold uppercase tracking-[0.07em]',
          highlight ? 'text-brand' : 'text-dim'
        )}>
          {label}
        </span>
        {icon && (
          <span className={cn(
            'w-[34px] h-[34px] rounded-[9px] border flex items-center justify-center shrink-0',
            highlight
              ? 'bg-brand/10 border-brand/20 text-brand'
              : 'bg-surface-alt border-stroke text-dim'
          )}>
            {icon}
          </span>
        )}
      </div>

      <span className={cn(
        'text-[2.375rem] font-extrabold leading-[1.05] tracking-[-0.03em]',
        highlight ? 'text-brand' : 'text-ink'
      )}>
        {value ?? '—'}
      </span>
    </div>
  )
}
