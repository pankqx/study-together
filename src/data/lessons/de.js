// Data engineering course — written lessons for each roadmap topic.
// C(concept text exactly as in roadmap, body, ...blocks)  ·  Q(question, options, correctIndex, why)
// body: blank line = new paragraph, "- " = bullet, **bold**, `code`
// blocks: { flow: [...] } { table: { cols, rows } } { code, lang } { note }
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })

export default {
  'de-found': {
    intro: 'Before tools, the big picture: what a data engineer actually does, and the handful of ideas every tool is built on.',
    concepts: [
      C('The data engineering lifecycle', `A data engineer's job is to move data from where it is **created** to where it is **useful** — reliably, every day, without anyone thinking about it.

Every pipeline you will ever build follows the same five stages. Tools change every few years; these stages do not.`,
        { flow: ['Generate', 'Ingest', 'Store', 'Transform', 'Serve'] },
        { table: { cols: ['Stage', 'Question it answers', 'Example'], rows: [
          ['Generate', 'Where does data come from?', 'App database, payment API, click events'],
          ['Ingest', 'How do we pull it in?', 'Python script, Airbyte, Kafka'],
          ['Store', 'Where does it live?', 'S3/data lake, BigQuery, Postgres'],
          ['Transform', 'How do we make it useful?', 'SQL with dbt, Spark'],
          ['Serve', 'Who uses it, how?', 'Dashboard, ML model, reverse ETL'] ] } },
        { note: 'Undercurrents run under all five: security, data management, DataOps, orchestration and software engineering. You will meet each later.' }),
      C('Roles: data engineer, analyst, analytics engineer, scientist, ML engineer', `These roles overlap, but each owns a different part of the flow.

- **Data engineer** — builds and runs the pipelines and platform. Cares about reliability, scale, cost.
- **Analytics engineer** — turns raw tables into clean, tested models (mostly SQL + dbt).
- **Data analyst** — answers business questions with those models; dashboards and reports.
- **Data scientist** — experiments, statistics, predictive models.
- **ML engineer** — puts models into production and keeps them working.`,
        { flow: ['Data engineer', 'Analytics engineer', 'Analyst / Scientist', 'ML engineer'] },
        { note: 'In small companies one person does three of these. That is why the roadmap gives you SQL, Python, modelling and ML basics — not only pipelines.' }),
      C('Batch vs streaming', `**Batch** processes data in chunks on a schedule: "every night at 2 a.m., load yesterday's orders". **Streaming** processes each event as it arrives: "the moment a payment fails, flag it".

Batch is simpler, cheaper and easier to fix. Streaming is for when minutes of delay actually cost money.`,
        { table: { cols: ['', 'Batch', 'Streaming'], rows: [
          ['Latency', 'Minutes to hours', 'Seconds or less'],
          ['Complexity', 'Low', 'High (ordering, state, late data)'],
          ['Typical tools', 'Airflow, dbt, Spark', 'Kafka, Flink, Spark Streaming'],
          ['Use for', 'Reports, ML training, finance', 'Fraud, live dashboards, alerts'] ] } },
        { note: 'Senior habit: ask "what breaks if this data is 1 hour late?" If the answer is "nothing", use batch.' }),
      C('OLTP vs OLAP', `**OLTP** (online transaction processing) systems run the app: place an order, update a profile. Many tiny reads and writes, one row at a time. Example: Postgres, MySQL.

**OLAP** (online analytical processing) systems answer questions over history: "revenue by city by month for 3 years". Few huge queries scanning millions of rows. Example: BigQuery, Snowflake, DuckDB, ClickHouse.`,
        { table: { cols: ['', 'OLTP', 'OLAP'], rows: [
          ['Query', 'SELECT * FROM orders WHERE id = 42', 'SELECT city, SUM(amount) … GROUP BY city'],
          ['Storage', 'Row-oriented', 'Column-oriented'],
          ['Optimised for', 'Fast single-row writes', 'Fast scans and aggregates'],
          ['Users', 'The application', 'Analysts, dashboards, ML'] ] } },
        { note: 'Running heavy analytics on the production OLTP database slows the app for real users. Copying data to an OLAP system is a core reason data engineering exists.' }),
      C('ETL vs ELT', `**ETL**: Extract → Transform → Load. Clean the data *before* it reaches the warehouse. Common when warehouses were expensive.

**ELT**: Extract → Load → Transform. Land raw data first, then transform *inside* the warehouse with SQL. The modern default, because cloud warehouses are cheap and fast, and keeping raw data means you can always rebuild.`,
        { flow: ['Extract', 'Load raw', 'Transform in SQL (dbt)', 'Marts'] },
        { note: 'ELT gives you a replayable history: if a transform had a bug, fix the SQL and rebuild from raw. With ETL, the raw data may be gone.' }),
      C('The modern data stack', `A common, mostly-managed set of tools that fit together:`,
        { flow: ['Sources', 'Ingestion (Airbyte, dlt)', 'Warehouse / lakehouse', 'dbt', 'BI (Metabase)'] },
        { table: { cols: ['Layer', 'Open source / free', 'Managed'], rows: [
          ['Ingestion', 'dlt, Airbyte OSS', 'Fivetran'],
          ['Storage', 'Postgres, DuckDB, MinIO + Iceberg', 'BigQuery, Snowflake, Databricks'],
          ['Transform', 'dbt Core', 'dbt Cloud'],
          ['Orchestration', 'Airflow, Dagster', 'Astronomer, MWAA'],
          ['BI', 'Metabase, Superset', 'Looker, Power BI'] ] } },
        { note: 'You can learn all of it for free locally: Postgres or DuckDB + dlt + dbt + Airflow in Docker + Metabase.' }),
      C('How data teams work with the business', `Pipelines exist to answer business questions. Good data engineers start from the question, not the tool.

- Ask: **who** will use this, **how often**, and **what decision** it drives.
- Agree on definitions in writing — "active user" means different things to different teams.
- Agree on freshness: daily? hourly?
- Treat a dataset like a product: owner, documentation, tests, and a way to report problems.`,
        { note: 'Interview gold: "I asked the sales lead what decision the dashboard was for, and it turned out a weekly CSV was enough." That is senior thinking.' }),
    ],
    quiz: [
      Q('A finance team needs yesterday’s revenue every morning. Best fit?', ['Streaming with Kafka', 'A nightly batch job', 'Query the production DB from the dashboard', 'Real-time CDC'], 1, 'Nothing breaks if it is a few hours old, so batch is simpler and cheaper.'),
      Q('Which query is typical OLAP?', ['UPDATE users SET name = … WHERE id = 7', 'SELECT month, SUM(amount) FROM orders GROUP BY month', 'INSERT INTO orders VALUES (…)', 'SELECT * FROM orders WHERE id = 42'], 1, 'Aggregating over many rows is analytical work.'),
      Q('Main advantage of ELT over ETL?', ['Needs no warehouse', 'Raw data is kept, so you can rebuild after fixing a transform', 'Always faster', 'No SQL needed'], 1, 'Landing raw data first makes the pipeline replayable.'),
      Q('Who usually owns clean, tested SQL models in dbt?', ['ML engineer', 'Analytics engineer', 'Product manager', 'Front-end developer'], 1, 'Analytics engineers sit between raw data and analysts.'),
      Q('Which stage comes directly after Ingest?', ['Serve', 'Transform', 'Store', 'Generate'], 2, 'Generate → Ingest → Store → Transform → Serve.'),
    ],
    practice: 'Pick one app you use daily (Swiggy, Instagram, your college ERP). Write the five lifecycle stages for one of its data flows, and name one OLTP and one OLAP system it probably uses.',
    explain: 'Explain ETL vs ELT and batch vs streaming to a friend who has never coded, using a restaurant analogy.',
  },

  'de-py': {
    intro: 'Python is the glue of data engineering. You need to load, clean, reshape and move data confidently — and know when pandas is the wrong tool.',
    concepts: [
      C('pandas: load, clean, reshape, join, group', `pandas holds a table in memory as a **DataFrame**. Five moves cover most real work:`,
        { code: `import pandas as pd

df = pd.read_csv("orders.csv", parse_dates=["created_at"])     # load
df = df.dropna(subset=["customer_id"]).drop_duplicates("order_id")  # clean
df["amount"] = df["amount"].astype(float)
wide = df.pivot_table(index="city", columns="status", values="amount", aggfunc="sum")  # reshape
customers = pd.read_csv("customers.csv")
df = df.merge(customers, on="customer_id", how="left")         # join
daily = df.groupby(df.created_at.dt.date)["amount"].agg(["count", "sum"])  # group`, lang: 'python' },
        { note: 'After every merge, check row counts. A left join that suddenly has more rows means duplicate keys on the right side — a classic silent bug.' }),
      C('Polars for faster DataFrames', `Polars is a DataFrame library written in Rust. It uses all CPU cores and has a **lazy** mode that optimises the whole query before running it — often 5–20× faster than pandas and using less memory.`,
        { code: `import polars as pl

out = (pl.scan_parquet("trips/*.parquet")        # lazy: nothing read yet
         .filter(pl.col("fare") > 0)
         .group_by("pickup_zone")
         .agg(pl.col("fare").mean().alias("avg_fare"))
         .collect())                               # runs the optimised plan`, lang: 'python' },
        { note: 'Rule of thumb: pandas for small data and quick exploration; Polars or DuckDB when data is bigger than a few hundred MB or speed matters.' }),
      C('DuckDB from Python', `DuckDB is an analytical SQL database that runs **inside your Python process** — no server. It can query CSV and Parquet files directly, and even pandas DataFrames.`,
        { code: `import duckdb

duckdb.sql("""
  SELECT pickup_zone, avg(fare) AS avg_fare
  FROM 'trips/*.parquet'
  WHERE fare > 0
  GROUP BY 1 ORDER BY 2 DESC LIMIT 10
""").show()

con = duckdb.connect("warehouse.duckdb")   # a file = your local warehouse
con.sql("CREATE TABLE orders AS SELECT * FROM df")  # df is a pandas DataFrame`, lang: 'python' },
        { note: 'DuckDB is the best free "warehouse" for learning. Build projects de-2 and de-3 on it.' }),
      C('File formats: CSV, JSON, Parquet, Avro', `- **CSV** — plain text, universal, no types, slow and big.
- **JSON** — nested data, common from APIs, verbose.
- **Parquet** — columnar, compressed, typed. The default for analytics.
- **Avro** — row-based with a schema, great for streaming and Kafka messages.`,
        { table: { cols: ['Format', 'Layout', 'Schema', 'Best for'], rows: [
          ['CSV', 'Row, text', 'None', 'Exchanging small files'],
          ['JSON', 'Row, text', 'None', 'API responses, nested data'],
          ['Parquet', 'Columnar, binary', 'Yes', 'Analytics, data lakes'],
          ['Avro', 'Row, binary', 'Yes', 'Kafka, schema evolution'] ] } }),
      C('Working with REST APIs, pagination & rate limits', `Real APIs return data in **pages** and limit how fast you call them. A robust extractor handles both, and retries on temporary errors.`,
        { code: `import time, requests

def fetch_all(url, params):
    page, rows = 1, []
    while True:
        r = requests.get(url, params={**params, "page": page}, timeout=30)
        if r.status_code == 429:                       # rate limited
            time.sleep(int(r.headers.get("Retry-After", 5)))
            continue
        r.raise_for_status()
        batch = r.json()["results"]
        if not batch:
            return rows
        rows += batch
        page += 1`, lang: 'python' },
        { note: 'Always set a timeout. A request without one can hang your pipeline forever.' }),
      C('Dates, time zones & encodings', `Most "the numbers don't match" bugs are dates.

- Store timestamps in **UTC**; convert to IST only for display.
- Know if a column is a *date* (2026-11-27) or a *timestamp* (2026-11-27 13:31:00+05:30).
- A day in IST is not the same day in UTC — late-night Indian orders land on the previous UTC day.
- Read files as **UTF-8**. Garbled names (Ã©) mean the wrong encoding.`,
        { code: `df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
df["created_ist"] = df["created_at"].dt.tz_convert("Asia/Kolkata")`, lang: 'python' }),
      C('Writing reusable scripts with logging & config', `A notebook is for exploring. A pipeline is a **script** that runs unattended: configurable, logged, and safe to re-run.`,
        { code: `import logging, os
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("etl")

DB_URL = os.environ["DB_URL"]          # config from environment, never hard-coded

def main(day: str):
    log.info("start day=%s", day)
    rows = extract(day); log.info("extracted %d rows", len(rows))
    load(transform(rows)); log.info("done")

if __name__ == "__main__":
    import sys; main(sys.argv[1])`, lang: 'python' }),
    ],
    quiz: [
      Q('After a left merge your row count went from 1,000 to 1,180. Most likely cause?', ['pandas bug', 'Duplicate keys in the right table', 'Nulls in the left table', 'Wrong dtype'], 1, 'Each duplicate key on the right multiplies matching left rows.'),
      Q('Best format for a 5 GB analytics table in a data lake?', ['CSV', 'JSON', 'Parquet', 'Excel'], 2, 'Columnar, compressed and typed.'),
      Q('An API returns HTTP 429. You should…', ['Fail the pipeline', 'Wait (respect Retry-After) and retry', 'Retry immediately in a loop', 'Skip that page'], 1, '429 means "too many requests" — back off and retry.'),
      Q('Where should timestamps be stored?', ['IST', 'UTC', 'Local time of the server', 'As strings'], 1, 'UTC avoids daylight-saving and time-zone mix-ups; convert on display.'),
      Q('Why does Polars lazy mode help?', ['It caches results forever', 'It optimises the whole query plan before running', 'It uses the GPU', 'It skips nulls'], 1, 'Lazy evaluation lets it push filters down and avoid unnecessary work.'),
    ],
    practice: 'Download any open CSV (data.gov.in). Load it with pandas, clean 3 issues, group by one column, then answer the same question with DuckDB SQL. Compare the code.',
    explain: 'Explain why a left join can increase row count, drawing two small tables.',
  },

  'de-files': {
    intro: 'How data is laid out on disk decides how fast and cheap every query is. This is where "it works" becomes "it scales".',
    concepts: [
      C('Row vs columnar formats', `**Row formats** store each record together. Great for reading or writing one whole row (OLTP).

**Columnar formats** store each column together. A query that needs 2 of 50 columns reads only those 2 — and similar values sit side by side, so they compress very well.`,
        { table: { cols: ['Row layout', 'Columnar layout'], rows: [
          ['1, Pank, Mangaluru, 450', 'id: 1, 2, 3'],
          ['2, Ravi, Udupi, 300', 'name: Pank, Ravi, Merel'],
          ['3, Merel, Mangaluru, 520', 'city: Mangaluru, Udupi, Mangaluru'] ] } },
        { note: 'SELECT SUM(amount) on a 50-column table reads ~1/50th of the data in columnar format.' }),
      C('Parquet internals: row groups, statistics', `A Parquet file is split into **row groups** (e.g. 128 MB each). Inside each, every column is stored as a **column chunk**. The file footer keeps **min/max statistics** per chunk.

When you filter \`WHERE date = '2026-11-01'\`, engines read the footer and **skip** row groups whose min/max cannot match. This is called predicate pushdown.`,
        { flow: ['File', 'Row group 1…n', 'Column chunks', 'Pages', 'Footer: schema + min/max'] },
        { code: `import pyarrow.parquet as pq
meta = pq.ParquetFile("trips.parquet").metadata
print(meta.num_row_groups, meta.row_group(0).column(3).statistics)`, lang: 'python' }),
      C('Compression codecs (Snappy, ZSTD)', `- **Snappy** — fast, moderate compression. Old default.
- **ZSTD** — slightly slower to write, noticeably smaller files. Today's common choice.
- **Gzip** — small but slow; avoid for hot data.

Columnar data compresses far better than CSV because similar values sit together.`,
        { note: 'Measure it yourself in project de-2: write the same table with snappy and zstd and compare size and read time.' }),
      C('Partitioning layouts & the small-files problem', `**Partitioning** splits a table into folders by a column, usually date:

\`trips/date=2026-11-01/part-0.parquet\`

A query for one day only reads one folder. But over-partitioning creates thousands of tiny files — and every file has overhead to open and list. That is the **small-files problem**.`,
        { note: 'Aim for files of roughly 128 MB–1 GB. Partition by a low-cardinality column you always filter on (date), never by user_id.' }),
      C('Schema evolution', `Sources change: a column is added, renamed or changes type. **Schema evolution** is how your storage handles it without breaking old data.

- Adding a nullable column — safe almost everywhere.
- Renaming or changing types — dangerous; old files still have the old schema.
- Table formats like **Iceberg** and **Delta** track schema versions so old and new files read correctly together.`,
        { note: 'Defensive habit: in the raw layer, keep data as-is. Apply types and renames in the transform layer, where you control them.' }),
    ],
    quiz: [
      Q('Why is columnar storage faster for SUM(amount)?', ['It uses indexes', 'It reads only the columns needed', 'It is stored in RAM', 'It has no compression'], 1, 'Only the amount column is read from disk.'),
      Q('Parquet skips row groups using…', ['Bloom filters only', 'Min/max statistics in the footer', 'File names', 'Primary keys'], 1, 'Predicate pushdown compares your filter to stored min/max.'),
      Q('Partitioning by user_id with 2M users causes…', ['Faster queries', 'The small-files problem', 'Better compression', 'Nothing'], 1, 'Millions of tiny folders and files — huge listing and open overhead.'),
      Q('Which schema change is usually safe?', ['Renaming a column', 'Changing INT to STRING', 'Adding a nullable column', 'Dropping the primary key'], 2, 'Old files simply read null for the new column.'),
    ],
    practice: 'Do project de-2 (file formats benchmark) — it is exactly this lesson, measured.',
    explain: 'Explain predicate pushdown using a library analogy: shelves, labels with "A–F", and a book you are looking for.',
  },

  'de-model': {
    intro: 'Data modelling turns messy app tables into a shape anyone can query correctly. Most interview "design a warehouse" rounds are this lesson.',
    concepts: [
      C('Business processes, grain, facts & dimensions', `Start every model with four decisions (Kimball's method):

1. **Business process** — what event are we measuring? (an order, a ride, a class attendance)
2. **Grain** — what does *one row* mean? ("one row per order line")
3. **Dimensions** — the *who, what, where, when* used to filter and group (customer, product, store, date)
4. **Facts** — the *numbers* you add up (quantity, amount)`,
        { flow: ['Business process', 'Declare grain', 'Pick dimensions', 'Pick facts'] },
        { note: 'Grain is the most important decision. If you cannot say what one row means in one sentence, stop and decide before writing SQL.' }),
      C('Star vs snowflake schemas', `A **star schema** has one fact table in the middle, joined directly to flat dimension tables. A **snowflake** normalises dimensions further (product → category → department in separate tables).`,
        { table: { cols: ['', 'Star', 'Snowflake'], rows: [
          ['Joins', 'Few, simple', 'More'],
          ['Storage', 'Some repetition', 'Less repetition'],
          ['Ease for analysts', 'High', 'Lower'],
          ['Default today', 'Yes', 'Rarely'] ] } },
        { code: `-- star: fact_sales joined to its dimensions
SELECT d.month, p.category, SUM(f.amount)
FROM fact_sales f
JOIN dim_date d    ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY 1, 2;`, lang: 'sql' }),
      C('Slowly changing dimensions (type 1, 2, 3)', `A customer moves from Mangaluru to Bengaluru. Should old orders show the old city or the new one?

- **Type 1** — overwrite. History is lost; old orders now show Bengaluru.
- **Type 2** — add a new row with \`valid_from\`, \`valid_to\`, \`is_current\`. Old orders keep Mangaluru. Most common for important attributes.
- **Type 3** — keep a "previous_city" column. Only one step of history.`,
        { table: { cols: ['customer_key', 'customer_id', 'city', 'valid_from', 'valid_to', 'is_current'], rows: [
          ['101', 'C7', 'Mangaluru', '2025-01-01', '2026-11-26', 'false'],
          ['245', 'C7', 'Bengaluru', '2026-11-27', '9999-12-31', 'true'] ] } },
        { note: 'dbt snapshots build type 2 for you (lesson: dbt).' }),
      C('Conformed dimensions & bus matrix', `A **conformed dimension** is shared by many fact tables with the same meaning — one \`dim_customer\` used by sales, returns and support tickets. That is what lets you compare across processes.

A **bus matrix** is a grid: business processes as rows, dimensions as columns, ticks where they connect. It is the plan for the whole warehouse on one page.`,
        { table: { cols: ['Process', 'Date', 'Customer', 'Product', 'Store'], rows: [
          ['Sales', '✓', '✓', '✓', '✓'],
          ['Returns', '✓', '✓', '✓', '✓'],
          ['Support tickets', '✓', '✓', '', ''] ] } }),
      C('Fact types: transaction, periodic, accumulating', `- **Transaction** — one row per event (each payment). Most common.
- **Periodic snapshot** — one row per entity per period (account balance at end of each day).
- **Accumulating snapshot** — one row per process instance, updated as it moves through steps (an order: placed → packed → shipped → delivered, with a date for each).`,
        { note: 'Ask: is this an event, a state at a time, or a pipeline of steps? That picks the fact type.' }),
      C('Surrogate keys', `A **surrogate key** is a key the warehouse creates (\`customer_key = 245\`), separate from the source system's **natural key** (\`customer_id = C7\`).

You need them for type 2 dimensions (one customer, many rows), for combining sources whose IDs clash, and to protect the warehouse when a source changes its IDs.`,
        { code: `-- in dbt, a stable hash works well
{{ dbt_utils.generate_surrogate_key(['customer_id', 'valid_from']) }} AS customer_key`, lang: 'sql' }),
      C('One-big-table & wide tables', `**One big table (OBT)** pre-joins facts with all their dimension columns into one wide table. Modern columnar warehouses handle wide tables well, and analysts love not writing joins.

Trade-off: duplicated data and harder updates. Common pattern: keep a star schema as the source of truth, and build OBTs on top for specific dashboards.`),
      C('Data vault (intro)', `**Data vault** models data as **hubs** (business keys), **links** (relationships) and **satellites** (descriptive history). It is built for auditability and many changing sources, common in banks and large enterprises.

You rarely start with it, but you should recognise the words in an interview.`,
        { flow: ['Hub: customer', 'Link: customer–order', 'Hub: order', 'Satellites hold history'] }),
    ],
    quiz: [
      Q('First decision when designing a fact table?', ['Which BI tool', 'The grain', 'Surrogate key type', 'Partition column'], 1, 'Everything else follows from what one row means.'),
      Q('A customer changes city and old orders must keep the old city. Use…', ['SCD type 1', 'SCD type 2', 'Delete and reinsert', 'Type 0'], 1, 'Type 2 adds a new row and keeps history.'),
      Q('"Account balance at end of every day" is which fact type?', ['Transaction', 'Periodic snapshot', 'Accumulating snapshot', 'Factless'], 1, 'A state captured per period.'),
      Q('Why surrogate keys?', ['They are shorter', 'Type 2 needs many rows per natural key', 'Required by SQL', 'Faster inserts only'], 1, 'One natural key can have many historical rows.'),
      Q('A conformed dimension is…', ['A dimension with no nulls', 'Shared with the same meaning across fact tables', 'A snowflaked dimension', 'A date dimension only'], 1, 'Shared dimensions make cross-process analysis possible.'),
    ],
    practice: 'Model your college: business process "attendance". Write the grain, 4 dimensions, the facts, and draw the star on your board.',
    explain: 'Explain SCD type 1 vs type 2 with the example of someone changing their phone number.',
  },

  'de-ingest': {
    intro: 'Ingestion is where most pipelines break. The goal: get data in completely, exactly once, and be able to re-run any day safely.',
    concepts: [
      C('Full vs incremental loads', `- **Full load** — copy the whole table every run. Simple, always correct, but slow and expensive as data grows.
- **Incremental load** — copy only what changed since last run. Fast, but you must track "what changed" correctly.`,
        { table: { cols: ['', 'Full', 'Incremental'], rows: [
          ['Simplicity', 'High', 'Medium'],
          ['Cost at scale', 'High', 'Low'],
          ['Catches deletes', 'Yes', 'Only with CDC or soft-deletes'],
          ['Use when', 'Small tables, dimensions', 'Large, growing tables'] ] } }),
      C('Change detection: timestamps, hashes, CDC', `How do you know what changed?

- **Timestamp watermark** — \`WHERE updated_at > last_max\`. Easy; misses deletes and rows with bad timestamps.
- **Hash compare** — hash every row, compare to last run. Catches any change; costs a full scan.
- **CDC** (change data capture) — read the database's own change log (Postgres WAL). Catches inserts, updates **and** deletes in order. Most reliable, more setup (Debezium).`,
        { code: `SELECT * FROM orders
WHERE updated_at > :last_watermark      -- saved from the previous run
  AND updated_at <= :this_run_started   -- fixed upper bound avoids gaps`, lang: 'sql' },
        { note: 'Always use a fixed upper bound. Rows written while your query runs would otherwise be skipped or double-read.' }),
      C('Idempotent, re-runnable pipelines', `**Idempotent** means running the same job twice gives the same result as running it once. This is the most important property of a pipeline: failures and retries will happen.

Two standard techniques:
- **Upsert / MERGE** on a key, instead of plain INSERT.
- **Delete-then-insert a partition**: replace the whole day you are loading.`,
        { code: `-- Postgres upsert: safe to run any number of times
INSERT INTO orders (order_id, amount, status, updated_at)
VALUES (%s, %s, %s, %s)
ON CONFLICT (order_id) DO UPDATE
SET amount = EXCLUDED.amount, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at;`, lang: 'sql' },
        { note: 'Test it: run the job 3 times for the same day. Row count must not change. This is the "done when" for build de-1.' }),
      C('Ingesting from APIs with dlt', `**dlt** (data load tool) is a Python library that handles the boring parts of API ingestion: pagination, schema inference, nested JSON flattening, incremental state and loading into DuckDB/Postgres/BigQuery.`,
        { code: `import dlt
from dlt.sources.helpers.rest_client import paginate

@dlt.resource(write_disposition="merge", primary_key="id")
def issues():
    for page in paginate("https://api.github.com/repos/dlt-hub/dlt/issues"):
        yield page

pipeline = dlt.pipeline("gh", destination="duckdb", dataset_name="raw")
print(pipeline.run(issues()))`, lang: 'python' },
        { note: 'Write one extractor by hand first (build de-1), then use dlt — you will understand what it saves you.' }),
      C('Ingesting from databases', `Pulling from a production database: be a polite guest.

- Read from a **replica**, not the primary, when possible.
- Pull in **chunks** (by primary key range) to avoid long locks and memory blow-ups.
- Use incremental watermarks or CDC instead of full scans for big tables.
- Never run during peak traffic without asking.`,
        { code: `# chunked read by key range
for lo in range(0, max_id, 50_000):
    rows = cur.execute("SELECT * FROM orders WHERE id > %s AND id <= %s", (lo, lo + 50_000)).fetchall()
    write(rows)`, lang: 'python' }),
      C('Landing zones & raw layer conventions', `Land data **exactly as received** in a raw layer before touching it. Conventions that save you later:`,
        { flow: ['raw / bronze (as received)', 'staging (typed, renamed)', 'marts / gold (business-ready)'] },
        { table: { cols: ['Convention', 'Why'], rows: [
          ['Path: source/table/load_date=YYYY-MM-DD/', 'Easy to find and reprocess one day'],
          ['Add _loaded_at and _source columns', 'Debugging and lineage'],
          ['Never edit raw files', 'You can always rebuild from them'],
          ['Keep raw for a retention period', 'Replays after bug fixes'] ] } }),
      C('Airbyte / Fivetran (concepts)', `**Connectors as a service.** Instead of writing extractors, you configure a connector ("Postgres → BigQuery, every hour") and the tool handles schemas, incremental syncs and retries. Fivetran is managed and paid; Airbyte has an open-source version.

Trade-off: very fast to set up, but less control, and cost grows with data volume.`,
        { note: 'Interview angle: "build vs buy". Buy for standard sources (Salesforce, Stripe); build for odd internal APIs.' }),
    ],
    quiz: [
      Q('Your job crashed after loading half a day. Re-running should be safe because the pipeline is…', ['Incremental', 'Idempotent', 'Streaming', 'Partitioned'], 1, 'Idempotent: running again gives the same final result.'),
      Q('Which change detection catches deletes?', ['updated_at watermark', 'CDC from the database log', 'Row count compare', 'SELECT MAX(id)'], 1, 'The log records deletes too.'),
      Q('Why a fixed upper bound on the watermark?', ['Faster queries', 'Avoid missing or double-reading rows written during the run', 'Required by Postgres', 'For partitioning'], 1, 'The window must be exact and repeatable.'),
      Q('Rule for the raw layer?', ['Clean it before saving', 'Store exactly as received, never edit', 'Delete after transforming', 'Only keep the latest file'], 1, 'Raw is your replay source.'),
    ],
    practice: 'Do build de-1 (idempotent Python ETL). The guide on that build walks through it step by step.',
    explain: 'Explain "idempotent" with the example of pressing a lift button many times.',
  },

  'de-orch': {
    intro: 'Orchestration runs your pipeline steps in the right order, on schedule, with retries and alerts — so you do not have to.',
    concepts: [
      C('Why orchestration', `cron can run a script at 2 a.m. It cannot: wait for step A before B, retry a failed step, re-run last Tuesday, show you what failed, or alert you. An orchestrator does all of that.`,
        { flow: ['extract_orders', 'load_raw', 'dbt_run', 'dbt_test', 'notify'] },
        { note: 'A pipeline is a DAG: a directed acyclic graph of tasks. Directed = arrows have a direction; acyclic = no loops.' }),
      C('Airflow: DAGs, tasks, operators, sensors', `- **DAG** — the whole pipeline, defined in a Python file.
- **Task** — one step.
- **Operator** — a template for a task (BashOperator, PythonOperator, SQL operators).
- **Sensor** — a task that waits for something (a file to land, another DAG to finish).`,
        { code: `from airflow.decorators import dag, task
import pendulum

@dag(schedule="0 2 * * *", start_date=pendulum.datetime(2026, 11, 1, tz="Asia/Kolkata"), catchup=False)
def daily_orders():
    @task(retries=3)
    def extract(ds=None):          # ds = the logical date, e.g. "2026-11-26"
        return run_extract(ds)

    @task
    def load(path: str):
        load_to_warehouse(path)

    load(extract())

daily_orders()`, lang: 'python' }),
      C('Scheduling, catchup & backfills', `Each run has a **logical date** — the period of data it covers, not the time it actually ran. The 2 a.m. run on 27 Nov processes data for 26 Nov.

- **catchup=True** — Airflow runs every missed interval since start_date.
- **Backfill** — deliberately re-run a past range: \`airflow dags backfill -s 2026-09-01 -e 2026-11-26 daily_orders\`.`,
        { note: 'Backfills only work if your tasks use the logical date (ds), not datetime.now(). Using "now" is the number-one Airflow mistake.' }),
      C('Retries, SLAs & alerting', `- **Retries** with a delay handle flaky networks and APIs.
- **Timeouts** stop a hung task blocking everything.
- **Callbacks** (on_failure_callback) send alerts to Slack, email or Telegram.
- Track **freshness**: alert if the table has not updated by 7 a.m.`,
        { code: `default_args = {"retries": 3, "retry_delay": timedelta(minutes=5),
                "execution_timeout": timedelta(minutes=30),
                "on_failure_callback": send_telegram_alert}`, lang: 'python' }),
      C('XComs & passing data correctly', `**XComs** pass small values between tasks (a file path, a row count). They are stored in Airflow's metadata database — never pass whole datasets through them.`,
        { flow: ['extract writes s3://raw/2026-11-26.parquet', 'XCom passes only the path', 'load reads the file'] },
        { note: 'Rule: tasks hand over pointers (paths, table names), not data.' }),
      C('Running Airflow locally in Docker', `The official docker-compose file starts the scheduler, webserver, workers and a Postgres metadata DB.`,
        { code: `curl -LfO 'https://airflow.apache.org/docs/apache-airflow/stable/docker-compose.yaml'
mkdir -p ./dags ./logs ./plugins ./config
echo "AIRFLOW_UID=$(id -u)" > .env
docker compose up airflow-init
docker compose up -d        # UI on http://localhost:8080  (airflow / airflow)`, lang: 'bash' },
        { note: 'Needs about 4 GB RAM free. On a 16 GB laptop, close Chrome tabs first.' }),
      C('Dagster & Kestra (alternatives)', `- **Dagster** — thinks in *assets* (tables, files) instead of tasks. Strong typing, testing and lineage. Popular with modern data teams.
- **Kestra** — pipelines defined in YAML, with a friendly UI; good for mixed teams.
- **Prefect** — Pythonic, easy to start.

Airflow still has the most jobs. Learn Airflow first; recognise the others.`),
    ],
    quiz: [
      Q('The DAG runs at 2 a.m. on 27 Nov. Which day does ds usually refer to?', ['27 Nov', '26 Nov', '28 Nov', 'Depends on server'], 1, 'The logical date is the start of the interval being processed.'),
      Q('Why must tasks use ds instead of datetime.now()?', ['Faster', 'So backfills process the right historical day', 'Airflow forbids now()', 'Time zones'], 1, 'Backfill runs today but must process an old day.'),
      Q('What should go in an XCom?', ['A 2 GB DataFrame', 'A file path or row count', 'Database passwords', 'Logs'], 1, 'Small metadata only.'),
      Q('A sensor is used to…', ['Transform data', 'Wait for a condition, like a file arriving', 'Send alerts', 'Store results'], 1, 'Sensors poll until something is true.'),
    ],
    practice: 'Put your de-1 script into an Airflow DAG with retries, then backfill the last 7 days.',
    explain: 'Explain logical date vs run date using a newspaper: printed at night about the day that just ended.',
  },

  'de-dbt': {
    intro: 'dbt lets you write transformations as plain SQL SELECTs, and gives you dependencies, tests, docs and lineage for free.',
    concepts: [
      C('dbt project structure', `dbt turns a folder of SELECT statements into tables and views in your warehouse, in the right order.`,
        { code: `my_project/
├── dbt_project.yml        # project config
├── models/
│   ├── staging/           # 1:1 with sources: rename, cast
│   ├── intermediate/      # joins and business logic
│   └── marts/             # final tables for BI
├── tests/                 # singular tests
├── snapshots/             # SCD type 2
├── macros/                # reusable Jinja
└── seeds/                 # small CSVs (country codes…)`, lang: 'text' },
        { code: `pip install dbt-duckdb
dbt init my_project
dbt run      # build models
dbt test     # run tests
dbt build    # run + test in dependency order`, lang: 'bash' }),
      C('Sources, models, refs', `- A **source** is a raw table dbt did not create.
- A **model** is one .sql file with one SELECT; dbt creates a view or table from it.
- **ref()** links models together — dbt reads these to build the dependency graph and run things in order.`,
        { code: `-- models/staging/stg_orders.sql
SELECT
  order_id,
  customer_id,
  CAST(amount AS DECIMAL(12,2)) AS amount,
  CAST(created_at AS TIMESTAMP) AS created_at
FROM {{ source('shop', 'orders') }}

-- models/marts/fct_daily_revenue.sql
SELECT DATE(created_at) AS day, SUM(amount) AS revenue
FROM {{ ref('stg_orders') }}
GROUP BY 1`, lang: 'sql' },
        { note: 'Never hard-code table names. Always ref() or source(), or dbt cannot see the dependency.' }),
      C('Staging → intermediate → marts', `A standard layering that keeps projects readable as they grow:`,
        { flow: ['sources (raw)', 'staging: clean 1:1', 'intermediate: join, logic', 'marts: facts & dims'] },
        { table: { cols: ['Layer', 'Does', 'Does not'], rows: [
          ['Staging', 'Rename, cast, light cleaning', 'Join other sources'],
          ['Intermediate', 'Joins, business rules', 'Get used by BI directly'],
          ['Marts', 'Facts and dimensions for people', 'Contain raw columns'] ] } }),
      C('Tests: generic & singular', `**Generic tests** are declared in YAML: unique, not_null, accepted_values, relationships. **Singular tests** are SQL files that return the rows that are *wrong* — the test passes when it returns zero rows.`,
        { code: `# models/staging/_stg.yml
models:
  - name: stg_orders
    columns:
      - name: order_id
        tests: [unique, not_null]
      - name: customer_id
        tests:
          - relationships: { to: ref('stg_customers'), field: customer_id }`, lang: 'yaml' },
        { code: `-- tests/no_negative_revenue.sql
SELECT * FROM {{ ref('fct_daily_revenue') }} WHERE revenue < 0`, lang: 'sql' }),
      C('Documentation & lineage graph', `Add descriptions in YAML, then:`,
        { code: `dbt docs generate
dbt docs serve     # opens a site with every model, column and the lineage graph`, lang: 'bash' },
        { note: 'The lineage graph answers "if I change stg_orders, what breaks downstream?" — screenshot it for your project README.' }),
      C('Incremental models', `For big tables, only process new rows each run instead of rebuilding everything.`,
        { code: `{{ config(materialized='incremental', unique_key='order_id') }}

SELECT * FROM {{ ref('stg_orders') }}
{% if is_incremental() %}
  WHERE created_at > (SELECT MAX(created_at) FROM {{ this }})
{% endif %}`, lang: 'sql' },
        { note: 'Late-arriving rows older than MAX(created_at) get missed. A common fix: look back a few days — created_at > MAX(created_at) - INTERVAL 3 DAY — and rely on unique_key to merge.' }),
      C('Snapshots for SCD type 2', `Snapshots record how a row changes over time — dbt adds dbt_valid_from and dbt_valid_to for you.`,
        { code: `{% snapshot customers_snapshot %}
{{ config(target_schema='snapshots', unique_key='customer_id',
          strategy='timestamp', updated_at='updated_at') }}
SELECT * FROM {{ source('shop', 'customers') }}
{% endsnapshot %}`, lang: 'sql' }),
      C('Macros, Jinja & packages', `dbt SQL is templated with **Jinja**. **Macros** are reusable Jinja functions. **Packages** (like dbt_utils, dbt_expectations) give you ready-made macros and tests.`,
        { code: `-- macros/cents_to_rupees.sql
{% macro cents_to_rupees(col) %} ROUND({{ col }} / 100.0, 2) {% endmacro %}

-- used in a model
SELECT {{ cents_to_rupees('amount_cents') }} AS amount FROM {{ ref('stg_payments') }}`, lang: 'sql' }),
    ],
    quiz: [
      Q('Why use ref() instead of the table name?', ['Shorter', 'dbt builds the dependency graph from it', 'Required by DuckDB', 'Faster SQL'], 1, 'ref() tells dbt what depends on what.'),
      Q('A singular test passes when the query returns…', ['One row', 'Zero rows', 'All rows', 'NULL'], 1, 'It selects the bad rows; none means good.'),
      Q('Where should a join between orders and customers live?', ['Staging', 'Intermediate or marts', 'Sources', 'Seeds'], 1, 'Staging stays 1:1 with sources.'),
      Q('Incremental model risk?', ['Slower runs', 'Missing late-arriving rows', 'No tests allowed', 'Cannot use ref()'], 1, 'Rows older than the current max can be skipped — use a lookback.'),
      Q('dbt snapshots implement…', ['Partitioning', 'SCD type 2', 'Backups', 'Sampling'], 1, 'They track history with valid_from/valid_to.'),
    ],
    practice: 'Run `pip install dbt-duckdb`, create stg_ → fct_ models on your de-1 data, add 4 tests, and open the docs site.',
    explain: 'Explain staging → intermediate → marts with a kitchen: washing vegetables, cooking, plating.',
  },

  'de-quality': {
    intro: 'A pipeline that runs but loads wrong data is worse than one that fails. Quality checks are how you sleep at night.',
    concepts: [
      C('Data contracts', `A **data contract** is an agreement between the team producing data and the team using it: the schema, meaning of each field, freshness, and what counts as a breaking change — written down and checked automatically.`,
        { code: `# contract: orders v1
owner: checkout-team
freshness: loaded by 06:00 IST daily
fields:
  order_id:   { type: string, unique: true, required: true }
  amount:     { type: decimal, min: 0 }
  status:     { type: string, allowed: [placed, paid, shipped, cancelled] }
breaking_changes: renaming or removing a field, changing a type — needs 2 weeks notice`, lang: 'yaml' },
        { note: 'Contracts move quality checks upstream: the producer’s CI fails before bad data ever leaves their system.' }),
      C('Great Expectations / Soda', `Tools that let you declare **expectations** about data and run them in your pipeline, with readable reports.`,
        { code: `# Soda check file (checks.yml)
checks for orders:
  - row_count > 0
  - missing_count(order_id) = 0
  - duplicate_count(order_id) = 0
  - invalid_count(status) = 0:
      valid values: [placed, paid, shipped, cancelled]
  - freshness(created_at) < 1d`, lang: 'yaml' },
        { note: 'dbt tests cover a lot of this already. Use GE/Soda when you need checks on raw data before dbt, or richer reports.' }),
      C('Freshness & volume checks', `The two checks that catch most real incidents:

- **Freshness** — is the newest row recent enough? A silent API failure shows up as stale data.
- **Volume** — is today's row count within a normal range? A sudden drop of 90% means something broke upstream, even if every row is valid.`,
        { code: `-- volume anomaly: compare today to the 14-day average
WITH daily AS (SELECT DATE(created_at) d, COUNT(*) n FROM orders GROUP BY 1)
SELECT d, n FROM daily
WHERE d = CURRENT_DATE - 1
  AND n < 0.5 * (SELECT AVG(n) FROM daily WHERE d >= CURRENT_DATE - 15);`, lang: 'sql' }),
      C('Unit tests for transforms', `Test your transformation **logic** on tiny, hand-made inputs — like any software. If a function de-duplicates or computes revenue, prove it with pytest.`,
        { code: `def test_dedupe_keeps_latest():
    rows = [{"id": 1, "v": "a", "ts": 1}, {"id": 1, "v": "b", "ts": 2}]
    assert dedupe_latest(rows) == [{"id": 1, "v": "b", "ts": 2}]`, lang: 'python' },
        { note: 'dbt 1.8+ also supports unit tests on models with mocked input rows.' }),
    ],
    quiz: [
      Q('All rows are valid, but today has 90% fewer rows than usual. Which check catches it?', ['not_null', 'Volume check', 'unique', 'Schema check'], 1, 'Volume anomalies catch upstream breakage that valid-looking data hides.'),
      Q('A data contract mainly…', ['Speeds up queries', 'Agrees schema and expectations between producer and consumer', 'Encrypts data', 'Replaces dbt'], 1, 'It is an enforced agreement.'),
      Q('An API silently stopped returning new data. Which check fires first?', ['Freshness', 'unique', 'accepted_values', 'Unit test'], 0, 'The newest row gets old.'),
    ],
    practice: 'Do build de-5: inject 5 kinds of bad data into your pipeline and make sure each one is caught.',
    explain: 'Explain why "the pipeline succeeded" does not mean "the data is right".',
  },
}
