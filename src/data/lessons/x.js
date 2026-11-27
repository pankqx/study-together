// Crossover (11) and Capstones track (9)
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })
const guide = (id, label) => ({ note: `Step-by-step: open the **${label}** guide — Build tab → ${id}.` })

export default {
  'x-dsa-data': {
    intro: 'The DSA you practise shows up inside every database and data tool. Seeing where makes both click.',
    concepts: [
      C('Hash joins vs sort-merge joins', `**Hash join**: build a hash map of the smaller table on the join key (O(n)), probe with the larger (O(m)) — best for unsorted data with one side fitting in memory. **Sort-merge**: sort both sides (O(n log n)) then walk them together like merging two sorted arrays — best when inputs are already sorted or huge. Your LeetCode "two-pointer merge" is literally a merge join.`),
      C('External sorting', `Sorting data bigger than RAM: sort chunks that fit in memory, write sorted runs to disk, then **k-way merge** them with a min-heap. Databases and Spark do this when a sort spills. Heap problems on LeetCode = this.`,
        { steps: [['Read 1 GB chunk', 'Sort in memory, write run_1.'], ['Repeat', 'run_1 … run_20 for a 20 GB file.'], ['k-way merge', 'Min-heap holds the smallest head of each run.'], ['Output', 'Pop min, push next from that run, until empty.']] }),
      C('Bloom filters', `A bit array + k hash functions answering "definitely not present" or "possibly present". Tiny memory, false positives possible, no false negatives. Used in LSM databases (skip SSTables), CDNs, and dedupe at scale.`),
      C('HyperLogLog & approximate counting', `Counts distinct items (unique users) in ~12 KB with ~1% error, by tracking the longest run of leading zeros in hashes. \`APPROX_COUNT_DISTINCT\` in warehouses, \`PFADD/PFCOUNT\` in Redis. Exact distinct counts on billions of rows are expensive; approximate is often good enough.`),
      C('Consistent hashing in partitioning', `Nodes and keys on a hash ring; adding a node moves only ~1/N of the keys. Used by Cassandra, DynamoDB, Kafka-like systems and distributed caches. (Full explanation in System Design → caching.)`,
        pick('Count unique daily visitors across 5 billion events cheaply, 1% error acceptable?', ['COUNT(DISTINCT) on all rows', false], ['HyperLogLog / APPROX_COUNT_DISTINCT', true, 'Tiny memory, fast, small known error.'], ['Sort everything first', false])),
      D('Deep dive: map your DSA patterns to systems', `Hash maps → hash joins, caches, indexes. Heaps → external sort, top-K, schedulers. Two pointers → merge joins. Binary search → B-tree lookups, sorted SSTables. Sliding window → stream windows and rate limiters. Graphs → DAG schedulers (Airflow), lineage. Tries → autocomplete. Mention these links in interviews.`),
    ],
    quiz: [
      Q('A Bloom filter can return…', ['False negatives', 'False positives', 'Exact counts', 'Sorted data'], 1, '"Possibly present" may be wrong; "not present" never is.'),
      Q('External sort merges runs using…', ['A stack', 'A min-heap', 'A queue', 'A trie'], 1, 'k-way merge.'),
    ],
    practice: 'Implement a Bloom filter and an external sort in Python; connect each to a LeetCode problem you have solved.',
    explain: 'Explain a Bloom filter with a guest list where you can only say "definitely not invited" or "maybe".',
  },

  'x-app-db': {
    intro: 'How app developers design databases that stay healthy in production and are a joy for data teams later.',
    concepts: [
      C('Schema design for real products', `Model the business, not the screen: clear entities, explicit constraints, ids that never change, money in integer minor units or numeric, timestamps in UTC (timestamptz), enums/check constraints for states, and junction tables for many-to-many.`),
      C('Zero-downtime migrations', `Expand → migrate → contract: add new things in backward-compatible ways, backfill in batches, switch reads, then remove old. Build indexes concurrently; set lock timeouts; never rename a column in place on a live system.`,
        { steps: [['Expand', 'Add nullable column / new table.'], ['Dual write', 'App writes both old and new.'], ['Backfill', 'Batch copy old rows (1,000 at a time).'], ['Switch reads', 'Deploy code reading the new column.'], ['Contract', 'Drop old column in a later release.']] }),
      C('Soft deletes, audit columns, timestamps', `\`created_at\`, \`updated_at\` (trigger or ORM), \`created_by\`; soft delete with \`deleted_at\` when you need undo or history (remember partial unique indexes and filtering); audit tables for who-changed-what on sensitive data.`),
      C('Designing tables analysts will love later', `Stable primary keys, \`updated_at\` on every table (enables incremental loads), no overloaded columns ("status" meaning five things), documented enums, and events/history instead of overwriting important state. A small effort now saves data engineers weeks.`,
        pick('Which column makes incremental extraction into the warehouse easy?', ['A free-text notes column', false], ['A reliable updated_at timestamp (indexed)', true, 'Extract only rows changed since the last run.'], ['A JSON blob', false])),
      D('Deep dive: state history instead of overwriting', `Instead of only \`orders.status\`, also write \`order_status_history (order_id, status, at)\`. Product questions like "time from paid to shipped" become trivial, and the data team doesn't need CDC to reconstruct history.`),
    ],
    quiz: [
      Q('Renaming a column on a live system should use…', ['ALTER RENAME at peak hours', 'Expand → migrate → contract', 'Delete and recreate', 'A new database'], 1, 'Backward-compatible steps.'),
      Q('Why updated_at on every table?', ['Looks nice', 'Enables incremental loads and debugging', 'Required by SQL', 'Speeds inserts'], 1, 'Change detection.'),
    ],
    practice: 'Add updated_at triggers, a status-history table and a zero-downtime column rename to your be-4 project.',
    explain: 'Explain expand–contract migrations with renovating a shop while it stays open.',
  },

  'x-be-de': {
    intro: 'Back ends produce the data; data engineers make it useful. These patterns connect the two cleanly.',
    concepts: [
      C('Event tracking from apps (product analytics)', `Track meaningful user actions as events with a consistent schema: \`event_name\`, \`user_id\`, \`timestamp\`, \`properties\`, \`app_version\`. Keep a tracking plan (a shared spreadsheet of events and properties). Send server-side for important events (payments) — client events get blocked or lost.`,
        { code: `{ "event": "build_shipped", "user_id": "u_7", "ts": "2026-11-27T10:02:11Z",
  "props": { "build_id": "de-1", "track": "de", "days_taken": 4 }, "app_version": "2.3.0" }`, lang: 'json' }),
      C('Outbox pattern → Kafka', `Write business changes and their events in one DB transaction (outbox table); Debezium or a relay publishes the outbox to Kafka. No dual-write inconsistencies between your DB and the event stream.`),
      C('CDC from app DB into the lake', `Capture every change from Postgres (Debezium) into Kafka → lake (bronze) → silver tables via MERGE. The app team doesn't build exports; the data team gets complete, ordered history including deletes.`),
      C('APIs that serve warehouse data', `Expose analytics to apps safely: pre-aggregated tables, a serving layer (Postgres/ClickHouse/cache) rather than hitting the warehouse per request, semantic-layer APIs for consistent metrics, caching and rate limits.`,
        pick('The app needs a "your weekly stats" card for every user on every page load. Best source?', ['Query the warehouse per request', false], ['A pre-computed per-user stats table synced to a fast store and cached', true, 'Warehouses are slow and costly for high-QPS lookups.'], ['Recompute from raw events in the browser', false])),
      D('Deep dive: a tracking plan that survives', `One owner, naming convention (object_action: build_shipped), required properties, versioning, a schema registry or JSON schema validation at ingestion, and data contracts so a renamed event fails CI instead of silently breaking dashboards.`),
    ],
    quiz: [
      Q('Important events like payments should be tracked…', ['Only client-side', 'Server-side', 'In localStorage', 'Never'], 1, 'Reliable and tamper-resistant.'),
      Q('The outbox pattern avoids…', ['Indexes', 'Inconsistency between DB writes and published events', 'JSON', 'Caching'], 1, 'One transaction.'),
    ],
    practice: 'Add a tracking plan and server-side events to Study Together v2, flowing via outbox → Kafka → lake.',
    explain: 'Explain the outbox pattern with writing a receipt in the same register entry as the sale.',
  },

  'x-cloud-de': {
    intro: 'Building data platforms on cloud services, cost-effectively, with infrastructure as code.',
    concepts: [
      C('S3 data lake + Glue catalog + Athena', `The cheapest serverless analytics stack on AWS: Parquet/Iceberg on S3, schemas in the Glue Data Catalog, SQL with Athena (pay per TB scanned). Partitioning and columnar formats cut cost dramatically. (See Cloud → data services.)`),
      C('Serverless ETL with Lambda & Step Functions', `Small, event-driven ETL: S3 upload → Lambda transforms (≤15 min, ≤10 GB memory) → Step Functions orchestrates retries and branches. Great for many small files; use Glue/EMR for big data.`),
      C('Terraform for data infra', `Buckets, Glue databases, IAM roles, Athena workgroups (with query limits), MWAA environments — all in Terraform modules per environment, so the platform is reproducible and reviewable.`),
      C('Managed Airflow (MWAA) & EMR Serverless', `MWAA runs Airflow without managing servers (always-on cost — size carefully). EMR Serverless runs Spark jobs on demand with no cluster to manage — you pay per job.`),
      C('Cost control for data workloads', `The usual suspects: scanning unpartitioned data, small files, always-on clusters, NAT gateway data charges, dev environments left running, and repeated full refreshes.`,
        { cards: [['Athena', 'Workgroup scan limits; Parquet + partitions.'], ['Clusters', 'Auto-terminate; spot instances; serverless options.'], ['Storage', 'Lifecycle to cheaper classes; compaction.'], ['Network', 'VPC endpoints for S3 instead of NAT.'], ['Visibility', 'Tags per pipeline; budget alerts; monthly review.']] },
        pick('Athena bills jumped after analysts queried raw CSV daily. Best fix?', ['Ban analysts', false], ['Convert to partitioned Parquet and set workgroup scan limits', true, 'Scan far less data per query.'], ['Use a bigger instance', false])),
      D('Deep dive: estimating a data platform’s monthly cost', `List each component: storage (GB × price × months), queries (TB scanned/month), compute (job hours × rate), orchestration (always-on hours), data transfer. Put it in a table in your design doc — interviewers rarely see juniors do this.`),
    ],
    quiz: [
      Q('Athena cost depends mainly on…', ['Rows returned', 'Data scanned', 'Users', 'Time of day'], 1, 'Per TB scanned.'),
      Q('Spark jobs on demand without managing a cluster?', ['EC2', 'EMR Serverless / Glue', 'Lambda only', 'RDS'], 1, 'Serverless Spark.'),
    ],
    practice: 'Do the cap-batch capstone on AWS free tier with Terraform and a written monthly cost estimate.',
    explain: 'Explain why Parquet on S3 makes Athena cheaper.',
  },

  'x-ops-de': {
    intro: 'DataOps: applying DevOps discipline — CI/CD, containers, environments, monitoring — to data pipelines.',
    concepts: [
      C('CI/CD for dbt & Airflow DAGs', `On PR: lint SQL (sqlfluff), \`dbt build\` on a CI schema with slim CI, DAG import tests (no syntax errors, no cycles), unit tests for Python tasks. On merge: deploy dbt docs and sync DAGs to the Airflow environment.`,
        { code: `def test_dags_load():
    from airflow.models import DagBag
    bag = DagBag(dag_folder="dags", include_examples=False)
    assert not bag.import_errors`, lang: 'python' }),
      C('Dockerised Spark jobs', `Package Spark jobs and their dependencies in images so they run identically locally, in CI and on Kubernetes/EMR. Pin Spark and Python versions; pass dates and paths as arguments.`),
      C('Airflow on Kubernetes', `KubernetesExecutor or KubernetesPodOperator: each task runs in its own pod with its own image and resources — isolation, autoscaling and no dependency conflicts between teams.`),
      C('Monitoring pipelines (SLAs, freshness alerts)', `Monitor outcomes, not just task success: table freshness, row volumes, run duration trends, cost per run. Alerts route to the owning team with a link to lineage and a runbook.`),
      C('Environments: dev / staging / prod data', `Separate schemas/buckets per environment; dev uses sampled or synthetic data (mask PII); staging mirrors prod config; promotions go through CI. Never test transformations directly on prod tables.`,
        pick('A developer tests a new dbt model directly on the production schema. Problem?', ['None', false], ['It can overwrite tables dashboards rely on — use dev/CI schemas', true, 'Environments isolate experiments from consumers.'], ['It’s slower', false])),
      D('Deep dive: the DataOps maturity ladder', `1) Scripts run by hand. 2) Scheduled in an orchestrator. 3) Version-controlled with code review. 4) CI tests and environments. 5) Data quality + observability + contracts. 6) Self-serve platform with templates. Note where your projects are — and climb one rung per build.`),
    ],
    quiz: [
      Q('A cheap CI test for Airflow?', ['Run every DAG for a year', 'Load the DagBag and assert no import errors', 'Deploy to prod', 'Count files'], 1, 'Catches broken DAGs instantly.'),
      Q('Dev environments should use…', ['Full production PII', 'Sampled/synthetic or masked data', 'No data', 'Prod schemas'], 1, 'Safe and fast.'),
    ],
    practice: 'Add DAG import tests, sqlfluff and dbt slim CI to your de-4 project with separate dev/prod targets.',
    explain: 'Explain DataOps with a restaurant kitchen adopting checklists, tasting before serving and separate test kitchens.',
  },

  'x-de-ai': {
    intro: 'AI is only as good as its data. These are the data engineering foundations of reliable ML and LLM systems.',
    concepts: [
      C('Feature pipelines & feature stores', `Compute features with point-in-time correctness (no future data leaking into training), serve the same logic offline (training) and online (inference). Feast is the common open-source feature store.`),
      C('Training data versioning (DVC)', `Version datasets and models alongside code so experiments are reproducible: DVC stores data in S3/remote with pointers in git; lakehouse time travel (Delta/Iceberg) also gives versioned training snapshots.`,
        { code: `dvc init && dvc remote add -d store s3://study-ml/dvc
dvc add data/train.parquet && git add data/train.parquet.dvc .gitignore && git commit -m "Training data v3"
dvc push`, lang: 'bash' }),
      C('Embedding pipelines & re-indexing', `Incremental: detect new/changed/deleted documents by hash, re-chunk and re-embed only those, delete stale vectors, version the embedding model and re-embed everything (in the background, then swap) when it changes.`),
      C('Unstructured data pipelines (PDF, audio, images)', `Bronze: raw files with metadata. Silver: extracted text (parsers, OCR, Whisper), page/time references, language. Gold: chunks, embeddings, entities, structured fields. Orchestrate, test and monitor like any pipeline.`),
      C('Data quality for ML', `Check label quality, class balance, duplicates between train and test, drift between training and live data, missing/invalid values and PII. Bad data silently produces bad models — quality checks belong in the training pipeline.`,
        pick('Model accuracy is suspiciously high. Data check to run first?', ['More epochs', false], ['Look for duplicates/leakage between train and test sets', true, 'Leaks inflate scores.'], ['Change the learning rate', false])),
      D('Deep dive: point-in-time joins', `When building training rows for "will this user churn on date D", every feature must use only data available before D. Use AS OF / point-in-time joins (Feast, Spark, DuckDB ASOF JOIN). Getting this wrong is the most common reason a model works offline and fails live.`),
    ],
    quiz: [
      Q('Point-in-time correctness prevents…', ['Slow training', 'Future data leaking into training features', 'GPU errors', 'Small files'], 1, 'Leakage.'),
      Q('When the embedding model changes you must…', ['Do nothing', 'Re-embed all documents', 'Delete the index forever', 'Only embed new docs'], 1, 'Vectors aren’t comparable across models.'),
    ],
    practice: 'Version your ai-2 training data with DVC and build an incremental embedding pipeline in Airflow for ai-5.',
    explain: 'Explain point-in-time correctness with predicting exam results without peeking at the answer sheet.',
  },

  'x-fs-ai': {
    intro: 'Building AI features users love: responsive UIs over slow models, background processing and fair usage limits.',
    concepts: [
      C('Chat & streaming UIs', `Stream tokens (SSE) so users see output immediately; show a stop button; render Markdown safely; keep scroll behaviour sane; show sources/citations; handle errors and retries gracefully.`),
      C('Optimistic UI for slow AI calls', `Show the user's message instantly, a typing indicator, and partial results; allow navigating away while work continues; reconcile when the server responds; roll back clearly on failure.`),
      C('Uploads → processing queue → results', `Long AI jobs (transcribe a lecture, summarise a PDF) don't fit in a request:`,
        { steps: [['Upload', 'Signed URL straight to storage.'], ['Enqueue', 'API creates a job (202) and returns its id.'], ['Process', 'Worker parses, calls models, stores results.'], ['Progress', 'Client polls or listens via SSE/WebSocket.'], ['Done', 'Notify; results viewable and cached.']] }),
      C('Usage metering & quotas', `Record tokens/cost per user and feature; enforce daily/monthly quotas per plan; show users their usage; alert on abnormal spend; hard caps so one user (or bug) can't burn the budget.`,
        pick('A free user scripts 10,000 AI requests overnight. What should have stopped it?', ['Nothing', false], ['Per-user rate limits and daily token quotas', true, 'Metering + quotas protect cost and fairness.'], ['A bigger budget', false])),
      D('Deep dive: designing for AI latency', `Perceived speed matters most: stream, show skeletons, precompute likely requests (summaries on upload), cache results, use smaller models for interactive steps and big ones in the background, and set expectations ("~20 seconds").`),
    ],
    quiz: [
      Q('Summarising a 2-hour lecture should be…', ['A synchronous request', 'A background job with progress updates', 'Done in the browser', 'Skipped'], 1, 'Too slow for one request.'),
      Q('Main reason to stream LLM responses?', ['Cheaper', 'Users see output immediately', 'More accurate', 'Required'], 1, 'Perceived latency.'),
    ],
    practice: 'Add "upload a PDF → background summary with progress" and per-user daily token quotas to your ai-4 app.',
    explain: 'Explain optimistic UI with a waiter confirming your order instantly while the kitchen cooks.',
  },

  'x-ai-eng': {
    intro: 'AI coding tools are part of the job now. Used well they multiply you; used blindly they ship bugs you don’t understand.',
    concepts: [
      C('Working with AI coding tools (Claude Code, Copilot, Cursor)', `Inline completion (Copilot), chat in the editor (Cursor), and agentic tools that read the repo, run commands and edit files (Claude Code). Use them for boilerplate, refactors, tests, explaining unfamiliar code and first drafts — while you stay the engineer responsible for the result.`),
      C('Prompting for code: context, constraints, examples', `Good coding prompts include: the goal, relevant files/interfaces, constraints (language version, libraries, style, performance), examples of existing patterns, and how you will verify ("make these tests pass").`,
        { code: `Add cursor pagination to GET /logs in app/api/logs.py.
Constraints: SQLAlchemy 2.0 style like app/repos/builds.py; keyset on (created_at DESC, id DESC); limit max 50.
Return { items, next_cursor }. Add pytest cases for: first page, next page, last page, invalid cursor.
Don't change other endpoints.`, lang: 'text' }),
      C('Reviewing AI-written code critically', `Read every line as if a new teammate wrote it: does it actually solve the problem? Edge cases? Error handling? Security (injection, auth checks)? Invented APIs or wrong library versions? Unnecessary complexity? If you can't explain it, don't merge it.`),
      C('Tests as guardrails for AI changes', `Tests turn "looks right" into "is right". Write or ask for tests first, run them on every AI change, and keep CI strict (types, lint, tests). Agents work best inside a tight loop of run → fail → fix.`),
      C('Security & licence risks in generated code', `Generated code can include vulnerable patterns, hard-coded secrets, outdated dependencies, or code resembling licensed sources. Run linters/scanners, never paste secrets or private data into tools your organisation hasn't approved, and follow your company's AI policy.`,
        pick('An AI suggests a SQL query built with an f-string from user input. You…', ['Merge it — it works', false], ['Rewrite it with parameters; it’s an injection risk', true, 'You own the code’s security.'], ['Ask the AI if it’s safe and trust the answer', false])),
      C('Knowing when to write it yourself', `Write it yourself when you're learning a concept (the struggle is the learning), for core logic you must deeply understand, for security-critical code, and when explaining the context would take longer than writing it. For your 6-month plan: solve DSA and first versions of builds yourself; use AI to review, test and extend.`),
      D('Deep dive: a healthy workflow with AI', `1) Think and sketch the design yourself. 2) Ask AI for a plan and compare with yours. 3) Let it implement small steps with tests. 4) Review the diff line by line. 5) Run tests and the app. 6) Write the retro yourself — explaining is how you keep the knowledge.`),
    ],
    quiz: [
      Q('Best guardrail when an AI agent edits your code?', ['Trust', 'A strong automated test suite and CI', 'Longer prompts', 'Turning off linting'], 1, 'Tests verify behaviour.'),
      Q('When learning a new concept, you should…', ['Let AI write everything', 'Write it yourself first, then use AI to review', 'Skip it', 'Copy from forums'], 1, 'Struggle builds understanding.'),
    ],
    practice: 'For your next build milestone: write it yourself, then ask an AI to review it and add tests; note what it caught and what it got wrong.',
    explain: 'Explain responsible AI-assisted coding with using a calculator in a maths exam you still need to understand.',
  },

  'x-cloud-ai': {
    intro: 'Running AI in the cloud: managed model services, GPU economics and securing endpoints.',
    concepts: [
      C('Managed AI services (Bedrock, SageMaker, Azure OpenAI)', `**Bedrock** — API access to foundation models (Claude, Llama, others) inside AWS with VPC/IAM controls. **SageMaker** — train, tune and host your own models. **Azure OpenAI / Azure AI Foundry** and **Vertex AI** are the Azure and GCP equivalents. Enterprises use them for data residency, compliance and private networking.`),
      C('GPU vs CPU serving & autoscaling', `GPUs are fast for large models but expensive and scarce; CPUs work for small models and classic ML. Batch requests on GPUs, autoscale on queue depth, scale to zero when idle where possible, and right-size (quantised models fit smaller GPUs).`),
      C('Serverless inference', `Pay-per-request endpoints (Bedrock, SageMaker Serverless, Cloud Run with GPUs, Modal, Replicate) — no idle GPU cost, but cold starts and per-request pricing. Great for spiky or low traffic; dedicated endpoints win at steady high volume.`,
        pick('A demo model gets 50 requests a day. Hosting choice?', ['Dedicated GPU instance 24×7', false], ['Serverless / pay-per-request inference', true, 'No idle GPU bill for rare traffic.'], ['A Kubernetes GPU cluster', false])),
      C('Securing model endpoints', `Private networking (VPC endpoints), IAM auth, API keys per client with quotas, input size limits, prompt-injection defences at the app layer, logging with PII redaction, and monitoring for abuse and cost spikes.`),
      D('Deep dive: comparing cost per 1,000 requests', `For each option compute: (tokens per request × price) or (instance hourly cost ÷ requests per hour). Add idle time, cold starts and engineering effort. Put the table in your design doc — it usually decides the architecture.`),
    ],
    quiz: [
      Q('Access foundation models inside AWS with IAM and VPC controls?', ['EC2', 'Amazon Bedrock', 'S3', 'Route 53'], 1, 'Managed model APIs.'),
      Q('Steady high-volume inference is usually cheapest on…', ['Per-request serverless', 'Dedicated, well-utilised instances', 'Laptops', 'Lambda'], 1, 'High utilisation amortises cost.'),
    ],
    practice: 'Deploy your ai-3 model as a serverless endpoint (e.g. Cloud Run or a free-tier service) with an API key and rate limit.',
    explain: 'Explain serverless vs dedicated inference with ordering a cab vs owning a car.',
  },

  'x-sd-all': {
    intro: 'Putting it all together: one platform from app clicks to AI answers — the diagram that shows you understand modern data-driven products.',
    concepts: [
      C('App → events → lake → warehouse → BI → AI, in one diagram', `The end-to-end picture to be able to draw from memory:`,
        { arch: [['Product', ['Web/mobile app', 'API + Postgres']], ['Capture', ['Event tracking', 'Outbox / CDC → Kafka']], ['Lake / lakehouse', ['Bronze', 'Silver', 'Gold (Iceberg/Delta)']], ['Warehouse & semantic layer', ['dbt models', 'Metrics definitions']], ['Consumers', ['BI dashboards', 'Reverse ETL', 'ML features', 'RAG / AI assistants']], ['Platform', ['Orchestration', 'Quality & lineage', 'Security & governance', 'Cost monitoring']]] }),
      C('Choosing batch vs streaming per use case', `Decide per use case, not per company: finance reports (daily batch), product dashboards (hourly), fraud and live ops (streaming), ML training (batch), feature freshness for recommendations (near-real-time). Streaming only where delay costs money.`),
      C('Failure modes & recovery across the stack', `For each layer ask: what if it fails, how do we notice, how do we recover? Source outage (retry, backfill), duplicate events (idempotent sinks), bad deploy (rollback), schema change (contracts, quarantine), warehouse down (cached dashboards), model degradation (evals, fallback).`),
      C('Security & governance across layers', `Identity everywhere (SSO, roles), least privilege per service, encryption in transit and at rest, PII classification with masking downstream, access policies in the catalog, audit logs, retention and deletion (DPDP Act "right to erasure") propagated through the lake and models.`,
        pick('A user asks to delete their data. What must your platform handle?', ['Only the app database', false], ['App DB, events, lake/warehouse copies, backups policy and any AI indexes', true, 'Erasure must propagate through every copy.'], ['Nothing — data is anonymous', false])),
      D('Deep dive: presenting the whole platform in 5 minutes', `Draw left to right; name one tool per box and why; mark batch vs streaming paths; point to the two riskiest failure modes and your mitigation; give the monthly cost order of magnitude. Practise this on a call — it’s the best final-round preparation there is.`),
    ],
    quiz: [
      Q('Which use case most justifies streaming?', ['Monthly payroll', 'Card fraud detection', 'Quarterly reports', 'Model retraining'], 1, 'Delay costs money.'),
      Q('Right-to-erasure requests must reach…', ['Only the UI', 'Every system holding copies of the user’s data', 'Only backups', 'Only logs'], 1, 'Data propagates; deletion must too.'),
    ],
    practice: 'Draw the full Study Together v2 platform diagram from memory and present it in 5 minutes to the crew.',
    explain: 'Explain the data platform as a city’s water system: sources, pipes, treatment, storage and taps.',
  },

  'x-career': {
    intro: 'Turning six months of learning and building into offers. This is a project too — treat it like one.',
    concepts: [
      C('Resume with capstone impact numbers', `One page; projects before coursework if you're early-career; each bullet = **what you built + how + measured result**. Tailor keywords to each job description.`,
        { code: `• Built an idempotent Airflow + dbt ELT pipeline for air-quality data; backfilled 90 days in 4 minutes with zero duplicates across re-runs.
• Designed a Spark lakehouse (Delta, medallion) over 120M NYC taxi trips; fixed join skew, cutting the gold job from 14 to 4 minutes.
• Shipped a RAG assistant over course notes; hybrid search + reranking raised recall@5 from 0.62 to 0.88 (50-question eval).`, lang: 'text' }),
      C('Portfolio write-ups & architecture diagrams', `For your top 3 builds: a README or blog post with the problem, architecture diagram, key decisions and trade-offs, numbers, what broke, and what you'd do at 10×. Pin them on GitHub; link from your resume and LinkedIn.`),
      C('Behavioural stories (STAR)', `Prepare 6–8 stories from your builds and team work: a hard bug, a disagreement, a failure, leading something, learning fast, a trade-off under time pressure. Situation → Task → Action → Result, 2 minutes each, with a number.`),
      C('Mock system-design + SQL + DSA rounds', `Run mocks with your crew every week: one person interviews, one is interviewed, one observes and scores. Rotate rounds: DSA (45 min), SQL (30 min), system/data design (45 min), project deep-dive (30 min). Record and review.`,
        { steps: [['Week A', 'Pank interviews Ravi on DSA; Merel observes.'], ['Week B', 'Ravi interviews Merel on her campaign case study; Pank observes.'], ['Week C', 'Merel interviews Pank on data system design; Ravi observes.'], ['Every week', 'Feedback in the crew log; recurring weak spots go on the roadmap.']] }),
      C('Open-source contribution to a data tool', `Start small in tools you use (dbt, dlt, DuckDB, Airflow providers, Great Expectations): fix docs, reproduce and triage issues, add tests, then small features. A merged PR in a well-known data tool is a strong, verifiable signal.`,
        pick('Best first open-source contribution?', ['Rewrite the core engine', false], ['A docs fix or a well-reproduced bug report with a small test', true, 'Builds trust and teaches the project’s process.'], ['A huge unrequested feature', false])),
      D('Deep dive: a 6-week job-search sprint', `Week 1: resume + LinkedIn + 3 write-ups. Weeks 2–6: 10 tailored applications per week, 3 referral requests per week, 2 mocks per week, track everything in a sheet (company, role, date, status, next step). Review conversion weekly and fix the weakest stage (no callbacks → resume; failing rounds → practise that round).`),
    ],
    quiz: [
      Q('Strongest resume bullet?', ['"Worked on data pipelines"', '"Built X with Y, achieving a measured result Z"', '"Familiar with Spark"', '"Hardworking team player"'], 1, 'Evidence over adjectives.'),
      Q('No interview callbacks after 40 applications. Fix first?', ['Practise DSA more', 'Resume, targeting and referrals', 'Stop applying', 'Change careers'], 1, 'The bottleneck is before interviews.'),
    ],
    practice: 'Write 3 resume bullets from your shipped builds and schedule weekly rotating mock interviews with the crew.',
    explain: 'Explain the job search as a funnel and how you’d find its biggest leak.',
  },

  // ───────── CAPSTONES TRACK ─────────
  'cap-fs': {
    intro: 'A complete full-stack product — the proof that you can ship end to end. This lesson explains each requirement; the build guides take you step by step.',
    concepts: [
      C('TypeScript front end + API', `React/Next.js with strict TypeScript on the front; a typed API (FastAPI with Pydantic or Node with zod) generating an OpenAPI spec and a typed client. See Front end → Next.js and Back end → REST.`, guide('fe-7', 'Production Next.js SaaS')),
      C('Postgres + Redis', `Postgres for core data with migrations and constraints; Redis for caching, sessions, rate limits and queues. Know why each exists in your design.`),
      C('Google login', `OAuth/OIDC via a managed provider or your own (Authorization Code + PKCE); authorisation checks on every resource.`, guide('be-3', 'Auth service done properly')),
      C('Docker Compose', `\`docker compose up\` starts front end, API, Postgres and Redis with healthchecks — any reviewer can run it in one command.`),
      C('CI/CD deploy', `GitHub Actions: lint, type check, tests (with a real DB), build images, deploy on merge, preview environments.`),
      C('README with architecture diagram', `Problem, demo link/GIF, diagram, how to run, key decisions, numbers, known limitations, what's next. This is what recruiters actually read.`,
        pick('What do reviewers look at first in a portfolio repo?', ['The commit count', false], ['The README: demo, diagram, how to run, decisions', true, 'Make the first screen count.'], ['The .gitignore', false])),
    ],
    quiz: [Q('A full-stack capstone should run with…', ['A 30-step manual setup', 'One command (docker compose up)', 'Only on your laptop', 'A paid service'], 1, 'Reviewers must be able to try it.')],
    practice: 'Pick your full-stack capstone idea and write its one-page design doc today.',
    explain: 'Explain your capstone’s architecture in 2 minutes using the diagram.',
  },

  'cap-db': {
    intro: 'Build a tiny database to understand what every database does underneath — a standout project for back-end and data roles.',
    concepts: [
      C('Key-value store in Python', `Start with GET/SET/DELETE over a simple protocol, an in-memory dict, and persistence to disk.`, guide('db-5', 'Key-value store from scratch')),
      C('Append-only log + index', `Writes append to a log file; an in-memory hash index maps keys to file offsets; compaction drops old values. (Bitcask design.)`),
      C('Write-ahead log & recovery', `Log every change before applying it; on restart, replay the log to restore state; checksums detect torn writes from crashes.`),
      C('Simple query parser', `Parse a tiny SQL-like language (\`SET k v\`, \`GET k\`, \`SCAN a z\`) with a tokenizer and a recursive-descent parser — the front door every database has.`,
        { code: `def parse(line):
    tok = line.strip().split(maxsplit=2)
    match tok:
        case ["GET", k]: return ("get", k)
        case ["SET", k, v]: return ("set", k, v)
        case ["DEL", k]: return ("del", k)
        case _: raise SyntaxError(f"bad command: {line!r}")`, lang: 'python' },
        pick('Why checksum each log record?', ['Compression', false], ['Detect partially written records after a crash', true, 'Skip torn writes safely during recovery.'], ['Encryption', false])),
    ],
    quiz: [Q('Bitcask finds a key’s value using…', ['A full file scan', 'An in-memory index of key → file offset', 'A B-tree on disk', 'SQL'], 1, 'Hash index into the log.')],
    practice: 'Follow the db-5 guide, then add the query parser and a SCAN with a sorted structure.',
    explain: 'Explain how your database survives a crash.',
  },

  'cap-batch': {
    intro: 'An end-to-end batch data platform on AWS — the most common data engineering job, as one project.',
    concepts: [
      C('Ingest a public dataset (e.g. data.gov.in) with dlt', `Pick a dataset that updates regularly; ingest incrementally with dlt (pagination, schema, state handled).`, guide('de-1', 'Idempotent Python ETL')),
      C('Land raw data in S3', `Bronze layer partitioned by ingest date, Parquet, versioning and lifecycle rules.`),
      C('Orchestrate with Airflow', `Daily DAG with logical dates, retries, backfills and alerts (MWAA, or Airflow in Docker on a small VM).`, guide('de-4', 'Orchestrated ELT')),
      C('Model with dbt into a warehouse', `Staging → marts with tests and docs in Redshift Serverless, Athena (dbt-athena) or BigQuery sandbox.`),
      C('Dashboard in Metabase', `One question-focused dashboard on the marts that a non-technical person can use.`),
      C('Infra in Terraform', `Buckets, IAM roles, Glue catalog, compute — all in Terraform with remote state; destroy and recreate to prove it.`,
        pick('Strongest proof your platform is reproducible?', ['Screenshots', false], ['terraform destroy, then apply, then the pipeline runs again', true, 'Rebuilt from code alone.'], ['A long README', false])),
    ],
    quiz: [Q('Which layer should hold data exactly as received?', ['Gold', 'Bronze/raw', 'Marts', 'Dashboard'], 1, 'Replayable raw data.')],
    practice: 'Choose your dataset and draw the cap-batch architecture with tool names on your board.',
    explain: 'Walk through your batch platform from source to dashboard in 3 minutes.',
  },

  'cap-stream': {
    intro: 'A live data pipeline: events in, dashboard updating in seconds.',
    concepts: [
      C('Live event source (e.g. Wikimedia recent-changes stream)', `A free, real, high-volume public stream (server-sent events) — perfect test data.`),
      C('Kafka', `Topic per event type, keyed by entity; KRaft in Docker; schema in a registry.`),
      C('Spark Structured Streaming', `Windowed aggregations with watermarks; checkpointing; handling late events.`, guide('de-7', 'Real-time CDC pipeline')),
      C('Store in Postgres / ClickHouse', `Upsert aggregates into Postgres for small scale, ClickHouse for high volume real-time analytics.`),
      C('Live dashboard', `Grafana or a small React page refreshing every few seconds; show end-to-end latency on the dashboard itself.`,
        pick('What number proves a streaming pipeline is "real-time"?', ['Topic count', false], ['Measured end-to-end latency from event to dashboard', true, 'Show it, don’t claim it.'], ['Lines of code', false])),
    ],
    quiz: [Q('Why checkpoint a streaming job?', ['Logging', 'Recover without loss or double counting after failure', 'Speed', 'Compression'], 1, 'State and offsets persist.')],
    practice: 'Read the Wikimedia stream with a Python SSE client and produce events into a local Kafka topic.',
    explain: 'Explain watermarks using the Wikimedia stream as the example.',
  },

  'cap-lake': {
    intro: 'A lakehouse over a large real dataset, tuned with measurements — shows you can handle scale.',
    concepts: [
      C('Large open dataset (e.g. NYC taxi trips)', `Hundreds of millions of rows across years with schema changes between years — realistic messiness.`),
      C('Spark + Iceberg/Delta', `Open table format for ACID writes, schema evolution, time travel and MERGE.`, guide('de-6', 'Spark lakehouse at scale')),
      C('Medallion layers', `Bronze (as received) → silver (clean, deduped, conformed) → gold (business aggregates).`),
      C('Performance tuning write-up', `Spark UI screenshots and a before/after table: partitions, shuffles, skew, file sizes, broadcast joins, compaction — with times and costs.`,
        pick('What makes a tuning write-up convincing?', ['Saying "it’s faster now"', false], ['Before/after numbers with Spark UI evidence and the reason for each change', true, 'Measured and explained.'], ['A long list of configs', false])),
    ],
    quiz: [Q('Which layer conforms schemas across years?', ['Bronze', 'Silver', 'Gold', 'None'], 1, 'Cleaning and conforming happen in silver.')],
    practice: 'Load one year of taxi data into bronze and write down three data problems you find.',
    explain: 'Explain one Spark optimisation you made and how you proved it helped.',
  },

  'cap-ai': {
    intro: 'A deployed AI product with evals — evidence that you can build AI systems properly, not just call an API.',
    concepts: [
      C('Ingestion pipeline for documents', `Parse → chunk → embed → index, incremental by content hash, with metadata for filtering and citations.`, guide('ai-5', 'RAG with evals')),
      C('Vector DB + hybrid search', `pgvector or Qdrant plus BM25, fused with RRF; a reranker on top.`),
      C('FastAPI + React streaming UI', `SSE streaming, citations, stop button, feedback buttons that feed your eval set.`),
      C('Evals & tracing', `A 50-question golden set (retrieval recall + answer faithfulness), run in CI; Langfuse traces for every production request.`),
      C('Deployed on cloud in Docker', `Containers on a cloud service (Cloud Run, App Runner, a VM) with secrets in a manager, rate limits and cost caps.`,
        pick('What separates a strong AI capstone from a weak one?', ['A fancier UI', false], ['Evals with numbers showing quality and how changes affected it', true, 'Measured quality is rare and valuable.'], ['Using the largest model', false])),
    ],
    quiz: [Q('Feedback buttons in the UI should feed…', ['Nothing', 'The eval set and error analysis', 'Marketing only', 'Logs to delete'], 1, 'Close the loop.')],
    practice: 'Write the 50-question golden set for your AI capstone before building anything else.',
    explain: 'Explain how you know your RAG app gives correct answers.',
  },

  'cap-dm': {
    intro: 'A real campaign for a real business, with honest numbers — the digital marketing equivalent of a deployed app.',
    concepts: [
      C('Pick a real local business or product', `A café, bakery, tuition centre, college club or a friend's product — someone who will let you run things and share results.`),
      C('Positioning & audience research', `Interviews, competitor teardown, personas and a positioning statement (see Digital marketing → foundations and brand).`),
      C('Content, social and email plan', `Pillars, 4-week calendar, created assets, an email/WhatsApp follow-up sequence.`),
      C('Small paid campaign with tracking', `Tracking first (GA4, Pixel, UTMs), then a small structured test, scaled on evidence.`),
      C('Results report with KPIs', `Baseline vs results, CAC/ROAS vs break-even, what worked and what didn't, and recommendations — written like a client report.`,
        pick('The campaign underperformed. Should it still go in your portfolio?', ['No, hide it', false], ['Yes — with honest numbers and what you learned and would change', true, 'Honest analysis shows judgement.'], ['Only if you change the numbers', false])),
    ],
    quiz: [Q('What must be set up before the first rupee of ad spend?', ['A logo', 'Conversion tracking', 'A podcast', 'Nothing'], 1, 'Otherwise results can’t be measured.')],
    practice: 'Approach one local business this week with a one-page proposal for a 4-week free campaign.',
    explain: 'Present your campaign results as if to the business owner in 3 minutes.',
  },

  'cap-cloud': {
    intro: 'Host a real app on AWS the professional way — networked, codified, monitored and costed.',
    concepts: [
      C('Host a real app on AWS', `Use your own full-stack or AI capstone so the infrastructure serves something real.`),
      C('VPC, compute, database and storage', `Public/private subnets in two AZs, load balancer, containers (ECS Fargate/App Runner), RDS in private subnets, S3 for files.`, guide('cl-3', 'Classic 3-tier app on AWS')),
      C('Infrastructure in Terraform', `Everything in modules with remote state; plan in PR, apply in CI.`),
      C('Monitoring & cost alerts', `CloudWatch dashboards and alarms on errors/latency, a budget alarm, cost allocation tags.`),
      C('Architecture diagram + write-up', `Diagram, decisions (why Fargate, why Multi-AZ or not), monthly cost estimate, security measures, and a DR test result.`,
        pick('Which detail impresses cloud interviewers most in a write-up?', ['The number of services used', false], ['Justified trade-offs plus a monthly cost estimate and a tested restore', true, 'Judgement and operational proof.'], ['Screenshots of the console', false])),
    ],
    quiz: [Q('Databases in a 3-tier VPC belong in…', ['Public subnets', 'Private subnets', 'The internet gateway', 'CloudFront'], 1, 'Never directly exposed.')],
    practice: 'Draw your cloud capstone architecture and estimate its monthly cost before building.',
    explain: 'Explain how a request travels from a user’s phone to your database and back.',
  },

  'cap-team': {
    intro: 'The capstone you build together: one product, three owners, one demo. It mirrors how real teams work.',
    concepts: [
      C('One shared repo, three owners', `A monorepo (or a few repos) with CODEOWNERS, PR reviews across owners, shared CI, a project board and weekly demos.`, guide('fl-1', 'Study Together v2')),
      C('Friend 1 owns ingestion & streaming', `Sources, Kafka/CDC, streaming jobs, data contracts with the app team.`),
      C('Friend 2 owns lakehouse & modeling', `Bronze/silver/gold, dbt models, quality checks, the semantic layer and dashboards.`),
      C('Friend 3 owns AI layer & product UI', `RAG/agents over the platform, evals, and the product front end people actually use.`),
      C('System design doc + demo video', `One design doc written together and reviewed; a 5-minute demo video where each owner explains their part and one trade-off.`,
        pick('Two owners disagree on the event schema. Best resolution?', ['Whoever codes first wins', false], ['Write a short decision record with options and trade-offs, decide together, then contract-test it', true, 'Explicit decisions and contracts prevent repeat fights.'], ['Each uses their own schema', false])),
    ],
    quiz: [Q('Interfaces between owners should be protected by…', ['Hope', 'Contracts and tests', 'Verbal agreements', 'Screenshots'], 1, 'Contracts make collaboration safe.')],
    practice: 'Decide owners for your team capstone and write the first version of the shared design doc together on a call.',
    explain: 'Explain your part of the team capstone and how it connects to the others.',
  },
}
