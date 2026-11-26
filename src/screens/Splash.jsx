import { useEffect } from 'react'
import { Bust } from '../people.jsx'
import { COLORS } from '../lib/logic.js'

// ~3 second opening: three portraits pop in, the wordmark draws, a line fills.
export default function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2900); return () => clearTimeout(t) }, [onDone])
  const crew = [['specs', COLORS[0], 'Pank'], ['polo', COLORS[1], 'Ravi'], ['waves', COLORS[2], 'Merel']]
  return (
    <div className="splash" onClick={onDone} role="status" aria-label="Loading study/together">
      <div className="splash-echo" aria-hidden>{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ '--i': i }}>STUDY TOGETHER</span>)}</div>
      <div className="splash-center">
        <div className="splash-crew">
          {crew.map(([who, c, name], i) => (
            <div key={who} className="splash-face" style={{ '--d': `${0.15 + i * 0.22}s`, '--c': c }}>
              <span className="splash-ring"><Bust who={who} size={84} /></span>
              <small>{name}</small>
            </div>))}
        </div>
        <div className="splash-word"><b>study</b><em>/</em><b>together</b></div>
        <div className="splash-line"><i /></div>
        <p className="splash-tag">three friends · one plan · no excuses</p>
      </div>
    </div>
  )
}
