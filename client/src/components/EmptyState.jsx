import Button from './Button'

export default function EmptyState({ icon, heading, text, ctaLabel, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-[72px] px-6 text-center">
      {icon && (
        <div className="w-[72px] h-[72px] bg-surface-alt border border-stroke rounded-[20px] flex items-center justify-center text-dim mb-1">
          {icon}
        </div>
      )}
      <h3 className="text-[17px] font-bold text-ink">{heading}</h3>
      {text && <p className="text-[15px] text-dim max-w-[320px] leading-relaxed">{text}</p>}
      {ctaLabel && onCta && (
        <Button variant="primary" onClick={onCta} className="mt-2">
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
