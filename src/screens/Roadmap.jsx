import { useStore } from '../store.jsx'
import { TRACKS, TRACK, NODE, JOURNEY, LEVELS, nodeProgress, trackProgress, conceptId } from '../data/roadmap.js'
import { PRONTOPY_URL } from '../config.js'
import { colorOf, nickOf } from '../lib/logic.js'
import { Avatar, Bar, Check, Ring, Sheet } from '../ui.jsx'
import { Composer } from './Feed.jsx'
import { go } from '../App.jsx'

export default function Roadmap({ track = 'journey', node }) {
  const { me, crew } = useStore()
  const nd = node && NODE[node]
  return (
    <div className="page roadmap">
      <div className="track-tabs">
        <button className={'chip' + (track === 'journey' ? ' on' : '')} onClick={() => go('roadmap', 'journey')}>✕ Crossover journey</button>
        {TRACKS.map((t) => { const p = trackProgress(t, me?.progress); return (
          <button key={t.id} className={'chip' + (track === t.id ? ' on' : '')} onClick={() => go('roadmap', t.id)}>
            {t.glyph} {t.title} <small>{Math.round(p.pct * 100)}%</small>
          </button>) })}
      </div>
      {track === 'journey' ? <Journey /> : <TrackMap t={TRACK[track] || TRACKS[0]} />}
      <Sheet open={!!nd} onClose={() => go('roadmap', track)} title={nd ? `${TRACK[nd.track].glyph} ${TRACK[nd.track].title}` : ''}>
        {nd && <NodeDetail nd={nd} />}
      </Sheet>
    </div>
  )
}

function CrewPips({ nd }) {
  const { crew, me } = useStore()
  return <span className="pips">{crew.map((u) => { const p = nodeProgress(nd, u.progress).pct; return (
    <span key={u.id} className={'pip' + (p === 1 ? ' full' : '') + (u.id === me.id ? ' me' : '')} style={{ '--c': colorOf(u), '--p': p }} title={`${nickOf(u)} · ${Math.round(p * 100)}%`} />) })}</span>
}

function TrackMap({ t }) {
  const { me, crew } = useStore()
  const tp = trackProgress(t, me?.progress)
  let lastLevel = null
  return (
    <div className="track-map">
      <header className="track-head">
        <span className="track-glyph">{t.glyph}</span>
        <div><h1>{t.title}</h1><p>{t.blurb}</p></div>
        <div className="track-crew">{crew.map((u) => { const p = trackProgress(t, u.progress); return (
          <div key={u.id} className="tc"><Avatar u={u} size={26} /><Bar pct={p.pct} color={colorOf(u)} h={6} /><small>{p.done}/{p.total}</small></div>) })}</div>
      </header>
      <ol className="spine">
        {t.nodes.map((nd, i) => {
          const p = nodeProgress(nd, me?.progress)
          const levelBreak = nd.level !== lastLevel; lastLevel = nd.level
          return (
            <li key={nd.id} className={'spine-item ' + (i % 2 ? 'r' : 'l') + (p.pct === 1 ? ' done' : p.done ? ' doing' : '')}>
              {levelBreak && <div className="level-mark"><span>{LEVELS[nd.level]}</span></div>}
              <button className="node" onClick={() => go('roadmap', t.id, nd.id)} style={{ '--c': colorOf(me) }}>
                <Ring pct={p.pct} size={40} stroke={4} color={colorOf(me)}>{p.pct === 1 ? '✓' : p.done || ''}</Ring>
                <span className="node-t"><b>{nd.title}</b><small>{nd.concepts.length} concepts</small></span>
                <CrewPips nd={nd} />
              </button>
            </li>)
        })}
      </ol>
    </div>
  )
}

function Journey() {
  const { me, crew } = useStore()
  return (
    <div className="journey">
      <header className="track-head">
        <span className="track-glyph">✕</span>
        <div><h1>Crossover journey</h1><p>Every domain, blended in the order they build on each other. Ticks here and in each track are the same ticks. No dates — clear a stage, move on.</p></div>
      </header>
      {JOURNEY.map((st) => {
        const nodes = st.nodes.map((id) => NODE[id])
        const pct = (u) => { let d = 0, t = 0; nodes.forEach((nd) => { const p = nodeProgress(nd, u?.progress); d += p.done; t += p.total }); return d / t }
        const mine = pct(me)
        return (
          <section key={st.id} className={'stage' + (mine === 1 ? ' clear' : '')}>
            <div className="stage-head">
              <div><h2>{st.title}</h2><p>{st.blurb}</p></div>
              <div className="stage-crew">{crew.map((u) => <span key={u.id} className="sc" style={{ '--c': colorOf(u) }}><Avatar u={u} size={22} /><b>{Math.round(pct(u) * 100)}%</b></span>)}</div>
            </div>
            <div className="stage-nodes">
              {nodes.map((nd) => { const p = nodeProgress(nd, me?.progress); return (
                <button key={nd.id} className={'jnode' + (p.pct === 1 ? ' done' : p.done ? ' doing' : '')} onClick={() => go('roadmap', 'journey', nd.id)} style={{ '--c': colorOf(me), '--p': p.pct }}>
                  <span className="jt">{TRACK[nd.track].short}</span>{nd.title}<CrewPips nd={nd} />
                </button>) })}
            </div>
          </section>)
      })}
    </div>
  )
}

function NodeDetail({ nd }) {
  const { me, crew, api } = useStore()
  const p = nodeProgress(nd, me?.progress)
  const href = (u) => (u === 'prontopy' ? PRONTOPY_URL : u)
  return (
    <div className="node-detail">
      <div className="nd-head">
        <Ring pct={p.pct} size={64} stroke={6} color={colorOf(me)}><b>{Math.round(p.pct * 100)}</b></Ring>
        <div><h2>{nd.title}</h2><span className="tag">{LEVELS[nd.level]}</span></div>
      </div>
      <h4>Concepts</h4>
      <div className="concepts">
        {nd.concepts.map((c) => {
          const cid = conceptId(nd.id, c)
          return (
            <div key={c} className="concept-row">
              <Check on={!!me?.progress?.[cid]} onChange={(on) => api.toggleConcept(nd.id, c, on)} color={colorOf(me)}>{c}</Check>
              <span className="who">{crew.filter((u) => u.id !== me.id && u.progress?.[cid]).map((u) => <i key={u.id} style={{ background: colorOf(u) }} title={nickOf(u)} />)}</span>
            </div>)
        })}
      </div>
      <h4>Where to learn</h4>
      <ul className="res">{nd.resources.map((r) => <li key={r.t}><a href={href(r.u)} target={r.u.startsWith('#') ? undefined : '_blank'} rel="noreferrer">{r.t} ↗</a></li>)}</ul>
      <div className="done-when big">✓ Done when: {nd.doneWhen}</div>
      <h4>Post proof</h4>
      <Composer node={nd.id} compact />
    </div>
  )
}
