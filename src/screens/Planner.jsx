import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { DEL, uid8 } from '../lib/backend.js'
import { TRACKS } from '../data/roadmap.js'
import { colorOf, nickOf, today, addDays, inkOn } from '../lib/logic.js'
import { Avatar, Check, Sheet } from '../ui.jsx'

const START = 5, END = 24, HOUR = 52, SNAP = 15
const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''}${h < 12 || h === 24 ? 'a' : 'p'}` }
const dayName = (iso) => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short' })
const dayNum = (iso) => new Date(iso + 'T12:00').getDate()
const KINDS = [['dsa', 'DSA', '#202227'], ...TRACKS.filter((t) => t.id !== 'dsa').map((t) => [t.id, t.title, null]), ['break', 'Break', '#7fa9bb']]

// "airflow dags 7-9pm tomorrow" → { title, day, start, end }
export function parseQuick(text, base) {
  let t = ' ' + text + ' ', day = base
  if (/\btomorrow\b/i.test(t)) { day = addDays(base, 1); t = t.replace(/\btomorrow\b/i, ' ') }
  else if (/\btoday\b/i.test(t)) { day = today(); t = t.replace(/\btoday\b/i, ' ') }
  const wd = t.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/i)
  if (wd) { const idx = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(wd[1].toLowerCase()); let d = today(); for (let i = 0; i < 7; i++) { if (new Date(d + 'T12:00').getDay() === idx) break; d = addDays(d, 1) } day = d; t = t.replace(wd[0], ' ') }
  const toMin = (h, m, ap) => { h = +h; m = +(m || 0); if (ap) { ap = ap.toLowerCase(); if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0 } return h * 60 + m }
  let start = 18 * 60, end = 19 * 60
  const range = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i)
  const single = t.match(/\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
  const dur = t.match(/\b(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours|m|min|mins)\b/i)
  if (range) { const ap2 = range[6], ap1 = range[3] || ap2; start = toMin(range[1], range[2], ap1); end = toMin(range[4], range[5], ap2); if (end <= start) end += 12 * 60; t = t.replace(range[0], ' ') }
  else if (single) { start = toMin(single[1], single[2], single[3]); end = start + 60; t = t.replace(single[0], ' ') }
  if (dur) { const v = parseFloat(dur[1]) * (/^m/i.test(dur[2]) ? 1 : 60); end = start + v; t = t.replace(dur[0], ' ') }
  return { title: t.replace(/\s+/g, ' ').trim() || 'Study block', day, start: Math.max(0, start), end: Math.min(24 * 60, end) }
}

export default function Planner() {
  const { be, me, crew, api } = useStore()
  const [plan, setPlan] = useState({})
  const [peek, setPeek] = useState({})
  const [peekPlans, setPeekPlans] = useState({})
  const [anchor, setAnchor] = useState(today())
  const [ndays, setNdays] = useState(() => (window.innerWidth < 640 ? 1 : window.innerWidth < 1000 ? 3 : 7))
  const [edit, setEdit] = useState(null)
  const [quick, setQuick] = useState(false)
  const [now, setNow] = useState(new Date())
  const grid = useRef()
  const path = 'plans/' + me.id

  useEffect(() => be.watchDoc(path, (d) => setPlan(d || {})), [be])
  useEffect(() => { const offs = crew.filter((u) => peek[u.id]).map((u) => be.watchDoc('plans/' + u.id, (d) => setPeekPlans((p) => ({ ...p, [u.id]: d || {} })))); return () => offs.forEach((f) => f()) }, [JSON.stringify(peek), crew.length])
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])
  useEffect(() => { grid.current?.scrollTo({ top: (Math.max(START, now.getHours() - 2) - START) * HOUR }) }, [])
  useEffect(() => {
    const k = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName) || e.metaKey || e.ctrlKey) return
      if (e.key === 'e') { e.preventDefault(); setQuick(true) }
      if (e.key === 't') setAnchor(today())
      if (e.key === 'ArrowLeft') setAnchor((a) => addDays(a, -ndays))
      if (e.key === 'ArrowRight') setAnchor((a) => addDays(a, ndays))
      if (['1', '3', '5', '7'].includes(e.key)) setNdays(+e.key)
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [ndays])

  const firstDay = ndays === 7 ? addDays(anchor, -((new Date(anchor + 'T12:00').getDay() + 6) % 7)) : anchor
  const days = Array.from({ length: ndays }, (_, i) => addDays(firstDay, i))
  const blocks = Object.entries(plan.blocks || {}).map(([id, b]) => ({ id, ...b }))
  const tasks = Object.entries(plan.tasks || {}).map(([id, t]) => ({ id, ...t })).sort((a, b) => (a.done - b.done) || a.at - b.at)
  const ensure = () => (plan.id ? Promise.resolve() : be.setDoc(path, { owner: me.id }))

  const saveBlock = async (b) => { await ensure(); const id = b.id || uid8(); const { id: _, ...rest } = b; await be.updateDoc(path, { ['blocks.' + id]: rest }) }
  const delBlock = (id) => be.updateDoc(path, { ['blocks.' + id]: DEL })
  const doneBlock = (b, on) => { be.updateDoc(path, { [`blocks.${b.id}.done`]: on }); if (on) api.logActivity(1) }
  const addTask = async (title) => { await ensure(); be.updateDoc(path, { ['tasks.' + uid8()]: { title, done: false, at: Date.now() } }) }

  // drag to move / resize
  const drag = useRef(null)
  const colW = () => (grid.current?.querySelector('.p-col')?.getBoundingClientRect().width || 100)
  const onDown = (e, b, mode) => {
    e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { b, mode, x: e.clientX, y: e.clientY, moved: false, di: days.indexOf(b.day) }
  }
  const [ghost, setGhost] = useState(null)
  const onMove = (e) => {
    const d = drag.current; if (!d) return
    const dy = e.clientY - d.y, dx = e.clientX - d.x
    if (Math.abs(dy) + Math.abs(dx) > 4) d.moved = true
    const dm = Math.round((dy / HOUR) * 60 / SNAP) * SNAP
    if (d.mode === 'move') {
      const di = Math.max(0, Math.min(days.length - 1, d.di + Math.round(dx / colW())))
      const len = d.b.end - d.b.start
      const start = Math.max(START * 60, Math.min(END * 60 - len, d.b.start + dm))
      setGhost({ ...d.b, day: days[di], start, end: start + len })
    } else setGhost({ ...d.b, end: Math.max(d.b.start + SNAP, Math.min(END * 60, d.b.end + dm)) })
  }
  const onUp = () => { const d = drag.current; drag.current = null; if (!d) return
    if (!d.moved) { setEdit(d.b); setGhost(null); return }
    if (ghost) saveBlock(ghost); setGhost(null) }

  const clickSlot = (e, day) => {
    if (e.target !== e.currentTarget) return
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const start = START * 60 + Math.floor((y / HOUR) * 60 / 30) * 30
    setEdit({ day, start, end: Math.min(start + 60, END * 60), title: '', kind: 'de', done: false })
  }
  const dropTask = (e, day) => {
    const tid = e.dataTransfer.getData('task'); if (!tid) return
    const t = plan.tasks?.[tid]; if (!t) return
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const start = START * 60 + Math.floor((y / HOUR) * 60 / 30) * 30
    saveBlock({ day, start, end: start + 60, title: t.title, kind: 'de', done: false }); be.updateDoc(path, { ['tasks.' + tid]: DEL })
  }

  const totalToday = blocks.filter((b) => b.day === today() && b.kind !== 'break').reduce((a, b) => a + (b.end - b.start), 0)
  const month = new Date(days[0] + 'T12:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const colorFor = (b) => KINDS.find((k) => k[0] === b.kind)?.[2] || colorOf(me)

  return (
    <div className="page planner">
      <div className="p-bar">
        <h1>{month}</h1>
        <div className="row wrap">
          <button className="btn ghost" onClick={() => setAnchor(addDays(anchor, -ndays))}>‹</button>
          <button className="btn ghost" onClick={() => setAnchor(today())}>Today</button>
          <button className="btn ghost" onClick={() => setAnchor(addDays(anchor, ndays))}>›</button>
          <div className="seg">{[1, 3, 7].map((n) => <button key={n} className={ndays === n ? 'on' : ''} onClick={() => setNdays(n)}>{n}d</button>)}</div>
          <button className="btn solid" onClick={() => setQuick(true)}>＋ Plan <kbd>E</kbd></button>
        </div>
      </div>
      <div className="p-sub">
        <span className="mono">{Math.round(totalToday / 6) / 10} h planned today {totalToday >= 360 ? '· target hit ✓' : '· target 6–7 h'}</span>
        <span className="peek">peek: {crew.filter((u) => u.id !== me.id).map((u) => (
          <button key={u.id} className={'peek-btn' + (peek[u.id] ? ' on' : '')} style={{ '--c': colorOf(u) }} onClick={() => setPeek((p) => ({ ...p, [u.id]: !p[u.id] }))}><Avatar u={u} size={22} />{nickOf(u)}</button>))}</span>
      </div>

      <div className="p-layout">
        <div className="p-cal">
          <div className="p-head" style={{ gridTemplateColumns: `44px repeat(${ndays}, 1fr)` }}>
            <span />{days.map((d) => <span key={d} className={d === today() ? 'is-today' : ''}><small>{dayName(d)}</small><b>{dayNum(d)}</b></span>)}
          </div>
          <div className="p-grid" ref={grid} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <div className="p-inner" style={{ gridTemplateColumns: `44px repeat(${ndays}, 1fr)`, height: (END - START) * HOUR }}>
              <div className="p-hours">{Array.from({ length: END - START }, (_, i) => <span key={i} style={{ top: i * HOUR }}>{fmt((START + i) * 60)}</span>)}</div>
              {days.map((d) => (
                <div key={d} className="p-col" onClick={(e) => clickSlot(e, d)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropTask(e, d)}>
                  {d === today() && now.getHours() >= START && <span className="now-line" style={{ top: ((now.getHours() - START) * 60 + now.getMinutes()) / 60 * HOUR }} />}
                  {crew.filter((u) => peek[u.id]).flatMap((u) => Object.values(peekPlans[u.id]?.blocks || {}).filter((b) => b.day === d).map((b, i) => (
                    <div key={u.id + i} className="p-block peek" style={{ top: (b.start - START * 60) / 60 * HOUR, height: (b.end - b.start) / 60 * HOUR, '--c': colorOf(u) }}><b>{nickOf(u)}</b> {b.title}</div>)))}
                  {blocks.filter((b) => (ghost?.id === b.id ? ghost.day : b.day) === d).map((b0) => { const b = ghost?.id === b0.id ? ghost : b0; return (
                    <div key={b.id} className={'p-block' + (b.done ? ' done' : '') + (ghost?.id === b.id ? ' dragging' : '')} style={{ top: (b.start - START * 60) / 60 * HOUR, height: Math.max(18, (b.end - b.start) / 60 * HOUR - 2), '--c': colorFor(b), color: inkOn(colorFor(b)) }}
                      onPointerDown={(e) => onDown(e, b0, 'move')}>
                      <b>{b.done ? '✓ ' : ''}{b.title}</b><small>{fmt(b.start)}–{fmt(b.end)}</small>
                      <span className="p-resize" onPointerDown={(e) => onDown(e, b0, 'resize')} />
                    </div>) })}
                </div>))}
            </div>
          </div>
        </div>

        <aside className="p-tasks">
          <h3>Tasks</h3>
          <TaskAdd onAdd={addTask} />
          {!tasks.length && <p className="mono dim">Add tasks, then drag them onto the calendar.</p>}
          {tasks.map((t) => (
            <div key={t.id} className="task" draggable onDragStart={(e) => e.dataTransfer.setData('task', t.id)}>
              <Check small on={t.done} onChange={(on) => { be.updateDoc(path, { [`tasks.${t.id}.done`]: on }); if (on) api.logActivity(1) }} color={colorOf(me)}>{t.title}</Check>
              <button className="icon-btn" title="Schedule" onClick={() => setEdit({ day: anchor, start: 18 * 60, end: 19 * 60, title: t.title, kind: 'de', done: false, fromTask: t.id })}>◷</button>
              <button className="icon-btn" title="Delete" onClick={() => be.updateDoc(path, { ['tasks.' + t.id]: DEL })}>✕</button>
            </div>))}
          <p className="mono dim keys">Keys: E new · T today · ←/→ move · 1/3/7 days</p>
        </aside>
      </div>

      <QuickAdd open={quick} onClose={() => setQuick(false)} base={anchor} onSave={(b) => saveBlock({ ...b, kind: 'de', done: false })} />
      <BlockEditor b={edit} onClose={() => setEdit(null)} onSave={(b) => { saveBlock(b); if (b.fromTask) be.updateDoc(path, { ['tasks.' + b.fromTask]: DEL }) }} onDelete={delBlock} onDone={doneBlock} />
    </div>
  )
}

function TaskAdd({ onAdd }) {
  const [v, setV] = useState('')
  return <form className="task-add" onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV('') } }}><input value={v} onChange={(e) => setV(e.target.value)} placeholder="New task…" /><button className="btn">＋</button></form>
}

function QuickAdd({ open, onClose, base, onSave }) {
  const [v, setV] = useState('')
  const p = useMemo(() => parseQuick(v, base), [v, base])
  if (!open) return null
  return (
    <Sheet open title="Quick plan" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (!v.trim()) return; onSave(p); setV(''); onClose() }}>
        <input className="quick-in" autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Spark joins 7-9pm tomorrow" />
        {v && <p className="mono parsed">→ <b>{p.title}</b> · {dayName(p.day)} {dayNum(p.day)} · {fmt(p.start)}–{fmt(p.end)}</p>}
        <p className="mono dim">Try: "dbt tests 3pm 2h", "DSA 6-8am", "Kafka friday 8pm"</p>
        <button className="btn solid">Add to planner</button>
      </form>
    </Sheet>
  )
}

const toHM = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
const fromHM = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }
function BlockEditor({ b, onClose, onSave, onDelete, onDone }) {
  const [f, setF] = useState(b)
  useEffect(() => setF(b), [b])
  if (!b || !f) return null
  const set = (k, v) => setF({ ...f, [k]: v })
  return (
    <Sheet open title={b.id ? 'Edit block' : 'New block'} onClose={onClose}>
      <form className="block-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...f, title: f.title || 'Study block' }); onClose() }}>
        <input autoFocus value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="What will you study?" />
        <div className="row wrap">
          <input type="date" value={f.day} onChange={(e) => set('day', e.target.value)} />
          <input type="time" step="900" value={toHM(f.start)} onChange={(e) => set('start', fromHM(e.target.value))} />
          <span>→</span>
          <input type="time" step="900" value={toHM(f.end)} onChange={(e) => set('end', Math.max(f.start + 15, fromHM(e.target.value)))} />
        </div>
        <div className="chips">{KINDS.map(([k, l]) => <button type="button" key={k} className={'chip' + (f.kind === k ? ' on' : '')} onClick={() => set('kind', k)}>{l}</button>)}</div>
        <div className="row between">
          <div className="row">
            {b.id && <button type="button" className="btn ghost" onClick={() => { onDone(b, !b.done); onClose() }}>{b.done ? 'Mark not done' : '✓ Mark done'}</button>}
            {b.id && <button type="button" className="btn ghost danger" onClick={() => { onDelete(b.id); onClose() }}>Delete</button>}
          </div>
          <button className="btn solid">Save</button>
        </div>
      </form>
    </Sheet>
  )
}
