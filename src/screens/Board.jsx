import { useEffect, useMemo, useRef, useState } from 'react'
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { useStore } from '../store.jsx'
import { nickOf, timeAgo } from '../lib/logic.js'
import { Avatar, Empty } from '../ui.jsx'
import { go } from '../App.jsx'


export default function Board({ id }) {
  return id ? <Canvas id={id} /> : <BoardList />
}

function BoardList() {
  const { be, me, users } = useStore()
  const [boards, setBoards] = useState([])
  useEffect(() => be.watchCol('boards', setBoards, { orderBy: 'updatedAt', desc: true, limit: 60 }), [be])
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  const create = async () => {
    const name = prompt('Board name', 'System design: URL shortener'); if (!name) return
    const nid = await be.addDoc('boards', { name, elements: '[]', updatedAt: Date.now(), updatedBy: me.id, createdBy: me.id })
    go('board', nid)
  }
  return (
    <div className="page boards">
      <div className="sec-head"><h1>Boards</h1><button className="btn solid" onClick={create}>＋ New board</button></div>
      <p className="sub">Infinite black & white canvas. Sketch system designs, data pipelines, mind maps — all three of you, live.</p>
      {!boards.length && <Empty glyph="✎">No boards yet. Make the first one — try drawing your data platform.</Empty>}
      <div className="board-grid">
        {boards.map((b) => { const n = safeCount(b.elements); return (
          <a key={b.id} className="board-card" href={'#board/' + b.id}>
            <div className="board-thumb"><span>{n}</span><small>shapes</small></div>
            <b>{b.name}</b>
            <small className="mono dim">edited {timeAgo(b.updatedAt)} ago by {nickOf(byId[b.updatedBy])}</small>
          </a>) })}
      </div>
    </div>
  )
}
const safeCount = (s) => { try { return JSON.parse(s || '[]').filter((e) => !e.isDeleted).length } catch { return 0 } }

// keep the element with the higher version (Excalidraw bumps version on every edit)
function merge(local, remote) {
  const m = new Map(local.map((e) => [e.id, e]))
  for (const r of remote) { const l = m.get(r.id); if (!l || r.version > l.version || (r.version === l.version && r.versionNonce < l.versionNonce)) m.set(r.id, r) }
  return [...m.values()]
}
const sig = (els) => els.reduce((a, e) => a + e.id + e.version + ',', '')

function Canvas({ id }) {
  const { be, me, users, theme } = useStore()
  const [api, setApi] = useState(null)
  const [meta, setMeta] = useState(null)
  const lastSent = useRef(''), timer = useRef(), loaded = useRef(false), knownFiles = useRef(new Set())
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))

  // remote → local
  useEffect(() => {
    if (!api) return
    const off = be.watchDoc('boards/' + id, (d) => {
      if (!d) return
      setMeta(d)
      let remote = []; try { remote = JSON.parse(d.elements || '[]') } catch {}
      if (sig(remote) === lastSent.current) return
      const merged = loaded.current ? merge(api.getSceneElementsIncludingDeleted(), remote) : remote
      loaded.current = true
      api.updateScene({ elements: merged })
    })
    const offFiles = be.watchCol('boards/' + id + '/files', (rows) => {
      const fresh = rows.filter((f) => !knownFiles.current.has(f.id)); fresh.forEach((f) => knownFiles.current.add(f.id))
      if (fresh.length) api.addFiles(fresh.map(({ id: fid, dataURL, mimeType, created }) => ({ id: fid, dataURL, mimeType, created })))
    })
    return () => { off(); offFiles() }
  }, [api, id])

  // presence ping
  useEffect(() => { const ping = () => be.updateDoc('boards/' + id, { ['viewers.' + me.id]: Date.now() }).catch(() => {}); ping(); const t = setInterval(ping, 30000); return () => clearInterval(t) }, [id])

  const onChange = (elements, _state, files) => {
    if (!loaded.current) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const s = sig(elements)
      if (s === lastSent.current) return
      lastSent.current = s
      be.updateDoc('boards/' + id, { elements: JSON.stringify(elements), updatedAt: Date.now(), updatedBy: me.id })
      for (const f of Object.values(files || {})) if (!knownFiles.current.has(f.id) && f.dataURL?.length < 900_000) {
        knownFiles.current.add(f.id); be.setDoc(`boards/${id}/files/${f.id}`, { dataURL: f.dataURL, mimeType: f.mimeType, created: f.created || Date.now() }, false)
      }
    }, 500)
  }

  const here = Object.entries(meta?.viewers || {}).filter(([uid, t]) => Date.now() - t < 70000 && byId[uid])
  const rename = () => { const n = prompt('Rename board', meta?.name); if (n) be.updateDoc('boards/' + id, { name: n }) }
  const initial = useMemo(() => ({ appState: { viewBackgroundColor: theme === 'ink' ? '#0c0c0c' : '#ffffff', currentItemStrokeColor: theme === 'ink' ? '#ffffff' : '#141414', currentItemRoughness: 1 } }), [])

  return (
    <div className="canvas-page">
      <div className="canvas-bar">
        <a href="#board" className="btn ghost">← Boards</a>
        <button className="canvas-title" onClick={rename} title="Rename">{meta?.name || '…'}</button>
        <div className="here">{here.map(([uid]) => <Avatar key={uid} u={byId[uid]} size={26} ring />)}</div>
      </div>
      <div className="canvas-host">
        <Excalidraw excalidrawAPI={setApi} onChange={onChange} theme={theme === 'ink' ? 'dark' : 'light'} initialData={initial}
          UIOptions={{ canvasActions: { loadScene: false, toggleTheme: false } }}>
          <MainMenu>
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            <MainMenu.DefaultItems.Help />
          </MainMenu>
          <WelcomeScreen><WelcomeScreen.Center><WelcomeScreen.Center.Heading>Draw it before you build it.</WelcomeScreen.Center.Heading></WelcomeScreen.Center></WelcomeScreen>
        </Excalidraw>
      </div>
    </div>
  )
}
