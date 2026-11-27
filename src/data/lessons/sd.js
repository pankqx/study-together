// System design — 8 lessons
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'sd-basics': {
    intro: 'System design is about trade-offs under numbers. These foundations let you reason about any design instead of memorising diagrams.',
    concepts: [
      C('Latency vs throughput', `**Latency** = how long one request takes (ms). **Throughput** = how many requests per second the system handles. They are different: a highway can carry many cars (throughput) while each trip still takes 30 minutes (latency).`,
        { table: { cols: ['Operation', 'Rough latency'], rows: [['L1 cache / RAM read', '~1 ns / ~100 ns'], ['SSD random read', '~100 µs'], ['Same-datacentre round trip', '~0.5 ms'], ['Redis GET', '< 1 ms'], ['Postgres indexed query', '1–5 ms'], ['Mumbai ↔ Singapore', '~60 ms'], ['Mumbai ↔ US East', '~200 ms']] } },
        { note: 'Memorise orders of magnitude, not exact numbers — they decide where caches, regions and batching belong.' }),
      C('Availability & SLAs (the nines)', `Availability = share of time the system works. Each extra nine is ~10× harder and costlier.`,
        { table: { cols: ['Availability', 'Downtime per year', 'Per month'], rows: [['99%', '3.65 days', '7.3 h'], ['99.9%', '8.8 h', '43.8 min'], ['99.99%', '52.6 min', '4.4 min'], ['99.999%', '5.3 min', '26 s']] } },
        { note: 'Serial dependencies multiply: an API (99.9%) calling a DB (99.9%) is ~99.8% at best. Redundancy (parallel copies) raises availability.' }),
      C('Back-of-the-envelope estimates', `Estimate before designing — numbers pick the architecture.`,
        { steps: [['Users', '10M daily active users.'], ['Requests', 'Each makes 20 reads, 2 writes/day → 200M reads, 20M writes/day.'], ['Per second', '1 day ≈ 86,400 s ≈ 10⁵ s → ~2,300 reads/s, ~230 writes/s average; peak ×3–5.'], ['Storage', '20M writes × 1 KB = 20 GB/day ≈ 7 TB/year.'], ['Decision', 'Reads ≫ writes → cache + read replicas; 7 TB/yr → plan partitioning/archival.']] },
        pick('100M requests/day. Roughly how many per second on average?', ['~100', false], ['~1,200', true, '100M ÷ ~86,400 ≈ 1,157/s; plan for a few thousand at peak.'], ['~100,000', false])),
      C('Vertical vs horizontal scaling', `- **Vertical** (scale up) — bigger machine. Simple; has a ceiling and a single point of failure.
- **Horizontal** (scale out) — more machines. Near-unlimited and fault-tolerant; needs stateless services, load balancing, and data partitioning.

Start vertical for databases (it goes surprisingly far), horizontal for stateless app servers.`),
      D('Deep dive: how to run a design interview', `A 45-minute structure that works:`,
        { steps: [['Requirements (5 min)', 'Functional (what it does) and non-functional (scale, latency, availability, consistency). Ask, don’t assume.'], ['Estimates (5 min)', 'QPS, storage, bandwidth.'], ['API & data model (5 min)', 'Key endpoints and tables.'], ['High-level design (10 min)', 'Boxes and arrows for the happy path.'], ['Deep dives (15 min)', 'The 2 hardest parts: hot keys, consistency, failure.'], ['Wrap up (5 min)', 'Bottlenecks, trade-offs, what you’d do at 10×.']] }),
    ],
    quiz: [
      Q('99.9% availability allows roughly how much downtime per month?', ['4 minutes', '43 minutes', '7 hours', '3 days'], 1, '~43.8 minutes.'),
      Q('Throughput measures…', ['Time per request', 'Requests handled per second', 'Error rate', 'Storage'], 1, 'Volume per time.'),
      Q('First thing in a design interview?', ['Draw Kafka', 'Clarify requirements', 'Pick a database', 'Write code'], 1, 'Requirements drive everything.'),
    ],
    practice: 'Do the estimates for "Study Together for 1 million students": QPS, storage per year, peak load — on your board.',
    explain: 'Explain latency vs throughput with a toll plaza.',
  },

  'sd-net': {
    intro: 'Networking choices shape latency, reliability and cost in every design.',
    concepts: [
      C('TCP vs UDP', `**TCP** — reliable, ordered, connection-based (web, APIs, databases). **UDP** — no guarantees, low overhead (video calls, games, DNS, QUIC builds reliability on top of it). Choose UDP when late data is useless and speed matters more than completeness.`),
      C('HTTP/1.1, 2, 3', `1.1: one request at a time per connection (browsers open ~6). 2: multiplexed streams over one TCP connection, header compression. 3: HTTP over QUIC (UDP) — no TCP head-of-line blocking, faster handshakes, better on flaky mobile networks.`),
      C('DNS & CDNs', `DNS maps names to IPs and can route users (geo/latency routing, failover). **CDNs** cache content at edge locations near users, absorb traffic spikes and DDoS, and terminate TLS — the cheapest big latency win for global users.`),
      C('Load balancers (L4 vs L7)', `- **L4** (transport) — routes TCP/UDP by IP/port; very fast; can’t see HTTP.
- **L7** (application) — understands HTTP: route by path/host/header, TLS termination, sticky sessions, retries, rate limits.

Algorithms: round robin, least connections, consistent hashing (for cache affinity).`,
        pick('Route /api/* and /images/* to different server pools. Which load balancer?', ['L4', false], ['L7', true, 'Path-based routing needs HTTP awareness.'], ['DNS only', false])),
      C('Reverse proxies', `A server in front of your services (Nginx, Envoy, Caddy, cloud LBs): TLS termination, compression, caching, routing, rate limiting, and hiding internal topology. An API gateway is a reverse proxy with API features (auth, quotas, transformations).`,
        { arch: [['Clients', ['Browser', 'Mobile']], ['Edge', ['CDN', 'WAF']], ['Reverse proxy / L7 LB', ['TLS', 'Routing', 'Rate limits']], ['Services', ['web', 'api', 'ws']]] }),
      D('Deep dive: where latency hides', `DNS lookup + TCP handshake + TLS handshake + server time + payload transfer. For far-away users, round trips dominate: use a CDN, keep connections alive, HTTP/2/3, fewer round trips (batch requests), and edge regions closer to users.`),
    ],
    quiz: [
      Q('Live video calls usually prefer…', ['TCP', 'UDP-based protocols', 'SMTP', 'FTP'], 1, 'Late frames are useless; low latency wins.'),
      Q('Biggest latency win for global static content?', ['Bigger DB', 'A CDN', 'More logs', 'Vertical scaling'], 1, 'Serve from the edge.'),
    ],
    practice: 'Put Nginx in front of two copies of your API with path routing and compare latency with and without keep-alive.',
    explain: 'Explain L4 vs L7 load balancing with a postman reading only the address vs one reading the letter.',
  },

  'sd-cache': {
    intro: 'Most large systems scale reads with caches and replicas, and writes with partitioning. Each brings consistency trade-offs.',
    concepts: [
      C('Cache strategies & invalidation', `Layers: browser → CDN → application cache (Redis) → database cache. Patterns: cache-aside (default), write-through, write-behind. Invalidate on write, TTL as a safety net, and protect against stampedes (see the back-end caching lesson).`),
      C('Read replicas', `Copies of the database that serve reads. Scale read-heavy workloads and isolate analytics; but replication lag means replicas can be stale — send "read-your-own-writes" requests to the primary.`),
      C('Sharding & consistent hashing', `Split data across nodes by a shard key. Plain \`hash(key) % N\` remaps almost everything when N changes. **Consistent hashing** places nodes and keys on a ring; adding a node moves only ~1/N of keys. Virtual nodes smooth out imbalance.`,
        { steps: [['Ring', 'Hash space 0…2³² arranged in a circle.'], ['Place nodes', 'Each node (×100 virtual points) hashed onto the ring.'], ['Place keys', 'A key belongs to the next node clockwise.'], ['Add a node', 'It takes over only the keys between it and its predecessor.'], ['Remove a node', 'Its keys move to the next node only.']] }),
      C('Consistency models', `- **Strong / linearizable** — every read sees the latest write. Simple to reason about; costs latency and availability.
- **Eventual** — replicas converge over time; reads may be stale.
- **Read-your-writes, monotonic reads, causal** — practical middle grounds.

Pick per feature: account balance → strong; like counts → eventual.`,
        pick('Like counts on posts can be a few seconds stale. Consistency?', ['Strong', false], ['Eventual', true, 'Cheaper and more available; staleness is harmless here.'], ['Serializable transactions across regions', false])),
      D('Deep dive: hot keys', `One celebrity, one viral product, one popular cache key can overload a single shard. Fixes: replicate hot keys to many cache nodes, add a local in-process cache, split the key (key#1…key#10) and merge on read, rate-limit, or treat celebrities with a special path (as in the news-feed design).`),
    ],
    quiz: [
      Q('Why consistent hashing?', ['Encryption', 'Adding/removing nodes moves only a small share of keys', 'Faster hashing', 'Strong consistency'], 1, 'Minimal remapping.'),
      Q('A user updates their profile then sees the old one from a replica. Fix?', ['Bigger replica', 'Read-your-writes: read from primary after writing', 'Remove caching everywhere', 'More shards'], 1, 'Route their reads to the primary briefly.'),
    ],
    practice: 'Implement consistent hashing with virtual nodes in Python and show how many keys move when adding a 5th node vs modulo hashing.',
    explain: 'Explain consistent hashing with seats around a round table.',
  },

  'sd-async': {
    intro: 'Asynchronous, event-driven designs decouple services, absorb spikes and survive failures — with new problems to manage.',
    concepts: [
      C('Message queues vs streams', `- **Queue** (SQS, RabbitMQ) — each message processed by one consumer, then deleted. Work distribution.
- **Stream/log** (Kafka, Kinesis) — ordered, retained, replayable; many independent consumer groups each read everything.`,
        { table: { cols: ['', 'Queue', 'Stream'], rows: [['After processing', 'Deleted', 'Retained'], ['Replay', 'No', 'Yes'], ['Many independent readers', 'Awkward', 'Natural'], ['Ordering', 'Usually not guaranteed', 'Per partition']] } }),
      C('Pub/sub', `Publishers emit events to a topic without knowing subscribers; every subscriber gets a copy. Adding a new consumer (analytics, notifications) needs no change to the producer.`),
      C('Idempotency', `Async systems deliver **at least once**, so every consumer must tolerate duplicates: dedupe by event id, upserts, conditional updates, idempotency keys for external calls.`),
      C('Outbox pattern & sagas', `**Outbox** — write the business change and the event in one DB transaction; a relay publishes the event (no lost or phantom events). **Saga** — a multi-service workflow where each step has a compensating action (reserve stock → charge → if charge fails, release stock).`,
        { steps: [['OrderCreated', 'Order service (outbox).'], ['Reserve stock', 'Inventory service → StockReserved.'], ['Charge', 'Payment service → PaymentFailed.'], ['Compensate', 'Inventory releases stock; order marked failed.'], ['Notify', 'User told; no inconsistent state left.']] }),
      C('Back-pressure', `When consumers can't keep up, the system must push back instead of collapsing: bounded queues, rate limits on producers, autoscaling consumers on lag, shedding low-priority work, and 429/503 to clients.`,
        pick('A flash sale produces 50× normal orders. Payment service can handle 2×. Best design?', ['Call payments directly and hope', false], ['Queue orders, process at payment’s pace, show "processing" status', true, 'The queue absorbs the spike; back-pressure protects payments.'], ['Drop all orders', false])),
      D('Deep dive: choreography vs orchestration', `**Choreography** — services react to each other’s events; loose coupling but the overall flow is hard to see. **Orchestration** — a coordinator (Step Functions, Temporal, a saga orchestrator) tells each service what to do; explicit flow, easier to debug, one more component. Many teams use orchestration for critical business flows.`),
    ],
    quiz: [
      Q('Need to replay last week’s events into a new service. Use…', ['A queue', 'A stream/log like Kafka', 'Email', 'A cron job'], 1, 'Streams retain events.'),
      Q('Sagas handle failures with…', ['Distributed locks', 'Compensating actions', 'Retries only', 'Two-phase commit always'], 1, 'Undo previous steps.'),
    ],
    practice: 'Do build sd-4: three services with outbox, saga compensation and a replayed read model.',
    explain: 'Explain back-pressure with a restaurant handing out tokens when the kitchen is full.',
  },

  'sd-arch': {
    intro: 'How services are organised and how traffic and visibility are managed across them.',
    concepts: [
      C('Monolith vs microservices', `A **modular monolith** is the right start for most teams: one deploy, simple transactions, easy debugging. **Microservices** help when many teams need independent deploys and scaling — at the cost of network failures, distributed data, and heavy ops.`,
        { table: { cols: ['', 'Monolith', 'Microservices'], rows: [['Deploy', 'One unit', 'Independent per service'], ['Transactions', 'Local, easy', 'Sagas, eventual consistency'], ['Debugging', 'One stack trace', 'Distributed tracing needed'], ['Team size fit', '1–20 engineers', 'Many teams']] } }),
      C('API gateway', `A single entry point for clients: routing to services, authentication, rate limiting, request/response shaping, and aggregation (backend-for-frontend). Keep business logic out of it.`),
      C('Service discovery', `How services find each other as instances come and go: DNS-based (Kubernetes Services), registries (Consul), or service meshes (Istio, Linkerd) that also add retries, mTLS and traffic splitting.`),
      C('Rate limiting algorithms', `Choices with different behaviour:`,
        { cards: [['Fixed window', 'Count per minute; simple; bursts at window edges.'], ['Sliding window log', 'Exact; stores timestamps; memory heavy.'], ['Sliding window counter', 'Weighted mix of two windows; good balance.'], ['Token bucket', 'Refills at a rate; allows bursts up to bucket size. Most common.'], ['Leaky bucket', 'Smooth constant outflow; queues bursts.']] }),
      C('Observability (logs, metrics, traces)', `**Logs** — what happened (events). **Metrics** — how much/how fast (numbers over time). **Traces** — the path of one request across services. OpenTelemetry standardises all three; correlate them with a request/trace id.`,
        pick('A request is slow and passes through 6 services. Which tool finds the slow hop?', ['Logs only', false], ['Distributed tracing', true, 'Spans show time spent in each service.'], ['CPU metrics', false])),
      D('Deep dive: the strangler fig migration', `To move off a legacy system safely, put a proxy in front and route one feature at a time to the new service, until the old one has nothing left. No big-bang rewrite; always shippable; easy rollback per route.`),
    ],
    quiz: [
      Q('Default architecture for a new 3-person product?', ['Microservices', 'Modular monolith', 'Service mesh', 'Serverless everything'], 1, 'Split later if needed.'),
      Q('Which rate limiter allows controlled bursts?', ['Fixed window', 'Token bucket', 'None', 'Leaky bucket only'], 1, 'Bucket capacity = burst size.'),
    ],
    practice: 'Do build sd-2 (distributed rate limiter) implementing token bucket and sliding window, with a burst graph.',
    explain: 'Explain monolith vs microservices with one big kitchen vs a food court.',
  },

  'sd-classic': {
    intro: 'Five classic designs that interviews love — each teaches reusable patterns. Practise them out loud with your crew.',
    concepts: [
      C('URL shortener', `Write-light, read-heavy. Key decisions: ID generation (counter+base62 vs random vs hash), cache hot codes, 301 vs 302 (analytics), click tracking asynchronously, and expiry/abuse controls.`,
        { arch: [['Clients', ['Create', 'Redirect']], ['API', ['Create service', 'Redirect service (stateless)']], ['Data', ['Redis cache: code → url', 'DB: links', 'Queue → click analytics']]] }),
      C('Chat app (like this one!)', `WebSocket gateways, a message store partitioned by conversation, fan-out via pub/sub, presence with heartbeats, offline delivery via push notifications, message ordering per conversation (sequence numbers), and read receipts.`),
      C('News feed', `Fan-out on write (precompute timelines; fast reads, expensive for celebrities) vs fan-out on read (compute at read time). Production systems use a **hybrid**: push for normal users, pull for celebrities; rank with ML; cache aggressively.`),
      C('Ride hailing', `Drivers stream locations every few seconds into a geospatial index (geohash/H3 + Redis/in-memory); matching finds nearby drivers with timeouts and re-offers; trip state machine; surge pricing per zone; shard by city/region.`,
        { steps: [['Driver locations', 'Every 4 s → location service (in-memory geo index).'], ['Rider requests', 'Find k nearest available drivers in H3 cells.'], ['Offer', 'Send to best driver; 10 s timeout; next driver if declined.'], ['Trip', 'State machine: requested → accepted → arrived → in-trip → completed.'], ['Payments & ratings', 'Async after the trip.']] }),
      C('Rate limiter', `Where (gateway vs service), which algorithm (token bucket), where state lives (Redis with atomic Lua), per-user/IP/key limits, fail-open vs fail-closed when Redis is down, and clear 429 responses.`,
        pick('Redis (holding rate-limit counters) goes down. For a public free API, usually…', ['Fail closed: reject everything', false], ['Fail open with a local in-memory fallback limit, and alert', true, 'Avoid a total outage while keeping some protection.'], ['Crash the API', false])),
      D('Deep dive: practise with the "1-pager" method', `For each classic: one page with requirements, numbers, API, data model, diagram, 2 deep dives and 3 trade-offs. Present it to your crew in 10 minutes on a call; they play interviewer and push on one weak spot.`),
    ],
    quiz: [
      Q('News feed for users following celebrities with 50M followers?', ['Fan-out on write for all', 'Hybrid: pull for celebrities, push for others', 'No caching', 'One SQL query'], 1, 'Avoid 50M writes per celebrity post.'),
      Q('Ordering chat messages within a conversation uses…', ['Wall-clock time only', 'Per-conversation sequence numbers', 'Random ids', 'DNS'], 1, 'Clocks drift; sequences don’t.'),
    ],
    practice: 'Each crew member presents one classic design 1-pager on the next call; the others interview.',
    explain: 'Explain why a ride-hailing app shards by city.',
  },

  'sd-data': {
    intro: 'System design rounds for data engineers: batch platforms, real-time metrics and lakehouses.',
    concepts: [
      C('Design a batch analytics platform', `Requirements first (sources, volume, freshness, users). Typical answer:`,
        { arch: [['Sources', ['App DBs (CDC / extracts)', 'SaaS APIs', 'Files']], ['Ingest', ['Airbyte/dlt', 'Airflow']], ['Storage', ['Object storage lake (bronze)', 'Warehouse (silver/gold)']], ['Transform', ['dbt', 'Spark for heavy jobs']], ['Serve', ['BI', 'Reverse ETL', 'ML features']], ['Cross-cutting', ['Quality checks', 'Catalog & lineage', 'Access control', 'Cost monitoring']]] }),
      C('Design a real-time metrics pipeline', `Events → Kafka (partitioned by entity) → stream processor (windows, watermarks, dedupe) → real-time store (ClickHouse/Druid/Pinot) → dashboards and alerts; plus a sink to the lake for history and reprocessing. Discuss late data, exactly-once vs at-least-once + idempotent sinks, and back-pressure.`),
      C('Design a data lakehouse', `Open table format (Iceberg/Delta) on object storage, a catalog (Glue/Unity/Polaris), engines (Spark, Trino, warehouse) reading the same tables, medallion layers, compaction and retention jobs, governance (row/column security), and time travel for audits.`),
      C('Lambda vs Kappa architecture', `**Lambda**: batch + speed layers merged at serving (accurate, duplicated logic). **Kappa**: one streaming path; reprocess by replaying the log (simpler code, needs long retention or lakehouse). Modern answer: mostly Kappa with a lakehouse for history and backfills.`,
        pick('A team wants one codebase for real-time and historical metrics. Prefer…', ['Lambda', false], ['Kappa (replayable stream + lakehouse)', true, 'Same logic for live and reprocessing.'], ['Only nightly batch', false])),
      D('Deep dive: questions that show seniority in data design rounds', `How are late and duplicate events handled? How do we backfill without double counting? What happens when a schema changes upstream? Who owns data quality and how are consumers alerted? What does it cost per month and what would we cut first?`),
    ],
    quiz: [
      Q('Real-time store for sub-second aggregations over billions of events?', ['Postgres', 'ClickHouse / Druid / Pinot', 'S3 only', 'Redis lists'], 1, 'Real-time OLAP engines.'),
      Q('Lambda architecture’s main drawback?', ['Too fast', 'Two codebases for the same logic', 'No batch', 'No storage'], 1, 'Duplicated logic drifts.'),
    ],
    practice: 'Design (on your board) the data platform behind Study Together v2 and present it on a call.',
    explain: 'Explain Lambda vs Kappa with two cooks making the same dish vs one cook who can re-cook from the recipe log.',
  },

  'sd-ai': {
    intro: 'AI system design rounds are now common: RAG, recommendations, model serving and the economics of LLM apps.',
    concepts: [
      C('Design a RAG system', `Ingestion pipeline (parse, chunk, embed, index, freshness) → query path (rewrite, hybrid retrieve, rerank, assemble with citations, generate, guardrails) → evals and tracing → access control (filter by user permissions at retrieval time).`,
        { arch: [['Ingestion (async)', ['Connectors', 'Parse & chunk', 'Embed (batch)', 'Vector + keyword index']], ['Query path', ['Rewrite', 'Hybrid retrieve + ACL filter', 'Rerank', 'Generate with citations']], ['Ops', ['Evals', 'Tracing', 'Cost dashboard', 'Feedback loop']]] }),
      C('Design a recommendation pipeline', `Two stages: **candidate generation** (fast, recall: collaborative filtering, embeddings/ANN, popular items) → **ranking** (precise model on rich features) → business rules (diversity, freshness) → logging impressions/clicks for training. Offline batch features + online real-time features from a feature store.`),
      C('Serving models at scale', `Batch scoring vs online endpoints; GPU batching (dynamic batching in vLLM/Triton); autoscaling on queue depth; model registry and canary rollouts; caching frequent predictions; quantisation and smaller models to cut cost.`),
      C('Cost & latency trade-offs for LLM apps', `Levers: smaller model for easy requests (routing), prompt caching, shorter contexts (better retrieval, summarised history), streaming for perceived latency, batch APIs for offline jobs, response caching, max_tokens limits — always checked against evals.`,
        { table: { cols: ['Lever', 'Cost', 'Latency', 'Quality risk'], rows: [['Smaller model', '↓↓', '↓', 'Medium — check evals'], ['Prompt caching', '↓', '↓', 'None'], ['Better retrieval (fewer chunks)', '↓', '↓', 'Can improve'], ['Response cache', '↓↓', '↓↓', 'Staleness'], ['Model routing by difficulty', '↓↓', '↓', 'Low with a good router']] } },
        pick('80% of support questions are simple FAQs. Biggest cost saving?', ['Use the largest model for everything', false], ['Route simple questions to a small model or cached answers', true, 'Spend big-model tokens only where needed.'], ['Remove evals', false])),
      D('Deep dive: permission-aware retrieval', `In company RAG, users must only see documents they can access. Store ACL metadata with each chunk and filter at retrieval time (never after generation); re-sync permissions when they change; test that a user without access gets "I don't know", not a leaked answer.`),
    ],
    quiz: [
      Q('Recommendation systems usually have which two stages?', ['Train and test', 'Candidate generation and ranking', 'ETL and BI', 'Cache and DB'], 1, 'Recall first, precision second.'),
      Q('Document permissions in RAG should be enforced…', ['After generating the answer', 'At retrieval time via metadata filters', 'Not at all', 'In the prompt only'], 1, 'Never let restricted text reach the model.'),
    ],
    practice: 'Write a 1-page design for "AI tutor for 1M students" with costs per month at two model sizes.',
    explain: 'Explain candidate generation vs ranking with shortlisting then interviewing job applicants.',
  },
}
