// Deeper material for Data engineering lessons.
// add: { 'Concept title': [extra blocks] }  ·  deeper: advanced sections (no roadmap tick)  ·  quiz: extra questions
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'de-found': {
    add: {
      'The data engineering lifecycle': [pick('Swiggy wants a dashboard of late deliveries per city every morning. Which stage is "Serve"?', ['Pulling order events from the app DB', false], ['The dashboard the ops team opens', true, 'Serve is where people or systems consume the data.'], ['Cleaning timestamps in SQL', false])],
      'Batch vs streaming': [{ cards: [['Daily sales report', 'Batch'], ['Card fraud check', 'Streaming'], ['ML model retraining', 'Batch'], ['Live order tracking map', 'Streaming'], ['Monthly payroll', 'Batch']] }],
    },
    deeper: [
      D('Deep dive: a day in the life of a data engineer', `What the job really looks like, so the lessons connect to real work:`,
        { steps: [['9:30 — check pipelines', 'Open the orchestrator: did last night’s DAGs succeed? Any freshness alerts?'], ['10:00 — fix a break', 'A source added a column and a load failed. Update staging, backfill the day.'], ['11:30 — stand-up', 'Agree priorities with analysts and product.'], ['12:00 — build', 'New ingestion for the payments API: design doc, then code, then tests.'], ['15:00 — review', 'Review a teammate’s dbt PR: tests? grain? naming?'], ['16:30 — cost & quality', 'Check warehouse spend; tune the most expensive query.'], ['17:30 — document', 'Update the catalog and runbook so on-call knows what to do.']] }),
    ],
    quiz: [Q('Which task is most typical of a data engineer?', ['Designing logos', 'Fixing a failed nightly pipeline and backfilling', 'Writing ad copy', 'Hiring'], 1, 'Reliability of pipelines is the core of the job.')],
  },

  'de-py': {
    add: {
      'pandas: load, clean, reshape, join, group': [pick('You merge orders (10k rows) with customers on customer_id and get 12k rows. What do you check first?', ['Memory', false], ['customers.customer_id.duplicated().sum()', true, 'Duplicate keys on the right side multiply rows.'], ['The CSV encoding', false])],
      'File formats: CSV, JSON, Parquet, Avro': [{ cards: [['CSV', 'Human-readable, no types, slow.'], ['JSON', 'Nested, verbose, API-friendly.'], ['Parquet', 'Columnar, compressed, analytics default.'], ['Avro', 'Row-based with schema; Kafka’s favourite.']] }],
    },
    deeper: [
      D('Deep dive: memory, chunking and when pandas breaks', `pandas loads everything into RAM, often using 5–10× the file size. A 2 GB CSV can need 10–20 GB.

- Read only needed columns: \`usecols=[...]\`, set \`dtype\` (category for repeated strings).
- Stream big files in chunks.
- Or switch tool: Polars/DuckDB handle larger-than-RAM data far better.`,
        { code: `totals = {}
for chunk in pd.read_csv("big.csv", usecols=["city", "amount"], chunksize=500_000):
    for city, s in chunk.groupby("city")["amount"].sum().items():
        totals[city] = totals.get(city, 0) + s
# or simply: duckdb.sql("SELECT city, SUM(amount) FROM 'big.csv' GROUP BY 1")`, lang: 'python' }),
    ],
    quiz: [Q('A 3 GB CSV crashes pandas on a 16 GB laptop. Best fix?', ['Buy RAM', 'Use DuckDB/Polars or read in chunks with only needed columns', 'Convert to Excel', 'Use JSON'], 1, 'Avoid loading everything at once.')],
  },

  'de-pyeng': {
    add: { 'Testing with pytest & fixtures': [{ steps: [['Unit tests', 'Pure functions: transform, dedupe, parse. Fast, many.'], ['Integration tests', 'Real Postgres in Docker; does the upsert work?'], ['Data tests', 'dbt/GE checks on real outputs.'], ['End-to-end', 'Run the pipeline for one day on sample data in CI.']] }] },
    deeper: [
      D('Deep dive: a production-ready pipeline repo', `What reviewers look for in a DE repo:`,
        { cards: [['Makefile / task runner', 'make setup, make test, make run DAY=…'], ['CI', 'Lint, type check, tests on every PR.'], ['Config', '.env.example, pydantic settings, no secrets.'], ['Observability', 'Structured logs with row counts and durations.'], ['Docs', 'README, design doc, runbook for failures.'], ['Idempotency test', 'Re-run the same day; counts unchanged.']] }),
    ],
    quiz: [Q('Which test type uses a real Postgres in Docker?', ['Unit', 'Integration', 'Lint', 'Type check'], 1, 'Integration tests touch real dependencies.')],
  },

  'de-files': {
    add: { 'Partitioning layouts & the small-files problem': [pick('Daily data is 50 MB. Partition by hour or by day?', ['Hour — more partitions is always better', false], ['Day (or even month) — hourly would create tiny ~2 MB files', true, 'Aim for files of 100 MB+; over-partitioning hurts.'], ['By user_id', false])] },
    deeper: [
      D('Deep dive: compaction and table formats', `Streaming and frequent small loads create many tiny files. **Compaction** rewrites them into fewer large files on a schedule. Table formats automate this: Delta \`OPTIMIZE\`, Iceberg \`rewrite_data_files\`, plus **Z-ordering / clustering** to co-locate related rows so filters skip more data.`,
        { flow: ['10,000 × 1 MB files', 'Compaction job', '40 × 250 MB files', 'Queries 10× faster to plan and read'] }),
    ],
    quiz: [Q('What does compaction do?', ['Deletes data', 'Rewrites many small files into fewer large ones', 'Encrypts files', 'Adds partitions'], 1, 'Fixes the small-files problem.')],
  },

  'de-model': {
    add: {
      'Business processes, grain, facts & dimensions': [pick('Grain for an e-commerce sales fact: which is most flexible?', ['One row per day', false], ['One row per order line (product within an order)', true, 'The lowest grain can always be rolled up; you cannot drill below your grain.'], ['One row per customer', false])],
      'Slowly changing dimensions (type 1, 2, 3)': [{ steps: [['Change detected', 'Customer C7 city changed in the source.'], ['Expire old row', 'Set valid_to = yesterday, is_current = false.'], ['Insert new row', 'New surrogate key, valid_from = today, is_current = true.'], ['Facts join by key', 'Old orders keep old key → old city; new orders get the new key.']] }],
    },
    deeper: [
      D('Deep dive: modelling Swiggy in an interview', `A worked answer to "design the warehouse for a food delivery app":`,
        { arch: [['Facts', ['fct_order_line (grain: item in order)', 'fct_delivery (accumulating: placed → picked → delivered)', 'fct_rider_shift (periodic)']], ['Conformed dimensions', ['dim_date', 'dim_customer (SCD2)', 'dim_restaurant (SCD2)', 'dim_rider', 'dim_location']]] },
        { note: 'Then name 3 questions it answers: late-delivery rate by zone and hour; repeat-order rate by cohort; restaurant prep time trend.' }),
    ],
    quiz: [Q('An order’s lifecycle with timestamps for each step fits which fact type?', ['Transaction', 'Accumulating snapshot', 'Periodic snapshot', 'Factless'], 1, 'One row updated as the process advances.')],
  },

  'de-dwh': {
    add: { 'Query cost & optimisation': [pick('A dashboard runs a 2 TB scan every 5 minutes. Best fix?', ['Run it every minute', false], ['Build a small pre-aggregated table refreshed on schedule and point the dashboard at it', true, 'Serve dashboards from small gold tables.'], ['Add SELECT *', false])] },
    deeper: [
      D('Deep dive: how a warehouse query actually runs', `Knowing the steps tells you where time and money go:`,
        { steps: [['Parse & plan', 'SQL becomes a plan; the optimizer pushes filters down.'], ['Prune', 'Partition and cluster metadata skip files/blocks.'], ['Scan', 'Workers read only the needed columns in parallel.'], ['Shuffle', 'Joins and GROUP BY redistribute data by key — the expensive part.'], ['Aggregate & return', 'Partial results merged and returned.']] },
        { note: 'Read the query plan / execution details in BigQuery or Snowflake: bytes scanned, slot time, and which stage dominated.' }),
    ],
    quiz: [Q('The most expensive step in most big warehouse queries is usually…', ['Parsing', 'Shuffling data for joins and aggregations', 'Returning results', 'Authentication'], 1, 'Data movement between workers dominates.')],
  },

  'de-ingest': {
    add: { 'Idempotent, re-runnable pipelines': [{ steps: [['Run 1', 'Loads 4,120 rows for 2026-11-26.'], ['Crash halfway on run 2', 'Some rows updated, some not.'], ['Run 3 (retry)', 'Upsert on the key overwrites the same rows.'], ['Result', 'Still exactly 4,120 rows — idempotent.']] }] },
    deeper: [
      D('Deep dive: exactly how to handle deletes', `Watermark-based incremental loads miss deletes. Options, from simplest:`,
        { cards: [['Soft deletes', 'Source sets is_deleted = true; you load it like any update.'], ['Periodic full reconcile', 'Weekly full key list; anything missing is marked deleted.'], ['CDC', 'Delete events come from the database log.'], ['Snapshots + diff', 'Compare today’s snapshot to yesterday’s.']] }),
    ],
    quiz: [Q('Cheapest reliable way to catch hard deletes without CDC?', ['Ignore them', 'Periodic full key reconciliation', 'Bigger watermark', 'Streaming'], 1, 'Compare full key sets on a schedule.')],
  },

  'de-orch': {
    add: { 'Scheduling, catchup & backfills': [pick('Your task uses datetime.now() to choose the day. You backfill September. What happens?', ['September is processed', false], ['Every run processes today, not September', true, 'Use the logical date (ds/data_interval_start).'], ['Airflow fixes it', false])] },
    deeper: [
      D('Deep dive: designing a good DAG', `Principles that keep DAGs maintainable:`,
        { cards: [['Atomic tasks', 'Each task does one thing and can be retried alone.'], ['Idempotent tasks', 'Re-running a task for a date is safe.'], ['No heavy work in the scheduler', 'Push compute to warehouses/Spark; Airflow orchestrates.'], ['Pointers, not data', 'Pass paths/table names via XCom.'], ['Dataset-aware', 'Trigger downstream DAGs when upstream data lands (Datasets/assets).']] }),
    ],
    quiz: [Q('Airflow workers should mainly…', ['Process terabytes in Python', 'Orchestrate and trigger compute elsewhere', 'Store data', 'Serve dashboards'], 1, 'Keep heavy compute in engines built for it.')],
  },

  'de-dbt': {
    add: { 'Staging → intermediate → marts': [{ arch: [['Sources', ['raw.orders', 'raw.customers', 'raw.payments']], ['Staging (1:1, clean)', ['stg_orders', 'stg_customers', 'stg_payments']], ['Intermediate (logic)', ['int_orders_with_payments']], ['Marts (for people)', ['fct_orders', 'dim_customers']]] }] },
    deeper: [
      D('Deep dive: dbt in a team', `- **Environments**: dev schema per developer, CI schema per PR, prod.
- **Slim CI**: build only changed models and their children.
- **Contracts & versions** on public models so downstream teams don’t break.
- **Exposures** document which dashboards depend on which models.
- **Code review** checklist: grain stated, tests on keys, no hard-coded tables, docs updated.`),
    ],
    quiz: [Q('dbt exposures are used to…', ['Speed up models', 'Document downstream uses like dashboards', 'Encrypt data', 'Schedule runs'], 1, 'They show what depends on your models.')],
  },

  'de-quality': {
    add: { 'Freshness & volume checks': [pick('Every row passes tests, but the orders table has not updated since yesterday 6 a.m. Which check catches it?', ['unique', false], ['Freshness', true, 'Stale data is invisible to row-level tests.'], ['not_null', false])] },
    deeper: [
      D('Deep dive: what to do when a check fails', `A quality alert needs a response plan, not just a red light:`,
        { steps: [['Triage', 'Is it real? Which tables and dashboards are affected (lineage)?'], ['Contain', 'Stop downstream publishes or show a "data delayed" banner.'], ['Communicate', 'Tell consumers what is wrong and when it will be fixed.'], ['Fix & backfill', 'Correct the cause, re-run affected dates.'], ['Prevent', 'Add a test or contract so it can’t recur; write a short postmortem.']] }),
    ],
    quiz: [Q('First step after a data quality alert?', ['Delete the table', 'Triage impact using lineage', 'Ignore until next week', 'Rewrite the pipeline'], 1, 'Understand scope before acting.')],
  },

  'de-patterns': {
    add: { 'Deduplication & late-arriving data': [{ steps: [['Run for 26 Nov', 'Process 24–26 Nov (3-day lookback).'], ['Late event arrives', 'An order from 25 Nov lands on 27 Nov.'], ['Run for 27 Nov', 'Reprocesses 25–27 Nov, including the late event.'], ['MERGE on key', 'No duplicates; totals for 25 Nov corrected.']] }] },
    deeper: [
      D('Deep dive: the write-audit-publish pattern', `Never let consumers see unchecked data:`,
        { flow: ['Write to a staging branch/table', 'Audit: run quality checks', 'Publish: atomically swap or merge into prod', 'Fail? Prod untouched, alert raised'] },
        { note: 'Iceberg branches, Delta clones, or a simple staging table + swap all implement it.' }),
    ],
    quiz: [Q('Write-audit-publish ensures…', ['Faster writes', 'Consumers only ever see validated data', 'Less storage', 'No schemas'], 1, 'Audit before publish.')],
  },

  'de-spark': {
    add: { 'Partitions, shuffles & the DAG': [{ steps: [['Read', '200 partitions of trips read in parallel.'], ['Narrow ops', 'filter, select, withColumn — no data movement.'], ['Wide op', 'groupBy zone → shuffle: rows with the same zone move to the same executor.'], ['New stage', 'Aggregation happens after the shuffle boundary.'], ['Write', 'Results written; check shuffle bytes in the Spark UI.']] }] },
    deeper: [
      D('Deep dive: fixing a skewed join, step by step', `Symptom: one task runs 30× longer than the rest. Diagnosis and fixes:`,
        { steps: [['Confirm', 'Spark UI: max task duration ≫ median, one task with huge shuffle read.'], ['Find the key', 'df.groupBy("city").count().orderBy(desc("count")) → "unknown" has 40% of rows.'], ['Try AQE', 'spark.sql.adaptive.skewJoin.enabled = true splits skewed partitions.'], ['Split the hot key', 'Process "unknown" separately (or filter it if invalid).'], ['Salting', 'Add a random 0–9 suffix to the hot key on the big side, replicate the small side 10×, join on (key, salt).']] }),
    ],
    quiz: [Q('Salting a join key helps with…', ['Encryption', 'Spreading a skewed key across many partitions', 'Schema evolution', 'Caching'], 1, 'It breaks one huge partition into many.')],
  },

  'de-lake': {
    add: { 'Delta Lake & Apache Iceberg': [{ steps: [['Write data files', 'New Parquet files are written, invisible to readers.'], ['Commit', 'A new version entry is added to the transaction log/metadata atomically.'], ['Readers', 'Read the latest committed version — never half a write.'], ['Time travel', 'Older versions remain readable until cleaned up (VACUUM / expire snapshots).']] }] },
    deeper: [
      D('Deep dive: MERGE on a lakehouse', `Upserts on files used to be painful; table formats make them one statement — and record every change.`,
        { code: `MERGE INTO silver.orders t
USING bronze_updates s ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
DESCRIBE HISTORY silver.orders;   -- every version and operation`, lang: 'sql' }),
    ],
    quiz: [Q('Why can readers never see a half-written Delta/Iceberg table?', ['Files are tiny', 'Commits are atomic in the transaction log', 'Writes are slow', 'Readers are blocked'], 1, 'Only committed versions are visible.')],
  },

  'de-azure': {
    add: { 'Azure Data Factory pipelines': [pick('ADF must load each day’s files and support re-runs of any date. Key design choice?', ['Hard-code today’s date', false], ['Parameterise the pipeline with a date and pass it from the trigger', true, 'Same idea as Airflow’s logical date.'], ['Copy everything every day', false])] },
    deeper: [
      D('Deep dive: a typical Azure medallion project', `What interviewers at Azure shops expect you to describe:`,
        { arch: [['Ingest', ['ADF copy (SQL DB, APIs) → ADLS bronze']], ['Transform', ['Databricks notebooks/jobs → silver Delta', 'dbt or notebooks → gold']], ['Serve', ['Databricks SQL / Fabric warehouse', 'Power BI']], ['Govern & secure', ['Unity Catalog', 'Key Vault secrets', 'Entra ID groups']]] }),
    ],
    quiz: [Q('Where should ADF/Databricks secrets live on Azure?', ['Notebook code', 'Azure Key Vault', 'Pipeline names', 'Blob metadata'], 1, 'Key Vault is the secret store.')],
  },

  'de-stream': {
    add: { 'Windows & watermarks': [{ steps: [['Events arrive', '12:00:10, 12:00:40, 12:01:05 …'], ['Tumbling 1-min windows', '[12:00, 12:01) and [12:01, 12:02).'], ['Watermark = max event time − 2 min', 'At 12:03:30 seen, watermark is 12:01:30.'], ['Window [12:00,12:01) closes', 'Result emitted.'], ['Late event 12:00:50 arrives at 12:04', 'Behind the watermark → dropped or sent to a late-data path.']] }] },
    deeper: [
      D('Deep dive: Kappa vs Lambda architecture', `- **Lambda** — separate batch and streaming paths, merged at serving. Accurate but two codebases.
- **Kappa** — one streaming path; reprocess history by replaying the log (Kafka retention or lakehouse).
Most modern stacks lean Kappa-ish with a lakehouse for history.`, { flow: ['Events', 'Stream processor', 'Lakehouse tables', 'Real-time + historical queries'] }),
    ],
    quiz: [Q('Kappa architecture reprocesses history by…', ['A separate batch codebase', 'Replaying the event log through the same stream job', 'Manual SQL', 'Deleting data'], 1, 'One code path.')],
  },

  'de-kafka': {
    add: { 'Topics, partitions, offsets': [pick('You need 12 consumers processing a topic in parallel. Minimum partitions?', ['3', false], ['12', true, 'One partition is read by one consumer per group; more consumers than partitions sit idle.'], ['1', false])] },
    deeper: [
      D('Deep dive: choosing partitions and keys', `- Partitions cap consumer parallelism — plan for peak throughput (you can add partitions later, but key→partition mapping changes).
- A key with huge volume (one giant customer) creates a **hot partition**.
- Replication factor 3 and min.insync.replicas 2 for durability.
- Retention by time or size; **compacted topics** keep only the latest value per key (great for state/changelogs).`),
    ],
    quiz: [Q('A compacted topic keeps…', ['All messages forever', 'The latest value per key', 'Only the first message', 'Nothing'], 1, 'Useful for current-state changelogs.')],
  },

  'de-sproc': {
    add: { 'Change data capture with Debezium': [{ cards: [['op: c', 'Create (insert) — "after" holds the new row.'], ['op: u', 'Update — "before" and "after" rows.'], ['op: d', 'Delete — "before" holds the deleted row.'], ['op: r', 'Read — rows from the initial snapshot.']] }] },
    deeper: [
      D('Deep dive: the outbox pattern', `Writing to your database **and** publishing an event can’t be one transaction across two systems. The **outbox** fixes it: write the business row and an "event" row in the same DB transaction; Debezium streams the outbox table to Kafka. No lost or phantom events.`,
        { flow: ['BEGIN', 'INSERT order', 'INSERT outbox event', 'COMMIT', 'Debezium → Kafka topic'] }),
    ],
    quiz: [Q('The outbox pattern guarantees…', ['Faster queries', 'Database change and event publish are consistent', 'No Kafka needed', 'Smaller events'], 1, 'Both happen in one DB transaction.')],
  },

  'de-gov': {
    add: { 'PII, masking, access control': [pick('Analysts need to count unique customers but must not see emails. Best approach?', ['Give raw table access', false], ['Expose a hashed email (or surrogate key) in the analytics layer', true, 'Countable and joinable, not readable.'], ['Delete emails everywhere', false])] },
    deeper: [
      D('Deep dive: data mesh in one minute', `In large companies, a central data team becomes a bottleneck. **Data mesh** gives domains (payments, delivery, marketing) ownership of their data **as products**, on a shared self-serve platform, with federated governance (common standards, contracts, catalog). It is an organisational pattern more than a tool.`),
    ],
    quiz: [Q('Data mesh mainly changes…', ['File formats', 'Who owns data products — domain teams', 'SQL syntax', 'Cloud vendor'], 1, 'Ownership and organisation.')],
  },

  'de-bi': {
    add: { 'Metabase / Superset dashboards': [{ cards: [['One question per dashboard', '"Are weekday orders growing?"'], ['Trend, not just today', 'Line over weeks with last year for context.'], ['Definitions visible', 'What counts as an order? Show it.'], ['Fast', 'Pre-aggregated gold tables, < 5 s.'], ['Owner', 'Who to ask when numbers look wrong.']] }] },
    deeper: [
      D('Deep dive: designing metrics people trust', `Write a metric spec before building: name, business question, exact formula, filters (exclude test orders, cancelled), grain, owner, refresh time, known caveats. Put it in the semantic layer and link it from the dashboard. Disagreements about numbers usually turn out to be definition differences.`),
    ],
    quiz: [Q('Two teams report different "active users". Most likely cause?', ['A bug in SQL engines', 'Different metric definitions', 'Time zones only', 'Caching'], 1, 'Define metrics once.')],
  },

  'de-interview': {
    add: { 'Pipeline design round': [{ steps: [['Clarify (3 min)', 'Sources, volume, latency, consumers, SLAs.'], ['Estimate (2 min)', '5M events/day ≈ 60/s avg, 300/s peak.'], ['High-level design (10 min)', 'Ingest → store layers → transform → serve; draw it.'], ['Deep dive (15 min)', 'Idempotency, late data, schema changes, backfills.'], ['Operate (5 min)', 'Monitoring, data quality, cost, on-call.'], ['Trade-offs (5 min)', 'What you’d change at 10× or with a smaller budget.']] }] },
    deeper: [
      D('Deep dive: questions to ask them at the end', `Good questions show seniority and help you choose well:

- "What does the data stack look like, and what would you change if you could?"
- "How do you handle data quality incidents — is there on-call?"
- "What would success look like for this role in 6 months?"
- "How do data engineers work with analysts and product here?"`),
    ],
    quiz: [Q('In a design round, when should you give estimates?', ['Never', 'Early, after clarifying requirements', 'Only if asked', 'At the very end'], 1, 'Numbers shape the design.')],
  },
}
