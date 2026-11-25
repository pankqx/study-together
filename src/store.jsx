import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getBackend, DEL, inc } from './lib/backend.js'
import { DEMO, CREW } from './config.js'
import { conceptId, ALL_NODES } from './data/roadmap.js'
import { crewIndex, today } from './lib/logic.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [be, setBe] = useState(null)
  const [auth, setAuth] = useState(undefined) // undefined = loading, null = signed out
  const [denied, setDenied] = useState(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [theme, setTheme] = useState(() => localStorage.getItem('st-theme') || 'paper')

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('st-theme', theme)
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'ink' ? '#0c0c0c' : '#f4efe4') }, [theme])

  useEffect(() => { getBackend().then((b) => { setBe(b); b.onAuth(async (u) => {
    if (u && !DEMO && crewIndex(u.email) < 0) { setDenied(u.email); await b.signOut(); return }
    if (u) { setDenied(null); await b.setDoc('users/' + u.uid, { id: u.uid, email: u.email, name: u.name || '', photo: u.photo || '', nick: CREW[crewIndex(u.email)]?.nick || u.name || '', lastSeen: Date.now() }) }
    setAuth(u)
  }) }) }, [])

  useEffect(() => {
    if (!be || !auth) return
    if (DEMO) seedDemo(be)
    const a = be.watchCol('users', setUsers)
    const b = be.watchCol('posts', setPosts, { orderBy: 'at', desc: true, limit: 120 })
    return () => { a(); b() }
  }, [be, auth])

  const me = users.find((u) => u.id === auth?.uid) || (auth && { id: auth.uid, email: auth.email, name: auth.name, progress: {}, activity: {} })
  const crew = useMemo(() => [...users].sort((a, b) => (crewIndex(a.email) + 99) % 99 - (crewIndex(b.email) + 99) % 99), [users])

  const api = useMemo(() => {
    if (!be || !auth) return {}
    const path = 'users/' + auth.uid
    const bump = (n = 1) => ({ ['activity.' + today()]: inc(n) })
    return {
      toggleConcept: (nodeId, c, on) => be.updateDoc(path, { ['progress.' + conceptId(nodeId, c)]: on ? Date.now() : DEL, ...(on ? bump() : {}) }),
      toggleDSA: (on) => be.updateDoc(path, { ['dsa.' + today()]: on ? Date.now() : DEL, ...(on ? bump() : {}) }),
      setFocus: (focus) => be.updateDoc(path, { focus }),
      setStudying: (until, label) => be.updateDoc(path, { studying: until ? { until, label: label || '' } : DEL }),
      logActivity: (n = 1) => be.updateDoc(path, bump(n)),
      addPost: async (p) => { await be.addDoc('posts', { ...p, uid: auth.uid, at: Date.now(), reactions: {} }); await be.updateDoc(path, bump()) },
      reactPost: (id, emoji, on) => be.updateDoc('posts/' + id, { [`reactions.${emoji}.${auth.uid}`]: on ? true : DEL }),
      deletePost: (id) => be.delDoc('posts/' + id),
    }
  }, [be, auth])

  const value = { be, auth, me, crew, users, posts, denied, theme, setTheme, api, signIn: () => be?.signIn(), signOut: () => be?.signOut() }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Give the demo crew some believable progress so every screen has something to show.
function seedDemo(be) {
  be.demoSeed?.((store) => {
    const shares = [0.34, 0.22, 0.12]
    CREW.forEach((c, i) => {
      const u = store['users/demo-' + i]; if (!u) return
      u.progress = u.progress || {}
      for (const nd of ALL_NODES) {
        const trackBias = { fe: 1.6, be: 1.4, db: 1.1, dsa: 1.2, ops: 0.8, sd: 0.6, cloud: 0.5, de: 0.4, ai: 0.25, x: 0.15, cap: 0.1 }[nd.track] || 0.5
        nd.concepts.forEach((cc) => { if (Math.random() < shares[i] * trackBias) u.progress[conceptId(nd.id, cc)] = Date.now() - Math.random() * 30 * 864e5 })
      }
      u.dsa = {}; for (let d = 0; d < [18, 9, 4][i]; d++) u.dsa[today(new Date(Date.now() - d * 864e5))] = 1
    })
    const t = Date.now()
    store['posts/p1'] = { uid: 'demo-1', at: t - 3 * 36e5, text: 'Finally get window functions. LAG() is magic. 🧠', node: 'db-sql2', reactions: { '🔥': { 'demo-0': true } } }
    store['posts/p2'] = { uid: 'demo-2', at: t - 26 * 36e5, text: 'Docker multi-stage build: image went from 1.1 GB to 140 MB.', node: 'ops-docker', reactions: {} }
    store['posts/p3'] = { uid: 'demo-0', at: t - 50 * 36e5, text: 'Day of SQL. Notes from SQLBolt done ✅', node: 'db-sql', reactions: { '👏': { 'demo-1': true, 'demo-2': true } } }
    store['messages/m1'] = { uid: 'demo-1', at: t - 2 * 36e5, text: 'who is studying tonight?', reactions: {} }
    store['messages/m2'] = { uid: 'demo-0', at: t - 2 * 36e5 + 60e3, text: 'me — doing Airflow DAGs after DSA', reactions: { '🔥': { 'demo-1': true } } }
    store['messages/m3'] = { uid: 'demo-2', at: t - 1.5 * 36e5, text: 'join the study room at 9, pomodoro race 🍅', reactions: {} }
  })
}
