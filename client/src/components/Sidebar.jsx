import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Code2, FileText, Briefcase,
  Building2, Target, Bot, Sun, Moon, Send, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
  { to: '/dsa',       label: 'DSA Tracker',     icon: <Code2 size={18} /> },
  { to: '/resume',    label: 'Resume Analyzer', icon: <FileText size={18} /> },
  { to: '/jobmatch',  label: 'Job Match',        icon: <Briefcase size={18} /> },
  { to: '/companies', label: 'Company Prep',     icon: <Building2 size={18} /> },
  { to: '/goals',     label: 'Daily Goals',      icon: <Target size={18} /> },
  { to: '/buddy',     label: 'Placement Buddy',  icon: <Bot size={18} /> },
]

export default function Sidebar() {
  const { theme, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'peer fixed top-0 left-0 h-screen flex flex-col z-50 overflow-hidden transition-all duration-200',
        'bg-sidebar border-r border-white/[0.06]',
        'max-md:w-16',
        collapsed ? 'w-16' : 'md:w-[248px]'
      )}
      data-collapsed={collapsed}
    >
      {/* ── Logo ── */}
      <div className={cn(
        'flex items-center gap-3 border-b border-white/[0.06] shrink-0 py-[22px]',
        collapsed ? 'justify-center px-4' : 'px-5 max-md:justify-center max-md:px-4'
      )}>
        <div
          className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1a56db 0%, #0ea5e9 100%)',
            boxShadow: '0 0 16px rgba(0,212,170,0.30), 0 2px 8px rgba(14,165,233,0.40)',
          }}
        >
          <Send size={16} color="white" strokeWidth={2.2} />
        </div>

        <span className={cn(
          'text-[17px] font-extrabold tracking-[-0.02em] whitespace-nowrap',
          collapsed && 'hidden',
          'max-md:hidden'
        )}>
          <span className="text-white">Prep</span>
          <span style={{ color: '#00d4aa' }}> Pilot</span>
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-[18px] px-2.5 flex flex-col gap-px">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              'flex items-center gap-[11px] px-[13px] py-2.5 rounded-[10px]',
              'text-sm font-medium whitespace-nowrap',
              'border-l-[3px] -ml-px transition-colors duration-150',
              collapsed ? 'justify-center px-2.5' : '',
              'max-md:justify-center max-md:px-2.5',
              isActive
                ? 'text-brand bg-brand/[0.18] border-l-brand font-semibold'
                : 'text-white/55 border-l-transparent hover:text-white/90 hover:bg-white/[0.07]'
            )}
          >
            {item.icon}
            <span className={cn(collapsed && 'hidden', 'max-md:hidden')}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom actions ── */}
      <div className="border-t border-white/[0.06] p-2.5 flex flex-col gap-px">
        {[
          {
            label: 'Collapse',
            icon: collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />,
            onClick: () => setCollapsed(c => !c),
          },
          {
            label: theme === 'dark' ? 'Light mode' : 'Dark mode',
            icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
            onClick: toggle,
          },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            title={collapsed ? btn.label : undefined}
            className={cn(
              'flex items-center gap-[11px] px-[13px] py-2.5 rounded-[10px]',
              'text-sm font-medium whitespace-nowrap w-full text-left',
              collapsed ? 'justify-center px-2.5' : '',
              'max-md:justify-center max-md:px-2.5',
              'transition-colors duration-150',
              'text-white/55 hover:text-white/90 hover:bg-white/[0.07]'
            )}
          >
            {btn.icon}
            <span className={cn(collapsed && 'hidden', 'max-md:hidden')}>{btn.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
