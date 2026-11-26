// ─────────────────────────────────────────────────────────────
//  The crew, drawn from life. Original flat-vector portraits.
//  Ground is y = 0, figures stand upward into negative y.
//    specs  — glasses, wavy hair, black sweatshirt with a pink print, light jeans, white sneakers
//    polo   — tallest, swept hair, off-white polo with dark trim, black trousers, silver watch
//    waves  — long wavy hair, brown ribbed top, wide-leg grey jeans, smartwatch
// ─────────────────────────────────────────────────────────────

const INK = '#1b1c20'

const Defs = () => (
  <defs>
    <linearGradient id="hairPank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2c26" /><stop offset="1" stopColor="#130f0d" /></linearGradient>
    <linearGradient id="hairRavi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a362c" /><stop offset=".6" stopColor="#1a1411" /></linearGradient>
    <linearGradient id="hairMerel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4b3127" /><stop offset=".55" stopColor="#24170f" /><stop offset="1" stopColor="#3a241a" /></linearGradient>
    <radialGradient id="glow"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
  </defs>
)
const Blush = ({ y, dx = 22, c = '#f0907e', o = 0.38 }) => <g fill={c} opacity={o}><ellipse cx={-dx} cy={y} rx="8" ry="4.5" /><ellipse cx={dx} cy={y} rx="8" ry="4.5" /></g>

function Specs() {
  const skin = '#f1c8a8', shade = '#e0aa86', dark = '#a8735a', hair = 'url(#hairPank)'
  const top = '#1f2024', topHi = '#2c2e34', jean = '#a9c6e3', jeanS = '#8eaed0', jeanHi = '#cfe0f1'
  return (
    <g>
      <Defs />
      {/* jeans */}
      <path d="M-58 -286 L58 -286 L56 -22 L12 -22 L2 -210 L-8 -22 L-56 -22 Z" fill={jean} />
      <path d="M28 -270 L36 -30 L56 -26 L58 -286 Z" fill={jeanS} />
      <path d="M-40 -250 C-44 -190 -40 -120 -42 -50 M-26 -170 L-30 -110" stroke={jeanHi} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".8" />
      <path d="M22 -200 C24 -150 22 -100 26 -60" stroke={jeanHi} strokeWidth="5" strokeLinecap="round" fill="none" opacity=".6" />
      {/* sneakers */}
      <path d="M-60 -26 L-8 -26 L-6 -8 C-6 -1 -10 2 -18 2 L-70 2 C-78 2 -78 -10 -70 -14 Z" fill="#f5f5f2" />
      <path d="M8 -26 L60 -26 L70 -14 C78 -10 78 2 70 2 L18 2 C10 2 6 -1 6 -8 Z" fill="#f5f5f2" />
      <path d="M-76 -3 L-6 -3 M6 -3 L76 -3" stroke="#d6d6cf" strokeWidth="6" />
      <path d="M-44 -18 L-26 -14 M30 -14 L48 -18" stroke="#8fb79a" strokeWidth="4" strokeLinecap="round" />
      {/* sweatshirt body */}
      <path d="M-70 -458 C-56 -472 -30 -478 -18 -480 L18 -480 C30 -478 56 -472 70 -458 L74 -300 C74 -284 60 -278 40 -276 L-40 -276 C-60 -278 -74 -284 -74 -300 Z" fill={top} />
      <path d="M-74 -300 C-74 -284 -60 -278 -40 -276 L40 -276 C60 -278 74 -284 74 -300 L74 -288 C74 -276 60 -268 40 -267 L-40 -267 C-60 -268 -74 -276 -74 -288 Z" fill={topHi} />
      {/* chest print */}
      <text x="0" y="-428" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="9" letterSpacing="4" fill="#f2f2f2">PRIME</text>
      <g fill="#d79be6">
        <path d="M-34 -420 L-14 -420 L-12 -396 L-22 -390 L-36 -398 Z" /><path d="M-10 -420 L10 -420 L8 -394 L-8 -394 Z" />
        <path d="M14 -420 L34 -420 L36 -398 L24 -390 L12 -396 Z" />
      </g>
      <path d="M-30 -408 L30 -408" stroke="#9c5fb6" strokeWidth="3" />
      <g fill="#f3c64a"><rect x="-32" y="-384" width="16" height="4" rx="2" /><rect x="-10" y="-384" width="18" height="4" rx="2" /><rect x="14" y="-384" width="16" height="4" rx="2" /></g>
      {/* neck */}
      <path d="M-14 -512 L14 -512 L16 -476 L-16 -476 Z" fill={shade} />
      <path d="M-22 -480 C-10 -470 10 -470 22 -480" stroke={topHi} strokeWidth="6" fill="none" />
      {/* crossed arm (behind raised arm) */}
      <path d="M66 -452 C78 -420 78 -380 64 -356 L-30 -348" stroke={top} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M66 -452 C78 -420 78 -380 64 -356" stroke={topHi} strokeWidth="3" fill="none" opacity=".7" />
      {/* raised arm: hand on chin */}
      <path d="M-66 -452 C-82 -410 -74 -364 -50 -354 L-24 -458" stroke={top} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M-50 -354 L-26 -450" stroke={topHi} strokeWidth="3" opacity=".7" />
      <path d="M-30 -462 L-22 -474" stroke={topHi} strokeWidth="26" strokeLinecap="round" />
      {/* head */}
      <ellipse cx="-38" cy="-560" rx="8" ry="12" fill={shade} />
      <ellipse cx="38" cy="-560" rx="8" ry="12" fill={shade} />
      <path d="M-38 -576 C-40 -620 40 -620 38 -576 L36 -546 C32 -520 16 -508 0 -508 C-16 -508 -32 -520 -36 -546 Z" fill={skin} />
      {/* stubble */}
      <path d="M-35 -548 C-32 -522 -16 -510 0 -510 C16 -510 32 -522 35 -548 C28 -530 16 -524 0 -524 C-16 -524 -28 -530 -35 -548 Z" fill={dark} opacity=".22" />
      <Blush y={-546} dx={24} />
      {/* hair — wavy, volume on top */}
      <g fill={hair}>
        <path d="M-40 -566 C-48 -606 -22 -632 4 -630 C30 -630 48 -610 40 -566 C36 -586 26 -596 10 -598 C-8 -600 -28 -592 -40 -566 Z" />
        <circle cx="-26" cy="-610" r="15" /><circle cx="-8" cy="-622" r="16" /><circle cx="12" cy="-622" r="15" /><circle cx="28" cy="-608" r="14" /><circle cx="-36" cy="-592" r="11" /><circle cx="38" cy="-590" r="10" />
      </g>
      {/* brows + eyes */}
      <path d="M-27 -572 L-9 -574 M9 -574 L27 -572" stroke={hair} strokeWidth="4" strokeLinecap="round" />
      <path d="M-24 -561 C-20 -566 -12 -566 -9 -561 M9 -561 C12 -566 20 -566 24 -561" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* glasses */}
      <g stroke="#141414" strokeWidth="2.6" fill="#ffffff" fillOpacity=".14">
        <rect x="-33" y="-572" width="28" height="19" rx="5" /><rect x="5" y="-572" width="28" height="19" rx="5" />
        <path d="M-5 -566 C-2 -569 2 -569 5 -566 M-33 -566 L-40 -568 M33 -566 L40 -568" fill="none" />
      </g>
      <path d="M-29 -569 L-22 -569 M9 -569 L16 -569" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      {/* nose + grin */}
      <path d="M-1 -556 C-3 -548 -8 -542 -6 -539 C-2 -537 3 -538 6 -540" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M-17 -530 C-8 -526 8 -526 17 -530 C14 -518 6 -514 0 -514 C-6 -514 -14 -518 -17 -530 Z" fill="#fff" />
      <path d="M-17 -530 C-8 -526 8 -526 17 -530 C14 -518 6 -514 0 -514 C-6 -514 -14 -518 -17 -530 Z" stroke="#b35a50" strokeWidth="2" fill="none" />
      {/* fist resting on the chin */}
      <path d="M-26 -486 C-30 -500 -20 -510 -6 -508 C4 -506 6 -496 2 -490 C-2 -482 -18 -478 -26 -486 Z" fill={skin} />
      <path d="M-18 -500 C-13 -504 -6 -504 -2 -500 M-20 -492 C-15 -495 -8 -495 -4 -492" stroke={shade} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Polo() {
  const skin = '#f5d3b8', shade = '#e4b594', dark = '#5e4234', hair = 'url(#hairRavi)'
  const polo = '#edeae5', poloS = '#d7d2ca', trim = '#24252a', pants = '#1c1d21', pantsHi = '#2b2d33'
  return (
    <g>
      <Defs />
      {/* trousers */}
      <path d="M-46 -334 L46 -334 L44 -20 L8 -20 L1 -246 L-6 -20 L-44 -20 Z" fill={pants} />
      <path d="M-24 -300 L-26 -40 M22 -300 L24 -40" stroke={pantsHi} strokeWidth="4" />
      {/* shoes */}
      <path d="M-48 -24 L-6 -24 L-4 -7 C-4 0 -8 2 -14 2 L-60 2 C-67 2 -67 -9 -60 -13 Z" fill="#17181b" />
      <path d="M8 -24 L48 -24 L60 -13 C67 -9 67 2 60 2 L14 2 C8 2 4 0 4 -7 Z" fill="#17181b" />
      <path d="M-64 -3 L-4 -3 M4 -3 L64 -3" stroke="#34363c" strokeWidth="5" />
      <path d="M-40 -18 L-20 -12 M20 -12 L40 -18" stroke="#3a3c42" strokeWidth="2" />
      {/* arms */}
      <path d="M-82 -476 C-90 -430 -92 -390 -88 -352" stroke={skin} strokeWidth="21" strokeLinecap="round" fill="none" />
      <path d="M82 -476 C90 -430 92 -390 88 -352" stroke={shade} strokeWidth="21" strokeLinecap="round" fill="none" />
      <ellipse cx="-88" cy="-338" rx="12" ry="17" fill={skin} />
      <ellipse cx="88" cy="-338" rx="12" ry="17" fill={shade} />
      {/* watch */}
      <rect x="99" y="-372" width="22" height="11" rx="3" fill="#c9cdd3" transform="translate(-200 0)" />
      <rect x="-96" y="-376" width="16" height="19" rx="4" fill="#9aa1aa" />
      <rect x="-93" y="-373" width="10" height="13" rx="2" fill="#2b2f36" />
      {/* polo body */}
      <path d="M-72 -552 C-60 -564 -36 -570 -20 -572 L20 -572 C36 -570 60 -564 72 -552 L68 -332 C40 -326 -40 -326 -68 -332 Z" fill={polo} />
      <path d="M40 -566 C60 -560 70 -554 72 -552 L68 -332 C58 -330 50 -329 44 -328 C48 -400 46 -480 40 -566 Z" fill={poloS} />
      <path d="M-68 -338 C-40 -332 40 -332 68 -338" stroke={poloS} strokeWidth="3" fill="none" />
      {/* sleeves */}
      <path d="M-72 -552 C-90 -544 -98 -514 -102 -472 L-66 -464 L-62 -524 Z" fill={polo} />
      <path d="M72 -552 C90 -544 98 -514 102 -472 L66 -464 L62 -524 Z" fill={poloS} />
      <path d="M-101 -478 L-67 -470 M-102 -472 L-66 -464 M101 -478 L67 -470 M102 -472 L66 -464" stroke={trim} strokeWidth="2.2" />
      {/* neck */}
      <path d="M-15 -606 L15 -606 L17 -566 L-17 -566 Z" fill={shade} />
      {/* placket */}
      <path d="M-8 -570 L8 -570 L6 -508 L-6 -508 Z" fill={trim} />
      <circle cx="0" cy="-534" r="2.2" fill="#9a9a9a" /><circle cx="0" cy="-518" r="2.2" fill="#9a9a9a" />
      {/* collar */}
      <path d="M-20 -574 L-3 -550 L-9 -540 L-42 -560 Z" fill={polo} />
      <path d="M20 -574 L3 -550 L9 -540 L42 -560 Z" fill={poloS} />
      <path d="M-38 -560 L-9 -543 M38 -560 L9 -543" stroke={trim} strokeWidth="2" />
      {/* head */}
      <ellipse cx="-37" cy="-646" rx="8" ry="12" fill={shade} />
      <ellipse cx="37" cy="-646" rx="8" ry="12" fill={shade} />
      <path d="M-37 -664 C-38 -708 38 -708 37 -664 L35 -632 C31 -606 15 -594 0 -594 C-15 -594 -31 -606 -35 -632 Z" fill={skin} />
      <path d="M20 -700 C34 -690 38 -676 37 -664 L35 -632 C33 -620 28 -610 22 -604 C30 -630 30 -670 20 -700 Z" fill={shade} opacity=".5" />
      {/* hair — swept, volume on top */}
      <path d="M-39 -652 C-46 -694 -22 -722 6 -722 C34 -722 48 -702 40 -654 C36 -672 30 -680 20 -682 C10 -676 -8 -674 -22 -680 C-30 -676 -36 -666 -39 -652 Z" fill={hair} />
      <path d="M-30 -700 C-14 -716 18 -718 38 -700 C26 -702 6 -700 -8 -692 Z" fill="#2a2a2a" />
      {/* brows, eyes */}
      <path d="M-26 -661 L-9 -660 M9 -660 L26 -661" stroke={hair} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="-16" cy="-647" rx="7" ry="3.6" fill="#fff" /><ellipse cx="16" cy="-647" rx="7" ry="3.6" fill="#fff" />
      <circle cx="-16" cy="-647" r="3.4" fill="#3a2a22" /><circle cx="16" cy="-647" r="3.4" fill="#3a2a22" />
      <circle cx="-15" cy="-648.4" r="1.1" fill="#fff" /><circle cx="17" cy="-648.4" r="1.1" fill="#fff" />
      <Blush y={-628} dx={23} o={0.3} />
      <path d="M-18 -712 C-6 -718 10 -718 22 -708" stroke="#7a5a4a" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
      {/* nose */}
      <path d="M0 -640 C-2 -634 -5 -629 -4 -626 C-1 -624 3 -624 5 -626" stroke={dark} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".55" />
      {/* moustache, mouth, goatee */}
      <path d="M-10 -616 C-4 -618 4 -618 10 -616" stroke={dark} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".45" />
      <path d="M-10 -608 C-4 -602 4 -602 10 -608" stroke="#3b2218" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M-5 -598 C-2 -594 2 -594 5 -598 L3 -594 C1 -592 -1 -592 -3 -594 Z" fill={dark} opacity=".8" />
    </g>
  )
}

function Waves() {
  const skin = '#f8d9c4', shade = '#ebbd9f', dark = '#a2634c', hair = 'url(#hairMerel)', hairHi = '#6b4a3c'
  const top = '#6c4533', topS = '#5a3828', jean = '#45474d', jeanHi = '#62656c'
  return (
    <g>
      <Defs />
      {/* back hair */}
      <path d="M-44 -580 C-66 -560 -62 -530 -70 -506 C-78 -482 -64 -470 -72 -448 C-80 -428 -66 -410 -52 -418 C-44 -424 -48 -440 -40 -452 L40 -452 C48 -440 44 -424 52 -418 C66 -410 80 -428 72 -448 C64 -470 78 -482 70 -506 C62 -530 66 -560 44 -580 Z" fill={hair} />
      {/* wide-leg jeans */}
      <path d="M-44 -300 L44 -300 L62 -10 L6 -10 L2 -220 L-4 -10 L-62 -10 Z" fill={jean} />
      <path d="M-30 -270 C-34 -200 -40 -120 -46 -30 M28 -270 C32 -200 38 -120 44 -30" stroke={jeanHi} strokeWidth="8" strokeLinecap="round" fill="none" opacity=".7" />
      <path d="M-60 -14 L-6 -14 M6 -14 L60 -14" stroke="#36383d" strokeWidth="5" />
      {/* shoes peeking */}
      <path d="M-40 -8 L-12 -8 C-8 -8 -6 2 -14 2 L-44 2 C-50 2 -48 -8 -40 -8 Z M12 -8 L40 -8 C48 -8 50 2 44 2 L14 2 C6 2 8 -8 12 -8 Z" fill="#141416" />
      {/* torso */}
      <path d="M-50 -470 C-40 -478 -24 -482 -14 -482 L14 -482 C24 -482 40 -478 50 -470 L44 -380 C42 -350 46 -320 46 -298 L-46 -298 C-46 -320 -42 -350 -44 -380 Z" fill={top} />
      <path d="M24 -478 C40 -476 50 -470 50 -470 L44 -380 C42 -350 46 -320 46 -298 L30 -298 C34 -350 32 -420 24 -478 Z" fill={topS} />
      <g stroke={topS} strokeWidth="1.6" opacity=".9">{[-34, -24, -14, -4, 6, 16, 26, 36].map((x) => <path key={x} d={`M${x} -446 L${x * 1.05} -300`} />)}</g>
      {/* sweetheart neckline */}
      <path d="M-36 -478 C-30 -470 -26 -452 -20 -446 C-12 -440 -4 -444 0 -452 C4 -444 12 -440 20 -446 C26 -452 30 -470 36 -478 C20 -490 -20 -490 -36 -478 Z" fill={skin} />
      <path d="M-20 -446 C-12 -440 -4 -444 0 -452 C4 -444 12 -440 20 -446" stroke={dark} strokeWidth="1.5" fill="none" opacity=".4" />
      {/* arms, hands clasped */}
      <path d="M-48 -466 C-62 -430 -64 -380 -50 -340 C-40 -318 -22 -306 -6 -302" stroke={top} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M48 -466 C62 -430 64 -380 50 -340 C40 -318 22 -306 6 -302" stroke={topS} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="-4" cy="-298" rx="16" ry="11" fill={skin} />
      <ellipse cx="6" cy="-292" rx="15" ry="10" fill={shade} />
      <rect x="-40" y="-328" width="14" height="18" rx="4" fill="#202226" transform="rotate(-38 -33 -319)" />
      {/* neck */}
      <path d="M-11 -512 L11 -512 L13 -478 L-13 -478 Z" fill={shade} />
      {/* head */}
      <ellipse cx="-33" cy="-546" rx="7" ry="11" fill={shade} />
      <ellipse cx="33" cy="-546" rx="7" ry="11" fill={shade} />
      <circle cx="-34" cy="-532" r="3" fill="#e7c36a" /><circle cx="34" cy="-532" r="3" fill="#e7c36a" />
      <path d="M-33 -562 C-34 -604 34 -604 33 -562 L31 -534 C28 -512 14 -500 0 -500 C-14 -500 -28 -512 -31 -534 Z" fill={skin} />
      {/* front hair: centre part, framing waves */}
      <path d="M-1 -606 C-28 -610 -50 -592 -50 -560 C-50 -540 -58 -526 -52 -508 C-46 -492 -56 -480 -50 -466 C-46 -456 -36 -458 -38 -470 C-40 -482 -32 -490 -36 -504 C-40 -520 -32 -534 -32 -552 C-30 -572 -16 -588 -1 -592 Z" fill={hair} />
      <path d="M1 -606 C28 -610 50 -592 50 -560 C50 -540 58 -526 52 -508 C46 -492 56 -480 50 -466 C46 -456 36 -458 38 -470 C40 -482 32 -490 36 -504 C40 -520 32 -534 32 -552 C30 -572 16 -588 1 -592 Z" fill={hair} />
      <path d="M-44 -566 C-48 -546 -42 -530 -46 -512 C-50 -496 -44 -484 -46 -472 M44 -566 C48 -546 42 -530 46 -512 C50 -496 44 -484 46 -472 M-24 -598 C-34 -590 -40 -578 -42 -566 M24 -598 C34 -590 40 -578 42 -566" stroke={hairHi} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* brows, eyes */}
      <path d="M-23 -566 C-18 -569 -12 -569 -8 -567 M8 -567 C12 -569 18 -569 23 -566" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M-22 -553 C-18 -558 -11 -558 -8 -553 M8 -553 C11 -558 18 -558 22 -553" stroke={INK} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M-22 -553 L-26 -557 M-20 -556 L-23 -560 M22 -553 L26 -557 M20 -556 L23 -560" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <Blush y={-532} dx={21} c="#f07f88" o={0.42} />
      {/* nose + smile */}
      <path d="M0 -550 C-1 -542 -5 -536 -3 -533 C0 -531 3 -532 5 -534" stroke={dark} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".7" />
      <path d="M-14 -522 C-7 -519 7 -519 14 -522 C11 -511 5 -508 0 -508 C-5 -508 -11 -511 -14 -522 Z" fill="#fff" />
      <path d="M-14 -522 C-7 -519 7 -519 14 -522 C11 -511 5 -508 0 -508 C-5 -508 -11 -511 -14 -522 Z" stroke="#d0566a" strokeWidth="2.6" fill="none" />
      <path d="M-30 -592 C-22 -600 -10 -604 -2 -604" stroke="#8a6252" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
      <path d="M30 -592 C22 -600 10 -604 2 -604" stroke="#8a6252" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
    </g>
  )
}

export const CHARACTERS = {
  specs: { C: Specs, label: 'Pank', full: '-110 -650 220 660', bust: '-62 -640 124 124' },
  polo: { C: Polo, label: 'Ravi', full: '-120 -735 240 745', bust: '-62 -728 124 124' },
  waves: { C: Waves, label: 'Merel', full: '-110 -620 220 630', bust: '-62 -618 124 124' },
}

export function Person({ who = 'polo', height = 320, sun, className = '' }) {
  const ch = CHARACTERS[who] || CHARACTERS.polo
  const [, , w, h] = ch.full.split(' ').map(Number)
  return (
    <svg className={'person-art ' + className} viewBox={ch.full} style={{ height, width: (height * w) / h }} role="img" aria-label={ch.label}>
      {sun && <circle cx="0" cy={-(h * 0.62)} r={w * 0.48} fill={sun} />}
      <ch.C />
    </svg>
  )
}

export function Bust({ who, size = 32, bg }) {
  const ch = CHARACTERS[who]
  if (!ch) return null
  return (
    <svg viewBox={ch.bust} width={size} height={size} aria-hidden style={{ display: 'block' }}>
      <Defs />
      {bg && <rect x="-200" y="-900" width="400" height="900" fill={bg} />}
      <ch.C />
    </svg>
  )
}

// The three together, overlapping a little like a group photo.
export function CrewArt({ order = ['specs', 'polo', 'waves'], colors = [], height = 420, className = '' }) {
  const xs = [-170, 0, 170]
  return (
    <svg className={'crew-art ' + className} viewBox="-310 -770 620 780" style={{ height }} role="img" aria-label="Pank, Ravi and Merel">
      <Defs />
      {order.map((who, i) => colors[i] && <g key={'s' + i}>
        <circle cx={xs[i]} cy={who === 'polo' ? -520 : -440} r={who === 'polo' ? 150 : 134} fill="url(#glow)" opacity=".55" />
        <circle cx={xs[i]} cy={who === 'polo' ? -520 : -440} r={who === 'polo' ? 118 : 104} fill={colors[i]} /></g>)}
      <g fill="#fff" opacity=".9">{[[-268, -640, 9], [250, -700, 12], [120, -730, 7], [-120, -690, 8], [285, -520, 6], [-285, -480, 7]].map(([x, y, r], k) => (
        <path key={k} d={`M${x} ${y - r * 2} Q${x} ${y} ${x + r * 2} ${y} Q${x} ${y} ${x} ${y + r * 2} Q${x} ${y} ${x - r * 2} ${y} Q${x} ${y} ${x} ${y - r * 2} Z`} className="sparkle" style={{ animationDelay: k * 0.4 + 's' }} />))}</g>
      {[0, 2, 1].map((i) => <g key={i} transform={`translate(${xs[i]} 0)`}>{(() => { const C = CHARACTERS[order[i]].C; return <C /> })()}</g>)}
    </svg>
  )
}
