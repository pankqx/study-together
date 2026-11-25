import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore } from './store.jsx'
import { DEMO } from './config.js'
import { Avatar } from './ui.jsx'
import { stats } from './lib/logic.js'
import Today from './screens/Today.jsx'
import Roadmap from './screens/Roadmap.jsx'
import Crew from './screens/Crew.jsx'
import Feed from './screens/Feed.jsx'
import Chat from './screens/Chat.jsx'
import Planner from './screens/Planner.jsx'
const Board = lazy(() => import('./screens/Board.jsx'))

const TABS = [
  ['today', 'Today', '☀'], ['roadmap', 'Roadmap', '⟿'], ['crew', 'Crew', '⚑'], ['feed', 'Proof', '◫'],
  ['chat', 'Chat', '✉'], ['board', 'Board', '✎'], ['plan', 'Planner', '▦'],
]

const useHash = () => {
  const read = () => (location.hash.slice(1) || 'today').split('/')
  const [h, setH] = useState(read)
  useEffect(() => { const f = () => setH(read()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  return h
}
export const go = (...p) => { location.hash = p.join('/') }

export default function App() {
  const { auth, me, posts, denied, signIn, signOut, theme, setTheme } = useStore()
  const [tab, ...rest] = useHash()

  if (auth === undefined) return <div className="boot"><Logo big /></div>
  if (!auth) return <Login onSignIn={signIn} denied={denied} />

  const s = stats(me, posts)
  return (
    <div className={'shell tab-' + tab}>
      <header className="top">
        <a className="brand" href="#today"><Logo /></a>
        <nav className="side-nav">{TABS.map(([id, label, g]) => <a key={id} href={'#' + id} className={tab === id ? 'on' : ''}><span>{g}</span>{label}</a>)}</nav>
        <div className="top-right">
          <span className="flame" title="Your streak"><b>{s.streak}</b>🔥</span>
          <button className="icon-btn" onClick={() => setTheme(theme === 'ink' ? 'paper' : 'ink')} title="Switch theme" aria-label="Switch theme">{theme === 'ink' ? '○' : '●'}</button>
          <button className="me-btn" onClick={() => confirm('Sign out?') && signOut()} title="Sign out"><Avatar u={me} size={30} /></button>
        </div>
      </header>
      {DEMO && <div className="demo-flag">demo mode · data lives in this browser · add Firebase config to go live</div>}
      <main className={'main' + (tab === 'board' ? ' full' : '')}>
        {tab === 'today' && <Today />}
        {tab === 'roadmap' && <Roadmap track={rest[0]} node={rest[1]} />}
        {tab === 'crew' && <Crew />}
        {tab === 'feed' && <Feed />}
        {tab === 'chat' && <Chat />}
        {tab === 'board' && <Suspense fallback={<div className="loading">loading the canvas…</div>}><Board id={rest[0]} /></Suspense>}
        {tab === 'plan' && <Planner />}
      </main>
      <nav className="bottom-nav">{TABS.map(([id, label, g]) => <a key={id} href={'#' + id} className={tab === id ? 'on' : ''}><span>{g}</span><small>{label}</small></a>)}</nav>
    </div>
  )
}

export function Logo({ big }) {
  return <span className={'logo' + (big ? ' big' : '')}><i className="dot a" /><i className="dot b" /><i className="dot c" /><span>study<em>/</em>together</span></span>
}

function Login({ onSignIn, denied }) {
  return (
    <div className="login">
      <div className="login-card">
        <Logo big />
        <h1>Three friends.<br />One roadmap.<br /><span className="hl">No excuses.</span></h1>
        <p className="mono">Full stack · DBMS · DevOps · Cloud · Data engineering · AI · System design · DSA</p>
        <button className="btn big" onClick={onSignIn}><GoogleG /> Continue with Google</button>
        {denied && <p className="warn">{denied} isn't on the crew list. Ask Pank to add you.</p>}
        <div className="login-dots" aria-hidden><i /><i /><i /></div>
      </div>
    </div>
  )
}

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
)
