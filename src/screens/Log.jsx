import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { DEL, uid8 } from '../lib/backend.js'
import { colorOf, nickOf, timeAgo, today, addDays } from '../lib/logic.js'
import { Avatar } from '../ui.jsx'

// ─────────────────────────────────────────────────────────────
//  Learning log — what each of us learnt, in our own words,
//  and what we'll teach each other on the next call or meet-up.
//  logs/{uid}_{day}: { uid, day, studied[], summary, confused, teach{}, comments{} }
// ─────────────────────────────────────────────────────────────

const dayLabel = (d) => d === today() ? 'Today' : d === addDays(today(), -1) ? 'Yesterday'
  : new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })

export function useLogs() {
  const { be } = useStore()
  const [logs, setLogs] = useState([])
  useEffect(() => be.watchCol('logs', setLogs, { orderBy: 'updatedAt', desc: true, limit: 200 }), [be])
  return logs
}
export function useTeam() {
  const { be } = useStore()
  const [team, setTeam] = useState(null)
  useEffect(() => be.watchDoc('meta/team', setTeam), [be])
  return team
}

export default function Log() {
  const logs = useLogs()
  const team = useTeam()
  const [tab, setTab] = useState('write')
  const pending = logs.flatMap((l) => Object.entries(l.teach || {}).filter(([, t]) => !t.done).map(([id]) => id)).length
  return (
    <div className="rm lg">
      <header className="rm-top">
        <div className="rm-title">
          <h1>Learning log</h1>
          <p className="rm-meta">What we learnt, in our own words — and what we'll teach each other next.</p>
        </div>
        <NextCall team={team} />
      </header>
      <div className="lg-wrap">
        <div className="ds-tabs">
          {[['write', "Today's entry"], ['feed', 'Crew log'], ['agenda', `Call agenda${pending ? ` (${pending})` : ''}`]].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>))}
        </div>
        {tab === 'write' && <Editor logs={logs} onDone={() => setTab('feed')} />}
        {tab === 'feed' && <Feed logs={logs} />}
        {tab === 'agenda' && <Agenda logs={logs} team={team} />}
      </div>
    </div>
  )
}

function NextCall({ team }) {
  const { be } = useStore()
  const [edit, setEdit] = useState(false)
  const nc = team?.nextCall
  const [at, setAt] = useState('')
  const [mode, setMode] = useState('call')
  useEffect(() => { setAt(nc?.at || ''); setMode(nc?.mode || 'call') }, [nc?.at, nc?.mode])
  const label = nc?.at ? new Date(nc.at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'not set'
  if (edit) return (
    <div className="lg-call edit">
      <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
      <div className="rm-seg"><button className={mode === 'call' ? 'on' : ''} onClick={() => setMode('call')}>Call</button><button className={mode === 'meet' ? 'on' : ''} onClick={() => setMode('meet')}>Meet</button></div>
      <button className="rm-btn solid" onClick={() => { be.setDoc('meta/team', { nextCall: { at, mode } }); setEdit(false) }}>Save</button>
    </div>)
  return (
    <button className="lg-call" onClick={() => setEdit(true)} title="Change the next call">
      <span className="rm-sub">Next {nc?.mode === 'meet' ? 'meet-up' : 'call'}</span><b>{label}</b>
    </button>
  )
}

// concepts I ticked today, grouped by topic — the honest starting point for a log
function useTodaysTopics() {
  const { me, rm } = useStore()
  return useMemo(() => {
    const start = new Date(today() + 'T00:00').getTime()
    const counts = {}
    for (const [k, ts] of Object.entries(me?.progress || {})) {
      if (ts < start) continue
      const nodeId = k.split('__')[0]
      if (rm.NODE[nodeId]) counts[nodeId] = (counts[nodeId] || 0) + 1
    }
    return Object.entries(counts).map(([nodeId, n]) => ({ nodeId, title: rm.NODE[nodeId].title, n }))
  }, [me?.progress, rm])
}

function Editor({ logs, onDone }) {
  const { be, me, api } = useStore()
  const id = `${me.id}_${today()}`
  const existing = logs.find((l) => l.id === id)
  const suggested = useTodaysTopics()
  const [studied, setStudied] = useState([])
  const [summary, setSummary] = useState('')
  const [confused, setConfused] = useState('')
  const [teach, setTeach] = useState({})
  const [extra, setExtra] = useState('')
  const [saved, setSaved] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    if (existing) {
      setStudied(existing.studied || []); setSummary(existing.summary || ''); setConfused(existing.confused || '')
      setTeach(Object.fromEntries(Object.entries(existing.teach || {}).map(([k, t]) => [t.key || k, true])))
      setLoaded(true)
    } else if (logs.length || suggested.length) {
      setStudied(suggested.map((s) => ({ key: s.nodeId, nodeId: s.nodeId, title: s.title })))
      setLoaded(true)
    }
  }, [existing, suggested.length, logs.length])

  const toggleStudied = (item) => setStudied((xs) => xs.some((x) => x.key === item.key) ? xs.filter((x) => x.key !== item.key) : [...xs, item])
  const addExtra = () => { const t = extra.trim(); if (!t) return; toggleStudied({ key: 'x-' + uid8(), title: t }); setExtra('') }

  const save = async () => {
    const teachMap = {}
    for (const st of studied) if (teach[st.key]) {
      const prev = Object.entries(existing?.teach || {}).find(([, t]) => t.key === st.key)
      teachMap[prev ? prev[0] : 't' + uid8()] = prev ? prev[1] : { key: st.key, title: st.title, nodeId: st.nodeId || null, done: false }
    }
    await be.setDoc('logs/' + id, { uid: me.id, day: today(), studied, summary: summary.trim(), confused: confused.trim(), updatedAt: Date.now(), createdAt: existing?.createdAt || Date.now() })
    await be.updateDoc('logs/' + id, { teach: teachMap })
    if (!existing) api.logActivity(1)
    setSaved(Date.now())
  }
  const allTopics = [...suggested.map((s) => ({ key: s.nodeId, nodeId: s.nodeId, title: s.title, n: s.n })),
    ...studied.filter((x) => !suggested.some((s) => s.nodeId === x.key))]

  return (
    <div className="lg-editor">
      <section className="lg-block">
        <div className="lg-step">1</div>
        <div>
          <h3>What did you study today?</h3>
          <p className="rm-meta">{suggested.length ? 'Picked up from the concepts you ticked today. Tap to include or leave out.' : 'Tick concepts in the roadmap and they appear here — or add a topic yourself.'}</p>
          <div className="lg-chips">
            {allTopics.map((t) => { const on = studied.some((x) => x.key === t.key); return (
              <button key={t.key} className={'lg-chip' + (on ? ' on' : '')} onClick={() => toggleStudied(t)}>{on ? '✓ ' : ''}{t.title}{t.n ? <em>{t.n}</em> : null}</button>) })}
          </div>
          <div className="lg-add"><input value={extra} onChange={(e) => setExtra(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addExtra()} placeholder="Add something else you studied" /><button className="rm-btn" onClick={addExtra}>Add</button></div>
        </div>
      </section>

      <section className="lg-block">
        <div className="lg-step">2</div>
        <div>
          <h3>Explain it in your own words</h3>
          <p className="rm-meta">Write it as if you're teaching the other two. If you can't explain it simply, that's the part to revise.</p>
          <textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Today I learnt that…" />
        </div>
      </section>

      <section className="lg-block">
        <div className="lg-step">3</div>
        <div>
          <h3>What's still unclear?</h3>
          <p className="rm-meta">These become questions on the call agenda.</p>
          <textarea rows={3} value={confused} onChange={(e) => setConfused(e.target.value)} placeholder="I don't get why…" />
        </div>
      </section>

      <section className="lg-block">
        <div className="lg-step">4</div>
        <div>
          <h3>What will you teach on the next call?</h3>
          <p className="rm-meta">Pick topics you'll explain to the others. They land on the shared agenda.</p>
          {studied.length ? <div className="lg-chips">{studied.map((st) => (
            <button key={st.key} className={'lg-chip teach' + (teach[st.key] ? ' on' : '')} onClick={() => setTeach({ ...teach, [st.key]: !teach[st.key] })}>{teach[st.key] ? '✓ ' : ''}I'll explain {st.title}</button>))}</div>
            : <p className="rm-empty">Pick what you studied in step 1 first.</p>}
        </div>
      </section>

      <div className="lg-save">
        <button className="rm-btn solid" disabled={!studied.length && !summary.trim()} onClick={save}>{existing ? 'Update today’s entry' : 'Save today’s entry'}</button>
        {saved && <span className="rm-saved">saved</span>}
        {saved && <button className="rm-btn" onClick={onDone}>See the crew log →</button>}
      </div>
    </div>
  )
}

function Entry({ l }) {
  const { be, me, users, rm } = useStore()
  const [reply, setReply] = useState('')
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  const u = byId[l.uid]
  const comments = Object.entries(l.comments || {}).map(([id, c]) => ({ id, ...c })).sort((a, b) => a.at - b.at)
  const send = () => { const t = reply.trim(); if (!t) return; be.updateDoc('logs/' + l.id, { ['comments.c' + uid8()]: { uid: me.id, text: t, at: Date.now() } }); setReply('') }
  return (
    <article className="lg-entry" style={{ '--c': colorOf(u) }}>
      <header><Avatar u={u} size={36} /><div><b>{nickOf(u)}</b><small>{dayLabel(l.day)} · updated {timeAgo(l.updatedAt)} ago</small></div></header>
      {!!l.studied?.length && <div className="lg-chips static">{l.studied.map((s) => s.nodeId
        ? <a key={s.key} className="lg-chip on" href={`#roadmap/${rm.NODE[s.nodeId]?.track || ''}/${s.nodeId}`}>{s.title}</a>
        : <span key={s.key} className="lg-chip on">{s.title}</span>)}</div>}
      {l.summary && <p className="lg-summary">{l.summary}</p>}
      {l.confused && <div className="lg-q"><span className="rm-sub">Still unclear</span><p>{l.confused}</p></div>}
      {!!Object.keys(l.teach || {}).length && <div className="lg-teach">{Object.values(l.teach).map((t) => <span key={t.key} className={'lg-tag' + (t.done ? ' done' : '')}>{t.done ? '✓ explained' : 'will explain'} · {t.title}</span>)}</div>}
      <div className="lg-comments">
        {comments.map((c) => <div key={c.id} className="lg-comment"><span className="rm-dot" style={{ background: colorOf(byId[c.uid]) }} /><p><b>{nickOf(byId[c.uid])}</b> {c.text}</p>
          {c.uid === me.id && <button className="lg-x" onClick={() => be.updateDoc('logs/' + l.id, { ['comments.' + c.id]: DEL })} aria-label="Delete">×</button>}</div>)}
        <div className="lg-reply"><input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask a question or add something" /><button className="rm-btn" onClick={send}>Reply</button></div>
      </div>
    </article>
  )
}

function Feed({ logs }) {
  const { crew } = useStore()
  const [who, setWho] = useState('all')
  const shown = logs.filter((l) => who === 'all' || l.uid === who).sort((a, b) => (b.day + b.updatedAt).localeCompare(a.day + a.updatedAt))
  const days = [...new Set(shown.map((l) => l.day))].sort().reverse()
  const streakDays = (uid) => new Set(logs.filter((l) => l.uid === uid).map((l) => l.day)).size
  return (
    <div className="lg-feed">
      <div className="lg-feed-top">
        <div className="rm-filters">
          <button className={who === 'all' ? 'on' : ''} onClick={() => setWho('all')}>Everyone</button>
          {crew.map((u) => <button key={u.id} className={who === u.id ? 'on' : ''} onClick={() => setWho(u.id)}>{nickOf(u)} <span>{streakDays(u.id)}</span></button>)}
        </div>
      </div>
      {days.map((d) => (
        <section key={d} className="lg-day">
          <div className="rm-level-label"><span>{dayLabel(d)}</span></div>
          <div className="lg-day-grid">{shown.filter((l) => l.day === d).map((l) => <Entry key={l.id} l={l} />)}</div>
        </section>))}
      {!days.length && <p className="rm-empty">No entries yet. Write the first one in “Today's entry”.</p>}
    </div>
  )
}

function Agenda({ logs, team }) {
  const { be, me, users } = useStore()
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  const since = addDays(today(), -14)
  const items = logs.flatMap((l) => Object.entries(l.teach || {}).map(([tid, t]) => ({ ...t, tid, log: l })))
  const open = items.filter((t) => !t.done).sort((a, b) => a.log.day.localeCompare(b.log.day))
  const doneRecent = items.filter((t) => t.done && t.log.day >= since).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0))
  const questions = logs.filter((l) => l.confused && l.day >= since).sort((a, b) => b.day.localeCompare(a.day))
  const mark = (t, done) => be.updateDoc('logs/' + t.log.id, { [`teach.${t.tid}.done`]: done, [`teach.${t.tid}.doneAt`]: done ? Date.now() : DEL, [`teach.${t.tid}.doneBy`]: done ? me.id : DEL })
  return (
    <div className="lg-agenda">
      <section>
        <div className="rm-level-label"><span>To explain</span><em>{open.length}</em></div>
        <p className="rm-meta">Each person explains their topic in a few minutes; the others ask questions. Tick it when it's been taught.</p>
        {open.map((t) => (
          <div key={t.log.id + t.tid} className="lg-item">
            <span className="rm-dot" style={{ background: colorOf(byId[t.log.uid]) }} />
            <div><b>{t.title}</b><small>{nickOf(byId[t.log.uid])} explains · studied {dayLabel(t.log.day).toLowerCase()}</small></div>
            <button className="rm-btn" onClick={() => mark(t, true)}>Explained ✓</button>
          </div>))}
        {!open.length && <p className="rm-empty">Nothing on the agenda yet. Pick topics to teach in your daily entry.</p>}
      </section>
      <section>
        <div className="rm-level-label"><span>Questions for the crew</span><em>{questions.length}</em></div>
        {questions.map((l) => (
          <div key={l.id} className="lg-item q">
            <span className="rm-dot" style={{ background: colorOf(byId[l.uid]) }} />
            <div><p>{l.confused}</p><small>{nickOf(byId[l.uid])} · {dayLabel(l.day).toLowerCase()}</small></div>
          </div>))}
        {!questions.length && <p className="rm-empty">No open questions.</p>}
      </section>
      {!!doneRecent.length && (
        <section>
          <div className="rm-level-label"><span>Explained recently</span><em>{doneRecent.length}</em></div>
          {doneRecent.map((t) => (
            <div key={t.log.id + t.tid} className="lg-item done">
              <span className="rm-dot" style={{ background: colorOf(byId[t.log.uid]) }} />
              <div><b>{t.title}</b><small>{nickOf(byId[t.log.uid])} explained it{t.doneAt ? ` · ${timeAgo(t.doneAt)} ago` : ''}</small></div>
              <button className="rm-btn" onClick={() => mark(t, false)}>Undo</button>
            </div>))}
        </section>)}
    </div>
  )
}
