// Build guides — step-by-step walkthroughs. Same block format as lessons.
const S = (t, body, ...blocks) => ({ t, body, blocks })

export const HOW_TO_BUILD = {
  title: 'How to do any build',
  intro: 'The same method works for all 67 builds. Follow it the first few times on purpose; after that it becomes how you work.',
  steps: [
    S('Day 0 · Read the brief and shrink it', `Read the project card: pitch, milestones, "done when". Then write in one sentence what the *smallest working version* is. Ship that first; everything else is a layer on top.`,
      { note: 'Example for de-1: "One Python script that pulls today’s air quality for Mangaluru and upserts it into Postgres." No scheduling, no alerts yet.' }),
    S('Day 0 · Write a one-page design doc', `Before any code, in your repo as \`docs/design.md\`:`,
      { code: `# <Project name>
## Problem      — what and for whom, in 2 lines
## Constraints  — data size, latency, cost, free tier only, laptop with 16 GB RAM
## Options      — 2 approaches, 3 pros/cons each
## Decision     — which one and why (this is the line interviewers ask about)
## Plan         — milestones in order
## Risks        — what could go wrong, and how you will know`, lang: 'markdown' },
      { note: 'Post it on the call agenda. 10 minutes of review from a friend saves a day of rework.' }),
    S('Day 1 · Make the skeleton run end to end', `Create the repo, the folder layout, a README with one setup command, and a "hello world" path through every part (source → script → database). Ugly but complete beats beautiful and half-built.`,
      { code: `project/
├── README.md          # what, why, how to run, architecture diagram
├── docs/design.md
├── src/               # your code
├── tests/
├── docker-compose.yml # databases and services
├── .env.example       # config keys, no secrets
└── .github/workflows/ci.yml`, lang: 'text' }),
    S('Every day · One milestone, then log it', `Work through the milestones in order. For each one:

- Learn only what that milestone needs — use the "Learn while you build" links.
- Commit small and often, with messages that say *why*.
- Add one line to the **decision log** whenever you choose between two things.
- Tick the milestone in the app — it keeps your streak and tells the crew.`,
      { flow: ['Pick milestone', 'Learn just enough', 'Build', 'Test', 'Commit', 'Log decision'] }),
    S('When stuck for 30 minutes · Debug like a senior', `- Write down what you **expected** and what **happened**.
- Shrink the problem: smallest input that still breaks.
- Read the full error, then the docs, then search.
- Still stuck after an hour? Post it on the crew log as a question — explaining it often solves it.`),
    S('Before shipping · Make it professional', `Go through the pro checklist on the build card:`,
      { table: { cols: ['Item', 'What good looks like'], rows: [
        ['Tests in CI', 'GitHub Actions runs pytest/lint on every push; badge in README'],
        ['One command', 'docker compose up or make run works on a friend’s laptop'],
        ['A real number', '"Loads 1.2M rows in 48 s" / "p95 120 ms" / "costs ₹0 on free tier"'],
        ['Architecture diagram', 'Drawn on your board, exported, in the README'],
        ['Retro', 'Hardest bug, one trade-off, what breaks at 10×'] ] } }),
    S('After shipping · Teach it and keep it', `- Demo it on the next call in 5 minutes: problem, diagram, one decision, one number, one bug.
- Pin the repo on GitHub and add one line to your resume.
- The app brings it back at 7, 30 and 90 days — explain it again out loud without looking.`,
      { note: 'Resume line formula: Built X using Y, which achieved Z (measured). "Built an idempotent ETL in Python and Postgres that loads 90 days of air-quality data in 40 s with zero duplicates on re-runs."' }),
  ],
}

// Step-by-step walkthroughs for individual builds, keyed by project id.
export const WALKTHROUGHS = {
  'de-1': {
    title: 'Walkthrough: Idempotent Python ETL',
    intro: 'Pull real air-quality data every day, clean it, and load it into Postgres so re-running never creates duplicates. About 2–4 days.',
    steps: [
      S('1 · Set up Postgres and the project', `Start Postgres in Docker and a Python project.`,
        { code: `# docker-compose.yml
services:
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: etl, POSTGRES_DB: air }
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
volumes: { pgdata: {} }`, lang: 'yaml' },
        { code: `docker compose up -d
python -m venv .venv && source .venv/bin/activate
pip install requests psycopg[binary] python-dotenv pytest
echo "DB_URL=postgresql://postgres:etl@localhost:5432/air" > .env`, lang: 'bash' }),
      S('2 · Design the table first', `Decide the grain: **one row per station, per parameter, per hour**. That combination is your natural key — it is what makes upserts possible.`,
        { code: `CREATE TABLE IF NOT EXISTS measurements (
  station_id   TEXT        NOT NULL,
  parameter    TEXT        NOT NULL,      -- pm25, pm10, no2…
  measured_at  TIMESTAMPTZ NOT NULL,      -- UTC
  value        NUMERIC     NOT NULL,
  unit         TEXT,
  _loaded_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (station_id, parameter, measured_at)
);`, lang: 'sql' }),
      S('3 · Extract with retries and pagination', `Use a public API (OpenAQ has free keys; any similar API works). Handle pages, timeouts and rate limits.`,
        { code: `# src/extract.py
import time, requests, logging
log = logging.getLogger("etl")

def get(url, params, headers, tries=5):
    for i in range(tries):
        r = requests.get(url, params=params, headers=headers, timeout=30)
        if r.status_code in (429, 500, 502, 503):
            wait = 2 ** i; log.warning("status %s, retry in %ss", r.status_code, wait); time.sleep(wait); continue
        r.raise_for_status(); return r.json()
    raise RuntimeError(f"gave up after {tries} tries: {url}")

def extract(url, day, headers):
    page, out = 1, []
    while True:
        data = get(url, {"date_from": f"{day}T00:00:00Z", "date_to": f"{day}T23:59:59Z", "page": page, "limit": 1000}, headers)
        rows = data["results"]
        if not rows: return out
        out += rows; page += 1`, lang: 'python' }),
      S('4 · Transform: validate and normalise', `Keep only valid rows, convert to UTC, and count what you dropped — never drop silently.`,
        { code: `# src/transform.py
from datetime import datetime, timezone

def transform(raw):
    good, bad = [], 0
    for r in raw:
        try:
            v = float(r["value"])
            if v < 0: raise ValueError("negative")
            good.append((str(r["station_id"]), r["parameter"].lower(),
                         datetime.fromisoformat(r["datetime"].replace("Z", "+00:00")).astimezone(timezone.utc),
                         v, r.get("unit")))
        except (KeyError, ValueError, TypeError):
            bad += 1
    return good, bad`, lang: 'python' }),
      S('5 · Load with an upsert (the idempotent part)', `ON CONFLICT on the primary key means re-running the same day updates rows instead of duplicating them.`,
        { code: `# src/load.py
import psycopg
SQL = """INSERT INTO measurements (station_id, parameter, measured_at, value, unit)
VALUES (%s, %s, %s, %s, %s)
ON CONFLICT (station_id, parameter, measured_at)
DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, _loaded_at = now()"""

def load(db_url, rows):
    with psycopg.connect(db_url) as con, con.cursor() as cur:
        cur.executemany(SQL, rows)     # one transaction: all or nothing
    return len(rows)`, lang: 'python' }),
      S('6 · Wire it together with logging', `A single entry point that takes the day as an argument — so you can re-run or backfill any day.`,
        { code: `# src/main.py
import sys, os, logging, time
from dotenv import load_dotenv
from extract import extract; from transform import transform; from load import load
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("etl"); load_dotenv()

def run(day):
    t = time.time()
    raw = extract(os.environ["API_URL"], day, {"X-API-Key": os.environ.get("API_KEY", "")})
    rows, bad = transform(raw)
    n = load(os.environ["DB_URL"], rows)
    log.info("day=%s extracted=%d loaded=%d dropped=%d secs=%.1f", day, len(raw), n, bad, time.time() - t)

if __name__ == "__main__":
    run(sys.argv[1])          # python src/main.py 2026-11-26`, lang: 'python' }),
      S('7 · Prove it is idempotent', `The "done when" test. Run the same day three times; the count must not change.`,
        { code: `for i in 1 2 3; do python src/main.py 2026-11-26; done
psql postgresql://postgres:etl@localhost:5432/air -c "SELECT COUNT(*) FROM measurements"`, lang: 'bash' },
        { code: `# tests/test_transform.py
from transform import transform
def test_drops_negative_and_counts_it():
    rows, bad = transform([{"station_id": 1, "parameter": "PM25", "datetime": "2026-11-26T10:00:00Z", "value": -3}])
    assert rows == [] and bad == 1`, lang: 'python' }),
      S('8 · Schedule, measure, write it up', `- Schedule daily with cron: \`5 6 * * * cd ~/de-1 && .venv/bin/python src/main.py $(date -d yesterday +%F)\`
- Backfill 30 days with a loop and time it — that is your **real number**.
- Add CI (pytest on push), an architecture diagram, and the retro. Ship it in the app.`,
        { note: 'Next rung (de-2) reuses this data. In de-4 you will replace cron with Airflow and see why it is better.' }),
    ],
  },
}
