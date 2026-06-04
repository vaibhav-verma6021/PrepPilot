import { useEffect, useState, useMemo, useCallback } from 'react'
import { Plus, Pencil, Trash2, Code2, CheckCircle2, Star, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import { getProblems, createProblem, updateProblem, deleteProblem, toggleDone, toggleRevision } from '../api/problems'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { cn } from '../lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

// ─── Constants ─────────────────────────────────────────────────────────────

const PAGE_SIZE  = 20
const PLATFORMS  = ['LeetCode', 'GeeksforGeeks', 'HackerRank', 'Codeforces']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const TOPICS     = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Sorting', 'Binary Search']
const BLANK      = { problemName: '', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays' }

const TOPIC_MAP = {
  'Array': 'Arrays', 'Hash Table': 'Arrays', 'Two Pointers': 'Arrays',
  'Sliding Window': 'Arrays', 'Prefix Sum': 'Arrays', 'Stack': 'Arrays',
  'Queue': 'Arrays', 'Heap (Priority Queue)': 'Arrays', 'Monotonic Stack': 'Arrays',
  'String': 'Strings', 'String Matching': 'Strings',
  'Linked List': 'Linked List',
  'Tree': 'Trees', 'Binary Tree': 'Trees', 'Binary Search Tree': 'Trees',
  'N-ary Tree': 'Trees', 'Trie': 'Trees', 'Segment Tree': 'Trees',
  'Graph': 'Graphs', 'Topological Sort': 'Graphs', 'Union Find': 'Graphs',
  'Shortest Path': 'Graphs', 'BFS': 'Graphs', 'DFS': 'Graphs',
  'Dynamic Programming': 'DP', 'Memoization': 'DP',
  'Sorting': 'Sorting', 'Counting Sort': 'Sorting', 'Merge Sort': 'Sorting',
  'Binary Search': 'Binary Search',
}

const mapToTopic = (tags = []) => {
  for (const tag of tags) {
    const mapped = TOPIC_MAP[tag]
    if (mapped) return mapped
  }
  return 'Arrays'
}

// ─── LeetCode API endpoints ─────────────────────────────────────────────────
const LC_BASE      = 'https://alfa-leetcode-api.onrender.com'
const FALLBACK_URL = 'https://leetcode-api-fbrp.vercel.app/problemset/all'
const BATCH_SIZE   = 5   // parallel page requests per round

const normalizeLC = (data) => {
  let list = []
  if (Array.isArray(data))
    list = data
  else if (data && Array.isArray(data.problemsetQuestionList))
    list = data.problemsetQuestionList
  else if (data && data.data && Array.isArray(data.data.problemsetQuestionList))
    list = data.data.problemsetQuestionList
  else if (data && Array.isArray(data.data))
    list = data.data
  else if (data && Array.isArray(data.problems))
    list = data.problems

  return list.map((p, i) => ({
    id:        p.frontendQuestionId ?? p.id ?? p.questionFrontendId ?? i + 1,
    title:     p.title || p.titleSlug?.replace(/-/g, ' ') || '',
    titleSlug: p.titleSlug || p.title?.toLowerCase().replace(/\s+/g, '-') || '',
    difficulty: DIFFICULTIES.includes(p.difficulty) ? p.difficulty : 'Medium',
    tags: Array.isArray(p.topicTags)
      ? p.topicTags.map(t => (typeof t === 'string' ? t : t.name || ''))
      : Array.isArray(p.tags)
        ? p.tags.map(t => (typeof t === 'string' ? t : t.name || ''))
        : [],
  }))
}

// ─── Shared: Difficulty badge ───────────────────────────────────────────────

const DIFF_CLS = {
  Easy:   'bg-green-500/10 text-green-600 dark:text-green-400',
  Medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  Hard:   'bg-red-500/10 text-red-600 dark:text-red-400',
}

function DiffBadge({ d }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide',
      DIFF_CLS[d] || 'bg-surface-alt border border-stroke text-ink-2'
    )}>
      {d}
    </span>
  )
}

// ─── Shared: Tab button ──────────────────────────────────────────────────────

function TabBtn({ active, onClick, children, sm }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'border-b-2 transition-colors duration-150 font-semibold whitespace-nowrap -mb-px',
        sm ? 'px-3 pb-2 pt-0.5 text-xs' : 'px-4 pb-3 pt-1 text-sm',
        active
          ? 'text-brand border-brand'
          : 'text-dim border-transparent hover:text-ink-2 hover:border-stroke'
      )}
    >
      {children}
    </button>
  )
}

// ─── Browse LeetCode sub-component ─────────────────────────────────────────

function BrowseLeetCode({ myProblems, onAdd }) {
  const [lcAll,    setLcAll]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const [diff,     setDiff]     = useState('')
  const [page,     setPage]     = useState(1)
  const [addingId, setAddingId] = useState(null)

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    setError('')
    setProgress({ loaded: 0, total: 0 })

    // Shared fetch helper with 20-second timeout
    const doFetch = async (url) => {
      const ctrl  = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 20000)
      try {
        const r = await fetch(url, { signal: ctrl.signal })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return await r.json()
      } finally {
        clearTimeout(timer)
      }
    }

    // Strategy 1: single bulk request for all ~3000 problems
    const tryBulk = async () => {
      const data = await doFetch(`${LC_BASE}/problems?limit=3000`)
      const list = normalizeLC(data)
      if (list.length === 0) throw new Error('empty')
      const total = data.total ?? data.totalQuestions ?? list.length
      setProgress({ loaded: list.length, total })
      return list
    }

    // Strategy 2: paginate 100/page, batch BATCH_SIZE pages in parallel
    const tryPaginated = async () => {
      const LIMIT = 100
      const firstData = await doFetch(`${LC_BASE}/problems?limit=${LIMIT}&skip=0`)
      const firstList = normalizeLC(firstData)
      if (firstList.length === 0) throw new Error('empty')

      const total = firstData.total ?? firstData.totalQuestions ?? 0
      setProgress({ loaded: firstList.length, total: total || firstList.length })

      if (!total || total <= LIMIT) return firstList

      const pageCount = Math.ceil((total - LIMIT) / LIMIT)
      const all = [...firstList]

      for (let b = 0; b < pageCount; b += BATCH_SIZE) {
        const indices = Array.from(
          { length: Math.min(BATCH_SIZE, pageCount - b) },
          (_, j) => b + j + 1
        )
        const results = await Promise.all(
          indices.map(i =>
            doFetch(`${LC_BASE}/problems?limit=${LIMIT}&skip=${i * LIMIT}`)
              .then(d => normalizeLC(d))
              .catch(() => [])
          )
        )
        results.forEach(r => all.push(...r))
        setProgress({ loaded: all.length, total })
      }
      return all
    }

    // Strategy 3: fallback URL
    const tryFallback = async () => {
      const data = await doFetch(FALLBACK_URL)
      const list = normalizeLC(data)
      if (list.length === 0) throw new Error('empty')
      setProgress({ loaded: list.length, total: list.length })
      return list
    }

    try {
      let list
      try        { list = await tryBulk()      }
      catch      {
        try      { list = await tryPaginated() }
        catch    { list = await tryFallback()  }
      }
      setLcAll(list)
    } catch {
      setError('Both APIs failed to respond. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProblems() }, [fetchProblems])

  const isAdded = useCallback(
    (p) => myProblems.some(
      mp => mp.platform === 'LeetCode' &&
            mp.problemName.toLowerCase() === p.title.toLowerCase()
    ),
    [myProblems]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return lcAll.filter(p => {
      if (q && !p.title.toLowerCase().includes(q)) return false
      if (diff && p.difficulty !== diff) return false
      return true
    })
  }, [lcAll, search, diff])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const easyCount   = lcAll.filter(p => p.difficulty === 'Easy').length
  const mediumCount = lcAll.filter(p => p.difficulty === 'Medium').length
  const hardCount   = lcAll.filter(p => p.difficulty === 'Hard').length

  const handleSearch = (v) => { setSearch(v); setPage(1) }
  const handleDiff   = (v) => { setDiff(v);   setPage(1) }

  const handleAdd = async (p) => {
    setAddingId(p.id)
    try { await onAdd(p) } catch { /* silent */ } finally { setAddingId(null) }
  }

  const selectCls = cn(
    'bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
    'text-sm text-ink cursor-pointer',
    'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10',
    'transition-all duration-150'
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-5 py-20">
      <div className="w-10 h-10 border-[3px] border-stroke border-t-brand rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-[15px] font-medium text-ink-2">
          {progress.total > 0
            ? `Loading problems… ${progress.loaded.toLocaleString()} / ${progress.total.toLocaleString()}`
            : 'Connecting to LeetCode API…'}
        </p>
        <p className="text-[13px] text-dim mt-1">This may take a moment on first load</p>
      </div>
      {progress.total > 0 && (
        <div className="w-64 h-1.5 bg-stroke rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-[width] duration-300"
            style={{ width: `${Math.min(100, (progress.loaded / progress.total) * 100)}%` }}
          />
        </div>
      )}
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 bg-surface-alt border border-stroke rounded-[20px] flex items-center justify-center text-dim">
        <Code2 size={32} />
      </div>
      <h3 className="text-[17px] font-bold text-ink">Couldn't load problems</h3>
      <p className="text-[15px] text-dim max-w-[340px] leading-relaxed">{error}</p>
      <Button variant="primary" onClick={fetchProblems}>
        <RefreshCw size={15} /> Retry
      </Button>
    </div>
  )

  return (
    <div>
      {/* LC Counts */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-semibold text-green-600 dark:text-green-400">
          Easy: {easyCount}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-semibold text-yellow-600 dark:text-yellow-400">
          Medium: {mediumCount}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-semibold text-red-600 dark:text-red-400">
          Hard: {hardCount}
        </span>
        <span className="text-xs text-dim ml-auto">{filtered.length} problems</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <Input
          id="lcsearch"
          placeholder="Search by title…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-[240px]"
        />
        <select className={cn(selectCls, 'w-[140px]')} value={diff} onChange={e => handleDiff(e.target.value)}>
          <option value="">All Levels</option>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-stroke rounded-card shadow-card overflow-hidden mb-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-44 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-dim">No problems match your filters.</TableCell>
              </TableRow>
            ) : paged.map(p => {
              const added = isAdded(p)
              return (
                <TableRow key={p.id}>
                  <TableCell className="text-dim font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium text-ink max-w-[260px]">
                    <span className="line-clamp-1">{p.title}</span>
                  </TableCell>
                  <TableCell><DiffBadge d={p.difficulty} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-surface-alt border border-stroke-soft rounded text-[11px] text-dim">{tag}</span>
                      ))}
                      {p.tags.length > 2 && (
                        <span className="text-[11px] text-dim self-center">+{p.tags.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => window.open(`https://leetcode.com/problems/${p.titleSlug}/`, '_blank', 'noopener')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-btn text-xs font-semibold bg-surface-alt border border-stroke text-ink-2 hover:text-ink hover:border-stroke-soft transition-all duration-150"
                        title="Open on LeetCode"
                      >
                        Solve <ExternalLink size={11} />
                      </button>
                      {added ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-btn text-xs font-semibold bg-green-500/10 border border-green-500/25 text-green-600 dark:text-green-400">
                          Added ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAdd(p)}
                          disabled={addingId === p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-btn text-xs font-semibold bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-all duration-150"
                        >
                          {addingId === p.id
                            ? <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            : '+ Add'}
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-dim">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-btn bg-surface-alt border border-stroke text-ink-2 disabled:opacity-40 hover:bg-surface hover:text-ink transition-all duration-150"
          >
            <ChevronLeft size={16} />
          </button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (page <= 3) {
              pageNum = i + 1
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = page - 2 + i
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={cn(
                  'w-8 h-8 rounded-btn text-xs font-semibold transition-all duration-150',
                  pageNum === page
                    ? 'bg-brand text-[#0a1929] shadow-[0_2px_8px_rgba(0,212,170,0.30)]'
                    : 'bg-surface-alt border border-stroke text-ink-2 hover:text-ink'
                )}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-btn bg-surface-alt border border-stroke text-ink-2 disabled:opacity-40 hover:bg-surface hover:text-ink transition-all duration-150"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const selectCls = cn(
  'bg-field border-[1.5px] border-stroke rounded-btn px-3.5 py-2.5',
  'text-[15px] text-ink placeholder:text-dim cursor-pointer',
  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10',
  'transition-all duration-150'
)

export default function DSATracker() {
  const { addNotification } = useNotifications()
  const [problems, setProblems]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  // Tabs
  const [activeTab, setActiveTab]     = useState('my')     // 'my' | 'browse'
  const [subFilter, setSubFilter]     = useState('all')    // 'all' | 'completed' | 'revision'

  // My Problems filters
  const [search, setSearch]           = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [filterDiff, setFilterDiff]   = useState('')

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(BLANK)
  const [formErrors, setFormErrors]   = useState({})
  const [saving, setSaving]           = useState(false)
  const [deleteId, setDeleteId]       = useState(null)

  // Load all problems once
  useEffect(() => {
    getProblems()
      .then(r => setProblems(r.data.problems))
      .catch(() => setError('Failed to load problems.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Stats ──────────────────────────────────────────────────────
  const totalCount    = problems.length
  const doneCount     = problems.filter(p => p.isDone).length
  const pendingCount  = problems.filter(p => !p.isDone).length
  const revisionCount = problems.filter(p => p.isRevision).length

  // ── Filtered display list ──────────────────────────────────────
  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return problems.filter(p => {
      if (subFilter === 'completed' && !p.isDone)      return false
      if (subFilter === 'revision'  && !p.isRevision)  return false
      if (q && !p.problemName.toLowerCase().includes(q)) return false
      if (filterTopic && p.topic !== filterTopic)        return false
      if (filterDiff  && p.difficulty !== filterDiff)    return false
      return true
    })
  }, [problems, subFilter, search, filterTopic, filterDiff])

  // ── Optimistic toggle helpers ─────────────────────────────────
  const optimisticToggle = (id, field, apiCall) => {
    setProblems(prev => prev.map(p => p._id === id ? { ...p, [field]: !p[field] } : p))
    apiCall(id)
      .then(({ data }) => setProblems(prev => prev.map(p => p._id === id ? data.problem : p)))
      .catch(() => setProblems(prev => prev.map(p => p._id === id ? { ...p, [field]: !p[field] } : p)))
  }

  const handleToggleDone     = (id) => optimisticToggle(id, 'isDone',     toggleDone)
  const handleToggleRevision = (id) => optimisticToggle(id, 'isRevision', toggleRevision)

  // ── Add/Edit modal ────────────────────────────────────────────
  const openAdd  = () => { setEditing(null); setForm(BLANK); setFormErrors({}); setModalOpen(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ problemName: p.problemName, platform: p.platform, difficulty: p.difficulty, topic: p.topic })
    setFormErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.problemName.trim()) e.problemName = 'Problem name is required'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      if (editing) {
        const { data } = await updateProblem(editing._id, form)
        setProblems(prev => prev.map(p => p._id === editing._id ? data.problem : p))
      } else {
        const { data } = await createProblem(form)
        setProblems(prev => [data.problem, ...prev])
        addNotification(`✅ New problem added: "${form.problemName}" (${form.difficulty})`)
      }
      setModalOpen(false)
    } catch (err) {
      setFormErrors({ _server: err.response?.data?.error?.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProblem(id)
      setProblems(prev => prev.filter(p => p._id !== id))
    } catch { /* silent */ }
    setDeleteId(null)
  }

  // ── Add from Browse LeetCode ──────────────────────────────────
  const handleAddFromBrowse = async (lcProblem) => {
    const { data } = await createProblem({
      problemName: lcProblem.title,
      platform:    'LeetCode',
      difficulty:  lcProblem.difficulty,
      topic:       mapToTopic(lcProblem.tags),
    })
    setProblems(prev => [data.problem, ...prev])
    addNotification(`✅ LeetCode problem added: "${lcProblem.title}" (${lcProblem.difficulty})`)
  }

  const set = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }))

  // ── Loading / error ───────────────────────────────────────────
  if (loading) return <Loader text="Loading problems…" />
  if (error)   return <EmptyState heading="Something went wrong" text={error} />

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold text-ink tracking-[-0.025em] leading-tight">DSA Tracker</h1>
        <p className="text-[15px] text-dim mt-[5px]">Track and review your problem-solving progress</p>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-stroke rounded-full text-xs font-semibold text-ink shadow-xs">
          <span className="w-[7px] h-[7px] rounded-full bg-ink-2 inline-block" />
          {totalCount} Total
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-semibold text-green-600 dark:text-green-400">
          <span className="w-[7px] h-[7px] rounded-full bg-green-500 inline-block" />
          {doneCount} Completed
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-alt border border-stroke rounded-full text-xs font-semibold text-dim">
          <span className="w-[7px] h-[7px] rounded-full bg-dim inline-block" />
          {pendingCount} Pending
        </span>
        {revisionCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-dim border border-brand/20 rounded-full text-xs font-semibold text-brand">
            <Star size={11} className="fill-brand" /> {revisionCount} Revision
          </span>
        )}
      </div>

      {/* ── Main tabs ── */}
      <div className="flex items-center justify-between border-b border-stroke mb-6">
        <div className="flex">
          <TabBtn active={activeTab === 'my'}     onClick={() => setActiveTab('my')}>My Problems</TabBtn>
          <TabBtn active={activeTab === 'browse'} onClick={() => setActiveTab('browse')}>Browse LeetCode</TabBtn>
        </div>
        {activeTab === 'my' && (
          <Button variant="primary" size="sm" onClick={openAdd} className="mb-[1px]">
            <Plus size={14} /> Add Problem
          </Button>
        )}
      </div>

      {/* ═══════ TAB 1: MY PROBLEMS ═══════ */}
      {activeTab === 'my' && (
        <div>
          {/* Sub-filter tabs */}
          <div className="flex border-b border-stroke mb-4">
            <TabBtn sm active={subFilter === 'all'}       onClick={() => setSubFilter('all')}>All ({totalCount})</TabBtn>
            <TabBtn sm active={subFilter === 'completed'} onClick={() => setSubFilter('completed')}>Completed ({doneCount})</TabBtn>
            <TabBtn sm active={subFilter === 'revision'}  onClick={() => setSubFilter('revision')}>
              <span className="flex items-center gap-1">
                <Star size={10} className={subFilter === 'revision' ? 'fill-brand' : ''} />
                Revision ({revisionCount})
              </span>
            </TabBtn>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <Input
              id="search"
              placeholder="Search problems…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-[220px]"
            />
            <select className={cn(selectCls, 'w-[155px]')} value={filterTopic} onChange={e => setFilterTopic(e.target.value)}>
              <option value="">All Topics</option>
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className={cn(selectCls, 'w-[135px]')} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              <option value="">All Levels</option>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Problems table or empty state */}
          {displayed.length === 0 ? (
            <EmptyState
              icon={<Code2 size={48} />}
              heading={subFilter === 'completed' ? 'No completed problems yet' : subFilter === 'revision' ? 'No problems marked for revision' : 'No problems yet'}
              text={subFilter === 'all' ? 'Add your first problem or try adjusting your filters.' : undefined}
              ctaLabel={subFilter === 'all' && problems.length === 0 ? 'Add Problem' : undefined}
              onCta={subFilter === 'all' && problems.length === 0 ? openAdd : undefined}
            />
          ) : (
            <div className="bg-surface border border-stroke rounded-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Problem</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[132px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.map(p => (
                    <TableRow key={p._id}>
                      {/* Problem name — left border indicator */}
                      <TableCell className={cn(
                        'font-medium border-l-2',
                        p.isDone      ? 'border-l-green-500' :
                        p.isRevision  ? 'border-l-brand'     : 'border-l-transparent'
                      )}>
                        <div className="flex items-center gap-1.5">
                          {p.isRevision && (
                            <Star size={12} className="fill-brand text-brand shrink-0" />
                          )}
                          <span className={cn(
                            'text-ink leading-snug',
                            p.isDone && 'line-through text-dim'
                          )}>
                            {p.problemName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-alt border border-stroke text-ink-2">
                          {p.platform}
                        </span>
                      </TableCell>

                      <TableCell><DiffBadge d={p.difficulty} /></TableCell>

                      <TableCell className="text-dim text-sm">{p.topic}</TableCell>

                      <TableCell className="text-dim text-sm whitespace-nowrap">
                        {new Date(p.solvedDate).toLocaleDateString()}
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          {/* Done */}
                          <button
                            onClick={() => handleToggleDone(p._id)}
                            title={p.isDone ? 'Mark as not done' : 'Mark as done'}
                            className={cn(
                              'w-7 h-7 rounded-btn flex items-center justify-center transition-all duration-150',
                              p.isDone
                                ? 'bg-green-500/15 text-green-500 border border-green-500/30'
                                : 'bg-surface-alt border border-stroke text-dim hover:text-green-500 hover:border-green-500/30'
                            )}
                          >
                            <CheckCircle2 size={14} />
                          </button>

                          {/* Revision */}
                          <button
                            onClick={() => handleToggleRevision(p._id)}
                            title={p.isRevision ? 'Remove from revision' : 'Mark for revision'}
                            className={cn(
                              'w-7 h-7 rounded-btn flex items-center justify-center transition-all duration-150',
                              p.isRevision
                                ? 'bg-brand/15 text-brand border border-brand/30'
                                : 'bg-surface-alt border border-stroke text-dim hover:text-brand hover:border-brand/30'
                            )}
                          >
                            <Star size={14} className={p.isRevision ? 'fill-brand' : ''} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEdit(p)}
                            title="Edit"
                            className="w-7 h-7 rounded-btn flex items-center justify-center bg-surface-alt border border-stroke text-dim hover:text-ink hover:border-stroke-soft transition-all duration-150"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteId(p._id)}
                            title="Delete"
                            className="w-7 h-7 rounded-btn flex items-center justify-center bg-surface-alt border border-stroke text-dim hover:text-hazard hover:border-hazard/30 transition-all duration-150"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB 2: BROWSE LEETCODE ═══════ */}
      {activeTab === 'browse' && (
        <BrowseLeetCode myProblems={problems} onAdd={handleAddFromBrowse} />
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Problem' : 'Add Problem'}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input id="pname" label="Problem name" value={form.problemName} onChange={set('problemName')} error={formErrors.problemName} placeholder="Two Sum" />

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-ink-2">Platform</label>
            <select className={selectCls} value={form.platform} onChange={set('platform')}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-ink-2">Difficulty</label>
            <select className={selectCls} value={form.difficulty} onChange={set('difficulty')}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-ink-2">Topic</label>
            <select className={selectCls} value={form.topic} onChange={set('topic')}>
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {formErrors._server && <p className="text-hazard text-sm">{formErrors._server}</p>}

          <div className="flex gap-3 justify-end mt-1">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{editing ? 'Save changes' : 'Add problem'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirmation ── */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete problem?">
        <p className="text-dim text-[15px] mb-5">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
