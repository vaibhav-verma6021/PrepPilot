import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, User, Lock, LogOut, CheckCheck, Trash2, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { updateProfile, changePassword } from '../api/auth'
import { cn } from '../lib/utils'

/* ── helpers ──────────────────────────────────────────────── */
function relativeTime(ts) {
  const diff = Date.now() - ts
  if (diff < 60_000)       return 'just now'
  if (diff < 3_600_000)    return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000)   return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function Avatar({ name, size = 32 }) {
  const letter = (name ?? '?')[0].toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-[#0a1929] shrink-0 cursor-pointer select-none"
      style={{
        width: size, height: size, fontSize: size * 0.42,
        background: 'linear-gradient(135deg, #00d4aa, #00b894)',
        boxShadow: '0 0 10px rgba(0,212,170,0.30)',
      }}
    >
      {letter}
    </div>
  )
}

/* ── Field component (reused in modals) ─────────────────── */
function Field({ label, id, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">{label}</label>
      <input
        id={id}
        className={cn(
          'w-full bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
          'text-[15px] text-ink placeholder:text-dim',
          'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all duration-150',
          error && 'border-hazard focus:border-hazard'
        )}
        {...props}
      />
      {error && <span className="text-[13px] text-hazard font-medium">{error}</span>}
    </div>
  )
}

/* ── Edit Profile Modal ──────────────────────────────────── */
function EditProfileModal({ open, onClose }) {
  const { user, updateUser } = useAuth()
  const [name, setName]     = useState(user?.name ?? '')
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)
  const [ok, setOk]         = useState(false)

  useEffect(() => { if (open) { setName(user?.name ?? ''); setError(''); setOk(false) } }, [open, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const { data } = await updateProfile({ name: name.trim() })
      updateUser({ name: data.user.name })
      setOk(true)
      setTimeout(onClose, 800)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <ModalBackdrop onClose={onClose}>
      <h2 className="text-[19px] font-bold text-ink mb-5">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Display name" id="ep-name" value={name} onChange={e => setName(e.target.value)} error={error} placeholder="Your name" />
        <div className="flex gap-2.5 justify-end mt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-btn text-sm font-semibold bg-surface-alt border border-stroke text-ink-2 hover:text-ink transition-colors">Cancel</button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-btn text-sm font-semibold text-[#0a1929] transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#00d4aa,#00b894)', boxShadow: '0 2px 8px rgba(0,212,170,0.25)' }}
          >
            {ok ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  )
}

/* ── Change Password Modal ───────────────────────────────── */
function ChangePasswordModal({ open, onClose }) {
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [ok, setOk]         = useState(false)

  useEffect(() => { if (open) { setForm({ current: '', next: '', confirm: '' }); setErrors({}); setOk(false) } }, [open])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.current)             e.current = 'Required'
    if (!form.next)                e.next = 'Required'
    else if (form.next.length < 6) e.next = 'At least 6 characters'
    if (form.next !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    setErrors({})
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next })
      setOk(true)
      setTimeout(onClose, 800)
    } catch (err) {
      setErrors({ current: err.response?.data?.error?.message || 'Failed' })
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <ModalBackdrop onClose={onClose}>
      <h2 className="text-[19px] font-bold text-ink mb-5">Change Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Current password"  id="cp-cur"  type="password" value={form.current}  onChange={set('current')}  error={errors.current}  placeholder="••••••••" />
        <Field label="New password"      id="cp-new"  type="password" value={form.next}     onChange={set('next')}     error={errors.next}     placeholder="••••••••" />
        <Field label="Confirm new"       id="cp-conf" type="password" value={form.confirm}  onChange={set('confirm')}  error={errors.confirm}  placeholder="••••••••" />
        <div className="flex gap-2.5 justify-end mt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-btn text-sm font-semibold bg-surface-alt border border-stroke text-ink-2 hover:text-ink transition-colors">Cancel</button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-btn text-sm font-semibold text-[#0a1929] transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#00d4aa,#00b894)', boxShadow: '0 2px 8px rgba(0,212,170,0.25)' }}
          >
            {ok ? '✓ Updated' : saving ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  )
}

/* ── Modal backdrop (portal-less simple overlay) ────────── */
function ModalBackdrop({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-stroke rounded-2xl p-8 w-full max-w-[440px] shadow-popup relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-7 h-7 rounded-btn bg-surface-alt border border-stroke flex items-center justify-center text-dim hover:text-ink transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

/* ── Main TopBar ─────────────────────────────────────────── */
export default function TopBar() {
  const { user, logout }                   = useAuth()
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications()
  const navigate                           = useNavigate()

  const [notifOpen,    setNotifOpen]    = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [editOpen,     setEditOpen]     = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setProfileOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <>
      <div className="absolute top-8 right-10 z-40 flex items-center gap-1.5 max-md:top-4 max-md:right-4">

          {/* ── Bell ── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
              className="relative w-9 h-9 rounded-[10px] flex items-center justify-center text-dim hover:text-ink hover:bg-surface-alt transition-all duration-150"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-[17px] h-[17px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-stroke rounded-[14px] shadow-popup overflow-hidden z-50">
                {/* header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-stroke">
                  <span className="text-[14px] font-bold text-ink">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-[12px] text-brand hover:text-brand-dark font-semibold transition-colors"
                      >
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-dim hover:text-hazard transition-colors"
                        title="Clear all"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* list */}
                <div className="overflow-y-auto max-h-[340px]">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell size={28} className="text-dim mx-auto mb-2 opacity-40" />
                      <p className="text-[13px] text-dim">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 border-b border-stroke-soft last:border-0 transition-colors',
                          !n.read && 'bg-brand/[0.06]'
                        )}
                      >
                        <span className={cn(
                          'mt-[5px] shrink-0 w-2 h-2 rounded-full',
                          n.read ? 'bg-transparent' : 'bg-brand'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-ink leading-[1.5]">{n.message}</p>
                          <p className="text-[11px] text-dim mt-0.5">{relativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Profile ── */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-[10px] hover:bg-surface-alt transition-all duration-150"
              aria-label="Profile menu"
            >
              <Avatar name={user?.name} size={30} />
              <span className="text-[13px] font-semibold text-ink-2 max-w-[90px] truncate hidden sm:block">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={13} className={cn('text-dim transition-transform duration-150', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-stroke rounded-[14px] shadow-popup overflow-hidden z-50">
                {/* user info */}
                <div className="px-4 py-4 border-b border-stroke flex items-center gap-3">
                  <Avatar name={user?.name} size={36} />
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-ink truncate">{user?.name}</p>
                    <p className="text-[12px] text-dim truncate">{user?.email}</p>
                  </div>
                </div>

                {/* actions */}
                <div className="py-1.5">
                  <MenuButton
                    icon={<User size={14} />}
                    onClick={() => { setEditOpen(true); setProfileOpen(false) }}
                  >
                    Edit Profile
                  </MenuButton>
                  <MenuButton
                    icon={<Lock size={14} />}
                    onClick={() => { setPasswordOpen(true); setProfileOpen(false) }}
                  >
                    Change Password
                  </MenuButton>
                </div>

                <div className="border-t border-stroke py-1.5">
                  <MenuButton
                    icon={<LogOut size={14} />}
                    onClick={handleLogout}
                    danger
                  >
                    Logout
                  </MenuButton>
                </div>
              </div>
            )}
          </div>

      </div>

      {/* modals */}
      <EditProfileModal    open={editOpen}     onClose={() => setEditOpen(false)} />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  )
}

function MenuButton({ icon, children, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium transition-colors duration-100',
        danger
          ? 'text-red-400 hover:bg-red-500/[0.10] hover:text-red-300'
          : 'text-ink-2 hover:bg-surface-alt hover:text-ink'
      )}
    >
      {icon}
      {children}
    </button>
  )
}
