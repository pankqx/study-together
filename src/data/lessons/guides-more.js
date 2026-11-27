// Capstone walkthroughs — flagships (team), data engineering and AI ladders
const S = (t, body, ...blocks) => ({ t, body, blocks })
const W = (title, intro, arch, steps, talk) => ({ title, intro, steps: [S('The architecture', 'What you are building, end to end:', { arch }), ...steps, S('Talk about it in interviews', talk)] })

export default {
  // ───────── FLAGSHIPS (team) ─────────
  'fl-1': W('Flagship: Study Together v2 on real infrastructure', 'Rebuild this app the industry way, together. 3–5 weeks. Every one of you owns a real part of a real system you use daily.',
    [['Front end (Ravi)', ['React/Next.js app', 'Design system']], ['API (Ravi)', ['FastAPI + Postgres', 'Auth', 'Events emitted']], ['Data (Pank)', ['Event pipeline → warehouse', 'dbt models', 'Weekly analytics']], ['AI (Pank)', ['Weekly recap + quiz from logs (RAG)']], ['Cloud & launch (Merel)', ['Terraform infra', 'CI/CD', 'Monitoring', 'Launch to other students']]],
    [
      S('Week 0 · Design together', 'One design doc: users, data model, API, event schema, infra diagram, who owns what, milestones. Review it on a call. Agree a Git workflow (PRs, reviews by another member).'),
      S('Week 1 · Walking skeleton', 'Login → write a log → see it on Today, deployed end to end (ugly is fine). CI running tests on every PR.'),
      S('Week 2 · Core features', 'Logs, builds, DSA log in the new API; every write emits an event (outbox table → queue). Front end consumes the API with TanStack Query.'),
      S('Week 3 · Data + AI', 'Events land in the warehouse; dbt builds daily/weekly marts; AI recap summarises each person’s week and generates 5 quiz questions from their logs, with evals.'),
      S('Week 4 · Production readiness', 'Terraform for all infra, staging + prod, monitoring dashboards and alerts, backups with a restore drill, security review.'),
      S('Week 5 · Launch', 'Merel runs a small launch to classmates: landing page, onboarding, feedback loop. Measure activation and retention.'),
      S('Postmortem', 'Each writes a retro of their part; one joint demo video; each adds the project to their resume with their specific contribution.'),
    ],
    '"Three of us rebuilt our study app as a production system: I owned the event pipeline, dbt warehouse and an AI weekly recap with evals; Ravi built the FastAPI back end and React front end; Merel owned Terraform, CI/CD and launch. We used it daily and onboarded 25 classmates."'),

  'fl-2': W('Flagship: Real-time analytics platform', 'Live events in, dashboards out in seconds, plus batch history. 3–4 weeks.',
    [['Source', ['Wikimedia recent-changes stream (or your app events)']], ['Streaming path', ['Kafka', 'Flink / Spark Streaming', 'ClickHouse → Grafana']], ['Batch path', ['Lakehouse (Iceberg on MinIO/S3)', 'dbt / Spark', 'Daily marts']], ['Platform', ['Terraform', 'Data quality checks', 'Cost report']]],
    [
      S('1 · Ingest', 'Producer reads the public stream and writes to Kafka with a schema (Avro + registry).'),
      S('2 · Real-time path', 'Windowed aggregations (edits per minute per wiki, top pages) into ClickHouse; Grafana dashboard refreshing every 5 s.'),
      S('3 · Batch path', 'Kafka → Iceberg bronze; Spark/dbt to silver/gold; daily history tables.'),
      S('4 · Quality on both', 'Schema checks, freshness alerts, late-data handling with watermarks.'),
      S('5 · Infrastructure', 'Everything in Docker Compose locally, then Terraform on a cloud free tier (or a single VM).'),
      S('6 · Measure', 'End-to-end latency, throughput, monthly cost estimate; what you would cut to halve cost.'),
    ],
    '"A Kappa-style platform: Kafka feeds both a Flink→ClickHouse real-time path with sub-5-second dashboards and an Iceberg lakehouse for history, with data-quality checks on both and a cost/latency report."'),

  'fl-3': W('Flagship: AI support desk SaaS', 'Companies upload docs; customers get cited answers; hard questions route to a human. 3–5 weeks.',
    [['Customer widget', ['Chat UI with citations']], ['SaaS app', ['Next.js dashboard', 'Multi-tenant FastAPI', 'Billing (test mode)']], ['AI', ['Per-tenant ingestion', 'Hybrid RAG + rerank', 'Confidence → human queue']], ['Ops', ['Evals per tenant', 'Tracing', 'Usage metering']]],
    [
      S('1 · Tenancy and auth', 'Organisations, members, roles; tenant isolation tested on every route (from be-7).'),
      S('2 · Ingestion pipeline', 'Upload PDFs/URLs → parse → chunk → embed → index with tenant_id filter (from ai-5 and ai-de).'),
      S('3 · Answering', 'Hybrid retrieval + rerank + cited answer; abstain and hand off when confidence is low.'),
      S('4 · Human queue', 'Agents see escalated conversations with context; their answers become new knowledge and eval cases.'),
      S('5 · Analytics', 'Deflection rate, CSAT, top unanswered questions, cost per answer per tenant.'),
      S('6 · Launch', 'Three friendly "customers" (local businesses or college clubs); Merel runs the go-to-market.'),
    ],
    '"A multi-tenant AI support desk: per-tenant ingestion, hybrid retrieval with citations, confidence-based handoff to humans, and per-tenant evals and cost metering. Three real organisations used it."'),

  'fl-4': W('Flagship: Launch a real product together', 'One idea, 20 real users, a month of running it, and an honest postmortem. 6–8 weeks total.',
    [['Discover', ['5 user interviews', 'Problem statement']], ['Build', ['MVP in 3 weeks']], ['Launch', ['20 real users']], ['Operate', ['1 month: metrics, on-call, fixes']], ['Learn', ['Postmortem + demo video']]],
    [
      S('1 · Find a real problem', 'Each brings 3 problems from people you know (hostel, college, family business). Interview 5 people for the top 2. Pick one with evidence.'),
      S('2 · Define the MVP', 'One core job done well. Write what is out of scope. Success metric (e.g. 20 weekly active users).'),
      S('3 · Build in 3 weeks', 'Reuse your stacks; weekly demos; ship to real users at the end of week 2 even if rough.'),
      S('4 · Launch', 'Merel leads: landing page, WhatsApp/LinkedIn/Instagram, onboarding messages, feedback form.'),
      S('5 · Operate for a month', 'On-call rota, error monitoring, weekly metrics review, ship fixes based on feedback.'),
      S('6 · Postmortem', 'What users actually did, what you got wrong, what you would build first next time. Publish it — that write-up is gold in interviews.'),
    ],
    '"We interviewed users, shipped an MVP in three weeks, got 20+ real users and ran it for a month with on-call and weekly metrics. Our postmortem covers what users did that we didn’t expect and what we’d change."'),

  // ───────── DATA ENGINEERING ─────────
  'de-2': W('Walkthrough: File formats & partitioning benchmark', 'Measure CSV vs JSON vs Parquet vs Avro on 5M rows. 2–4 days.',
    [['Data', ['5M rows (NYC taxi month or generated)']], ['Writers', ['pandas/PyArrow', 'fastavro']], ['Readers', ['DuckDB queries']], ['Output', ['Size + speed table, charts']]],
    [
      S('1 · Data', 'Download one month of NYC taxi Parquet (~3M rows) or generate 5M rows with realistic types.'),
      S('2 · Write every format', 'CSV, JSON lines, Parquet (snappy, zstd), Avro; record write time and file size.', { code: `import pyarrow.parquet as pq, pyarrow as pa, time
t = pa.Table.from_pandas(df)
for codec in ["snappy", "zstd"]:
    s = time.time(); pq.write_table(t, f"trips_{codec}.parquet", compression=codec); print(codec, time.time() - s)`, lang: 'python' }),
      S('3 · Query each', 'Same 3 DuckDB queries (count by day, avg fare by zone, filter one day) on each format; time them.'),
      S('4 · Partitioning', 'Write Parquet partitioned by date; compare full scan vs one-day query; then over-partition by hour to show the small-files problem.'),
      S('5 · Publish', 'Table + charts + "when to use which" recommendations.'),
    ],
    '"I benchmarked CSV, JSON, Avro and Parquet on 5M rows: Parquet with zstd was 8× smaller than CSV and one-day queries were 40× faster with date partitioning — and over-partitioning by hour made them slower again."'),

  'de-3': W('Walkthrough: Star-schema warehouse', 'Model a retail dataset into facts and dimensions with SCD type 2. About 1 week.',
    [['Source', ['Retail OLTP tables (orders, items, customers, products)']], ['Warehouse (DuckDB/BigQuery)', ['fct_order_line', 'dim_customer (SCD2)', 'dim_product', 'dim_date', 'dim_store']], ['Serve', ['Metabase dashboard']]],
    [
      S('1 · Business process and grain', 'Sales; grain = one row per order line. Write it at the top of the README.'),
      S('2 · Dimensions', 'Customer (SCD2 on city/segment), product, store, date (generated with generate_series, with Indian festival flags).'),
      S('3 · Fact', 'Quantity, unit price, discount, amount; surrogate keys to dimensions (point-in-time customer key).'),
      S('4 · Incremental loads', 'Load new orders daily; apply SCD2 changes from a customer snapshot diff.'),
      S('5 · Answer 10 questions', 'Revenue by month and region, repeat-customer rate, festival uplift, top products per category.'),
      S('6 · Dashboard', 'Metabase on the star; a non-technical friend answers a question alone.'),
    ],
    '"I modelled retail data as a star schema at order-line grain with an SCD2 customer dimension, loaded incrementally, and built a dashboard a non-technical user could use — e.g. measuring Diwali sales uplift by region."'),

  'de-4': W('Walkthrough: Orchestrated ELT with Airflow + dbt', 'A daily pipeline with backfills, tests and docs. About 1–1.5 weeks. The core modern DE skill set.',
    [['Sources', ['de-1 API extractor', 'CSV drops']], ['Airflow (Docker)', ['extract → load_raw → dbt_build → notify']], ['Warehouse', ['raw → staging → marts (dbt)']], ['Quality', ['dbt tests', 'Alerts']]],
    [
      S('1 · Airflow locally', 'Official docker-compose; your DAG folder mounted; connections in Airflow UI or env.'),
      S('2 · DAG', 'Tasks use the logical date; extract writes to raw partition for that date; load is idempotent (partition overwrite).', { code: `@dag(schedule="0 6 * * *", start_date=pendulum.datetime(2026, 9, 1, tz="Asia/Kolkata"), catchup=True, max_active_runs=3)
def air_quality():
    @task(retries=3)
    def extract(ds=None): return extract_day(ds)
    @task
    def load(path, ds=None): load_partition(path, ds)
    dbt = BashOperator(task_id="dbt_build", bash_command="cd /dbt && dbt build --vars '{day: {{ ds }}}'")
    load(extract()) >> dbt
air_quality()`, lang: 'python' }),
      S('3 · dbt project', 'Sources, staging, marts, generic + singular tests, docs and lineage graph.'),
      S('4 · Backfill 90 days', 'Run the backfill; prove re-running a day is safe; measure total time.'),
      S('5 · Alerts', 'on_failure_callback to Telegram/Slack with the task and log link; freshness check for the main mart.'),
      S('6 · CI', 'GitHub Actions runs dbt build on a CI target for every PR.'),
    ],
    '"A daily ELT pipeline in Airflow and dbt, fully idempotent by logical date — I backfilled 90 days, re-ran days safely, and every mart is guarded by dbt tests and freshness alerts, with CI on every PR."'),

  'de-5': W('Walkthrough: Data quality & observability', 'Contracts, checks and alerts so bad data never reaches a dashboard. About 1 week.',
    [['Producer', ['Data contract (YAML)']], ['Pipeline', ['Schema / null / range / unique checks', 'Quarantine table']], ['Observability', ['Freshness & volume monitors', 'Alerts with lineage']]],
    [
      S('1 · Contract', 'Write a contract for your main source: fields, types, allowed values, freshness SLA, owner.'),
      S('2 · Checks', 'Soda or Great Expectations (or dbt tests) on raw and staging: schema, nulls, ranges, uniqueness, referential integrity.'),
      S('3 · Quarantine', 'Route bad rows to a quarantine table with the failed rule, instead of failing the whole run.'),
      S('4 · Volume and freshness', 'Anomaly check vs 14-day average; freshness SLA alerts.'),
      S('5 · Chaos test', 'Inject 5 kinds of bad data (nulls, duplicates, wrong types, late data, 90% drop in volume) — every one must be caught and alerted.'),
      S('6 · Lineage', 'Diagram (dbt docs or OpenLineage/Marquez) linked from alerts showing affected dashboards.'),
    ],
    '"I added contracts, quality checks, quarantine and volume/freshness monitoring to my pipeline, then injected five kinds of bad data — all caught, with alerts naming the affected dashboards."'),

  'de-6': W('Walkthrough: Spark lakehouse at scale', 'NYC taxi through bronze/silver/gold with Iceberg or Delta, tuned with numbers. 2–3 weeks.',
    [['Storage', ['MinIO/S3 or Databricks Free Edition']], ['Bronze', ['Raw Parquet as received']], ['Silver', ['Cleaned, deduped, typed (Delta/Iceberg)']], ['Gold', ['Daily zone metrics, driver economics']], ['Analysis', ['Spark UI before/after']]],
    [
      S('1 · Data', '12+ months of NYC taxi data (hundreds of millions of rows across files) plus the zones lookup.'),
      S('2 · Bronze', 'Land files as-is with ingest metadata.'),
      S('3 · Silver', 'Clean (negative fares, impossible trips), dedupe, conform schemas across years (schema evolution), write Delta/Iceberg partitioned by month.'),
      S('4 · Gold', 'Aggregates per zone per day, airport trips, tip behaviour; broadcast-join zones.'),
      S('5 · Tune', 'Read the Spark UI: shuffle sizes, skew, spills. Fix partitions, AQE, broadcast; compact small files. Record before/after.'),
      S('6 · Lakehouse features', 'Time travel to a previous version; MERGE late-arriving corrections.'),
    ],
    '"A Spark lakehouse over a year of NYC taxi data with bronze/silver/gold Delta tables. Using the Spark UI I fixed a skewed join and shuffle partitioning, cutting the gold job from 14 to 4 minutes."'),

  'de-7': W('Walkthrough: Real-time CDC pipeline', 'Postgres changes → Debezium → Kafka → stream processing → ClickHouse → live dashboard. 2–3 weeks.',
    [['Source', ['Postgres (logical replication)']], ['Capture', ['Debezium on Kafka Connect']], ['Stream', ['Kafka topics per table', 'Flink / Spark Streaming']], ['Serve', ['ClickHouse', 'Grafana live dashboard']]],
    [
      S('1 · Compose stack', 'Postgres (wal_level=logical), Kafka (KRaft), Kafka Connect with Debezium, ClickHouse, Grafana.'),
      S('2 · Capture', 'Register the Debezium connector; watch insert/update/delete events in a console consumer.'),
      S('3 · Process', 'Parse change events; maintain current-state tables and windowed aggregates (orders per minute, revenue by city); handle deletes and late events.'),
      S('4 · Sink', 'Write to ClickHouse (ReplacingMergeTree for upserts); Grafana dashboard refreshes every few seconds.'),
      S('5 · Failure drills', 'Restart Kafka Connect, the processor and ClickHouse; verify no lost or duplicated results; document guarantees honestly.'),
      S('6 · Measure', 'Insert → dashboard latency (target < 5 s); throughput with a load generator.'),
    ],
    '"A log-based CDC pipeline from Postgres through Debezium and Kafka into ClickHouse with sub-5-second dashboards; I ran restart drills and documented exactly where the guarantees are exactly-once and where they’re at-least-once with idempotent sinks."'),

  // ───────── AI ─────────
  'ai-1': W('Walkthrough: ML from scratch in NumPy', 'Linear and logistic regression with your own gradient descent. 2–4 days.',
    [['Data', ['Synthetic + a small real dataset']], ['Your code', ['Loss', 'Gradients', 'Gradient descent', 'Regularisation']], ['Check', ['Compare with scikit-learn']]],
    [
      S('1 · Derive on paper', 'MSE loss and its gradient for linear regression; log-loss gradient for logistic regression.'),
      S('2 · Linear regression', 'Vectorised gradient descent; plot loss vs iterations for 3 learning rates (one diverges).', { code: `def fit(X, y, lr=0.01, epochs=1000):
    w = np.zeros(X.shape[1]); b = 0.0
    for _ in range(epochs):
        err = X @ w + b - y
        w -= lr * (2 / len(y)) * (X.T @ err); b -= lr * (2 / len(y)) * err.sum()
    return w, b`, lang: 'python' }),
      S('3 · Logistic regression', 'Sigmoid, log-loss, L2 regularisation, decision threshold.'),
      S('4 · Feature scaling', 'Show training with and without standardisation.'),
      S('5 · Verify', 'Match scikit-learn coefficients and accuracy to 3 decimals.'),
      S('6 · Explain', 'Notebook with plots explaining bias vs variance using polynomial features.'),
    ],
    '"I implemented linear and logistic regression with vectorised gradient descent and L2 regularisation, matched scikit-learn to three decimals, and used loss curves to show learning-rate divergence and the effect of feature scaling."'),

  'ai-2': W('Walkthrough: Tabular ML, end to end', 'A Kaggle-style problem done properly. 2–4 days.',
    [['Data', ['Kaggle tabular dataset']], ['Pipeline', ['EDA', 'sklearn Pipeline', 'CV', 'XGBoost']], ['Output', ['Error analysis', 'Model card']]],
    [
      S('1 · EDA', 'Grain, target balance, missingness, leakage hunt; 5 findings.'),
      S('2 · Baseline', 'Logistic regression in a Pipeline with proper CV — the number to beat.'),
      S('3 · Features', 'Aggregates, ratios, date parts, target encoding out-of-fold.'),
      S('4 · XGBoost + tuning', 'Optuna with CV; early stopping.'),
      S('5 · Error analysis', 'Where does it fail? Segments, confusion matrix, threshold choice from business costs.'),
      S('6 · Model card', 'Data, metrics, limitations, fairness checks per group.'),
    ],
    '"On a churn dataset I built a leakage-safe sklearn pipeline, beat a logistic baseline with tuned XGBoost, chose the decision threshold from business costs, and documented limits in a model card."'),

  'ai-3': W('Walkthrough: Neural nets — autograd to CNN', 'Tiny autograd, then a PyTorch image classifier served as an API. About 1 week.',
    [['From scratch', ['Value class + backprop', 'MLP']], ['PyTorch', ['CNN on CIFAR-10 / Fashion-MNIST', 'Colab GPU']], ['Serve', ['FastAPI endpoint', 'Upload page']]],
    [
      S('1 · micrograd', 'Value objects with grad and backward(); train a tiny MLP on a toy dataset.'),
      S('2 · PyTorch CNN', 'Conv → ReLU → Pool blocks; train on Colab; plot train/val curves.'),
      S('3 · Improve', 'Augmentation, dropout, weight decay, LR schedule; then transfer learning from a pretrained ResNet — compare.'),
      S('4 · Export and serve', 'TorchScript/ONNX or state_dict; FastAPI /predict; simple upload page.'),
      S('5 · Report', 'Accuracy, confusion matrix, latency per image on CPU.'),
    ],
    '"I built a micrograd-style autograd engine to understand backprop, then trained a CNN in PyTorch, showed transfer learning beat training from scratch by 12 points, and served it via FastAPI."'),

  'ai-4': W('Walkthrough: LLM app with tools', 'A streaming assistant with tools, structured output and per-request cost tracking. About 1 week.',
    [['UI', ['React chat with streaming']], ['API', ['FastAPI /chat (SSE)', 'Tool registry', 'Pydantic outputs']], ['Model', ['OpenRouter / OpenAI-compatible', 'or local Ollama']], ['Ops', ['Cost + latency log per request']]],
    [
      S('1 · Streaming chat', 'FastAPI endpoint streaming tokens via SSE; React renders as they arrive.'),
      S('2 · Tools', 'Three tools: search your Study Together logs, a calculator, today’s DSA stats. Validate arguments; timeouts; errors returned to the model.'),
      S('3 · Structured output', 'A "make a study plan" mode returning a Pydantic-validated JSON plan; retry once on validation failure.'),
      S('4 · Safety', 'Treat tool results as data; read-only tools; refuse destructive actions.'),
      S('5 · Cost and latency', 'Log tokens, cost and time per request; show cost in the UI for transparency.'),
      S('6 · Evals', '30 test conversations with expected tool use; pass rate in CI.'),
    ],
    '"A streaming LLM assistant with validated tool calling and structured outputs, per-request cost and latency logging, and a 30-case eval suite in CI — the eval caught a prompt change that broke tool selection."'),

  'ai-5': W('Walkthrough: RAG over real documents — with evals', 'Ask questions over documents and prove quality with numbers. About 1–1.5 weeks.',
    [['Ingest', ['Parse PDFs / lessons', 'Chunk (3 strategies)', 'Embed']], ['Index', ['pgvector + BM25']], ['Answer', ['Hybrid retrieve → rerank → cited answer']], ['Evals', ['50 Q&A pairs', 'recall@5, faithfulness, latency']]],
    [
      S('1 · Corpus', 'Use the Study Together lessons (export them as Markdown) plus a few PDFs.'),
      S('2 · Eval set first', 'Write 50 questions with the source passage for each — before building retrieval.'),
      S('3 · Baseline', 'Fixed-size chunks + vector search; measure recall@5.'),
      S('4 · Improve one thing at a time', 'Heading-aware chunks, title prefixes, hybrid BM25+vector, reranker — record each result in a table.'),
      S('5 · Answering', 'Cited answers; abstain when retrieval confidence is low; faithfulness judged by an LLM checked against 20 human labels.'),
      S('6 · Ship', 'Small UI; tracing (Langfuse); README with the eval table.'),
    ],
    '"I built RAG over our course notes with an eval set written first; heading-aware chunking, hybrid search and a reranker took recall@5 from 0.62 to 0.88, with answers that cite sources and abstain when evidence is weak."'),

  'ai-6': W('Walkthrough: Agent that does real work', 'A data-analyst agent over your warehouse — planned, guarded, traced and evaluated. 2–3 weeks.',
    [['User', ['Natural-language question']], ['Agent loop (step cap)', ['list_tables', 'describe_table', 'run_sql (read-only)', 'make_chart']], ['Warehouse', ['de-3 star schema in DuckDB']], ['Ops', ['Tracing', '30-task eval']]],
    [
      S('1 · Tools', 'Read-only DB user; tools with strict schemas; row limits and timeouts; schema docs from dbt.'),
      S('2 · Loop', 'Plan → act → observe with an 8-step cap; the agent sees SQL errors and may retry once.'),
      S('3 · Guardrails', 'SQL parser blocks non-SELECT; human approval for exporting data; PII columns masked.'),
      S('4 · Eval suite', '30 questions with correct result sets; compare results, not SQL text; track pass rate, steps and cost.'),
      S('5 · Compare to a workflow', 'Implement the same as a fixed text-to-SQL chain; report which wins and when.'),
      S('6 · Trace and ship', 'Every step traced; UI shows the SQL and the chart for trust.'),
    ],
    '"A text-to-SQL analyst agent with read-only, sandboxed tools, an 8-step cap and full tracing. On 30 evaluation questions it scored 83% — and I showed a simpler fixed chain matched it on easy questions at a third of the cost."'),

  'ai-7': W('Walkthrough: Fine-tune, serve and monitor', 'LoRA fine-tune a small open model, compare honestly with prompting, serve and monitor it. 2–3 weeks.',
    [['Data', ['Clean task dataset (500–2,000 examples)']], ['Train', ['QLoRA on Colab/Kaggle GPU', 'MLflow tracking']], ['Serve', ['Ollama / vLLM', 'FastAPI']], ['Monitor', ['Eval set', 'Drift + quality dashboard']]],
    [
      S('1 · Pick a narrow task', 'E.g. turning messy study notes into structured flashcards in your JSON format.'),
      S('2 · Dataset', 'Create and review examples; hold out 20% for evaluation.'),
      S('3 · Baselines', 'Prompt-only and few-shot with a small and a large model; measure.'),
      S('4 · Fine-tune', 'QLoRA with Unsloth/TRL on a free GPU; track runs in MLflow.'),
      S('5 · Compare honestly', 'Quality, latency, cost per 1,000 requests vs baselines — recommend one.'),
      S('6 · Serve and monitor', 'Export to GGUF for Ollama (or vLLM); FastAPI endpoint; weekly eval run and drift checks on inputs.'),
    ],
    '"I fine-tuned a small open model with QLoRA for structured flashcard generation, compared it with few-shot prompting of small and large models on quality, latency and cost, and served the winner with weekly automated evals."'),
}
