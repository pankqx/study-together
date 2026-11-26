import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { nodeProgress, conceptId, trackProgress, cText } from '../data/roadmap.js'
import { PRONTOPY_URL } from '../config.js'
import { stats, rank, nextUp, colorOf, nickOf, today, addDays, myTracksOf, streakInfo } from '../lib/logic.js'
import { Avatar, Bar, Check } from '../ui.jsx'
import { Echo } from '../art.jsx'
import { useLogs, useTeam } from './Log.jsx'
import { BUILD } from '../data/builds.js'
import { personalBoardId, useEnsurePersonalBoards } from '../lib/boards.js'

const hello = () => { const h = new Date().getHours(); return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export default function Today() {
  const { me, crew, posts, api, rm, theme, setTheme } = useStore()
  const s = stats(me, posts, rm)
  const r = rank(s.xp)
  const dsaToday = !!me?.dsa?.[today()]

  return (
    <div className="page today">
      <div className="today-bar">
        <span className="today-brand">study<em>/</em>together</span>
        <span className="flame" title="Your streak"><b>{s.streak}</b> day streak</span>
        <button className={'theme-toggle' + (theme === 'ink' ? ' dark' : '')} onClick={() => setTheme(theme === 'ink' ? 'sky' : 'ink')} aria-label={theme === 'ink' ? 'Switch to light' : 'Switch to dark'} title={theme === 'ink' ? 'Light mode' : 'Dark mode'}><i>{theme === 'ink' ? '☾' : '☀'}</i></button>
        <button className="me-btn" onClick={() => window.dispatchEvent(new Event('st:profile'))} title="Your profile" aria-label="Your profile"><Avatar u={me} size={40} /></button>
      </div>
      <section className="hero">
        <Echo text={nickOf(me)} rows={3} className="small" />
        <div className="hero-meta">
          <div>
            <p className="mono eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1>{hello()}.</h1>
            <p className="sub">{s.todayCount ? `${s.todayCount} thing${s.todayCount > 1 ? 's' : ''} done today. Keep the chain alive.` : 'Nothing ticked yet today. One checkbox keeps the streak.'}</p>
          </div>
          <div className="hero-stats">
            <div className="big-stat"><b>{s.streak}</b><span>day streak 🔥{streakInfo(me?.activity).restUsed ? ' · rest day used' : ''}</span></div>
            <div className="big-stat"><b>{s.ticks}</b><span>concepts</span></div>
            <div className="big-stat rank"><b>{r.title}</b><span>{s.xp} xp{r.next ? ` · ${r.next[0] - s.xp} to ${r.next[1]}` : ''}</span>
              {r.next && <Bar pct={(s.xp - r.at) / (r.next[0] - r.at)} color={colorOf(me)} h={6} />}</div>
          </div>
        </div>
      </section>

      <section className="card dsa-card">
        <div className="dsa-l">
          <span className="tag ink">mandatory · 2 hrs</span>
          <h2>DSA in Python</h2>
          <p>Practise on ProntoPy or LeetCode first, then everything else. Log what you solve in the DSA tab.</p>
          <div className="row">
            <a className="btn" href={PRONTOPY_URL} target="_blank" rel="noreferrer">ProntoPy ↗</a>
            <a className="btn" href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer">LeetCode ↗</a>
            <Check on={dsaToday} onChange={api.toggleDSA} color={colorOf(me)}>Done for today</Check>
          </div>
        </div>
        <div className="dsa-r">
          {crew.map((u) => <div key={u.id} className={'dsa-who' + (u.dsa?.[today()] ? ' done' : '')} style={{ '--c': colorOf(u) }}><Avatar u={u} size={36} /><small>{u.dsa?.[today()] ? 'done' : '…'}</small></div>)}
        </div>
      </section>

      <BuildingCard />

      <RecallCard />

      <LogCard />

      <section>
        <div className="sec-head"><h2>The crew today</h2><a href="#crew" className="mono">full standings →</a></div>
        <div className="crew-strip">
          {crew.map((u) => { const us = stats(u, posts, rm); return (
            <div key={u.id} className="crew-mini" style={{ '--c': colorOf(u) }}>
              <Avatar u={u} size={44} ring={us.todayCount > 0} />
              <div><b>{nickOf(u)}</b><small>{us.todayCount} today · {us.streak}🔥</small></div>
            </div>) })}
        </div>
      </section>

      <section>
        <div className="sec-head"><h2>Plan & sketch</h2></div>
        <div className="plan-grid">
          <TodayPlan />
          <BoardsMini />
        </div>
      </section>
    </div>
  )
}

function TodayPlan() {
  const { be, me } = useStore()
  const [plan, setPlan] = useState(null)
  useEffect(() => be.watchDoc('plans/' + me.id, setPlan), [be, me.id])
  const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}` }
  const blocks = Object.entries(plan?.blocks || {}).map(([id, b]) => ({ id, ...b })).filter((b) => b.day === today()).sort((a, b) => a.start - b.start)
  const mins = blocks.filter((b) => b.kind !== 'break').reduce((a, b) => a + b.end - b.start, 0)
  return (
    <div className="card mini-card">
      <div className="row between"><h3>Today's plan</h3><span className="mono dim">{Math.round(mins / 6) / 10} h planned</span></div>
      {blocks.length ? <ul className="mini-list">{blocks.map((b) => <li key={b.id} className={b.done ? 'done' : ''}><span className="mono">{fmt(b.start)}–{fmt(b.end)}</span><b>{b.title}</b></li>)}</ul>
        : <p className="dim">Nothing planned yet. Block out your study hours so the day doesn't decide for you.</p>}
      <a className="btn solid" href="#plan">Open planner</a>
    </div>
  )
}

function BoardsMini() {
  const { be, crew, users } = useStore()
  const [boards, setBoards] = useState({})
  useEnsurePersonalBoards()
  useEffect(() => { const offs = crew.map((u) => be.watchDoc('boards/' + personalBoardId(u.id), (d) => setBoards((b) => ({ ...b, [u.id]: d })))); return () => offs.forEach((f) => f()) }, [be, crew.length])
  const count = (s) => { try { return JSON.parse(s || '[]').filter((e) => !e.isDeleted).length } catch { return 0 } }
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  return (
    <div className="card mini-card">
      <div className="row between"><h3>Our boards</h3><span className="mono dim">one each · all can write</span></div>
      <ul className="mini-list boards-mini">{crew.map((u) => { const b = boards[u.id]; return (
        <li key={u.id}><a href={'#board/' + personalBoardId(u.id)}><Avatar u={u} size={30} /><span className="bm-text"><b>{nickOf(u)}'s board</b><small className="mono dim">{b ? `${count(b.elements)} shape${count(b.elements) === 1 ? '' : 's'}${b.updatedAt ? ' · edited ' + new Date(b.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''}${b.updatedBy && b.updatedBy !== u.id ? ' by ' + nickOf(byId[b.updatedBy]) : ''}` : 'new'}</small></span><em>open →</em></a></li>) })}</ul>
      <a className="btn solid" href="#board">All boards</a>
    </div>
  )
}

function LogCard() {
  const { me, crew } = useStore()
  const logs = useLogs()
  const team = useTeam()
  const mine = logs.find((l) => l.id === `${me.id}_${today()}`)
  const todayLogs = logs.filter((l) => l.day === today())
  const pending = logs.flatMap((l) => Object.values(l.teach || {})).filter((t) => !t.done).length
  const nc = team?.nextCall?.at ? new Date(team.nextCall.at).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : null
  return (
    <section className="card log-card">
      <div className="log-card-l">
        <span className="tag">learning log</span>
        <h2>{mine ? 'Today is written.' : 'What did you learn today?'}</h2>
        <p>{mine ? `${mine.studied?.length || 0} topics logged. Read what the others learnt, or add more before the day ends.` : 'Two minutes: what you studied, in your own words, and what you\'ll teach the others.'}</p>
        <a className="btn solid" href="#log">{mine ? 'Open the log' : 'Write today’s log'}</a>
      </div>
      <div className="log-card-r">
        <div className="log-who">{crew.map((u) => { const did = todayLogs.some((l) => l.uid === u.id); return (
          <div key={u.id} className={'log-person' + (did ? ' did' : '')} style={{ '--c': colorOf(u) }}><Avatar u={u} size={40} ring={did} /><small>{did ? 'logged' : 'not yet'}</small></div>) })}</div>
        <p className="mono dim">{pending} topic{pending === 1 ? '' : 's'} to explain{nc ? ` · next call ${nc}` : ''}</p>
      </div>
    </section>
  )
}

// Spaced recall: concepts you ticked 1, 3, 7, 21 and 60 days ago come back as
// "explain it again" prompts. Retrieval spaced over time is one of the best-supported
// ways to make learning stick.
const INTERVALS = [1, 3, 7, 21, 60]
function BuildingCard() {
  const { me } = useStore()
  const live = Object.entries(me?.builds || {}).filter(([pid, b]) => b.status === 'building' && BUILD[pid])
  if (!live.length) return (
    <section className="card build-card empty">
      <div><span className="tag">build & learn</span><h2>Nothing on the bench.</h2><p className="dim">You learn it properly by building it. Pick the next rung on your ladder.</p></div>
      <a className="btn solid" href="#build">Pick a build →</a>
    </section>)
  return (
    <section className="card build-card">
      <div className="row between"><span className="tag">building now</span><a className="mono" href="#build">all builds →</a></div>
      {live.slice(0, 2).map(([pid, b]) => { const p = BUILD[pid]; const n = Object.values(b.steps || {}).filter(Boolean).length; const next = p.steps.findIndex((_, i) => !b.steps?.[i]); return (
        <a key={pid} className="build-now" href={`#build/${p.track}/${pid}`}>
          <b>{p.title}</b>
          <small className="dim">{next >= 0 ? 'Next: ' + p.steps[next] : 'All milestones done — write the retro and ship it'}</small>
          <Bar pct={n / p.steps.length} color={colorOf(me)} h={6} />
        </a>) })}
    </section>)
}

function RecallCard() {
  const { me, rm, api } = useStore()
  const [open, setOpen] = useState(null)
  const todayISO = today()
  const text = {}
  for (const nd of rm.ALL) for (const c of nd.concepts) text[conceptId(nd.id, c)] = { c: cText(c), nd }
  const due = []
  for (const [cid, ts] of Object.entries(me?.progress || {})) {
    if (!text[cid]) continue
    const r = me?.recall?.[cid]
    if (r && today(new Date(r.at)) === todayISO) continue // already answered today
    const age = Math.round((new Date(todayISO + 'T12:00') - new Date(today(new Date(ts)) + 'T12:00')) / 864e5)
    const again = r?.again && r.again <= todayISO
    if (again || INTERVALS.includes(age)) due.push({ cid, age, again, ...text[cid] })
  }
  for (const [pid, b] of Object.entries(me?.builds || {})) {
    if (b.status !== 'shipped' || !BUILD[pid]) continue
    const cid = 'b__' + pid, r = me?.recall?.[cid]
    if (r && today(new Date(r.at)) === todayISO) continue
    const age = Math.round((new Date(todayISO + 'T12:00') - new Date(today(new Date(b.shipped)) + 'T12:00')) / 864e5)
    const again = r?.again && r.again <= todayISO
    if (again || [7, 30, 90].includes(age)) due.push({ cid, age, again, build: true, c: `Explain “${BUILD[pid].title}”: the architecture, the hardest bug, what breaks at 10×`, nd: { title: 'Your build · 2 minutes, out loud' } })
  }
  due.sort((a, b) => (b.again - a.again) || (!!b.build - !!a.build) || (a.age - b.age))
  const show = due.slice(0, 4)
  if (!show.length) return null
  return (
    <section className="card recall-card">
      <div className="row between"><span className="tag">spaced recall</span><span className="mono dim">{due.length} due today</span></div>
      <h2>Can you still explain these?</h2>
      <p className="dim">Say it out loud in 30 seconds — no peeking. Shaky ones come back tomorrow.</p>
      <ul className="recall-list">
        {show.map((x) => (
          <li key={x.cid}>
            <div><b>{x.c}</b><small className="mono dim">{x.nd.title} · {x.again ? 'again today' : `${x.build ? 'shipped' : 'ticked'} ${x.age} day${x.age > 1 ? 's' : ''} ago`}</small></div>
            <div className="recall-btns">
              <button className="btn" onClick={() => api.recall(x.cid, true)}>Got it</button>
              <button className="btn ghost" onClick={() => api.recall(x.cid, false)}>Shaky</button>
            </div>
          </li>))}
      </ul>
    </section>
  )
}
