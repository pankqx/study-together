// One tiny data API, two engines: Firebase (real) or localStorage (demo).
import { firebaseConfig, DEMO, CREW } from '../config.js'

export const DEL = { __op: 'del' }
export const inc = (n) => ({ __op: 'inc', n })
export const uid8 = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

let engine

// ───────────── Firebase engine ─────────────
async function firebaseEngine() {
  const { initializeApp } = await import('firebase/app')
  const A = await import('firebase/auth')
  const F = await import('firebase/firestore')
  const app = initializeApp(firebaseConfig)
  const auth = A.getAuth(app)
  const db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) })
  const conv = (v) => (v && v.__op === 'del' ? F.deleteField() : v && v.__op === 'inc' ? F.increment(v.n) : v)
  const convAll = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, conv(v)]))
  return {
    onAuth: (cb) => A.onAuthStateChanged(auth, (u) => cb(u && { uid: u.uid, email: u.email, name: u.displayName, photo: u.photoURL })),
    signIn: () => A.signInWithPopup(auth, new A.GoogleAuthProvider()),
    signOut: () => A.signOut(auth),
    watchDoc: (path, cb) => F.onSnapshot(F.doc(db, path), (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null)),
    watchCol: (path, cb, o = {}) => {
      const parts = [F.collection(db, path)]
      if (o.orderBy) parts.push(F.orderBy(o.orderBy, o.desc ? 'desc' : 'asc'))
      if (o.limit) parts.push(o.desc ? F.limit(o.limit) : F.limitToLast(o.limit))
      return F.onSnapshot(F.query(...parts), (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
    },
    setDoc: (path, data, merge = true) => F.setDoc(F.doc(db, path), convAll(data), { merge }),
    updateDoc: (path, patch) => F.updateDoc(F.doc(db, path), convAll(patch)),
    addDoc: (path, data) => F.addDoc(F.collection(db, path), data).then((r) => r.id),
    delDoc: (path) => F.deleteDoc(F.doc(db, path)),
  }
}

// ───────────── Demo engine (localStorage) ─────────────
function demoEngine() {
  const KEY = 'study-together-demo-v3'
  let store = {}
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { store = {} }
  const subs = new Set()
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(KEY) : null
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)) } catch {} ; bc?.postMessage(1); subs.forEach((f) => f()) }
  bc && (bc.onmessage = () => { try { store = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {} ; subs.forEach((f) => f()) })
  const setPath = (obj, key, val) => {
    const ks = key.split('.'); let o = obj
    for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]] = o[ks[i]] && typeof o[ks[i]] === 'object' ? o[ks[i]] : {}
    const last = ks[ks.length - 1]
    if (val && val.__op === 'del') delete o[last]
    else if (val && val.__op === 'inc') o[last] = (o[last] || 0) + val.n
    else o[last] = val
  }
  const deepMerge = (a, b) => { for (const [k, v] of Object.entries(b)) { if (v && typeof v === 'object' && !Array.isArray(v) && !v.__op) a[k] = deepMerge(a[k] && typeof a[k] === 'object' ? a[k] : {}, v); else setPath(a, k, v) } return a }
  const clone = (x) => JSON.parse(JSON.stringify(x))
  let me = null
  const authSubs = new Set()
  const seed = () => {
    if (store.__seeded) return
    const day = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10)
    CREW.forEach((c, i) => {
      const id = 'demo-' + i
      const activity = {}
      for (let d = 0; d < 40; d++) if (Math.random() < [0.9, 0.7, 0.5][i] || d < [9, 3, 0][i]) activity[day(d)] = 1 + Math.floor(Math.random() * 6)
      store['users/' + id] = { id, uid: id, email: c.email, name: c.nick, nick: c.nick, activity, progress: {}, dsa: {}, focus: ['de'] }
    })
    store.__seeded = true
  }
  seed()
  return {
    demoSeed: (fn) => { if (!store.__seeded2) { fn(store); store.__seeded2 = true; save() } },
    onAuth: (cb) => { authSubs.add(cb); cb(me); return () => authSubs.delete(cb) },
    signIn: async () => { me = { uid: 'demo-0', email: CREW[0].email, name: CREW[0].nick, photo: '' }; authSubs.forEach((f) => f(me)) },
    signOut: async () => { me = null; authSubs.forEach((f) => f(me)) },
    watchDoc: (path, cb) => { const f = () => cb(store[path] ? clone({ id: path.split('/').pop(), ...store[path] }) : null); subs.add(f); f(); return () => subs.delete(f) },
    watchCol: (path, cb, o = {}) => {
      const f = () => {
        let rows = Object.entries(store).filter(([k]) => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1)
          .map(([k, v]) => clone({ id: k.split('/').pop(), ...v }))
        if (o.orderBy) rows.sort((a, b) => ((a[o.orderBy] ?? 0) - (b[o.orderBy] ?? 0)) * (o.desc ? -1 : 1))
        if (o.limit) rows = o.desc ? rows.slice(0, o.limit) : rows.slice(-o.limit)
        cb(rows)
      }
      subs.add(f); f(); return () => subs.delete(f)
    },
    setDoc: async (path, data, merge = true) => { store[path] = merge ? deepMerge(store[path] || {}, clone(data)) : deepMerge({}, data); save() },
    updateDoc: async (path, patch) => { store[path] = store[path] || {}; for (const [k, v] of Object.entries(patch)) setPath(store[path], k, v); save() },
    addDoc: async (path, data) => { const id = uid8(); store[path + '/' + id] = clone(data); save(); return id },
    delDoc: async (path) => { delete store[path]; save() },
  }
}

export async function getBackend() {
  if (!engine) engine = DEMO ? demoEngine() : await firebaseEngine()
  return engine
}
export const be = () => engine
