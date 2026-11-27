// Data engineering — lessons 15–20: streaming, Kafka, stream processing, governance, BI, interviews
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })

export default {
  'de-stream': {
    intro: 'Streaming means data never "finishes". These four ideas are what make streaming hard — and what interviewers test.',
    concepts: [
      C('Events, event time vs processing time', `An **event** is a fact that happened: "order 42 paid at 13:02:05". It has two times:

- **Event time** — when it actually happened (on the phone).
- **Processing time** — when your system sees it.

A phone in a lift sends its 13:02 event at 13:09. If you group by processing time, that payment lands in the wrong minute. Correct analytics use event time.`,
        { table: { cols: ['Event', 'Event time', 'Processing time'], rows: [
          ['order 41 paid', '13:01:58', '13:02:00'],
          ['order 42 paid', '13:02:05', '13:09:12 (late)'],
          ['order 43 paid', '13:03:10', '13:03:11'] ] } }),
      C('Windows & watermarks', `**Windows** group an endless stream into finite chunks:

- **Tumbling** — fixed, non-overlapping (every 1 minute).
- **Sliding / hopping** — overlapping (5-minute window every 1 minute).
- **Session** — closes after a gap of inactivity (a user's visit).

A **watermark** says "I believe all events up to time T have arrived". It decides when a window can close, and how long to wait for late data.`,
        { flow: ['Events stream in', 'Assign to window by event time', 'Watermark passes window end', 'Emit result', 'Later events: drop or update'] },
        { note: 'Trade-off: a long watermark delay = more correct but slower results; a short one = faster but drops more late data.' }),
      C('Delivery guarantees', `- **At-most-once** — may lose messages, never duplicates.
- **At-least-once** — never loses, may duplicate. Most common.
- **Exactly-once** — each message affects the result once. Achieved by combining at-least-once delivery with idempotent or transactional writes.`,
        { note: 'Senior answer: "true exactly-once end to end is rare; we use at-least-once with idempotent sinks keyed by event ID". That shows you understand the cost.' }),
      C('Stateful processing', `Counting, deduplicating, joining streams and windows all need the processor to **remember** things between events — that memory is **state**. State must be checkpointed to durable storage so a crash can resume without losing or double-counting, and it must be bounded (e.g. by watermarks/TTL) or it grows forever.`),
    ],
    quiz: [
      Q('A late payment should be counted in the minute it actually happened. Group by…', ['Processing time', 'Event time', 'Kafka offset', 'Load time'], 1, 'Event time reflects reality.'),
      Q('A watermark mainly decides…', ['Which topic to read', 'When a window can be closed', 'The partition count', 'Encryption'], 1, 'It tracks event-time progress.'),
      Q('Most common practical guarantee?', ['At-most-once', 'At-least-once with idempotent writes', 'No guarantee', 'Exactly-once everywhere for free'], 1, 'Cheap and correct when sinks dedupe.'),
      Q('Grouping a user’s clicks until 30 minutes of inactivity uses a…', ['Tumbling window', 'Sliding window', 'Session window', 'Global window'], 2, 'Sessions end after a gap.'),
    ],
    practice: 'On paper: given 10 events with event and processing times, assign them to 1-minute tumbling windows by each time and see which results differ.',
    explain: 'Explain event time vs processing time with WhatsApp messages sent from a phone with no signal.',
  },

  'de-kafka': {
    intro: 'Kafka is the backbone of most streaming systems: a durable, ordered, replayable log of events.',
    concepts: [
      C('Topics, partitions, offsets', `A **topic** is a named stream ("orders"). It is split into **partitions** for parallelism; each partition is an append-only log. Every message has an **offset** — its position in that partition. Messages are kept for a retention period and can be re-read.`,
        { table: { cols: ['Partition', 'Offsets'], rows: [
          ['orders-0', '0 · 1 · 2 · 3 · 4 →'],
          ['orders-1', '0 · 1 · 2 →'],
          ['orders-2', '0 · 1 · 2 · 3 →'] ] } },
        { note: 'Ordering is guaranteed only within a partition, not across the topic.' }),
      C('Producers: keys, acks, idempotence', `- The **key** decides the partition (hash of key). Same key → same partition → ordered. Use order_id or user_id as key.
- **acks=all** — the write is confirmed only when replicas have it. Safest.
- **enable.idempotence=true** — retries never create duplicates in the log.`,
        { code: `from confluent_kafka import Producer
import json
p = Producer({"bootstrap.servers": "localhost:9092", "acks": "all", "enable.idempotence": True})
p.produce("orders", key="order-42", value=json.dumps({"id": 42, "amount": 450}))
p.flush()`, lang: 'python' }),
      C('Consumers & consumer groups', `Consumers in the same **group** share the partitions: each partition is read by exactly one consumer in the group. Add consumers to scale — up to the number of partitions. Different groups each get every message (e.g. analytics and fraud both read orders).`,
        { flow: ['Topic: 4 partitions', 'Group "analytics": 2 consumers × 2 partitions', 'Group "fraud": 4 consumers × 1 partition'] },
        { code: `from confluent_kafka import Consumer
c = Consumer({"bootstrap.servers": "localhost:9092", "group.id": "analytics",
              "auto.offset.reset": "earliest", "enable.auto.commit": False})
c.subscribe(["orders"])
while True:
    m = c.poll(1.0)
    if m is None or m.error(): continue
    handle(m.value())
    c.commit(m)              # commit AFTER processing = at-least-once`, lang: 'python' }),
      C('Delivery semantics', `Where you commit the offset decides the guarantee:

- Commit **before** processing → at-most-once (a crash loses the message).
- Commit **after** processing → at-least-once (a crash re-processes it).
- Kafka **transactions** (read-process-write within Kafka) → exactly-once inside Kafka.`),
      C('Schema Registry with Avro / Protobuf', `Producers and consumers must agree on message format. A **Schema Registry** stores versioned schemas and enforces **compatibility** rules (e.g. backward compatible: new fields must have defaults), so a producer cannot break consumers by changing the shape.`,
        { code: `{
  "type": "record", "name": "Order",
  "fields": [
    {"name": "id", "type": "long"},
    {"name": "amount", "type": "double"},
    {"name": "coupon", "type": ["null", "string"], "default": null}
  ]
}`, lang: 'json' }),
      C('Kafka Connect', `A framework of ready-made **connectors** that move data between Kafka and other systems without writing code: **source** connectors (Postgres via Debezium, S3, JDBC) and **sink** connectors (S3, ClickHouse, Elasticsearch, Snowflake). You configure them with JSON.`),
      C('Running Kafka locally (KRaft)', `Modern Kafka runs without ZooKeeper (**KRaft** mode). The easiest start is one Docker container.`,
        { code: `docker run -d --name kafka -p 9092:9092 apache/kafka:latest

# create a topic and try it
docker exec -it kafka /opt/kafka/bin/kafka-topics.sh --create --topic orders --partitions 3 --bootstrap-server localhost:9092
docker exec -it kafka /opt/kafka/bin/kafka-console-producer.sh --topic orders --bootstrap-server localhost:9092
docker exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh --topic orders --from-beginning --bootstrap-server localhost:9092`, lang: 'bash' },
        { note: 'Python client: `pip install confluent-kafka`. For a UI, add the free Redpanda Console or Kafka UI container.' }),
    ],
    quiz: [
      Q('Kafka guarantees order…', ['Across the whole topic', 'Within a partition', 'Never', 'Only with one consumer'], 1, 'Each partition is an ordered log.'),
      Q('All events for one order must stay in order. Producer should…', ['Use random partitioning', 'Use order_id as the key', 'Use one consumer', 'Disable acks'], 1, 'Same key → same partition.'),
      Q('A topic has 6 partitions and your group has 8 consumers. Result?', ['All 8 busy', '6 busy, 2 idle', 'Error', 'Messages duplicated'], 1, 'One partition per consumer in a group.'),
      Q('Commit offset after processing gives…', ['At-most-once', 'At-least-once', 'Exactly-once', 'No delivery'], 1, 'A crash causes reprocessing, not loss.'),
      Q('Schema Registry mainly prevents…', ['Slow consumers', 'Producers breaking consumers with incompatible message changes', 'Disk full', 'Network partitions'], 1, 'Compatibility checks on schema changes.'),
    ],
    practice: 'Run Kafka in Docker, write a Python producer that sends 1,000 fake orders keyed by customer, and two consumer groups that each count them.',
    explain: 'Explain partitions and consumer groups using billing counters at a supermarket.',
  },

  'de-sproc': {
    intro: 'Turning a stream of events into live tables and dashboards — and capturing every database change as an event.',
    concepts: [
      C('Spark Structured Streaming', `Treats a stream as an **unbounded table** that grows. You write normal DataFrame code; Spark runs it in micro-batches, with checkpoints for recovery.`,
        { code: `from pyspark.sql.functions import from_json, window, col
orders = (spark.readStream.format("kafka")
  .option("kafka.bootstrap.servers", "localhost:9092").option("subscribe", "orders").load()
  .select(from_json(col("value").cast("string"), "id LONG, amount DOUBLE, ts TIMESTAMP").alias("o")).select("o.*"))

per_min = (orders.withWatermark("ts", "5 minutes")
  .groupBy(window("ts", "1 minute")).sum("amount"))

(per_min.writeStream.outputMode("update").format("console")
  .option("checkpointLocation", "chk/per_min").start().awaitTermination())`, lang: 'python' },
        { note: 'Run it: needs the Kafka package — `spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1 job.py` (match your Spark version).' }),
      C('Flink (intro)', `**Apache Flink** processes events one at a time (true streaming, not micro-batches) with very low latency and powerful state and event-time handling. It is the leading choice for large real-time systems; Spark Streaming is often enough and simpler if you already use Spark.`,
        { table: { cols: ['', 'Spark Structured Streaming', 'Flink'], rows: [
          ['Model', 'Micro-batch', 'Event-at-a-time'],
          ['Latency', 'Seconds', 'Milliseconds'],
          ['Learning curve', 'Lower if you know Spark', 'Higher'],
          ['Python', 'PySpark', 'PyFlink / Flink SQL'] ] } }),
      C('Change data capture with Debezium', `**Debezium** reads a database's change log (Postgres WAL, MySQL binlog) and publishes every insert, update and delete to Kafka as an event — without touching application code and without heavy queries on the database.`,
        { flow: ['App writes to Postgres', 'WAL records change', 'Debezium (Kafka Connect)', 'Kafka topic per table', 'Consumers / lakehouse'] },
        { code: `{
  "name": "shop-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "db", "database.port": "5432",
    "database.user": "postgres", "database.password": "etl", "database.dbname": "shop",
    "topic.prefix": "shop", "plugin.name": "pgoutput", "table.include.list": "public.orders"
  }
}`, lang: 'json' },
        { note: 'Postgres needs `wal_level=logical`. Debezium’s official Docker tutorial runs the whole stack with one compose file.' }),
      C('Streaming into a lakehouse', `Write the stream into Delta or Iceberg tables so the same data serves real-time and historical queries. Watch out for the **small-files problem** (each micro-batch writes files) — run periodic **compaction** (OPTIMIZE) and choose a sensible trigger interval.`,
        { code: `(orders.writeStream.format("delta")
   .option("checkpointLocation", "chk/bronze_orders")
   .trigger(processingTime="1 minute")
   .start("lake/bronze/orders"))`, lang: 'python' }),
    ],
    quiz: [
      Q('Why does a streaming query need a checkpoint location?', ['For logs', 'To resume after failure without loss or duplication', 'For speed', 'To store the schema registry'], 1, 'Offsets and state are saved there.'),
      Q('Debezium captures changes by…', ['Polling tables every minute', 'Reading the database’s change log (WAL/binlog)', 'Triggers in the app', 'Comparing snapshots'], 1, 'Log-based CDC.'),
      Q('Streaming many micro-batches into Delta causes…', ['Faster reads', 'Small files that need compaction', 'Data loss', 'Schema drift'], 1, 'Each batch writes files; compact them.'),
    ],
    practice: 'Follow the Debezium Postgres tutorial (Docker), insert and update rows, and watch the change events in a Kafka console consumer.',
    explain: 'Explain CDC as a CCTV recording of a shop’s register, compared with counting the cash once a day.',
  },

  'de-gov': {
    intro: 'As data grows, people need to find it, trust it, and be allowed to use it — safely. That is governance and DataOps.',
    concepts: [
      C('Catalogs & lineage (OpenLineage)', `A **data catalog** is a searchable inventory: what tables exist, who owns them, what columns mean. **Lineage** shows where each table came from and what depends on it. **OpenLineage** is an open standard that Airflow, Spark and dbt can emit, so lineage is captured automatically.`,
        { flow: ['raw.orders', 'stg_orders', 'fct_daily_revenue', 'Revenue dashboard'] },
        { note: 'Free tools to try: DataHub or OpenMetadata (catalog), Marquez (OpenLineage backend). dbt docs gives you lineage for free.' }),
      C('PII, masking, access control', `**PII** (personally identifiable information) — names, phones, emails, Aadhaar, addresses — must be protected by law (India's DPDP Act 2023) and by common sense.

- Collect and keep only what you need.
- **Mask** or **hash** PII in analytics layers (show 98xxxxxx21).
- Restrict raw PII columns to a few roles.
- Log who accessed sensitive data.`,
        { code: `CREATE VIEW marts.customers AS
SELECT customer_key,
       city,
       SHA256(email) AS email_hash,                         -- joinable, not readable
       CONCAT(SUBSTR(phone, 1, 2), 'xxxxxx', SUBSTR(phone, -2)) AS phone_masked
FROM silver.customers;`, lang: 'sql' }),
      C('Data observability', `Monitoring for data, the way you monitor apps: track **freshness, volume, schema, distribution and lineage** for important tables, alert on anomalies, and see which downstream dashboards are affected when something breaks.`,
        { table: { cols: ['Pillar', 'Question'], rows: [
          ['Freshness', 'Did it update on time?'],
          ['Volume', 'Is the row count normal?'],
          ['Schema', 'Did columns change?'],
          ['Distribution', 'Are values in the usual range? Null rate?'],
          ['Lineage', 'What breaks downstream?'] ] } }),
      C('CI/CD for data pipelines', `Treat pipelines like software:

- Every PR runs lint, unit tests and **dbt build on a sample/dev schema**.
- **Slim CI**: only build models changed in the PR and their children (\`dbt build --select state:modified+\`).
- Deploy to prod on merge; keep dev, staging and prod separate.
- Review data diffs (row counts, key metrics) before merging changes to important models.`,
        { code: `# .github/workflows/dbt.yml (core steps)
- run: pip install dbt-duckdb
- run: dbt deps
- run: dbt build --target ci --select state:modified+ --state ./prod-manifest`, lang: 'yaml' }),
    ],
    quiz: [
      Q('Lineage answers…', ['Who is online', 'Where data came from and what depends on it', 'Query cost', 'Encryption keys'], 1, 'Upstream and downstream dependencies.'),
      Q('Best way to let analysts join on email without seeing it?', ['Give raw access', 'Hash the email in the analytics layer', 'Delete emails', 'Store in a CSV'], 1, 'Hashes are joinable but not readable.'),
      Q('dbt "slim CI" builds…', ['Everything', 'Only modified models and their children', 'Only tests', 'Only seeds'], 1, 'Faster, cheaper CI.'),
    ],
    practice: 'Add a masked customers view to your de-3 warehouse and a GitHub Action that runs dbt build on every PR.',
    explain: 'Explain why a data team needs a catalog, using a library without a catalogue as the example.',
  },

  'de-bi': {
    intro: 'Data is only valuable when someone uses it. Serving is the last mile: dashboards, metrics, and pushing data back into tools.',
    concepts: [
      C('Metabase / Superset dashboards', `Open-source BI tools that connect to your warehouse and let people explore data and build dashboards.`,
        { code: `docker run -d -p 3000:3000 --name metabase metabase/metabase
# open http://localhost:3000, connect to your Postgres/DuckDB, ask a question`, lang: 'bash' },
        { note: 'Good dashboards answer one question each, show the trend not just today’s number, state the definition, and load in under 5 seconds (pre-aggregate in gold tables).' }),
      C('Semantic layers & metrics', `Different dashboards often compute "revenue" differently. A **semantic layer** defines each metric **once** — formula, filters, dimensions — and every tool uses that definition. Examples: dbt Semantic Layer (MetricFlow), Cube, LookML.`,
        { code: `metrics:
  - name: revenue
    label: Revenue (₹)
    type: simple
    type_params: { measure: order_amount }
    filter: "{{ Dimension('order__status') }} != 'cancelled'"`, lang: 'yaml' }),
      C('Reverse ETL (idea)', `Normal ETL moves data **into** the warehouse. **Reverse ETL** pushes modelled data **back out** to operational tools — e.g. a "likely to churn" flag into the CRM, so sales can act on it. Tools: Hightouch, Census, or a simple scheduled script.`,
        { flow: ['Warehouse: churn_score', 'Reverse ETL sync', 'CRM / email tool', 'Team acts on it'] }),
    ],
    quiz: [
      Q('Why a semantic layer?', ['Faster storage', 'One definition of each metric used everywhere', 'Replaces the warehouse', 'Encrypts data'], 1, 'Consistent numbers across tools.'),
      Q('Reverse ETL means…', ['Loading data backwards in time', 'Pushing warehouse data into operational tools', 'Deleting data', 'Undoing a load'], 1, 'Warehouse → CRM, email, ads.'),
      Q('A dashboard is slow. First fix?', ['Bigger laptop', 'Pre-aggregate into a gold table', 'More charts', 'Remove filters'], 1, 'Serve small, pre-computed tables.'),
    ],
    practice: 'Run Metabase in Docker on your de-3 star schema and build a 4-chart dashboard answering one business question.',
    explain: 'Explain why two dashboards can show different revenue and how a semantic layer fixes it.',
  },

  'de-interview': {
    intro: 'How data engineering interviews actually run, and how to prepare for each round with what you already built.',
    concepts: [
      C('SQL rounds: windows, joins, gaps & islands', `Expect 2–4 problems in 45 minutes. The patterns that repeat: top-N per group, running totals, day-over-day change, deduping, and **gaps & islands** (consecutive streaks).`,
        { code: `-- gaps & islands: each user's login streaks
WITH d AS (
  SELECT user_id, login_date,
         login_date - INTERVAL (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date)) DAY AS grp
  FROM (SELECT DISTINCT user_id, login_date FROM logins)
)
SELECT user_id, MIN(login_date) AS start, MAX(login_date) AS finish, COUNT(*) AS days
FROM d GROUP BY user_id, grp ORDER BY days DESC;`, lang: 'sql' },
        { note: 'Practise on DataLemur, StrataScratch or LeetCode SQL 50. Say your approach out loud before typing.' }),
      C('Data modeling round', `"Design the warehouse for Swiggy / Uber / a library." Answer in this order: **business processes → grain → facts → dimensions → SCD choices → sample queries it supports**. Draw the star. Mention trade-offs (OBT for dashboards, type 2 for addresses).`),
      C('Pipeline design round', `"Design a pipeline that ingests X and serves Y." Structure:`,
        { flow: ['Clarify: volume, latency, consumers', 'Sources & ingestion', 'Storage layers', 'Transform', 'Serve', 'Quality, monitoring, backfills, cost'] },
        { note: 'Always state numbers ("~5M events/day ≈ 60/s, so batch hourly is fine") and failure handling. That is what separates mid from junior.' }),
      C('Spark & distributed systems questions', `Common ones: lazy evaluation; narrow vs wide transformations; what causes a shuffle; broadcast vs sort-merge join; handling skew; repartition vs coalesce; why small files are bad; how you'd debug a slow job (Spark UI). Answer each with an example from your de-6 project.`),
      C('Python coding for data', `Usually easy-to-medium problems with a data flavour: parse a log file, group and count, merge intervals, dedupe records, flatten nested JSON, implement a simple rate limiter. Write clean functions, handle edge cases, and mention complexity. Your DSA practice covers this.`),
      C('Talking through your projects (STAR)', `For each project, prepare a 2-minute story: **Situation, Task, Action, Result** — with one number and one trade-off. Then expect deep follow-ups: "Why Postgres?", "What if data doubled?", "What broke?" Your build retros are exactly this preparation.`,
        { note: 'Example: "Our air-quality loads duplicated on retries (S). I had to make re-runs safe (T). I switched to upserts on a natural key and added a run-3-times test (A). Backfilling 90 days now takes 40 seconds with zero duplicates (R)."' }),
    ],
    quiz: [
      Q('First thing to do in a pipeline design round?', ['Pick Kafka', 'Clarify volume, latency and consumers', 'Draw the dashboard', 'Write code'], 1, 'Requirements drive every choice.'),
      Q('Gaps & islands problems are usually solved with…', ['Recursive CTE only', 'ROW_NUMBER difference trick', 'CROSS JOIN', 'UNION ALL'], 1, 'Date minus row number is constant within a streak.'),
      Q('A strong project answer includes…', ['Only the tech list', 'A number and a trade-off', 'The GitHub stars', 'How long it took'], 1, 'Evidence and judgment.'),
    ],
    practice: 'Write STAR stories for every build you have shipped, and solve 5 SQL window-function problems this week.',
    explain: 'Do a mock: one friend asks "design a pipeline for college attendance analytics" and you answer in 10 minutes.',
  },
}
