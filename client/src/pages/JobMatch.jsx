import { useEffect, useRef, useState } from 'react'
import { Briefcase, Upload } from 'lucide-react'
import { analyzeJobMatch, getLatestJobMatch } from '../api/jobmatch'
import Button from '../components/Button'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import Card from '../components/Card'
import Input from '../components/Input'
import { cn } from '../lib/utils'
import { useNotifications } from '../context/NotificationContext'

function ResultsList({ items }) {
  if (!items?.length) return <p className="text-dim text-sm">None identified.</p>
  return (
    <div className="flex flex-col gap-[7px]">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 text-sm text-ink-2 px-3.5 py-2.5 bg-canvas rounded-[9px] border border-stroke-soft leading-[1.55] min-w-0 overflow-hidden before:content-['▸'] before:text-brand before:text-xs before:mt-0.5 before:shrink-0">
          <span className="min-w-0 break-words">{item}</span>
        </div>
      ))}
    </div>
  )
}

export default function JobMatch() {
  const { addNotification } = useNotifications()
  const [latest, setLatest]               = useState(null)
  const [loadingLatest, setLoadingLatest] = useState(true)
  const [file, setFile]                   = useState(null)
  const [dragOver, setDragOver]           = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle]           = useState('')
  const [fileError, setFileError]         = useState('')
  const [analyzing, setAnalyzing]         = useState(false)
  const [analyzeError, setAnalyzeError]   = useState('')
  const inputRef = useRef()

  useEffect(() => {
    getLatestJobMatch()
      .then(r => setLatest(r.data.jobMatch))
      .catch(() => {})
      .finally(() => setLoadingLatest(false))
  }, [])

  const validateFile = (f) => {
    if (!f) return 'No file selected'
    if (f.type !== 'application/pdf') return 'Only PDF files are allowed'
    if (f.size > 5 * 1024 * 1024) return 'File must be under 5 MB'
    return ''
  }

  const handleFileChange = (f) => {
    const err = validateFile(f)
    setFileError(err)
    setFile(err ? null : f)
    setAnalyzeError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileChange(f)
  }

  const canAnalyze = file && !fileError && jobDescription.trim().length > 20

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    const fd = new FormData()
    fd.append('resume', file)
    fd.append('jobDescription', jobDescription)
    if (jobTitle.trim()) fd.append('jobTitle', jobTitle)
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const { data } = await analyzeJobMatch(fd)
      setLatest(data.jobMatch)
      setFile(null)
      setJobDescription('')
      setJobTitle('')
      addNotification(`💼 Job match analysis complete! You match ${data.jobMatch.matchScore}% of the requirements`)
    } catch (err) {
      setAnalyzeError(err.response?.data?.error?.message || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-ink tracking-[-0.025em] leading-tight">Job Match</h1>
        <p className="text-[15px] text-dim mt-[5px]">See how well your resume fits a specific job description</p>
      </div>

      <Card className="mb-6">
        <div
          className={cn(
            'border-2 border-dashed border-stroke rounded-card p-14 text-center cursor-pointer mb-4',
            'flex flex-col items-center gap-2.5 bg-surface-alt',
            'transition-all duration-150',
            dragOver ? 'border-brand bg-brand-dim' : 'hover:border-brand hover:bg-brand-dim'
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload size={32} className="text-dim" />
          <p className="text-[15px] text-ink-2 font-medium">{file ? file.name : 'Drag & drop your resume PDF, or click to browse'}</p>
          <span className="text-[13px] text-dim">PDF only · max 5 MB</span>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFileChange(e.target.files[0])} />
        </div>
        {fileError && <p className="text-hazard text-sm mb-3">{fileError}</p>}

        <div className="flex flex-col gap-3">
          <Input id="jobtitle" label="Job title (optional)" placeholder="e.g. Software Engineer at Google" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
          <Input id="jd" as="textarea" label="Job description" placeholder="Paste the full job description here…" value={jobDescription} onChange={e => setJobDescription(e.target.value)} style={{ minHeight: 150 }} />
        </div>

        <div className="mt-4 flex gap-3 items-center flex-wrap">
          <Button variant="primary" onClick={handleAnalyze} disabled={!canAnalyze} loading={analyzing}>
            <Briefcase size={16} /> Analyze Match
          </Button>
          {analyzing && <span className="text-dim text-sm">Analyzing… this may take a moment</span>}
          {analyzeError && <span className="text-hazard text-sm">{analyzeError}</span>}
          {!file && !fileError && <span className="text-dim text-[13px]">Upload a PDF resume to continue</span>}
        </div>
      </Card>

      {loadingLatest ? (
        <Loader text="Loading previous result…" />
      ) : !latest ? (
        <EmptyState icon={<Briefcase size={48} />} heading="No job match yet" text="Upload your resume and paste a job description above to see how well you match." />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-ink">Latest Match{latest.jobTitle ? ` — ${latest.jobTitle}` : ''}</h2>
            <span className="text-dim text-[13px]">{new Date(latest.analyzedAt).toLocaleDateString()}</span>
          </div>

          <Card className="text-center mb-4">
            <div className="text-[5rem] font-extrabold text-brand leading-none tracking-[-0.04em]">{latest.matchScore}%</div>
            <div className="text-[15px] text-dim mt-2 font-medium">Job Match Score</div>
          </Card>

          <div className="grid grid-cols-3 gap-4 mt-5">
            <Card>
              <h4 className="text-[11px] font-bold text-brand uppercase tracking-[0.1em] mb-3">Your Strengths</h4>
              <ResultsList items={latest.strengths} />
            </Card>
            <Card>
              <h4 className="text-[11px] font-bold text-brand uppercase tracking-[0.1em] mb-3">Missing Skills</h4>
              <ResultsList items={latest.missingSkills} />
            </Card>
            <Card>
              <h4 className="text-[11px] font-bold text-brand uppercase tracking-[0.1em] mb-3">Suggestions</h4>
              <ResultsList items={latest.suggestions} />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
