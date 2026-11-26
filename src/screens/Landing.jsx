import { Echo } from '../art.jsx'
import { CrewArt, Person } from '../people.jsx'
import { CREW } from '../config.js'
import { BASE } from '../data/roadmap.js'
import { COLORS, CHAR_DEFAULT } from '../lib/logic.js'
import { Logo } from '../App.jsx'

const FEATURES = [
  ['☀', 'Today', 'Your next topic in each focus track, the 2-hour DSA block, and a shared study timer.'],
  ['⟿', 'Roadmap', 'Ten tracks from basics to pro, plus a blended journey. Edit it together or keep your own version.'],
  ['⚑', 'Crew', 'See the gap between the three of you on every track: streaks, XP, badges and heatmaps.'],
  ['◫', 'Proof wall', 'Post a photo of your notes or code for every topic you finish.'],
  ['✉', 'Chat', 'A quiet group chat with photos, GIFs, replies and reactions.'],
  ['✎', 'Board & planner', 'A live whiteboard for system designs, and a week planner you can type into.'],
]

export default function Landing({ onSignIn, denied }) {
  const order = ['specs', 'polo', 'waves']
  const colorFor = (who) => COLORS[CHAR_DEFAULT.indexOf(who)]
  const nickFor = (who) => CREW[CHAR_DEFAULT.indexOf(who)]?.nick || ''
  return (
    <div className="landing">
      <nav className="l-nav">
        <Logo />
        <div className="l-links"><a href="#crew-sec">The crew</a><a href="#map-sec">Roadmap</a><a href="#feat-sec">Inside</a></div>
        <button className="btn sky" onClick={onSignIn}>Sign in</button>
      </nav>

      <header className="l-hero">
        <Echo text="Study together" rows={5} />
        <div className="l-hero-art"><CrewArt order={order} colors={order.map(colorFor)} /></div>
      </header>

      <section className="l-pitch">
        <div className="l-pitch-in">
          <h1>Three friends.<br />One roadmap.<br /><span className="hl">No excuses.</span></h1>
          <div>
            <p>A private study headquarters for going from full stack to data engineering, cloud and AI — together. Everyone moves at their own pace. Everyone can see where the others are.</p>
            <button className="btn big sky" onClick={onSignIn}><GoogleG /> Continue with Google</button>
            {denied && <p className="warn">{denied} can't sign in yet.</p>}
          </div>
        </div>
      </section>

      <section className="l-crew" id="crew-sec">
        <h2 className="l-h">The crew</h2>
        <div className="l-crew-grid">
          {order.map((who) => (
            <figure key={who} className="l-card">
              <div className="l-card-art"><Person who={who} height={300} sun={colorFor(who)} /></div>
              <figcaption><b>{nickFor(who)}</b><span>full stack → data engineering</span></figcaption>
            </figure>))}
        </div>
      </section>

      <section className="l-map" id="map-sec">
        <h2 className="l-h">The roadmap</h2>
        <p className="l-sub">{BASE.tracks.length} tracks · {BASE.ALL.length} topics · {BASE.total} concepts. Basics to pro, with free resources and a clear “done when” for every topic.</p>
        <div className="l-map-list">
          {BASE.tracks.map((t) => (
            <div key={t.id} className="l-map-row"><span className="l-glyph">{t.glyph}</span><b>{t.title}</b><em>{t.nodes.length} topics</em></div>))}
        </div>
      </section>

      <section className="l-feat" id="feat-sec">
        <h2 className="l-h">What's inside</h2>
        <div className="l-feat-grid">
          {FEATURES.map(([g, t, d]) => <div key={t} className="l-feat-card"><span>{g}</span><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      <footer className="l-foot">
        <Echo text="Let's go" rows={3} />
        <button className="btn big" onClick={onSignIn}><GoogleG /> Continue with Google</button>
        <p className="mono">made by the crew · st aloysius, mangaluru</p>
      </footer>
    </div>
  )
}

export const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
)
