import { useEffect, useState } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { Target, Trash2, Check } from 'lucide-react'
import { getGoals, createGoal, toggleGoal, deleteGoal } from '../api/goals'
import Button from '../components/Button'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { cn } from '../lib/utils'

export default function DailyGoals() {
  const { addNotification } = useNotifications()
  const [goals, setGoals]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding]   = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    getGoals()
      .then(r => setGoals(r.data.goals))
      .catch(() => setError('Failed to load goals.'))
      .finally(() => setLoading(false))
  }, [])

  const completed = goals.filter(g => g.completed).length
  const total     = goals.length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) { setAddError('Goal title is required'); return }
    setAddError('')
    setAdding(true)
    try {
      const { data } = await createGoal({ title: newTitle.trim() })
      setGoals(prev => [...prev, data.goal])
      setNewTitle('')
    } catch (err) {
      setAddError(err.response?.data?.error?.message || 'Failed to add goal')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (id) => {
    const updated = goals.map(g => g._id === id ? { ...g, completed: !g.completed } : g)
    setGoals(updated)
    if (updated.length > 0 && updated.every(g => g.completed)) {
      addNotification(`🎯 All ${updated.length} daily goals completed! Great work!`)
    }
    try {
      await toggleGoal(id)
    } catch {
      setGoals(prev => prev.map(g => g._id === id ? { ...g, completed: !g.completed } : g))
    }
  }

  const handleDelete = async (id) => {
    setGoals(prev => prev.filter(g => g._id !== id))
    try {
      await deleteGoal(id)
    } catch { /* silent */ }
  }

  if (loading) return <Loader text="Loading goals…" />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-ink tracking-[-0.025em] leading-tight">Daily Goals</h1>
        <p className="text-[15px] text-dim mt-[5px]">
          {total > 0 ? `${completed} of ${total} completed today` : 'No goals set for today yet'}
        </p>
      </div>

      {total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between mb-1.5 text-[13px] text-dim">
            <span>Progress</span>
            <span className="text-brand font-semibold">{pct}%</span>
          </div>
          <div className="h-[7px] bg-stroke rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand to-[#00b894] rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2.5 mb-6 items-start">
        <div className="flex-1">
          <input
            className={cn(
              'w-full bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
              'text-[15px] text-ink placeholder:text-dim',
              'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10',
              'transition-all duration-150',
              addError && 'border-hazard focus:border-hazard focus:ring-hazard/10'
            )}
            placeholder="Add a goal for today…"
            value={newTitle}
            onChange={e => { setNewTitle(e.target.value); setAddError('') }}
          />
          {addError && <span className="text-[13px] text-hazard font-medium mt-1 block">{addError}</span>}
        </div>
        <Button type="submit" variant="primary" loading={adding} className="shrink-0">Add</Button>
      </form>

      {error && <p className="text-hazard text-sm mb-4">{error}</p>}

      {goals.length === 0 ? (
        <EmptyState icon={<Target size={48} />} heading="No goals for today" text="Add a goal above to get started with your prep plan." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {goals.map(g => (
            <div
              key={g._id}
              className={cn(
                'flex items-center gap-3.5 px-[18px] py-4 bg-surface border border-stroke rounded-card shadow-xs',
                'hover:border-stroke-soft transition-all duration-150',
                g.completed && 'opacity-55'
              )}
            >
              <button
                onClick={() => handleToggle(g._id)}
                title={g.completed ? 'Mark incomplete' : 'Mark complete'}
                className={cn(
                  'w-[22px] h-[22px] rounded-[7px] border-[1.5px] bg-surface-alt flex items-center justify-center shrink-0 transition-all duration-150',
                  g.completed
                    ? 'bg-brand border-brand shadow-[0_2px_8px_rgba(0,212,170,0.40)]'
                    : 'border-stroke hover:border-brand hover:bg-brand-dim'
                )}
              >
                {g.completed && <Check size={12} color="#0a1929" strokeWidth={3} />}
              </button>

              <span className={cn('flex-1 text-[15px] font-medium text-ink', g.completed && 'line-through text-dim')}>
                {g.title}
              </span>

              <Button variant="danger" size="icon" onClick={() => handleDelete(g._id)} title="Delete goal">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
