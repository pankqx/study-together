import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore } from './store.jsx'
import { DEMO } from './config.js'
import { Avatar } from './ui.jsx'
import Landing from './screens/Landing.jsx'
import Profile from './screens/Profile.jsx'
import Today from './screens/Today.jsx'
import Roadmap from './screens/Roadmap.jsx'
import Crew from './screens/Crew.jsx'
import Feed from './screens/Feed.jsx'
import Chat from './screens/Chat.jsx'
import Planner from './screens/Planner.jsx'
import Dsa from './screens/Dsa.jsx'
import Log from './screens/Log.jsx'
import Welcome from './screens/Welcome.jsx'
import { Sheet } from './ui.jsx'
const Board = lazy(() => import('./screens/Board.jsx'))

// the four things you use every day…
const MAIN = [['today', 'Today', '☀'], ['roadmap', 'Roadmap', '⟿'], ['dsa', 'DSA', '⌗'], ['log', 'Log', '✎']]
// …and everything else, one tap away
const MORE = [['crew', 'Crew', '⚑', 'Standings, streaks and badges'], ['feed', 'Proof wall', '◫', 'Photos of what you studied']]
// planner & board live at the bottom of Today; these routes still work
const SUB = ['plan', 'board']

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
  useEffect(() => { const f = () => setProfile(true); window.addEventListener('st:profile', f); return () => window.removeEventListener('st:profile', f) }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [tab])

  if (auth === undefined) return <div className="boot"><Logo big /></div>
  if (!auth) return <Landing onSignIn={signIn} denied={denied} />

  return (
    <div className={'shell tab-' + tab}>
      <main className={'main' + (tab === 'board' && rest[0] ? ' full' : '') + (['roadmap', 'dsa', 'log'].includes(tab) ? ' wide' : '')}>
        {tab === 'today' && <Today />}
        {tab === 'roadmap' && <Roadmap track={rest[0]} node={rest[1]} />}
        {tab === 'crew' && <Crew />}
        {tab === 'feed' && <Feed />}
        {tab === 'chat' && <Chat />}
        {tab === 'board' && <Suspense fallback={<div className="loading">loading the canvas…</div>}><Board id={rest[0]} /></Suspense>}
        {tab === 'plan' && <Planner />}
        {tab === 'dsa' && <Dsa />}
        {tab === 'log' && <Log />}
      </main>
      <Profile open={profile} onClose={() => setProfile(false)} />
      {me && !me.onboarded && <Welcome />}
      <Sheet open={more} onClose={() => setMore(false)} title="More">
        <div className="more-grid">
          {MORE.map(([id, label, g, d]) => <a key={id} href={'#' + id} className={'more-item' + (tab === id ? ' on' : '')}><span>{g}</span><b>{label}</b><small>{d}</small></a>)}
          <button className="more-item" onClick={() => { setMore(false); setProfile(true) }}><span>☺</span><b>Profile</b><small>Portrait, colour, tracks, theme</small></button>
        </div>
        {DEMO && <p className="demo-note">Demo mode — data lives only in this browser until Firebase is connected.</p>}
      </Sheet>
      <nav className="bottom-nav">
        {MAIN.map(([id, label, g]) => <a key={id} href={'#' + id} className={(tab === id || (id === 'today' && SUB.includes(tab))) ? 'on' : ''}><span>{g}</span><small>{label}</small></a>)}
        <button className={MORE.some(([id]) => id === tab) ? 'on' : ''} onClick={() => setMore(true)}><span>☰</span><small>More</small></button>
      </nav>
    </div>
  )
}

export function Logo({ big }) {
  return <span className={'logo' + (big ? ' big' : '')}><i className="dot a" /><i className="dot b" /><i className="dot c" /><span>study<em>/</em>together</span></span>
}
