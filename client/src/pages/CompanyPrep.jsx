import { useEffect, useState } from 'react'
import { Building2, ChevronDown, ChevronUp, ArrowLeft, MapPin, Calendar, Users, Lightbulb, Star, Briefcase, TrendingUp } from 'lucide-react'
import { getCompanies, getCompanyByName } from '../api/companies'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import Input from '../components/Input'
import Card from '../components/Card'
import Button from '../components/Button'

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i) => <Star key={`f${i}`} size={13} className="fill-amber-400 text-amber-400" />)}
      {half && <Star size={13} className="fill-amber-200 text-amber-400" />}
      {[...Array(empty)].map((_, i) => <Star key={`e${i}`} size={13} className="text-stroke" />)}
      <span className="ml-1 text-[13px] text-ink-2 font-semibold">{rating}</span>
    </span>
  )
}

function DifficultyBadge({ level, size = 'md' }) {
  const colours = {
    Easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard:   'bg-red-50 text-red-700 border-red-200',
  }
  const dots = {
    Easy: 'bg-emerald-500',
    Medium: 'bg-amber-500',
    Hard: 'bg-red-500',
  }
  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[13px]'
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full font-semibold ${colours[level] ?? 'bg-surface-alt text-dim border-stroke'} ${px}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[level] ?? 'bg-dim'}`} />
      {level}
    </span>
  )
}

function TypeBadge({ type }) {
  const colours = {
    Product: 'bg-violet-50 text-violet-700 border-violet-200',
    Service: 'bg-sky-50 text-sky-700 border-sky-200',
    Startup: 'bg-orange-50 text-orange-700 border-orange-200',
    MNC:     'bg-teal-50 text-teal-700 border-teal-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 border rounded-full text-[11px] font-semibold ${colours[type] ?? 'bg-surface-alt text-dim border-stroke'}`}>
      {type}
    </span>
  )
}

function FAQ({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-stroke-soft">
      <button
        className="w-full text-left bg-transparent border-none py-[18px] text-ink text-[15px] font-semibold flex items-center justify-between gap-3 hover:text-brand transition-colors duration-150"
        onClick={() => setOpen(o => !o)}
      >
        {faq.question}
        {open ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
      </button>
      {open && <p className="pb-[18px] text-ink-2 text-[15px] leading-[1.72]">{faq.answer}</p>}
    </div>
  )
}

function CompanyDetail({ name, onBack }) {
  const [company, setCompany] = useState(null)
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState('')

  useEffect(() => {
    getCompanyByName(name)
      .then(r => setCompany(r.data.company))
      .catch(() => setError('Failed to load company details.'))
      .finally(() => setLoading(false))
  }, [name])

  if (loading) return <Loader text={`Loading ${name}…`} />
  if (error)   return <EmptyState heading="Error" text={error} />

  const info = company.companyInfo ?? {}

  return (
    <div>
      <Button variant="secondary" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft size={14} /> Back to companies
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-[26px] font-extrabold text-ink tracking-[-0.025em] leading-tight">{company.name}</h1>
          {info.type && <TypeBadge type={info.type} />}
          {company.interviewDifficulty && <DifficultyBadge level={company.interviewDifficulty} />}
        </div>
        {info.glassdoorRating && (
          <div className="flex items-center gap-2 text-[13px] text-dim">
            <StarRating rating={info.glassdoorRating} />
            <span>on Glassdoor</span>
          </div>
        )}
      </div>

      {/* Company info card */}
      {(info.about || info.headquarters || info.founded || info.employees) && (
        <Card className="mb-5">
          <h3 className="text-[17px] font-bold text-ink mb-4 flex items-center gap-2">
            <Building2 size={17} className="text-brand" /> About {company.name}
          </h3>
          {info.about && <p className="text-[15px] text-ink-2 leading-[1.72] mb-4">{info.about}</p>}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {info.headquarters && (
              <span className="flex items-center gap-1.5 text-[13px] text-dim">
                <MapPin size={13} className="text-brand shrink-0" /> {info.headquarters}
              </span>
            )}
            {info.founded && (
              <span className="flex items-center gap-1.5 text-[13px] text-dim">
                <Calendar size={13} className="text-brand shrink-0" /> Founded {info.founded}
              </span>
            )}
            {info.employees && (
              <span className="flex items-center gap-1.5 text-[13px] text-dim">
                <Users size={13} className="text-brand shrink-0" /> {info.employees} employees
              </span>
            )}
          </div>
        </Card>
      )}

      {/* CTC + Difficulty + Roles row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-5">
        {company.ctcRange && (
          <Card className="flex flex-col gap-3">
            <h4 className="text-[13px] font-bold text-dim uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp size={13} /> CTC Range
            </h4>
            <div>
              <p className="text-[13px] text-dim mb-0.5">Fresher</p>
              <p className="text-[22px] font-extrabold text-brand leading-tight">{company.ctcRange.fresher}</p>
            </div>
            {company.ctcRange.experienced && (
              <div>
                <p className="text-[13px] text-dim mb-0.5">Experienced</p>
                <p className="text-[16px] font-bold text-ink">{company.ctcRange.experienced}</p>
              </div>
            )}
          </Card>
        )}

        {company.roles?.length > 0 && (
          <Card className="flex flex-col gap-3">
            <h4 className="text-[13px] font-bold text-dim uppercase tracking-wide flex items-center gap-1.5">
              <Briefcase size={13} /> Roles Hired For
            </h4>
            <div className="flex flex-wrap gap-2">
              {company.roles.map(r => (
                <span key={r} className="px-2.5 py-1 bg-surface-alt border border-stroke rounded-lg text-[13px] font-semibold text-ink-2">{r}</span>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Hiring process + Topics */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-5">
        <Card>
          <h3 className="text-[17px] font-bold text-ink mb-4">Hiring Process</h3>
          <div className="flex flex-col gap-2.5">
            {company.hiringProcess.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-surface-alt border border-stroke-soft rounded-[10px] text-[15px] text-ink-2 leading-[1.55]">
                <div className="w-7 h-7 bg-brand text-[#0a1929] rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 shadow-[0_2px_8px_rgba(0,212,170,0.35)]">
                  {i + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-[17px] font-bold text-ink mb-4">Important Topics</h3>
          <div className="flex flex-wrap gap-2">
            {company.importantTopics.map(t => (
              <span key={t} className="px-3 py-[5px] bg-brand-dim text-brand border border-brand/20 rounded-full text-[13px] font-semibold">{t}</span>
            ))}
          </div>
        </Card>
      </div>

      {/* Tips */}
      {company.tips?.length > 0 && (
        <Card className="mb-5">
          <h3 className="text-[17px] font-bold text-ink mb-4 flex items-center gap-2">
            <Lightbulb size={17} className="text-amber-500" /> Preparation Tips
          </h3>
          <div className="flex flex-col gap-3">
            {company.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-[10px]">
                <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[15px] text-ink-2 leading-[1.65]">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* FAQs */}
      {company.faqs?.length > 0 && (
        <Card>
          <h3 className="text-[17px] font-bold text-ink mb-2">Frequently Asked Questions</h3>
          {company.faqs.map((faq, i) => <FAQ key={i} faq={faq} />)}
        </Card>
      )}
    </div>
  )
}

const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard']
const TYPE_OPTIONS = ['All', 'Product', 'Service', 'Startup']

export default function CompanyPrep() {
  const [companies, setCompanies]         = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [search, setSearch]               = useState('')
  const [diffFilter, setDiffFilter]       = useState('All')
  const [typeFilter, setTypeFilter]       = useState('All')
  const [selected, setSelected]           = useState(null)

  useEffect(() => {
    setLoading(true)
    getCompanies({ search: search || undefined })
      .then(r => setCompanies(r.data.companies))
      .catch(() => setError('Failed to load companies.'))
      .finally(() => setLoading(false))
  }, [search])

  if (selected) return <CompanyDetail name={selected} onBack={() => setSelected(null)} />
  if (loading)  return <Loader text="Loading companies…" />

  const visible = companies.filter(c => {
    if (diffFilter !== 'All' && c.interviewDifficulty !== diffFilter) return false
    if (typeFilter !== 'All' && c.companyInfo?.type !== typeFilter) return false
    return true
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-ink tracking-[-0.025em] leading-tight">Company Prep</h1>
        <p className="text-[15px] text-dim mt-[5px]">Hiring processes, CTC, key topics and FAQs for top companies</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          id="csearch"
          placeholder="Search companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-[220px]"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {DIFFICULTY_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-colors duration-100
                ${diffFilter === d
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface text-dim border-stroke hover:border-brand hover:text-brand'}`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_OPTIONS.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-colors duration-100
                ${typeFilter === t
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface text-dim border-stroke hover:border-brand hover:text-brand'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {(diffFilter !== 'All' || typeFilter !== 'All') && (
          <button
            onClick={() => { setDiffFilter('All'); setTypeFilter('All') }}
            className="text-[13px] text-dim underline hover:text-brand transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && <EmptyState heading="Something went wrong" text={error} />}

      {!error && visible.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          heading="No companies found"
          text={search ? `No results for "${search}"` : 'Try adjusting your filters.'}
        />
      ) : (
        <>
          <p className="text-[13px] text-dim mb-4">{visible.length} {visible.length === 1 ? 'company' : 'companies'}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {visible.map(c => {
              const info = c.companyInfo ?? {}
              return (
                <div
                  key={c._id}
                  onClick={() => setSelected(c.name)}
                  className="bg-surface border border-stroke rounded-card p-5 cursor-pointer shadow-card hover:border-brand hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,170,0.12)] transition-all duration-150 flex flex-col gap-3"
                >
                  {/* Top row: name + badges */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[16px] font-bold text-ink leading-snug">{c.name}</h3>
                    {info.type && <TypeBadge type={info.type} />}
                  </div>

                  {/* Glassdoor rating */}
                  {info.glassdoorRating && (
                    <StarRating rating={info.glassdoorRating} />
                  )}

                  {/* CTC fresher */}
                  {c.ctcRange?.fresher && (
                    <div>
                      <p className="text-[11px] text-dim uppercase font-semibold tracking-wide mb-0.5">Fresher CTC</p>
                      <p className="text-[15px] font-extrabold text-brand leading-tight">{c.ctcRange.fresher}</p>
                    </div>
                  )}

                  {/* Difficulty + topics */}
                  <div className="flex flex-wrap items-center gap-2">
                    {c.interviewDifficulty && <DifficultyBadge level={c.interviewDifficulty} size="sm" />}
                    {(c.importantTopics || []).slice(0, 2).map(t => (
                      <span key={t} className="px-2 py-0.5 bg-brand-dim text-brand border border-brand/20 rounded-full text-[11px] font-semibold">{t}</span>
                    ))}
                    {c.importantTopics?.length > 2 && (
                      <span className="text-dim text-[11px]">+{c.importantTopics.length - 2}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
