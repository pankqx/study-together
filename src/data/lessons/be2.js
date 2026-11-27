// Back end — lessons 9–16
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'be-perf': {
    intro: 'Make services fast and keep them fast under load — by measuring, not guessing.',
    concepts: [
      C('Profiling Node and Python services', `Find where time actually goes: Node \`--cpu-prof\` / clinic.js / Chrome DevTools; Python py-spy (attach to a running process) or cProfile. Flame graphs show the hottest code paths.`,
        { code: `py-spy record -o profile.svg --pid $(pgrep -f uvicorn)     # Python flame graph
node --cpu-prof server.js                                  # open .cpuprofile in Chrome DevTools`, lang: 'bash' }),
      C('Finding slow queries', `Most back-end slowness is the database. Enable \`pg_stat_statements\`, sort by total time, and run EXPLAIN ANALYZE on the top offenders. Add indexes, fix N+1, select fewer columns, paginate.`),
      C('Load testing with k6', `Simulate realistic traffic and measure latency percentiles and errors.`,
        { code: `import http from 'k6/http'; import { check, sleep } from 'k6'
export const options = { stages: [{ duration: '1m', target: 100 }, { duration: '3m', target: 100 }, { duration: '1m', target: 0 }],
  thresholds: { http_req_duration: ['p(95)<300'], http_req_failed: ['rate<0.01'] } }
export default function () { check(http.get('http://localhost:8000/logs?limit=20'), { 'status 200': (r) => r.status === 200 }); sleep(1) }
// k6 run load.js`, lang: 'javascript' }),
      C('Connection pools & timeouts', `Every outbound call needs a **timeout** (DB, HTTP, Redis) — otherwise slow dependencies pile up requests until you run out of connections/memory. Size pools to the DB's capacity; set connect, query and total request timeouts.`),
      C('Horizontal scaling & statelessness', `Scale out by running more identical instances behind a load balancer. That only works if instances are **stateless**: sessions in Redis/DB, files in object storage, no in-memory state that matters.`),
      C('Reading latency percentiles (p50, p95, p99)', `Averages hide pain. **p50** = typical user; **p95/p99** = the slowest 5% / 1% — often your most active users with the most data. Set SLOs on p95/p99.`,
        { table: { cols: ['Metric', 'Value', 'Meaning'], rows: [['avg', '120 ms', 'Looks fine…'], ['p50', '60 ms', 'Half are faster than this'], ['p95', '480 ms', '1 in 20 waits half a second'], ['p99', '2.3 s', '1 in 100 waits over 2 seconds ← fix this']] } },
        pick('Average latency is 100 ms but users complain about slowness. What do you check?', ['The average again', false], ['p95/p99 latency and which requests are slow', true, 'Tail latency is what the unlucky users feel.'], ['CPU of the laptop', false])),
      D('Deep dive: a performance investigation, end to end', `A repeatable process:`,
        { steps: [['Define the target', '"p95 < 300 ms at 100 req/s".'], ['Reproduce', 'k6 load test against staging with realistic data.'], ['Find the bottleneck', 'Traces/profiles: DB? external API? CPU?'], ['Fix one thing', 'Index, cache, batch, or async job.'], ['Re-test', 'Compare percentiles; keep the change only if it helps.'], ['Guard it', 'Add the k6 threshold to CI or a nightly run.']] }),
    ],
    quiz: [
      Q('Which percentile best represents your unhappiest users?', ['p50', 'p99', 'Average', 'Min'], 1, 'Tail latency.'),
      Q('Why must app servers be stateless to scale horizontally?', ['Security', 'Any instance must serve any request', 'Cheaper', 'Faster startup'], 1, 'Load balancers spread requests.'),
      Q('Missing timeouts on an external API call cause…', ['Faster responses', 'Requests piling up and exhausting resources when it is slow', 'Nothing', 'Better caching'], 1, 'Always set timeouts.'),
    ],
    practice: 'Load test your API with k6 to find its breaking point; fix the top bottleneck and report p50/p95/p99 before and after.',
    explain: 'Explain p95 latency with bus arrival times.',
  },

  'be-deploy': {
    intro: 'Getting code to production safely and keeping it healthy there.',
    concepts: [
      C('Containerising services', `A small, secure image: multi-stage build, slim base, non-root user, only production dependencies, healthcheck, config from env.`,
        { code: `FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
FROM node:22-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`, lang: 'dockerfile' }),
      C('Running migrations safely on deploy', `Run migrations as a separate step before the new version takes traffic, and make them **backward compatible** so old and new code both work during rollout (expand → migrate → contract). Avoid long locks on big tables (add columns nullable, build indexes CONCURRENTLY).`,
        { steps: [['Expand', 'Add new column (nullable) / new table.'], ['Deploy code that writes both', 'Old and new fields kept in sync.'], ['Backfill', 'Copy old data in batches.'], ['Switch reads', 'New code reads the new field.'], ['Contract', 'Later release removes the old column.']] }),
      C('Health checks & readiness', `**Liveness**: is the process alive (restart if not)? **Readiness**: can it serve traffic now (DB reachable, warmed up)? Load balancers and Kubernetes route traffic only to ready instances.`),
      C('Zero-downtime deploys (rolling, blue/green)', `Rolling: replace instances gradually, each must pass readiness first. Blue/green: run the new version alongside, switch traffic, keep old for instant rollback. Both need graceful shutdown and backward-compatible migrations.`),
      C('Secrets in production', `Inject secrets at runtime from a secret manager (AWS Secrets Manager, Doppler, Vault, platform env settings). Never bake them into images or commit them. Rotate regularly; separate secrets per environment.`),
      C('Logs, metrics and alerts for a service', `The minimum for any production service:`,
        { cards: [['Logs', 'Structured JSON with request ids, shipped to a log system.'], ['Metrics', 'Request rate, error rate, latency p95/p99, saturation (CPU, memory, pool usage).'], ['Traces', 'OpenTelemetry spans across services.'], ['Alerts', 'On symptoms users feel (error rate, latency) — not on every CPU blip.'], ['Dashboards', 'One per service; linked from the alert.']] },
        pick('Which alert is most useful at 3 a.m.?', ['CPU above 70% for 1 minute', false], ['5xx error rate above 2% for 5 minutes', true, 'Alert on user-facing symptoms.'], ['Disk at 40%', false])),
      D('Deep dive: the first 15 minutes of an incident', `Acknowledge the alert → check the dashboard (when did it start? which endpoints?) → was there a deploy? roll back first, debug later → communicate status in the team channel → mitigate (scale, disable feature flag, block abusive traffic) → once stable, find root cause → blameless postmortem with action items.`),
    ],
    quiz: [
      Q('Readiness checks decide…', ['Whether to restart', 'Whether the instance should receive traffic', 'Log level', 'Image size'], 1, 'Only ready instances get requests.'),
      Q('Renaming a column with zero downtime uses…', ['Rename in place', 'Expand → migrate → contract', 'Delete and recreate', 'Downtime window always'], 1, 'Both versions keep working.'),
      Q('Recent deploy + error spike. First action?', ['Debug for an hour', 'Roll back, then investigate', 'Restart the DB', 'Ignore'], 1, 'Mitigate first.'),
    ],
    practice: 'Containerise your API with a multi-stage Dockerfile, add /healthz and /readyz, structured logs and one SLO alert.',
    explain: 'Explain blue/green deploys with two identical stages at a concert.',
  },

  'be-cache': {
    intro: 'Caching makes systems fast and cheap — and creates the hardest bugs. Learn the patterns and their trade-offs.',
    concepts: [
      C('Cache-aside, write-through, write-behind', `- **Cache-aside** — app reads cache, on miss reads DB and fills cache. Most common.
- **Write-through** — writes go to cache and DB together; cache always fresh, writes slower.
- **Write-behind** — write to cache, flush to DB later; fast writes, risk of loss.`,
        { code: `async function getProfile(id) {
  const hit = await redis.get('profile:' + id)
  if (hit) return JSON.parse(hit)
  const p = await db.user.findUnique({ where: { id } })
  await redis.set('profile:' + id, JSON.stringify(p), { EX: 300 })   // 5-minute TTL
  return p
}`, lang: 'javascript' }),
      C('TTLs & eviction policies', `Every cache entry should expire (TTL) unless explicitly managed. When memory is full Redis evicts by policy — \`allkeys-lru\` (least recently used) is a good default for caches. Add jitter to TTLs so many keys don't expire at once.`),
      C('Redis data structures', `Redis is more than a key-value cache:`,
        { cards: [['String', 'Cached JSON, counters (INCR).'], ['Hash', 'Object fields: user:7 → name, streak.'], ['List', 'Simple queues, recent items.'], ['Set', 'Unique members: who is online.'], ['Sorted set', 'Leaderboards: crew XP ranking.'], ['Streams', 'Append-only event log with consumer groups.']] }),
      C('Cache invalidation strategies', `"There are only two hard things…" Options: TTL only (simple, eventually fresh); delete on write (delete key after DB update); versioned keys (\`profile:7:v12\`); event-driven invalidation. Always write to the DB first, then invalidate.`,
        pick('After updating a user’s name in the DB, the cached profile still shows the old name. Simplest fix?', ['Never cache', false], ['Delete the profile key right after the DB update (and keep a TTL as a safety net)', true, 'Next read repopulates from the DB.'], ['Restart Redis', false])),
      C('Distributed locks & rate limiting with Redis', `Rate limiting: atomic counters per user per window (\`INCR\` + \`EXPIRE\`, or a Lua sliding window). Locks: \`SET key value NX PX 30000\` so only one worker runs a job — always with an expiry, and safe release (check the value). For critical correctness prefer DB constraints/transactions over Redis locks.`),
      C('HTTP caching (ETag, Cache-Control)', `Let browsers and CDNs cache responses: \`Cache-Control: public, max-age=60, stale-while-revalidate=300\` for public data; \`private, no-store\` for personal data; ETags for cheap revalidation.`),
      D('Deep dive: cache stampede', `A hot key expires and 1,000 requests miss at once, all hitting the DB. Fixes: request coalescing (one request recomputes, others wait), early probabilistic refresh, stale-while-revalidate (serve old value while refreshing), and TTL jitter.`),
    ],
    quiz: [
      Q('Most common caching pattern?', ['Write-behind', 'Cache-aside', 'No cache', 'Write-around only'], 1, 'Read-through on miss.'),
      Q('Best Redis structure for a leaderboard?', ['List', 'Sorted set', 'String', 'Set'], 1, 'Scores with ranking.'),
      Q('A hot key expires and the DB gets hammered. This is…', ['Cache stampede', 'N+1', 'Deadlock', 'CORS'], 0, 'Thundering herd on expiry.'),
    ],
    practice: 'Add cache-aside with TTL + invalidation to your profile endpoint and a Redis sorted-set leaderboard of crew XP; measure hit rate.',
    explain: 'Explain caching with keeping frequently used books on your desk instead of the library.',
  },

  'be-jobs': {
    intro: 'Move slow, unreliable or scheduled work out of the request — and make it survive failures.',
    concepts: [
      C('Why background work', `Anything slow or failure-prone shouldn't make users wait: emails, PDFs, image processing, webhooks, AI calls, imports. The API enqueues a job and returns quickly (202 Accepted); workers process it.`,
        { flow: ['API: POST /reports', 'Enqueue job → 202', 'Worker picks it up', 'Generate PDF', 'Store + notify user'] }),
      C('Queues: BullMQ (Node) / Celery (Python)', `Both use Redis (Celery also RabbitMQ) to store jobs; workers pull and process them.`,
        { code: `# Celery
@app.task(bind=True, autoretry_for=(TimeoutError,), retry_backoff=True, max_retries=5)
def send_recap_email(self, user_id, period):
    recap = build_recap(user_id, period)
    mailer.send(recap)
# enqueue: send_recap_email.delay(user_id, "last-call")`, lang: 'python' }),
      C('Retries, backoff & dead-letter queues', `Retry transient failures with exponential backoff (1 s, 2 s, 4 s, 8 s…) and a maximum. After the last failure, move the job to a **dead-letter queue** for inspection and replay — never lose it silently.`),
      C('Idempotent jobs', `Queues deliver **at least once** — a job may run twice (worker crash after doing the work, before acknowledging). Make jobs safe to repeat: check "already sent" records, use upserts, idempotency keys with external APIs.`,
        pick('A "send welcome email" job runs twice after a worker crash. How to prevent double emails?', ['Hope', false], ['Record sent emails by (user, type) and skip if already sent', true, 'Idempotent job design.'], ['Disable retries', false])),
      C('Scheduled jobs (cron)', `Recurring work: nightly cleanups, daily recaps, reminders. Use the queue's scheduler (Celery beat, BullMQ repeatable jobs) or the platform's cron. Make sure only one instance schedules (no duplicates when you scale), and log every run.`),
      C('Monitoring workers', `Track queue length, job age (oldest waiting), processing time, failure rate and DLQ size. Alert when the queue backs up or the DLQ grows. Dashboards: Flower (Celery), Bull Board (BullMQ).`),
      D('Deep dive: the transactional outbox for jobs', `If you save an order and then enqueue "send confirmation", a crash between the two loses the job. Instead, write the job into an **outbox table in the same DB transaction**, and a relay process moves outbox rows to the queue. The DB commit becomes the single source of truth.`),
    ],
    quiz: [
      Q('The correct response for "accepted for background processing" is…', ['200', '201', '202', '204'], 2, '202 Accepted.'),
      Q('Jobs must be idempotent because queues deliver…', ['Exactly once', 'At least once', 'At most once', 'Randomly'], 1, 'Duplicates happen.'),
      Q('Where do permanently failing jobs go?', ['Deleted', 'Dead-letter queue', 'Logs only', 'Back to the front'], 1, 'For inspection and replay.'),
    ],
    practice: 'Do build be-5: queue + workers with retries, DLQ admin page, a nightly scheduled recap job, and a kill-the-worker test.',
    explain: 'Explain background jobs with a restaurant giving you a token number instead of making you wait at the counter.',
  },

  'be-rt': {
    intro: 'Realtime features and file handling — chat, live updates, uploads — done in a way that scales.',
    concepts: [
      C('WebSockets', `A persistent, two-way connection. Server must handle auth on connect, rooms/channels, heartbeats, and — when running several instances — a shared pub/sub (Redis) so a message reaches users connected to other servers.`,
        { arch: [['Clients', ['Pank', 'Ravi', 'Merel']], ['WebSocket servers', ['Server A', 'Server B']], ['Redis pub/sub', ['room:crew channel']], ['Persistence', ['Postgres messages table']]] }),
      C('Server-sent events', `One-way server→client streaming over plain HTTP with automatic reconnect and event ids. Simpler than WebSockets for notifications, live dashboards and streaming LLM output.`,
        { code: `@app.get("/events")
async def events(user=Depends(current_user)):
    async def gen():
        async for evt in bus.subscribe(user.id):
            yield f"id: {evt.id}\\nevent: {evt.type}\\ndata: {evt.json()}\\n\\n"
    return StreamingResponse(gen(), media_type="text/event-stream")`, lang: 'python' }),
      C('File uploads to object storage', `Don't stream big files through your API servers. Validate metadata, then let the client upload **directly** to S3/R2/Firebase Storage; store the object key in your DB; process (thumbnails, scans) in a background job.`),
      C('Signed URLs', `A signed URL grants temporary permission for one operation on one object (upload or download), e.g. valid for 5 minutes. Your server signs it after checking the user's permission; storage verifies the signature.`,
        { steps: [['Client asks', 'POST /uploads {type: image/png, size: 2MB}'], ['Server checks', 'Auth, allowed type/size, quota.'], ['Server signs', 'Presigned PUT URL for key users/7/proofs/abc.png, 5 min.'], ['Client uploads', 'PUT directly to storage.'], ['Client confirms', 'POST /proofs {key} → saved, job makes thumbnail.']] },
        pick('Users must download private files, without your bucket being public. Use…', ['A public bucket', false], ['Short-lived signed download URLs issued after a permission check', true, 'Temporary, per-object access.'], ['Email attachments', false])),
      D('Deep dive: presence and typing indicators at scale', `Presence = "who is online". Track connections in Redis with TTL heartbeats (set user:7:online EX 30, refreshed every 15 s); broadcast changes, but throttle them. Typing indicators are ephemeral — never store them, throttle to one event per few seconds per user.`),
    ],
    quiz: [
      Q('With 3 WebSocket server instances, how does a message reach a user on another instance?', ['It can’t', 'A shared pub/sub like Redis', 'DNS', 'Sticky sessions only'], 1, 'Fan out via pub/sub.'),
      Q('Why upload directly to object storage with signed URLs?', ['Required by law', 'Avoids routing big files through API servers', 'Makes files public', 'Faster DB'], 1, 'Scales and saves server resources.'),
    ],
    practice: 'Do build be-6: rooms, presence, history, Redis pub/sub across two instances, signed-URL uploads, and a k6 WebSocket load test.',
    explain: 'Explain signed URLs with a one-time visitor pass that expires in 5 minutes.',
  },

  'be-gql': {
    intro: 'Two alternatives to REST you will meet in industry, and when each makes sense.',
    concepts: [
      C('GraphQL schema, queries, resolvers', `A typed **schema** describes data; clients **query** exactly the fields they need in one request; **resolvers** fetch each field.`,
        { code: `type User { id: ID!, nick: String!, builds(status: Status): [Build!]! }
type Build { id: ID!, title: String!, status: Status! }
type Query { me: User }

# client asks for exactly this:
query { me { nick builds(status: SHIPPED) { title } } }`, lang: 'graphql' },
        { note: 'Use DataLoader to batch resolver lookups, or GraphQL becomes an N+1 machine.' }),
      C('When to use GraphQL vs REST', `GraphQL fits many clients with different data needs (web, mobile), deeply related data, and fast-moving front ends. REST fits simple CRUD, public APIs, HTTP caching, file transfer, and small teams. GraphQL adds complexity: query cost limits, caching, N+1, authorisation per field.`,
        pick('A small team builds one web app with simple CRUD. Default choice?', ['GraphQL federation', false], ['REST', true, 'Simpler, cache-friendly, enough for the need.'], ['gRPC to the browser', false])),
      C('gRPC & protobuf idea', `**gRPC** = fast RPC between services using **Protocol Buffers** (compact binary, strongly typed contracts, generated clients) over HTTP/2, with streaming. Common for internal microservice traffic; not used directly from browsers without a proxy.`,
        { code: `service Builds { rpc Ship (ShipRequest) returns (ShipReply); }
message ShipRequest { string user_id = 1; string build_id = 2; }
message ShipReply { bool ok = 1; string shipped_at = 2; }`, lang: 'protobuf' }),
      D('Deep dive: securing a GraphQL API', `Limit query depth and complexity, add timeouts and pagination on lists, disable introspection in production if the API is private, authorise in resolvers (or a shared layer) per object, and use persisted queries so only known queries run.`),
    ],
    quiz: [
      Q('Main GraphQL advantage?', ['Always faster', 'Clients fetch exactly the fields they need in one request', 'No schema', 'Built-in caching'], 1, 'Flexible data fetching.'),
      Q('gRPC is most common for…', ['Browser forms', 'Internal service-to-service calls', 'Static sites', 'Emails'], 1, 'Fast typed RPC.'),
    ],
    practice: 'Add a small GraphQL endpoint (Strawberry or Apollo) over your logs/builds with DataLoader, and compare the client code to REST.',
    explain: 'Explain GraphQL vs REST with a set menu vs ordering à la carte.',
  },

  'be-sec': {
    intro: 'APIs are the main attack surface of modern apps. Know the common attacks and build defences in by default.',
    concepts: [
      C('OWASP Top 10', `The most common web/API risks. The ones that hit APIs most:`,
        { cards: [['Broken access control', 'IDOR, missing role checks — #1 risk.'], ['Cryptographic failures', 'Plain-text secrets, weak hashing, no TLS.'], ['Injection', 'SQL/NoSQL/command injection.'], ['Insecure design', 'No threat modelling, no rate limits.'], ['Security misconfiguration', 'Debug mode on, default passwords, open buckets.'], ['Vulnerable components', 'Outdated packages with known CVEs.'], ['Auth failures', 'Weak sessions, no MFA, credential stuffing.'], ['SSRF', 'Server fetches attacker-chosen URLs (internal metadata!).']] }),
      C('Injection, XSS, CSRF', `- **SQL injection** — never build queries with string concatenation; use parameters/ORM.
- **Stored XSS** — your API stores HTML a client later renders; sanitise on output, validate input.
- **CSRF** — cookie-authenticated state changes need SameSite cookies and/or CSRF tokens.`,
        { code: `# ❌ injectable
cur.execute(f"SELECT * FROM users WHERE email = '{email}'")
# ✅ parameterised
cur.execute("SELECT * FROM users WHERE email = %s", (email,))`, lang: 'python' }),
      C('Rate limiting', `Protect logins (credential stuffing), OTP/reset endpoints, expensive endpoints (AI, search, exports) and the whole API per key/IP. Return 429 with Retry-After; log and alert on abuse patterns.`),
      C('Secrets management', `Secrets in a manager, injected at runtime; least privilege per service; rotate; scan repos (gitleaks, GitHub secret scanning); never log secrets or put them in URLs.`),
      C('Security headers', `For APIs: \`Strict-Transport-Security\`, \`X-Content-Type-Options: nosniff\`, proper \`Content-Type\`, restrictive CORS, \`Cache-Control: no-store\` on sensitive responses. Remove version banners (\`X-Powered-By\`).`,
        pick('Your API fetches a user-supplied image URL. What must you prevent?', ['Large images only', false], ['SSRF — block internal IPs/metadata endpoints and allow-list schemes/hosts', true, 'Attackers can make your server call internal services.'], ['Slow DNS', false])),
      D('Deep dive: a security review of one endpoint', `Take POST /proofs: authenticated? object ownership checked? input validated (size, type, text length)? URL fields safe (SSRF, javascript:)? rate-limited? errors don't leak internals? logged with user id? stored data escaped on output? tests for each? Do this for every new endpoint — it takes 5 minutes.`),
    ],
    quiz: [
      Q('#1 risk in the OWASP Top 10 (2021)?', ['Injection', 'Broken access control', 'XSS', 'Logging'], 1, 'Authorisation bugs are most common.'),
      Q('Prevent SQL injection with…', ['Escaping by hand', 'Parameterised queries / ORM', 'Longer passwords', 'HTTPS'], 1, 'Data and code kept separate.'),
    ],
    practice: 'Run a self-review of your API against the OWASP API Top 10 and fix 3 issues; add gitleaks to CI.',
    explain: 'Explain SQL injection with a form where someone writes instructions in the name field.',
  },

  'be-test': {
    intro: 'Back-end tests protect business rules and data. Focus on tests that catch real bugs and run fast enough to run always.',
    concepts: [
      C('Unit vs integration tests', `**Unit** tests check business logic in isolation (fast, many). **Integration** tests check that your code works with real dependencies — DB, Redis, HTTP layer (slower, fewer, but catch the bugs unit tests can't). For CRUD-heavy APIs, integration tests through the HTTP layer give the most confidence per test.`),
      C('Testing with a real DB (containers)', `Mocks lie about SQL. Run a real Postgres in Docker for tests — **Testcontainers** starts one per test run; wrap each test in a transaction that rolls back, or truncate tables between tests.`,
        { code: `@pytest.fixture(scope="session")
def pg():
    with PostgresContainer("postgres:16") as c:
        run_migrations(c.get_connection_url()); yield c.get_connection_url()

@pytest.fixture
def db(pg):
    conn = connect(pg); tx = conn.begin(); yield conn; tx.rollback()`, lang: 'python' }),
      C('pytest & Jest', `pytest (Python): fixtures, parametrize, plugins. Jest/Vitest (Node): describe/it, mocks, snapshots. Both: run in CI, measure coverage, but don't chase 100% — chase the critical paths and edge cases.`,
        pick('Which test catches a wrong SQL JOIN best?', ['Unit test with a mocked repository', false], ['Integration test against a real Postgres', true, 'Only a real DB executes the real SQL.'], ['A snapshot test', false])),
      C('Contract tests', `When services or front ends depend on your API, **contract tests** check you still honour the agreed request/response shapes (Pact, or schema tests against the OpenAPI spec) — catching breaking changes before deploy.`),
      D('Deep dive: the tests every API should have', `Happy path per endpoint; validation errors (422); unauthenticated (401); other user's object (404/403); not found; idempotency/duplicates; pagination edges (empty, last page); concurrency for critical writes (two buyers, one seat); and one load test for the busiest endpoint.`),
    ],
    quiz: [
      Q('Testcontainers is used to…', ['Mock HTTP', 'Run real dependencies like Postgres in tests', 'Deploy', 'Measure coverage'], 1, 'Real services in Docker.'),
      Q('Contract tests protect…', ['CSS', 'Agreed API shapes between provider and consumers', 'Passwords', 'Performance'], 1, 'Catch breaking changes.'),
    ],
    practice: 'Add Testcontainers-based integration tests for every endpoint of your API, including the "other user’s object" test.',
    explain: 'Explain unit vs integration tests with checking each car part vs test-driving the assembled car.',
  },
}
