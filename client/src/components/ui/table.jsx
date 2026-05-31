import * as React from 'react'
import { cn } from '../../lib/utils'

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm border-collapse', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-surface-alt border-b-[1.5px] border-stroke', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-stroke-soft transition-colors',
      'even:bg-black/[0.013] dark:even:bg-white/[0.013]',
      'hover:bg-brand/[0.055] cursor-default',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-[18px] text-left align-middle',
      'text-brand text-xs font-bold uppercase tracking-[0.08em] whitespace-nowrap',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-[18px] py-3.5 align-middle text-ink-2', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-dim', className)} {...props} />
))
TableCaption.displayName = 'TableCaption'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption }
