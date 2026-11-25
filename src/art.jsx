// Original flat illustrations + the layered "echo" headline.
import { COLORS } from './lib/logic.js'

// Each row is an SVG sized to the word, so the text always spans the full width — never clipped.
export function Echo({ text, rows = 6, className = '' }) {
  const t = String(text || '').toUpperCase()
  const w = Math.max(1, t.length) * 76
  return (
    <div className={'echo ' + className} role="heading" aria-level={1} aria-label={text}>
      {Array.from({ length: rows }, (_, i) => (
        <svg key={i} viewBox={`0 0 ${w} 92`} aria-hidden style={{ '--i': i }} preserveAspectRatio="xMinYMid meet">
          <text x="0" y="86" textLength={w} lengthAdjust="spacingAndGlyphs">{t}</text>
        </svg>))}
    </div>
  )
}

// One study buddy: charcoal hoodie, round head in the member colour, laptop.
function Buddy({ x, color, flip, glasses, hair, mood = 'smile' }) {
  const s = flip ? -1 : 1
  return (
    <g transform={`translate(${x} 0) scale(${s} 1)`}>
      {/* hoodie */}
      <path d="M-120 420 C-118 330 -95 285 -48 268 L48 268 C95 285 118 330 120 420 Z" fill="#202227" />
      <path d="M-48 268 C-30 300 30 300 48 268 L40 262 C20 284 -20 284 -40 262 Z" fill="#33363d" />
      <path d="M-14 292 L-16 360 M14 292 L16 350" stroke="#e9f8ff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="-16" cy="364" r="6" fill="#e9f8ff" /><circle cx="16" cy="354" r="6" fill="#e9f8ff" />
      <path d="M0 290 L0 420" stroke="#4a4e57" strokeWidth="3" />
      {/* badge on hoodie: curly braces */}
      <text x="62" y="350" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="34" fill="#29c8ff" textAnchor="middle" transform={flip ? 'translate(124 0) scale(-1 1)' : ''}>{'{ }'}</text>
      {/* neck + head */}
      <rect x="-20" y="232" width="40" height="44" rx="12" fill={color} style={{ filter: 'brightness(.85)' }} />
      <circle cx="0" cy="170" r="84" fill={color} />
      {/* shine */}
      <path d="M-50 110 C-30 92 -6 88 16 92" stroke="#fff" strokeOpacity=".45" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* hair */}
      {hair === 'flat' && <path d="M-86 160 C-90 80 -30 70 0 72 C40 70 92 90 86 150 C60 120 10 118 -86 160 Z" fill="#202227" />}
      {hair === 'curl' && <g fill="#202227">{[-60, -30, 0, 30, 60].map((cx, i) => <circle key={i} cx={cx} cy={100 - (i % 2) * 12} r="30" />)}</g>}
      {hair === 'bun' && <g fill="#202227"><circle cx="0" cy="70" r="30" /><path d="M-84 150 C-80 92 80 92 84 150 C40 112 -40 112 -84 150 Z" /></g>}
      {/* face */}
      {glasses ? (
        <g stroke="#202227" strokeWidth="7" fill="#e9f8ff" fillOpacity=".55">
          <rect x="-62" y="150" width="50" height="38" rx="12" /><rect x="12" y="150" width="50" height="38" rx="12" /><path d="M-12 166 L12 166" />
        </g>
      ) : null}
      <circle cx="-36" cy="170" r="7" fill="#202227" /><circle cx="36" cy="170" r="7" fill="#202227" />
      {mood === 'smile' && <path d="M-22 210 C-10 224 10 224 22 210" stroke="#202227" strokeWidth="6" strokeLinecap="round" fill="none" />}
      {mood === 'o' && <ellipse cx="0" cy="216" rx="10" ry="12" fill="#202227" />}
      {mood === 'grin' && <path d="M-26 206 L26 206 C22 230 -22 230 -26 206 Z" fill="#202227" />}
      {/* laptop */}
      <path d="M-100 420 L-70 352 L70 352 L100 420 Z" fill="#e9f8ff" />
      <path d="M-70 352 L70 352 L64 362 L-64 362 Z" fill="#c4ecfa" />
      <circle cx="0" cy="392" r="9" fill="#29c8ff" />
    </g>
  )
}

export function Buddies({ className = '' }) {
  return (
    <svg className={'buddies ' + className} viewBox="-390 40 780 380" role="img" aria-label="Three study buddies at their laptops">
      {/* floating bits */}
      <g className="floaty">
        <g transform="translate(-300 90) rotate(-12)"><path d="M0 0 L60 0 L30 52 Z" fill="#ffc93c" /><circle cx="22" cy="12" r="6" fill="#ef3b2d" /><circle cx="38" cy="22" r="5" fill="#ef3b2d" /><circle cx="28" cy="34" r="4" fill="#ef3b2d" /><path d="M-2 -2 L62 -2" stroke="#c9832f" strokeWidth="8" strokeLinecap="round" /></g>
        <g transform="translate(270 70)"><ellipse cx="30" cy="10" rx="32" ry="10" fill="#e9f8ff" /><path d="M-2 10 L-2 56 C-2 70 62 70 62 56 L62 10" fill="#e9f8ff" /><ellipse cx="30" cy="10" rx="32" ry="10" fill="#fff" /><path d="M-2 30 C-2 44 62 44 62 30" stroke="#29c8ff" strokeWidth="4" fill="none" /></g>
        <g transform="translate(-40 40)"><path d="M10 30 C-8 30 -8 6 12 8 C16 -8 44 -8 46 8 C66 6 66 30 50 30 Z" fill="#fff" /></g>
        <text x="190" y="190" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="30" fill="#202227" opacity=".85">SELECT *</text>
        <text x="-370" y="230" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="34" fill="#fff">O(n)</text>
      </g>
      <Buddy x={-250} color={COLORS[1]} hair="curl" mood="grin" />
      <Buddy x={250} color={COLORS[2]} hair="bun" flip mood="o" glasses />
      <Buddy x={0} color={COLORS[0]} hair="flat" glasses mood="smile" />
    </svg>
  )
}

// Small mascots for empty states
export function Blob({ color = '#29c8ff', size = 96, mood = 'smile' }) {
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" aria-hidden>
      <circle r="52" fill={color} />
      <circle cx="-18" cy="-6" r="6" fill="#202227" /><circle cx="18" cy="-6" r="6" fill="#202227" />
      {mood === 'smile' ? <path d="M-14 16 C-6 26 6 26 14 16" stroke="#202227" strokeWidth="5" strokeLinecap="round" fill="none" /> : <ellipse cy="20" rx="7" ry="9" fill="#202227" />}
      <path d="M-32 -32 C-20 -42 -4 -44 8 -42" stroke="#fff" strokeOpacity=".5" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  )
}
