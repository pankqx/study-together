// Back end — lessons 1–8
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'be-node': {
    intro: 'Node.js runs JavaScript on the server with non-blocking I/O — great for APIs that spend most of their time waiting on databases and networks.',
    concepts: [
      C('Event loop, libuv & non-blocking I/O', `Node runs your JS on **one thread**. I/O (files, sockets, DNS) is handed to **libuv** (OS async APIs + a small thread pool); callbacks run when results are ready. One process can serve thousands of concurrent connections — as long as you never block the thread with heavy CPU work.`,
        { steps: [['Request arrives', 'Handler runs on the main thread.'], ['Await the DB', 'Query handed off; thread is free.'], ['Serve others', 'Hundreds of other requests run meanwhile.'], ['DB responds', 'Callback queued; your handler resumes.'], ['Blocking danger', 'A 2-second CPU loop freezes ALL requests.']] }),
      C('CommonJS vs ES modules', `CommonJS: \`require\`/\`module.exports\` (older, synchronous). ES modules: \`import\`/\`export\` (standard, static, top-level await). Use ESM for new projects (\`"type": "module"\`).`),
      C('npm scripts & package.json', `package.json lists dependencies, the Node version (\`engines\`), and **scripts** — the team's commands: \`dev\`, \`build\`, \`test\`, \`lint\`, \`migrate\`. \`dependencies\` ship to production; \`devDependencies\` don't.`),
      C('Streams & buffers', `Streams process data piece by piece instead of loading it all into memory — essential for big files and proxies. Buffers hold raw bytes.`,
        { code: `import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
await pipeline(createReadStream('big.csv'), createGzip(), createWriteStream('big.csv.gz'))  // constant memory`, lang: 'javascript' }),
      C('File system & path APIs', `Use \`node:fs/promises\` (async) and \`node:path\` (\`path.join\`, never string concatenation). Never build paths from user input without validating — path traversal (\`../../etc/passwd\`) is a classic vulnerability.`),
      C('Environment variables & config', `Read config from \`process.env\` (Node 20+ supports \`--env-file=.env\`), validate it at startup with zod, and fail fast if something is missing.`,
        { code: `const Env = z.object({ DATABASE_URL: z.string().url(), PORT: z.coerce.number().default(3000), JWT_SECRET: z.string().min(32) })
export const env = Env.parse(process.env)`, lang: 'typescript' }),
      C('Error handling & process signals', `Catch errors in every async handler (or use a framework that does), return clean error responses, log unexpected ones. On \`SIGTERM\` (deploys, scaling down), stop accepting new requests, finish in-flight ones, close DB pools, then exit — **graceful shutdown**.`,
        { code: `process.on('SIGTERM', async () => {
  server.close()           // stop new connections
  await db.end()           // close pool after in-flight work
  process.exit(0)
})`, lang: 'javascript' }),
      D('Deep dive: when Node is the wrong tool', `CPU-heavy work (image processing, big computations, ML) blocks the event loop. Options: worker_threads, a job queue with separate workers, or a different language/service (Python, Go) for that part. Node shines for I/O-bound APIs, realtime and BFFs (backend-for-frontend).`),
    ],
    quiz: [
      Q('A 3-second synchronous loop in a Node handler will…', ['Slow only that request', 'Block all requests on that process', 'Run in parallel', 'Be optimised away'], 1, 'Single thread.'),
      Q('Process a 5 GB file with low memory?', ['readFile', 'Streams', 'JSON.parse', 'Buffers only'], 1, 'Chunk by chunk.'),
      Q('On SIGTERM a good server should…', ['Exit immediately', 'Stop new requests, finish in-flight ones, close connections', 'Ignore it', 'Restart'], 1, 'Graceful shutdown.'),
    ],
    practice: 'Do build be-1 in Node too: a raw HTTP server with node:http, streaming a big file, with graceful shutdown.',
    explain: 'Explain non-blocking I/O with one waiter serving many tables while the kitchen cooks.',
  },

  'be-rest': {
    intro: 'REST APIs are the contract between your back end and every client. Good design makes them predictable, safe and easy to evolve.',
    concepts: [
      C('Resource-oriented URL design', `URLs name **things** (nouns), methods say **what to do**:`,
        { table: { cols: ['Action', 'Request'], rows: [['List logs', 'GET /logs?day=2026-11-27'], ['Get one', 'GET /logs/42'], ['Create', 'POST /logs'], ['Update fields', 'PATCH /logs/42'], ['Delete', 'DELETE /logs/42'], ['Nested', 'GET /users/7/builds'], ['Action that isn’t CRUD', 'POST /builds/fe-1/ship']] } }),
      C('HTTP verbs, status codes & idempotency', `GET, PUT, DELETE are **idempotent** (repeating them gives the same result); POST is not — so a retried POST can create duplicates. Use an **Idempotency-Key** header for payments and orders. Return precise status codes: 201 + Location on create, 204 on delete, 409 on conflicts, 422 on validation errors.`),
      C('Express or Fastify routing & middleware', `Middleware runs in order for each request: logging → auth → validation → handler → error handler.`,
        { code: `const app = express()
app.use(express.json())
app.use(requestLogger)
app.get('/logs', requireUser, async (req, res) => res.json(await logs.list(req.user.id, req.query)))
app.post('/logs', requireUser, validate(LogSchema), async (req, res) => res.status(201).json(await logs.create(req.user.id, req.body)))
app.use((err, req, res, next) => { log.error(err); res.status(err.status || 500).json({ error: { code: err.code || 'internal', message: err.expose ? err.message : 'Something went wrong' } }) })`, lang: 'javascript' }),
      C('Request validation (Zod / Pydantic)', `Validate **every** input — body, params, query, headers — at the edge, and reject with 422 and field-level messages. Strip unknown fields to prevent mass-assignment (\`{ "role": "admin" }\` sneaking in).`),
      C('Pagination, filtering, sorting', `Offset pagination (\`?page=3&limit=20\`) is simple but slow and inconsistent on big, changing tables. **Cursor (keyset) pagination** (\`?after=2026-11-27T10:00:00Z_42\`) is fast and stable.`,
        { code: `-- keyset: next page after the last seen (created_at, id)
SELECT * FROM logs WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20;`, lang: 'sql' }),
      C('Versioning & backwards compatibility', `Additive changes (new optional fields, new endpoints) are safe. Removing/renaming fields or changing types breaks clients → version (\`/v2\` or a header), deprecate with a timeline, and support both for a while.`),
      C('Consistent error format', `One shape for every error so clients can handle them generically (RFC 9457 "problem details" is a standard option).`,
        { code: `{ "error": { "code": "validation_failed", "message": "Title is too short",
             "fields": { "title": "At least 3 characters" }, "requestId": "req_8f2a" } }`, lang: 'json' }),
      C('Rate limiting & CORS', `Rate-limit per user/IP/API key (429 + Retry-After) to protect against abuse and runaway clients. Configure CORS to allow only your front-end origins — never \`*\` with credentials.`,
        pick('A mobile client retries POST /payments after a timeout. How to avoid double charging?', ['Hope it doesn’t happen', false], ['Require an Idempotency-Key and return the original result for repeats', true, 'The server remembers the key and the response.'], ['Use GET instead', false])),
      D('Deep dive: designing the Study Together API', `A worked example to copy the thinking:`,
        { code: `GET    /me                         → profile, tracks
GET    /logs?from=&to=&user=        → cursor-paginated logs
POST   /logs                        → create today’s log (409 if exists)
PATCH  /logs/{id}                   → edit own log (403 otherwise)
GET    /builds?track=de             → ladder + crew statuses
POST   /builds/{pid}/start          → 201
POST   /builds/{pid}/ship           → 422 if retro missing
GET    /calls/recap?since=last-call → recap aggregate`, lang: 'text' }),
    ],
    quiz: [
      Q('Which method is NOT idempotent?', ['GET', 'PUT', 'DELETE', 'POST'], 3, 'Repeating POST can create duplicates.'),
      Q('Validation failed on a field. Status?', ['200', '401', '422', '500'], 2, 'Unprocessable content.'),
      Q('Best pagination for a large, frequently-updated feed?', ['Offset', 'Cursor / keyset', 'Random', 'None'], 1, 'Fast and stable.'),
      Q('Renaming a response field is…', ['Safe', 'A breaking change needing versioning/deprecation', 'Invisible', 'Required'], 1, 'Clients rely on it.'),
    ],
    practice: 'Do build be-2 (URL shortener) with validation, consistent errors, cursor pagination of links and rate limiting.',
    explain: 'Explain idempotency with pressing a lift button vs ordering food twice.',
  },

  'be-http': {
    intro: 'The details of HTTP that decide security, speed and correctness of your APIs.',
    concepts: [
      C('Headers that matter (auth, caching, content negotiation)', `- \`Authorization: Bearer …\` — credentials.
- \`Content-Type\` / \`Accept\` — format of body / desired response.
- \`Cache-Control\`, \`ETag\`, \`If-None-Match\` — caching.
- \`X-Request-Id\` — trace a request across logs.
- \`Retry-After\` — when to retry after 429/503.`),
      C('Cookies: Secure, HttpOnly, SameSite', `\`Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600\` — not readable by JS, HTTPS only, not sent on cross-site POSTs, expires in 14 days.`),
      C('CORS preflight explained', `For "non-simple" cross-origin requests (JSON body, Authorization header, PUT/DELETE), the browser first sends OPTIONS asking permission:`,
        { steps: [['Browser: OPTIONS /logs', 'Origin: app.study.dev, Access-Control-Request-Method: POST, …-Headers: content-type, authorization'], ['Server answers', 'Access-Control-Allow-Origin: https://app.study.dev, Allow-Methods, Allow-Headers, Max-Age: 600'], ['Browser sends real POST', 'Only if allowed.'], ['Cached', 'Preflight result reused for Max-Age seconds.']] }),
      C('HTTP/2 & HTTP/3', `HTTP/2 multiplexes many requests over one TCP connection with header compression. HTTP/3 runs over **QUIC** (UDP), avoiding TCP head-of-line blocking and connecting faster on mobile networks. Usually enabled at the CDN/load balancer.`),
      C('Compression & keep-alive', `Compress text responses (gzip/Brotli) — JSON often shrinks 70–90%. Keep-alive reuses connections, avoiding repeated TCP/TLS handshakes; configure client connection pools for upstream calls too.`),
      C('Webhooks: sending and receiving safely', `Webhooks = the server calls **you** when something happens (payment succeeded).`,
        { cards: [['Verify signature', 'HMAC of the raw body with a shared secret; reject mismatches.'], ['Check timestamp', 'Reject old events (replay protection).'], ['Respond fast', 'Return 2xx quickly; process in a background job.'], ['Be idempotent', 'Providers retry — dedupe by event id.'], ['Sending them', 'Sign payloads, retry with backoff, let clients see delivery logs.']] },
        pick('A payment webhook arrives twice with the same event id. Correct handling?', ['Process both', false], ['Store processed ids and ignore the duplicate', true, 'At-least-once delivery requires idempotent handlers.'], ['Return 500', false])),
      D('Deep dive: ETags and conditional requests', `The server sends \`ETag: "v42"\`. Next time the client sends \`If-None-Match: "v42"\`; if nothing changed the server replies **304 Not Modified** with no body — saving bandwidth and work. For updates, \`If-Match\` prevents overwriting someone else’s change (optimistic concurrency → 412 Precondition Failed).`),
    ],
    quiz: [
      Q('Why verify webhook signatures?', ['Speed', 'Anyone could call your endpoint pretending to be the provider', 'Required for JSON', 'Caching'], 1, 'Authenticity.'),
      Q('304 Not Modified is returned when…', ['Error', 'The client’s cached version is still current', 'Redirect', 'Unauthorised'], 1, 'Conditional GET.'),
    ],
    practice: 'Add ETag support and a signed, idempotent webhook receiver (simulate the sender with a script) to your API.',
    explain: 'Explain a CORS preflight as asking the security guard before entering with luggage.',
  },

  'be-auth': {
    intro: 'Getting identity and permissions right is the most security-critical part of any back end. Use proven patterns.',
    concepts: [
      C('Authentication vs authorisation', `**Authentication** — who are you? (login). **Authorisation** — what are you allowed to do? (permissions). Most real breaches are authorisation bugs: user A reading user B's data by changing an id (**IDOR / broken object-level authorisation**).`,
        { code: `// ❌ IDOR: anyone logged in can read any log
app.get('/logs/:id', requireUser, async (req, res) => res.json(await db.log.find(req.params.id)))
// ✅ scope every query to the user
app.get('/logs/:id', requireUser, async (req, res) => {
  const log = await db.log.findFirst({ where: { id: req.params.id, userId: req.user.id } })
  if (!log) return res.status(404).end()
  res.json(log)
})`, lang: 'javascript' }),
      C('Password hashing (bcrypt / argon2)', `Never store passwords; store a slow, salted **hash** (Argon2id preferred, bcrypt fine). Slowness makes brute force expensive. Compare with the library’s verify function.`),
      C('Sessions & cookies', `Server-side sessions: random session id in an HttpOnly cookie, session data in Redis/DB. Easy to revoke (delete the session), simple and secure — often the best choice for web apps.`),
      C('JWT: access & refresh tokens', `A JWT is a signed token containing claims (user id, expiry). Servers verify it without a DB lookup. Keep **access tokens short-lived** (5–15 min) and use **rotating refresh tokens** (stored HttpOnly) to get new ones; detect reuse of an old refresh token as theft.`,
        { steps: [['Login', 'Issue access (10 min) + refresh (14 days, HttpOnly cookie).'], ['API calls', 'Send access token; server verifies signature + expiry.'], ['Access expires', 'Client calls /refresh with the cookie.'], ['Rotate', 'Old refresh token invalidated, new pair issued.'], ['Reuse detected', 'Old token used again → revoke the whole family (theft).']] }),
      C('OAuth 2.0 & OpenID Connect (Google login)', `**OAuth 2.0** lets an app get limited access on behalf of a user; **OIDC** adds identity ("this is Ravi, verified by Google"). Use the **Authorization Code flow with PKCE**; validate the ID token's issuer, audience and expiry — or let a library do it.`),
      C('Role & permission models (RBAC)', `Users → roles → permissions (\`admin\`, \`editor\`, \`viewer\`). Check permissions in one central place. Add ownership/attribute rules (ABAC) when needed: "editors can edit **their own team's** roadmap".`),
      C('Multi-factor auth & password reset flows', `MFA: TOTP apps or passkeys (WebAuthn). Reset: single-use, short-lived, random tokens sent by email; same response whether or not the email exists (no account enumeration); invalidate sessions after reset; rate-limit.`),
      C('Auth providers (Firebase Auth, Auth0, Clerk)', `Managed auth handles passwords, social login, MFA, sessions and security updates. For most products, **buy** auth and spend your time on the product — but understand the concepts so you configure it safely.`,
        pick('Your startup needs Google login, email login and MFA next week. Sensible choice?', ['Write your own crypto', false], ['Use a managed provider (Firebase Auth, Clerk, Auth0) and focus on authorisation rules', true, 'Auth is security-critical and commoditised.'], ['Skip auth', false])),
      D('Deep dive: the authorisation checklist', `For every endpoint ask: Is the user authenticated? Is this object theirs (or shared with them)? Does their role allow this action? Are list queries filtered by tenant/user? Are IDs unguessable or still checked? Write a test that user B gets 403/404 on user A's object — for every resource.`),
    ],
    quiz: [
      Q('Changing /logs/42 to /logs/43 shows someone else’s log. This is…', ['XSS', 'IDOR / broken object-level authorisation', 'CSRF', 'SQL injection'], 1, 'Missing ownership check.'),
      Q('Store passwords as…', ['Plain text', 'MD5', 'Argon2id/bcrypt hashes', 'Encrypted with a key'], 2, 'Slow salted hashes.'),
      Q('Access tokens should be…', ['Long-lived (1 year)', 'Short-lived, refreshed with rotating refresh tokens', 'Stored in localStorage forever', 'Never expire'], 1, 'Limits damage if stolen.'),
    ],
    practice: 'Do build be-3: sessions or JWT with refresh rotation, Google OAuth, RBAC, and tests proving IDOR is impossible.',
    explain: 'Explain authentication vs authorisation with an ID card at the gate vs the rooms your card opens.',
  },

  'be-orm': {
    intro: 'How your application talks to the database — productively, and without the classic performance traps.',
    concepts: [
      C('Why ORMs, and their costs', `ORMs map tables to objects: type safety, migrations, less boilerplate, protection from SQL injection. Costs: hidden queries, N+1 problems, awkward complex SQL. Use the ORM for CRUD, raw SQL (parameterised) for complex reports — and always know what SQL runs.`),
      C('Prisma or Drizzle (TypeScript)', `**Prisma** — schema file, generated client, great DX. **Drizzle** — SQL-like TypeScript, lightweight, close to the metal.`,
        { code: `// Prisma
model Log { id String @id @default(cuid())  userId String  day DateTime  summary String
            user User @relation(fields: [userId], references: [id])  @@unique([userId, day]) }
const logs = await prisma.log.findMany({ where: { userId }, orderBy: { day: 'desc' }, take: 20 })`, lang: 'typescript' }),
      C('SQLAlchemy (Python)', `The standard Python ORM and SQL toolkit; 2.0 style is explicit and typed.`,
        { code: `class Log(Base):
    __tablename__ = "logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    summary: Mapped[str]
stmt = select(Log).where(Log.user_id == uid).order_by(Log.id.desc()).limit(20)
logs = session.scalars(stmt).all()`, lang: 'python' }),
      C('Migrations & seeding', `Every schema change is a versioned migration file in git (Prisma Migrate, Drizzle Kit, Alembic). Never edit production schemas by hand. Seed scripts create realistic dev/test data.`),
      C('Relations & eager vs lazy loading', `**Lazy** loading fetches related rows when accessed (hidden extra queries). **Eager** loading fetches them up front with a join or a second batched query (\`include\`, \`selectinload\`). Choose eager for lists.`),
      C('The N+1 problem', `Load 50 posts (1 query), then each post's author (50 queries) = 51 queries. Fix with eager loading or a batched \`WHERE id IN (...)\`.`,
        { code: `# ❌ N+1
for log in session.scalars(select(Log)).all(): print(log.user.name)
# ✅ 2 queries total
for log in session.scalars(select(Log).options(selectinload(Log.user))).all(): print(log.user.name)`, lang: 'python' },
        pick('A page is slow and logs show 201 nearly identical SELECTs. Likely cause?', ['Missing CDN', false], ['N+1 queries from lazy loading in a loop', true, 'Eager-load or batch the related rows.'], ['Too much RAM', false])),
      C('Transactions from application code', `Group writes that must succeed together (create order + reserve stock + record payment) in one transaction; keep transactions short; never call slow external APIs inside one.`,
        { code: `await prisma.$transaction(async (tx) => {
  const seat = await tx.seat.update({ where: { id, status: 'free' }, data: { status: 'held', heldBy: userId } })
  await tx.order.create({ data: { seatId: seat.id, userId } })
})`, lang: 'typescript' }),
      C('Connection pooling', `Opening DB connections is slow and databases allow a limited number (Postgres ~100 by default). Apps keep a **pool** of open connections; serverless apps need an external pooler (PgBouncer, provider poolers). Size pools so total connections across all instances stay under the DB limit.`),
      D('Deep dive: see the SQL your ORM runs', `Turn on query logging in development (Prisma \`log: ['query']\`, SQLAlchemy \`echo=True\`). For every new page, count the queries and read them. Add an automated test that fails if an endpoint exceeds N queries. This one habit prevents most ORM performance bugs.`),
    ],
    quiz: [
      Q('Fix for N+1?', ['More servers', 'Eager loading / batching', 'Bigger pool', 'Caching HTML'], 1, 'Fetch related rows together.'),
      Q('Calling a payment API inside a DB transaction is risky because…', ['It is illegal', 'It holds locks/connections while waiting on a slow network', 'ORMs forbid it', 'It is faster'], 1, 'Keep transactions short.'),
      Q('Schema changes in production should go through…', ['Manual SQL in prod', 'Versioned migrations in git', 'The ORM guessing', 'Backups'], 1, 'Reviewable, repeatable.'),
    ],
    practice: 'In your be-4 booking API, log queries, find and fix an N+1, and wrap seat holding in a transaction.',
    explain: 'Explain N+1 with a shopkeeper fetching items from the godown one by one instead of with one list.',
  },

  'be-py': {
    intro: 'FastAPI is the most popular modern Python API framework — typed, fast, with automatic docs. Ideal for data and AI back ends.',
    concepts: [
      C('FastAPI routing & path operations', `Decorators map HTTP methods and paths to functions; type hints define params.`,
        { code: `from fastapi import FastAPI, HTTPException
app = FastAPI(title="Study API")
@app.get("/logs/{log_id}")
async def get_log(log_id: int, user=Depends(current_user)):
    log = await repo.get(log_id, user.id)
    if not log: raise HTTPException(404, "Log not found")
    return log
# run: uvicorn main:app --reload  → docs at http://localhost:8000/docs`, lang: 'python' }),
      C('Pydantic models & validation', `Request and response models validate input, strip unknown fields, and document the API.`,
        { code: `class LogIn(BaseModel):
    summary: str = Field(min_length=10, max_length=2000)
    minutes: int = Field(ge=5, le=600)
    topics: list[str] = []
class LogOut(LogIn):
    id: int
    created_at: datetime
@app.post("/logs", response_model=LogOut, status_code=201)
async def create(body: LogIn, user=Depends(current_user)): ...`, lang: 'python' }),
      C('Dependency injection', `\`Depends\` provides shared things — DB sessions, the current user, settings — and makes them easy to override in tests.`,
        { code: `async def get_db():
    async with SessionLocal() as s: yield s
async def current_user(token: str = Depends(oauth2), db=Depends(get_db)): ...
app.dependency_overrides[current_user] = lambda: FakeUser(id=1)   # in tests`, lang: 'python' }),
      C('Async endpoints & when to use them', `\`async def\` shines when awaiting I/O with async libraries (asyncpg, httpx). Calling a **blocking** library inside \`async def\` freezes the event loop — use plain \`def\` (FastAPI runs it in a threadpool) or an async library. CPU-heavy work → background workers.`,
        pick('Inside async def you call requests.get() (blocking). Effect?', ['Fine', false], ['Blocks the event loop — use httpx.AsyncClient or a sync def endpoint', true, 'Blocking calls stall every request on that worker.'], ['Faster', false])),
      C('Database access with SQLAlchemy', `Use SQLAlchemy 2.0 (async engine with asyncpg, or sync), a session per request via a dependency, Alembic for migrations, and a repository layer so route handlers stay thin.`),
      C('Background tasks', `\`BackgroundTasks\` runs small work after the response (send an email). For anything important, slow or retry-worthy, use a real queue (Celery, RQ, Arq) — background tasks die with the process.`),
      C('Auto-generated OpenAPI docs', `FastAPI generates an OpenAPI schema and interactive docs (/docs, /redoc) from your code. Generate typed front-end clients from the schema (openapi-typescript) so front and back stay in sync.`),
      C('Testing FastAPI with pytest', `Use \`TestClient\` (or httpx AsyncClient), a test database, and dependency overrides.`,
        { code: `def test_create_log(client, user_token):
    r = client.post("/logs", json={"summary": "Kafka consumer groups explained", "minutes": 90},
                    headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 201 and r.json()["minutes"] == 90
def test_cannot_read_others_log(client, other_users_log, user_token):
    assert client.get(f"/logs/{other_users_log.id}", headers=…).status_code == 404`, lang: 'python' }),
      D('Deep dive: a FastAPI project layout that scales', `\`app/api\` (routers), \`app/schemas\` (Pydantic), \`app/models\` (SQLAlchemy), \`app/services\` (business logic), \`app/repos\` (queries), \`app/core\` (config, security, logging), \`tests/\`, \`alembic/\`. Routers call services; services call repos. Business rules never live in route functions.`),
    ],
    quiz: [
      Q('Where does FastAPI serve interactive docs by default?', ['/swagger.json only', '/docs', '/api', '/help'], 1, 'Swagger UI at /docs.'),
      Q('Override the current user in tests with…', ['Monkeypatching globals', 'app.dependency_overrides', 'Editing the DB', 'Environment variables'], 1, 'DI makes it easy.'),
      Q('Sending a critical invoice email that must retry on failure?', ['BackgroundTasks', 'A real job queue (Celery/RQ/Arq)', 'Inline in the request', 'Cron only'], 1, 'Durable retries.'),
    ],
    practice: 'Build the Study Together API in FastAPI: logs CRUD with Pydantic, auth dependency, Alembic migrations and 10 pytest tests.',
    explain: 'Explain dependency injection with a restaurant where the kitchen is handed ingredients instead of shopping itself.',
  },

  'be-arch': {
    intro: 'How to structure a back end so it stays understandable, testable and operable as it grows.',
    concepts: [
      C('Layered / clean architecture', `Separate concerns so each layer can change independently:`,
        { arch: [['Transport (HTTP routes, GraphQL, CLI)', ['Parse, validate, auth']], ['Application / services', ['Use cases: ShipBuild, CreateLog']], ['Domain', ['Rules: "retro required to ship"']], ['Infrastructure', ['Postgres repo', 'Email client', 'Queue']]] },
        { note: 'Dependencies point inward: the domain knows nothing about HTTP or Postgres. That makes it easy to test and to swap infrastructure.' }),
      C('Config & the twelve-factor app', `Key ideas: config in the environment; one codebase, many deploys; stateless processes (state in DB/Redis/S3); logs to stdout; dev/prod parity; disposable processes (fast start, graceful shutdown); backing services as attachable resources.`),
      C('Structured logging', `Log JSON with consistent fields — level, message, request id, user id, duration, error — so you can search and graph. Never log passwords, tokens or full personal data.`,
        { code: `{"ts":"2026-11-27T10:02:11Z","level":"info","msg":"build shipped","requestId":"req_8f2a","userId":"u_7","buildId":"de-1","ms":42}`, lang: 'json' }),
      C('Error handling & retries', `Distinguish **expected** errors (validation, not found → 4xx with messages) from **unexpected** (bugs, outages → 500, log with stack, alert). Retry only **transient** failures (timeouts, 503) with exponential backoff and jitter, with limits — and only idempotent operations.`),
      C('API documentation (OpenAPI)', `An OpenAPI spec documents every endpoint, schema and error; generates docs, client SDKs, mocks and contract tests. Code-first (FastAPI, tsoa, zod-openapi) or design-first (write the YAML, then implement).`,
        pick('A DB call times out once. Retry policy?', ['Retry forever immediately', false], ['A few retries with exponential backoff + jitter, only if the operation is idempotent', true, 'Avoid retry storms and duplicates.'], ['Never retry', false])),
      D('Deep dive: monolith first', `Start with a **modular monolith**: one deployable, clear internal modules (logs, builds, auth) with explicit interfaces. Split into services only when a module needs independent scaling, deployment or ownership by another team. Premature microservices add network failures, distributed transactions and ops cost.`),
    ],
    quiz: [
      Q('In clean architecture, the domain layer should depend on…', ['Postgres', 'Nothing external', 'Express', 'The UI'], 1, 'Dependencies point inward.'),
      Q('Twelve-factor apps keep config in…', ['Code', 'Environment', 'Git-committed JSON with secrets', 'The database'], 1, 'Env per deploy.'),
      Q('A good default architecture for a 3-person project?', ['20 microservices', 'Modular monolith', 'Serverless only', 'No structure'], 1, 'Split later when needed.'),
    ],
    practice: 'Refactor your API into routes → services → repos, add JSON logging with request ids and an OpenAPI-generated client.',
    explain: 'Explain layered architecture with a restaurant: waiter, chef, recipes, suppliers.',
  },

  'be-search': {
    intro: 'Users expect search to be fast, forgiving and relevant. Start with Postgres; graduate to a search engine when needed.',
    concepts: [
      C('Postgres full-text search', `Postgres can tokenise, stem and rank text with \`tsvector\`/\`tsquery\` and a GIN index — enough for many apps.`,
        { code: `ALTER TABLE logs ADD COLUMN search tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(summary,''))) STORED;
CREATE INDEX logs_search_idx ON logs USING gin(search);
SELECT id, summary, ts_rank(search, q) AS rank
FROM logs, websearch_to_tsquery('english', 'kafka consumer') q
WHERE search @@ q ORDER BY rank DESC LIMIT 10;`, lang: 'sql' },
        { note: 'Add pg_trgm for typo-tolerant fuzzy matching on short fields like names.' }),
      C('Elasticsearch / OpenSearch basics', `Distributed search engines built on **inverted indexes**: documents in an index, sharded across nodes, with powerful full-text, filters, aggregations and relevance tuning. Data is synced from your primary DB (it is not the source of truth).`),
      C('Indexing & analysers', `An **analyser** turns text into tokens: tokenise → lowercase → remove stop words → stem ("running" → "run") → synonyms. The same analysis runs on queries so they match.`,
        { flow: ['"Running Kafka Consumers"', 'tokenise', 'lowercase', 'stem', '[run, kafka, consum]'] }),
      C('Relevance & ranking', `BM25 scores how well a document matches (term frequency, rarity, length). Then tune: boost title over body, recency, popularity; field weights; exact-phrase boosts. Measure with real queries and click data.`),
      C('Autocomplete', `Edge n-grams or prefix queries for "as you type", debounced on the client (~150 ms), limited to a few results, with highlighting. Keep it fast (< 100 ms server time).`,
        pick('A 3-person app needs search over 50k logs. Sensible first step?', ['Deploy an Elasticsearch cluster', false], ['Postgres full-text search with a GIN index', true, 'Simple, no extra system to sync or run.'], ['LIKE \'%term%\' on every column', false])),
      D('Deep dive: hybrid search for apps', `Combine keyword relevance (BM25 / Postgres FTS) with semantic vectors (pgvector) and fuse results — the same technique as RAG retrieval (see the AI course). Users get exact matches for names and codes, and meaning-based matches for natural questions.`),
    ],
    quiz: [
      Q('Why does "running" match "run" in search?', ['Luck', 'Stemming in the analyser', 'Indexes', 'Caching'], 1, 'Analysers normalise words.'),
      Q('Elasticsearch should usually be…', ['The only database', 'A search index synced from the primary DB', 'A cache', 'A queue'], 1, 'Not the source of truth.'),
    ],
    practice: 'Add Postgres full-text search with ranking and highlighted snippets to your logs API, plus debounced autocomplete in the UI.',
    explain: 'Explain an inverted index with the index at the back of a textbook.',
  },
}
