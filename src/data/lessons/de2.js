// Data engineering — lessons 9–14: Python engineering, warehouses, patterns, Spark, lakehouse, Azure
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })

export default {
  'de-pyeng': {
    intro: 'The difference between a script that works on your laptop and a pipeline a team can trust: structure, types, tests, logs and config.',
    concepts: [
      C('Project layout & packaging (uv / Poetry)', `Use a standard layout and a tool that pins dependencies so the pipeline runs the same everywhere. **uv** is the fast modern choice; **Poetry** is common in existing teams.`,
        { code: `uv init airq && cd airq
uv add requests psycopg[binary] typer
uv add --dev pytest ruff mypy
uv run python -m airq.main 2026-11-26`, lang: 'bash' },
        { code: `airq/
├── pyproject.toml      # dependencies + tool config
├── uv.lock             # exact versions — commit this
├── src/airq/
│   ├── __init__.py
│   ├── extract.py  transform.py  load.py
│   └── main.py
└── tests/`, lang: 'text' },
        { note: 'Run it on your laptop: install uv with `curl -LsSf https://astral.sh/uv/install.sh | sh` (Linux/Mac) or `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows).' }),
      C('Type hints & mypy', `Type hints document what a function takes and returns. **mypy** checks them without running the code, catching "passed a string where a date was expected" bugs before production.`,
        { code: `from datetime import date
from typing import TypedDict

class Row(TypedDict):
    station_id: str
    value: float

def transform(raw: list[dict], day: date) -> list[Row]:
    ...

# terminal
# uv run mypy src`, lang: 'python' }),
      C('Testing with pytest & fixtures', `**pytest** finds functions named \`test_*\` and runs them. **Fixtures** provide reusable setup — sample data, a temporary database.`,
        { code: `import pytest
from airq.transform import transform

@pytest.fixture
def raw():
    return [{"station_id": 1, "parameter": "PM25", "datetime": "2026-11-26T10:00:00Z", "value": 12.5}]

def test_lowercases_parameter(raw):
    rows, bad = transform(raw)
    assert rows[0][1] == "pm25" and bad == 0

@pytest.mark.parametrize("value", [-1, "abc", None])
def test_bad_values_dropped(raw, value):
    raw[0]["value"] = value
    assert transform(raw) == ([], 1)`, lang: 'python' },
        { note: 'Run: `uv run pytest -q`. For database tests, start Postgres in Docker and use a fixture that creates and drops a test schema.' }),
      C('Logging & structured logs', `Print statements vanish. **Logs** have levels (DEBUG, INFO, WARNING, ERROR) and timestamps. **Structured logs** (JSON) can be searched and graphed: "show all runs where dropped > 100".`,
        { code: `import json, logging, sys
class Json(logging.Formatter):
    def format(self, r):
        return json.dumps({"ts": self.formatTime(r), "level": r.levelname, "msg": r.getMessage(), **getattr(r, "extra", {})})
h = logging.StreamHandler(sys.stdout); h.setFormatter(Json())
log = logging.getLogger("etl"); log.addHandler(h); log.setLevel("INFO")
log.info("loaded", extra={"extra": {"day": "2026-11-26", "rows": 4120, "dropped": 3}})`, lang: 'python' }),
      C('Config & secrets handling', `- Config (URLs, batch sizes) comes from environment variables or a config file — never hard-coded.
- Secrets (passwords, API keys) only from environment or a secret manager. Never in git.
- Commit a \`.env.example\` with the keys but no values; add \`.env\` to \`.gitignore\`.`,
        { code: `from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    db_url: str
    api_key: str
    batch_size: int = 1000
    class Config: env_file = ".env"
settings = Settings()   # fails fast with a clear error if db_url is missing`, lang: 'python' },
        { note: 'If you ever commit a secret, deleting the file is not enough — it stays in git history. Rotate (change) the key immediately.' }),
      C('CLI tools (Typer)', `A proper command line makes pipelines easy to run, backfill and schedule.`,
        { code: `import typer
from datetime import date, timedelta
app = typer.Typer()

@app.command()
def run(day: str): ...

@app.command()
def backfill(start: str, end: str):
    d = date.fromisoformat(start)
    while d <= date.fromisoformat(end):
        run(d.isoformat()); d += timedelta(days=1)

if __name__ == "__main__": app()
# uv run python -m airq.main backfill 2026-11-01 2026-11-26`, lang: 'python' }),
      C('Code quality: ruff, pre-commit', `**ruff** lints and formats Python in milliseconds. **pre-commit** runs it automatically before every commit, so bad code never reaches the repo.`,
        { code: `# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks: [{ id: ruff, args: [--fix] }, { id: ruff-format }]

# terminal
uv add --dev pre-commit && uv run pre-commit install`, lang: 'yaml' }),
    ],
    quiz: [
      Q('Where should an API key live?', ['In the code', 'In a committed config.json', 'In an environment variable / secret manager', 'In the README'], 2, 'Secrets never go into git.'),
      Q('You committed a key by mistake. First action?', ['Delete the file', 'Rotate the key', 'Make the repo private', 'Force-push'], 1, 'It is in history forever; only rotation makes it safe.'),
      Q('What does a pytest fixture provide?', ['Faster tests', 'Reusable setup for tests', 'Type checking', 'Logging'], 1, 'Fixtures inject shared setup into tests.'),
      Q('Why commit uv.lock?', ['It is required by git', 'Everyone installs the exact same versions', 'It speeds up Python', 'For secrets'], 1, 'Reproducible installs.'),
    ],
    practice: 'Convert your de-1 script into a uv project with Typer commands (run, backfill), 5 pytest tests, ruff, and a GitHub Actions workflow that runs them.',
    explain: 'Explain why "it works on my laptop" is not enough, and the three tools that fix it.',
  },

  'de-dwh': {
    intro: 'Cloud warehouses are where most analytics lives. Learn how they store and charge for data, so your queries are fast and your bills small.',
    concepts: [
      C('Columnar storage & MPP engines', `Warehouses store tables in **columnar** format and run queries on **MPP** (massively parallel processing) engines: the query is split across many machines, each scanning part of the data, then results are combined.`,
        { flow: ['SQL query', 'Planner splits work', 'Workers scan slices in parallel', 'Partial results merged', 'Result'] },
        { note: 'This is why SELECT * is expensive: every column you select is read from storage across every worker.' }),
      C('BigQuery, Snowflake, Redshift compared', `All three are columnar MPP warehouses; they differ in how compute is billed and managed.`,
        { table: { cols: ['', 'BigQuery', 'Snowflake', 'Redshift'], rows: [
          ['Cloud', 'Google', 'Any (AWS/GCP/Azure)', 'AWS'],
          ['Compute', 'Serverless, per bytes scanned (or slots)', 'Virtual warehouses, per second running', 'Clusters or serverless'],
          ['Ops effort', 'Very low', 'Low', 'Medium'],
          ['Free learning', 'Sandbox: 10 GB storage, 1 TB queries/month', '30-day trial', 'Free trial'] ] } },
        { note: 'Learn on BigQuery sandbox (no card needed) and DuckDB locally. Concepts transfer to all of them.' }),
      C('Loading data (COPY, batch loads, streaming inserts)', `- **Batch load / COPY** — load files from cloud storage. Cheapest and fastest; the default.
- **Streaming inserts** — row by row in near real time. Costs more; use only when needed.
- **External tables** — query files in place without loading.`,
        { code: `-- BigQuery: load Parquet files from Cloud Storage
LOAD DATA INTO shop.orders
FROM FILES (format = 'PARQUET', uris = ['gs://my-bucket/orders/2026-11-26/*.parquet']);

-- Snowflake equivalent
COPY INTO orders FROM @raw_stage/orders/2026-11-26/ FILE_FORMAT = (TYPE = PARQUET);`, lang: 'sql' }),
      C('Partitioning & clustering', `- **Partitioning** splits a table by a column (usually date). Filters on it skip whole partitions.
- **Clustering** sorts data within partitions by other columns (customer_id, city), so filters on those skip blocks too.`,
        { code: `CREATE TABLE shop.orders
PARTITION BY DATE(created_at)
CLUSTER BY customer_id, city AS
SELECT * FROM shop.orders_raw;

-- scans only one day's partition
SELECT SUM(amount) FROM shop.orders WHERE DATE(created_at) = '2026-11-26';`, lang: 'sql' }),
      C('Query cost & optimisation', `In BigQuery on-demand you pay per **bytes scanned**. The rules:

- Select only the columns you need — never \`SELECT *\`.
- Always filter on the partition column.
- Pre-aggregate into smaller tables for dashboards.
- Check the estimate before running (BigQuery shows "This query will process X GB").
- Avoid repeated full scans in loops; materialise once.`,
        { note: 'Set a project-level quota or a maximum bytes billed on your account on day one. Students do get surprise bills.' }),
      C('Access control & sharing', `Grant access by **role**, at the smallest scope that works: project → dataset → table → column/row.

- Analysts: read on marts only.
- Pipelines: a service account with write on their own datasets.
- Sensitive columns (phone, email): column-level security or masking views.
- Share data with other teams through authorised views or data sharing, not by copying.`),
    ],
    quiz: [
      Q('In BigQuery on-demand, cost mainly depends on…', ['Number of rows returned', 'Bytes scanned', 'Query length', 'Time of day'], 1, 'You pay for data read.'),
      Q('Fastest, cheapest way to load a day of Parquet files?', ['Streaming inserts', 'Batch load / COPY from storage', 'INSERT row by row', 'Via a dashboard'], 1, 'Bulk loads are free or cheap and fast.'),
      Q('Clustering by customer_id helps queries that…', ['Filter on customer_id', 'Use SELECT *', 'Have no WHERE', 'Join on date only'], 0, 'Sorted blocks can be skipped.'),
      Q('Analysts should usually get access to…', ['Raw datasets with write', 'Marts with read only', 'The whole project as owner', 'Service account keys'], 1, 'Least privilege.'),
    ],
    practice: 'Open the BigQuery sandbox, query a public dataset (bigquery-public-data.new_york_taxi_trips). Compare bytes processed for SELECT * vs two columns with a date filter.',
    explain: 'Explain why "SELECT *" costs more in a columnar warehouse than in Postgres.',
  },

  'de-patterns': {
    intro: 'The recurring problems every real pipeline hits — and the standard answers seniors reach for.',
    concepts: [
      C('Deduplication & late-arriving data', `Sources resend rows and events arrive late. Standard dedupe: keep the latest version per key using a window function.`,
        { code: `SELECT * EXCEPT(rn) FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC, _loaded_at DESC) AS rn
  FROM raw.orders
) WHERE rn = 1;`, lang: 'sql' },
        { note: 'For late data, reprocess a rolling window (e.g. the last 3 days) on every run instead of only "yesterday".' }),
      C('MERGE / upsert patterns', `MERGE combines insert, update and delete in one atomic statement — the warehouse version of upsert.`,
        { code: `MERGE INTO dw.orders t
USING staging.orders_today s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
  UPDATE SET amount = s.amount, status = s.status, updated_at = s.updated_at
WHEN NOT MATCHED THEN
  INSERT (order_id, amount, status, updated_at) VALUES (s.order_id, s.amount, s.status, s.updated_at);`, lang: 'sql' },
        { note: 'The `s.updated_at > t.updated_at` guard stops an old, late record from overwriting newer data.' }),
      C('Backfills without breaking downstream', `Re-processing history is routine (a bug fix, a new column). Do it safely:

- Make every job take a date range and be idempotent.
- Backfill into a **new table or version**, validate, then swap.
- Process in chunks (a week at a time) to control cost.
- Pause or warn downstream consumers; announce the window.`,
        { flow: ['Build orders_v2 for history', 'Compare with v1 (counts, sums)', 'Swap view to v2', 'Drop v1 later'] }),
      C('Handling schema changes', `When a source adds, renames or changes a column:

- **Detect** — compare incoming schema to expected; alert on change.
- **Additive changes** (new column) — accept automatically into raw.
- **Breaking changes** (rename, type change) — quarantine and fix the mapping in staging.
- Keep raw as-is so you can reprocess after updating the mapping.`),
      C('Partition overwrite vs append', `- **Append** — add new rows. Fast, but re-running duplicates data.
- **Partition overwrite** — replace the whole partition (the day) on each run. Naturally idempotent for daily jobs.`,
        { code: `# Spark: only the partitions present in df are replaced
spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")
df.write.mode("overwrite").partitionBy("date").parquet("s3://lake/orders/")`, lang: 'python' },
        { note: 'Without dynamic mode, "overwrite" in Spark deletes the entire table, not just the day. A famous data-loss bug.' }),
      C('Data contracts with producers', `Most pipeline breakages start upstream. Agree with the team that owns the source: schema, meaning, freshness, and how they will announce breaking changes. Enforce it in their CI where possible.`,
        { note: 'Senior move: instead of fixing the same break every month, get a contract signed and a schema check added on the producer side.' }),
      C('Cost-aware pipeline design', `Cost is a design constraint, like latency.

- Incremental over full refresh for big tables.
- Run only as often as the business needs (hourly costs ~24× daily).
- Filter and project early; avoid scanning raw repeatedly.
- Store hot data in the warehouse, cold history in cheap object storage.
- Tag resources and review the bill monthly.`),
    ],
    quiz: [
      Q('Keeping the latest row per key is usually done with…', ['DISTINCT', 'ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC)', 'GROUP BY all columns', 'UNION'], 1, 'Window function then filter rn = 1.'),
      Q('Why "WHEN MATCHED AND s.updated_at > t.updated_at"?', ['Speed', 'Stop old late records overwriting newer data', 'Required syntax', 'To delete rows'], 1, 'Guards against out-of-order updates.'),
      Q('Spark overwrite without dynamic partition mode…', ['Replaces only today', 'Deletes the whole table', 'Appends', 'Fails'], 1, 'Static mode replaces everything under the path.'),
      Q('Safest way to backfill a critical table?', ['Overwrite it in place at noon', 'Build a new version, validate, then swap', 'Delete and reload', 'Ask users to stop querying forever'], 1, 'Validate before consumers see it.'),
    ],
    practice: 'In DuckDB, create raw orders with duplicates and late updates, then write the dedupe query and a MERGE that never lets old data win.',
    explain: 'Explain append vs partition overwrite with the example of a daily attendance register.',
  },

  'de-spark': {
    intro: 'Spark processes data too big for one machine by splitting it across many. To use it well you must understand partitions and shuffles.',
    concepts: [
      C('Spark architecture: driver, executors, cluster managers', `- **Driver** — your program; builds the plan and coordinates.
- **Executors** — worker processes that run tasks on partitions of data.
- **Cluster manager** — gives out machines (YARN, Kubernetes, Databricks, or local mode on your laptop).`,
        { flow: ['Driver (plan)', 'Cluster manager', 'Executor 1', 'Executor 2', 'Executor N'] },
        { code: `pip install pyspark
python -c "from pyspark.sql import SparkSession; s=SparkSession.builder.master('local[*]').getOrCreate(); print(s.range(10).count())"`, lang: 'bash' },
        { note: 'Run it on your laptop: needs Java 17 (`sudo apt install openjdk-17-jdk` on Ubuntu). local[*] uses all CPU cores as executors. Spark UI: http://localhost:4040 while running.' }),
      C('RDDs vs DataFrames vs Spark SQL', `- **RDD** — low-level distributed collection of objects. Rarely written today.
- **DataFrame** — table with a schema; Spark's optimiser (Catalyst) plans it efficiently.
- **Spark SQL** — the same engine through SQL.

DataFrames and SQL compile to the same plan, so pick whichever reads better.`,
        { code: `df = spark.read.parquet("trips/")
df.filter("fare > 0").groupBy("zone").avg("fare").show()

df.createOrReplaceTempView("trips")
spark.sql("SELECT zone, AVG(fare) FROM trips WHERE fare > 0 GROUP BY zone").show()`, lang: 'python' }),
      C('Transformations, actions & lazy evaluation', `**Transformations** (filter, select, join, groupBy) only build a plan. **Actions** (count, show, write, collect) actually run it. This lets Spark optimise the whole chain — e.g. push filters down before reading.`,
        { code: `big = spark.read.parquet("trips/")          # nothing read yet
cheap = big.filter("year = 2025").select("zone", "fare")   # still nothing
cheap.write.parquet("out/")                  # action: now it runs, reading only needed data`, lang: 'python' },
        { note: 'Never call .collect() on big data — it pulls everything to the driver and crashes it.' }),
      C('Partitions, shuffles & the DAG', `Data is split into **partitions**; each is processed by one task. Some operations (groupBy, join, distinct) need rows with the same key on the same machine, so Spark **shuffles** — moves data across the network. Shuffles split the job into **stages** in the DAG and are the main cost.`,
        { flow: ['Stage 1: read + filter (no shuffle)', 'Shuffle by key', 'Stage 2: aggregate', 'Write'] },
        { code: `df.rdd.getNumPartitions()
spark.conf.set("spark.sql.shuffle.partitions", 64)   # default 200 — often too many for small data`, lang: 'python' }),
      C('Joins: broadcast, sort-merge, skew handling', `- **Broadcast join** — send a small table to every executor; no shuffle of the big table. Best when one side is small (< ~100 MB).
- **Sort-merge join** — shuffle both sides by key, sort, merge. Default for big-big joins.
- **Skew** — one key has far more rows (e.g. "unknown" city), so one task runs forever. Fixes: AQE skew join, salting the key, or handling the hot key separately.`,
        { code: `from pyspark.sql.functions import broadcast
trips.join(broadcast(zones), "zone_id")

spark.conf.set("spark.sql.adaptive.enabled", True)          # AQE: re-plans at runtime
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", True)`, lang: 'python' }),
      C('Caching & persistence', `If you reuse the same DataFrame in several actions, **cache** it so Spark does not recompute it from source each time. Unpersist when done; caching everything wastes memory.`,
        { code: `clean = raw.filter(...).dropDuplicates(["id"]).cache()
clean.count()            # materialises the cache
daily = clean.groupBy("day").count()
by_zone = clean.groupBy("zone").count()
clean.unpersist()`, lang: 'python' }),
      C('Reading the Spark UI', `The Spark UI (port 4040) is how you debug performance:

- **Jobs / Stages** — which stage is slow, and how many tasks.
- **Task time distribution** — if max ≫ median, you have **skew**.
- **Shuffle read/write** — large numbers mean expensive data movement.
- **Spill** — memory too small; data written to disk.
- **SQL tab** — the physical plan: was it a BroadcastHashJoin or SortMergeJoin?`,
        { note: 'Interview gold: "Stage 3 had one task taking 9 minutes while the median was 4 seconds — skew on the null city key. I filtered nulls into a separate path and runtime dropped from 11 to 2 minutes."' }),
      C('Tuning memory & parallelism', `Start with defaults, measure, then change one thing at a time:

- Target partition sizes of ~100–200 MB.
- shuffle.partitions ≈ 2–3× total executor cores for medium jobs (AQE can coalesce automatically).
- Executor memory: enough to avoid spill; don't give one executor everything.
- Fix data problems (skew, tiny files, SELECT *) before touching memory settings.`),
      C('Reading Scala / Java Spark code', `Many companies have Spark code in Scala. The API is nearly identical — you just need to read it.`,
        { code: `// Scala
val out = spark.read.parquet("trips/")
  .filter($"fare" > 0)
  .groupBy("zone")
  .agg(avg("fare").as("avg_fare"))
out.write.mode("overwrite").parquet("out/")`, lang: 'scala' },
        { note: 'Map it in your head: `$"col"` = `col("col")`, `val` = a variable that never changes, `.as` = `.alias`.' }),
      C('Hadoop, HDFS & Hive (legacy systems you will meet)', `Before cloud warehouses, big data ran on **Hadoop**: **HDFS** (distributed file system), **MapReduce** (batch processing, now replaced by Spark) and **Hive** (SQL over HDFS, with a **metastore** of table definitions).

Many Indian enterprises and banks still run these. The Hive metastore idea lives on in Spark catalogs, Glue and Unity Catalog.`),
    ],
    quiz: [
      Q('Which is an action?', ['filter', 'select', 'count', 'join'], 2, 'Actions trigger execution.'),
      Q('Best join when one table is 20 MB and the other 200 GB?', ['Sort-merge', 'Broadcast', 'Cartesian', 'Nested loop'], 1, 'Ship the small one everywhere; no big shuffle.'),
      Q('In the Spark UI, max task time is 50× the median. Likely cause?', ['Too much memory', 'Data skew', 'Broadcast join', 'Caching'], 1, 'One partition has far more data.'),
      Q('What causes a shuffle?', ['filter', 'select', 'groupBy', 'withColumn'], 2, 'Rows with the same key must meet on one executor.'),
      Q('Why avoid collect() on a large DataFrame?', ['It is slow to write', 'It pulls all data to the driver and can crash it', 'It deletes the cache', 'It is deprecated'], 1, 'The driver is a single machine.'),
    ],
    practice: 'Install PySpark locally, load one month of NYC taxi Parquet, do a groupBy and a join with the zones lookup. Open the Spark UI and find the shuffle. Then try broadcast() and compare.',
    explain: 'Explain a shuffle using a classroom: sorting answer sheets so each teacher gets one subject.',
  },

  'de-lake': {
    intro: 'A lakehouse puts warehouse features — transactions, schema, time travel — on top of cheap files in object storage.',
    concepts: [
      C('Data lake vs warehouse vs lakehouse', `- **Data lake** — files (Parquet, JSON) in cheap object storage. Flexible, cheap; but no transactions, easy to turn into a swamp.
- **Warehouse** — managed tables, fast SQL, governance; more expensive, mostly structured data.
- **Lakehouse** — open table formats on lake storage, giving ACID transactions and warehouse-like features while keeping cheap storage and openness.`,
        { table: { cols: ['', 'Lake', 'Warehouse', 'Lakehouse'], rows: [
          ['Storage cost', 'Low', 'Higher', 'Low'],
          ['ACID transactions', 'No', 'Yes', 'Yes'],
          ['Open formats', 'Yes', 'Usually no', 'Yes'],
          ['ML on raw files', 'Easy', 'Harder', 'Easy'] ] } }),
      C('Delta Lake & Apache Iceberg', `Both are **open table formats**: Parquet files plus a **transaction log / metadata layer** that records which files make up the table at each version. That log is what gives atomic writes, schema enforcement and time travel.`,
        { code: `pip install deltalake polars
python - <<'PY'
import polars as pl
df = pl.DataFrame({"id": [1, 2], "city": ["Mangaluru", "Udupi"]})
df.write_delta("lake/customers")                      # version 0
pl.DataFrame({"id": [3], "city": ["Mysuru"]}).write_delta("lake/customers", mode="append")  # version 1
print(pl.read_delta("lake/customers", version=0))     # time travel
PY`, lang: 'bash' },
        { note: 'Delta is strongest with Databricks; Iceberg is the most engine-neutral (Spark, Trino, Snowflake, BigQuery, DuckDB all read it). Learn the idea once; both work the same way.' }),
      C('Medallion architecture (bronze/silver/gold)', `A layering convention for lakehouses:`,
        { flow: ['Bronze: raw, as received', 'Silver: cleaned, deduped, typed', 'Gold: business aggregates & models'] },
        { note: 'Same idea as raw → staging → marts in dbt. Different names, same discipline.' }),
      C('Time travel & schema evolution', `- **Time travel** — query a table as it was at an earlier version or timestamp. Great for debugging ("what did this look like before yesterday's run?") and recovering from bad writes.
- **Schema evolution** — add columns safely; the format tracks schema per version.`,
        { code: `-- Spark SQL on Delta
SELECT * FROM silver.orders VERSION AS OF 12;
SELECT * FROM silver.orders TIMESTAMP AS OF '2026-11-26 06:00';
RESTORE TABLE silver.orders TO VERSION AS OF 12;   -- undo a bad write`, lang: 'sql' }),
      C('Databricks Free Edition', `Databricks offers a free edition for learning: notebooks, Spark, Delta Lake, Unity Catalog and SQL warehouses on small serverless compute — no credit card.

Use it for build de-6: upload taxi data, build bronze/silver/gold Delta tables, and read the query profiles.`,
        { note: 'Databricks skills appear in a large share of Indian DE job posts. A project on it is a strong resume line.' }),
    ],
    quiz: [
      Q('What gives Delta/Iceberg ACID transactions on plain files?', ['Parquet itself', 'A transaction log / metadata layer', 'HDFS', 'Indexes'], 1, 'The log defines the table version atomically.'),
      Q('Silver layer typically holds…', ['Raw JSON as received', 'Cleaned, deduplicated, typed data', 'Dashboards', 'ML models'], 1, 'Bronze is raw; gold is business-level.'),
      Q('A bad job corrupted a Delta table. Fastest recovery?', ['Reload from source', 'RESTORE to the previous version', 'Delete the table', 'Vacuum'], 1, 'Time travel lets you roll back.'),
      Q('Most engine-neutral table format?', ['Delta', 'Iceberg', 'CSV', 'ORC'], 1, 'Iceberg is supported by nearly every engine.'),
    ],
    practice: 'With the deltalake + polars snippet, create a table, append twice, read version 0, then simulate a bad overwrite and recover it.',
    explain: 'Explain lake vs warehouse vs lakehouse using storage: a godown, a supermarket, and a godown with a proper inventory register.',
  },

  'de-azure': {
    intro: 'Azure is widely used by Indian enterprises and service companies. This maps everything you learned onto Azure services.',
    concepts: [
      C('Azure Data Lake Storage Gen2', `ADLS Gen2 is Azure Blob Storage with a **hierarchical namespace** — real folders, fast renames and folder-level permissions. It is the storage layer for Azure lakehouses.

Path format: \`abfss://<container>@<account>.dfs.core.windows.net/bronze/orders/\``,
        { note: 'Free path: an Azure free account gives credits for 30 days plus always-free limits. Students can use Azure for Students without a card.' }),
      C('Azure Data Factory pipelines', `ADF is Azure's managed ingestion and orchestration tool: drag-and-drop **pipelines** with **activities** (Copy, Data Flow, Notebook), **linked services** (connections) and **triggers** (schedule, event).`,
        { flow: ['Trigger (daily)', 'Copy: SQL DB → ADLS bronze', 'Databricks notebook: silver', 'Stored proc / notebook: gold'] },
        { note: 'Parameterise pipelines by date (like Airflow ds) so you can rerun and backfill any day.' }),
      C('Azure Databricks', `Databricks running inside Azure, connected to ADLS and Entra ID. Same Spark, Delta and notebooks you learned — the most common Azure DE stack in job posts: **ADF + ADLS + Databricks**.`),
      C('Microsoft Fabric (lakehouse, pipelines, warehouse)', `Fabric is Microsoft's all-in-one analytics platform: **OneLake** (one lake for the whole organisation, Delta format), **lakehouses**, **warehouses**, **data pipelines** (ADF inside), **notebooks** (Spark) and **Power BI** — under one capacity and one bill.`,
        { note: 'Fabric is replacing Synapse for new projects. Its free trial capacity is enough to build a full medallion project.' }),
      C('Synapse (legacy context)', `Azure Synapse Analytics combined a dedicated SQL warehouse, serverless SQL over the lake, and Spark pools. Many existing projects still run on it; new ones mostly choose Fabric or Databricks. Know the words so you can work on older systems.`),
      C('DP-700 Fabric Data Engineer path', `**DP-700: Implementing Data Engineering Solutions Using Microsoft Fabric** is Microsoft's data engineering certification. Microsoft Learn has a free learning path and a free practice assessment.

Topics: ingestion with pipelines and dataflows, lakehouse and warehouse design, Spark notebooks, real-time intelligence, security and monitoring.`,
        { note: 'A cert is a tie-breaker, not a replacement for projects. Do it after you have built de-4 and de-6, so the exam just names things you already did.' }),
    ],
    quiz: [
      Q('What makes ADLS Gen2 different from plain Blob storage?', ['It is free', 'Hierarchical namespace with real folders and ACLs', 'It stores only CSV', 'It runs Spark'], 1, 'The hierarchical namespace is the key feature.'),
      Q('Most common Azure DE stack in job posts?', ['ADF + ADLS + Databricks', 'Excel + SharePoint', 'Cosmos DB only', 'Azure Functions only'], 0, 'Ingest with ADF, store in ADLS, transform in Databricks.'),
      Q('Fabric’s single organisation-wide lake is called…', ['DeltaLake', 'OneLake', 'DataVerse', 'BlobLake'], 1, 'OneLake.'),
    ],
    practice: 'On Microsoft Learn, complete the first DP-700 module and draw the ADF → ADLS → Databricks pipeline for build de-4 on your board.',
    explain: 'Map your local stack (Postgres, files, Airflow, Spark) to Azure services in a two-column table and explain it.',
  },
}
