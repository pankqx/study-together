import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { COLORS, colorOf, nickOf, charOf, stats, rank } from '../lib/logic.js'
import { CHARACTERS, Bust } from '../people.jsx'
import { Sheet } from '../ui.jsx'

const PALETTE = [...COLORS, '#29c8ff', '#202227']

export default function Profile({ open, onClose }) {
  const { me, api, signOut, theme, setTheme, posts, rm } = useStore()
  const [nick, setNick] = useState('')
  useEffect(() => { if (open) setNick(nickOf(me)) }, [open])
  if (!me) return null
  const s = stats(me, posts, rm), r = rank(s.xp)
  const ch = charOf(me), col = colorOf(me)
  return (
    <Sheet open={open} onClose={onClose} title="Your profile">
      <div className="pf">
        <div className="pf-head">
          <span className="pf-bust" style={{ background: col }}>{ch ? <Bust who={ch} size={88} /> : <b>{nickOf(me).slice(0, 1)}</b>}</span>
          <div><h2>{nickOf(me)}</h2><p className="mono dim">{r.title} · {s.xp} xp · {me.email}</p></div>
        </div>

        <label className="pf-field"><span>Nickname</span>
          <div className="row"><input value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} />
            <button className="btn solid" disabled={!nick.trim() || nick.trim() === nickOf(me)} onClick={() => api.updateProfile({ nick: nick.trim() })}>Save</button></div>
        </label>

        <div className="pf-field"><span>Your portrait</span>
          <div className="pf-chars">
            {Object.entries(CHARACTERS).map(([k, c]) => (
              <button key={k} className={'pf-char' + (ch === k ? ' on' : '')} onClick={() => api.updateProfile({ char: k })} title={c.label}>
                <span style={{ background: col }}><Bust who={k} size={64} /></span><small>{c.label}</small>
              </button>))}
            <button className={'pf-char' + (!ch ? ' on' : '')} onClick={() => api.updateProfile({ char: '' })}><span className="pf-none">{nickOf(me).slice(0, 1)}</span><small>Initial only</small></button>
          </div>
        </div>

        <div className="pf-field"><span>Your colour</span>
          <div className="pf-colors">{PALETTE.map((c) => <button key={c} className={'pf-color' + (col === c ? ' on' : '')} style={{ background: c }} onClick={() => api.updateProfile({ color: c })} aria-label={c} />)}</div>
        </div>

        <div className="pf-field"><span>Theme</span>
          <div className="seg"><button className={theme === 'sky' ? 'on' : ''} onClick={() => setTheme('sky')}>Sky</button><button className={theme === 'ink' ? 'on' : ''} onClick={() => setTheme('ink')}>Charcoal</button></div>
        </div>

        <button className="btn ghost danger" onClick={() => { onClose(); signOut() }}>Sign out</button>
      </div>
    </Sheet>
  )
}
