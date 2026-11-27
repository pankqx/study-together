// Capstone walkthroughs — Back end and DBMS ladders
const S = (t, body, ...blocks) => ({ t, body, blocks })
const W = (title, intro, arch, steps, talk) => ({ title, intro, steps: [S('The architecture', 'What you are building, end to end:', { arch }), ...steps, S('Talk about it in interviews', talk)] })

export default {
  'be-1': W('Walkthrough: HTTP server from raw sockets', 'Write a tiny web server on TCP sockets. 2–4 days. After this, frameworks stop being magic.',
    [['Client', ['Browser / curl']], ['Your server', ['TCP accept loop', 'HTTP parser', 'Router', 'Static files']], ['Comparison', ['Same test against FastAPI']]],
    [
      S('1 · Accept connections', 'Open a socket, bind, listen, accept in a loop; print the raw bytes a browser sends.', { code: `import socket
srv = socket.socket(); srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(("0.0.0.0", 8080)); srv.listen()
while True:
    conn, addr = srv.accept()
    print(conn.recv(65536).decode(errors="replace")); conn.close()`, lang: 'python' }),
      S('2 · Parse HTTP', 'Split the request line (method, path, version), headers (until a blank line), and read the body using Content-Length.'),
      S('3 · Respond correctly', 'Status line, headers (Content-Type, Content-Length, Connection), blank line, body. Serve files from a folder with the right MIME types; return 404/405; block `../` path traversal.'),
      S('4 · Concurrency', 'Handle each connection in a thread; then rewrite with asyncio (`asyncio.start_server`). Support keep-alive.'),
      S('5 · Benchmark', 'Use `wrk` or `ab`: requests/sec and latency for threads vs asyncio vs FastAPI/uvicorn on the same page.'),
      S('6 · Write it up', 'README with a byte-level diagram of a request/response and your benchmark table.'),
      S('Go further', 'Chunked transfer encoding, gzip, a tiny router with path params, HTTP/1.1 pipelining.'),
    ],
    '"I implemented an HTTP/1.1 server on raw sockets — parsing, keep-alive, static files, path-traversal protection — then compared threads vs asyncio vs uvicorn under wrk. It made me understand what frameworks and reverse proxies actually do."'),

  'be-2': W('Walkthrough: URL shortener API', 'Short links with stats, validation, rate limits and docs. 2–4 days. The classic first real API.',
    [['Client', ['curl / small UI']], ['API (FastAPI or Express)', ['POST /links', 'GET /{code} → 302', 'GET /links/{code}/stats']], ['Data', ['Postgres (links, clicks)', 'Redis (rate limit, cache)']]],
    [
      S('1 · Design first', 'Endpoints, error format, and the data model. Decide code generation: counter → base62 (no collisions) vs random (unguessable).', { code: `CREATE TABLE links (id bigserial PRIMARY KEY, code text UNIQUE NOT NULL, url text NOT NULL, owner_id int, created_at timestamptz DEFAULT now());
CREATE TABLE clicks (id bigserial PRIMARY KEY, link_id bigint REFERENCES links(id), at timestamptz DEFAULT now(), referrer text, country text);
CREATE INDEX ON clicks (link_id, at);`, lang: 'sql' }),
      S('2 · Docker Compose', 'Postgres + Redis + API in compose; migrations with Alembic/Prisma; `.env.example`.'),
      S('3 · Create and redirect', 'Validate URLs (http/https only, length), generate code, return 201 with the short URL. Redirect with 302, recording the click asynchronously.'),
      S('4 · Rate limit and cache', 'Redis sliding-window limit per IP on POST; cache code → URL for hot links.'),
      S('5 · Stats', 'Clicks per day (date_trunc) and top referrers; cursor pagination for a user’s links.'),
      S('6 · Tests and measurement', 'Integration tests against real Postgres; k6 on the redirect: target p95 < 20 ms locally with cache.'),
      S('Go further', 'Custom aliases, expiry, QR codes, abuse detection (block malware domains).'),
    ],
    '"A URL shortener with base62 codes from a sequence (no collision checks), Redis caching and rate limiting, async click tracking, and integration tests against real Postgres. Redirect p95 is 12 ms locally."'),

  'be-3': W('Walkthrough: Auth service done properly', 'Sign-up, login, Google OAuth, refresh rotation, roles and password reset. About 1–1.5 weeks. Security skills employers check for.',
    [['Clients', ['Web app', 'Mobile']], ['Auth service', ['/signup /login /refresh /logout', '/oauth/google', '/reset']], ['Storage', ['users, sessions/refresh_tokens, reset_tokens', 'Redis (rate limits)']]],
    [
      S('1 · Data model', 'users (email unique, password_hash, role, email_verified), refresh_tokens (id, user_id, family_id, revoked, expires_at), reset_tokens (hash, expires_at, used).'),
      S('2 · Passwords', 'Argon2id hashing; minimum length + breached-password check (k-anonymity API) optional; login rate-limited per IP and per account.'),
      S('3 · Tokens', 'Access JWT (10 min) + refresh token (random, stored hashed, HttpOnly cookie). Rotate on every refresh; reuse of an old token revokes the whole family.', { code: `def refresh(old):
    rt = db.get_refresh(hash(old))
    if not rt or rt.expires_at < now(): raise Unauthorized()
    if rt.revoked:                       # reuse → theft
        db.revoke_family(rt.family_id); raise Unauthorized()
    db.revoke(rt.id)
    return issue_pair(rt.user_id, family_id=rt.family_id)`, lang: 'python' }),
      S('4 · Google login', 'Authorization Code + PKCE; verify the ID token (issuer, audience, expiry, email_verified); link to an existing account by verified email.'),
      S('5 · RBAC and ownership', 'A `require(permission)` dependency/middleware; every resource query scoped by owner. Write the "user B can’t access user A" test for each resource.'),
      S('6 · Reset and verify flows', 'Single-use, hashed, 30-minute tokens; identical responses for unknown emails; sessions revoked after reset.'),
      S('7 · Security review', 'Walk the OWASP API Top 10; add security headers; document threats and mitigations in the README.'),
      S('Go further', 'TOTP MFA or passkeys (WebAuthn), device/session list with "log out everywhere", audit log of security events.'),
    ],
    '"I built an auth service with Argon2id, short-lived JWTs and rotating refresh tokens with reuse detection, Google OIDC with PKCE, RBAC, and tests proving cross-user access is impossible. I documented an OWASP review of my own service."'),

  'be-4': W('Walkthrough: Booking & payments API', 'Tickets or seats with holds, payments in test mode and webhooks — never double-booked. About 1–1.5 weeks.',
    [['Client', ['Seat map UI / API client']], ['API', ['/shows /seats', '/holds (5 min)', '/orders', '/webhooks/payments']], ['Data & jobs', ['Postgres (seats, holds, orders, payments)', 'Worker: expire holds', 'Razorpay/Stripe test mode']]],
    [
      S('1 · Model the domain', 'shows, seats, holds (seat, user, expires_at), orders, payments, processed_webhooks. A unique constraint so a seat has at most one active booking.', { code: `CREATE UNIQUE INDEX one_active_booking ON bookings (show_id, seat_id) WHERE status IN ('held', 'paid');`, lang: 'sql' }),
      S('2 · Hold a seat atomically', 'Insert the hold inside a transaction; the unique index rejects a second hold — return 409. Holds expire after 5 minutes (background job or check on read).'),
      S('3 · Idempotent order creation', 'Require an `Idempotency-Key` header; store key → response; repeats return the stored response.'),
      S('4 · Payments + webhooks', 'Create the payment in test mode; confirm via a signed webhook (verify HMAC, dedupe by event id, process in a job). Never trust the client’s "payment success".'),
      S('5 · Failure paths', 'Payment failed or expired hold → release seat; refunds; reconciliation job comparing your orders with the provider’s records.'),
      S('6 · The concurrency test', 'Script 100 parallel buyers for one seat: exactly one succeeds, 99 get 409. Put it in CI.'),
      S('Go further', 'Seat map with live updates (SSE), coupons, invoices as PDFs from a worker.'),
    ],
    '"A booking API where a partial unique index guarantees a seat can’t be sold twice — proven by a 100-concurrent-buyer test. Orders are idempotent, payments are confirmed only by signed, deduplicated webhooks, and a reconciliation job catches mismatches."'),

  'be-5': W('Walkthrough: Job queue & notification worker', 'Background jobs with retries, scheduling and a dead-letter queue for email and push. About 1 week.',
    [['Producers', ['API endpoints', 'Scheduler (cron)']], ['Queue', ['Redis (BullMQ / Celery)']], ['Workers', ['email', 'push', 'reports']], ['Ops', ['DLQ admin page', 'Metrics']]],
    [
      S('1 · Queue setup', 'Celery + Redis (Python) or BullMQ (Node) in Docker Compose; separate queues for "critical" (OTP) and "bulk" (newsletters).'),
      S('2 · Idempotent jobs', 'Each job carries an idempotency key; workers record completion so a retry never double-sends.'),
      S('3 · Retries and DLQ', 'Exponential backoff with jitter, max 5 attempts; failed jobs land in a DLQ with the error; admin page to inspect and replay.'),
      S('4 · Scheduling', 'Daily recap at 9 pm IST; ensure only one scheduler runs; per-user quiet hours.'),
      S('5 · Rate limits per user', 'Max N notifications per hour per user; collapse duplicates within a window.'),
      S('6 · Graceful shutdown test', 'Kill a worker mid-job: the job is retried and completes exactly once (from the user’s point of view).'),
      S('7 · Observe', 'Queue length, oldest job age, failure rate; alert if the queue backs up.'),
      S('Go further', 'Outbox pattern from Postgres, priority lanes, a provider failover (two email services).'),
    ],
    '"A notification system with separate priority queues, idempotent jobs, exponential retries and a dead-letter queue with replay. I killed workers mid-job in tests to prove nothing is lost or sent twice."'),

  'be-6': W('Walkthrough: Real-time chat backend', 'Rooms, presence, typing, history and uploads across multiple servers. 2–3 weeks.',
    [['Clients', ['Web / mobile']], ['Gateway (2+ instances)', ['WebSocket auth', 'Rooms', 'Presence']], ['Shared', ['Redis pub/sub + presence keys']], ['Storage', ['Postgres messages', 'S3 signed uploads']]],
    [
      S('1 · Protocol', 'Define message types (join, leave, msg, typing, ack, history) as JSON with a version field. Authenticate on connect with a short-lived token.'),
      S('2 · Single server first', 'Rooms in memory; messages saved to Postgres; history with cursor pagination.'),
      S('3 · Scale out', 'Run two instances; publish every message to Redis channel `room:{id}`; each instance forwards to its own connected clients.'),
      S('4 · Presence and typing', 'Heartbeats every 15 s, Redis keys with 30 s TTL; typing events throttled and never stored.'),
      S('5 · Delivery semantics', 'Client message ids for dedupe; server acks; on reconnect, fetch messages since the last seen id.'),
      S('6 · Files', 'Signed-URL uploads to S3/MinIO; thumbnails in a worker.'),
      S('7 · Load test', 'k6 WebSocket test: 1,000 concurrent connections, measure delivery p95; find the bottleneck.'),
      S('Go further', 'Read receipts, end-to-end encryption research, moderation (rate limits, word filters).'),
    ],
    '"A horizontally scalable chat backend: WebSocket gateways fan out through Redis pub/sub, presence uses TTL heartbeats, clients dedupe by message id and resync on reconnect. It held 1,000 concurrent connections with 140 ms p95 delivery."'),

  'be-7': W('Walkthrough: Multi-tenant SaaS API platform', 'One API serving many companies, with keys, plans, metering and full observability. 2–3 weeks. A senior-level back-end project.',
    [['Tenants', ['Company A', 'Company B']], ['Edge', ['API keys (scoped)', 'Rate limits per plan']], ['API', ['Tenant-aware services', 'Usage metering']], ['Platform', ['Postgres + RLS', 'OpenTelemetry → Grafana', 'Contract tests']]],
    [
      S('1 · Choose a tenancy model', 'Shared tables with tenant_id + Postgres row-level security (most common). Document why vs schema-per-tenant.', { code: `ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects USING (tenant_id = current_setting('app.tenant_id')::uuid);
-- per request: SET LOCAL app.tenant_id = '…';`, lang: 'sql' }),
      S('2 · API keys', 'Prefix + random secret, store only a hash, scopes (read/write), rotation and revoke; show the key once.'),
      S('3 · Plans and limits', 'Free/Pro plans with rate limits and monthly quotas enforced at the edge (Redis); 429 with headers showing remaining quota.'),
      S('4 · Usage metering', 'Record usage events asynchronously; aggregate daily per tenant; usage endpoint for customers.'),
      S('5 · Observability', 'OpenTelemetry traces and metrics with tenant id; Grafana dashboards; SLO on the main endpoint with burn-rate alert.'),
      S('6 · Contract and isolation tests', 'OpenAPI-based contract tests; a test suite that tries to read across tenants by every route — must always fail.'),
      S('7 · Noisy neighbour', 'Simulate one tenant flooding the API; show the others unaffected (per-tenant limits, queue fairness).'),
      S('Go further', 'Webhooks for customers with signing and retries, audit logs per tenant, data export/delete per tenant (privacy).'),
    ],
    '"A multi-tenant API with Postgres row-level security, hashed scoped API keys, per-plan rate limits and usage metering, OpenTelemetry tracing and an SLO. Cross-tenant access tests run on every route in CI."'),

  'db-1': W('Walkthrough: College database, designed right', 'A full college schema and 30 graded queries. 2–4 days. Covers most of a university DBMS syllabus in one project.',
    [['Design', ['ER diagram', 'Normalised to 3NF']], ['Database', ['students, faculty, departments, courses, enrolments, fees, attendance']], ['Queries', ['30 queries: easy → windows']]],
    [
      S('1 · Requirements', 'List what the college needs: admissions, courses per semester, faculty assignments, marks, attendance, fees. Each becomes entities and relationships.'),
      S('2 · ER diagram', 'Draw it on your board with cardinalities; M:N (students–courses) via enrolment; weak entities (attendance per class session).'),
      S('3 · Normalise', 'Write functional dependencies; reach 3NF; note one deliberate denormalisation for reporting.'),
      S('4 · DDL with constraints', 'PK, FK (with ON DELETE choices), UNIQUE, CHECK (marks 0–100, fee ≥ 0), NOT NULL; sensible types (numeric for money, timestamptz).'),
      S('5 · Seed realistic data', 'Python + Faker: 2,000 students, 80 courses, 3 semesters of marks and attendance.'),
      S('6 · 30 queries', 'Joins, anti-joins (students with no enrolment), GROUP BY/HAVING, subqueries, CTEs, ranks (toppers per course), attendance % with conditional aggregation, defaulters list.', { code: `-- attendance defaulters (< 75%) per course
SELECT e.student_id, e.course_id,
       ROUND(100.0 * COUNT(*) FILTER (WHERE a.present) / COUNT(*), 1) AS pct
FROM enrolment e JOIN attendance a USING (student_id, course_id)
GROUP BY 1, 2 HAVING 100.0 * COUNT(*) FILTER (WHERE a.present) / COUNT(*) < 75;`, lang: 'sql' }),
      S('7 · Views and docs', 'Views for marksheet and fee dues; README with the ER diagram, the queries and expected outputs.'),
      S('Go further', 'Audit trigger on marks, row-level security so faculty see only their courses, a tiny FastAPI over it.'),
    ],
    '"I designed a college database from requirements to 3NF with full constraints, seeded realistic data, and wrote 30 queries from joins to window functions — including attendance defaulters and toppers per course."'),

  'db-2': W('Walkthrough: SQL analytics on real data', 'Answer 20 business questions on a real dataset with advanced SQL. 2–4 days. Direct interview prep.',
    [['Data', ['Open dataset (IPL, NYC taxi, data.gov.in)']], ['Engines', ['Postgres', 'DuckDB']], ['Output', ['20 questions → SQL → chart → insight']]],
    [
      S('1 · Pick and load data', 'IPL ball-by-ball or NYC taxi trips; load into Postgres (COPY) and DuckDB (read_csv/parquet).'),
      S('2 · Write the questions first', '20 questions a manager would ask: trends, top-N per group, retention, streaks, period-over-period.'),
      S('3 · Answer with the right tool', 'CTEs for readability; window functions for ranks, running totals, LAG; FILTER for pivots; generate_series to fill gaps.', { code: `-- top 3 run scorers per season
SELECT * FROM (
  SELECT season, batter, SUM(runs) AS runs,
         DENSE_RANK() OVER (PARTITION BY season ORDER BY SUM(runs) DESC) AS r
  FROM deliveries GROUP BY season, batter) t
WHERE r <= 3 ORDER BY season, r;`, lang: 'sql' }),
      S('4 · Verify', 'Cross-check 3 answers with a second method; check row counts after joins.'),
      S('5 · Compare engines', 'Time the 5 heaviest queries in Postgres vs DuckDB; explain the difference (row vs columnar).'),
      S('6 · Report', 'For each question: SQL, a chart, and one sentence of insight. Publish as a README or notebook.'),
      S('Go further', 'Turn it into a Metabase dashboard; add indexes and show EXPLAIN plans for the slow ones.'),
    ],
    '"I answered 20 business questions on IPL data using CTEs, window functions and gaps-and-islands, verified results two ways, and benchmarked Postgres vs DuckDB to explain row vs columnar performance."'),

  'db-3': W('Walkthrough: Index & query-tuning lab', 'A 10-million-row table, slow queries, and a write-up of how you made them fast. About 1 week.',
    [['Data', ['10M orders generated with generate_series']], ['Tools', ['EXPLAIN (ANALYZE, BUFFERS)', 'pg_stat_statements']], ['Output', ['Before/after table + plans']]],
    [
      S('1 · Generate data', 'Realistic skew: some customers with many orders, dates over 3 years, statuses with uneven frequency.', { code: `INSERT INTO orders (customer_id, status, amount, created_at)
SELECT (random() ^ 3 * 100000)::int, (ARRAY['paid','paid','paid','refunded','cancelled'])[1 + (random()*4)::int],
       round((random() * 5000)::numeric, 2), now() - random() * interval '3 years'
FROM generate_series(1, 10000000);
ANALYZE orders;`, lang: 'sql' }),
      S('2 · Write 5 realistic slow queries', 'Customer history, date-range report, status filter, text search on notes, JSONB filter.'),
      S('3 · Baseline', 'EXPLAIN (ANALYZE, BUFFERS) for each; record time and buffers.'),
      S('4 · Index experiments', 'Composite (customer_id, created_at DESC), partial (WHERE status = \'refunded\'), covering (INCLUDE amount), GIN (JSONB / full text), BRIN (created_at on append-only data).'),
      S('5 · Measure the cost', 'Insert throughput and index size before/after each index — indexes aren’t free.'),
      S('6 · Explain the surprises', 'A case where the planner ignores your index (low selectivity) and why that is correct.'),
      S('7 · Publish', 'A table: query, before, after, index used, size, write cost — with plan snippets.'),
      S('Go further', 'Partition by month and compare; tune work_mem for a big sort; try extended statistics.'),
    ],
    '"On a 10M-row table I tuned five slow queries with composite, partial, covering, GIN and BRIN indexes — each at least 10× faster — and measured the write and storage cost of each index, including a case where a sequential scan was correctly preferred."'),

  'db-4': W('Walkthrough: Concurrency & isolation lab', 'Reproduce dirty reads, lost updates and write skew, then fix each. About 1 week. Turns textbook theory into muscle memory.',
    [['Harness', ['Python script with 2 connections and barriers']], ['Postgres', ['Isolation levels', 'Locks', 'Constraints']], ['Output', ['Anomaly × level × fix table']]],
    [
      S('1 · Build the harness', 'Two connections and a step-by-step script so you control interleaving (T1 read → T2 write → T1 write…).'),
      S('2 · Lost update', 'Two transactions read balance 100 and both write balance + 50 → 150 instead of 200. Fix with atomic UPDATE balance = balance + 50, FOR UPDATE, or version checks.'),
      S('3 · Non-repeatable read and phantoms', 'Show them under Read Committed; show Repeatable Read prevents them (snapshot).'),
      S('4 · Write skew', 'The on-call doctors problem: both go off-call under Repeatable Read. Fix with Serializable + retry, or locking the rows you read.', { code: `for attempt in range(5):
    try:
        with conn.transaction(isolation="serializable"): go_off_call(doctor)
        break
    except SerializationFailure:
        time.sleep(0.05 * 2 ** attempt)`, lang: 'python' }),
      S('5 · Deadlock', 'Create one deliberately; read the error; fix by ordering locks.'),
      S('6 · Seat booking four ways', 'FOR UPDATE, conditional UPDATE, unique constraint, serializable — with a 100-client test for each and their throughput.'),
      S('7 · Publish the table', 'Anomaly × isolation level × fix, with your scripts so anyone can reproduce.'),
      S('Go further', 'Compare with MySQL InnoDB behaviour; explore advisory locks.'),
    ],
    '"I built a harness that reproduces every isolation anomaly in Postgres step by step, including write skew under Repeatable Read, and compared four ways to prevent double booking under 100 concurrent clients."'),

  'db-5': W('Walkthrough: Key-value store from scratch', 'A Bitcask-style database: append-only log, in-memory index, compaction, crash recovery. About 1 week.',
    [['Client', ['TCP: GET / SET / DEL']], ['Engine', ['In-memory hash index: key → (file, offset)', 'Append-only data files', 'Compaction']], ['Disk', ['data-0001.log', 'hint files']]],
    [
      S('1 · Record format', 'Each record: CRC32, timestamp, key length, value length, key, value. Tombstone for deletes.'),
      S('2 · Write path', 'Append record, fsync policy (every write vs batched — measure both), update index with the offset.'),
      S('3 · Read path', 'Look up offset in the index, seek, read, verify CRC.'),
      S('4 · Recovery', 'On startup scan files to rebuild the index; skip a torn final record (bad CRC). Test with kill -9 during writes.'),
      S('5 · Compaction', 'When a file is full, roll to a new one; merge old files keeping only the latest value per key; write hint files for fast startup.'),
      S('6 · Network protocol and benchmark', 'Simple text protocol over TCP; benchmark ops/sec for reads and writes; compare fsync policies.'),
      S('Go further', 'Range scans (requires sorted structure → leads to db-6), TTLs, replication to a follower.'),
    ],
    '"I implemented a Bitcask-style key-value store with checksummed append-only logs, crash recovery tested with kill -9, and compaction with hint files. Benchmarks showed the throughput cost of fsync-per-write vs batching."'),

  'db-6': W('Walkthrough: Storage engine — B+tree or LSM', 'Build the engine inside real databases. 2–3 weeks. Deep systems knowledge that stands out.',
    [['API', ['put / get / delete / scan(range)']], ['Option A: B+tree', ['Pages + buffer pool', 'Splits', 'WAL']], ['Option B: LSM', ['Memtable + WAL', 'SSTables + bloom filters', 'Compaction']]],
    [
      S('1 · Choose and read', 'B+tree (Postgres-like, read-optimised) or LSM (RocksDB-like, write-optimised). Read the relevant chapter of "Designing Data-Intensive Applications" and draw the design.'),
      S('2 · Storage layer', 'Fixed 4 KB pages with a page manager (B+tree) or sorted immutable SSTable files with an index block (LSM).'),
      S('3 · Core operations', 'B+tree: search, insert with node splits, leaf links for range scans. LSM: memtable (sorted map) flushed to SSTables, reads check memtable then SSTables newest-first.'),
      S('4 · Durability', 'Write-ahead log replayed on startup; test crash recovery.'),
      S('5 · Make reads fast', 'B+tree: LRU buffer pool. LSM: bloom filters per SSTable and compaction to bound read amplification.'),
      S('6 · Verify and benchmark', 'Property-based tests (random ops vs a Python dict); benchmark against SQLite for writes, point reads and range scans.'),
      S('Go further', 'Concurrency (latches), MVCC snapshots, leveled vs tiered compaction comparison.'),
    ],
    '"I built an LSM storage engine with a WAL, memtable, SSTables, bloom filters and compaction, verified with property-based tests against a reference map and benchmarked against SQLite — so I can explain read, write and space amplification from experience."'),

  'db-7': W('Walkthrough: Replicated database with failover', 'Leader-follower replication with Raft so the store survives a node failure. 2–3 weeks.',
    [['Clients', ['Find leader, retry on redirect']], ['Cluster (3 nodes)', ['Node 1 (leader)', 'Node 2', 'Node 3']], ['Each node', ['Raft log', 'KV state machine', 'Snapshots']]],
    [
      S('1 · Understand Raft', 'Read the Raft paper and the visualisation (raft.github.io); draw states, terms, log matching on your board.'),
      S('2 · Leader election', 'Randomised election timeouts, RequestVote RPC, terms; exactly one leader per term.'),
      S('3 · Log replication', 'AppendEntries with consistency checks; commit when a majority has the entry; apply to the KV state machine.'),
      S('4 · Client interaction', 'Writes only via leader (redirect otherwise); linearizable reads through the leader vs fast stale reads from followers.'),
      S('5 · Fault tests', 'Docker Compose with 3 nodes; kill the leader, partition the network (tc/iptables), restart nodes; verify no acknowledged write is lost.'),
      S('6 · Snapshots', 'Compact the log with snapshots; install snapshot on lagging followers.'),
      S('Go further', 'Use an existing Raft library (hashicorp/raft, etcd raft) and compare; membership changes; a Jepsen-style checker.'),
    ],
    '"I implemented Raft leader election and log replication for a 3-node key-value store and ran fault-injection tests — killing leaders and partitioning the network — confirming no acknowledged write was ever lost."'),
}
