import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getBackend, DEL, inc, uid8 } from './lib/backend.js'
import { DEMO, CREW, OPEN_SIGNUP } from './config.js'
import { conceptId, resolve, BASE } from './data/roadmap.js'
import { crewIndex, today, nickOf } from './lib/logic.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [be, setBe] = useState(null)
  const [auth, setAuth] = useState(undefined) // undefined = loading, null = signed out
  const [denied, setDenied] = useState(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [teamLayer, setTeamLayer] = useState(null)
  const [myLayer, setMyLayer] = useState(null)
  const [notes, setNotes] = useState({})
  const [theme, setTheme] = useState(() => (localStorage.getItem('st-theme') === 'ink' ? 'ink' : 'sky'))

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('st-theme', theme) }, [theme])

  useEffect(() => { getBackend().then((b) => { setBe(b); b.onAuth(async (u) => {
    if (u && !DEMO && !OPEN_SIGNUP && crewIndex(u.email) < 0) { setDenied(u.email); await b.signOut(); return }
    if (u) {
      setDenied(null)
      await b.setDoc('users/' + u.uid, { id: u.uid, email: u.email || '', name: u.name || '', photo: u.photo || '', lastSeen: Date.now() })
    }
    setAuth(u)
  }) }) }, [])

  useEffect(() => {
    if (!be || !auth) return
    if (DEMO) seedDemo(be)
    const offs = [
      be.watchCol('users', setUsers),
      be.watchCol('posts', setPosts, { orderBy: 'at', desc: true, limit: 120 }),
      be.watchDoc('roadmaps/team', (d) => setTeamLayer(d ? { ...d, name: 'team' } : null)),
      be.watchDoc('roadmaps/' + auth.uid, (d) => setMyLayer(d ? { ...d, name: 'mine' } : null)),
      be.watchDoc('notes/' + auth.uid, (d) => setNotes(d?.nodes || {})),
    ]
    return () => offs.forEach((f) => f())
  }, [be, auth])

  const me = users.find((u) => u.id === auth?.uid) || (auth && { id: auth.uid, email: auth.email, name: auth.name, progress: {}, activity: {} })
  const crew = useMemo(() => [...users].sort((a, b) => ((crewIndex(a.email) + 99) % 99) - ((crewIndex(b.email) + 99) % 99)), [users])

  // roadmaps: the team one is the shared yardstick; "mine" = team + my own edits on top
  const rmTeam = useMemo(() => resolve([teamLayer]), [teamLayer])
  const rmMine = useMemo(() => resolve([teamLayer, myLayer]), [teamLayer, myLayer])
  const mode = me?.rmMode === 'mine' ? 'mine' : 'team'
  const rm = mode === 'mine' ? rmMine : rmTeam

  const api = useMemo(() => {
    if (!be || !auth) return {}
    const path = 'users/' + auth.uid
    const bump = (n = 1) => ({ ['activity.' + today()]: inc(n) })
    const layerPath = (scope) => (scope === 'team' ? 'roadmaps/team' : 'roadmaps/' + auth.uid)
    const ensureLayer = (scope) => be.setDoc(layerPath(scope), { updatedAt: Date.now(), updatedBy: auth.uid })
    const log = (scope, action, title, trackId) => be.addDoc('roadmapLog', { uid: auth.uid, scope, action, title: title || '', track: trackId || '', at: Date.now() })
    return {
      toggleConcept: (nodeId, c, on) => be.updateDoc(path, { ['progress.' + conceptId(nodeId, c)]: on ? Date.now() : DEL, ...(on ? bump() : {}) }),
      setNodeDone: (nd, on) => be.updateDoc(path, { ...Object.fromEntries(nd.concepts.map((c) => ['progress.' + conceptId(nd.id, c), on ? Date.now() : DEL])), ...(on ? bump() : {}) }),
      toggleDSA: (on) => be.updateDoc(path, { ['dsa.' + today()]: on ? Date.now() : DEL, ...(on ? bump() : {}) }),
      setFocus: (focus) => be.updateDoc(path, { focus }),
      setMyTracks: (myTracks) => be.updateDoc(path, { myTracks }),
      finishOnboarding: (p) => be.updateDoc(path, { ...p, onboarded: true }),
      // DSA log — one doc per solved problem
      logProblem: async (pr) => { await be.addDoc('problems', { ...pr, uid: auth.uid, at: Date.now() }); await be.updateDoc(path, { ['dsa.' + today()]: Date.now(), ...bump() }) },
      updateProblem: (id, patch) => be.updateDoc('problems/' + id, patch),
      deleteProblem: (id) => be.delDoc('problems/' + id),
      setStudying: (until, label) => be.updateDoc(path, { studying: until ? { until, label: label || '' } : DEL }),
      setCurrent: (nodeId) => be.updateDoc(path, { current: nodeId || DEL }),
      setMode: (m) => be.updateDoc(path, { rmMode: m }),
      updateProfile: (p) => be.updateDoc(path, p),
      logActivity: (n = 1) => be.updateDoc(path, bump(n)),
      addPost: async (p) => { await be.addDoc('posts', { ...p, uid: auth.uid, at: Date.now(), reactions: {} }); await be.updateDoc(path, bump()) },
      reactPost: (id, emoji, on) => be.updateDoc('posts/' + id, { [`reactions.${emoji}.${auth.uid}`]: on ? true : DEL }),
      deletePost: (id) => be.delDoc('posts/' + id),
      saveNote: async (nodeId, text) => { await be.setDoc('notes/' + auth.uid, { owner: auth.uid }); await be.updateDoc('notes/' + auth.uid, { ['nodes.' + nodeId]: text ? { text, at: Date.now() } : DEL }) },
      // roadmap editing — scope is 'team' (everyone sees it) or 'mine' (only you)
      saveNode: async (scope, node, isNew) => {
        await ensureLayer(scope)
        const id = node.id || 'n-' + uid8()
        const clean = { id, track: node.track, title: node.title.trim() || 'Untitled topic', level: node.level || 'core', doneWhen: (node.doneWhen || '').trim(),
          concepts: node.concepts.filter((c) => c.text.trim()).map((c) => ({ id: c.id || 'c-' + uid8(), text: c.text.trim() })),
          resources: node.resources.filter((r) => r.t.trim() && r.u.trim()).map((r) => ({ t: r.t.trim(), u: r.u.trim() })),
          editedBy: auth.uid, editedAt: Date.now() }
        await be.updateDoc(layerPath(scope), { ['nodes.' + id]: clean, updatedAt: Date.now(), updatedBy: auth.uid })
        await log(scope, isNew ? 'added' : 'edited', clean.title, clean.track)
        return id
      },
      deleteNode: async (scope, nd) => { await ensureLayer(scope); await be.updateDoc(layerPath(scope), { ['nodes.' + nd.id]: { deleted: true, editedBy: auth.uid, editedAt: Date.now() } }); await log(scope, 'removed', nd.title, nd.track) },
      resetNode: async (scope, nd) => { await be.updateDoc(layerPath(scope), { ['nodes.' + nd.id]: DEL }); await log(scope, 'reset', nd.title, nd.track) },
      moveNode: async (scope, track, nd, dir) => {
        const ids = track.nodes.map((x) => x.id); const i = ids.indexOf(nd.id), j = i + dir
        if (i < 0 || j < 0 || j >= ids.length) return
        ;[ids[i], ids[j]] = [ids[j], ids[i]]
        await ensureLayer(scope); await be.updateDoc(layerPath(scope), { ['order.' + track.id]: ids })
      },
      resetMine: async () => { await be.setDoc('roadmaps/' + auth.uid, { nodes: {}, order: {}, updatedAt: Date.now() }, false); await log('mine', 'reset', 'personal roadmap') },
      copyMineToTeam: async () => {
        if (!myLayer) return
        await ensureLayer('team')
        const patch = { updatedAt: Date.now(), updatedBy: auth.uid }
        for (const [id, n] of Object.entries(myLayer.nodes || {})) patch['nodes.' + id] = n
        for (const [tid, ids] of Object.entries(myLayer.order || {})) patch['order.' + tid] = ids
        await be.updateDoc('roadmaps/team', patch); await log('team', 'merged personal edits into', 'team roadmap')
      },
    }
  }, [be, auth, myLayer])

  const value = { be, auth, me, crew, users, posts, denied, theme, setTheme, api, notes, rm, rmTeam, rmMine, mode, teamLayer, myLayer,
    signIn: () => be?.signIn(), signOut: () => be?.signOut() }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Give the demo crew some believable progress so every screen has something to show.
function seedDemo(be) {
  be.demoSeed?.((store) => {
    const shares = [0.34, 0.22, 0.12]
    CREW.forEach((c, i) => {
      const u = store['users/demo-' + i]; if (!u) return
      u.progress = u.progress || {}
      for (const nd of BASE.ALL) {
        const trackBias = { fe: 1.6, be: 1.4, db: 1.1, dsa: 1.2, ops: 0.8, sd: 0.6, cloud: 0.5, de: 0.4, ai: 0.25, x: 0.15, cap: 0.1 }[nd.track] || 0.5
        nd.concepts.forEach((cc) => { if (Math.random() < shares[i] * trackBias) u.progress[conceptId(nd.id, cc)] = Date.now() - Math.random() * 30 * 864e5 })
      }
      u.dsa = {}; for (let d = 0; d < [18, 9, 4][i]; d++) u.dsa[today(new Date(Date.now() - d * 864e5))] = 1
      u.current = ['db-sql2', 'de-spark', 'cld-iam'][i]
    })
    const t = Date.now()
    store['posts/p1'] = { uid: 'demo-1', at: t - 3 * 36e5, text: 'Finally get window functions. LAG() is magic. 🧠', node: 'db-sql2', reactions: { fire: { 'demo-0': true } } }
    store['posts/p2'] = { uid: 'demo-2', at: t - 26 * 36e5, text: 'Docker multi-stage build: image went from 1.1 GB to 140 MB.', node: 'ops-docker', reactions: {} }
    store['posts/p3'] = { uid: 'demo-0', at: t - 50 * 36e5, text: 'Day of SQL. Notes from SQLBolt done ✅', node: 'db-sql', reactions: { clap: { 'demo-1': true, 'demo-2': true } } }
    store['messages/m1'] = { uid: 'demo-1', at: t - 2 * 36e5, text: 'who is studying tonight?', reactions: {} }
    store['messages/m2'] = { uid: 'demo-0', at: t - 2 * 36e5 + 60e3, text: 'me — doing Airflow DAGs after DSA', reactions: { fire: { 'demo-1': true } } }
    store['messages/m3'] = { uid: 'demo-2', at: t - 1.5 * 36e5, text: 'join the study room at 9, pomodoro race 🍅', reactions: {} }
    store['roadmaps/team'] = { nodes: { 'n-demo1': { id: 'n-demo1', track: 'de', title: 'Data engineering interview prep', level: 'pro', doneWhen: 'You can answer 30 common DE interview questions out loud.', concepts: [{ id: 'c-1', text: 'SQL interview patterns' }, { id: 'c-2', text: 'Pipeline design questions' }, { id: 'c-3', text: 'Spark tuning questions' }], resources: [{ t: 'DataLemur', u: 'https://datalemur.com/' }], editedBy: 'demo-1', editedAt: t - 5 * 36e5 } } }
    const PR = [['two-sum', 'Two Sum', 'easy', 'dsa-hash', 0, 'hash map of value → index'], ['valid-parentheses', 'Valid Parentheses', 'easy', 'dsa-stack', 0, ''], ['longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'medium', 'dsa-two', 1, 'sliding window + last-seen map'],
      ['two-sum', 'Two Sum', 'easy', 'dsa-hash', 1, ''], ['number-of-islands', 'Number of Islands', 'medium', 'dsa-graph', 1, 'BFS from every unvisited land cell'], ['merge-k-sorted-lists', 'Merge k Sorted Lists', 'hard', 'dsa-heap', 1, 'heap of (val, i, node)'],
      ['reverse-linked-list', 'Reverse Linked List', 'easy', 'dsa-ll', 2, 'draw it first'], ['binary-search', 'Binary Search', 'easy', 'dsa-bs', 0, ''], ['climbing-stairs', 'Climbing Stairs', 'easy', 'dsa-dp', 0, 'it is fibonacci'], ['coin-change', 'Coin Change', 'medium', 'dsa-dp', 1, '']]
    PR.forEach(([slug, title, difficulty, pattern, who, note], k) => { store['problems/pr' + k] = { uid: 'demo-' + who, slug, title, url: `https://leetcode.com/problems/${slug}/`, platform: 'LeetCode', difficulty, pattern, status: k === 2 ? 'revisit' : 'solved', note, at: t - k * 7 * 36e5 } })
    const day = (n) => today(new Date(t - n * 864e5))
    store['logs/demo-1_' + day(0)] = { uid: 'demo-1', day: day(0), updatedAt: t - 2 * 36e5, createdAt: t - 3 * 36e5,
      studied: [{ key: 'de-spark', nodeId: 'de-spark', title: 'Apache Spark' }, { key: 'db-idx', nodeId: 'db-idx', title: 'Indexing & query optimisation' }],
      summary: 'Spark is lazy: transformations only build a plan, actions run it. Shuffles are the expensive part — a join on a skewed key sends most rows to one executor. Broadcast the small table and the shuffle disappears.',
      confused: 'When exactly does Spark decide to broadcast on its own?', teach: { t1: { key: 'de-spark', title: 'Apache Spark', nodeId: 'de-spark', done: false } },
      comments: { c1: { uid: 'demo-0', text: 'explain the skew part on the call, I still don’t get salting', at: t - 36e5 } } }
    store['logs/demo-2_' + day(1)] = { uid: 'demo-2', day: day(1), updatedAt: t - 26 * 36e5, createdAt: t - 26 * 36e5,
      studied: [{ key: 'cld-iam', nodeId: 'cld-iam', title: 'Identity & security' }, { key: 'dm-seo', nodeId: 'dm-seo', title: 'SEO' }],
      summary: 'IAM roles are like temporary badges — nobody should carry the master key. Also learnt that search intent matters more than the keyword itself.',
      confused: '', teach: { t1: { key: 'cld-iam', title: 'Identity & security', nodeId: 'cld-iam', done: true, doneAt: t - 20 * 36e5, doneBy: 'demo-0' } }, comments: {} }
    store['calls/k1'] = { at: t - 4 * 864e5, by: 'demo-1', mode: 'call', present: ['demo-0', 'demo-1', 'demo-2'], notes: 'Ravi walked us through SQL window functions. Pank to revise CTEs. Merel explains IAM next time.' }
    store['meta/team'] = { nextCall: { at: day(-2) + 'T20:00', mode: 'call' } }
    store['roadmapLog/l1'] = { uid: 'demo-1', scope: 'team', action: 'added', title: 'Data engineering interview prep', track: 'de', at: t - 5 * 36e5 }
  })
}
