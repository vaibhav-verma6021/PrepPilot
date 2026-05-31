import { Button as UIButton } from './ui/button'

export default function Button({ children, loading = false, disabled = false, variant = 'primary', size, className, ...props }) {
  return (
    <UIButton variant={variant} size={size} disabled={disabled || loading} className={className} {...props}>
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </UIButton>
  )
}
