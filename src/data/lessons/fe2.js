// Front end — lessons 9–19
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'fe-forms': {
    intro: 'Forms are where users give you data — and where most UX and validation bugs live.',
    concepts: [
      C('Controlled vs uncontrolled inputs', `**Controlled**: React state holds the value (easy live validation, more re-renders). **Uncontrolled**: the DOM holds it, read via refs or FormData on submit (fewer re-renders, great for big forms). React Hook Form uses uncontrolled inputs for speed.`),
      C('React Hook Form', `Registers inputs, tracks errors and submission state with minimal re-renders.`,
        { code: `const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
<form onSubmit={handleSubmit(save)}>
  <label htmlFor="title">Title</label>
  <input id="title" {...register('title')} aria-invalid={!!errors.title} aria-describedby="title-err" />
  {errors.title && <p id="title-err" role="alert">{errors.title.message}</p>}
  <button disabled={isSubmitting}>Save</button>
</form>`, lang: 'jsx' }),
      C('Schema validation with Zod', `One schema validates on the client **and** the server, and gives you types.`,
        { code: `const schema = z.object({
  title: z.string().min(3, 'At least 3 characters'),
  url: z.string().url().optional().or(z.literal('')),
  minutes: z.coerce.number().int().min(5).max(600),
})`, lang: 'typescript' },
        { note: 'Client validation is for UX. The server must validate again — anyone can bypass the browser.' }),
      C('Accessible error messages', `Link errors to fields (\`aria-describedby\`), mark invalid fields (\`aria-invalid\`), announce errors (\`role="alert"\`), move focus to the first error on submit, and never rely on red colour alone.`),
      C('File uploads & previews', `Validate type and size on the client, preview with \`URL.createObjectURL\`, compress large images, and upload directly to storage with a **signed URL** from your backend.`,
        { steps: [['User picks file', 'Check type (image/*) and size (< 5 MB).'], ['Preview', 'URL.createObjectURL(file); revoke it later.'], ['Ask backend', 'POST /uploads → signed URL.'], ['Upload directly', 'PUT file to S3/Storage with progress.'], ['Save reference', 'Store the object key with the record.']] }),
      C('Multi-step forms', `Split long forms into steps with a progress indicator, validate per step, keep all values in one form state (or a store) so Back doesn't lose data, and save drafts for long flows.`,
        pick('Where should multi-step form data live so Back works?', ['Separate state in each step that unmounts', false], ['One shared form state above the steps', true, 'Unmounted step state would be lost.'], ['The URL only', false])),
      D('Deep dive: the anatomy of a great form', `Labels above fields, one column, sensible defaults and autocomplete, inline validation on blur (not every keystroke), a clear primary button, disable-while-submitting, a success state, and server errors shown next to the right field.`),
    ],
    quiz: [
      Q('Why validate on the server even with Zod in the client?', ['Faster', 'Clients can be bypassed', 'Zod requires it', 'For SEO'], 1, 'Never trust the browser.'),
      Q('Linking an error message to its input uses…', ['aria-label', 'aria-describedby', 'title', 'alt'], 1, 'Screen readers read it with the field.'),
    ],
    practice: 'Build a 3-step "log a build" form with React Hook Form + Zod, file upload preview and accessible errors.',
    explain: 'Explain controlled vs uncontrolled inputs with a teacher checking each answer live vs at the end.',
  },

  'fe-browser': {
    intro: 'Powerful APIs built into every browser — offline storage, background threads, observers and realtime connections.',
    concepts: [
      C('IndexedDB & offline storage', `A transactional key-value database in the browser for large structured data (MBs to GBs). Use a wrapper like **idb** or **Dexie**. Basis of offline-first apps (build fe-5).`,
        { code: `import { openDB } from 'idb'
const db = await openDB('notes', 1, { upgrade(db) { db.createObjectStore('notes', { keyPath: 'id' }) } })
await db.put('notes', { id: 'n1', text: 'Kafka partitions', updatedAt: Date.now() })
const all = await db.getAll('notes')`, lang: 'javascript' }),
      C('Web Workers', `Run heavy JS (parsing a big CSV, image processing) on a background thread so the UI stays smooth. Communicate with \`postMessage\`.`),
      C('IntersectionObserver & ResizeObserver', `**IntersectionObserver** tells you when elements enter the viewport — lazy loading, infinite scroll, scroll animations. **ResizeObserver** tells you when an element’s size changes — responsive charts.`,
        { code: `const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && loadMore()), { rootMargin: '200px' })
io.observe(sentinel)`, lang: 'javascript' }),
      C('History API & URL state', `\`history.pushState\` / router navigation change the URL without reloading. Store shareable UI state in **search params** (\`?track=de&level=2\`).`),
      C('Clipboard, Notifications, Geolocation', `Permission-based APIs: \`navigator.clipboard.writeText\`, Notifications (ask only after a user action, explain why), Geolocation (only when needed). Always handle denial gracefully.`),
      C('WebSockets & Server-Sent Events on the client', `- **WebSocket** — two-way, for chat, multiplayer, collaboration.
- **SSE** (\`EventSource\`) — server → client stream over HTTP, auto-reconnect; great for live feeds and LLM token streaming.`,
        pick('Live order-status updates pushed from server only. Simplest?', ['WebSocket', false], ['Server-Sent Events', true, 'One-way, auto-reconnecting, plain HTTP.'], ['Polling every 100 ms', false])),
      D('Deep dive: reconnecting realtime connections properly', `Networks drop. Reconnect with exponential backoff and jitter, resume from the last received event id, show a subtle "reconnecting…" indicator, and refetch state after reconnect so nothing is missed.`),
    ],
    quiz: [
      Q('Large offline data in the browser belongs in…', ['Cookies', 'IndexedDB', 'sessionStorage', 'URL'], 1, 'Built for large structured data.'),
      Q('Keep the UI smooth while parsing a 50 MB CSV?', ['setTimeout', 'Web Worker', 'Bigger CPU', 'CSS'], 1, 'Off the main thread.'),
    ],
    practice: 'Add infinite scroll with IntersectionObserver and URL-synced filters to fe-3.',
    explain: 'Explain WebSockets vs SSE with a phone call vs a radio broadcast.',
  },

  'fe-next': {
    intro: 'Next.js adds routing, server rendering, data fetching and deployment conventions on top of React — the default for production React apps.',
    concepts: [
      C('App Router: layouts, pages, loading & error files', `Folders are routes. Special files: \`page.tsx\` (UI), \`layout.tsx\` (shared shell that persists), \`loading.tsx\` (Suspense fallback), \`error.tsx\` (error boundary), \`not-found.tsx\`.`,
        { code: `app/
  layout.tsx            ← html, nav (shared)
  page.tsx              ← /
  build/
    layout.tsx          ← build section shell
    [track]/page.tsx    ← /build/de
    [track]/loading.tsx
    [track]/error.tsx`, lang: 'text' }),
      C('Server vs client components', `By default components are **server components**: they run on the server, can query the DB directly, and send zero JS. Add \`'use client'\` only for interactivity (state, effects, event handlers, browser APIs). Keep client components small, at the leaves.`,
        { arch: [['Server components (no JS shipped)', ['Layout', 'Data fetching', 'Markdown rendering']], ['Client components (interactive)', ['Like button', 'Filters', 'Charts']]] }),
      C('Data fetching & caching in Next.js', `Fetch in server components with async/await. Control freshness with caching and revalidation (time-based or on-demand via tags/paths after a mutation). Check the docs for your version — caching defaults changed across releases.`),
      C('Static, dynamic & incremental rendering', `- **Static (SSG)** — built once; fastest (marketing pages, docs).
- **Dynamic (SSR)** — rendered per request (personalised dashboards).
- **Incremental (ISR)** — static but regenerated in the background after a time or on demand (product pages, blogs).
- **Streaming** — send the shell first, stream slow parts with Suspense.`),
      C('Route handlers & server actions', `**Route handlers** (\`app/api/x/route.ts\`) are HTTP endpoints. **Server actions** are async server functions called directly from forms/components — validate input and check auth inside every one, they are public endpoints.`,
        { code: `'use server'
export async function addLog(formData: FormData) {
  const user = await requireUser()
  const data = LogSchema.parse(Object.fromEntries(formData))
  await db.log.create({ data: { ...data, userId: user.id } })
  revalidatePath('/log')
}`, lang: 'typescript' }),
      C('Middleware & authentication', `Middleware runs before a route — redirect unauthenticated users, rewrite locales. Use a maintained auth library (Auth.js, Clerk, Supabase Auth), keep sessions in HttpOnly cookies, and **still check authorisation in the data layer**, not only in middleware.`),
      C('Images, fonts & metadata', `\`next/image\` resizes, lazy-loads and serves modern formats; \`next/font\` self-hosts fonts with no layout shift; the Metadata API sets titles, descriptions and Open Graph per page.`),
      C('Deploying to Vercel', `Push to GitHub → Vercel builds every branch (preview URLs) and main (production). Set env vars per environment; watch build logs and runtime logs. Other hosts work too (Docker, Netlify, Cloudflare).`,
        pick('A dashboard shows each user’s private data. Which rendering?', ['Static at build time', false], ['Dynamic (per request) with auth', true, 'Personalised data can’t be prebuilt for everyone.'], ['ISR every hour shared by all', false])),
      D('Deep dive: where should this code run?', `Ask per piece of UI: Does it need secrets or the database? → server. Does it need state, effects or browser APIs? → client. Is it the same for everyone? → static/ISR. Is it per-user? → dynamic. Most pages end up as a server shell with a few small client islands.`),
    ],
    quiz: [
      Q('Default component type in the App Router?', ['Client', 'Server', 'Static HTML', 'Worker'], 1, 'Add "use client" to opt in.'),
      Q('Server actions must…', ['Skip validation', 'Validate input and check auth themselves', 'Run in the browser', 'Use GET'], 1, 'They are callable endpoints.'),
      Q('Blog post pages regenerated after edits?', ['SSR every time', 'ISR / on-demand revalidation', 'Client-only', 'Never'], 1, 'Static speed with freshness.'),
    ],
    practice: 'Start fe-7: App Router with a static marketing page, a protected dynamic dashboard, one server action, and deploy to Vercel.',
    explain: 'Explain server vs client components with a restaurant kitchen vs the waiter at your table.',
  },

  'fe-ui': {
    intro: 'Fast, consistent styling and good basic UX — so your apps look professional without a designer.',
    concepts: [
      C('Tailwind CSS', `Utility classes in markup (\`flex gap-4 p-6 rounded-xl\`) with a design-token scale for spacing, colour and type. Fast to build, consistent, tiny CSS in production. Extract repeated patterns into components, not giant class strings.`,
        { code: `<button className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 disabled:opacity-50">
  Save
</button>`, lang: 'jsx' }),
      C('Component libraries (shadcn/ui)', `**shadcn/ui** copies accessible components (built on Radix primitives) **into your repo** so you own and customise them. Alternatives: MUI, Mantine, Chakra. Use a library for complex widgets (dialogs, comboboxes) — building them accessibly from scratch is hard.`),
      C('Design tokens', `Named design decisions — \`color.bg\`, \`space.4\`, \`radius.md\`, \`font.body\` — used everywhere instead of raw values, so a brand change is one edit. Implemented as CSS variables or a Tailwind theme.`),
      C('Basic UI/UX principles', `The rules that make UIs feel professional:`,
        { cards: [['Hierarchy', 'One primary action per screen; size and weight show importance.'], ['Spacing', 'Consistent scale (4/8 px); more space between groups than within.'], ['Alignment', 'Everything lines up to a grid.'], ['Feedback', 'Every action shows loading, success or error.'], ['Consistency', 'Same component, same behaviour, everywhere.'], ['Empty states', 'Explain what goes here and how to start.']] },
        pick('A screen has five equally bold buttons. Main problem?', ['Too few colours', false], ['No visual hierarchy — users can’t see the primary action', true, 'One primary, the rest secondary.'], ['Buttons too small', false])),
      D('Deep dive: the 5-minute UI polish pass', `Before showing any screen: align everything, apply the spacing scale, reduce to one accent colour, make text contrast pass, add hover/focus/disabled states, add loading and empty states, and check it at 375 px wide.`),
    ],
    quiz: [
      Q('Why shadcn/ui instead of building a dialog from scratch?', ['Smaller fonts', 'Accessible, tested primitives you can still customise', 'Required by React', 'No CSS'], 1, 'Accessibility is hard to get right.'),
      Q('Design tokens are…', ['Login tokens', 'Named design values used consistently', 'NPM packages', 'Images'], 1, 'Single source of design truth.'),
    ],
    practice: 'Restyle one screen of your fe-3 app with Tailwind and shadcn/ui following the polish pass.',
    explain: 'Explain visual hierarchy with a newspaper front page.',
  },

  'fe-design-sys': {
    intro: 'A design system is the shared language of a product’s UI — tokens, components and rules — so many people build consistent screens fast.',
    concepts: [
      C('Design tokens (colour, spacing, type)', `Layers of tokens: **primitive** (\`blue-600\`, \`space-4\`) → **semantic** (\`color-action\`, \`color-danger\`, \`space-card\`) → **component** (\`button-bg\`). Components use semantic tokens so themes swap underneath.`,
        { arch: [['Component tokens', ['button.bg', 'card.padding']], ['Semantic tokens', ['color.action', 'color.surface', 'space.card']], ['Primitive tokens', ['blue.600', 'gray.50', 'space.4']]] }),
      C('Building reusable components with variants', `Expose a small, clear API: \`variant\` (primary, secondary, ghost), \`size\`, \`disabled\`, \`asChild\`. Tools like **cva** (class-variance-authority) map variants to classes.`,
        { code: `const button = cva('inline-flex items-center rounded-md font-medium', {
  variants: { variant: { primary: 'bg-ink text-white', ghost: 'bg-transparent' }, size: { sm: 'h-8 px-3', md: 'h-10 px-4' } },
  defaultVariants: { variant: 'primary', size: 'md' },
})`, lang: 'typescript' }),
      C('Storybook', `A workshop to build and view components in isolation with every state (loading, error, long text, RTL), run interaction and accessibility tests, and publish docs for the team.`),
      C('Theming & dark mode', `Swap semantic token values per theme (\`[data-theme="dark"]\`), respect \`prefers-color-scheme\` by default, let users override, avoid pure black, and re-check contrast in both themes.`),
      C('Accessible component patterns (dialogs, menus, tabs)', `Follow the WAI-ARIA Authoring Practices:`,
        { cards: [['Dialog', 'Focus moves in, is trapped, Esc closes, focus returns to the trigger.'], ['Menu', 'Arrow keys move, Enter selects, Esc closes.'], ['Tabs', 'Arrow keys switch tabs; tab panel linked with aria-controls.'], ['Combobox', 'Typing filters, arrows navigate, aria-activedescendant.']] }),
      C('Documenting components', `For each component: when to use and when not to, props table, examples of every variant, accessibility notes, do/don't. Generate prop tables from TypeScript; keep docs next to code so they stay current.`),
      D('Deep dive: versioning a component library', `Publish with semver. Breaking prop changes = major version, with a migration guide and codemods if possible. Deprecate first (console warning for a release), then remove. Visual regression tests catch accidental style changes.`),
    ],
    quiz: [
      Q('Components should reference which tokens?', ['Primitive (blue-600)', 'Semantic (color-action)', 'Raw hex values', 'None'], 1, 'So themes can change underneath.'),
      Q('When a dialog closes, focus should…', ['Go to the top of the page', 'Return to the element that opened it', 'Disappear', 'Go to the footer'], 1, 'Keeps keyboard users oriented.'),
    ],
    practice: 'Build fe-4: tokens, 10 components with variants, Storybook docs and axe checks.',
    explain: 'Explain why a design system speeds up a team, using Lego bricks.',
  },

  'fe-viz': {
    intro: 'Dashboards and charts turn data into decisions — a key skill where front end meets data engineering.',
    concepts: [
      C('Choosing the right chart', `Start from the question:`,
        { table: { cols: ['Question', 'Chart'], rows: [['Change over time', 'Line'], ['Compare categories', 'Bar (sorted)'], ['Part of a whole (few parts)', 'Stacked bar (pie only for 2–3 parts)'], ['Distribution', 'Histogram / box plot'], ['Relationship', 'Scatter'], ['A single key number', 'Big number + sparkline']] } }),
      C('Charts with Recharts or Chart.js', `Declarative React charts for most dashboards:`,
        { code: `<ResponsiveContainer width="100%" height={260}>
  <LineChart data={daily}>
    <XAxis dataKey="day" /> <YAxis /> <Tooltip />
    <Line type="monotone" dataKey="minutes" stroke="currentColor" dot={false} />
  </LineChart>
</ResponsiveContainer>`, lang: 'jsx' }),
      C('D3 basics: scales, axes, joins', `D3 gives full control: **scales** map data to pixels (\`scaleLinear().domain([0, max]).range([h, 0])\`), **axes** draw ticks, and **data joins** bind arrays to SVG elements. Use it for custom visuals; use Recharts for standard charts.`),
      C('Dashboards & filters', `A good dashboard answers one question, puts the key number top-left, shows trends with comparison (vs last period), and has a few filters synced to the URL. Every chart has a clear title stating the takeaway.`),
      C('Large datasets: aggregation & virtualisation', `Never send 1M rows to the browser. Aggregate on the server (daily totals), downsample time series, paginate tables, virtualise long lists (render only visible rows), and use canvas/WebGL for huge scatter plots.`,
        pick('A chart must show 2 years of per-minute data. Best approach?', ['Send all ~1M points to the browser', false], ['Aggregate to hourly/daily on the server and zoom to detail on demand', true, 'Pixels are limited; aggregate first.'], ['Show only today', false])),
      D('Deep dive: making charts honest', `Bar charts start at zero; don’t use 3D or dual axes that mislead; label units; use consistent colours for the same series across charts; annotate events ("pricing change") so people read the trend correctly.`),
    ],
    quiz: [
      Q('Best chart for daily study minutes over 3 months?', ['Pie', 'Line', 'Scatter', 'Radar'], 1, 'Change over time.'),
      Q('Bar chart y-axis should start at…', ['The minimum value', 'Zero', 'Any number', '100'], 1, 'Bars encode length.'),
    ],
    practice: 'Build a Study Together stats dashboard: minutes per day (line), DSA by pattern (bar), with URL-synced date filter.',
    explain: 'Explain why you aggregate on the server before charting, using a stadium crowd count.',
  },

  'fe-test': {
    intro: 'Tests let you change code without fear. Front-end testing focuses on what users see and do.',
    concepts: [
      C('Testing pyramid for front ends', `Many fast unit tests, a solid layer of component/integration tests (the sweet spot for React), and a few end-to-end tests for critical journeys.`,
        { arch: [['End-to-end (few)', ['Login → create log → see it on Today']], ['Component / integration (many)', ['Form validation', 'List filtering', 'Error states']], ['Unit (many, fast)', ['Date helpers', 'Reducers', 'Parsers']]] }),
      C('Unit tests with Vitest', `Fast, Vite-native, Jest-compatible API.`,
        { code: `import { describe, it, expect } from 'vitest'
import { streakInfo } from './logic'
describe('streakInfo', () => {
  it('counts consecutive days', () => { expect(streakInfo({ '2026-11-26': 1, '2026-11-27': 1 }).streak).toBe(2) })
})`, lang: 'javascript' }),
      C('Component tests with React Testing Library', `Test like a user: find elements by **role and label**, interact, assert on what's visible — not on internal state.`,
        { code: `render(<LogForm onSave={save} />)
await user.type(screen.getByLabelText(/title/i), 'Kafka')
await user.click(screen.getByRole('button', { name: /save/i }))
expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Kafka' }))
expect(screen.getByRole('status')).toHaveTextContent(/saved/i)`, lang: 'jsx' }),
      C('Mocking network calls (MSW)', `**Mock Service Worker** intercepts requests at the network level, so components use real fetch code against fake responses — in tests and in the browser during development.`),
      C('End-to-end tests with Playwright', `Drive a real browser through critical journeys; run in CI on every PR.`,
        { code: `test('log a study entry', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByRole('link', { name: 'Log' }).click()
  await page.getByLabel('What did you study?').fill('Kafka consumer groups')
  await page.getByRole('button', { name: /save/i }).click()
  await expect(page.getByText('Kafka consumer groups')).toBeVisible()
})`, lang: 'typescript' }),
      C('Visual regression (intro)', `Screenshot components or pages and compare against approved baselines to catch unintended visual changes (Playwright screenshots, Chromatic for Storybook).`),
      C('Running tests in CI', `Run lint, type check, unit/component tests and Playwright on every PR; cache dependencies; upload Playwright traces on failure; block merges on red.`,
        pick('Which query best reflects how users find a Save button?', ['getByTestId("btn-3")', false], ['getByRole("button", { name: /save/i })', true, 'Role + accessible name mirrors users and assistive tech.'], ['container.querySelector(".btn")', false])),
      D('Deep dive: what not to test', `Don't test implementation details (state variable names, internal functions), third-party libraries, or exact CSS. Test behaviour and outcomes. A test that breaks on every refactor without catching bugs costs more than it saves.`),
    ],
    quiz: [
      Q('React Testing Library encourages querying by…', ['CSS class', 'Role and label', 'Component name', 'Internal state'], 1, 'Like a user.'),
      Q('MSW mocks…', ['React components', 'Network requests', 'CSS', 'Timers'], 1, 'At the network layer.'),
    ],
    practice: 'Add 5 component tests and 2 Playwright journeys to fe-3 and run them in GitHub Actions.',
    explain: 'Explain the testing pyramid using checks in a car factory.',
  },

  'fe-perf': {
    intro: 'Speed is a feature: faster sites convert better, rank better and feel better. Measure, then fix the biggest problem.',
    concepts: [
      C('Core Web Vitals: LCP, INP, CLS', `Google's user-experience metrics (measured at the 75th percentile of real users):`,
        { table: { cols: ['Metric', 'Measures', 'Good'], rows: [['LCP — Largest Contentful Paint', 'Loading: when main content appears', '≤ 2.5 s'], ['INP — Interaction to Next Paint', 'Responsiveness to taps/clicks', '≤ 200 ms'], ['CLS — Cumulative Layout Shift', 'Visual stability', '≤ 0.1']] } }),
      C('Lighthouse & the Performance panel', `Lighthouse gives a lab score and suggestions. The Performance panel shows the timeline: long tasks (> 50 ms) that block input, layout shifts, and what the main thread was doing. Field data (CrUX, web-vitals library) shows what real users experience.`),
      C('Code splitting & lazy loading', `Ship only what the current page needs: route-level splitting, \`lazy()\` for heavy components (editors, charts), dynamic \`import()\` for rarely used libraries.`),
      C('Image & font optimisation', `Modern formats (AVIF/WebP), correct sizes with srcset, width/height set, lazy-load below the fold, \`fetchpriority="high"\` on the LCP image. Fonts: self-host, subset, \`font-display: swap\`, preload the main one.`),
      C('Caching: HTTP cache, service workers, PWA', `Hashed assets: \`Cache-Control: public, max-age=31536000, immutable\`. HTML: \`no-cache\` (revalidate). Service workers add offline support and instant repeat loads (PWA).`),
      C('Bundle analysis & tree shaking', `Find heavy dependencies with a bundle visualizer; import only what you use (\`import debounce from 'lodash/debounce'\`); prefer ESM libraries so unused exports are removed (tree shaking).`,
        { steps: [['Measure', 'Lighthouse + real-user Web Vitals.'], ['Find the worst metric', 'Usually LCP on mobile.'], ['Find the cause', 'Big hero image? Render-blocking JS? Slow API?'], ['Fix one thing', 'Optimise image / split bundle / cache.'], ['Measure again', 'Keep it only if numbers improved.']] }),
      D('Deep dive: fixing a slow INP', `INP is bad when the main thread is busy at the moment of interaction. Find long tasks in the Performance panel; break up work (\`scheduler.yield()\` or setTimeout chunks), move heavy work to Web Workers, avoid huge re-renders (virtualise lists, keep state local), and debounce expensive handlers.`),
    ],
    quiz: [
      Q('Which metric measures layout jumping?', ['LCP', 'INP', 'CLS', 'TTFB'], 2, 'Cumulative Layout Shift.'),
      Q('Correct caching for app.4f9a.js?', ['no-store', 'max-age=1 year, immutable', 'no-cache', 'private'], 1, 'Hash changes when content changes.'),
      Q('Biggest typical LCP fix on mobile?', ['More fonts', 'Optimise and prioritise the hero image', 'Add animations', 'Bigger bundle'], 1, 'The LCP element is often an image.'),
    ],
    practice: 'Get your fe-7 project to green Web Vitals on a throttled mobile profile and document before/after numbers.',
    explain: 'Explain LCP, INP and CLS with a restaurant: food arriving, waiter responding, and the table not wobbling.',
  },

  'fe-a11y': {
    intro: 'About 1 in 6 people live with a disability. Accessible apps work for everyone — and it is a legal requirement in many places.',
    concepts: [
      C('WCAG 2.2 principles', `WCAG is organised around **POUR**:`,
        { cards: [['Perceivable', 'Text alternatives, captions, enough contrast.'], ['Operable', 'Keyboard access, enough time, no seizure risks, visible focus.'], ['Understandable', 'Readable text, predictable behaviour, help with errors.'], ['Robust', 'Valid markup that assistive tech can interpret.']] },
        { note: 'Level AA is the usual target for products.' }),
      C('Keyboard navigation & focus management', `Everything usable with Tab/Shift+Tab/Enter/Space/Esc/arrows; logical focus order; visible focus styles (\`:focus-visible\`); manage focus on route changes and dialogs; "skip to content" link.`),
      C('Screen reader testing (NVDA / VoiceOver)', `NVDA (free, Windows) or VoiceOver (Mac/iOS, built in) and TalkBack (Android). Navigate by headings and landmarks, fill a form, open a dialog — listen for missing names, wrong roles and unannounced changes.`),
      C('Colour contrast & motion preferences', `Text contrast ≥ 4.5:1 (3:1 for large text and UI components). Never use colour alone to convey meaning. Respect \`prefers-reduced-motion\`.`,
        pick('An error is shown only by turning the field border red. Problem?', ['None', false], ['Colour-blind and screen-reader users may miss it — add text and an icon', true, 'Don’t rely on colour alone.'], ['Red is too bright', false])),
      C('Accessible forms & error states', `Visible labels, instructions before fields, errors in text linked to fields, focus moved to the first error, and a summary for long forms.`),
      C('Automated audits (axe)', `axe DevTools, Lighthouse, and \`@axe-core/playwright\` in CI catch around a third of issues automatically. The rest needs keyboard and screen-reader testing.`),
      D('Deep dive: an accessibility checklist for every PR', `Keyboard reachable? Focus visible? Names for all controls? Headings in order? Images have alt? Contrast passes? Errors announced? Dialog traps and returns focus? Works at 200% zoom and 320 px wide? axe clean?`),
    ],
    quiz: [
      Q('Minimum contrast for normal text (AA)?', ['2:1', '3:1', '4.5:1', '7:1'], 2, '4.5:1.'),
      Q('Automated tools catch roughly…', ['All issues', 'About a third of issues', 'None', 'Only colour'], 1, 'Manual testing is essential.'),
    ],
    practice: 'Audit your own app with axe and a 10-minute keyboard + screen-reader session; fix every issue found.',
    explain: 'Explain POUR with a building: ramps, signs, clear directions and doors that open for everyone.',
  },

  'fe-sec': {
    intro: 'The browser is hostile territory. Know the main attacks and the defences front ends are responsible for.',
    concepts: [
      C('XSS and how React protects you (and when it does not)', `**XSS** = attacker-controlled script running in your page (steals tokens, acts as the user). React escapes text in JSX by default. It does **not** protect you with \`dangerouslySetInnerHTML\`, \`href={userUrl}\` (\`javascript:\` URLs), or third-party scripts. Sanitise HTML with DOMPurify; validate URLs.`),
      C('Content Security Policy', `A response header listing where scripts, styles, images and connections may come from — a strong second line of defence against XSS.`,
        { code: `Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' data: https:; connect-src 'self' https://api.example.com; frame-ancestors 'none'`, lang: 'text' }),
      C('CSRF & SameSite cookies', `**CSRF** tricks a logged-in user's browser into sending a request to your site from another site. Defences: \`SameSite=Lax/Strict\` cookies, CSRF tokens for cookie-based auth, and checking Origin headers.`),
      C('Where to store tokens', `- **HttpOnly, Secure, SameSite cookies** — not readable by JS; safest for sessions.
- **Memory** — lost on reload; pair with a refresh cookie.
- **localStorage** — readable by any script, so any XSS steals it. Avoid for sensitive tokens.`,
        pick('Your app stores a long-lived JWT in localStorage. Main risk?', ['Too slow', false], ['Any XSS can read and steal it', true, 'Scripts can read localStorage; HttpOnly cookies can’t be read by JS.'], ['Too big', false])),
      C('Dependency audits & supply-chain risk', `Your app runs code from hundreds of packages. Use lockfiles, \`npm audit\`/Dependabot, review new dependencies (maintainers, downloads, size), pin CI actions, and avoid unnecessary packages.`),
      C('Secure headers', `Set via your host/CDN: CSP, \`Strict-Transport-Security\`, \`X-Content-Type-Options: nosniff\`, \`Referrer-Policy\`, \`Permissions-Policy\`, and \`frame-ancestors\` (clickjacking protection). Check with securityheaders.com.`),
      D('Deep dive: threat-model one feature', `Pick "users post links on the proof wall". Ask: what if the link is \`javascript:\`? What if the image URL tracks visitors? What if the text contains HTML? Write the defence for each (URL allow-list, rel="noopener noreferrer", escaping). This habit is how seniors think about security.`),
    ],
    quiz: [
      Q('React does NOT protect you from XSS when you use…', ['{text}', 'dangerouslySetInnerHTML', 'props', 'useState'], 1, 'It inserts raw HTML.'),
      Q('Which cookie attribute blocks JS from reading it?', ['Secure', 'HttpOnly', 'SameSite', 'Path'], 1, 'HttpOnly.'),
    ],
    practice: 'Add a strict CSP and security headers to your deployed app and get an A on securityheaders.com.',
    explain: 'Explain XSS vs CSRF: someone writing on your notebook vs someone forging your signature on a form.',
  },

  'fe-deploy': {
    intro: 'Shipping is part of the job: fast hosting, safe previews, correct caching, and knowing when production breaks.',
    concepts: [
      C('Static hosting & CDNs', `Static builds (HTML/JS/CSS) can be served from a CDN anywhere: GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3 + CloudFront. Global edge caching = fast everywhere, cheap, hard to take down.`),
      C('Environment variables per stage', `Separate dev, preview and production values (API URLs, analytics keys). Remember: front-end env vars are public. Validate required vars at build time so a missing one fails the build, not production.`),
      C('Preview deployments', `Every PR gets its own URL — reviewers, designers and friends can click through before merging. Combine with E2E tests against the preview.`),
      C('Caching headers & cache busting', `Content-hashed filenames (\`app.4f9a.js\`) can be cached forever; HTML must revalidate so users pick up new hashes. A new deploy = new hashes = no stale JS.`,
        { steps: [['Build', 'Bundler outputs app.4f9a.js and index.html referencing it.'], ['Deploy', 'CDN serves JS with immutable 1-year cache.'], ['Change code', 'New build → app.b21c.js, new index.html.'], ['User returns', 'index.html revalidates → loads b21c; old file never requested again.']] }),
      C('Error monitoring (Sentry)', `Capture runtime errors from real users with stack traces (upload source maps), browser, release version and breadcrumbs. Alert on new or spiking errors after a release.`),
      C('Analytics & feature flags', `Privacy-friendly analytics (Plausible, Umami, PostHog) for usage; **feature flags** to ship code dark, enable for some users, run experiments and turn off a broken feature without redeploying.`,
        pick('A new feature breaks for 5% of users in production. Fastest safe action if it’s behind a flag?', ['Revert and redeploy', false], ['Turn the flag off', true, 'Flags decouple release from deploy.'], ['Wait for a fix', false])),
      D('Deep dive: a release checklist', `Before: tests green, preview checked on mobile, env vars set, migration plan. During: deploy, smoke test key journeys. After: watch errors and Web Vitals for 30 minutes, announce in the crew log, roll back via previous deploy or flag if needed.`),
    ],
    quiz: [
      Q('Why can hashed JS files be cached forever?', ['They never change', 'Any change produces a new filename', 'CDNs ignore cache', 'Browsers require it'], 1, 'Cache busting by filename.'),
      Q('Feature flags let you…', ['Skip tests', 'Turn features on/off without redeploying', 'Hide errors', 'Speed builds'], 1, 'Release ≠ deploy.'),
    ],
    practice: 'Add preview deploys, Sentry with source maps and one feature flag to your fe-7 app.',
    explain: 'Explain cache busting with a library that gives every new edition of a book a new catalogue number.',
  },
}
