import { Link } from 'react-router-dom'
import { Code2, FileText, Briefcase, Send, Zap } from 'lucide-react'
import { Button } from '../components/ui/button'

const features = [
  {
    icon: <Code2 size={22} />,
    title: 'DSA Problem Tracker',
    desc: 'Log every problem you solve across LeetCode, GeeksforGeeks, Codeforces and more. Filter by topic and difficulty to spot your weak areas.',
  },
  {
    icon: <FileText size={22} />,
    title: 'AI Resume Analyzer',
    desc: 'Upload your PDF resume and get an ATS score, missing skills, weak sections and actionable suggestions powered by Gemini AI.',
  },
  {
    icon: <Briefcase size={22} />,
    title: 'Job Match Engine',
    desc: 'Paste any job description, upload your resume, and instantly see how well you match — with strengths, gaps, and next steps.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Nav */}
      <nav className="flex items-center justify-between px-[52px] py-5 border-b border-stroke bg-surface sticky top-0 z-10 backdrop-blur-sm max-md:px-5">
        <div className="flex items-center gap-[11px] text-lg font-extrabold tracking-tight text-ink">
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1a56db 0%, #0ea5e9 100%)',
              boxShadow: '0 0 14px rgba(0,212,170,0.30), 0 2px 8px rgba(14,165,233,0.40)',
            }}
          >
            <Send size={15} color="white" strokeWidth={2.2} />
          </div>
          <span className="text-white">Prep</span><span style={{ color: '#00d4aa' }}> Pilot</span>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" asChild><Link to="/login">Log in</Link></Button>
          <Button variant="primary" asChild><Link to="/signup">Get started</Link></Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-7 pt-[104px] pb-20">
        <div className="inline-flex items-center gap-[7px] px-4 py-[6px] bg-brand-dim text-brand border border-brand/20 rounded-full text-[13px] font-bold mb-7 tracking-[0.01em]">
          <Zap size={13} />
          AI-powered interview prep
        </div>

        <h1 className="text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold leading-[1.1] max-w-[720px] mb-[22px] text-ink tracking-[-0.035em]">
          Ace your next <span className="text-brand">software engineering</span> interview
        </h1>

        <p className="text-lg text-dim max-w-[520px] mb-10 leading-[1.72]">
          Track your DSA progress, analyze your resume with AI, match against job descriptions, and stay on top of daily goals — all in one place.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <Button variant="primary" size="lg" asChild><Link to="/signup">Start for free</Link></Button>
          <Button variant="secondary" size="lg" asChild><Link to="/login">Log in</Link></Button>
        </div>
      </section>

      {/* Features */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5 px-[52px] pb-24 max-w-[1060px] mx-auto w-full max-md:px-5 max-md:pb-16">
        {features.map(f => (
          <div key={f.title} className="bg-surface border border-stroke rounded-card p-7 shadow-card hover:border-brand/25 hover:-translate-y-0.5 hover:shadow-hover transition-all duration-150">
            <div className="w-12 h-12 bg-brand-dim rounded-[13px] flex items-center justify-center text-brand mb-4">
              {f.icon}
            </div>
            <h3 className="text-[17px] font-bold text-ink mb-2">{f.title}</h3>
            <p className="text-[15px] text-dim leading-[1.65]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
