import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { go } from '../App.jsx'
import { BUILD_TRACKS, BUILD_TRACK, BUILD, SIZE, RETRO, doneListOf } from '../data/builds.js'
import { colorOf, nickOf, myTracksOf } from '../lib/logic.js'
import { NODE } from '../data/roadmap.js'

const LOOP = [
  ['Pick', 'the next rung on your ladder'],
  ['Learn', 'only what this build needs'],
  ['Build', 'and log every decision'],
  ['Ship', 'when the pro checklist is green'],
  ['Teach', 'it on the next call'],
  ['Recall', 'explain it again at 7, 30, 90 days'],
]

const stateOf = (u, pid) => u?.builds?.[pid]
const count = (obj) => Object.values(obj || {}).filter(Boolean).length

export default function Build({ track, pid }) {
  const { me, crew } = useStore()
  const mine = myTracksOf(me)
  const order = [...BUILD_TRACKS.filter((t) => mine.includes(t.id)), BUILD_TRACK.flag, ...BUILD_TRACKS.filter((t) => !mine.includes(t.id) && t.id !== 'flag')]
  const tid = BUILD_TRACK[track] ? track : (BUILD[pid]?.track || order[0].id)
  const t = BUILD_TRACK[tid]
  const [open, setOpen] = useState(pid || null)
  useEffect(() => { if (pid) setOpen(pid) }, [pid])

  const myBuilds = Object.entries(me?.builds || {})
  const building = myBuilds.filter(([, b]) => b.status === 'building')
  const shipped = myBuilds.filter(([, b]) => b.status === 'shipped')
  const crewShipped = crew.reduce((a, u) => a + Object.values(u.builds || {}).filter((b) => b.status === 'shipped').length, 0)
  const ladderWeeks = (ids) => ids.reduce((a, id) => a + BUILD_TRACK[id].projects.reduce((s, p) => s + SIZE[p.size].weeks, 0), 0)
  const myWeeks = Math.round(ladderWeeks(mine.filter((id) => BUILD_TRACK[id])))

  return (
    <div className="rm bd">
      <header className="rm-top">
        <div className="rm-title">
          <h1>Build & learn</h1>
          <p className="rm-meta">{crewShipped} shipped by the crew · you: {shipped.length} shipped, {building.length} building</p>
        </div>
      </header>

      <div className="bd-wrap">
      <ol className="bd-loop">{LOOP.map(([a, b], i) => <li key={a}><span className="mono">{i + 1}</span><b>{a}</b><small>{b}</small></li>)}</ol>

      {building.length > 2 && <p className="bd-warn">You are building {building.length} things at once. Finish one before starting another — switching between projects costs more than it feels like.</p>}

      <nav className="bd-tracks" aria-label="Build tracks">
        {order.map((x) => { const n = crew.length ? x.projects.filter((p) => stateOf(me, p.id)?.status === 'shipped').length : 0; return (
          <button key={x.id} className={x.id === tid ? 'on' : ''} onClick={() => { go('build', x.id); setOpen(null) }}>
            <span>{x.glyph}</span>{x.title}<em className="mono">{n}/{x.projects.length}</em>
          </button>) })}
      </nav>

      <div className="bd-head">
        <div>
          <h2>{t.title}</h2>
          <p className="rm-meta">{t.blurb || `Seven builds, from scratch to advanced. Each one uses what the last one taught.`}</p>
        </div>
        {tid !== 'flag' && mine.includes(tid) && <p className="rm-meta bd-pace">Your full ladders ≈ <b>{myWeeks} weeks</b> at 6–7 h a day. Go deep on 1–2, take the rest to level 4.</p>}
      </div>

      <ol className="bd-ladder">
        {t.projects.map((p, i) => <Rung key={p.id} p={BUILD[p.id]} open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} last={i === t.projects.length - 1} />)}
      </ol>
      </div>
    </div>
  )
}

function CrewDots({ pid }) {
  const { crew } = useStore()
  return <span className="bd-dots">{crew.map((u) => { const s = stateOf(u, pid)?.status; return (
    <i key={u.id} title={`${nickOf(u)}: ${s || 'not started'}`} className={s || ''} style={{ '--c': colorOf(u) }} />) })}</span>
}

function Rung({ p, open, onToggle }) {
  const { me } = useStore()
  const st = stateOf(me, p.id)
  const steps = count(st?.steps)
  return (
    <li className={'bd-rung' + (open ? ' open' : '') + (st?.status ? ' ' + st.status : '')}>
      <button className="bd-rung-main" onClick={onToggle} aria-expanded={open}>
        <span className="bd-lvl mono">{p.track === 'flag' ? '★' : 'L' + p.level}</span>
        <span className="bd-rung-text">
          <b>{p.title}</b>
          <small>{p.pitch}</small>
        </span>
        <span className="bd-rung-side">
          <span className={'bd-size s-' + p.size} title={SIZE[p.size].hint}>{SIZE[p.size].label}</span>
          {st?.status === 'shipped' ? <span className="bd-state ship">Shipped</span> : st?.status === 'building' ? <span className="bd-state">{steps}/{p.steps.length}</span> : null}
          <CrewDots pid={p.id} />
        </span>
      </button>
      {open && <Detail p={p} st={st} />}
    </li>
  )
}

function Detail({ p, st }) {
  const { me, crew, api } = useStore()
  const done = doneListOf(p)
  const [draft, setDraft] = useState({ repo: st?.repo || '', demo: st?.demo || '', notes: st?.notes || '', ...Object.fromEntries(RETRO.map(([k]) => [k, st?.retro?.[k] || ''])) })
  useEffect(() => { setDraft({ repo: st?.repo || '', demo: st?.demo || '', notes: st?.notes || '', ...Object.fromEntries(RETRO.map(([k]) => [k, st?.retro?.[k] || ''])) }) }, [p.id]) // eslint-disable-line
  const save = (k, v) => api.buildSet(p.id, { [k]: v })
  const saveRetro = (k, v) => api.buildSet(p.id, { ['retro.' + k]: v })
  const retroDone = RETRO.every(([k]) => (st?.retro?.[k] || '').trim().length > 10)
  const proDone = count(st?.pro)
  const others = crew.filter((u) => u.id !== me.id && stateOf(u, p.id)?.status)
  const status = st?.status

  return (
    <div className="bd-detail">
      {p.team && <p className="bd-team"><b>Who does what:</b> {p.team}</p>}
      <div className="bd-chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>

      <div className="bd-grid">
        <section>
          <h4>Learn while you build</h4>
          <ul className="bd-learn">{p.learn.filter((id) => NODE[id]).map((id) => (
            <li key={id}><a href={`#roadmap/${NODE[id].track}/${id}`}>{NODE[id].title} →</a></li>))}</ul>
          <h4>Think like a senior</h4>
          <ul className="bd-senior">{p.senior.map((q) => <li key={q}>{q}</li>)}</ul>
          <p className="bd-done"><b>Done when:</b> {p.done}</p>
        </section>

        <section>
          <h4>Milestones {status && <span className="mono dim">{count(st?.steps)}/{p.steps.length}</span>}</h4>
          <ul className="bd-checks">{p.steps.map((s, i) => (
            <li key={i}><label className={st?.steps?.[i] ? 'on' : ''}>
              <input type="checkbox" checked={!!st?.steps?.[i]} disabled={!status} onChange={(e) => api.buildTick(p.id, 'steps.' + i, e.target.checked)} />
              <span>{s}</span></label></li>))}</ul>
          {!status && <button className="rm-btn solid" onClick={() => api.buildStart(p.id)}>Start building</button>}
        </section>
      </div>

      {status && <>
        <section className="bd-block">
          <h4>Pro checklist <span className="mono dim">{proDone}/{done.length}</span></h4>
          <ul className="bd-checks">{done.map((s, i) => (
            <li key={i}><label className={st?.pro?.[i] ? 'on' : ''}>
              <input type="checkbox" checked={!!st?.pro?.[i]} onChange={(e) => api.buildTick(p.id, 'pro.' + i, e.target.checked)} />
              <span>{s}</span></label></li>))}</ul>
        </section>

        <section className="bd-block bd-form">
          <div className="bd-links">
            <label>Repo<input value={draft.repo} onChange={(e) => setDraft({ ...draft, repo: e.target.value })} onBlur={() => save('repo', draft.repo.trim())} placeholder="https://github.com/…" /></label>
            <label>Demo<input value={draft.demo} onChange={(e) => setDraft({ ...draft, demo: e.target.value })} onBlur={() => save('demo', draft.demo.trim())} placeholder="Live link or video" /></label>
          </div>
          <label>Decision log
            <textarea rows={4} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} onBlur={() => save('notes', draft.notes)}
              placeholder={'Chose Postgres over Mongo: orders need transactions.\nSwitched to cursor pagination — offset got slow past 100k rows.'} />
          </label>
          <h4>Retro <span className="rm-meta">— writing it is what makes it stick</span></h4>
          {RETRO.map(([k, l]) => (
            <label key={k}>{l}<textarea rows={2} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} onBlur={() => saveRetro(k, draft[k].trim())} /></label>))}
        </section>

        <div className="bd-actions">
          {status === 'building' ? <>
            <button className="rm-btn solid" disabled={!retroDone} onClick={() => api.buildShip(p.id, p.title)}>Ship it</button>
            <span className="rm-meta">{retroDone ? (proDone < done.length ? `${done.length - proDone} pro items still open — ship anyway if you must.` : 'Everything green.') : 'Write the retro to ship.'}</span>
            <button className="rm-btn ghost" onClick={() => api.buildDrop(p.id)}>Drop</button>
          </> : <>
            <span className="bd-state ship">Shipped {new Date(st.shipped).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
            <button className="rm-btn" onClick={() => api.buildSet(p.id, { status: 'building' })}>Reopen</button>
          </>}
        </div>
      </>}

      {!!others.length && (
        <section className="bd-block">
          <h4>How the others did it</h4>
          {others.map((u) => { const o = stateOf(u, p.id); return (
            <div key={u.id} className="bd-other" style={{ '--c': colorOf(u) }}>
              <div className="row"><span className="rm-dot" style={{ background: colorOf(u) }} /><b>{nickOf(u)}</b>
                <span className="rm-meta">{o.status === 'shipped' ? 'shipped' : `building · ${count(o.steps)}/${p.steps.length}`}</span>
                {o.repo && <a href={o.repo} target="_blank" rel="noreferrer">repo ↗</a>}{o.demo && <a href={o.demo} target="_blank" rel="noreferrer">demo ↗</a>}</div>
              {o.notes && <p className="bd-quote">{o.notes}</p>}
              {RETRO.filter(([k]) => o.retro?.[k]).map(([k, l]) => <p key={k} className="bd-quote"><small>{l}</small>{o.retro[k]}</p>)}
            </div>) })}
        </section>)}
    </div>
  )
}
