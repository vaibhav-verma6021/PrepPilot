import { useEffect, useRef, useState } from 'react'
import { Bot, Send, RotateCcw, Loader2 } from 'lucide-react'
import { getProfile, setupProfile, sendMessage, getHistory, resetChat } from '../api/placementBuddy'
import Button from '../components/Button'
import { cn } from '../lib/utils'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-brand/20">
        <Bot size={14} className="text-brand" />
      </div>
      <div className="bg-surface border border-stroke rounded-[14px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-dim animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-dim animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-dim animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex items-end gap-2.5 mb-4', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-brand/30' : 'bg-brand/20'
      )}>
        {isUser
          ? <span className="text-[11px] font-bold text-brand">U</span>
          : <Bot size={14} className="text-brand" />}
      </div>
      <div className={cn(
        'max-w-[72%] px-4 py-3 text-[14px] leading-[1.65] whitespace-pre-wrap break-words',
        isUser
          ? 'bg-brand text-[#0a1929] font-medium rounded-[14px] rounded-br-[4px]'
          : 'bg-surface border border-stroke text-ink rounded-[14px] rounded-bl-[4px]'
      )}>
        {msg.message}
      </div>
    </div>
  )
}

function SetupForm({ onSetup, prefillResume }) {
  const [company, setCompany]       = useState('')
  const [resumeText, setResumeText] = useState(prefillResume || '')
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (prefillResume) setResumeText(prefillResume)
  }, [prefillResume])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company.trim()) { setError('Target company is required'); return }
    if (!resumeText.trim()) { setError('Resume text is required'); return }
    setSaving(true)
    setError('')
    try {
      const { data } = await setupProfile({ targetCompany: company.trim(), resumeText: resumeText.trim() })
      onSetup(data.profile)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Setup failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[600px] mx-auto mt-4">
      <div className="bg-surface border border-stroke rounded-card p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-[12px] bg-brand/20 flex items-center justify-center">
            <Bot size={20} className="text-brand" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-ink">Set up your Buddy</h2>
            <p className="text-[13px] text-dim">Tell us your target company and paste your resume</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-2">Which company are you targeting?</label>
            <input
              className={cn(
                'w-full bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
                'text-[15px] text-ink placeholder:text-dim',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all duration-150'
              )}
              placeholder="e.g. Google, Amazon, Flipkart…"
              value={company}
              onChange={e => { setCompany(e.target.value); setError('') }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-2">
              Your resume text
              {prefillResume && (
                <span className="ml-2 text-brand font-normal text-[12px]">· auto-filled from your last analysis</span>
              )}
            </label>
            <textarea
              className={cn(
                'w-full bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
                'text-[14px] text-ink placeholder:text-dim resize-none',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all duration-150'
              )}
              rows={8}
              placeholder="Paste your resume text here…"
              value={resumeText}
              onChange={e => { setResumeText(e.target.value); setError('') }}
            />
          </div>

          {error && <p className="text-hazard text-[13px] font-medium">{error}</p>}

          <Button type="submit" variant="primary" loading={saving} className="self-start">
            Start chatting
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function PlacementBuddy() {
  const [profile, setProfile]         = useState(null)
  const [prefillResume, setPrefill]   = useState(null)
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [sending, setSending]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [resetting, setResetting]     = useState(false)
  const bottomRef                     = useRef(null)
  const inputRef                      = useRef(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getProfile()
        if (data.profile) {
          setProfile(data.profile)
          const histRes = await getHistory()
          setMessages(histRes.data.messages)
        } else {
          setPrefill(data.resumeText)
        }
      } catch {
        setError('Failed to load. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', message: text, timestamp: new Date() }])
    setSending(true)
    try {
      const { data } = await sendMessage({ message: text })
      setMessages(prev => [...prev, { role: 'assistant', message: data.reply, timestamp: new Date() }])
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Something went wrong. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', message: `⚠️ ${msg}`, timestamp: new Date() }])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = async () => {
    if (!window.confirm('This will clear your chat history and profile. Continue?')) return
    setResetting(true)
    try {
      await resetChat()
      setProfile(null)
      setMessages([])
      setPrefill(null)
    } catch {
      setError('Reset failed. Please try again.')
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-brand animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="text-hazard text-sm mt-8 text-center">{error}</p>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-[26px] font-extrabold text-ink tracking-[-0.025em] leading-tight">Placement Buddy</h1>
          <p className="text-[15px] text-dim mt-[5px]">
            {profile
              ? <>AI prep assistant · targeting <span className="text-brand font-semibold">{profile.targetCompany}</span></>
              : 'Your AI-powered interview prep assistant'}
          </p>
        </div>
        {profile && (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 text-[13px] text-dim hover:text-hazard transition-colors"
            title="Reset profile and chat"
          >
            <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
            Reset
          </button>
        )}
      </div>

      {!profile ? (
        <SetupForm onSetup={setProfile} prefillResume={prefillResume} />
      ) : (
        <div className="flex flex-col flex-1 bg-surface border border-stroke rounded-card shadow-card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-10">
                <div className="w-14 h-14 rounded-2xl bg-brand/15 flex items-center justify-center">
                  <Bot size={28} className="text-brand" />
                </div>
                <p className="text-[15px] font-semibold text-ink">Ask me anything about your {profile.targetCompany} prep</p>
                <p className="text-[13px] text-dim max-w-xs">Try: "What topics should I focus on?", "Review my resume for this role", "Give me a mock interview question"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-stroke px-4 py-3 flex gap-2.5 items-end shrink-0">
            <textarea
              ref={inputRef}
              className={cn(
                'flex-1 bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
                'text-[14px] text-ink placeholder:text-dim resize-none',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all duration-150',
                'min-h-[42px] max-h-[120px]'
              )}
              placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              loading={sending}
              className="shrink-0 h-[42px] px-4"
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
