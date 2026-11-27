// Capstone walkthroughs — Front end ladder
const S = (t, body, ...blocks) => ({ t, body, blocks })
const W = (title, intro, arch, steps, talk) => ({ title, intro, steps: [S('The architecture', 'What you are building, end to end:', { arch }), ...steps, S('Talk about it in interviews', talk)] })

export default {
  'fe-1': W('Walkthrough: Pixel-perfect landing page clone', 'Rebuild a real landing page with only HTML and CSS. 2–4 days. Teaches layout, responsive design and accessibility — the base of everything.',
    [['Source', ['3 screenshots: 375 / 768 / 1440 px']], ['Your build', ['index.html (semantic)', 'styles.css (tokens + layout)']], ['Ship', ['GitHub Pages', 'Lighthouse report']]],
    [
      S('1 · Pick and dissect the page', 'Choose a page with a hero, features grid, testimonial and footer (Linear, Vercel, Notion, Razorpay). Screenshot at 375, 768 and 1440 px. Draw boxes over the screenshots on your board: which parts are Grid, which are Flex?'),
      S('2 · Write the semantic outline first', 'No CSS yet. Get the structure right so it reads well even unstyled.', { code: `<header><nav aria-label="Main">…</nav></header>
<main>
  <section class="hero" aria-labelledby="hero-title"><h1 id="hero-title">…</h1><p>…</p><a class="btn" href="#">Get started</a></section>
  <section class="features"><h2>…</h2><ul class="cards">…</ul></section>
  <section class="quote"><figure><blockquote>…</blockquote><figcaption>…</figcaption></figure></section>
</main>
<footer>…</footer>`, lang: 'html' }),
      S('3 · Set up tokens and a reset', 'Measure colours, font sizes and spacing from the screenshot (DevTools on the real site helps). Put them in variables.', { code: `:root { --ink:#0f1115; --muted:#6b7280; --accent:#5b5bd6; --radius:14px;
  --s1:4px; --s2:8px; --s3:16px; --s4:24px; --s5:48px; --s6:96px;
  --h1: clamp(2.2rem, 6vw, 4.5rem); }
*,*::before,*::after { box-sizing:border-box } body { margin:0; font:16px/1.6 system-ui; color:var(--ink) }`, lang: 'css' }),
      S('4 · Lay out mobile first', 'Build the 375 px version: single column, generous spacing. Then add `min-width` media queries for 768 and 1440. Use Grid for the page sections and card grids, Flex inside components.', { code: `.cards { display:grid; gap:var(--s4); grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.hero { display:grid; gap:var(--s4); padding: var(--s6) var(--s3); }
@media (min-width: 900px) { .hero { grid-template-columns: 1.1fr .9fr; align-items:center; } }`, lang: 'css' }),
      S('5 · Images, motion and states', 'Responsive images with `srcset` and width/height (no layout shift). Hover, focus-visible and active states on every interactive element. Subtle entrance animation with `transform/opacity`, disabled for `prefers-reduced-motion`.'),
      S('6 · Audit and fix', 'Run Lighthouse (mobile). Fix every accessibility issue: contrast, alt text, heading order, link names. Tab through the whole page with the keyboard.', { cards: [['Target', 'Accessibility ≥ 95, Performance ≥ 90'], ['Compare', 'Overlay your build on the screenshot at each width'], ['Measure', 'CLS 0, LCP < 2.5 s on Slow 4G']] }),
      S('7 · Ship it', 'Deploy to GitHub Pages; README with before/after screenshots, the Lighthouse scores, and 3 layout decisions you made.'),
      S('Go further', 'Add a dark theme with tokens only; add a container-query card variant; rebuild one section in Tailwind and compare.'),
    ],
    '"I rebuilt Linear’s landing page from screenshots with semantic HTML and CSS Grid. I used design tokens and container queries; it scores 98 on Lighthouse accessibility with zero layout shift. The hardest part was the hero image causing CLS — fixed with explicit dimensions and fetchpriority."'),

  'fe-2': W('Walkthrough: Vanilla JS kanban board', 'A Trello-like board with no framework. 2–4 days. Teaches state management, events and DOM rendering — what React does for you.',
    [['State', ['{ columns, cards, filter } in one object']], ['Render', ['render(state) → DOM']], ['Events', ['Delegated listeners → actions → new state']], ['Persist', ['localStorage', 'undo stack']]],
    [
      S('1 · Model the state', 'One plain object is the single source of truth.', { code: `let state = {
  columns: [{ id: 'todo', title: 'To do' }, { id: 'doing', title: 'Doing' }, { id: 'done', title: 'Done' }],
  cards: [{ id: crypto.randomUUID(), col: 'todo', title: 'Learn closures', tag: 'js' }],
  filter: '',
}`, lang: 'javascript' }),
      S('2 · Write pure state functions', 'Every change is a function `(state, …) => newState` — never mutate. These are what you unit-test.', { code: `const addCard = (s, col, title) => ({ ...s, cards: [...s.cards, { id: crypto.randomUUID(), col, title }] })
const moveCard = (s, id, col) => ({ ...s, cards: s.cards.map((c) => (c.id === id ? { ...c, col } : c)) })
const removeCard = (s, id) => ({ ...s, cards: s.cards.filter((c) => c.id !== id) })`, lang: 'javascript' }),
      S('3 · Render from state', 'A `render()` that rebuilds the board from state (fine at this size). Escape user text with `textContent`, never `innerHTML` with user input.'),
      S('4 · One delegated listener', 'Handle clicks for all cards on the board element using `closest()` and `data-*` attributes — new cards work automatically.'),
      S('5 · Drag and drop + keyboard', 'HTML drag API (`dragstart`, `dragover`, `drop`) to move cards; for accessibility, a "Move to…" menu reachable by keyboard.'),
      S('6 · Persist and undo', 'After each action: push the previous state onto an undo stack and save to localStorage (try/catch). Ctrl+Z pops the stack.', { code: `function dispatch(next) { history.push(state); state = next; try { localStorage.setItem('kanban', JSON.stringify(state)) } catch {} render() }`, lang: 'javascript' }),
      S('7 · Test and ship', '10 Vitest tests for the pure functions, deploy to GitHub Pages, README with a GIF.'),
      S('Go further', 'Debounced search filter, tags with colours, sync two tabs with the `storage` event, export/import JSON.'),
    ],
    '"I built a kanban board in vanilla JS with a single immutable state object, pure update functions and a render function — basically React’s model by hand. Event delegation means one listener handles every card. Undo was trivial because state was immutable."'),

  'fe-3': W('Walkthrough: React + TypeScript explorer', 'A polished search app over a public API (GitHub, Open Library or TMDB). About 1 week. Teaches real-world React: typing, server state, routing and UX states.',
    [['UI', ['Search page', 'Detail page', 'Filters in URL']], ['Data', ['TanStack Query cache', 'zod-validated responses']], ['API', ['Public REST API']]],
    [
      S('1 · Scaffold', 'Vite + React + TypeScript (strict), React Router, TanStack Query, zod, ESLint/Prettier.', { code: `npm create vite@latest explorer -- --template react-ts
cd explorer && npm i react-router-dom @tanstack/react-query zod && npm i -D vitest @testing-library/react msw`, lang: 'bash' }),
      S('2 · Type the API with zod', 'Write schemas for the responses you use; infer types; parse every response so bad data fails loudly.'),
      S('3 · Search with the URL as state', 'Keep `q`, filters and page in search params so results are shareable and the back button works. Debounce typing by 300 ms.', { code: `const [params, setParams] = useSearchParams()
const q = params.get('q') ?? ''
const debounced = useDebounce(q, 300)
const { data, isPending, error } = useQuery({ queryKey: ['search', debounced, params.get('page')], queryFn: ({ signal }) => api.search(debounced, page, signal), enabled: debounced.length > 1 })`, lang: 'tsx' }),
      S('4 · Every state designed', 'Skeleton loading, empty ("No books match"), error with retry, and the success list. Keyed lists; images lazy-loaded.'),
      S('5 · Detail page and prefetch', 'Route `/item/:id`; prefetch details on hover with `queryClient.prefetchQuery` so it opens instantly.'),
      S('6 · Performance', 'Code-split the detail route with `lazy()`; check the bundle (< 200 kB gz); virtualise the list if you show hundreds of items.'),
      S('7 · Tests and deploy', 'MSW to mock the API; 5 component tests (search, empty, error, pagination, detail). Deploy to Vercel or Netlify with preview URLs.'),
      S('Go further', 'Favourites in localStorage, infinite scroll with IntersectionObserver, offline cache persistence, i18n.'),
    ],
    '"A React + TS explorer where the URL holds all UI state, TanStack Query handles caching and cancellation, and zod validates every response. I designed loading, empty and error states for every view and kept the bundle under 200 kB."'),

  'fe-4': W('Walkthrough: Your own design system', 'Tokens + 10 accessible components, documented in Storybook and published to npm. About 1–1.5 weeks.',
    [['Tokens', ['primitive', 'semantic', 'dark theme']], ['Components', ['Button', 'Input', 'Select', 'Dialog', 'Tabs', 'Toast', 'Tooltip', 'Badge', 'Card', 'Combobox']], ['Tooling', ['Storybook', 'Vitest + Testing Library', 'axe', 'npm publish']]],
    [
      S('1 · Package setup', 'Vite library mode (or tsup), TypeScript, Storybook, exports map, peerDependencies on React.'),
      S('2 · Tokens', 'CSS variables in layers: primitive → semantic. Dark theme swaps semantic values only.'),
      S('3 · Components with variants', 'Use cva for variants; forward refs; support `className` and `asChild`. Build complex ones (Dialog, Combobox, Tabs) on Radix primitives or follow the WAI-ARIA patterns exactly.'),
      S('4 · Every state in Storybook', 'Stories for default, hover, focus, disabled, loading, error, long text, dark mode. Add the a11y addon.'),
      S('5 · Behaviour tests', 'Testing Library: keyboard opens/closes the dialog, focus returns, Tab order in Tabs, Esc closes. axe on every story in CI.'),
      S('6 · Publish', '`npm publish` with semver and a CHANGELOG; deploy Storybook to GitHub Pages as documentation.'),
      S('7 · Dogfood', 'Use it in fe-5 or fe-7. Anything awkward to use is a design bug — fix it in the library.'),
      S('Go further', 'Visual regression tests (Chromatic/Playwright screenshots), a Figma file mirroring the tokens, codemods for a breaking change.'),
    ],
    '"I built and published a 10-component design system with semantic tokens and dark mode, documented in Storybook. Every component passes axe and keyboard tests; I used it in two other projects, which exposed API problems I then fixed."'),

  'fe-5': W('Walkthrough: Offline-first notes PWA', 'Notes that work without internet and sync cleanly. About 1–1.5 weeks. Teaches IndexedDB, service workers and sync conflicts.',
    [['Client', ['React UI', 'IndexedDB (Dexie)', 'Sync queue']], ['Service worker', ['App shell cache (Workbox)']], ['Server', ['Simple REST API or Firebase', 'updated_at per note']]],
    [
      S('1 · Local first', 'Every read and write goes to IndexedDB (Dexie). The UI never waits for the network.', { code: `const db = new Dexie('notes'); db.version(1).stores({ notes: 'id, updatedAt, dirty', queue: '++seq' })
await db.notes.put({ id, text, updatedAt: Date.now(), dirty: 1 })
await db.queue.add({ op: 'upsert', id })`, lang: 'javascript' }),
      S('2 · Installable app shell', 'vite-plugin-pwa (Workbox): precache the shell, manifest with icons, offline fallback page.'),
      S('3 · Sync engine', 'When online (`navigator.onLine` + `online` event + periodic), push queued changes, then pull changes since last sync timestamp. Mark notes clean after the server confirms.'),
      S('4 · Conflicts', 'Choose and document a strategy: last-writer-wins by updatedAt (simple), or keep both versions and let the user merge. Show a conflict badge.'),
      S('5 · Test offline for real', 'DevTools offline mode, then your phone in airplane mode: create, edit, delete, reconnect. Two devices editing the same note.'),
      S('6 · Ship', 'Deploy over HTTPS; Lighthouse PWA checks; README explains the sync design with a diagram.'),
      S('Go further', 'CRDT-based merging with Yjs, encrypted notes, background sync API, search with MiniSearch.'),
    ],
    '"An offline-first PWA: IndexedDB is the source of truth on the device, a queue syncs changes when online, and conflicts use last-writer-wins with a visible conflict copy. Tested by editing on two phones in airplane mode."'),

  'fe-6': W('Walkthrough: Real-time collaborative whiteboard', 'Several people draw on one canvas with live cursors. 2–3 weeks. Teaches canvas performance, CRDTs and realtime sync.',
    [['Client', ['Canvas renderer', 'Yjs document (shapes)', 'Awareness (cursors)']], ['Transport', ['y-websocket server']], ['Persistence', ['Snapshots to Postgres / S3']]],
    [
      S('1 · Canvas basics', 'Draw rectangles, freehand strokes and text on `<canvas>`; pan and zoom with a transform matrix; redraw in `requestAnimationFrame`.'),
      S('2 · Shared state with Yjs', 'Store shapes in a `Y.Map`; every client edits it; Yjs merges concurrent edits without conflicts.', { code: `const doc = new Y.Doc(); const shapes = doc.getMap('shapes')
const provider = new WebsocketProvider('wss://your-server', 'board-' + id, doc)
shapes.observe(() => scheduleRedraw())
shapes.set(shapeId, { type: 'rect', x, y, w, h, color })`, lang: 'javascript' }),
      S('3 · Presence', 'Yjs awareness for live cursors, names and colours; throttle updates to ~20/s.'),
      S('4 · Undo/redo per user', '`Y.UndoManager` scoped to the local user’s changes.'),
      S('5 · Performance', 'Profile with the Performance panel; only redraw dirty regions or use layers; keep 60 fps with 1,000+ shapes.'),
      S('6 · Persist and export', 'Save document snapshots periodically; export PNG/SVG.'),
      S('7 · Test with friends', 'Three browsers (and phones) editing at once; disconnect one and reconnect — nothing lost.'),
      S('Go further', 'Permissions (view/edit), comments pinned to shapes, AI "tidy up layout" button.'),
    ],
    '"A collaborative whiteboard using Yjs CRDTs over WebSockets, with presence cursors and per-user undo. I profiled rendering to keep 60 fps with 1,000 shapes and tested concurrent edits with offline reconnects."'),

  'fe-7': W('Walkthrough: Production Next.js SaaS front end', 'The front end of a real product — marketing site, auth, dashboard, settings, billing UI. 2–3 weeks. Your strongest front-end portfolio piece.',
    [['Marketing (static)', ['Landing', 'Pricing', 'Blog (MDX)']], ['App (dynamic, auth)', ['Dashboard', 'Settings', 'Billing']], ['Platform', ['Auth (Clerk/Auth.js)', 'API / DB', 'Sentry', 'Vercel']]],
    [
      S('1 · Plan the product', 'Pick a real use (e.g. "Study Together Pro" or a client idea). Write the page list, data model and the 5 key user journeys.'),
      S('2 · App Router skeleton', 'Route groups `(marketing)` and `(app)` with separate layouts; loading and error files; metadata per page.'),
      S('3 · Auth and protection', 'Managed auth; middleware redirects for the app group; authorisation checks again in server code.'),
      S('4 · Data with server components + actions', 'Fetch in server components, mutate with server actions (zod validation, auth inside), revalidate affected paths.'),
      S('5 · Polish the UX', 'Design system from fe-4 or shadcn/ui; optimistic updates; empty states; toasts; mobile layouts.'),
      S('6 · Quality gates', 'Playwright E2E for the 5 journeys in CI on preview URLs; axe checks; Web Vitals in the green on mobile.'),
      S('7 · Production readiness', 'Sentry with source maps, analytics, feature flag for one feature, security headers + CSP, i18n for two languages.'),
      S('Go further', 'Stripe/Razorpay test-mode billing UI, team invites, audit log page.'),
    ],
    '"A production-grade Next.js app: static marketing pages, an authenticated dashboard with server components and server actions, E2E tests gating every PR, green Core Web Vitals, Sentry monitoring and feature flags."'),
}
