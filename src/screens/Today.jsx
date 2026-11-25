import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { TRACKS, nodeProgress, conceptId, trackProgress } from '../data/roadmap.js'
import { PRONTOPY_URL } from '../config.js'
import { stats, rank, nextUp, colorOf, nickOf, today } from '../lib/logic.js'
import { Avatar, Bar, Check } from '../ui.jsx'

const hello = () => { const h = new Date().getHours(); return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export default function Today() {
  const { me, crew, posts, api } = useStore()
  const s = stats(me, posts)
  const r = rank(s.xp)
  const focus = me?.focus?.length ? me.focus : ['de']
  const dsaToday = !!me?.dsa?.[today()]
  const toggleFocus = (id) => api.setFocus(focus.includes(id) ? focus.filter((x) => x !== id) : [...focus, id])

  return (
    <div className="page today">
      <section className="hero">
        <div>
          <p className="mono eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1>{hello()}, <span style={{ color: colorOf(me) }}>{nickOf(me)}</span>.</h1>
          <p className="sub">{s.todayCount ? `${s.todayCount} thing${s.todayCount > 1 ? 's' : ''} done today. Keep the chain alive.` : 'Nothing ticked yet today. One checkbox keeps the streak.'}</p>
        </div>
        <div className="hero-stats">
          <div className="big-stat"><b>{s.streak}</b><span>day streak 🔥</span></div>
          <div className="big-stat"><b>{s.ticks}</b><span>concepts</span></div>
          <div className="big-stat rank"><b>{r.title}</b><span>{s.xp} xp{r.next ? ` · ${r.next[0] - s.xp} to ${r.next[1]}` : ''}</span>
            {r.next && <Bar pct={(s.xp - r.at) / (r.next[0] - r.at)} color={colorOf(me)} h={6} />}</div>
        </div>
      </section>

      <section className="card dsa-card">
        <div className="dsa-l">
          <span className="tag ink">mandatory · 2 hrs</span>
          <h2>DSA in Python</h2>
          <p>Practise on ProntoPy first. Then everything else.</p>
          <div className="row">
            <a className="btn" href={PRONTOPY_URL} target="_blank" rel="noreferrer">Open ProntoPy ↗</a>
            <Check on={dsaToday} onChange={api.toggleDSA} color={colorOf(me)}>Done for today</Check>
          </div>
        </div>
        <div className="dsa-r">
          {crew.map((u) => <div key={u.id} className={'dsa-who' + (u.dsa?.[today()] ? ' done' : '')} style={{ '--c': colorOf(u) }}><Avatar u={u} size={36} /><small>{u.dsa?.[today()] ? 'done' : '…'}</small></div>)}
        </div>
      </section>

      <StudyRoom />

      <section>
        <div className="sec-head"><h2>Next up</h2><span className="mono dim">pick your focus tracks</span></div>
        <div className="chips">{TRACKS.map((t) => <button key={t.id} className={'chip' + (focus.includes(t.id) ? ' on' : '')} onClick={() => toggleFocus(t.id)}>{t.glyph} {t.title}</button>)}</div>
        <div className="next-grid">
          {focus.map((tid) => <NextCard key={tid} tid={tid} />)}
        </div>
      </section>

      <section>
        <div className="sec-head"><h2>The crew today</h2><a href="#crew" className="mono">full standings →</a></div>
        <div className="crew-strip">
          {crew.map((u) => { const us = stats(u, posts); return (
            <div key={u.id} className="crew-mini" style={{ '--c': colorOf(u) }}>
              <Avatar u={u} size={44} ring={us.todayCount > 0} />
              <div><b>{nickOf(u)}</b><small>{us.todayCount} today · {us.streak}🔥</small></div>
            </div>) })}
        </div>
      </section>
    </div>
  )
}

function NextCard({ tid }) {
  const { me, api, crew } = useStore()
  const t = TRACKS.find((x) => x.id === tid)
  const nd = nextUp(tid, me?.progress)
  const tp = trackProgress(t, me?.progress)
  if (!nd) return <div className="card next done-track"><span className="tag">{t.glyph} {t.title}</span><h3>Track complete. Absolute legend. ★</h3></div>
  const p = nodeProgress(nd, me?.progress)
  return (
    <div className="card next">
      <div className="row between"><span className="tag">{t.glyph} {t.title}</span><span className="mono dim">{Math.round(tp.pct * 100)}% of track</span></div>
      <h3><a href={`#roadmap/${tid}/${nd.id}`}>{nd.title}</a></h3>
      <Bar pct={p.pct} color={colorOf(me)} h={6} />
      <div className="concepts">
        {nd.concepts.map((c) => {
          const cid = conceptId(nd.id, c)
          const others = crew.filter((u) => u.id !== me.id && u.progress?.[cid])
          return (
            <div key={c} className="concept-row">
              <Check on={!!me?.progress?.[cid]} onChange={(on) => api.toggleConcept(nd.id, c, on)} color={colorOf(me)}>{c}</Check>
              <span className="who">{others.map((u) => <i key={u.id} style={{ background: colorOf(u) }} title={nickOf(u)} />)}</span>
            </div>)
        })}
      </div>
      <p className="done-when">✓ {nd.doneWhen}</p>
    </div>
  )
}

function beep() { try { const a = new AudioContext(), o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.setValueAtTime(0.2, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 1.2); o.start(); o.stop(a.currentTime + 1.2) } catch {} }

const MODES = { focus: [50, 'Deep focus'], short: [25, 'Pomodoro'], break: [10, 'Break'] }
function StudyRoom() {
  const { me, crew, api } = useStore()
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const mine = me?.studying?.until > now ? me.studying : null
  const studying = crew.filter((u) => u.studying?.until > now)
  const left = mine ? Math.max(0, mine.until - now) : 0
  const mm = String(Math.floor(left / 60000)).padStart(2, '0'), ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')
  useEffect(() => { if (mine && left < 1000) { api.setStudying(null); api.logActivity(1); beep(); if (window.Notification?.permission === 'granted') new Notification('Session done — log what you learned!') } }, [left < 1000 && !!mine])
  return (
    <section className="card room">
      <div className="room-l">
        <span className="tag">study room</span>
        {mine ? (<>
          <div className="timer">{mm}<span className="blink">:</span>{ss}</div>
          <p className="mono">{mine.label}</p>
          <button className="btn ghost" onClick={() => api.setStudying(null)}>Stop</button>
        </>) : (<>
          <h2>Start a session</h2>
          <div className="row wrap">{Object.entries(MODES).map(([k, [m, l]]) => <button key={k} className="btn" onClick={() => { try { window.Notification?.requestPermission?.() } catch {} ; api.setStudying(Date.now() + m * 60000, `${l} · ${m} min`) }}>{l} {m}′</button>)}</div>
        </>)}
      </div>
      <div className="room-r">
        <p className="mono dim">{studying.length ? 'in the room now' : 'room is empty'}</p>
        {studying.map((u) => <div key={u.id} className="in-room" style={{ '--c': colorOf(u) }}><Avatar u={u} size={30} ring /><span>{nickOf(u)}</span><small>{u.studying.label}</small></div>)}
      </div>
    </section>
  )
}
