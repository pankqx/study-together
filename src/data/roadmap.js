// ─────────────────────────────────────────────────────────────
//  STUDY TOGETHER · master roadmap
//  Edit freely. Progress is saved per concept, keyed by
//  node id + concept text — renaming a concept resets only that tick.
//  Levels: "basic" → "core" → "advanced" → "pro"
// ─────────────────────────────────────────────────────────────

const R = (t, u) => ({ t, u })
const n = (id, title, level, concepts, resources, doneWhen) => ({ id, title, level, concepts, resources, doneWhen })

export const TRACKS = [
  // ───────────────────────── DSA (separate, daily 2 hrs) ─────────────────────────
  {
    id: 'dsa', title: 'DSA in Python', short: 'DSA', glyph: '⌗',
    blurb: 'Separate daily habit — practise on ProntoPy, tick here when a pattern clicks.',
    nodes: [
      n('dsa-py', 'Python for problem solving', 'basic',
        ['Lists, tuples, dicts, sets — and their costs', 'Slicing, comprehensions, enumerate, zip', 'collections: deque, Counter, defaultdict', 'heapq and bisect', 'Reading input fast, writing clean functions'],
        [R('ProntoPy', 'prontopy'), R('Python docs: data structures', 'https://docs.python.org/3/tutorial/datastructures.html')],
        'You can solve an easy problem without looking up syntax.'),
      n('dsa-bigo', 'Complexity analysis', 'basic',
        ['Big-O, Big-Θ, Big-Ω', 'Time vs space trade-offs', 'Amortised analysis', 'Complexity of recursion (recurrence trees)'],
        [R('ProntoPy', 'prontopy'), R('NeetCode roadmap', 'https://neetcode.io/roadmap')],
        'You can state the complexity of any solution you write, before running it.'),
      n('dsa-arrays', 'Arrays & strings', 'basic',
        ['Prefix sums', 'In-place manipulation', 'String building & parsing', 'Matrix traversal'],
        [R('ProntoPy', 'prontopy')], 'Ten array/string problems solved.'),
      n('dsa-hash', 'Hashing', 'basic',
        ['Hash maps for counting', 'Hash sets for lookup', 'Grouping by key (anagrams)', 'Collisions — how hashing actually works'],
        [R('ProntoPy', 'prontopy')], 'Two-sum style problems feel automatic.'),
      n('dsa-two', 'Two pointers & sliding window', 'core',
        ['Opposite-end pointers', 'Fast/slow pointers', 'Fixed-size window', 'Variable-size window with a map'],
        [R('ProntoPy', 'prontopy')], 'You can spot a window problem from its wording.'),
      n('dsa-stack', 'Stacks & queues', 'core',
        ['Stack for matching/parsing', 'Monotonic stack', 'Queue & deque', 'Monotonic queue'],
        [R('ProntoPy', 'prontopy')], 'Next-greater-element and valid-parentheses without hints.'),
      n('dsa-ll', 'Linked lists', 'core',
        ['Reverse a list (iterative + recursive)', 'Dummy head technique', 'Cycle detection', 'Merge two sorted lists'],
        [R('ProntoPy', 'prontopy')], 'You can draw pointer changes on paper before coding.'),
      n('dsa-bs', 'Binary search', 'core',
        ['Classic search on sorted array', 'Lower/upper bound', 'Search on answer space', 'Rotated arrays'],
        [R('ProntoPy', 'prontopy')], 'No more off-by-one panic.'),
      n('dsa-rec', 'Recursion & backtracking', 'core',
        ['Base case thinking', 'Subsets & permutations', 'Combination sum', 'Pruning'],
        [R('ProntoPy', 'prontopy')], 'You can write N-Queens from scratch.'),
      n('dsa-sort', 'Sorting', 'core',
        ['Merge sort', 'Quick sort & partitioning', 'Counting/bucket sort', 'Custom sort keys'],
        [R('ProntoPy', 'prontopy')], 'You can implement merge and quick sort from memory.'),
      n('dsa-tree', 'Trees & BSTs', 'core',
        ['DFS traversals (pre/in/post)', 'BFS level order', 'BST insert/search/validate', 'Lowest common ancestor', 'Tree DP (diameter, max path)'],
        [R('ProntoPy', 'prontopy')], 'Fifteen tree problems solved.'),
      n('dsa-heap', 'Heaps & priority queues', 'core',
        ['Top-K problems', 'Merge K sorted', 'Two-heap median', 'Scheduling with heaps'],
        [R('ProntoPy', 'prontopy')], 'You reach for heapq without thinking.'),
      n('dsa-graph', 'Graphs', 'advanced',
        ['Adjacency list representation', 'BFS / DFS on grids & graphs', 'Topological sort', 'Dijkstra', 'Union-Find (DSU)', 'Minimum spanning tree'],
        [R('ProntoPy', 'prontopy')], 'Course-schedule and number-of-islands variants are easy.'),
      n('dsa-dp', 'Dynamic programming', 'advanced',
        ['Memoisation → tabulation', '1-D DP (climbing, house robber)', '2-D DP (grids, LCS, edit distance)', 'Knapsack family', 'DP on intervals & subsequences'],
        [R('ProntoPy', 'prontopy')], 'You can define state + transition before writing code.'),
      n('dsa-greedy', 'Greedy & intervals', 'advanced',
        ['Exchange argument', 'Interval merging & scheduling', 'Jump game family'],
        [R('ProntoPy', 'prontopy')], 'You can justify why greedy works for a problem.'),
      n('dsa-adv', 'Tries, bits & advanced', 'pro',
        ['Trie insert/search/prefix', 'Bit manipulation tricks', 'Segment tree / Fenwick (intro)', 'String matching (KMP idea)'],
        [R('ProntoPy', 'prontopy')], 'You can explain each with a diagram.'),
      n('dsa-mock', 'Mock interviews', 'pro',
        ['Timed 45-min sessions', 'Think aloud while coding', 'Swap interviewer/candidate with friends', 'Review & redo failed problems'],
        [R('NeetCode 150', 'https://neetcode.io/practice')], 'Weekly mock with a teammate, every week until the end.'),
    ],
  },

  // ───────────────────────── FRONT END ─────────────────────────
  {
    id: 'fe', title: 'Front end', short: 'FE', glyph: '◐',
    blurb: 'From how a browser paints a pixel to production-grade React and Next.js.',
    nodes: [
      n('fe-web', 'How the web works', 'basic',
        ['HTTP request/response, methods, status codes', 'DNS, domains, hosting', 'How browsers render (DOM, CSSOM, paint)', 'Cookies, storage, CORS'],
        [R('MDN Learn', 'https://developer.mozilla.org/en-US/docs/Learn'), R('roadmap.sh frontend', 'https://roadmap.sh/frontend')],
        'You can explain what happens when you type a URL.'),
      n('fe-html', 'HTML & accessibility', 'basic',
        ['Semantic elements', 'Forms & inputs', 'ARIA basics, labels, focus order', 'SEO & meta tags'],
        [R('web.dev Learn HTML', 'https://web.dev/learn/html'), R('web.dev Accessibility', 'https://web.dev/learn/accessibility')],
        'A page you built passes a Lighthouse accessibility audit.'),
      n('fe-css', 'CSS layout & responsive design', 'basic',
        ['Box model, specificity, cascade', 'Flexbox', 'Grid', 'Media & container queries', 'Custom properties, animations'],
        [R('web.dev Learn CSS', 'https://web.dev/learn/css'), R('Flexbox Froggy', 'https://flexboxfroggy.com/'), R('Grid Garden', 'https://cssgridgarden.com/')],
        'You can rebuild any landing page layout from a screenshot.'),
      n('fe-js', 'Modern JavaScript', 'basic',
        ['Scope, closures, this', 'Promises, async/await, event loop', 'Modules, destructuring, spread', 'DOM APIs & events', 'Fetch & error handling'],
        [R('javascript.info', 'https://javascript.info/')], 'You can explain the event loop with a diagram.'),
      n('fe-ts', 'TypeScript', 'core',
        ['Types, interfaces, unions', 'Generics', 'Narrowing & type guards', 'Utility types', 'tsconfig & strict mode'],
        [R('TS Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'), R('Type Challenges', 'https://github.com/type-challenges/type-challenges')],
        'A whole project of yours runs in strict mode.'),
      n('fe-react', 'React fundamentals', 'core',
        ['Components, props, state', 'Thinking in React', 'Effects and their pitfalls', 'Lists, keys, forms', 'Context'],
        [R('react.dev Learn', 'https://react.dev/learn'), R('Full Stack Open', 'https://fullstackopen.com/en/')],
        'You built a multi-page React app with no tutorial open.'),
      n('fe-react2', 'Advanced React', 'advanced',
        ['Custom hooks', 'State management (Zustand / Redux Toolkit)', 'Server state with TanStack Query', 'Memoisation & rendering performance', 'Suspense & error boundaries'],
        [R('react.dev Reference', 'https://react.dev/reference/react'), R('TanStack Query', 'https://tanstack.com/query/latest/docs')],
        'You can profile and fix a slow render.'),
      n('fe-next', 'Next.js', 'advanced',
        ['App Router & layouts', 'Server vs client components', 'SSR, SSG, ISR', 'Route handlers & server actions', 'Deploying to Vercel'],
        [R('Next.js Learn', 'https://nextjs.org/learn')], 'You shipped a Next.js app with server components.'),
      n('fe-ui', 'Styling systems & design', 'core',
        ['Tailwind CSS', 'Component libraries (shadcn/ui)', 'Design tokens', 'Basic UI/UX principles'],
        [R('Tailwind docs', 'https://tailwindcss.com/docs'), R('Refactoring UI tips', 'https://www.refactoringui.com/')],
        'Your apps stop looking like tutorials.'),
      n('fe-test', 'Front-end testing', 'advanced',
        ['Unit tests with Vitest', 'React Testing Library', 'End-to-end with Playwright', 'Mocking network calls'],
        [R('Vitest', 'https://vitest.dev/guide/'), R('Playwright', 'https://playwright.dev/docs/intro')],
        'CI fails when your UI breaks.'),
      n('fe-perf', 'Performance & web vitals', 'pro',
        ['LCP, INP, CLS', 'Code splitting & lazy loading', 'Image optimisation', 'Caching & service workers / PWA'],
        [R('web.dev Performance', 'https://web.dev/learn/performance')], 'A real app of yours scores 90+ on mobile Lighthouse.'),
    ],
  },

  // ───────────────────────── BACK END ─────────────────────────
  {
    id: 'be', title: 'Back end', short: 'BE', glyph: '◑',
    blurb: 'APIs, auth, queues and Python services — the half that data and AI work actually lives on.',
    nodes: [
      n('be-node', 'Node.js runtime', 'basic',
        ['Event loop & libuv', 'Modules & npm', 'Streams & buffers', 'Environment & config'],
        [R('Node.js Learn', 'https://nodejs.org/en/learn')], 'You can explain why Node handles many connections.'),
      n('be-rest', 'REST API design', 'basic',
        ['Resources, verbs, status codes', 'Express / Fastify', 'Validation (Zod)', 'Pagination, filtering, versioning', 'Error handling middleware'],
        [R('Full Stack Open part 3', 'https://fullstackopen.com/en/part3'), R('roadmap.sh API design', 'https://roadmap.sh/api-design')],
        'You built a CRUD API with validation and proper errors.'),
      n('be-auth', 'Authentication & authorisation', 'core',
        ['Sessions vs JWT', 'Password hashing (bcrypt/argon2)', 'OAuth 2.0 & OpenID Connect', 'Role-based access control', 'Refresh tokens & logout'],
        [R('OWASP cheat sheets', 'https://cheatsheetseries.owasp.org/')], 'You added Google login to your own API, end to end.'),
      n('be-orm', 'ORMs & data access', 'core',
        ['Prisma or Drizzle', 'Migrations', 'N+1 queries', 'Connection pooling'],
        [R('Prisma docs', 'https://www.prisma.io/docs')], 'You can read the SQL your ORM generates.'),
      n('be-py', 'Python back end with FastAPI', 'core',
        ['Pydantic models', 'Dependency injection', 'Async endpoints', 'SQLAlchemy', 'OpenAPI docs'],
        [R('FastAPI tutorial', 'https://fastapi.tiangolo.com/tutorial/')], 'You built the same API in FastAPI. (You will use Python for data & AI.)'),
      n('be-cache', 'Caching with Redis', 'core',
        ['Cache-aside pattern', 'TTL & eviction', 'Redis data types', 'Pub/sub'],
        [R('Redis learn', 'https://redis.io/learn')], 'You cut an endpoint\'s latency with a cache and measured it.'),
      n('be-jobs', 'Queues & background jobs', 'advanced',
        ['Why async work', 'BullMQ / Celery', 'Retries, dead-letter queues', 'Scheduled jobs (cron)'],
        [R('BullMQ docs', 'https://docs.bullmq.io/'), R('Celery docs', 'https://docs.celeryq.dev/')],
        'Emails/reports in your app run in a worker, not the request.'),
      n('be-rt', 'Realtime & files', 'advanced',
        ['WebSockets', 'Server-sent events', 'File uploads to object storage', 'Signed URLs'],
        [R('MDN WebSockets', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API')], 'You built a tiny realtime chat.'),
      n('be-gql', 'GraphQL & gRPC (overview)', 'advanced',
        ['GraphQL schema, queries, resolvers', 'When to use GraphQL vs REST', 'gRPC & protobuf idea'],
        [R('GraphQL Learn', 'https://graphql.org/learn/')], 'You can argue REST vs GraphQL vs gRPC for a use case.'),
      n('be-sec', 'API security', 'pro',
        ['OWASP Top 10', 'Injection, XSS, CSRF', 'Rate limiting', 'Secrets management', 'Security headers'],
        [R('OWASP Top 10', 'https://owasp.org/www-project-top-ten/')], 'You audited one of your own APIs against the Top 10.'),
      n('be-test', 'Back-end testing', 'pro',
        ['Unit vs integration tests', 'Testing with a real DB (containers)', 'pytest & Jest', 'Contract tests'],
        [R('pytest docs', 'https://docs.pytest.org/')], 'Your API has tests that run in CI.'),
    ],
  },

  // ───────────────────────── DBMS (separate) ─────────────────────────
  {
    id: 'db', title: 'DBMS', short: 'DB', glyph: '▤',
    blurb: 'Databases from the inside. This is the single most important foundation for data engineering.',
    nodes: [
      n('db-model', 'Data models & ER design', 'basic',
        ['Entities, attributes, relationships', 'ER diagrams', 'Relational model & keys', 'Relational algebra'],
        [R('CMU 15-445 Intro to DB Systems', 'https://15445.courses.cs.cmu.edu/'), R('dbdiagram.io', 'https://dbdiagram.io/')],
        'You can turn a messy requirement into an ER diagram.'),
      n('db-sql', 'SQL fundamentals', 'basic',
        ['SELECT, WHERE, ORDER BY', 'JOINs — inner, left, full, self, cross', 'GROUP BY, HAVING, aggregates', 'INSERT/UPDATE/DELETE, constraints'],
        [R('SQLBolt', 'https://sqlbolt.com/'), R('PostgreSQL Exercises', 'https://pgexercises.com/')], 'All of SQLBolt done.'),
      n('db-sql2', 'Advanced SQL', 'core',
        ['Subqueries & CTEs', 'Recursive CTEs', 'Window functions (ROW_NUMBER, LAG, running totals)', 'CASE, COALESCE, date functions', 'Views & materialised views'],
        [R('ThoughtSpot SQL tutorial (ex-Mode)', 'https://www.thoughtspot.com/sql-tutorial'), R('DataLemur SQL', 'https://datalemur.com/sql-tutorial')],
        'You can solve DataLemur medium problems.'),
      n('db-norm', 'Normalisation', 'core',
        ['Functional dependencies', '1NF, 2NF, 3NF, BCNF', 'When to denormalise'], [R('CMU 15-445', 'https://15445.courses.cs.cmu.edu/')],
        'You can normalise a table and explain each step.'),
      n('db-txn', 'Transactions & concurrency', 'core',
        ['ACID', 'Isolation levels & anomalies', 'Locking, 2PL', 'MVCC (how Postgres does it)', 'Deadlocks'],
        [R('CMU 15-445 lectures (YouTube)', 'https://www.youtube.com/@CMUDatabaseGroup')], 'You can show a lost-update bug and fix it.'),
      n('db-idx', 'Indexing & query optimisation', 'advanced',
        ['B-tree & hash indexes', 'Composite & covering indexes', 'EXPLAIN ANALYZE', 'Join algorithms', 'Statistics & the planner'],
        [R('Use The Index, Luke', 'https://use-the-index-luke.com/')], 'You made a slow query 10× faster with an index.'),
      n('db-storage', 'Storage, logging & recovery', 'advanced',
        ['Pages, heap files, buffer pool', 'Row vs column storage', 'Write-ahead log', 'Checkpoints & crash recovery'],
        [R('CMU 15-445', 'https://15445.courses.cs.cmu.edu/')], 'You can explain why WAL makes databases durable.'),
      n('db-pg', 'PostgreSQL in practice', 'core',
        ['psql & tooling', 'JSONB', 'Partitioned tables', 'Roles & permissions', 'Backups & replication basics'],
        [R('Postgres tutorial', 'https://www.postgresql.org/docs/current/tutorial.html')], 'You run Postgres in Docker for every project.'),
      n('db-nosql', 'NoSQL families', 'advanced',
        ['Document (MongoDB)', 'Key-value (Redis, DynamoDB)', 'Wide-column (Cassandra)', 'Graph (Neo4j)', 'Choosing the right store'],
        [R('MongoDB University', 'https://learn.mongodb.com/')], 'You can pick a database for a problem and defend it.'),
      n('db-dist', 'Distributed databases', 'pro',
        ['Replication (leader/follower, multi-leader)', 'Partitioning & sharding', 'CAP & PACELC', 'Consensus (Raft idea)'],
        [R('Raft visualisation', 'https://thesecretlivesofdata.com/raft/')], 'You can explain what happens when a replica lags.'),
      n('db-olap', 'OLTP vs OLAP', 'pro',
        ['Analytical workloads', 'Columnar engines (DuckDB, ClickHouse)', 'Compression & vectorised execution'],
        [R('DuckDB docs', 'https://duckdb.org/docs/')], 'You queried a 1 GB Parquet file with DuckDB in seconds.'),
    ],
  },

  // ───────────────────────── SYSTEM DESIGN ─────────────────────────
  {
    id: 'sd', title: 'System design', short: 'SD', glyph: '⬡',
    blurb: 'From scaling basics to designing data and AI systems. Draw every design on the team board.',
    nodes: [
      n('sd-basics', 'Foundations', 'basic',
        ['Latency vs throughput', 'Availability & SLAs (the nines)', 'Back-of-the-envelope estimates', 'Vertical vs horizontal scaling'],
        [R('System Design Primer', 'https://github.com/donnemartin/system-design-primer'), R('ByteByteGo (YouTube)', 'https://www.youtube.com/@ByteByteGo')],
        'You can estimate QPS and storage for a simple app.'),
      n('sd-net', 'Networking for design', 'basic',
        ['TCP vs UDP', 'HTTP/1.1, 2, 3', 'DNS & CDNs', 'Load balancers (L4 vs L7)', 'Reverse proxies'],
        [R('System Design Primer', 'https://github.com/donnemartin/system-design-primer')], 'You can draw a request through CDN → LB → app → DB.'),
      n('sd-cache', 'Caching & data scaling', 'core',
        ['Cache strategies & invalidation', 'Read replicas', 'Sharding & consistent hashing', 'Consistency models'],
        [R('Hello Interview: core concepts', 'https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts')], 'You can design for 10× traffic.'),
      n('sd-async', 'Async & event-driven', 'core',
        ['Message queues vs streams', 'Pub/sub', 'Idempotency', 'Outbox pattern & sagas', 'Back-pressure'],
        [R('Hello Interview', 'https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction')], 'You can explain at-least-once vs exactly-once.'),
      n('sd-arch', 'Architecture styles', 'advanced',
        ['Monolith vs microservices', 'API gateway', 'Service discovery', 'Rate limiting algorithms', 'Observability (logs, metrics, traces)'],
        [R('microservices.io patterns', 'https://microservices.io/patterns/')], 'You know when NOT to use microservices.'),
      n('sd-classic', 'Classic designs', 'advanced',
        ['URL shortener', 'Chat app (like this one!)', 'News feed', 'Ride hailing', 'Rate limiter'],
        [R('Hello Interview problem breakdowns', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview')],
        'Each design drawn on the team board and reviewed by a friend.'),
      n('sd-data', 'Data system design', 'pro',
        ['Design a batch analytics platform', 'Design a real-time metrics pipeline', 'Design a data lakehouse', 'Lambda vs Kappa architecture'],
        [R('Start Data Engineering', 'https://www.startdataengineering.com/')], 'You can whiteboard a data platform in 30 minutes.'),
      n('sd-ai', 'AI system design', 'pro',
        ['Design a RAG system', 'Design a recommendation pipeline', 'Serving models at scale', 'Cost & latency trade-offs for LLM apps'],
        [R('Chip Huyen blog', 'https://huyenchip.com/blog/')], 'You can design an LLM product with evals and caching.'),
    ],
  },

  // ───────────────────────── DEVOPS ─────────────────────────
  {
    id: 'ops', title: 'DevOps', short: 'OPS', glyph: '∞',
    blurb: 'Ship it, run it, watch it. Linux to Kubernetes.',
    nodes: [
      n('ops-linux', 'Linux essentials', 'basic',
        ['Filesystem & permissions', 'Processes, signals, systemd', 'Package managers', 'Logs & journalctl', 'SSH & keys'],
        [R('Linux Journey', 'https://linuxjourney.com/'), R('OverTheWire Bandit', 'https://overthewire.org/wargames/bandit/')], 'Bandit level 15 cleared.'),
      n('ops-shell', 'Shell scripting', 'basic',
        ['Bash variables, loops, conditionals', 'Pipes, grep, sed, awk', 'cron', 'Writing safe scripts (set -euo pipefail)'],
        [R('Shell scripting tutorial', 'https://www.shellscript.sh/')], 'You automated something boring with a script.'),
      n('ops-git', 'Git like a pro', 'basic',
        ['Branching & merging', 'Rebase & interactive history', 'Pull requests & reviews', 'Git flow vs trunk-based'],
        [R('Learn Git Branching', 'https://learngitbranching.js.org/')], 'You can recover from any git mess.'),
      n('ops-net', 'Networking & web servers', 'core',
        ['Ports, firewalls', 'Nginx reverse proxy', 'TLS & certificates (Let\'s Encrypt)', 'Debugging with curl, dig, ss'],
        [R('Nginx beginner guide', 'https://nginx.org/en/docs/beginners_guide.html')], 'You served an app over HTTPS on a VM.'),
      n('ops-docker', 'Docker', 'core',
        ['Images, layers, containers', 'Dockerfile best practices', 'Multi-stage builds', 'Volumes & networks', 'Docker Compose'],
        [R('Docker get started', 'https://docs.docker.com/get-started/')], 'Every project of yours runs with docker compose up.'),
      n('ops-ci', 'CI/CD', 'core',
        ['GitHub Actions workflows', 'Build, test, lint pipelines', 'Deploy on merge', 'Environments & secrets'],
        [R('GitHub Actions docs', 'https://docs.github.com/en/actions')], 'Pushing to main deploys your app.'),
      n('ops-iac', 'Infrastructure as code', 'advanced',
        ['Terraform basics', 'State & backends', 'Modules', 'Plan/apply in CI'],
        [R('Terraform tutorials', 'https://developer.hashicorp.com/terraform/tutorials')], 'You can destroy and recreate your infra with one command.'),
      n('ops-k8s', 'Kubernetes', 'advanced',
        ['Pods, deployments, services', 'ConfigMaps & secrets', 'Ingress', 'Helm charts', 'Local clusters (kind / minikube)'],
        [R('Kubernetes tutorials', 'https://kubernetes.io/docs/tutorials/'), R('90DaysOfDevOps', 'https://github.com/MichaelCade/90DaysOfDevOps')],
        'You deployed an app to a local cluster.'),
      n('ops-obs', 'Monitoring & logging', 'pro',
        ['Prometheus metrics', 'Grafana dashboards', 'Centralised logs (Loki)', 'Alerting & on-call basics'],
        [R('Prometheus overview', 'https://prometheus.io/docs/introduction/overview/')], 'You get an alert when your app is down.'),
      n('ops-gitops', 'GitOps & DevSecOps', 'pro',
        ['Argo CD', 'Image scanning (Trivy)', 'Secrets (Vault / SOPS)', 'Policy as code'],
        [R('Argo CD docs', 'https://argo-cd.readthedocs.io/')], 'Your cluster state lives in git.'),
    ],
  },

  // ───────────────────────── CLOUD ─────────────────────────
  {
    id: 'cloud', title: 'Cloud computing', short: 'CLD', glyph: '☁',
    blurb: 'Cloud from zero: AWS as the main cloud (most free material), then Azure & GCP equivalents.',
    nodes: [
      n('cld-concepts', 'Cloud concepts', 'basic',
        ['IaaS, PaaS, SaaS', 'Regions & availability zones', 'Shared responsibility', 'Pricing models & free tier traps'],
        [R('AWS Skill Builder (free)', 'https://skillbuilder.aws/'), R('AWS Educate', 'https://aws.amazon.com/education/awseducate/')],
        'Billing alerts set before you touch anything else.'),
      n('cld-iam', 'Identity & security', 'basic',
        ['IAM users, roles, policies', 'Least privilege', 'MFA & root account hygiene', 'KMS encryption basics'],
        [R('AWS IAM docs', 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html')], 'You never use root keys again.'),
      n('cld-compute', 'Compute', 'core',
        ['EC2 & instance types', 'Auto Scaling & load balancers', 'Lambda (serverless)', 'Containers: ECS, Fargate, EKS'],
        [R('AWS Skill Builder', 'https://skillbuilder.aws/')], 'You deployed the same app on EC2 and on Lambda.'),
      n('cld-storage', 'Storage', 'core',
        ['S3 buckets, classes, lifecycle', 'EBS & EFS', 'Data lake layout on S3'],
        [R('S3 user guide', 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html')], 'You host a static site and a data lake on S3.'),
      n('cld-net', 'Networking', 'core',
        ['VPC, subnets, route tables', 'Security groups vs NACLs', 'NAT & internet gateways', 'Route 53 & CloudFront'],
        [R('AWS VPC docs', 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html')], 'You built a public/private subnet VPC with Terraform.'),
      n('cld-db', 'Managed databases', 'core',
        ['RDS / Aurora', 'DynamoDB', 'ElastiCache'], [R('AWS Skill Builder', 'https://skillbuilder.aws/')], 'Your app runs on RDS, not a laptop DB.'),
      n('cld-serverless', 'Serverless & messaging', 'advanced',
        ['API Gateway + Lambda', 'SQS, SNS, EventBridge', 'Step Functions'], [R('Serverless Land', 'https://serverlessland.com/')], 'You built an event-driven pipeline with no servers.'),
      n('cld-data', 'Cloud data services', 'advanced',
        ['Glue & Glue Data Catalog', 'Athena', 'Redshift', 'Kinesis', 'EMR'],
        [R('AWS analytics docs', 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/analytics.html')], 'You queried S3 data with Athena.'),
      n('cld-ops', 'Operate & optimise', 'pro',
        ['CloudWatch metrics & logs', 'Well-Architected Framework', 'Cost optimisation (FinOps)', 'Backup & disaster recovery'],
        [R('Well-Architected', 'https://aws.amazon.com/architecture/well-architected/')], 'You can read a bill and cut it.'),
      n('cld-multi', 'Azure & GCP equivalents', 'pro',
        ['Azure: ADLS, Data Factory, Synapse, Fabric, Databricks', 'GCP: BigQuery, Dataflow, Pub/Sub, Composer', 'Service mapping table'],
        [R('Microsoft Learn', 'https://learn.microsoft.com/en-us/training/'), R('Google Cloud training', 'https://cloud.google.com/learn/training')],
        'You can translate any AWS design to Azure.'),
      n('cld-cert', 'Certifications', 'pro',
        ['AWS Cloud Practitioner', 'AWS Data Engineer – Associate', 'Optional: Azure DP-900 / DP-700'],
        [R('AWS certifications', 'https://aws.amazon.com/certification/')], 'At least one certificate on your resume.'),
    ],
  },

  // ───────────────────────── DATA ENGINEERING ─────────────────────────
  {
    id: 'de', title: 'Data engineering', short: 'DE', glyph: '⇶',
    blurb: 'Pipelines, warehouses, lakehouses and streaming — from your first CSV to production data platforms.',
    nodes: [
      n('de-found', 'Data engineering foundations', 'basic',
        ['Data engineering lifecycle', 'Roles: DE vs analyst vs scientist vs ML engineer', 'Batch vs streaming', 'Modern data stack overview'],
        [R('DE Zoomcamp', 'https://github.com/DataTalksClub/data-engineering-zoomcamp'), R('roadmap.sh data engineer', 'https://roadmap.sh/data-engineer')],
        'You can draw the modern data stack from memory.'),
      n('de-py', 'Python for data', 'basic',
        ['pandas: load, clean, reshape, join', 'Polars', 'File formats: CSV, JSON, Parquet, Avro', 'Working with APIs & pagination', 'Logging & config in scripts'],
        [R('pandas getting started', 'https://pandas.pydata.org/docs/getting_started/'), R('Polars guide', 'https://docs.pola.rs/')],
        'You turned a messy CSV into clean Parquet.'),
      n('de-model', 'Data modeling for analytics', 'core',
        ['Kimball: facts & dimensions', 'Star vs snowflake schema', 'Slowly changing dimensions (types 1, 2)', 'One-big-table & wide tables', 'Data vault (intro)'],
        [R('Kimball techniques', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/')],
        'You designed a star schema for a real dataset.'),
      n('de-dwh', 'Data warehouses', 'core',
        ['Columnar storage', 'BigQuery / Snowflake / Redshift', 'Partitioning & clustering', 'Cost-aware querying'],
        [R('DE Zoomcamp module 3', 'https://github.com/DataTalksClub/data-engineering-zoomcamp')], 'You loaded and queried data in a cloud warehouse.'),
      n('de-ingest', 'Ingestion & ETL / ELT', 'core',
        ['ETL vs ELT', 'Full vs incremental loads', 'Idempotent pipelines', 'dlt for API ingestion', 'Airbyte (overview)'],
        [R('dlt docs', 'https://dlthub.com/docs'), R('Start Data Engineering', 'https://www.startdataengineering.com/')],
        'Your pipeline can re-run safely without duplicates.'),
      n('de-orch', 'Orchestration', 'core',
        ['Airflow: DAGs, operators, sensors', 'Scheduling, retries, backfills', 'Kestra / Dagster alternatives', 'Running Airflow in Docker'],
        [R('Astronomer Academy', 'https://academy.astronomer.io/'), R('Kestra docs', 'https://kestra.io/docs')],
        'A daily pipeline runs by itself and alerts on failure.'),
      n('de-dbt', 'Transformations with dbt', 'core',
        ['Models, sources, refs', 'Tests & documentation', 'Incremental models', 'Macros & Jinja', 'Staging → marts layering'],
        [R('dbt Learn', 'https://learn.getdbt.com/')], 'You built a dbt project with tests and docs.'),
      n('de-quality', 'Data quality & testing', 'advanced',
        ['Data contracts', 'Great Expectations / Soda', 'Freshness & volume checks', 'Unit tests for transforms'],
        [R('Great Expectations docs', 'https://docs.greatexpectations.io/')], 'Bad data fails the pipeline loudly.'),
      n('de-spark', 'Apache Spark', 'advanced',
        ['Spark architecture: driver, executors', 'DataFrames & Spark SQL', 'Lazy evaluation, DAGs', 'Partitions & shuffles', 'Joins, skew, broadcast, caching'],
        [R('Spark docs', 'https://spark.apache.org/docs/latest/'), R('Databricks Academy', 'https://www.databricks.com/learn/training')],
        'You processed a multi-GB dataset with PySpark and tuned it.'),
      n('de-lake', 'Lakehouse', 'advanced',
        ['Data lake vs warehouse vs lakehouse', 'Delta Lake & Apache Iceberg', 'Medallion architecture (bronze/silver/gold)', 'Time travel & schema evolution', 'Databricks Free Edition'],
        [R('Delta Lake', 'https://delta.io/'), R('Apache Iceberg', 'https://iceberg.apache.org/'), R('Databricks Free Edition', 'https://www.databricks.com/learn/free-edition')], 'You built bronze → silver → gold tables.'),
      n('de-stream', 'Streaming fundamentals', 'advanced',
        ['Events, event time vs processing time', 'Windows & watermarks', 'Delivery guarantees', 'Stateful processing'],
        [R('Confluent courses', 'https://developer.confluent.io/courses/')], 'You can explain watermarks to a friend.'),
      n('de-kafka', 'Kafka', 'advanced',
        ['Topics, partitions, offsets', 'Producers & consumer groups', 'Schema Registry & Avro', 'Kafka Connect'],
        [R('Kafka 101', 'https://developer.confluent.io/courses/apache-kafka/events/')], 'You produce and consume events from Python.'),
      n('de-sproc', 'Stream processing & CDC', 'pro',
        ['Spark Structured Streaming', 'Flink (intro)', 'Change data capture with Debezium', 'Streaming into a lakehouse'],
        [R('Debezium docs', 'https://debezium.io/documentation/'), R('Apache Flink', 'https://flink.apache.org/')],
        'Database changes appear in your lake within seconds.'),
      n('de-gov', 'Governance & DataOps', 'pro',
        ['Catalogs & lineage (OpenLineage)', 'PII, masking, access control', 'Data observability', 'CI/CD for data pipelines'],
        [R('OpenLineage', 'https://openlineage.io/')], 'You can trace a dashboard number back to its source.'),
      n('de-bi', 'Serving & BI', 'core',
        ['Metabase / Superset dashboards', 'Semantic layers & metrics', 'Reverse ETL (idea)'],
        [R('Metabase learn', 'https://www.metabase.com/learn/')], 'Your pipeline ends in a dashboard someone can use.'),
    ],
  },

  // ───────────────────────── AI FULL STACK ─────────────────────────
  {
    id: 'ai', title: 'AI full stack', short: 'AI', glyph: '✳',
    blurb: 'Enough ML to be dangerous, then LLM apps, RAG, agents and MLOps — built on your data skills.',
    nodes: [
      n('ai-math', 'Math essentials', 'basic',
        ['Vectors, matrices, dot products', 'Derivatives & gradients (intuition)', 'Probability & distributions', 'Descriptive & inferential statistics'],
        [R('3Blue1Brown linear algebra', 'https://www.3blue1brown.com/topics/linear-algebra'), R('Khan Academy stats', 'https://www.khanacademy.org/math/statistics-probability')],
        'You can explain gradient descent with a drawing.'),
      n('ai-ml', 'Machine learning fundamentals', 'basic',
        ['Supervised vs unsupervised', 'Train/validation/test, overfitting', 'Regression & classification', 'Metrics: accuracy, precision, recall, RMSE', 'Trees, ensembles, clustering'],
        [R('Google ML Crash Course', 'https://developers.google.com/machine-learning/crash-course'), R('scikit-learn tutorials', 'https://scikit-learn.org/stable/tutorial/')],
        'You trained and evaluated a model on a real dataset.'),
      n('ai-feat', 'Feature engineering', 'core',
        ['Encoding & scaling', 'Handling missing data', 'Leakage', 'Pipelines in scikit-learn'],
        [R('Kaggle Learn', 'https://www.kaggle.com/learn')], 'You finished a Kaggle Learn course.'),
      n('ai-dl', 'Deep learning basics', 'core',
        ['Neural networks & backprop', 'PyTorch tensors & training loops', 'CNN & RNN ideas', 'Transformers & attention'],
        [R('fast.ai', 'https://course.fast.ai/'), R('Karpathy: Zero to Hero', 'https://karpathy.ai/zero-to-hero.html')],
        'You trained a small network in PyTorch.'),
      n('ai-llm', 'LLM apps', 'core',
        ['Calling LLM APIs (OpenRouter)', 'Prompting & system prompts', 'Structured output (JSON)', 'Tool / function calling', 'Streaming responses'],
        [R('OpenRouter docs', 'https://openrouter.ai/docs'), R('DeepLearning.AI short courses', 'https://www.deeplearning.ai/short-courses/')],
        'You built an app that calls tools via an LLM.'),
      n('ai-emb', 'Embeddings & vector databases', 'advanced',
        ['What embeddings capture', 'Similarity search', 'pgvector', 'Qdrant', 'Hybrid search (BM25 + vectors)'],
        [R('pgvector', 'https://github.com/pgvector/pgvector'), R('Qdrant docs', 'https://qdrant.tech/documentation/')],
        'You built semantic search over your own notes.'),
      n('ai-rag', 'RAG pipelines', 'advanced',
        ['Document ingestion & chunking', 'Retrieval & re-ranking', 'Prompt assembly & citations', 'Evaluating RAG'],
        [R('LLM Zoomcamp', 'https://github.com/DataTalksClub/llm-zoomcamp'), R('Hugging Face Learn', 'https://huggingface.co/learn')],
        'Your RAG answers with sources and you measured its quality.'),
      n('ai-agents', 'AI agents', 'advanced',
        ['Agent loop: plan, act, observe', 'Model Context Protocol (MCP)', 'Multi-agent patterns', 'Guardrails'],
        [R('Model Context Protocol', 'https://modelcontextprotocol.io/')], 'You wrote your own MCP server.'),
      n('ai-app', 'AI product full stack', 'advanced',
        ['FastAPI + React for AI apps', 'Streaming UI (Vercel AI SDK)', 'Auth, rate limits, cost caps', 'Caching LLM responses'],
        [R('AI SDK docs', 'https://ai-sdk.dev/docs')], 'You deployed a full AI app others can use.'),
      n('ai-mlops', 'MLOps', 'pro',
        ['Experiment tracking with MLflow', 'Model registry & versioning', 'Model serving', 'Monitoring & drift', 'Feature stores (Feast)'],
        [R('MLOps Zoomcamp', 'https://github.com/DataTalksClub/mlops-zoomcamp'), R('MLflow docs', 'https://mlflow.org/docs/latest/')],
        'A model of yours retrains and redeploys through a pipeline.'),
      n('ai-llmops', 'LLMOps & evals', 'pro',
        ['Eval datasets & LLM-as-judge', 'Tracing (Langfuse)', 'Prompt versioning', 'Cost & latency dashboards'],
        [R('Langfuse docs', 'https://langfuse.com/docs')], 'Every prompt change is tested before shipping.'),
      n('ai-de', 'AI × data engineering', 'pro',
        ['Pipelines for unstructured data (PDF, images, audio)', 'Text-to-SQL over your warehouse', 'LLMs for data cleaning & classification', 'Embedding pipelines at scale'],
        [R('LLM Zoomcamp', 'https://github.com/DataTalksClub/llm-zoomcamp')], 'Your data platform has an AI layer on top.'),
    ],
  },

  // ───────────────────────── CROSSOVER (where domains meet) ─────────────────────────
  {
    id: 'x', title: 'Crossover', short: 'X', glyph: '✕',
    blurb: 'The topics that live between domains — what makes you an engineer instead of a course-finisher.',
    nodes: [
      n('x-dsa-data', 'Algorithms inside data systems', 'core',
        ['Hash joins vs sort-merge joins', 'External sorting', 'Bloom filters', 'HyperLogLog & approximate counting', 'Consistent hashing in partitioning'],
        [R('CMU 15-445 joins lecture', 'https://15445.courses.cs.cmu.edu/')], 'You can explain how Spark joins two huge tables using DSA you know.'),
      n('x-app-db', 'App × database', 'core',
        ['Schema design for real products', 'Zero-downtime migrations', 'Soft deletes, audit columns, timestamps', 'Designing tables analysts will love later'],
        [R('Postgres docs', 'https://www.postgresql.org/docs/current/')], 'Your app schema is clean enough to feed a warehouse directly.'),
      n('x-be-de', 'Back end × data engineering', 'advanced',
        ['Event tracking from apps (product analytics)', 'Outbox pattern → Kafka', 'CDC from app DB into the lake', 'APIs that serve warehouse data'],
        [R('Debezium docs', 'https://debezium.io/documentation/')], 'Your app emits events your pipeline consumes.'),
      n('x-cloud-de', 'Cloud × data engineering', 'advanced',
        ['S3 data lake + Glue catalog + Athena', 'Serverless ETL with Lambda & Step Functions', 'Terraform for data infra', 'Managed Airflow (MWAA) & EMR Serverless', 'Cost control for data workloads'],
        [R('AWS Skill Builder', 'https://skillbuilder.aws/')], 'Your whole data stack is reproducible from Terraform.'),
      n('x-ops-de', 'DevOps × data (DataOps)', 'advanced',
        ['CI/CD for dbt & Airflow DAGs', 'Dockerised Spark jobs', 'Airflow on Kubernetes', 'Monitoring pipelines (SLAs, freshness alerts)', 'Environments: dev / staging / prod data'],
        [R('Astronomer Academy', 'https://academy.astronomer.io/')], 'A pull request runs your dbt tests before merge.'),
      n('x-de-ai', 'Data engineering × AI', 'advanced',
        ['Feature pipelines & feature stores', 'Training data versioning (DVC)', 'Embedding pipelines & re-indexing', 'Unstructured data pipelines (PDF, audio, images)', 'Data quality for ML'],
        [R('Feast docs', 'https://docs.feast.dev/'), R('DVC docs', 'https://dvc.org/doc')], 'Your model trains from a pipeline, not a notebook CSV.'),
      n('x-fs-ai', 'Full stack × AI', 'advanced',
        ['Chat & streaming UIs', 'Optimistic UI for slow AI calls', 'Uploads → processing queue → results', 'Usage metering & quotas'],
        [R('AI SDK docs', 'https://ai-sdk.dev/docs')], 'Your AI feature feels fast even when the model is slow.'),
      n('x-cloud-ai', 'Cloud × AI', 'pro',
        ['Managed AI services (Bedrock, SageMaker, Azure OpenAI)', 'GPU vs CPU serving & autoscaling', 'Serverless inference', 'Securing model endpoints'],
        [R('Amazon Bedrock docs', 'https://docs.aws.amazon.com/bedrock/')], 'You deployed a model endpoint and know what it costs per request.'),
      n('x-sd-all', 'End-to-end platform design', 'pro',
        ['App → events → lake → warehouse → BI → AI, in one diagram', 'Choosing batch vs streaming per use case', 'Failure modes & recovery across the stack', 'Security & governance across layers'],
        [R('System Design Primer', 'https://github.com/donnemartin/system-design-primer')], 'You can defend every box and arrow in a 45-minute interview.'),
      n('x-career', 'Job-ready engineer', 'pro',
        ['Resume with capstone impact numbers', 'Portfolio write-ups & architecture diagrams', 'Behavioural stories (STAR)', 'Mock system-design + SQL + DSA rounds', 'Open-source contribution to a data tool'],
        [R('Tech Interview Handbook', 'https://www.techinterviewhandbook.org/')], 'You can talk about every project for 20 minutes.'),
    ],
  },
  // ───────────────────────── CAPSTONES ─────────────────────────
  {
    id: 'cap', title: 'Capstone projects', short: 'CAP', glyph: '★',
    blurb: 'Proof you can do the job. Each one goes on GitHub, your resume and your portfolio.',
    nodes: [
      n('cap-fs', 'Full-stack product', 'core',
        ['TypeScript front end + API', 'Postgres + Redis', 'Google login', 'Docker Compose', 'CI/CD deploy', 'README with architecture diagram'],
        [R('Full Stack Open', 'https://fullstackopen.com/en/')], 'Live URL + green CI badge.'),
      n('cap-db', 'Build a tiny database', 'advanced',
        ['Key-value store in Python', 'Append-only log + index', 'Write-ahead log & recovery', 'Simple query parser'],
        [R('Build Your Own X', 'https://github.com/codecrafters-io/build-your-own-x')], 'It survives a kill -9 without losing data.'),
      n('cap-batch', 'Batch data platform on AWS', 'advanced',
        ['Ingest a public dataset (e.g. data.gov.in) with dlt', 'Land raw data in S3', 'Orchestrate with Airflow', 'Model with dbt into a warehouse', 'Dashboard in Metabase', 'Infra in Terraform'],
        [R('DE Zoomcamp (see its project guide)', 'https://github.com/DataTalksClub/data-engineering-zoomcamp')], 'Runs daily, by itself, with tests.'),
      n('cap-stream', 'Real-time pipeline', 'pro',
        ['Live event source (e.g. Wikimedia recent-changes stream)', 'Kafka', 'Spark Structured Streaming', 'Store in Postgres / ClickHouse', 'Live dashboard'],
        [R('Wikimedia recent changes stream', 'https://www.mediawiki.org/wiki/API:Recent_changes_stream')], 'Dashboard updates within seconds.'),
      n('cap-lake', 'Lakehouse at scale', 'pro',
        ['Large open dataset (e.g. NYC taxi trips)', 'Spark + Iceberg/Delta', 'Medallion layers', 'Performance tuning write-up'],
        [R('NYC TLC trip data', 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page')], 'Blog post comparing before/after tuning.'),
      n('cap-ai', 'AI full-stack RAG app', 'pro',
        ['Ingestion pipeline for documents', 'Vector DB + hybrid search', 'FastAPI + React streaming UI', 'Evals & tracing', 'Deployed on cloud in Docker'],
        [R('LLM Zoomcamp', 'https://github.com/DataTalksClub/llm-zoomcamp')], 'Strangers can use it and you can show its eval scores.'),
      n('cap-team', 'Team capstone: data platform as a product', 'pro',
        ['One shared repo, three owners', 'Friend 1 owns ingestion & streaming', 'Friend 2 owns lakehouse & modeling', 'Friend 3 owns AI layer & product UI', 'System design doc + demo video'],
        [R('Study Together board', '#board')], 'Presented together, recorded, linked from all three resumes.'),
    ],
  },
]

// ─────────────────────────────────────────────────────────────
//  CROSSOVER JOURNEY — the blended roadmap.
//  Stages pull nodes from every track. Ticking a node here ticks it in its own track too.
//  No days, no dates: finish a stage, move on.
// ─────────────────────────────────────────────────────────────
export const JOURNEY = [
  { id: 'j-ground', title: 'Ground floor', blurb: 'Tools every engineer uses daily.',
    nodes: ['ops-linux', 'ops-shell', 'ops-git', 'fe-web', 'dsa-py', 'dsa-bigo'] },
  { id: 'j-web', title: 'Web builder', blurb: 'Front end and back end, properly.',
    nodes: ['fe-html', 'fe-css', 'fe-js', 'fe-ts', 'fe-react', 'be-node', 'be-rest', 'be-auth', 'be-py'] },
  { id: 'j-data-core', title: 'Data core', blurb: 'Databases from the outside in.',
    nodes: ['db-model', 'db-sql', 'db-sql2', 'db-norm', 'db-pg', 'be-orm', 'x-app-db', 'sd-basics'] },
  { id: 'j-ship', title: 'Ship it', blurb: 'Containers, pipelines, first capstone.',
    nodes: ['ops-docker', 'ops-ci', 'be-cache', 'be-jobs', 'fe-react2', 'fe-next', 'fe-test', 'be-test', 'sd-net', 'cap-fs'] },
  { id: 'j-inside', title: 'Under the hood', blurb: 'How databases really work.',
    nodes: ['db-txn', 'db-idx', 'db-storage', 'db-nosql', 'x-dsa-data', 'sd-cache', 'cap-db'] },
  { id: 'j-cloud', title: 'Into the cloud', blurb: 'AWS fundamentals with infra as code.',
    nodes: ['cld-concepts', 'cld-iam', 'cld-compute', 'cld-storage', 'ops-net', 'cld-net', 'cld-db', 'ops-iac'] },
  { id: 'j-batch', title: 'Batch data engineer', blurb: 'The core data engineering job.',
    nodes: ['de-found', 'de-py', 'db-olap', 'de-model', 'de-dwh', 'de-ingest', 'de-orch', 'de-dbt', 'de-quality', 'de-bi', 'x-cloud-de', 'cld-data', 'cap-batch'] },
  { id: 'j-scale', title: 'Big data & streams', blurb: 'Spark, lakehouse, Kafka.',
    nodes: ['de-spark', 'de-lake', 'db-dist', 'sd-async', 'de-stream', 'de-kafka', 'de-sproc', 'x-be-de', 'cld-serverless', 'cap-lake', 'cap-stream'] },
  { id: 'j-ai', title: 'AI layer', blurb: 'ML basics to RAG and agents.',
    nodes: ['ai-math', 'ai-ml', 'ai-feat', 'ai-dl', 'ai-llm', 'ai-emb', 'ai-rag', 'ai-agents', 'ai-app', 'x-fs-ai', 'x-de-ai'] },
  { id: 'j-prod', title: 'Production grade', blurb: 'Run it like a real company.',
    nodes: ['ops-k8s', 'ops-obs', 'ops-gitops', 'x-ops-de', 'de-gov', 'ai-mlops', 'ai-llmops', 'ai-de', 'x-cloud-ai', 'cld-ops', 'be-sec', 'fe-perf', 'be-gql', 'be-rt', 'fe-ui'] },
  { id: 'j-architect', title: 'Architect', blurb: 'Design anything, defend everything.',
    nodes: ['sd-arch', 'sd-classic', 'sd-data', 'sd-ai', 'x-sd-all', 'cld-multi', 'cld-cert', 'cap-ai'] },
  { id: 'j-final', title: 'Final boss', blurb: 'Build together, get hired.',
    nodes: ['cap-team', 'x-career', 'dsa-mock'] },
]

export const LEVELS = { basic: 'Basic', core: 'Core', advanced: 'Advanced', pro: 'Pro' }

// ─────────────────────────────────────────────────────────────
//  helpers — concepts may be plain strings (built-in) or {id, text} (edited)
// ─────────────────────────────────────────────────────────────
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
export const cText = (c) => (typeof c === 'string' ? c : c.text)
export const cKey = (c) => (typeof c === 'string' ? slug(c) : c.id)
export const conceptId = (nodeId, c) => `${nodeId}__${cKey(c)}` // no dots: safe as a Firestore field path

export function nodeProgress(nd, progress) {
  const done = nd.concepts.filter((c) => progress?.[conceptId(nd.id, c)]).length
  const total = nd.concepts.length
  return { done, total, pct: total ? done / total : 0 }
}
export function trackProgress(t, progress) {
  let d = 0, tot = 0
  for (const nd of t.nodes) { const p = nodeProgress(nd, progress); d += p.done; tot += p.total }
  return { done: d, total: tot, pct: tot ? d / tot : 0 }
}

const norm = (nd, track) => ({ ...nd, track, concepts: (nd.concepts || []).map((c) => (typeof c === 'string' ? { id: slug(c), text: c } : c)), resources: nd.resources || [] })

// Build a roadmap from the built-in base plus edit layers, applied in order.
// A layer: { nodes: { [nodeId]: fullNode | { deleted: true } }, order: { [trackId]: [nodeIds] } }
export function resolve(layers = []) {
  const tracks = TRACKS.map((t) => ({ ...t, nodes: t.nodes.map((nd) => norm(nd, t.id)) }))
  const T = Object.fromEntries(tracks.map((t) => [t.id, t]))
  const source = {}
  for (const L of layers) {
    if (!L) continue
    for (const [id, patch] of Object.entries(L.nodes || {})) {
      if (!patch) continue
      const from = tracks.find((t) => t.nodes.some((x) => x.id === id))
      if (patch.deleted) { if (from) from.nodes = from.nodes.filter((x) => x.id !== id); source[id] = L.name; continue }
      const old = from?.nodes.find((x) => x.id === id)
      const trackId = patch.track || old?.track
      const to = T[trackId]; if (!to) continue
      const merged = norm({ ...(old || {}), ...patch, id }, trackId)
      if (from && from !== to) from.nodes = from.nodes.filter((x) => x.id !== id)
      const i = to.nodes.findIndex((x) => x.id === id)
      if (i >= 0) to.nodes[i] = merged; else to.nodes.push(merged)
      source[id] = L.name
    }
    for (const [tid, ids] of Object.entries(L.order || {})) {
      const t = T[tid]; if (!t || !Array.isArray(ids)) continue
      const m = new Map(t.nodes.map((x) => [x.id, x]))
      t.nodes = [...ids.filter((i) => m.has(i)).map((i) => m.get(i)), ...t.nodes.filter((x) => !ids.includes(x.id))]
    }
  }
  const ALL = tracks.flatMap((t) => t.nodes)
  const NODE = Object.fromEntries(ALL.map((x) => [x.id, x]))
  return {
    tracks, TRACK: T, NODE, ALL, source,
    total: ALL.reduce((a, x) => a + x.concepts.length, 0),
    journey: JOURNEY.map((st) => ({ ...st, nodes: st.nodes.filter((i) => NODE[i]) })),
  }
}

export const BASE = resolve([])
export const ALL_NODES = BASE.ALL
export const NODE = BASE.NODE
export const TRACK = BASE.TRACK
export const TOTAL_CONCEPTS = BASE.total
