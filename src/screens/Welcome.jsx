import { useState } from 'react'
import { useStore } from '../store.jsx'
import { CHARACTERS, Bust } from '../people.jsx'
import { colorOf, nickOf, charOf, myTracksOf } from '../lib/logic.js'
import { Sheet } from '../ui.jsx'

// First sign-in: three quick choices, then straight into the app.
export default function Welcome() {
  const { me, api, rm } = useStore()
  const [nick, setNick] = useState(nickOf(me))
  const [ch, setCh] = useState(charOf(me) || '')
  const [tracks, setTracks] = useState(myTracksOf(me))
  const toggle = (id) => setTracks(tracks.includes(id) ? tracks.filter((x) => x !== id) : [...tracks, id])
  const done = () => api.finishOnboarding({ nick: nick.trim() || nickOf(me), char: ch, myTracks: tracks.length ? tracks : ['fe'] })
  return (
    <Sheet open title="Welcome to study/together" onClose={done}>
      <div className="pf welcome">
        <p className="welcome-lead">Three quick choices and you're in. You can change all of this later from your profile.</p>

        <label className="pf-field"><span>1 · What should we call you?</span>
          <input value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} /></label>

        <div className="pf-field"><span>2 · Pick your portrait</span>
          <div className="pf-chars">
            {Object.entries(CHARACTERS).map(([k, c]) => (
              <button key={k} className={'pf-char' + (ch === k ? ' on' : '')} onClick={() => setCh(k)}>
                <span style={{ background: colorOf(me) }}><Bust who={k} size={64} /></span><small>{c.label}</small>
              </button>))}
            <button className={'pf-char' + (!ch ? ' on' : '')} onClick={() => setCh('')}><span className="pf-none">{(nick || '?').slice(0, 1)}</span><small>Initial only</small></button>
          </div>
        </div>

        <div className="pf-field"><span>3 · Your tracks — what are you here to master?</span>
          <div className="track-pick">
            {rm.tracks.map((t) => (
              <button key={t.id} className={'track-opt' + (tracks.includes(t.id) ? ' on' : '')} onClick={() => toggle(t.id)}>
                <span className="track-opt-box">{tracks.includes(t.id) ? '✓' : ''}</span>
                <span><b>{t.title}</b><small>{t.nodes.length} topics</small></span>
              </button>))}
          </div>
        </div>

        <button className="btn solid big" onClick={done}>Let's go</button>
      </div>
    </Sheet>
  )
}
