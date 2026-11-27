// Front end — lessons 1–8
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'fe-web': {
    intro: 'Everything a front-end developer builds sits on HTTP, the browser and its rules. Understand these and debugging becomes easy.',
    concepts: [
      C('HTTP methods, status codes, headers', `A request has a **method**, a **URL**, **headers** and maybe a **body**; the response has a **status**, headers and a body.`,
        { table: { cols: ['Method', 'Meaning', 'Safe / idempotent'], rows: [['GET', 'Read', 'Safe, idempotent'], ['POST', 'Create / action', 'Neither'], ['PUT', 'Replace', 'Idempotent'], ['PATCH', 'Partial update', 'Usually not'], ['DELETE', 'Remove', 'Idempotent']] } },
        { cards: [['200 / 201 / 204', 'OK / Created / No content'], ['301 / 304', 'Moved permanently / Not modified (use cache)'], ['400 / 401 / 403 / 404', 'Bad request / Not logged in / Not allowed / Not found'], ['409 / 422 / 429', 'Conflict / Validation failed / Too many requests'], ['500 / 502 / 503', 'Server bug / Bad gateway / Unavailable']] }),
      C('URLs, DNS lookup, TLS handshake', `\`https://api.study.dev:443/logs?day=2026-11-27#top\` = scheme, host, port, path, query, fragment (the fragment never reaches the server). The browser resolves the host via **DNS**, opens a TCP connection, then a **TLS handshake** verifies the server certificate and agrees encryption keys — that is the padlock.`),
      C('What happens when you type a URL', `The classic interview question, as a flow:`,
        { steps: [['Parse & check cache', 'Is the page in the HTTP cache or a service worker?'], ['DNS', 'Name → IP (browser, OS, resolver caches).'], ['TCP + TLS', 'Connect and encrypt (HTTP/3 uses QUIC over UDP).'], ['Request', 'GET / with cookies and headers.'], ['Server responds', 'HTML streamed back.'], ['Parse HTML → DOM', 'Discover CSS, JS, images and fetch them.'], ['CSSOM, layout, paint', 'Pixels on screen; JS makes it interactive.']] }),
      C('Browser rendering: DOM, CSSOM, layout, paint, composite', `HTML → **DOM**, CSS → **CSSOM**; combined into a **render tree** → **layout** (sizes and positions) → **paint** (pixels) → **composite** (layers on the GPU).

Changing \`width\` or \`top\` triggers layout (expensive); \`transform\` and \`opacity\` only composite (cheap) — that is why animations should use them.`,
        { flow: ['HTML → DOM', 'CSS → CSSOM', 'Render tree', 'Layout', 'Paint', 'Composite'] }),
      C('Cookies, localStorage, sessionStorage', `- **Cookies** — sent with every request to their domain; can be **HttpOnly** (JS can't read them) — best for session tokens.
- **localStorage** — ~5 MB per origin, persists, JS-readable — fine for preferences, never for secrets.
- **sessionStorage** — per tab, cleared when the tab closes.`),
      C('Same-origin policy & CORS', `An **origin** = scheme + host + port. Browsers stop JS on one origin from reading responses from another, unless the server opts in with **CORS** headers (\`Access-Control-Allow-Origin\`). Non-simple requests (JSON bodies, custom headers) first send an **OPTIONS preflight**.`,
        pick('Your React app on localhost:5173 calls an API on localhost:8000 and gets a CORS error. Where is the fix?', ['In the React code', false], ['On the API server: allow origin http://localhost:5173', true, 'CORS is the server granting permission; the browser enforces it.'], ['Disable the browser', false])),
      C('Chrome DevTools: Elements, Network, Console, Performance', `- **Elements** — inspect and live-edit DOM and CSS.
- **Network** — every request: status, headers, timing, payload; throttle to "Slow 4G".
- **Console** — errors, logs, run JS.
- **Performance** — record and find long tasks, layout thrash and slow renders.
- **Application** — cookies, storage, service workers.`),
      D('Deep dive: debugging a "blank page" like a senior', `A systematic order beats guessing:`,
        { steps: [['Console', 'Any red error? It usually names the file and line.'], ['Network', 'Did the JS bundle 404? Did the API return 401/500?'], ['Elements', 'Is the root div empty or hidden by CSS?'], ['Reproduce small', 'Fresh incognito, cleared cache, different browser.'], ['Bisect', 'Which commit broke it? git bisect, or comment code out.']] }),
    ],
    quiz: [
      Q('Which status means "logged in but not allowed"?', ['401', '403', '404', '500'], 1, '401 = not authenticated; 403 = authenticated but forbidden.'),
      Q('Cheapest property to animate?', ['width', 'top', 'transform', 'margin'], 2, 'Compositor-only, no layout.'),
      Q('Best place for a session token?', ['localStorage', 'HttpOnly, Secure cookie', 'URL', 'sessionStorage'], 1, 'JS (and XSS) can’t read HttpOnly cookies.'),
      Q('A CORS error is fixed on…', ['The browser', 'The server that owns the API', 'The CDN only', 'DNS'], 1, 'The server sends allow headers.'),
    ],
    practice: 'Open DevTools on any site: find the slowest request in Network, the largest image, and record a Performance trace while scrolling.',
    explain: 'Explain "what happens when you type a URL" in 60 seconds without notes.',
  },

  'fe-html': {
    intro: 'HTML is the foundation that browsers, search engines and screen readers rely on. Semantic HTML gets you accessibility and SEO almost for free.',
    concepts: [
      C('Semantic elements & document outline', `Use elements for their meaning: \`header, nav, main, article, section, aside, footer\`, headings \`h1–h6\` in order, \`button\` for actions, \`a\` for navigation.`,
        { code: `<header><nav aria-label="Main">…</nav></header>
<main>
  <h1>Study Together</h1>
  <article>
    <h2>Today's log</h2>
    <p>…</p>
  </article>
</main>
<footer>…</footer>`, lang: 'html' },
        pick('Clickable element that opens a modal — which tag?', ['<div onclick>', false], ['<button>', true, 'Buttons are focusable, keyboard-operable and announced correctly for free.'], ['<a href="#">', false])),
      C('Forms: inputs, labels, validation attributes', `Every input needs a \`label\`. Use the right \`type\` (email, tel, number, date) for correct mobile keyboards, and built-in validation (\`required\`, \`minlength\`, \`pattern\`) as a first line of defence.`,
        { code: `<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required>
<label for="pin">PIN code</label>
<input id="pin" inputmode="numeric" pattern="[0-9]{6}" required>`, lang: 'html' }),
      C('Tables, lists, media (img, video, picture, srcset)', `Tables for tabular data only (with \`th\` and \`scope\`). Lists for groups. Responsive images ship the right size per screen:`,
        { code: `<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw"
     width="800" height="500" alt="Three friends studying at a table" loading="lazy">`, lang: 'html' },
        { note: 'Always set width and height to prevent layout shift (CLS).' }),
      C('Accessibility basics: alt text, labels, landmarks', `- **alt** describes the image's purpose; decorative images get \`alt=""\`.
- Every control has an accessible name (label, aria-label).
- Landmarks (header, nav, main, footer) let screen-reader users jump around.
- Everything works with a keyboard; focus is visible.`),
      C('ARIA: when to use it and when not to', `First rule of ARIA: **don't use ARIA if a native element does the job.** ARIA only changes what assistive tech announces — it adds no behaviour. Use it for custom widgets (tabs, comboboxes) and live updates (\`aria-live\`), following WAI-ARIA patterns.`),
      C('Meta tags, Open Graph & basic SEO', `\`title\` and \`meta description\` for search; Open Graph tags for link previews in WhatsApp/LinkedIn; \`viewport\` for mobile; one \`h1\`; canonical URLs.`,
        { code: `<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Study Together — learn and build with your crew</title>
<meta name="description" content="Roadmaps, DSA log and capstone builds for three friends.">
<meta property="og:title" content="Study Together">
<meta property="og:image" content="https://example.com/og.png">`, lang: 'html' }),
      D('Deep dive: test your page with only a keyboard', `Unplug the mouse for 5 minutes: Tab through everything. Can you see focus? Is the order logical? Can you open and close every menu and dialog, and escape with Esc? Can you submit forms? Most accessibility bugs show up in this one test.`),
    ],
    quiz: [
      Q('A decorative divider image should have…', ['alt="divider image"', 'alt=""', 'no alt attribute', 'aria-label'], 1, 'Empty alt hides it from screen readers.'),
      Q('First rule of ARIA?', ['Use it everywhere', 'Prefer native HTML elements', 'Only on divs', 'Never use it'], 1, 'Native elements bring behaviour and semantics.'),
      Q('Which attribute prevents layout shift for images?', ['loading', 'width and height', 'alt', 'srcset'], 1, 'Reserves space before it loads.'),
    ],
    practice: 'Do build fe-1 using only semantic HTML; run Lighthouse and get accessibility ≥ 95.',
    explain: 'Explain why <button> is better than <div onclick>.',
  },

  'fe-css': {
    intro: 'CSS is a layout language with rules. Learn the rules — cascade, box model, Flexbox, Grid — and layouts stop feeling like magic.',
    concepts: [
      C('Cascade, specificity, inheritance', `When rules conflict: origin and \`!important\` → **specificity** (inline > id > class/attribute/pseudo-class > element) → **order** (later wins). Some properties (color, font) **inherit** to children; most (margin, border) don't.`,
        { cards: [['#nav a', 'Specificity 1-0-1'], ['.menu .link', '0-2-0'], ['a:hover', '0-1-1'], ['@layer', 'Cascade layers: control order between whole groups of styles.']] }),
      C('Box model & box-sizing', `Every element is a box: content + padding + border + margin. With \`box-sizing: border-box\`, width includes padding and border — set it globally. Vertical margins between blocks **collapse**.`,
        { code: `*, *::before, *::after { box-sizing: border-box; }`, lang: 'css' }),
      C('Flexbox in depth', `One-dimensional layout (a row **or** a column). Parent: \`display:flex; justify-content\` (main axis), \`align-items\` (cross axis), \`gap\`, \`flex-wrap\`. Children: \`flex: grow shrink basis\`.`,
        { code: `.toolbar { display: flex; align-items: center; gap: 12px; }
.toolbar .spacer { flex: 1; }          /* pushes the rest to the right */
.card-row { display: flex; flex-wrap: wrap; gap: 16px; }
.card-row > * { flex: 1 1 240px; }      /* grow, shrink, min ~240px */`, lang: 'css' }),
      C('CSS Grid in depth', `Two-dimensional layout (rows **and** columns). Templates, named areas, \`fr\` units, and auto-fit for responsive cards without media queries.`,
        { code: `.page { display: grid; grid-template-columns: 240px 1fr; grid-template-areas: "side main"; gap: 24px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
@media (max-width: 700px) { .page { grid-template-columns: 1fr; grid-template-areas: "main" "side"; } }`, lang: 'css' },
        pick('A photo gallery with rows and columns that reflow by width?', ['Flexbox only', false], ['Grid with repeat(auto-fit, minmax())', true, 'Grid handles two dimensions and responsive columns cleanly.'], ['Floats', false])),
      C('Positioning, stacking context, z-index', `\`relative\` (offset, stays in flow), \`absolute\` (relative to nearest positioned ancestor), \`fixed\` (viewport), \`sticky\` (sticks while scrolling). z-index works **within a stacking context** — created by position+z-index, opacity < 1, transform, etc. That's why "z-index: 9999 doesn't work".`),
      C('Responsive design: units, media & container queries', `Mobile-first: base styles for small screens, \`min-width\` media queries to add. Units: \`rem\` (type), \`%\`/\`fr\` (layout), \`vw/dvh\` (viewport), \`ch\` (line length). **Container queries** style a component by **its own** width, not the screen.`,
        { code: `.card-wrap { container-type: inline-size; }
@container (min-width: 420px) { .card { display: grid; grid-template-columns: 120px 1fr; } }`, lang: 'css' }),
      C('Custom properties (CSS variables)', `Variables that cascade and can change at runtime — the basis of theming and design tokens.`,
        { code: `:root { --bg: #fff; --ink: #131416; --space: 8px; }
[data-theme="dark"] { --bg: #111214; --ink: #e9ebee; }
body { background: var(--bg); color: var(--ink); padding: calc(var(--space) * 3); }`, lang: 'css' }),
      C('Transitions, transforms & keyframes', `Transitions animate between states; keyframes define multi-step animations. Animate \`transform\` and \`opacity\`; respect \`prefers-reduced-motion\`.`,
        { code: `.btn { transition: transform .15s ease; } .btn:active { transform: scale(.97); }
@keyframes pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`, lang: 'css' }),
      C('Modern CSS: :has(), clamp(), nesting', `- \`:has()\` — parent selector: \`.card:has(img) { … }\`, \`form:has(:invalid) button { opacity:.5 }\`.
- \`clamp(min, preferred, max)\` — fluid type: \`font-size: clamp(1.5rem, 4vw, 2.5rem)\`.
- Native **nesting**: \`.card { & h2 { … } &:hover { … } }\`.`),
      D('Deep dive: centring and common layouts, solved once', `Copy these and stop searching:`,
        { cards: [['Centre anything', 'display:grid; place-items:center'], ['Sticky footer', 'body: min-height:100dvh; display:grid; grid-template-rows:auto 1fr auto'], ['Sidebar layout', 'grid-template-columns: minmax(200px, 25%) 1fr'], ['Readable text', 'max-width: 65ch'], ['Full-bleed in a container', 'grid-template-columns: 1fr min(65ch,100%) 1fr']] }),
    ],
    quiz: [
      Q('Which wins: .a .b (0-2-0) or #x (1-0-0)?', ['.a .b', '#x', 'Later one', 'Neither'], 1, 'An id outranks any number of classes.'),
      Q('z-index: 9999 isn’t working. Likely cause?', ['Bug in browser', 'The element is inside a different stacking context', 'Too big', 'Needs !important'], 1, 'Stacking contexts isolate z-index.'),
      Q('Style a card by its own width rather than the screen?', ['Media query', 'Container query', 'Flexbox', 'z-index'], 1, 'That is what container queries are for.'),
      Q('Fluid heading between 24px and 40px?', ['font-size: 4vw', 'font-size: clamp(1.5rem, 4vw, 2.5rem)', 'font-size: 32px', 'zoom'], 1, 'clamp sets min, preferred and max.'),
    ],
    practice: 'Rebuild one complex section of a real site (e.g. a pricing table) with Grid + container queries, light and dark themes via variables.',
    explain: 'Explain Flexbox vs Grid with seating in a bus row vs a cinema hall.',
  },

  'fe-js': {
    intro: 'JavaScript runs every interactive web page. These are the concepts interviews test and real bugs come from.',
    concepts: [
      C('Types, coercion & equality', `Primitives: string, number, bigint, boolean, undefined, null, symbol. Everything else is an object. \`==\` coerces types (\`0 == ''\` is true); **always use \`===\`**. Falsy values: false, 0, '', null, undefined, NaN.`,
        { cards: [["'5' + 1", "'51' (string concat)"], ["'5' - 1", '4 (numeric)'], ['[] + {}', "'[object Object]'"], ['NaN === NaN', 'false — use Number.isNaN'], ['typeof null', "'object' (historical bug)"]] }),
      C('Scope, hoisting, closures', `\`let/const\` are block-scoped; \`var\` is function-scoped and hoisted. A **closure** is a function remembering variables from where it was created — the basis of hooks, debounce, private state.`,
        { code: `function counter() {
  let n = 0
  return () => ++n          // closes over n
}
const next = counter(); next(); next()   // 2

function debounce(fn, ms) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}`, lang: 'javascript' }),
      C('this, call/apply/bind, arrow functions', `\`this\` depends on **how** a function is called: method call → the object; plain call → undefined (strict); \`new\` → the new object; \`bind/call/apply\` → set explicitly. **Arrow functions** don't have their own \`this\` — they use the surrounding one (great for callbacks).`),
      C('Objects, prototypes & classes', `Objects inherit via a **prototype chain**: missing properties are looked up on the prototype. \`class\` is syntax over prototypes.`,
        { code: `class Problem { constructor(title) { this.title = title } label() { return '#' + this.title } }
const p = new Problem('two-sum')
Object.getPrototypeOf(p) === Problem.prototype   // true`, lang: 'javascript' }),
      C('Arrays & higher-order functions (map, filter, reduce)', `Transform data without loops-with-mutation:`,
        { code: `const logs = [{ who: 'pank', mins: 90 }, { who: 'ravi', mins: 120 }, { who: 'pank', mins: 30 }]
const pankMins = logs.filter((l) => l.who === 'pank').map((l) => l.mins).reduce((a, b) => a + b, 0)   // 120
const byPerson = Object.groupBy(logs, (l) => l.who)          // modern grouping
const sorted = logs.toSorted((a, b) => b.mins - a.mins)       // non-mutating sort`, lang: 'javascript' }),
      C('Promises, async/await & the event loop', `JS is single-threaded. Long work (network, timers) is handed off; callbacks queue up. The **event loop** runs the call stack, then all **microtasks** (promise callbacks), then one **macrotask** (setTimeout, events), then renders.`,
        { code: `console.log('1')
setTimeout(() => console.log('4 — macrotask'), 0)
Promise.resolve().then(() => console.log('3 — microtask'))
console.log('2')
// prints 1, 2, 3, 4`, lang: 'javascript' },
        { steps: [['Call stack runs sync code', 'Logs 1 and 2.'], ['Stack empty → microtasks', 'Promise callback logs 3.'], ['Render opportunity', 'Browser may paint.'], ['Next macrotask', 'setTimeout callback logs 4.']] }),
      C('ES modules', `\`import\`/\`export\` with static structure (enables tree-shaking). Named vs default exports; dynamic \`import()\` for code splitting.`),
      C('DOM manipulation & events (bubbling, delegation)', `Events **bubble** from the target up to ancestors. **Delegation**: one listener on a parent handles events for many children — including ones added later.`,
        { code: `list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]')
  if (btn) remove(btn.dataset.id)
})`, lang: 'javascript' }),
      C('Fetch, error handling & AbortController', `\`fetch\` only rejects on network failure — **check \`res.ok\`** for HTTP errors. Cancel stale requests (search-as-you-type) with AbortController.`,
        { code: `let ctrl
async function search(q) {
  ctrl?.abort(); ctrl = new AbortController()
  try {
    const res = await fetch('/api/search?q=' + encodeURIComponent(q), { signal: ctrl.signal })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } catch (e) { if (e.name !== 'AbortError') throw e }
}`, lang: 'javascript' }),
      C('Immutability & copying (spread, structuredClone)', `Spread copies **one level** (shallow); nested objects are still shared. \`structuredClone\` deep-copies. React state must be updated immutably — create new objects, don't mutate.`,
        pick('const b = { ...a }; b.user.name = "x". Does a.user.name change?', ['No', false], ['Yes — spread is shallow, user is shared', true, 'Nested objects are the same reference.'], ['Error', false])),
      D('Deep dive: the 5 JS bugs you will actually hit', `- Forgetting \`await\` → you get a Promise, not data.
- \`fetch\` with no \`res.ok\` check → silently using an error page.
- Mutating state/arrays (\`sort\`, \`push\`) → UI doesn't update.
- Stale closures in setInterval/useEffect → old values.
- Floating point: \`0.1 + 0.2 !== 0.3\` → store money as integer paise.`),
    ],
    quiz: [
      Q('Output order: log(1); setTimeout(log 2); Promise.then(log 3); log(4)?', ['1 2 3 4', '1 4 3 2', '1 3 4 2', '4 3 2 1'], 1, 'Sync, then microtasks, then macrotasks.'),
      Q('fetch() to a URL returning 500 will…', ['Reject', 'Resolve with res.ok === false', 'Throw a TypeError', 'Retry'], 1, 'Only network errors reject.'),
      Q('Arrow functions get this from…', ['The caller', 'The surrounding scope', 'window always', 'bind'], 1, 'Lexical this.'),
      Q('Deep copy an object with nested arrays?', ['{...obj}', 'structuredClone(obj)', 'Object.assign', 'obj'], 1, 'Spread is shallow.'),
    ],
    practice: 'Build fe-2 (vanilla JS kanban) using delegation, immutable updates and a debounced search with AbortController.',
    explain: 'Explain the event loop with a single cashier, a priority queue and a normal queue.',
  },

  'fe-ts': {
    intro: 'TypeScript catches whole classes of bugs before the code runs, and makes large React codebases navigable.',
    concepts: [
      C('Basic types, unions, intersections, literals', `\`string | number\` (union: either), \`A & B\` (intersection: both), literal types (\`'todo' | 'doing' | 'done'\`) model exact allowed values.`,
        { code: `type Status = 'todo' | 'doing' | 'done'
type Task = { id: string; title: string; status: Status; due?: Date }`, lang: 'typescript' }),
      C('Interfaces vs type aliases', `Both describe object shapes. Interfaces can be extended and merged (good for public APIs); type aliases can express unions, tuples and mapped types. Pick one convention per codebase — many teams use \`type\` by default.`),
      C('Generics & constraints', `Generics let a function or type work for many types while keeping them linked.`,
        { code: `function first<T>(items: T[]): T | undefined { return items[0] }
function byId<T extends { id: string }>(items: T[], id: string) { return items.find((x) => x.id === id) }
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }`, lang: 'typescript' }),
      C('Narrowing & type guards', `TS narrows a union after checks: \`typeof\`, \`in\`, equality, \`instanceof\`, and **discriminated unions** (a shared literal field).`,
        { code: `function render(r: ApiResult<Task[]>) {
  if (!r.ok) return showError(r.error)   // here r is the error branch
  return r.data.map(…)                   // here r.data exists
}`, lang: 'typescript' }),
      C('Utility types (Partial, Pick, Omit, Record)', `Build new types from existing ones:`,
        { cards: [['Partial<Task>', 'All fields optional — patches.'], ["Pick<Task, 'id' | 'title'>", 'Only those fields.'], ["Omit<Task, 'id'>", 'Everything except id — create payloads.'], ['Record<Status, Task[]>', 'Object keyed by status.'], ['ReturnType<typeof fn>', 'Type of what fn returns.']] }),
      C('Typing React props, hooks & events', `Type props as an object type; let hooks infer when possible; use React's event types.`,
        { code: `type Props = { task: Task; onMove: (id: string, to: Status) => void }
export function Card({ task, onMove }: Props) {
  const [open, setOpen] = useState(false)          // inferred boolean
  const ref = useRef<HTMLDivElement>(null)
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter') setOpen(true) }
  …
}`, lang: 'typescript' }),
      C('Typing API responses (zod inference)', `Types disappear at runtime — an API can still return anything. Validate with **zod** and infer the type from the schema, so types and runtime checks never drift.`,
        { code: `import { z } from 'zod'
const TaskSchema = z.object({ id: z.string(), title: z.string(), status: z.enum(['todo', 'doing', 'done']) })
type Task = z.infer<typeof TaskSchema>
const tasks = z.array(TaskSchema).parse(await res.json())   // throws on bad data`, lang: 'typescript' }),
      C('tsconfig & strict mode', `Turn on \`"strict": true\` (null checks, no implicit any) plus \`noUncheckedIndexedAccess\` for safer arrays. Avoid \`any\`; use \`unknown\` and narrow.`,
        pick('An API returns unknown JSON. Safest type before validating?', ['any', false], ['unknown, then validate/narrow', true, 'unknown forces you to check before use.'], ['object', false])),
      D('Deep dive: making impossible states impossible', `Instead of \`{ loading: boolean; error?: string; data?: T }\` (allows loading + error + data at once), model states as a discriminated union:`,
        { code: `type State<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }`, lang: 'typescript' }),
    ],
    quiz: [
      Q('Type for "all fields optional" from Task?', ['Pick<Task>', 'Partial<Task>', 'Omit<Task>', 'Required<Task>'], 1, 'Partial.'),
      Q('Why validate API responses with zod?', ['Faster', 'TS types don’t exist at runtime', 'Smaller bundle', 'Required by React'], 1, 'Runtime data needs runtime checks.'),
      Q('A discriminated union uses…', ['Classes', 'A shared literal field like status', 'any', 'Generics only'], 1, 'TS narrows on that field.'),
    ],
    practice: 'Convert fe-2 or fe-3 to strict TypeScript with zod-validated API calls and a discriminated-union fetch state.',
    explain: 'Explain unknown vs any to a teammate.',
  },

  'fe-build': {
    intro: 'The tools that turn your source into a fast production site — and keep a team’s code consistent.',
    concepts: [
      C('npm/pnpm, lockfiles, semver', `**semver** MAJOR.MINOR.PATCH: \`^1.4.2\` accepts 1.x updates, \`~1.4.2\` only patches. The **lockfile** pins exact versions — commit it; CI uses \`npm ci\` / \`pnpm install --frozen-lockfile\`. pnpm is faster and saves disk with a shared store.`),
      C('Vite & how bundling works', `In dev, Vite serves native ES modules (instant start, fast HMR). For production it **bundles** with Rollup: resolves imports, tree-shakes unused code, splits chunks, minifies, adds content hashes to filenames for caching.`,
        { flow: ['Source modules', 'Resolve imports graph', 'Tree-shake', 'Split chunks', 'Minify', 'app.4f9a1c.js'] }),
      C('ESLint & Prettier', `ESLint finds bugs and bad patterns (hooks rules, unused vars); Prettier formats. Run both in the editor, pre-commit and CI so reviews focus on logic, not spacing.`),
      C('Environment variables & builds', `Front-end env vars are **baked into the bundle at build time** and visible to anyone (\`import.meta.env.VITE_API_URL\`). Never put secrets there — secrets belong on a server.`,
        pick('Where can a paid API secret key safely live in a React app?', ['VITE_SECRET in .env', false], ['Nowhere in the front end — call your own backend which holds it', true, 'Anything in the bundle is public.'], ['In localStorage', false])),
      C('Monorepos (intro)', `One repo holding several apps and shared packages (web, admin, ui-kit) with pnpm workspaces and Turborepo/Nx for cached, parallel builds. Good for sharing code; adds tooling overhead.`),
      D('Deep dive: reading a bundle analysis', `Run \`npx vite-bundle-visualizer\`. Look for: one giant library (moment, lodash full), duplicate versions of the same package, big icons/fonts imported whole, and pages that should be lazy-loaded. Fix the top 3 and measure again.`),
    ],
    quiz: [
      Q('^2.3.1 allows…', ['Only 2.3.1', '2.x.x updates', 'Any version', '2.3.x only'], 1, 'Caret allows minor and patch.'),
      Q('Front-end env vars are…', ['Secret', 'Public in the built bundle', 'Encrypted', 'Server-only'], 1, 'They ship to the browser.'),
    ],
    practice: 'Set up a Vite + React + TS project with ESLint, Prettier, a pre-commit hook and a bundle visualizer report.',
    explain: 'Explain why lockfiles prevent "it worked yesterday" bugs.',
  },

  'fe-react': {
    intro: 'React lets you describe UI as a function of state. Master these fundamentals before any advanced pattern.',
    concepts: [
      C('Components, JSX & props', `A component is a function returning JSX. **Props** are inputs — read-only. Compose small components into larger ones.`,
        { code: `function Avatar({ name, color }) { return <span className="avatar" style={{ background: color }}>{name[0]}</span> }
function Crew({ people }) { return <div>{people.map((p) => <Avatar key={p.id} {...p} />)}</div> }`, lang: 'jsx' }),
      C('State with useState', `State is data that changes and re-renders the component. Updates are **asynchronous and batched**; use the functional form when the new value depends on the old.`,
        { code: `const [count, setCount] = useState(0)
setCount((c) => c + 1)            // safe even if called twice in a row
const [form, setForm] = useState({ name: '', email: '' })
setForm((f) => ({ ...f, name: 'Ravi' }))   // new object, never mutate`, lang: 'jsx' }),
      C('Thinking in React: lifting state up', `When two components need the same data, move the state to their closest common parent and pass it down; pass callbacks up. One source of truth.`,
        { steps: [['Break UI into components', 'Draw boxes on the mockup.'], ['Build static version', 'Props only, no state.'], ['Find minimal state', 'What changes and can’t be computed?'], ['Decide where state lives', 'Closest common parent of all users.'], ['Add inverse data flow', 'Children call callbacks to update parent state.']] }),
      C("Effects with useEffect — and when you don't need one", `Effects sync with **external systems** (network, subscriptions, DOM APIs, timers). You **don't** need an effect to compute values from props/state (compute during render) or to handle user events (do it in the handler).`,
        { code: `// ❌ unnecessary effect
useEffect(() => { setFull(first + ' ' + last) }, [first, last])
// ✅ derive during render
const full = first + ' ' + last

// ✅ real effect with cleanup
useEffect(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
}, [])`, lang: 'jsx' }),
      C('Lists, keys & conditional rendering', `Keys must be **stable and unique** among siblings (ids, not array index when items reorder) — React uses them to match elements between renders.`,
        pick('Rendering a reorderable list with key={index}. What can go wrong?', ['Nothing', false], ['State/inputs get attached to the wrong item after reordering', true, 'Index keys change meaning when order changes.'], ['It is slower only', false])),
      C('Controlled forms', `The input's value comes from state and updates via onChange — React is the single source of truth, which makes validation and conditional UI easy.`,
        { code: `const [email, setEmail] = useState('')
<input value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!email.includes('@')} />`, lang: 'jsx' }),
      C('Context for shared state', `Context passes values deep without prop drilling — great for theme, auth user, locale. Every consumer re-renders when the value changes, so keep context values small and stable, or split contexts.`),
      C('Refs & useRef', `A ref holds a mutable value that **doesn't** trigger re-renders: DOM nodes (focus, measure, scroll), timers, previous values.`,
        { code: `const inputRef = useRef(null)
useEffect(() => { inputRef.current?.focus() }, [])
return <input ref={inputRef} />`, lang: 'jsx' }),
      C('React DevTools', `Inspect the component tree, props, state and hooks; the **Profiler** records renders and shows which components re-render and why — essential for performance work.`),
      D('Deep dive: why did my component re-render?', `A component re-renders when: its state changes, its parent re-renders, or a context it uses changes. Props changing is not required — a parent re-render re-renders children by default. Fix real problems only: move state down, lift content up as children, split contexts, then memoize if the Profiler shows a measurable cost.`),
    ],
    quiz: [
      Q('Computing fullName from first and last should be done…', ['In useEffect', 'During render', 'In a ref', 'In context'], 1, 'Derived values don’t need effects.'),
      Q('Best key for a list of tasks?', ['Array index', 'task.id', 'Math.random()', 'task.title'], 1, 'Stable and unique.'),
      Q('Changing ref.current causes…', ['A re-render', 'No re-render', 'An error', 'A context update'], 1, 'Refs are outside render.'),
      Q('setCount(count + 1) twice in one handler adds…', ['2', '1', '0', 'Error'], 1, 'Both read the same snapshot; use the updater form.'),
    ],
    practice: 'Build the fe-3 explorer UI: lifted state for filters, controlled inputs, keyed lists, and no unnecessary effects.',
    explain: 'Explain "UI = f(state)" using a scoreboard at a cricket match.',
  },

  'fe-react2': {
    intro: 'The patterns used in real React codebases: custom hooks, reducers, server state, Suspense and React 19 features.',
    concepts: [
      C('Custom hooks', `Extract reusable stateful logic into a function starting with \`use\`.`,
        { code: `function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? initial } catch { return initial } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}`, lang: 'jsx' }),
      C('useReducer for complex state', `When state has many related fields or transitions, a reducer centralises the rules: \`(state, action) => newState\`. Easy to test, easy to reason about.`,
        { code: `function reducer(s, a) {
  switch (a.type) {
    case 'add':  return { ...s, tasks: [...s.tasks, a.task] }
    case 'move': return { ...s, tasks: s.tasks.map((t) => t.id === a.id ? { ...t, status: a.to } : t) }
    default: return s
  }
}
const [state, dispatch] = useReducer(reducer, { tasks: [] })`, lang: 'jsx' }),
      C('React 19: Actions, use(), useOptimistic', `- **Actions** — pass async functions to forms (\`<form action={save}>\`); pending state via \`useActionState\` / \`useFormStatus\`.
- **use()** — read a promise or context during render (with Suspense).
- **useOptimistic** — show the expected result instantly, roll back if the server fails.`),
      C('React Compiler & when manual memo still matters', `The **React Compiler** automatically memoizes components and values, removing most manual \`useMemo/useCallback/memo\`. You may still need manual control for very expensive calculations, stable identities passed to non-React libraries, or codebases not using the compiler. Always measure with the Profiler first.`),
      C('Client state: Zustand / Redux Toolkit', `For app-wide client state (UI preferences, multi-step drafts, complex editors) beyond context: **Zustand** (tiny, hook-based) or **Redux Toolkit** (structured, devtools, big teams). Server data does **not** belong here — use TanStack Query.`),
      C('Server state with TanStack Query (caching, refetch, mutations)', `Server data is cached, can go stale and is shared — TanStack Query handles caching, deduplication, background refetch, retries and invalidation.`,
        { code: `const { data, isPending, error } = useQuery({ queryKey: ['logs', day], queryFn: () => api.logs(day), staleTime: 60_000 })
const qc = useQueryClient()
const save = useMutation({ mutationFn: api.saveLog, onSuccess: () => qc.invalidateQueries({ queryKey: ['logs'] }) })`, lang: 'jsx' }),
      C('Rendering behaviour & re-renders', `Render = calling your component; commit = applying DOM changes. Renders are cheap; unnecessary work inside them or huge lists are not. Use the Profiler, virtualise long lists (TanStack Virtual), and keep state close to where it's used.`),
      C('Suspense, lazy loading & error boundaries', `\`lazy()\` + \`<Suspense fallback>\` loads code on demand; **error boundaries** catch render errors in a subtree and show a fallback instead of a white screen.`,
        { code: `const Board = lazy(() => import('./Board'))
<ErrorBoundary fallback={<p>Board failed to load.</p>}>
  <Suspense fallback={<Spinner />}><Board /></Suspense>
</ErrorBoundary>`, lang: 'jsx' }),
      C('Routing (React Router)', `Map URLs to components; nested routes with layouts; params (\`/build/:track/:id\`); loaders/actions for data. Keep important UI state (filters, tabs) **in the URL** so links are shareable.`),
      C('Composition patterns', `Prefer composition over configuration: \`children\`, slots via props, compound components (\`<Tabs><Tabs.List/><Tabs.Panel/></Tabs>\`), and render props or hooks for shared behaviour.`,
        pick('A Modal needs different content each time. Best API?', ['20 boolean props', false], ['<Modal title=… >{children}</Modal>', true, 'Composition keeps the component flexible and simple.'], ['Copy the modal per page', false])),
      D('Deep dive: choosing where state lives', `A decision path that prevents most state bugs:`,
        { steps: [['Can it be computed?', 'Then it’s not state — derive it.'], ['Is it from the server?', 'TanStack Query (or your framework’s loader).'], ['Should it be in the URL?', 'Filters, tabs, selected item → search params.'], ['Used by one component?', 'useState/useReducer there.'], ['Shared by a subtree?', 'Lift up or context.'], ['App-wide client state?', 'Zustand / Redux Toolkit.']] }),
    ],
    quiz: [
      Q('Server data like a list of logs belongs in…', ['Redux', 'TanStack Query (server state)', 'localStorage', 'Refs'], 1, 'It handles caching and staleness.'),
      Q('An error boundary prevents…', ['Network errors', 'A render error from blanking the whole app', 'Slow renders', 'Type errors'], 1, 'Shows fallback UI for that subtree.'),
      Q('useOptimistic is for…', ['Caching', 'Showing the expected result before the server confirms', 'Routing', 'Memoizing'], 1, 'Optimistic UI.'),
    ],
    practice: 'In fe-3: TanStack Query for data, filters in the URL, a lazy route with Suspense and an error boundary, and one custom hook.',
    explain: 'Explain server state vs client state with a train timetable vs your own seat choice.',
  },
}
