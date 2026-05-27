import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { signup as signupApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
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
      const { data } = await signupApi({ name: form.name, email: form.email, password: form.password })
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Signup failed. Please try again.')
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

        <h2 className="text-2xl font-extrabold mb-[6px] text-ink tracking-[-0.025em]">Create your account</h2>
        <p className="text-[15px] text-dim mb-7">Start your interview prep journey today</p>

        <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit} noValidate>
          <Input id="name" label="Full name" type="text" placeholder="Vaibhav Verma" value={form.name} onChange={set('name')} error={errors.name} />
          <Input id="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
          <Input id="password" label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} error={errors.password} />

          {serverError && (
            <div className="bg-hazard/[0.08] border border-hazard/25 rounded-btn px-3.5 py-2.5 text-hazard text-sm">
              {serverError}
            </div>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full py-3">
            Create account
          </Button>
        </form>

        <p className="mt-[22px] text-center text-sm text-dim">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
