import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setServerError('')
    setLoading(true)
    try {
      const { data } = await loginApi({ email: form.email, password: form.password })
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-7">
      <div className="bg-surface border border-stroke rounded-[18px] px-11 py-12 w-full max-w-[440px] shadow-popup relative max-md:px-6 max-md:py-8">
        <div className="flex items-center justify-center gap-[11px] mb-8">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1a56db 0%, #0ea5e9 100%)',
              boxShadow: '0 0 18px rgba(0,212,170,0.35), 0 4px 12px rgba(14,165,233,0.45)',
            }}
          >
            <Send size={18} color="white" strokeWidth={2.2} />
          </div>
          <span className="text-[21px] font-extrabold tracking-[-0.02em]">
            <span className="text-white">Prep</span>
            <span style={{ color: '#00d4aa' }}> Pilot</span>
          </span>
        </div>

        <h2 className="text-2xl font-extrabold mb-[6px] text-ink tracking-[-0.025em]">Welcome back</h2>
        <p className="text-[15px] text-dim mb-7">Log in to your account to continue</p>

        <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit} noValidate>
          <Input id="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />

          {serverError && (
            <div className="bg-hazard/[0.08] border border-hazard/25 rounded-btn px-3.5 py-2.5 text-hazard text-sm">
              {serverError}
            </div>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full py-3">
            Log in
          </Button>
        </form>

        <p className="mt-[22px] text-center text-sm text-dim">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
