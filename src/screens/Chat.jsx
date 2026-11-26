import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { GIPHY_KEY } from '../config.js'
import { DEL } from '../lib/backend.js'
import { colorOf, nickOf, compressImage } from '../lib/logic.js'
import { Avatar, Reactions } from '../ui.jsx'

const QUICK = ['🔥', '💀', '😂', '🧠', '✅', '🍅', '☕', '🙏']

export default function Chat() {
  const { be, me, users } = useStore()
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [reply, setReply] = useState(null)
  const [gifOpen, setGifOpen] = useState(false)
  const [img, setImg] = useState(null)
  const [busy, setBusy] = useState(false)
  const list = useRef(), file = useRef(), input = useRef()
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  const seen = useRef(0)

  useEffect(() => be.watchCol('messages', (rows) => {
    setMsgs(rows)
    const last = rows[rows.length - 1]
    if (seen.current && last && last.uid !== me.id && last.at > seen.current && document.hidden && window.Notification?.permission === 'granted')
      new Notification(nickOf(byId[last.uid]) + ': ' + (last.text || (last.gif ? 'GIF' : 'Photo')))
    seen.current = Date.now()
  }, { orderBy: 'at', limit: 300 }), [be])
  useLayoutEffect(() => { list.current?.scrollTo({ top: 1e9 }) }, [msgs.length])

  const send = async (extra = {}) => {
    const body = { text: text.trim(), ...extra }
    if (!body.text && !body.gif && !img && !extra.image) return
    setBusy(true)
    await be.addDoc('messages', { uid: me.id, at: Date.now(), text: body.text, gif: body.gif || null, image: extra.image || img || null, replyTo: reply ? { id: reply.id, uid: reply.uid, text: (reply.text || (reply.gif ? 'GIF' : 'Photo')).slice(0, 80) } : null, reactions: {} })
    setText(''); setImg(null); setReply(null); setGifOpen(false); setBusy(false); input.current?.focus()
  }
  const pick = async (f) => { if (f) setImg(await compressImage(f, 1100, 0.7)) }

  let prev = null
  return (
    <div className="page chat">
      <header className="chat-head">
        <div><h1>Crew chat</h1><p>{users.length} members · messages are visible to everyone in the crew</p></div>
        <div className="chat-members">{users.map((u) => <span key={u.id} title={nickOf(u)}><Avatar u={u} size={30} /></span>)}</div>
      </header>
      <div className="chat-list" ref={list}>
        {msgs.map((m) => {
          const u = byId[m.uid], mine = m.uid === me.id
          const first = !prev || prev.uid !== m.uid || m.at - prev.at > 5 * 60e3
          const dayBreak = !prev || new Date(prev.at).toDateString() !== new Date(m.at).toDateString()
          prev = m
          return (
            <div key={m.id}>
              {dayBreak && <div className="day-break"><span>{new Date(m.at).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>}
              <div className={'msg' + (mine ? ' mine' : '') + (first ? ' first' : '')} style={{ '--c': colorOf(u) }}>
                {!mine && <span className="msg-av">{first && <Avatar u={u} size={28} />}</span>}
                <div className="bubble-wrap">
                  {first && !mine && <b className="msg-name">{nickOf(u)}</b>}
                  <div className="bubble" onDoubleClick={() => setReply(m)}>
                    {m.replyTo && <div className="quote" style={{ '--c': colorOf(byId[m.replyTo.uid]) }}><b>{nickOf(byId[m.replyTo.uid])}</b>{m.replyTo.text}</div>}
                    {m.gif && <img className="gif" src={m.gif} alt="GIF" loading="lazy" />}
                    {m.image && <a href={m.image} target="_blank" rel="noreferrer"><img className="photo" src={m.image} alt="" loading="lazy" /></a>}
                    {m.text && <p>{m.text}</p>}
                    <span className="time">{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="msg-tools">
                    <Reactions value={m.reactions} me={me.id} onToggle={(k, on) => be.updateDoc('messages/' + m.id, { [`reactions.${k}.${me.id}`]: on ? true : DEL })} />
                    <button className="react" onClick={() => { setReply(m); input.current?.focus() }}>↩</button>
                  </div>
                </div>
              </div>
            </div>)
        })}
        {!msgs.length && <div className="empty"><b>✉</b><p>Say hi to the crew.</p></div>}
      </div>

      {gifOpen && <GifPicker onPick={(url) => send({ gif: url })} onClose={() => setGifOpen(false)} />}
      <div className="chat-input">
        {reply && <div className="replying"><span>↩ replying to <b>{nickOf(byId[reply.uid])}</b>: {(reply.text || 'media').slice(0, 60)}</span><button className="icon-btn" onClick={() => setReply(null)}>✕</button></div>}
        {img && <div className="preview small"><img src={img} alt="" /><button className="icon-btn" onClick={() => setImg(null)}>✕</button></div>}
        <div className="row">
          <button className="chat-tool" onClick={() => file.current.click()} title="Attach a photo" aria-label="Attach a photo">＋</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
          {GIPHY_KEY && <button className="icon-btn gif-btn" onClick={() => setGifOpen(!gifOpen)} title="GIF">GIF</button>}
          <textarea ref={input} rows={1} value={text} placeholder="Write a message" onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
          <button className="chat-send" disabled={busy || (!text.trim() && !img)} onClick={() => send()}>Send</button>
        </div>
      </div>
    </div>
  )
}

function GifPicker({ onPick, onClose }) {
  const [q, setQ] = useState('')
  const [gifs, setGifs] = useState([])
  useEffect(() => {
    const t = setTimeout(async () => {
      const url = q ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24&rating=pg-13`
      try { const r = await fetch(url).then((x) => x.json()); setGifs(r.data || []) } catch { setGifs([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [q])
  return (
    <div className="gif-picker">
      <div className="row"><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search GIPHY…" /><button className="icon-btn" onClick={onClose}>✕</button></div>
      <div className="gif-grid">{gifs.map((g) => <button key={g.id} onClick={() => onPick(g.images.fixed_height.url)}><img src={g.images.fixed_height_small.url} alt={g.title} loading="lazy" /></button>)}</div>
      <small className="mono dim">Powered by GIPHY</small>
    </div>
  )
}
