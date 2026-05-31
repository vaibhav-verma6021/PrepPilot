import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97] rounded-btn',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-[#0a1929] shadow-[0_2px_8px_rgba(0,212,170,0.25)] hover:bg-brand-dark hover:shadow-[0_4px_14px_rgba(0,212,170,0.35)] hover:-translate-y-px',
        secondary:
          'bg-surface text-ink-2 border border-stroke shadow-xs hover:bg-surface-alt hover:text-ink',
        danger:
          'bg-hazard-dim text-hazard border border-hazard/20 hover:bg-hazard/20',
        ghost:
          'hover:bg-surface-alt text-ink-2 hover:text-ink',
        link:
          'text-brand underline-offset-4 hover:underline p-0',
      },
      size: {
        default: 'px-5 py-[9px]',
        sm:      'px-3.5 py-1.5 text-[13px]',
        lg:      'px-6 py-3 text-base',
        icon:    'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
