import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { LEVELS, nodeProgress, trackProgress, conceptId, cText } from '../data/roadmap.js'
import { PRONTOPY_URL } from '../config.js'
import { colorOf, nickOf, initial, timeAgo, myTracksOf } from '../lib/logic.js'
import { Composer } from './Feed.jsx'
import { go } from '../App.jsx'

const LEVEL_ORDER = ['basic', 'core', 'advanced', 'pro']
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const href = (u) => (u === 'prontopy' ? PRONTOPY_URL : u)
const statusOf = (p) => (p.pct === 1 ? 'done' : p.done ? 'doing' : 'todo')

export default function Roadmap({ track: trackParam, node }) {
  const { me, rm, mode, api, crew } = useStore()
  const mine = myTracksOf(me)
  const track = trackParam || mine.find((id) => id !== 'dsa') || 'journey'
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const all = useMemo(() => { let d = 0; rm.ALL.forEach((nd) => { d += nodeProgress(nd, me?.progress).done }); return d }, [rm, me])
  const t = rm.TRACK[track]

  return (
    <div className="rm">
      <header className="rm-top">
        <div className="rm-title">
          <h1>Roadmap</h1>
          <p className="rm-meta">{mode === 'team' ? 'Team roadmap' : 'My roadmap'} · {all}/{rm.total} concepts · {Math.round((all / rm.total) * 100)}%</p>
        </div>
        <div className="rm-controls">
          <div className="rm-seg" role="tablist" aria-label="Which roadmap you follow">
            <button className={mode === 'team' ? 'on' : ''} onClick={() => api.setMode('team')} title="Everyone follows the same roadmap">Team</button>
            <button className={mode === 'mine' ? 'on' : ''} onClick={() => api.setMode('mine')} title="The team roadmap plus your own changes">Mine</button>
          </div>
          <input className="rm-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics and concepts" />
          <button className={'rm-btn' + (edit ? ' on' : '')} onClick={() => setEdit(!edit)}>{edit ? 'Done editing' : 'Edit'}</button>
          <button className="rm-btn" onClick={() => setShowLog(true)}>Changes</button>
        </div>
      </header>

      {edit && <EditBanner />}

      <div className="rm-body">
        <aside className="rm-side">
          <select className="rm-select" value={track} onChange={(e) => go('roadmap', e.target.value)}>
            <optgroup label="My tracks">{rm.tracks.filter((x) => mine.includes(x.id)).map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</optgroup>
            <optgroup label="Other tracks">{rm.tracks.filter((x) => !mine.includes(x.id)).map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</optgroup>
            <option value="journey">Crossover journey (blended)</option>
          </select>
          <nav className="rm-tracks">
            <div className="rm-side-label">My tracks</div>
            {rm.tracks.filter((x) => mine.includes(x.id)).map((x) => <TrackLink key={x.id} id={x.id} label={x.title} pct={trackProgress(x, me?.progress).pct} active={track === x.id} />)}
            <div className="rm-side-label">Other tracks</div>
            {rm.tracks.filter((x) => !mine.includes(x.id)).map((x) => <TrackLink key={x.id} id={x.id} label={x.title} pct={trackProgress(x, me?.progress).pct} active={track === x.id} />)}
            <div className="rm-side-label">Blended</div>
            <TrackLink id="journey" label="Crossover journey" pct={null} active={track === 'journey'} />
          </nav>
        </aside>

        <main className="rm-main">
          {q.trim() ? <Search q={q.trim()} edit={edit} open={node} />
            : track === 'journey' || !t ? <Journey edit={edit} open={node} />
            : <TrackView t={t} edit={edit} open={node} />}
        </main>
      </div>

      {showLog && <ChangeLog onClose={() => setShowLog(false)} />}
    </div>
  )
}

function TrackLink({ id, label, pct, active }) {
  return (
    <a href={'#roadmap/' + id} className={'rm-tl' + (active ? ' on' : '')}>
      <span>{label}</span>
      {pct !== null && <><em>{Math.round(pct * 100)}%</em><i style={{ width: pct * 100 + '%' }} /></>}
    </a>
  )
}

function EditBanner() {
  const { mode, api, myLayer } = useStore()
  const mineCount = Object.keys(myLayer?.nodes || {}).length
  return (
    <div className={'rm-banner ' + mode}>
      {mode === 'team'
        ? <p><b>Editing the team roadmap.</b> Every change is saved for all of you and shows up for everyone immediately.</p>
        : <p><b>Editing your roadmap.</b> Only you see these changes. Updates to the team roadmap still reach you, except on topics you have changed yourself.</p>}
      {mode === 'mine' && mineCount > 0 && (
        <div className="rm-banner-actions">
          <button className="rm-btn" onClick={() => confirm('Copy your personal changes into the team roadmap for everyone?') && api.copyMineToTeam()}>Copy my changes to team</button>
          <button className="rm-btn danger" onClick={() => confirm('Remove all your personal changes and go back to the team roadmap?') && api.resetMine()}>Reset my roadmap</button>
        </div>)}
    </div>
  )
}

function CrewLine({ t, nodes }) {
  const { crew } = useStore()
  return (
    <div className="rm-crew">
      {crew.map((u) => {
        let d = 0, tot = 0
        ;(nodes || t.nodes).forEach((nd) => { const p = nodeProgress(nd, u.progress); d += p.done; tot += p.total })
        const pct = tot ? d / tot : 0
        return (
          <div key={u.id} className="rm-crew-row" title={`${nickOf(u)}: ${d}/${tot}`}>
            <span className="rm-dot" style={{ background: colorOf(u) }} /><span className="rm-crew-name">{nickOf(u)}</span>
            <span className="rm-crew-bar"><i style={{ width: pct * 100 + '%', background: colorOf(u) }} /></span>
            <span className="rm-num">{Math.round(pct * 100)}%</span>
          </div>)
      })}
    </div>
  )
}

function TrackView({ t, edit, open }) {
  const { me, api } = useStore()
  const mineList = myTracksOf(me), inMine = mineList.includes(t.id)
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const tp = trackProgress(t, me?.progress)
  const counts = { all: t.nodes.length, todo: 0, doing: 0, done: 0 }
  t.nodes.forEach((nd) => counts[statusOf(nodeProgress(nd, me?.progress))]++)
  const shown = t.nodes.filter((nd) => filter === 'all' || statusOf(nodeProgress(nd, me?.progress)) === filter)
  const levels = [...LEVEL_ORDER, ...new Set(shown.map((nd) => nd.level).filter((l) => !LEVEL_ORDER.includes(l)))]
  return (
    <section>
      <div className="rm-head">
        <div>
          <h2>{t.title}</h2>
          <p className="rm-blurb">{t.blurb}</p>
          <p className="rm-meta">{t.nodes.length} topics · {tp.total} concepts · {tp.done} done · {Math.round(tp.pct * 100)}%</p>
          <button className={'rm-btn rm-follow' + (inMine ? ' on' : '')} onClick={() => api.setMyTracks(inMine ? mineList.filter((x) => x !== t.id) : [...mineList, t.id])}>{inMine ? '✓ In my tracks' : '＋ Add to my tracks'}</button>
        </div>
        <CrewLine t={t} />
      </div>
      <div className="rm-filters">
        {[['all', 'All'], ['todo', 'Not started'], ['doing', 'In progress'], ['done', 'Done']].map(([k, l]) => (
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l} <span>{counts[k]}</span></button>))}
      </div>
      {levels.map((lv) => {
        const rows = shown.filter((nd) => nd.level === lv)
        if (!rows.length) return null
        return (
          <div key={lv} className="rm-level">
            <div className="rm-level-label"><span>{LEVELS[lv] || lv}</span><em>{rows.length}</em></div>
            {rows.map((nd) => <Row key={nd.id} nd={nd} t={t} edit={edit} openId={open} routeTrack={t.id} />)}
          </div>)
      })}
      {!shown.length && <p className="rm-empty">Nothing here with this filter.</p>}
      {edit && (adding
        ? <Editor initial={{ track: t.id, title: '', level: 'core', doneWhen: '', concepts: [{ text: '' }], resources: [] }} isNew onClose={() => setAdding(false)} />
        : <button className="rm-add" onClick={() => setAdding(true)}>＋ Add a topic to {t.title}</button>)}
    </section>
  )
}

function Journey({ edit, open }) {
  const { rm, me } = useStore()
  return (
    <section>
      <div className="rm-head">
        <div>
          <h2>Crossover journey</h2>
          <p className="rm-blurb">Every domain in the order they build on each other. These are the same topics as in the tracks, so ticking a concept here ticks it there too.</p>
        </div>
      </div>
      {rm.journey.map((st, i) => {
        const nodes = st.nodes.map((id) => rm.NODE[id])
        let d = 0, tot = 0; nodes.forEach((nd) => { const p = nodeProgress(nd, me?.progress); d += p.done; tot += p.total })
        return (
          <div key={st.id} className="rm-level">
            <div className="rm-level-label stage"><span>Stage {i + 1} · {st.title}</span><em>{d}/{tot}</em></div>
            <p className="rm-stage-blurb">{st.blurb}</p>
            {nodes.map((nd) => <Row key={nd.id} nd={nd} t={rm.TRACK[nd.track]} edit={edit} openId={open} routeTrack="journey" showTrack />)}
          </div>)
      })}
    </section>
  )
}

function Search({ q, edit, open }) {
  const { rm } = useStore()
  const needle = q.toLowerCase()
  const hits = rm.ALL.filter((nd) => nd.title.toLowerCase().includes(needle) || nd.concepts.some((c) => cText(c).toLowerCase().includes(needle)))
  return (
    <section>
      <div className="rm-head"><div><h2>Search</h2><p className="rm-meta">{hits.length} topic{hits.length === 1 ? '' : 's'} match “{q}”</p></div></div>
      {hits.map((nd) => <Row key={nd.id} nd={nd} t={rm.TRACK[nd.track]} edit={edit} openId={open} routeTrack={nd.track} showTrack highlight={needle} />)}
      {!hits.length && <p className="rm-empty">No topic or concept matches. Try fewer words.</p>}
    </section>
  )
}

function Row({ nd, t, edit, openId, routeTrack, showTrack, highlight }) {
  const { me, crew, rm } = useStore()
  const [open, setOpen] = useState(openId === nd.id)
  useEffect(() => { if (openId === nd.id) setOpen(true) }, [openId, nd.id])
  const p = nodeProgress(nd, me?.progress)
  const st = statusOf(p)
  const here = crew.filter((u) => u.current === nd.id)
  const src = rm.source[nd.id]
  return (
    <div className={'rm-row ' + st + (open ? ' open' : '')} id={'n-' + nd.id}>
      <button className="rm-row-main" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={'rm-status ' + st} style={{ '--p': p.pct }} aria-label={st}>{st === 'done' ? '✓' : ''}</span>
        <span className="rm-row-title">
          <b>{nd.title}</b>
          <span className="rm-tags">
            {showTrack && <em>{t?.title}</em>}
            {src && <em className="tag-edit">{src === 'team' ? 'team edit' : 'my edit'}</em>}
            {here.map((u) => <em key={u.id} className="tag-here" style={{ '--c': colorOf(u) }}>{u.id === me.id ? 'you are here' : nickOf(u) + ' is here'}</em>)}
          </span>
        </span>
        <span className="rm-pips">{crew.map((u) => { const up = nodeProgress(nd, u.progress).pct; return <i key={u.id} title={`${nickOf(u)} ${Math.round(up * 100)}%`} className={up === 1 ? 'full' : ''} style={{ '--c': colorOf(u), '--p': up }} /> })}</span>
        <span className="rm-num">{p.done}/{p.total}</span>
        <span className="rm-chev" aria-hidden>{open ? '–' : '+'}</span>
      </button>
      <span className="rm-row-bar"><i style={{ width: p.pct * 100 + '%' }} /></span>
      {open && <Detail nd={nd} t={t} edit={edit} highlight={highlight} />}
    </div>
  )
}

function Detail({ nd, t, edit, highlight }) {
  const { me, crew, api, notes, mode, rm, users } = useStore()
  const [editing, setEditing] = useState(false)
  const [proof, setProof] = useState(false)
  const [note, setNote] = useState(notes[nd.id]?.text || '')
  const [saved, setSaved] = useState(false)
  useEffect(() => setNote(notes[nd.id]?.text || ''), [notes[nd.id]?.text])
  const p = nodeProgress(nd, me?.progress)
  const editor = users.find((u) => u.id === nd.editedBy)
  if (editing) return <Editor initial={nd} onClose={() => setEditing(false)} />
  return (
    <div className="rm-detail">
      <div className="rm-concepts">
        <div className="rm-sub">Concepts</div>
        {nd.concepts.map((c) => {
          const cid = conceptId(nd.id, c), on = !!me?.progress?.[cid]
          const txt = cText(c)
          return (
            <label key={cid} className={'rm-check' + (on ? ' on' : '') + (highlight && txt.toLowerCase().includes(highlight) ? ' hit' : '')}>
              <input type="checkbox" checked={on} onChange={(e) => api.toggleConcept(nd.id, c, e.target.checked)} />
              <span className="rm-box" aria-hidden>{on ? '✓' : ''}</span>
              <span className="rm-ctext">{txt}</span>
              <span className="rm-who">{crew.filter((u) => u.id !== me.id && u.progress?.[cid]).map((u) => <i key={u.id} style={{ color: colorOf(u) }} title={nickOf(u)}>{initial(u)}</i>)}</span>
            </label>)
        })}
        {!nd.concepts.length && <p className="rm-empty">No concepts yet. Use Edit to add some.</p>}
        <div className="rm-actions">
          {p.pct < 1 ? <button className="rm-btn" onClick={() => api.setNodeDone(nd, true)}>Mark all done</button>
            : <button className="rm-btn" onClick={() => api.setNodeDone(nd, false)}>Clear all</button>}
          {me?.current === nd.id ? <button className="rm-btn" onClick={() => api.setCurrent(null)}>Unset current topic</button>
            : <button className="rm-btn" onClick={() => api.setCurrent(nd.id)}>Set as my current topic</button>}
          <button className="rm-btn" onClick={() => setProof(!proof)}>{proof ? 'Close' : 'Post proof'}</button>
        </div>
        {proof && <div className="rm-proof"><Composer node={nd.id} compact /></div>}
      </div>

      <div className="rm-aside">
        {nd.doneWhen && <div className="rm-block"><div className="rm-sub">Done when</div><p>{nd.doneWhen}</p></div>}
        <div className="rm-block">
          <div className="rm-sub">Where to learn</div>
          {nd.resources.length ? <ul className="rm-res">{nd.resources.map((r, i) => (
            <li key={i}><a href={href(r.u)} target={r.u.startsWith('#') ? undefined : '_blank'} rel="noreferrer">{r.t}</a><span>{r.u === 'prontopy' ? 'prontopy' : host(r.u)}</span></li>))}</ul>
            : <p className="rm-empty">No resources yet.</p>}
        </div>
        <div className="rm-block">
          <div className="rm-sub">My notes <span className="rm-private">private</span>{saved && <span className="rm-saved">saved</span>}</div>
          <textarea className="rm-note" rows={4} value={note} placeholder="Key takeaways, links, what confused you…"
            onChange={(e) => { setNote(e.target.value); setSaved(false) }}
            onBlur={async () => { if (note !== (notes[nd.id]?.text || '')) { await api.saveNote(nd.id, note.trim()); setSaved(true) } }} />
        </div>
        {(nd.editedAt || edit) && (
          <div className="rm-block rm-editmeta">
            {nd.editedAt && <p className="rm-meta">Last edited by {nickOf(editor) || 'someone'} · {timeAgo(nd.editedAt)} ago ({rm.source[nd.id] === 'mine' ? 'your roadmap' : 'team roadmap'})</p>}
            {edit && (
              <div className="rm-actions">
                <button className="rm-btn" onClick={() => setEditing(true)}>Edit topic</button>
                <button className="rm-btn" onClick={() => api.moveNode(mode, t, nd, -1)} title="Move up">↑</button>
                <button className="rm-btn" onClick={() => api.moveNode(mode, t, nd, 1)} title="Move down">↓</button>
                {rm.source[nd.id] === mode && !nd.id.startsWith('n-') && <button className="rm-btn" onClick={() => api.resetNode(mode, nd)}>Restore original</button>}
                <button className="rm-btn danger" onClick={() => confirm(`Remove “${nd.title}” from the ${mode === 'team' ? 'team' : 'your'} roadmap?`) && api.deleteNode(mode, nd)}>Remove</button>
              </div>)}
          </div>)}
      </div>
    </div>
  )
}

function Editor({ initial, isNew, onClose }) {
  const { api, mode, rm } = useStore()
  const [f, setF] = useState(() => ({
    ...initial,
    concepts: (initial.concepts || []).map((c) => (typeof c === 'string' ? { text: c } : { ...c })),
    resources: (initial.resources || []).map((r) => ({ ...r })),
  }))
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF({ ...f, [k]: v })
  const setC = (i, v) => set('concepts', f.concepts.map((c, j) => (j === i ? { ...c, text: v } : c)))
  const moveC = (i, d) => { const a = [...f.concepts]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set('concepts', a) }
  const setR = (i, k, v) => set('resources', f.resources.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  const save = async () => { if (!f.title.trim()) return; setBusy(true); const id = await api.saveNode(mode, f, isNew); setBusy(false); onClose(); if (isNew) go('roadmap', f.track, id) }
  return (
    <div className="rm-editor">
      <p className="rm-scope">{isNew ? 'New topic' : 'Editing topic'} · saves to <b>{mode === 'team' ? 'the team roadmap (everyone)' : 'your roadmap (only you)'}</b></p>
      <label className="rm-field"><span>Title</span><input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Data contracts" autoFocus /></label>
      <div className="rm-field-row">
        <label className="rm-field"><span>Track</span>
          <select value={f.track} onChange={(e) => set('track', e.target.value)}>{rm.tracks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
        <label className="rm-field"><span>Level</span>
          <select value={f.level} onChange={(e) => set('level', e.target.value)}>{LEVEL_ORDER.map((l) => <option key={l} value={l}>{LEVELS[l]}</option>)}</select></label>
      </div>
      <div className="rm-field"><span>Concepts</span>
        {f.concepts.map((c, i) => (
          <div key={i} className="rm-line">
            <input value={c.text} onChange={(e) => setC(i, e.target.value)} placeholder="Concept"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const a = [...f.concepts]; a.splice(i + 1, 0, { text: '' }); set('concepts', a) } }} />
            <button type="button" onClick={() => moveC(i, -1)} aria-label="Move up">↑</button>
            <button type="button" onClick={() => moveC(i, 1)} aria-label="Move down">↓</button>
            <button type="button" onClick={() => set('concepts', f.concepts.filter((_, j) => j !== i))} aria-label="Remove">×</button>
          </div>))}
        <button type="button" className="rm-link" onClick={() => set('concepts', [...f.concepts, { text: '' }])}>＋ Add concept</button>
        {!isNew && <small className="rm-hint">Renaming a concept keeps everyone's ticks. Deleting one removes it from progress.</small>}
      </div>
      <div className="rm-field"><span>Resources</span>
        {f.resources.map((r, i) => (
          <div key={i} className="rm-line">
            <input value={r.t} onChange={(e) => setR(i, 't', e.target.value)} placeholder="Name" />
            <input value={r.u} onChange={(e) => setR(i, 'u', e.target.value)} placeholder="https://…" />
            <button type="button" onClick={() => set('resources', f.resources.filter((_, j) => j !== i))} aria-label="Remove">×</button>
          </div>))}
        <button type="button" className="rm-link" onClick={() => set('resources', [...f.resources, { t: '', u: '' }])}>＋ Add resource</button>
      </div>
      <label className="rm-field"><span>Done when</span><input value={f.doneWhen} onChange={(e) => set('doneWhen', e.target.value)} placeholder="How you know you've really learned it" /></label>
      <div className="rm-actions">
        <button className="rm-btn solid" disabled={busy || !f.title.trim()} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="rm-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function ChangeLog({ onClose }) {
  const { be, users, rm, auth } = useStore()
  const [rows, setRows] = useState([])
  useEffect(() => be.watchCol('roadmapLog', setRows, { orderBy: 'at', desc: true, limit: 60 }), [be])
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  const visible = rows.filter((r) => r.scope === 'team' || r.uid === auth.uid)
  return (
    <div className="rm-drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="rm-drawer">
        <div className="rm-drawer-head"><h3>Changes</h3><button className="rm-btn" onClick={onClose}>Close</button></div>
        <p className="rm-meta">Edits to the team roadmap, plus your own personal edits.</p>
        <ol className="rm-log">
          {visible.map((r) => (
            <li key={r.id}>
              <span className="rm-dot" style={{ background: colorOf(byId[r.uid]) }} />
              <div><b>{nickOf(byId[r.uid]) || 'Someone'}</b> {r.action} <q>{r.title}</q>{r.track && rm.TRACK[r.track] ? <> in {rm.TRACK[r.track].title}</> : null}
                <small>{timeAgo(r.at)} ago · {r.scope === 'team' ? 'team roadmap' : 'personal'}</small></div>
            </li>))}
          {!visible.length && <li className="rm-empty">No edits yet.</li>}
        </ol>
      </aside>
    </div>
  )
}
