import { useStore } from '../store.jsx'
import { trackProgress } from '../data/roadmap.js'
import { stats, rank, colorOf, nickOf, BADGES, today, addDays, myTracksOf } from '../lib/logic.js'
import { Avatar, Bar } from '../ui.jsx'

export default function Crew() {
  const { crew, posts, rmTeam: rm } = useStore()
  const rows = crew.map((u) => ({ u, s: stats(u, posts, rm) })).sort((a, b) => b.s.xp - a.s.xp)
  const [lead, second] = rows
  const gap = lead && second ? lead.s.xp - second.s.xp : 0
  return (
    <div className="page crew">
      <section className="gap-hero">
        <p className="mono eyebrow">the gap</p>
        {lead && second ? (
          <h1><span style={{ color: colorOf(lead.u) }}>{nickOf(lead.u)}</span> leads <span style={{ color: colorOf(second.u) }}>{nickOf(second.u)}</span> by <b className="gap-num">{Math.abs(gap)}</b> XP.</h1>
        ) : <h1>Invite the crew to start the race.</h1>}
      </section>

      <section className="gaps">
        <GapRow label="Own path — % of the tracks each person chose" total={100} vals={rows.map(({ u, s }) => ({ u, v: Math.round(s.path.pct * 100) }))} big suffix="%" />
        {rm.tracks.filter((t) => rows.some(({ u }) => myTracksOf(u).includes(t.id))).map((t) => { const vals = rows.filter(({ u }) => myTracksOf(u).includes(t.id)).map(({ u }) => ({ u, v: trackProgress(t, u.progress).done })); return (
          <GapRow key={t.id} label={`${t.glyph} ${t.title}`} total={trackProgress(t, {}).total} vals={vals} href={`#roadmap/${t.id}`} />) })}
      </section>

      <section className="people">
        {rows.map(({ u, s }, i) => { const r = rank(s.xp); return (
          <article key={u.id} className="person" style={{ '--c': colorOf(u) }}>
            <div className="place">{['1st', '2nd', '3rd'][i] || i + 1 + 'th'}</div>
            <header><Avatar u={u} size={56} /><div><h2>{nickOf(u)}</h2><p className="mono">{r.title}</p></div></header>
            <div className="p-stats">
              <div><b>{s.xp}</b><small>xp</small></div><div><b>{s.streak}🔥</b><small>streak</small></div>
              <div><b>{s.best}</b><small>best</small></div><div><b>{s.nodesDone}</b><small>topics</small></div>
              <div><b>{s.dsaDays}</b><small>DSA days</small></div><div><b>{Math.round(s.path.pct * 100)}%</b><small>own path</small></div>
            </div>
            {r.next && <><Bar pct={(s.xp - r.at) / (r.next[0] - r.at)} color={colorOf(u)} /><small className="mono dim">{r.next[0] - s.xp} xp to {r.next[1]}</small></>}
            <Heat activity={u.activity} color={colorOf(u)} />
            <div className="badges">{BADGES.map((b) => { const got = b.test(s); return <span key={b.id} className={'badge' + (got ? ' got' : '')} title={b.name}>{b.glyph}<small>{b.name}</small></span> })}</div>
          </article>) })}
      </section>
    </div>
  )
}

function GapRow({ label, total, vals, big, href, suffix = '' }) {
  const vs = vals.map((x) => x.v)
  const lo = Math.min(...vs), hi = Math.max(...vs)
  const pos = (v) => (total ? (v / total) * 100 : 0)
  const Tag = href ? 'a' : 'div'
  return (
    <Tag className={'gap-row' + (big ? ' big' : '')} href={href}>
      <div className="gap-n"><b>{hi - lo}{suffix}</b><small>gap</small></div>
      <div className="gap-body">
        <div className="gap-label">{label} {!suffix && <small className="mono dim">/ {total}</small>}</div>
        <div className="gap-line">
          <span className="gap-span" style={{ left: pos(lo) + '%', width: pos(hi) - pos(lo) + '%' }} />
          {vals.map(({ u, v }) => <span key={u.id} className="gap-dot" style={{ left: pos(v) + '%', '--c': colorOf(u) }} title={`${nickOf(u)}: ${v}`}><em>{v}{suffix}</em></span>)}
        </div>
      </div>
    </Tag>
  )
}

function Heat({ activity = {}, color }) {
  const weeks = 18, end = today()
  const start = addDays(end, -(weeks * 7 - 1) - new Date(end + 'T12:00').getDay())
  const cells = []
  for (let d = start; d <= end; d = addDays(d, 1)) cells.push(d)
  return (
    <div className="heat" aria-label="Activity">
      {cells.map((d) => { const v = activity[d] || 0; return <i key={d} title={`${d}: ${v}`} style={{ background: v ? color : undefined, opacity: v ? Math.min(1, 0.35 + v / 8) : undefined }} /> })}
    </div>
  )
}
