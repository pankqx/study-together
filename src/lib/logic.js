import { ALL_NODES, NODE, TRACKS, TOTAL_CONCEPTS, conceptId, nodeProgress, trackProgress } from '../data/roadmap.js'
import { CREW } from '../config.js'

export const COLORS = ['#ef3b2d', '#ffc93c', '#d29457', '#7b61ff', '#18b38a'] // pepperoni, cheese, crust
export const inkOn = (c) => (['#ffc93c', '#d29457'].includes(c) ? '#202227' : '#ffffff')
export const today = (d = new Date()) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10) }
export const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return today(d) }

export function crewIndex(email) { const i = CREW.findIndex((c) => c.email.toLowerCase() === (email || '').toLowerCase()); return i }
export function colorOf(u) { const i = crewIndex(u?.email); return COLORS[(i < 0 ? 4 : i) % COLORS.length] }
export function nickOf(u) { const i = crewIndex(u?.email); return u?.nick || (i >= 0 ? CREW[i].nick : null) || (u?.name || 'Someone').split(' ')[0] }
export const initial = (u) => nickOf(u).slice(0, 1).toUpperCase()

export function streak(activity = {}) {
  let d = today(), s = 0
  if (!activity[d]) d = addDays(d, -1) // today not yet counted — streak still alive
  while (activity[d]) { s++; d = addDays(d, -1) }
  return s
}
export function bestStreak(activity = {}) {
  const days = Object.keys(activity).filter((k) => activity[k]).sort()
  let best = 0, run = 0, prev = null
  for (const d of days) { run = prev && addDays(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d }
  return best
}

export function stats(u, posts = []) {
  const p = u?.progress || {}
  const ticks = Object.keys(p).length
  const nodesDone = ALL_NODES.filter((nd) => nodeProgress(nd, p).pct === 1).length
  const tracksDone = TRACKS.filter((t) => trackProgress(t, p).pct === 1).length
  const dsaDays = Object.keys(u?.dsa || {}).length
  const myPosts = posts.filter((x) => x.uid === u?.id).length
  const xp = ticks * 10 + nodesDone * 50 + tracksDone * 300 + dsaDays * 20 + myPosts * 15
  return { ticks, nodesDone, tracksDone, dsaDays, posts: myPosts, xp, pct: ticks / TOTAL_CONCEPTS, streak: streak(u?.activity), best: bestStreak(u?.activity), todayCount: u?.activity?.[today()] || 0 }
}

export const RANKS = [
  [0, 'Hello World'], [300, 'Intern'], [1000, 'Junior Engineer'], [2200, 'Engineer'], [3800, 'Senior Engineer'],
  [5600, 'Staff Engineer'], [7500, 'Principal'], [9500, 'Data Wizard'],
]
export function rank(xp) { let r = RANKS[0], next = null; for (let i = 0; i < RANKS.length; i++) { if (xp >= RANKS[i][0]) { r = RANKS[i]; next = RANKS[i + 1] || null } } return { title: r[1], at: r[0], next } }

export const BADGES = [
  { id: 'first', glyph: '✦', name: 'First tick', test: (s) => s.ticks >= 1 },
  { id: 'fifty', glyph: '◆', name: '50 concepts', test: (s) => s.ticks >= 50 },
  { id: 'twohundred', glyph: '⬢', name: '200 concepts', test: (s) => s.ticks >= 200 },
  { id: 'node', glyph: '●', name: 'Topic cleared', test: (s) => s.nodesDone >= 1 },
  { id: 'ten-nodes', glyph: '◉', name: '10 topics', test: (s) => s.nodesDone >= 10 },
  { id: 'track', glyph: '★', name: 'Track master', test: (s) => s.tracksDone >= 1 },
  { id: 's7', glyph: '🔥', name: '7-day streak', test: (s) => s.best >= 7 },
  { id: 's30', glyph: '☄', name: '30-day streak', test: (s) => s.best >= 30 },
  { id: 's100', glyph: '♛', name: '100-day streak', test: (s) => s.best >= 100 },
  { id: 'dsa20', glyph: '⌗', name: '20 DSA days', test: (s) => s.dsaDays >= 20 },
  { id: 'proof10', glyph: '◫', name: '10 proofs posted', test: (s) => s.posts >= 10 },
]

export function nextUp(trackId, progress) {
  const t = TRACKS.find((x) => x.id === trackId)
  if (!t) return null
  return t.nodes.find((nd) => nodeProgress(nd, progress).pct < 1) || null
}
export const remainingConcepts = (nd, progress) => nd.concepts.filter((c) => !progress?.[conceptId(nd.id, c)])

export function compressImage(file, max = 1280, quality = 0.72) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => {
      let { width: w, height: h } = img
      const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s)
      const c = document.createElement('canvas'); c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      let q = quality, url = c.toDataURL('image/jpeg', q)
      while (url.length > 700_000 && q > 0.3) { q -= 0.1; url = c.toDataURL('image/jpeg', q) }
      URL.revokeObjectURL(img.src); res(url)
    }
    img.onerror = rej
    img.src = URL.createObjectURL(file)
  })
}

export function timeAgo(t) {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return 'now'; if (s < 3600) return Math.floor(s / 60) + 'm'; if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

export { NODE }
