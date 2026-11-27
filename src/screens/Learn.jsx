import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { TRACKS, NODE, cText, cKey, slug, conceptId } from '../data/roadmap.js'
import { BUILD } from '../data/builds.js'
import DE from '../data/lessons/de.js'
import DE2 from '../data/lessons/de2.js'
import DE3 from '../data/lessons/de3.js'
import AI from '../data/lessons/ai.js'
import AI2 from '../data/lessons/ai2.js'
import CL from '../data/lessons/cloud.js'
import CL2 from '../data/lessons/cloud2.js'
import DM from '../data/lessons/dm.js'
import DM2 from '../data/lessons/dm2.js'
import { HOW_TO_BUILD, WALKTHROUGHS } from '../data/lessons/guides.js'

const LESSONS = { ...DE, ...DE2, ...DE3, ...AI, ...AI2, ...CL, ...CL2, ...DM, ...DM2 }
const ready = (t) => t.nodes.filter((n) => LESSONS[n.id])

export default function Learn({ rest = [] }) {
  const [a, b, c] = rest
  if (a === 'guide') return <Guide g={b ? WALKTHROUGHS[b] : HOW_TO_BUILD} pid={b} />
  const t = TRACKS.find((x) => x.id === a)
  if (t && b && LESSONS[b]) return <Lesson t={t} nd={NODE[b]} L={LESSONS[b]} focus={c} />
  if (t) return <Course t={t} />
  return <Home />
}

/* ── home: every course ── */
function Home() {
  return (
    <div className="ln">
      <header className="ln-head">
        <span className="ln-kicker">courses · in the app</span>
        <h1>Learn it here, then build it.</h1>
        <p>Short lessons for every roadmap topic, with diagrams, code and a quiz. Tick a concept when you can explain it.</p>
      </header>
      <a className="ln-guide-card" href="#learn/guide">
        <b>How to do any build</b><span>The method for all 67 projects: design doc, skeleton, milestones, shipping, teaching.</span><i>→</i>
      </a>
      <div className="ln-courses">
        {TRACKS.map((t) => { const n = ready(t).length; return (
          <a key={t.id} className={'ln-course' + (n ? '' : ' soon')} href={n ? `#learn/${t.id}` : undefined}>
            <span className="ln-glyph">{t.glyph}</span>
            <b>{t.title}</b>
            <small>{n ? `${n} of ${t.nodes.length} lessons ready` : 'lessons coming'}</small>
          </a>) })}
      </div>
    </div>
  )
}

/* ── one course: outline ── */
function Course({ t }) {
  const { me } = useStore()
  return (
    <div className="ln">
      <a className="ln-back" href="#learn">← All courses</a>
      <header className="ln-head">
        <span className="ln-kicker">course</span>
        <h1>{t.title}</h1>
        <p>{t.blurb}</p>
      </header>
      <ol className="ln-outline">
        {t.nodes.map((nd, i) => {
          const L = LESSONS[nd.id]
          const done = nd.concepts.filter((c) => me?.progress?.[conceptId(nd.id, c)]).length
          const q = me?.quiz?.[nd.id]
          return (
            <li key={nd.id} className={L ? '' : 'soon'}>
              <a href={L ? `#learn/${t.id}/${nd.id}` : `#roadmap/${t.id}/${nd.id}`}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="ln-o-text"><b>{nd.title}</b><small>{L ? `${nd.concepts.length} concepts · quiz` : 'lesson coming — open on the roadmap'}</small></span>
                <span className="ln-o-side mono">{done}/{nd.concepts.length}{q ? ` · quiz ${q.best}/${q.of}` : ''}</span>
              </a>
            </li>)
        })}
      </ol>
    </div>
  )
}

/* ── one lesson ── */
function Lesson({ t, nd, L, focus }) {
  const { me, api } = useStore()
  const list = ready(t)
  const idx = list.findIndex((n) => n.id === nd.id)
  const prev = list[idx - 1], next = list[idx + 1]
  const byText = useMemo(() => Object.fromEntries(nd.concepts.map((c) => [cText(c), c])), [nd])
  useEffect(() => {
    const el = focus && document.getElementById('c-' + focus)
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    else window.scrollTo(0, 0)
  }, [nd.id, focus])
  const builds = Object.values(BUILD).filter((p) => p.learn.includes(nd.id))

  return (
    <article className="ln ln-lesson">
      <a className="ln-back" href={`#learn/${t.id}`}>← {t.title}</a>
      <header className="ln-head">
        <span className="ln-kicker">lesson {idx + 1} of {list.length}</span>
        <h1>{nd.title}</h1>
        <p>{L.intro}</p>
      </header>
      <nav className="ln-toc">{L.concepts.map((x, i) => {
        const c = byText[x.t]; const on = c && me?.progress?.[conceptId(nd.id, c)]
        return <a key={i} href={`#learn/${t.id}/${nd.id}/${c ? cKey(c) : slug(x.t)}`} className={on ? 'on' : ''}>{on ? '✓ ' : ''}{x.t}</a> })}
      </nav>

      {L.concepts.map((x, i) => {
        const c = byText[x.t]; const on = c && !!me?.progress?.[conceptId(nd.id, c)]
        return (
          <section key={i} className="ln-sec" id={'c-' + (c ? cKey(c) : slug(x.t))}>
            <h2><span className="mono">{i + 1}</span>{x.t}</h2>
            <Body text={x.body} />
            {x.blocks.map((bk, j) => <Block key={j} b={bk} topic={`${nd.title}: ${x.t}`} />)}
            <div className="ln-sec-acts">
              {c && <button className={'ln-got' + (on ? ' on' : '')} onClick={() => api.toggleConcept(nd.id, c, !on)}>
                {on ? '✓ I can explain this' : 'I can explain this'}</button>}
              <AskAI className="pill" label="Ask AI about this" prompt={`I'm studying "${x.t}" (part of ${nd.title}, ${t.title}). Teach it to me simply: explain it with a real-world analogy, show a small practical example, list 2 common mistakes, then quiz me with 3 questions one at a time and wait for my answers.`} />
            </div>
          </section>)
      })}

      <Quiz key={nd.id} nd={nd} items={L.quiz} />

      <section className="ln-sec ln-do">
        <h2>Do it now</h2><p>{L.practice}</p>
        <h2>Explain it back</h2><p>{L.explain}</p>
        <p className="ln-dim">Say it out loud, or write it in today’s log — then put it on the call agenda.</p>
        {!!builds.length && <div className="ln-builds"><span className="ln-dim">Builds that use this:</span>
          {builds.slice(0, 4).map((p) => <a key={p.id} href={`#build/${p.track}/${p.id}`}>{p.title} →</a>)}</div>}
      </section>

      <nav className="ln-pager">
        {prev ? <a href={`#learn/${t.id}/${prev.id}`}>← {prev.title}</a> : <span />}
        {next ? <a href={`#learn/${t.id}/${next.id}`}>{next.title} →</a> : <a href={`#roadmap/${t.id}/${nd.id}`}>Back to the roadmap →</a>}
      </nav>
    </article>
  )
}

function Quiz({ nd, items }) {
  const { me, api } = useStore()
  const [picked, setPicked] = useState({})
  const answered = Object.keys(picked).length
  const score = items.filter((q, i) => picked[i] === q.a).length
  const finished = answered === items.length
  useEffect(() => { if (finished) api.quizScore(nd.id, score, items.length, me?.quiz?.[nd.id]?.best || 0) }, [finished]) // eslint-disable-line
  const best = me?.quiz?.[nd.id]
  return (
    <section className="ln-sec ln-quiz">
      <h2>Quick check {best && <span className="ln-dim mono">best {best.best}/{best.of}</span>}</h2>
      {items.map((q, i) => {
        const p = picked[i]
        return (
          <div key={i} className="ln-q">
            <p><b>{i + 1}.</b> {q.q}</p>
            <div className="ln-opts">{q.o.map((o, k) => (
              <button key={k} disabled={p !== undefined}
                className={p === undefined ? '' : k === q.a ? 'right' : k === p ? 'wrong' : 'dim'}
                onClick={() => setPicked({ ...picked, [i]: k })}>{o}</button>))}</div>
            {p !== undefined && <p className={'ln-why ' + (p === q.a ? 'ok' : 'no')}>{p === q.a ? 'Right. ' : 'Not quite. '}{q.why}</p>}
          </div>)
      })}
      {finished && <div className="ln-score"><b>{score}/{items.length}</b>
        <span>{score === items.length ? 'Solid. Go build something with it.' : 'Re-read the sections you missed, then try again tomorrow — spacing it out is what makes it stick.'}</span>
        <button className="rm-btn" onClick={() => setPicked({})}>Try again</button></div>}
    </section>
  )
}

/* ── guides ── */
function Guide({ g, pid }) {
  const p = pid && BUILD[pid]
  useEffect(() => { window.scrollTo(0, 0) }, [pid])
  if (!g) return <div className="ln"><a className="ln-back" href="#learn">← Courses</a><p>No guide for this build yet.</p></div>
  return (
    <article className="ln ln-lesson">
      <a className="ln-back" href={p ? `#build/${p.track}/${pid}` : '#build'}>← {p ? p.title : 'Build & learn'}</a>
      <header className="ln-head"><span className="ln-kicker">{p ? 'build guide' : 'method'}</span><h1>{g.title}</h1><p>{g.intro}</p></header>
      {g.steps.map((s, i) => (
        <section key={i} className="ln-sec"><h2>{s.t}</h2><Body text={s.body} />{s.blocks.map((b, j) => <Block key={j} b={b} topic={g.title} />)}</section>))}
      {p && <nav className="ln-pager"><a href="#learn/guide">← How to do any build</a><a href={`#build/${p.track}/${pid}`}>Start this build →</a></nav>}
    </article>
  )
}

/* ── send a prompt to an AI chat in a new tab (prompt also copied as a fallback) ── */
const AIS = [
  ['Claude', (q) => 'https://claude.ai/new?q=' + encodeURIComponent(q)],
  ['ChatGPT', (q) => 'https://chatgpt.com/?q=' + encodeURIComponent(q)],
  ['Perplexity', (q) => 'https://www.perplexity.ai/search?q=' + encodeURIComponent(q)],
]
function AskAI({ prompt, label = 'ask AI', className = '' }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const send = (make) => {
    navigator.clipboard?.writeText(prompt).catch(() => {})
    const long = prompt.length > 6000
    window.open(make(long ? prompt.slice(0, 6000) + '\n\n[cut — full prompt is on your clipboard, paste it]' : prompt), '_blank', 'noopener')
    setNote(long ? 'Long prompt — it was cut in the link; paste the full one from your clipboard.' : 'Opened in a new tab. Also copied, in case it asks you to paste.')
    setOpen(false); setTimeout(() => setNote(''), 4000)
  }
  return (
    <span className={'ln-ask ' + className}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}>{label}</button>
      {open && <span className="ln-ask-menu" role="menu">{AIS.map(([n, make]) => <button key={n} role="menuitem" onClick={() => send(make)}>{n} ↗</button>)}</span>}
      {note && <span className="ln-ask-note">{note}</span>}
    </span>
  )
}

/* ── tiny renderer: paragraphs, bullets, numbered lists, **bold**, `code` ── */
function Inline({ s }) {
  return s.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*?\*)/g).map((x, i) =>
    x.startsWith('`') ? <code key={i}>{x.slice(1, -1)}</code>
      : x.startsWith('**') ? <b key={i}>{x.slice(2, -2)}</b>
      : x.length > 2 && x.startsWith('*') && x.endsWith('*') ? <em key={i}>{x.slice(1, -1)}</em> : x)
}
function Body({ text }) {
  if (!text) return null
  const out = []
  text.split(/\n\s*\n/).forEach((para, i) => {
    let buf = null
    const flush = () => { if (buf) out.push(buf.kind === 'p'
      ? <p key={out.length}><Inline s={buf.items.join(' ')} /></p>
      : buf.kind === 'ul' ? <ul key={out.length}>{buf.items.map((l, j) => <li key={j}><Inline s={l} /></li>)}</ul>
      : <ol key={out.length}>{buf.items.map((l, j) => <li key={j}><Inline s={l} /></li>)}</ol>); buf = null }
    for (const l of para.split('\n')) {
      const kind = l.startsWith('- ') ? 'ul' : /^\d+\. /.test(l) ? 'ol' : 'p'
      const item = kind === 'ul' ? l.slice(2) : kind === 'ol' ? l.replace(/^\d+\. /, '') : l
      if (!buf || buf.kind !== kind) { flush(); buf = { kind, items: [] } }
      buf.items.push(item)
    }
    flush()
  })
  return out
}
function Steps({ steps }) {
  const [i, setI] = useState(0)
  const [t, d] = steps[i]
  return (
    <div className="ln-steps">
      <div className="ln-steps-dots">{steps.map(([s], k) => (
        <button key={k} className={k === i ? 'on' : k < i ? 'past' : ''} onClick={() => setI(k)} aria-label={s}><span>{k + 1}</span><em>{s}</em></button>))}</div>
      <div className="ln-steps-body" key={i}><b>{i + 1}. {t}</b><p><Inline s={d} /></p></div>
      <div className="ln-steps-nav">
        <button disabled={!i} onClick={() => setI(i - 1)}>← Back</button>
        <span className="mono">{i + 1}/{steps.length}</span>
        <button disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>Next →</button>
      </div>
    </div>)
}
function Cards({ cards }) {
  const [flip, setFlip] = useState({})
  return (
    <div className="ln-cards">{cards.map(([f, bk], k) => (
      <button key={k} className={'ln-card' + (flip[k] ? ' flip' : '')} onClick={() => setFlip({ ...flip, [k]: !flip[k] })}>
        <span className="ln-card-in"><span className="ln-card-f">{f}<small>tap to flip</small></span><span className="ln-card-b"><Inline s={bk} /></span></span>
      </button>))}</div>)
}
function Arch({ tiers }) {
  return (
    <div className="ln-arch">{tiers.map(([label, boxes], k) => (
      <div key={k} className="ln-arch-tier">
        {k > 0 && <div className="ln-arch-arrow">↓</div>}
        <div className="ln-arch-row"><span className="ln-arch-label">{label}</span>
          <div className="ln-arch-boxes">{boxes.map((x, j) => <span key={j}>{x}</span>)}</div></div>
      </div>))}</div>)
}
function Pick({ q, options }) {
  const [p, setP] = useState(null)
  return (
    <div className="ln-pick"><span className="ln-pick-tag">try it</span><p><Inline s={q} /></p>
      <div className="ln-opts">{options.map(([o, ok], k) => (
        <button key={k} disabled={p !== null} className={p === null ? '' : ok ? 'right' : k === p ? 'wrong' : 'dim'} onClick={() => setP(k)}>{o}</button>))}</div>
      {p !== null && <p className={'ln-why ' + (options[p][1] ? 'ok' : 'no')}>{options[p][1] ? 'Yes. ' : 'Not quite. '}{options.find((x) => x[1])[2]}</p>}
    </div>)
}

function Block({ b, topic }) {
  const [copied, setCopied] = useState(false)
  if (b.steps) return <Steps steps={b.steps} />
  if (b.cards) return <Cards cards={b.cards} />
  if (b.arch) return <Arch tiers={b.arch} />
  if (b.pick) return <Pick {...b.pick} />
  if (b.flow) return <div className="ln-flow">{b.flow.map((s, i) => <span key={i}><i>{s}</i>{i < b.flow.length - 1 && <em>→</em>}</span>)}</div>
  if (b.table) return <div className="ln-table"><table><thead><tr>{b.table.cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
    <tbody>{b.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
  if (b.code) return (
    <div className="ln-code"><div className="ln-code-bar"><span>{b.lang}</span>
      <span className="ln-code-acts">
        <AskAI prompt={`I'm learning ${topic || 'data engineering / AI'} from a course. Explain step by step how to run this ${b.lang} code on my laptop (Ubuntu and Windows): what to install, where to save it, the exact commands, what output to expect, and how to fix common errors. Then explain what each part does in simple words.\n\n\`\`\`${b.lang}\n${b.code}\n\`\`\``} />
        <button onClick={() => { navigator.clipboard?.writeText(b.code); setCopied('code'); setTimeout(() => setCopied(false), 1200) }}>{copied === 'code' ? 'copied' : 'copy'}</button>
      </span></div>
      <pre><code>{b.code}</code></pre></div>)
  if (b.note) return <p className="ln-note"><Inline s={b.note} /></p>
  return null
}
