import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { PRONTOPY_URL } from '../config.js'
import { colorOf, nickOf, initial, timeAgo, today, addDays } from '../lib/logic.js'
import { slug } from '../data/roadmap.js'

const DIFF = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const PLATFORMS = [
  [/leetcode\.com/i, 'LeetCode'], [/prontopy|pythondsa|python-dsa-sigma/i, 'ProntoPy'], [/geeksforgeeks/i, 'GfG'],
  [/hackerrank/i, 'HackerRank'], [/codeforces/i, 'Codeforces'], [/neetcode/i, 'NeetCode'], [/codechef/i, 'CodeChef'],
]
const titleCase = (s) => s.split('-').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')

// "https://leetcode.com/problems/two-sum/description/" → { title: 'Two Sum', slug: 'two-sum', platform: 'LeetCode', url }
export function parseProblem(input) {
  const raw = input.trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) {
    let platform = 'Other'
    for (const [re, name] of PLATFORMS) if (re.test(raw)) platform = name
    let key = ''
    try {
      const u = new URL(raw)
      const parts = u.pathname.split('/').filter(Boolean)
      const i = parts.findIndex((p) => ['problems', 'problem', 'challenges'].includes(p))
      key = (i >= 0 ? parts[i + 1] : parts[parts.length - 1]) || u.hostname
    } catch { key = raw }
    key = slug(decodeURIComponent(key))
    return { title: titleCase(key), slug: key, platform, url: raw }
  }
  return { title: raw, slug: slug(raw), platform: 'Other', url: '' }
}

export default function Dsa() {
  const { be, me, crew, rm, api } = useStore()
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState('all')
  const [who, setWho] = useState('all')
  const [diff, setDiff] = useState('all')
  const [q, setQ] = useState('')
  useEffect(() => be.watchCol('problems', setRows, { orderBy: 'at', desc: true, limit: 1500 }), [be])

  const patterns = rm.TRACK.dsa?.nodes || []
  const patName = Object.fromEntries(patterns.map((p) => [p.id, p.title]))

  // group every log by problem, so a problem solved by all three shows once
  const groups = useMemo(() => {
    const m = new Map()
    for (const r of rows) {
      const k = r.slug || slug(r.title)
      if (!m.has(k)) m.set(k, { slug: k, title: r.title, url: r.url, platform: r.platform, difficulty: r.difficulty, pattern: r.pattern, logs: [], last: 0 })
      const g = m.get(k); g.logs.push(r); g.last = Math.max(g.last, r.at)
      if (!g.url && r.url) g.url = r.url
    }
    return [...m.values()].sort((a, b) => b.last - a.last)
  }, [rows])

  const weekAgo = Date.now() - 7 * 864e5
  const per = (u) => { const mine = rows.filter((r) => r.uid === u.id); const uniq = new Map(mine.map((r) => [r.slug, r]));
    const c = { total: uniq.size, easy: 0, medium: 0, hard: 0, week: mine.filter((r) => r.at > weekAgo).length, revisit: mine.filter((r) => r.status === 'revisit').length }
    uniq.forEach((r) => { if (c[r.difficulty] !== undefined) c[r.difficulty]++ }); return c }

  const shown = groups.filter((g) => (who === 'all' || g.logs.some((l) => l.uid === who)) && (diff === 'all' || g.difficulty === diff)
    && (!q || g.title.toLowerCase().includes(q.toLowerCase()) || (patName[g.pattern] || '').toLowerCase().includes(q.toLowerCase())))
  const myRevisit = rows.filter((r) => r.uid === me.id && r.status === 'revisit')

  return (
    <div className="rm ds">
      <header className="rm-top">
        <div className="rm-title">
          <h1>DSA log</h1>
          <p className="rm-meta">{groups.length} problems solved by the crew · you: {per(me).total} · 2 hours a day, every day</p>
        </div>
        <div className="rm-controls">
          <a className="rm-btn" href={PRONTOPY_URL} target="_blank" rel="noreferrer">Open ProntoPy ↗</a>
          <a className="rm-btn" href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer">Open LeetCode ↗</a>
        </div>
      </header>

      <div className="ds-wrap">
        <AddProblem patterns={patterns} onAdd={api.logProblem} existing={groups} />

        <section className="ds-crew">
          {crew.map((u) => { const c = per(u); const t = Math.max(1, c.easy + c.medium + c.hard); return (
            <button key={u.id} className={'ds-person' + (who === u.id ? ' on' : '')} onClick={() => { setWho(who === u.id ? 'all' : u.id); setTab('all') }}>
              <div className="ds-person-top"><span className="rm-dot" style={{ background: colorOf(u) }} /><b>{nickOf(u)}</b><em>{c.week} this week</em></div>
              <div className="ds-big">{c.total}<small>solved</small></div>
              <div className="ds-split"><i className="e" style={{ flex: c.easy / t }} /><i className="m" style={{ flex: c.medium / t }} /><i className="h" style={{ flex: c.hard / t }} /></div>
              <div className="ds-legend"><span className="e">{c.easy} easy</span><span className="m">{c.medium} medium</span><span className="h">{c.hard} hard</span></div>
            </button>) })}
        </section>

        <div className="ds-tabs">
          {[['all', 'All problems'], ['patterns', 'Pattern coverage'], ['revisit', `My revisit list (${myRevisit.length})`]].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>))}
        </div>

        {tab === 'all' && (<>
          <div className="ds-filters">
            <div className="rm-filters">
              <button className={who === 'all' ? 'on' : ''} onClick={() => setWho('all')}>Everyone</button>
              {crew.map((u) => <button key={u.id} className={who === u.id ? 'on' : ''} onClick={() => setWho(u.id)}>{nickOf(u)}</button>)}
            </div>
            <div className="rm-filters">
              {['all', 'easy', 'medium', 'hard'].map((d) => <button key={d} className={diff === d ? 'on' : ''} onClick={() => setDiff(d)}>{d === 'all' ? 'Any difficulty' : DIFF[d]}</button>)}
            </div>
            <input className="rm-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems or patterns" />
          </div>
          <div className="ds-list">
            {shown.map((g) => <ProblemRow key={g.slug} g={g} patName={patName} />)}
            {!shown.length && <p className="rm-empty">No problems logged yet{who !== 'all' || diff !== 'all' || q ? ' with these filters' : ''}. Solve one and paste its link above.</p>}
          </div>
        </>)}

        {tab === 'patterns' && <Coverage patterns={patterns} rows={rows} crew={crew} />}

        {tab === 'revisit' && (
          <div className="ds-list">
            <p className="rm-meta">Problems you marked to solve again. Clear them once you can do them without help.</p>
            {myRevisit.map((r) => { const g = groups.find((x) => x.slug === r.slug); return g ? <ProblemRow key={r.id} g={g} patName={patName} /> : null })}
            {!myRevisit.length && <p className="rm-empty">Nothing to revisit. Nice.</p>}
          </div>)}
      </div>
    </div>
  )
}

function AddProblem({ patterns, onAdd, existing }) {
  const [input, setInput] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [pattern, setPattern] = useState('')
  const [status, setStatus] = useState('solved')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const p = parseProblem(input)
  const seen = p && existing.find((g) => g.slug === p.slug)
  useEffect(() => { if (seen) { if (seen.difficulty) setDifficulty(seen.difficulty); if (seen.pattern) setPattern(seen.pattern) } }, [seen?.slug])
  const add = async (e) => {
    e.preventDefault(); if (!p) return
    setBusy(true)
    await onAdd({ ...p, title: seen?.title || p.title, difficulty, pattern, status, note: note.trim() })
    setInput(''); setNote(''); setStatus('solved'); setBusy(false)
  }
  return (
    <form className="ds-add" onSubmit={add}>
      <div className="ds-add-main">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste a LeetCode / ProntoPy link, or type the problem name" />
        <button className="rm-btn solid" disabled={!p || busy}>{busy ? 'Saving…' : 'Log problem'}</button>
      </div>
      {p && (
        <div className="ds-add-more">
          <p className="rm-meta">→ <b>{seen?.title || p.title}</b> · {p.platform}{seen ? ` · already solved by ${seen.logs.length} of the crew` : ''}</p>
          <div className="ds-add-row">
            <div className="rm-seg">{Object.entries(DIFF).map(([k, l]) => <button type="button" key={k} className={difficulty === k ? 'on' : ''} onClick={() => setDifficulty(k)}>{l}</button>)}</div>
            <select value={pattern} onChange={(e) => setPattern(e.target.value)} className="ds-select">
              <option value="">Pattern…</option>
              {patterns.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
            </select>
            <div className="rm-seg">
              <button type="button" className={status === 'solved' ? 'on' : ''} onClick={() => setStatus('solved')}>Solved</button>
              <button type="button" className={status === 'revisit' ? 'on' : ''} onClick={() => setStatus('revisit')}>Revisit later</button>
            </div>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Short note: the key idea, the trick, what tripped you up" maxLength={280} />
        </div>)}
    </form>
  )
}

function ProblemRow({ g, patName }) {
  const { me, crew, users, api } = useStore()
  const [open, setOpen] = useState(false)
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  const mine = g.logs.find((l) => l.uid === me.id)
  const solvers = [...new Map(g.logs.map((l) => [l.uid, l])).values()]
  return (
    <div className={'rm-row ds-row' + (open ? ' open' : '')}>
      <button className="ds-row-main" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="ds-title"><b>{g.title}</b><span className="rm-tags"><em>{g.platform}</em>{g.pattern && patName[g.pattern] && <em>{patName[g.pattern]}</em>}{mine?.status === 'revisit' && <em className="tag-edit">revisit</em>}</span></span>
        <span className={'ds-diff ' + g.difficulty}>{DIFF[g.difficulty] || '—'}</span>
        <span className="ds-solvers">{crew.map((u) => { const did = solvers.some((l) => l.uid === u.id); return <i key={u.id} className={did ? 'did' : ''} style={{ '--c': colorOf(u) }} title={`${nickOf(u)}${did ? ' solved it' : ' not yet'}`}>{initial(u)}</i> })}</span>
        <span className="rm-num">{timeAgo(g.last)}</span>
        <span className="rm-chev" aria-hidden>{open ? '–' : '+'}</span>
      </button>
      {open && (
        <div className="ds-detail">
          {g.url && <a className="ds-link" href={g.url} target="_blank" rel="noreferrer">Open problem ↗</a>}
          {solvers.map((l) => <NoteLine key={l.id} l={l} u={byId[l.uid]} mine={l.uid === me.id} api={api} />)}
        </div>)}
    </div>
  )
}

function NoteLine({ l, u, mine, api }) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(l.note || '')
  return (
    <div className="ds-note">
      <span className="rm-dot" style={{ background: colorOf(u) }} />
      <div>
        <div className="ds-note-head"><b>{nickOf(u)}</b><small>{timeAgo(l.at)} ago · {l.status === 'revisit' ? 'wants to revisit' : 'solved'}</small></div>
        {edit ? (
          <div className="ds-note-edit"><input value={v} onChange={(e) => setV(e.target.value)} maxLength={280} autoFocus />
            <button className="rm-btn solid" onClick={() => { api.updateProblem(l.id, { note: v.trim() }); setEdit(false) }}>Save</button></div>
        ) : <p>{l.note || <span className="rm-empty">No note.</span>}</p>}
        {mine && !edit && (
          <div className="rm-actions">
            <button className="rm-btn" onClick={() => setEdit(true)}>Edit note</button>
            <button className="rm-btn" onClick={() => api.updateProblem(l.id, { status: l.status === 'revisit' ? 'solved' : 'revisit' })}>{l.status === 'revisit' ? 'Mark solved' : 'Revisit later'}</button>
            <button className="rm-btn danger" onClick={() => confirm('Remove this log?') && api.deleteProblem(l.id)}>Remove</button>
          </div>)}
      </div>
    </div>
  )
}

function Coverage({ patterns, rows, crew }) {
  const count = (uid, pid) => new Set(rows.filter((r) => r.uid === uid && r.pattern === pid).map((r) => r.slug)).size
  return (
    <div className="ds-cov">
      <p className="rm-meta">How many different problems each of you has solved per pattern. Empty cells are your blind spots.</p>
      <table>
        <thead><tr><th>Pattern</th>{crew.map((u) => <th key={u.id}><span className="rm-dot" style={{ background: colorOf(u) }} /> {nickOf(u)}</th>)}</tr></thead>
        <tbody>
          {patterns.map((p) => (
            <tr key={p.id}><td>{p.title}</td>{crew.map((u) => { const n = count(u.id, p.id); return <td key={u.id} className={n ? 'has' : 'zero'}>{n || '·'}</td> })}</tr>))}
        </tbody>
      </table>
    </div>
  )
}
