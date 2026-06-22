import { useEffect, useState } from 'react'
import { Code2, CheckCircle2, FileText, Briefcase, Target, TrendingUp } from 'lucide-react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { getDashboardStats } from '../api/dashboard'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

/* ── helpers ─────────────────────────────────────────────── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dayLabel  = (d) => DAY_NAMES[new Date(d + 'T12:00:00').getDay()]

/* ── shared card wrapper ─────────────────────────────────── */
function ChartCard({ title, subtitle, children, className }) {
  return (
    <div className={cn('bg-surface border border-stroke rounded-card p-6 shadow-card flex flex-col', className)}>
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        {subtitle && <p className="text-[12px] text-dim mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

/* ── custom tooltip ──────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-stroke rounded-[10px] px-3 py-2 shadow-popup text-[13px]">
      {label && <p className="text-dim mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || '#00d4aa' }} className="font-semibold">
          {p.name ? `${p.name}: ` : ''}{p.value}
        </p>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   1. DIFFICULTY PIE
──────────────────────────────────────────────────────────── */
const DIFF_COLORS = { Easy: '#00d4aa', Medium: '#f59e0b', Hard: '#ef4444' }

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5
  const x  = cx + r * Math.cos(-midAngle * RADIAN)
  const y  = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={12} fontWeight="700">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function DifficultyPie({ easy, medium, hard }) {
  const total = easy + medium + hard
  const data = [
    { name: 'Easy',   value: easy,   color: '#00d4aa' },
    { name: 'Medium', value: medium, color: '#f59e0b' },
    { name: 'Hard',   value: hard,   color: '#ef4444' },
  ].filter(d => d.value > 0)

  if (total === 0) return (
    <div className="flex-1 flex items-center justify-center py-8">
      <div className="text-center">
        <Code2 size={32} className="text-dim mx-auto mb-2 opacity-40" />
        <p className="text-[13px] text-dim">Add problems to see stats</p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            outerRadius={85}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            strokeWidth={0}
          >
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-5 flex-wrap">
        {[{ label: 'Easy', count: easy, color: '#00d4aa' }, { label: 'Medium', count: medium, color: '#f59e0b' }, { label: 'Hard', count: hard, color: '#ef4444' }].map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[13px] text-ink-2 font-medium">{label}</span>
            <span className="text-[13px] font-bold text-ink ml-0.5">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   2. GOALS DONUT
──────────────────────────────────────────────────────────── */
function GoalsDonut({ completed, total }) {
  const pending = total - completed
  const pct     = total > 0 ? Math.round((completed / total) * 100) : 0
  const data = [
    { name: 'Completed', value: completed, color: '#00d4aa' },
    { name: 'Pending',   value: pending,   color: '#334155' },
  ]

  if (total === 0) return (
    <div className="flex-1 flex items-center justify-center py-8">
      <div className="text-center">
        <Target size={32} className="text-dim mx-auto mb-2 opacity-40" />
        <p className="text-[13px] text-dim">Set daily goals to see progress</p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="relative" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={58} outerRadius={85}
              startAngle={90} endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[28px] font-extrabold text-ink leading-tight">{pct}%</p>
            <p className="text-[11px] text-dim font-medium">Complete</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
          <span className="text-[13px] text-ink-2 font-medium">Completed</span>
          <span className="text-[13px] font-bold text-ink ml-0.5">{completed}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#334155' }} />
          <span className="text-[13px] text-ink-2 font-medium">Pending</span>
          <span className="text-[13px] font-bold text-ink ml-0.5">{pending}</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   3. PROBLEMS THIS WEEK BAR
──────────────────────────────────────────────────────────── */
function WeekBar({ data }) {
  const weekData = data.map(d => ({ ...d, day: dayLabel(d.date) }))
  const hasAny   = weekData.some(d => d.count > 0)

  return (
    <div className="flex-1 min-h-0" style={{ height: 220 }}>
      {!hasAny ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <TrendingUp size={32} className="text-dim mx-auto mb-2 opacity-40" />
            <p className="text-[13px] text-dim">No problems solved this week</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData} margin={{ top: 20, right: 10, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="100%" stopColor="#00b894" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,212,170,0.06)' }} />
            <Bar dataKey="count" name="Solved" fill="url(#barGrad)" radius={[5, 5, 0, 0]} maxBarSize={48}>
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 600 }}
                formatter={(v) => v > 0 ? v : ''}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   4. TOPICS HORIZONTAL BAR
──────────────────────────────────────────────────────────── */
function TopicsBar({ data }) {
  if (!data?.length) return (
    <div className="flex-1 flex items-center justify-center py-8">
      <div className="text-center">
        <Code2 size={32} className="text-dim mx-auto mb-2 opacity-40" />
        <p className="text-[13px] text-dim">Add problems to see topics breakdown</p>
      </div>
    </div>
  )

  const chartH = Math.max(180, data.length * 36)

  return (
    <div className="flex-1 min-h-0" style={{ height: chartH }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient id="topicGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a56db" />
              <stop offset="100%" stopColor="#00d4aa" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={88} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,212,170,0.06)' }} />
          <Bar dataKey="count" name="Problems" fill="url(#topicGrad)" radius={[0, 5, 5, 0]} maxBarSize={22}>
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   MAIN DASHBOARD
──────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user }  = useAuth()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading dashboard…" />
  if (error)   return <EmptyState heading="Something went wrong" text={error} />

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8 pr-28">
        <h1 className="text-[26px] font-extrabold text-ink tracking-[-0.025em] leading-tight">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-[15px] text-dim mt-[5px]">Here's your prep overview for today</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 mb-8">
        <StatCard icon={<Code2 size={16} />}        label="Total Solved"  value={stats.totalSolved}  highlight={stats.totalSolved > 0} />
        <StatCard icon={<CheckCircle2 size={16} />} label="Easy"          value={stats.easySolved} />
        <StatCard icon={<TrendingUp size={16} />}   label="Medium"        value={stats.mediumSolved} />
        <StatCard icon={<Code2 size={16} />}        label="Hard"          value={stats.hardSolved} />
        <StatCard icon={<FileText size={16} />}     label="Resume Score"  value={stats.resumeScore  !== null ? `${stats.resumeScore}/100`   : '—'} highlight={stats.resumeScore  !== null} />
        <StatCard icon={<Briefcase size={16} />}    label="Job Match"     value={stats.jobMatchScore !== null ? `${stats.jobMatchScore}%`    : '—'} highlight={stats.jobMatchScore !== null} />
        <StatCard icon={<Target size={16} />}       label="Today's Goals" value={stats.goalsTotal > 0 ? `${stats.goalsCompleted}/${stats.goalsTotal}` : '—'} highlight={stats.goalsTotal > 0 && stats.goalsCompleted === stats.goalsTotal} />
      </div>

      {/* ── Charts grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <ChartCard title="Problems by Difficulty" subtitle={`${stats.totalSolved} problems solved total`}>
          <DifficultyPie easy={stats.easySolved} medium={stats.mediumSolved} hard={stats.hardSolved} />
        </ChartCard>

        <ChartCard title="Daily Goals Progress" subtitle="Today's completion rate">
          <GoalsDonut completed={stats.goalsCompleted} total={stats.goalsTotal} />
        </ChartCard>

        <ChartCard title="Problems Solved This Week" subtitle="Last 7 days activity">
          <WeekBar data={stats.problemsPerDay} />
        </ChartCard>

        <ChartCard title="Topics Breakdown" subtitle="Problems solved per topic">
          <TopicsBar data={stats.topicsBreakdown} />
        </ChartCard>

      </div>
    </div>
  )
}
