import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore } from './store.jsx'
import { DEMO } from './config.js'
import { Avatar } from './ui.jsx'
import { stats } from './lib/logic.js'
import Landing from './screens/Landing.jsx'
import Profile from './screens/Profile.jsx'
import Today from './screens/Today.jsx'
import Roadmap from './screens/Roadmap.jsx'
import Crew from './screens/Crew.jsx'
import Feed from './screens/Feed.jsx'
import Chat from './screens/Chat.jsx'
import Planner from './screens/Planner.jsx'
import Dsa from './screens/Dsa.jsx'
import Welcome from './screens/Welcome.jsx'
import { Sheet } from './ui.jsx'
const Board = lazy(() => import('./screens/Board.jsx'))

// the four things you use every day…
const MAIN = [['today', 'Today', '☀'], ['roadmap', 'Roadmap', '⟿'], ['dsa', 'DSA', '⌗'], ['chat', 'Chat', '✉']]
// …and everything else, one tap away
const MORE = [['crew', 'Crew', '⚑', 'Standings, streaks and badges'], ['feed', 'Proof wall', '◫', 'Photos of what you studied'],
  ['plan', 'Planner', '▦', 'Your week, hour by hour'], ['board', 'Board', '✎', 'Whiteboard for designs and diagrams']]

const useHash = () => {
  const read = () => (location.hash.slice(1) || 'today').split('/')
  const [h, setH] = useState(read)
  useEffect(() => { const f = () => setH(read()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  return h
}
export const go = (...p) => { location.hash = p.join('/') }

export default function App() {
  const { auth, me, posts, denied, signIn, signOut, theme, setTheme, rm } = useStore()
  const [tab, ...rest] = useHash()
  const [profile, setProfile] = useState(false)
  const [more, setMore] = useState(false)
  useEffect(() => setMore(false), [tab])

  if (auth === undefined) return <div className="boot"><Logo big /></div>
  if (!auth) return <Landing onSignIn={signIn} denied={denied} />

  const s = stats(me, posts, rm)
  return (
    <div className={'shell tab-' + tab}>
      <header className="top">
        <a className="brand" href="#today"><Logo /></a>
        <nav className="side-nav">
          {MAIN.map(([id, label, g]) => <a key={id} href={'#' + id} className={tab === id ? 'on' : ''}><span>{g}</span>{label}</a>)}
          <span className="nav-sep" />
          {MORE.map(([id, label, g]) => <a key={id} href={'#' + id} className={'minor' + (tab === id ? ' on' : '')}><span>{g}</span>{label}</a>)}
        </nav>
        <div className="top-right">
          <span className="flame" title="Your streak"><b>{s.streak}</b>🔥</span>
          <button className="me-btn" onClick={() => setProfile(true)} title="Your profile"><Avatar u={me} size={32} /></button>
        </div>
      </header>
      {DEMO && <div className="demo-flag">demo mode · data lives in this browser · add Firebase config to go live</div>}
      <main className={'main' + (tab === 'board' && rest[0] ? ' full' : '') + (['roadmap', 'dsa'].includes(tab) ? ' wide' : '')}>
        {tab === 'today' && <Today />}
        {tab === 'roadmap' && <Roadmap track={rest[0]} node={rest[1]} />}
        {tab === 'crew' && <Crew />}
        {tab === 'feed' && <Feed />}
        {tab === 'chat' && <Chat />}
        {tab === 'board' && <Suspense fallback={<div className="loading">loading the canvas…</div>}><Board id={rest[0]} /></Suspense>}
        {tab === 'plan' && <Planner />}
        {tab === 'dsa' && <Dsa />}
      </main>
      <Profile open={profile} onClose={() => setProfile(false)} />
      {me && !me.onboarded && <Welcome />}
      <Sheet open={more} onClose={() => setMore(false)} title="More">
        <div className="more-grid">
          {MORE.map(([id, label, g, d]) => <a key={id} href={'#' + id} className={'more-item' + (tab === id ? ' on' : '')}><span>{g}</span><b>{label}</b><small>{d}</small></a>)}
          <button className="more-item" onClick={() => { setMore(false); setProfile(true) }}><span>☺</span><b>Profile</b><small>Portrait, colour, tracks, theme</small></button>
        </div>
      </Sheet>
      <nav className="bottom-nav">
        {MAIN.map(([id, label, g]) => <a key={id} href={'#' + id} className={tab === id ? 'on' : ''}><span>{g}</span><small>{label}</small></a>)}
        <button className={MORE.some(([id]) => id === tab) ? 'on' : ''} onClick={() => setMore(true)}><span>☰</span><small>More</small></button>
      </nav>
    </div>
  )
}

export function Logo({ big }) {
  return <span className={'logo' + (big ? ' big' : '')}><i className="dot a" /><i className="dot b" /><i className="dot c" /><span>study<em>/</em>together</span></span>
}
