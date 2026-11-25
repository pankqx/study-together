import { useEffect, useRef, useState } from 'react'
import { colorOf, initial, nickOf } from './lib/logic.js'

export const REACTIONS = { fire: '🔥', clap: '👏', brain: '🧠', lol: '😂', skull: '💀', heart: '❤️' }

export function Avatar({ u, size = 32, ring, title }) {
  const [bad, setBad] = useState(false)
  return (
    <span className={'av' + (ring ? ' ring' : '')} title={title || nickOf(u)}
      style={{ '--c': colorOf(u), width: size, height: size, fontSize: size * 0.44 }}>
      {u?.photo && !bad ? <img src={u.photo} alt="" referrerPolicy="no-referrer" onError={() => setBad(true)} /> : initial(u)}
    </span>
  )
}

export function Sheet({ open, onClose, children, title, wide }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); document.body.classList.add('lock')
    return () => { window.removeEventListener('keydown', k); document.body.classList.remove('lock') }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="sheet-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'sheet' + (wide ? ' wide' : '')} role="dialog" aria-label={title}>
        <div className="sheet-grab" />
        <div className="sheet-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function Check({ on, onChange, children, color, small }) {
  return (
    <label className={'check' + (on ? ' on' : '') + (small ? ' small' : '')} style={{ '--c': color }}>
      <input type="checkbox" checked={!!on} onChange={(e) => onChange(e.target.checked)} />
      <span className="box" aria-hidden>{on ? '✓' : ''}</span>
      <span className="lbl">{children}</span>
    </label>
  )
}

export function Bar({ pct, color, h = 8 }) {
  return <div className="bar" style={{ height: h }}><i style={{ width: Math.round(pct * 100) + '%', background: color }} /></div>
}

export function Ring({ pct, size = 44, stroke = 5, color = 'var(--ink)', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <span className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line-soft)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform={`rotate(-90 ${size / 2} ${size / 2})`} /></svg>
      <span className="ring-in">{children}</span>
    </span>
  )
}

export function Reactions({ value = {}, me, onToggle }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => { if (!open) return; const f = (e) => !ref.current?.contains(e.target) && setOpen(false); document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f) }, [open])
  const used = Object.entries(value).filter(([, who]) => who && Object.keys(who).length)
  return (
    <div className="reacts" ref={ref}>
      {used.map(([k, who]) => (
        <button key={k} className={'react' + (who[me] ? ' mine' : '')} onClick={() => onToggle(k, !who[me])}>{REACTIONS[k] || k} {Object.keys(who).length}</button>
      ))}
      <button className="react add" onClick={() => setOpen(!open)} aria-label="React">＋</button>
      {open && <div className="react-pop">{Object.entries(REACTIONS).map(([k, e]) => <button key={k} onClick={() => { onToggle(k, !value[k]?.[me]); setOpen(false) }}>{e}</button>)}</div>}
    </div>
  )
}

export function Empty({ glyph = '◌', children }) { return <div className="empty"><b>{glyph}</b><p>{children}</p></div> }
