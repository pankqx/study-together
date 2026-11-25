import { useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { NODE, TRACK, ALL_NODES } from '../data/roadmap.js'
import { colorOf, nickOf, compressImage, timeAgo } from '../lib/logic.js'
import { Avatar, Empty, Reactions } from '../ui.jsx'

export function Composer({ node: fixedNode, compact }) {
  const { api, me } = useStore()
  const [text, setText] = useState('')
  const [img, setImg] = useState(null)
  const [node, setNode] = useState(fixedNode || '')
  const [busy, setBusy] = useState(false)
  const file = useRef()
  const pick = async (f) => { if (!f) return; setBusy(true); try { setImg(await compressImage(f)) } finally { setBusy(false) } }
  const send = async () => {
    if (!text.trim() && !img) return
    setBusy(true); await api.addPost({ text: text.trim(), image: img || null, node: node || null }); setText(''); setImg(null); setBusy(false)
  }
  return (
    <div className={'composer' + (compact ? ' compact' : '')} style={{ '--c': colorOf(me) }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you learn? Drop notes, a screenshot of your code, a photo of your notebook…" rows={compact ? 2 : 3} />
      {img && <div className="preview"><img src={img} alt="" /><button className="icon-btn" onClick={() => setImg(null)}>✕</button></div>}
      <div className="row between wrap">
        <div className="row">
          <button className="btn ghost" onClick={() => file.current.click()}>📷 Photo</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
          {!fixedNode && (
            <select value={node} onChange={(e) => setNode(e.target.value)} className="select">
              <option value="">Tag a topic…</option>
              {ALL_NODES.map((nd) => <option key={nd.id} value={nd.id}>{TRACK[nd.track].short} · {nd.title}</option>)}
            </select>)}
        </div>
        <button className="btn solid" disabled={busy || (!text.trim() && !img)} onClick={send}>{busy ? '…' : 'Post proof'}</button>
      </div>
    </div>
  )
}

export default function Feed() {
  const { posts, users, me, api } = useStore()
  const [lightbox, setLightbox] = useState(null)
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  return (
    <div className="page feed">
      <div className="sec-head"><h1>Proof wall</h1><span className="mono dim">receipts or it didn't happen</span></div>
      <Composer />
      {!posts.length && <Empty glyph="◫">No proof yet. Be the first.</Empty>}
      <div className="posts">
        {posts.map((p) => { const u = byId[p.uid]; const nd = p.node && NODE[p.node]; return (
          <article key={p.id} className="post" style={{ '--c': colorOf(u) }}>
            <header><Avatar u={u} size={34} /><div><b>{nickOf(u)}</b><small>{timeAgo(p.at)} ago</small></div>
              {nd && <a className="tag" href={`#roadmap/${nd.track}/${nd.id}`}>{TRACK[nd.track].glyph} {nd.title}</a>}
              {p.uid === me.id && <button className="icon-btn del" title="Delete" onClick={() => confirm('Delete this post?') && api.deletePost(p.id)}>🗑</button>}
            </header>
            {p.text && <p className="post-text">{p.text}</p>}
            {p.image && <img className="post-img" src={p.image} alt="" onClick={() => setLightbox(p.image)} />}
            <Reactions value={p.reactions} me={me.id} onToggle={(k, on) => api.reactPost(p.id, k, on)} />
          </article>) })}
      </div>
      {lightbox && <div className="lightbox" onClick={() => setLightbox(null)}><img src={lightbox} alt="" /></div>}
    </div>
  )
}
