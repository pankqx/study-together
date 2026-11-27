// DBMS — 13 lessons (university syllabus + industry practice)
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'db-model': {
    intro: 'Before any SQL: decide what things exist, how they relate, and how to represent them in tables.',
    concepts: [
      C('Entities, attributes, relationships', `**Entities** are things (Student, Course), **attributes** describe them (name, credits), **relationships** connect them (Student *enrols in* Course). Cardinality: one-to-one, one-to-many, many-to-many.`,
        { cards: [['1 : 1', 'User ↔ Profile'], ['1 : N', 'Course → Assignments'], ['M : N', 'Students ↔ Courses (needs a junction table)'], ['Weak entity', 'Exists only with its owner: Order line within Order']] }),
      C('ER diagrams', `ER diagrams draw entities as boxes, relationships as lines, with crow's-foot symbols for cardinality. M:N relationships become a **junction table** with two foreign keys (Enrolment: student_id, course_id, grade).`,
        { arch: [['Entities', ['Student', 'Course', 'Faculty']], ['Junction tables (M:N)', ['Enrolment (student_id, course_id, grade)']], ['1:N foreign keys', ['Course.faculty_id → Faculty.id']]] }),
      C('Relational model & keys', `Data lives in **relations** (tables) of **tuples** (rows) with **attributes** (columns).`,
        { cards: [['Super key', 'Any set of columns that uniquely identifies a row.'], ['Candidate key', 'A minimal super key (no extra columns).'], ['Primary key', 'The chosen candidate key.'], ['Foreign key', 'References a primary key in another table.'], ['Surrogate key', 'Generated id (serial/UUID) instead of a natural key.'], ['Composite key', 'Primary key of several columns (student_id, course_id).']] }),
      C('Relational algebra', `The math behind SQL — operations on tables that return tables. Common in university exams and how query planners think.`,
        { table: { cols: ['Operator', 'Symbol', 'SQL equivalent'], rows: [['Selection', 'σ', 'WHERE'], ['Projection', 'π', 'SELECT columns'], ['Join', '⋈', 'JOIN'], ['Union / Difference', '∪ / −', 'UNION / EXCEPT'], ['Cartesian product', '×', 'CROSS JOIN'], ['Rename', 'ρ', 'AS']] } },
        { code: `π name ( σ dept = 'CS' (Student) )
-- = SELECT name FROM Student WHERE dept = 'CS';`, lang: 'text' }),
      D('Deep dive: modelling tricky cases', `- **History**: "price at time of order" → copy price into order_line, don't just reference the product.
- **Soft deletes**: deleted_at column (but remember unique constraints and queries).
- **Polymorphic relations** ("comments on posts or builds") → separate FKs or separate tables, not a free-text type column without integrity.
- **Hierarchies** (categories, org chart) → parent_id + recursive CTEs.`),
    ],
    quiz: [
      Q('Students ↔ Courses many-to-many is implemented with…', ['One FK in Student', 'A junction table', 'A JSON column', 'Two databases'], 1, 'Enrolment table with two FKs.'),
      Q('A minimal set of columns that uniquely identifies a row is a…', ['Super key', 'Candidate key', 'Foreign key', 'Index'], 1, 'Minimal super key.'),
      Q('σ in relational algebra corresponds to…', ['SELECT columns', 'WHERE', 'JOIN', 'GROUP BY'], 1, 'Selection filters rows.'),
    ],
    practice: 'Do build db-1: ER diagram for a college, then the tables with every key and constraint.',
    explain: 'Explain primary vs foreign keys with roll numbers and a marks register.',
  },

  'db-sql': {
    intro: 'SQL is the most durable skill in tech — used by developers, data engineers, analysts and AI engineers alike.',
    concepts: [
      C('SELECT, WHERE, ORDER BY, LIMIT', `Logical order of execution (not writing order) explains most SQL confusion:`,
        { steps: [['FROM / JOIN', 'Build the combined rows.'], ['WHERE', 'Filter rows.'], ['GROUP BY', 'Form groups.'], ['HAVING', 'Filter groups.'], ['SELECT', 'Compute output columns (aliases created here).'], ['ORDER BY', 'Sort (can use aliases).'], ['LIMIT / OFFSET', 'Cut the result.']] },
        { note: 'That’s why you can’t use a SELECT alias in WHERE, but you can in ORDER BY.' }),
      C('Joins: inner, left, right, full, self, cross', `- **INNER** — only matching rows.
- **LEFT** — all left rows, NULLs where no match ("students with or without enrolments").
- **FULL** — all rows from both.
- **SELF** — a table joined to itself (employee → manager).
- **CROSS** — every combination.`,
        { code: `-- students who have NOT enrolled in anything (anti-join)
SELECT s.name FROM student s
LEFT JOIN enrolment e ON e.student_id = s.id
WHERE e.student_id IS NULL;`, lang: 'sql' },
        pick('LEFT JOIN orders o ... WHERE o.status = \'paid\'. What happens to customers with no orders?', ['They appear with NULLs', false], ['They disappear — the WHERE on the right table turns it into an inner join', true, 'Put the condition in the ON clause to keep them.'], ['Error', false])),
      C('GROUP BY, HAVING & aggregates', `Aggregates (COUNT, SUM, AVG, MIN, MAX) collapse groups. WHERE filters rows **before** grouping; HAVING filters groups **after**. \`COUNT(*)\` counts rows; \`COUNT(col)\` skips NULLs.`,
        { code: `SELECT course_id, COUNT(*) AS students, AVG(marks) AS avg_marks
FROM enrolment
WHERE year = 2026
GROUP BY course_id
HAVING COUNT(*) >= 10
ORDER BY avg_marks DESC;`, lang: 'sql' }),
      C('NULL handling', `NULL means unknown. \`NULL = NULL\` is not true (it's unknown) — use \`IS NULL\`. Aggregates skip NULLs. \`NOT IN (subquery with a NULL)\` returns nothing — prefer \`NOT EXISTS\`. Use \`COALESCE(x, 0)\` for defaults.`),
      C('INSERT, UPDATE, DELETE, UPSERT', `Always run UPDATE/DELETE with a WHERE you've first tested as a SELECT, ideally inside a transaction. Postgres upsert: \`INSERT … ON CONFLICT (key) DO UPDATE\`. \`RETURNING\` gives you the affected rows.`,
        { code: `BEGIN;
UPDATE enrolment SET grade = 'A' WHERE course_id = 12 AND marks >= 90 RETURNING student_id;
-- check the output, then
COMMIT;   -- or ROLLBACK;`, lang: 'sql' }),
      C('Constraints: primary, foreign, unique, check', `Constraints make bad data impossible — the database enforces rules even if app code has bugs.`,
        { code: `CREATE TABLE enrolment (
  student_id int REFERENCES student(id) ON DELETE CASCADE,
  course_id  int REFERENCES course(id),
  marks      int CHECK (marks BETWEEN 0 AND 100),
  PRIMARY KEY (student_id, course_id)
);`, lang: 'sql' }),
      C('Data types & choosing them', `Choose the most precise type: \`int/bigint\`, \`numeric(12,2)\` for money (never float), \`text\`, \`boolean\`, \`date\`, \`timestamptz\` (always with time zone), \`uuid\`, \`jsonb\` for flexible attributes, enums or check constraints for fixed sets.`),
      D('Deep dive: writing SQL you can trust', `Format consistently, alias clearly, qualify columns in joins, check row counts after every join, test with edge cases (NULLs, duplicates, empty groups), and compare results against a second method (e.g. a subquery vs a window function) when numbers matter.`),
    ],
    quiz: [
      Q('Which runs first logically?', ['SELECT', 'WHERE', 'ORDER BY', 'HAVING'], 1, 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.'),
      Q('Filter groups with COUNT(*) > 5 using…', ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], 1, 'HAVING filters groups.'),
      Q('Correct type for money?', ['float', 'numeric(12,2)', 'text', 'real'], 1, 'Exact decimal.'),
      Q('WHERE x = NULL returns…', ['Rows where x is null', 'No rows', 'Error', 'All rows'], 1, 'Use IS NULL.'),
    ],
    practice: 'Write the 30 queries from build db-1 against your college schema, including anti-joins and HAVING.',
    explain: 'Explain WHERE vs HAVING with filtering students before vs after grouping them by class.',
  },

  'db-sql2': {
    intro: 'The SQL that separates beginners from professionals — and dominates data interviews.',
    concepts: [
      C('Subqueries & correlated subqueries', `A **subquery** runs once; a **correlated subquery** references the outer row and conceptually runs per row.`,
        { code: `-- students scoring above their course average (correlated)
SELECT e.student_id, e.course_id, e.marks
FROM enrolment e
WHERE e.marks > (SELECT AVG(marks) FROM enrolment x WHERE x.course_id = e.course_id);`, lang: 'sql' }),
      C('CTEs & recursive CTEs', `CTEs (\`WITH\`) name intermediate results — readable step-by-step queries. **Recursive CTEs** walk hierarchies and generate series.`,
        { code: `WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS depth FROM employee WHERE id = 7
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.depth + 1 FROM employee e JOIN chain c ON e.id = c.manager_id
)
SELECT * FROM chain;   -- employee 7 and every manager above`, lang: 'sql' }),
      C('Window functions: ROW_NUMBER, RANK, DENSE_RANK', `Window functions compute across related rows **without collapsing them**.`,
        { table: { cols: ['marks', 'ROW_NUMBER', 'RANK', 'DENSE_RANK'], rows: [['95', '1', '1', '1'], ['90', '2', '2', '2'], ['90', '3', '2', '2'], ['85', '4', '4', '3']] } },
        { code: `-- top 3 students per course
SELECT * FROM (
  SELECT e.*, DENSE_RANK() OVER (PARTITION BY course_id ORDER BY marks DESC) AS r FROM enrolment e
) t WHERE r <= 3;`, lang: 'sql' }),
      C('LAG / LEAD & running totals', `Compare with previous/next rows and accumulate.`,
        { code: `SELECT day, minutes,
       minutes - LAG(minutes) OVER (ORDER BY day) AS change_vs_yesterday,
       SUM(minutes) OVER (ORDER BY day ROWS UNBOUNDED PRECEDING) AS running_total,
       AVG(minutes) OVER (ORDER BY day ROWS 6 PRECEDING) AS avg_7d
FROM daily_study;`, lang: 'sql' }),
      C('Pivoting & conditional aggregation', `Turn rows into columns with \`FILTER\` (Postgres) or \`SUM(CASE WHEN …)\`.`,
        { code: `SELECT course_id,
  COUNT(*) FILTER (WHERE grade = 'A') AS a_count,
  COUNT(*) FILTER (WHERE grade = 'B') AS b_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE marks >= 40) / COUNT(*), 1) AS pass_pct
FROM enrolment GROUP BY course_id;`, lang: 'sql' }),
      C('Date & time functions', `\`date_trunc('week', ts)\`, \`ts AT TIME ZONE 'Asia/Kolkata'\`, \`generate_series\` for calendars (fill missing days with zeros via LEFT JOIN), \`age()\`, intervals (\`now() - interval '30 days'\`).`),
      C('Views & materialised views', `A **view** is a saved query (always fresh, computed each time). A **materialised view** stores the result (fast reads, must be refreshed: \`REFRESH MATERIALIZED VIEW CONCURRENTLY\`). Use materialised views for expensive dashboard queries.`),
      C('Gaps-and-islands & sessionisation problems', `Classic interview patterns: consecutive streaks ("islands") and grouping events into sessions by inactivity gaps.`,
        { code: `-- sessionise clicks: new session after 30 min gap
SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id
FROM (
  SELECT user_id, ts,
         CASE WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) > interval '30 minutes'
              OR LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) IS NULL THEN 1 ELSE 0 END AS new_session
  FROM clicks) t;`, lang: 'sql' },
        pick('Find each person’s longest daily-study streak. Which technique?', ['GROUP BY day only', false], ['Gaps-and-islands: date minus ROW_NUMBER is constant within a streak', true, 'Group by that constant to get streaks.'], ['A CROSS JOIN', false])),
      D('Deep dive: window frame gotchas', `With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — ties are included together, which surprises people in running totals. Be explicit: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for a 7-row moving average. LAST_VALUE needs ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING to see the real last row.`),
    ],
    quiz: [
      Q('Scores 90, 90, 85 — DENSE_RANK gives…', ['1,2,3', '1,1,2', '1,1,3', '2,2,3'], 1, 'No gaps after ties.'),
      Q('Previous row’s value in a window?', ['LEAD', 'LAG', 'FIRST', 'PREV'], 1, 'LAG looks back.'),
      Q('Materialised views must be…', ['Never refreshed', 'Refreshed to update data', 'Indexed only', 'Temporary'], 1, 'They store results.'),
    ],
    practice: 'Do build db-2: 20 business questions on a real dataset using CTEs, windows, pivots and a gaps-and-islands query.',
    explain: 'Explain window functions with ranking students within each class without merging the classes.',
  },

  'db-norm': {
    intro: 'Normalisation removes redundancy so data can’t contradict itself — a university favourite and a real design tool.',
    concepts: [
      C('Functional dependencies', `A → B means: knowing A determines B. In Student(roll_no, name, dept, dept_head): roll_no → name, dept; dept → dept_head. That second dependency hints at redundancy (dept_head repeated for every student).`),
      C('1NF, 2NF, 3NF, BCNF', `Each normal form removes a kind of redundancy:`,
        { steps: [['1NF', 'Atomic values, no repeating groups (no "subjects: DBMS, OS" in one cell).'], ['2NF', '1NF + no partial dependency on part of a composite key (in Enrolment(student, course, student_name), name depends only on student).'], ['3NF', '2NF + no transitive dependency (roll_no → dept → dept_head: move dept_head to a Dept table).'], ['BCNF', 'For every dependency X → Y, X is a super key. Stricter than 3NF.']] },
        { table: { cols: ['Before (unnormalised)', 'After (3NF)'], rows: [['Student(roll, name, dept, dept_head)', 'Student(roll, name, dept_id)'], ['', 'Dept(dept_id, name, head)']] } }),
      C('When to denormalise', `Normalise for **writes and correctness** (OLTP). Denormalise deliberately for **reads** — reporting tables, caches, search indexes, analytics star schemas — and keep the normalised source of truth.`,
        pick('A dashboard joins 9 normalised tables on every page load and is slow. Reasonable fix?', ['Denormalise the whole OLTP database', false], ['Build a denormalised reporting table / materialised view refreshed on schedule', true, 'Keep the source normalised; optimise the read path.'], ['Remove foreign keys', false])),
      D('Deep dive: anomalies normalisation prevents', `- **Update anomaly**: dept head changes → must update many rows; miss one and data contradicts.
- **Insert anomaly**: can't record a new dept until a student joins it.
- **Delete anomaly**: deleting the last student of a dept loses the dept's head.
These three examples are exactly what university exams ask you to identify.`),
    ],
    quiz: [
      Q('A cell containing "DBMS, OS, CN" violates…', ['2NF', '1NF', '3NF', 'BCNF'], 1, 'Not atomic.'),
      Q('roll → dept → dept_head is a…', ['Partial dependency', 'Transitive dependency', 'Multivalued dependency', 'Trivial dependency'], 1, 'Removed in 3NF.'),
      Q('Analytics star schemas are…', ['Fully normalised', 'Deliberately denormalised for reads', 'In 1NF only', 'Illegal'], 1, 'Read-optimised.'),
    ],
    practice: 'Take a messy spreadsheet (e.g. class marks with teacher names repeated) and normalise it to 3NF with the dependencies written out.',
    explain: 'Explain update anomalies with a class WhatsApp group where everyone keeps their own copy of the timetable.',
  },

  'db-txn': {
    intro: 'How databases stay correct when many users change data at the same time. Core for interviews and for real bugs (double booking!).',
    concepts: [
      C('ACID', `- **Atomicity** — all or nothing.
- **Consistency** — constraints always hold.
- **Isolation** — concurrent transactions don't interfere (to a chosen degree).
- **Durability** — once committed, it survives crashes (WAL).`,
        { code: `BEGIN;
UPDATE wallet SET balance = balance - 500 WHERE user_id = 1;
UPDATE wallet SET balance = balance + 500 WHERE user_id = 2;
COMMIT;   -- both happen, or neither`, lang: 'sql' }),
      C('Isolation levels & anomalies', `Weaker isolation = more concurrency, more anomalies:`,
        { table: { cols: ['Level', 'Dirty read', 'Non-repeatable read', 'Phantom', 'Write skew'], rows: [['Read uncommitted', 'possible*', 'possible', 'possible', 'possible'], ['Read committed (Postgres default)', 'no', 'possible', 'possible', 'possible'], ['Repeatable read', 'no', 'no', 'no in Postgres', 'possible'], ['Serializable', 'no', 'no', 'no', 'no']] } },
        { note: '*Postgres treats Read uncommitted as Read committed. Write skew example: two doctors both go off-call because each saw the other still on call.' }),
      C('Locking, 2PL', `Locks control concurrent access: shared (read) and exclusive (write); row-level vs table-level. **Two-phase locking**: a transaction acquires locks (growing phase) and only releases them at the end (shrinking) — guaranteeing serializability. \`SELECT … FOR UPDATE\` takes row locks explicitly.`,
        { code: `BEGIN;
SELECT * FROM seat WHERE id = 42 AND status = 'free' FOR UPDATE;   -- others wait here
UPDATE seat SET status = 'held', held_by = 7 WHERE id = 42;
COMMIT;`, lang: 'sql' }),
      C('MVCC (how Postgres does it)', `**Multi-version concurrency control**: updates create a new row version instead of overwriting; each transaction sees a consistent **snapshot**. Readers never block writers and writers never block readers. Old versions are cleaned up by **VACUUM**.`,
        { steps: [['T1 starts', 'Snapshot taken.'], ['T2 updates row', 'Creates version 2; version 1 still visible to T1.'], ['T1 reads', 'Still sees version 1 (consistent snapshot).'], ['T2 commits', 'New transactions see version 2.'], ['VACUUM', 'Removes version 1 when no one can see it.']] }),
      C('Deadlocks', `T1 locks A then wants B; T2 locks B then wants A → both wait forever. Databases detect this and abort one (retry it). Prevent by always locking in a consistent order and keeping transactions short.`,
        pick('Two transfer transactions deadlock occasionally. Best prevention?', ['Bigger server', false], ['Lock accounts in a consistent order (e.g. lower id first) and retry on deadlock errors', true, 'Consistent ordering removes the cycle.'], ['Disable transactions', false])),
      D('Deep dive: preventing double booking — four ways', `1) \`SELECT … FOR UPDATE\` (pessimistic). 2) Conditional update \`UPDATE seat SET … WHERE id=42 AND status='free'\` and check rows affected = 1. 3) A unique constraint on (show_id, seat_id) in bookings — the DB rejects the second insert. 4) Serializable isolation with retries. Option 3 or 2 is often the simplest and most robust.`),
    ],
    quiz: [
      Q('Postgres default isolation level?', ['Serializable', 'Read committed', 'Repeatable read', 'Read uncommitted'], 1, 'Read committed.'),
      Q('In MVCC, readers and writers…', ['Block each other', 'Don’t block each other', 'Must use FOR UPDATE', 'Use table locks'], 1, 'Snapshots.'),
      Q('Which anomaly can still happen in Repeatable Read?', ['Dirty read', 'Write skew', 'Lost commit', 'Phantom in Postgres'], 1, 'Only Serializable prevents write skew.'),
    ],
    practice: 'Do build db-4: reproduce each anomaly with two terminals and fix it; then implement the seat booking with all four approaches.',
    explain: 'Explain ACID with a bank transfer between two friends.',
  },

  'db-idx': {
    intro: 'Indexes are the biggest lever on query speed. Learn how they work, so you add the right ones and read query plans.',
    concepts: [
      C('B-tree & hash indexes', `A **B-tree** keeps keys sorted in a balanced tree — supports equality, ranges, ORDER BY, prefix LIKE. Lookups are O(log n). **Hash** indexes support only equality. Postgres also has GIN (arrays, JSONB, full text), GiST (geo), BRIN (huge naturally-ordered tables).`,
        { arch: [['Root page', ['< M', '≥ M']], ['Internal pages', ['A–F', 'G–L', 'M–R', 'S–Z']], ['Leaf pages (sorted keys → row pointers)', ['…', 'Pank → row 81', 'Ravi → row 12', '…']]] }),
      C('Composite & covering indexes', `A composite index (a, b) works for filters on **a**, or **a and b** — not on b alone (leftmost-prefix rule). Put equality columns first, then range/sort columns. A **covering** index (\`INCLUDE\`) contains all needed columns so the table isn't touched (index-only scan).`,
        { code: `-- query: WHERE user_id = $1 AND day >= $2 ORDER BY day DESC
CREATE INDEX logs_user_day ON logs (user_id, day DESC) INCLUDE (minutes);`, lang: 'sql' },
        pick('Index on (user_id, day). Which query can use it efficiently?', ['WHERE day = \'2026-11-27\' only', false], ['WHERE user_id = 7 AND day > \'2026-11-01\'', true, 'Leftmost prefix: user_id first, then the range on day.'], ['WHERE minutes > 60', false])),
      C('EXPLAIN ANALYZE', `Shows the plan the database chose and real timings. Read it bottom-up; compare estimated vs actual rows (big gaps → bad statistics).`,
        { code: `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM logs WHERE user_id = 7 ORDER BY day DESC LIMIT 20;
-- Limit (actual time=0.04..0.09 rows=20)
--   -> Index Scan using logs_user_day on logs (actual rows=20)  ✅
-- vs before the index:
--   -> Sort -> Seq Scan on logs (rows=2,000,000)  ❌`, lang: 'sql' }),
      C('Join algorithms', `- **Nested loop** — for each outer row, look up inner (great with an index and few rows).
- **Hash join** — build a hash table of the smaller side, probe with the larger (big unsorted joins).
- **Merge join** — both sides sorted on the key, merge them (big sorted inputs).`),
      C('Statistics & the planner', `The cost-based planner estimates rows using table statistics (ANALYZE). Stale or misleading stats → bad plans (nested loop over a million rows). Run ANALYZE after big loads; consider extended statistics for correlated columns.`),
      D('Deep dive: why isn’t my index used?', `Common reasons: the query returns a large share of the table (seq scan is cheaper); a function on the column (\`WHERE lower(email) = …\` → needs an expression index); type mismatch; leading wildcard (\`LIKE '%x'\`); wrong column order in a composite; stale statistics; OR conditions across columns. Also remember: every index slows writes and uses disk.`),
    ],
    quiz: [
      Q('Index (a, b) helps WHERE b = 5 alone?', ['Yes, fully', 'Generally no (leftmost prefix)', 'Only on Sundays', 'Only hash'], 1, 'Needs a first.'),
      Q('An index-only scan is possible when…', ['The table is small', 'The index contains all columns the query needs', 'There is no WHERE', 'Always'], 1, 'Covering index.'),
      Q('WHERE lower(email) = … ignores the email index. Fix?', ['Drop the index', 'Create an expression index on lower(email)', 'Use LIKE', 'VACUUM'], 1, 'Index the expression.'),
    ],
    practice: 'Do build db-3: 10M rows, find slow queries, test 5 index types with EXPLAIN ANALYZE, publish before/after.',
    explain: 'Explain an index with a phone contacts list sorted by name.',
  },

  'db-storage': {
    intro: 'What happens below SQL: pages on disk, memory buffers, and the log that makes crashes survivable.',
    concepts: [
      C('Pages, heap files, buffer pool', `Data is stored in fixed-size **pages** (8 KB in Postgres). A table is a **heap file** of pages holding rows. The **buffer pool** (shared_buffers) caches pages in RAM; reads hit memory when possible, otherwise disk. Most performance work is about touching fewer pages.`),
      C('Row vs column storage', `Row stores (Postgres, MySQL) keep whole rows together — great for OLTP. Column stores (DuckDB, ClickHouse, Parquet) keep columns together — great for analytics scans and compression. (Covered from the data side in the DE course.)`),
      C('Write-ahead log', `Before changing data pages, the database writes the change to the **WAL** (an append-only log) and flushes it to disk. On commit only the WAL must be durable — sequential writes are fast. The WAL also powers replication and point-in-time recovery.`,
        { flow: ['UPDATE', 'Write record to WAL (fsync on commit)', 'Modify page in buffer pool', 'Page written to disk later'] }),
      C('Checkpoints & crash recovery', `A **checkpoint** flushes dirty pages to disk and marks a point in the WAL. After a crash, the database replays WAL records from the last checkpoint (**redo**) to restore all committed changes. (ARIES-style systems also undo uncommitted work.)`,
        pick('Power fails right after COMMIT returns, before the data page was written. Is the change lost?', ['Yes', false], ['No — it is in the WAL and replayed on restart', true, 'That is what durability via WAL means.'], ['Only if indexed', false])),
      D('Deep dive: why fsync and synchronous_commit matter', `fsync forces data to physical disk. Turning off synchronous_commit makes commits faster but may lose the last few hundred milliseconds of committed transactions on a crash (without corruption). Know this trade-off — it comes up in system design and in tuning bulk loads.`),
    ],
    quiz: [
      Q('Postgres default page size?', ['1 KB', '8 KB', '1 MB', '64 KB'], 1, '8 KB.'),
      Q('What makes commits durable cheaply?', ['Writing all data pages', 'Flushing the WAL sequentially', 'Indexes', 'VACUUM'], 1, 'WAL first.'),
    ],
    practice: 'Do build db-5 (Bitcask-style key-value store with an append-only log and crash recovery).',
    explain: 'Explain the write-ahead log with a shopkeeper writing every sale in a register before updating the shelf.',
  },

  'db-pg': {
    intro: 'PostgreSQL is the most popular database for new projects. These are the features you’ll use daily.',
    concepts: [
      C('psql & tooling', `\`psql\` is the command-line client; GUIs: DBeaver, pgAdmin, TablePlus.`,
        { code: `docker run -d --name pg -e POSTGRES_PASSWORD=pg -p 5432:5432 postgres:16
psql postgresql://postgres:pg@localhost:5432/postgres
\\dt            -- list tables
\\d+ logs       -- describe table
\\x auto        -- readable wide rows
\\timing on     -- show query time`, lang: 'bash' }),
      C('JSONB', `Binary JSON with indexing — flexible attributes without new columns. Query with \`->\`, \`->>\`, \`@>\` containment; index with GIN. Use it for genuinely variable data, not to avoid modelling.`,
        { code: `ALTER TABLE builds ADD COLUMN meta jsonb DEFAULT '{}';
CREATE INDEX builds_meta_gin ON builds USING gin (meta);
SELECT id FROM builds WHERE meta @> '{"stack": ["Kafka"]}';
SELECT meta->>'repo' FROM builds WHERE id = 'de-7';`, lang: 'sql' }),
      C('Partitioned tables', `Split a huge table into partitions (by range of date, list, hash). Queries filtering on the key skip other partitions; old data is dropped instantly by detaching a partition.`,
        { code: `CREATE TABLE events (id bigint, ts timestamptz, payload jsonb) PARTITION BY RANGE (ts);
CREATE TABLE events_2026_11 PARTITION OF events FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');`, lang: 'sql' }),
      C('Roles & permissions', `Roles are users and groups. Grant the minimum: an app role with only the needed table privileges, a read-only analyst role, migrations run by a separate owner role. Never let the app connect as a superuser.`),
      C('Backups & replication basics', `**Logical** backups (\`pg_dump\`) for single databases; **physical** backups + WAL archiving for point-in-time recovery (pgBackRest). **Streaming replication** keeps standby servers up to date for failover and read scaling. Managed services (RDS, Supabase, Neon) handle much of this.`,
        pick('You need to restore the database to how it was at 14:05 yesterday. What enables that?', ['A nightly pg_dump only', false], ['Base backup + continuous WAL archiving (point-in-time recovery)', true, 'Replay WAL up to the exact time.'], ['Replication alone', false])),
      D('Deep dive: Postgres extensions worth knowing', `pg_stat_statements (query stats), pg_trgm (fuzzy search), PostGIS (geo), pgvector (embeddings), pg_partman (partition management), pg_cron (scheduled jobs), TimescaleDB (time series). Extensions are a big reason Postgres can replace several specialised databases in small teams.`),
    ],
    quiz: [
      Q('Index for JSONB containment queries?', ['B-tree', 'GIN', 'Hash', 'None'], 1, 'GIN supports @>.'),
      Q('Fastest way to delete a whole month of old events from a partitioned table?', ['DELETE WHERE', 'Detach/drop the partition', 'VACUUM FULL', 'TRUNCATE everything'], 1, 'Metadata operation.'),
    ],
    practice: 'Run Postgres in Docker, create a partitioned events table with JSONB payloads and a GIN index, and set up pg_dump backups.',
    explain: 'Explain partitioning with storing exam papers in separate boxes per month.',
  },

  'db-prog': {
    intro: 'Code that runs inside the database — powerful for integrity and auditing, dangerous when overused.',
    concepts: [
      C('SQL & PL/pgSQL functions', `Functions encapsulate logic callable from SQL. SQL functions for simple expressions; PL/pgSQL for variables, loops and conditions.`,
        { code: `CREATE FUNCTION streak(p_user int) RETURNS int LANGUAGE plpgsql AS $$
DECLARE s int := 0; d date := current_date;
BEGIN
  WHILE EXISTS (SELECT 1 FROM activity WHERE user_id = p_user AND day = d) LOOP
    s := s + 1; d := d - 1;
  END LOOP;
  RETURN s;
END $$;`, lang: 'sql' }),
      C('Stored procedures', `Procedures (\`CREATE PROCEDURE\`, \`CALL\`) can manage transactions inside (commit in batches) — useful for maintenance and batch jobs within the DB.`),
      C('Triggers & audit tables', `Triggers run automatically on INSERT/UPDATE/DELETE. A classic, legitimate use: audit trails and maintaining \`updated_at\`.`,
        { code: `CREATE TABLE audit (tbl text, op text, row_id text, old jsonb, new jsonb, at timestamptz DEFAULT now(), by text DEFAULT current_user);
CREATE FUNCTION audit_trg() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO audit(tbl, op, row_id, old, new) VALUES (TG_TABLE_NAME, TG_OP, COALESCE(NEW.id, OLD.id)::text, to_jsonb(OLD), to_jsonb(NEW));
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER grades_audit AFTER INSERT OR UPDATE OR DELETE ON enrolment FOR EACH ROW EXECUTE FUNCTION audit_trg();`, lang: 'sql' }),
      C('When to keep logic in the database', `Good in the DB: constraints, integrity rules, audit triggers, set-based data transformations close to the data. Better in the app: business workflows, external calls, complex branching, anything needing unit tests and frequent change. Hidden trigger chains are a classic source of surprises.`,
        pick('Marks must always be between 0 and 100, even if a script writes directly to the DB. Where to enforce?', ['Only in the React form', false], ['A CHECK constraint in the database (plus app validation for UX)', true, 'The DB is the last line of defence.'], ['A trigger that emails the admin', false])),
      D('Deep dive: row-level security as logic in the DB', `Postgres RLS policies filter rows per user automatically (\`USING (user_id = current_setting('app.user_id')::int)\`). Supabase builds its whole security model on this. It's powerful defence-in-depth for multi-tenant apps — test policies carefully.`),
    ],
    quiz: [
      Q('A good use of triggers?', ['Sending emails via HTTP', 'Audit trails / updated_at', 'Complex business workflows', 'Rendering HTML'], 1, 'Data-level, local, simple.'),
      Q('Procedures differ from functions in Postgres because they can…', ['Return tables', 'Control transactions (COMMIT inside)', 'Be called from SELECT', 'Use SQL'], 1, 'Transaction control.'),
    ],
    practice: 'Add an audit trigger to your college schema’s marks table and a CHECK constraint; try to bypass them.',
    explain: 'Explain triggers with a CCTV camera that records every time a locker is opened.',
  },

  'db-admin': {
    intro: 'Keeping databases secure, backed up, fast and upgradable — what DBAs and platform engineers do.',
    concepts: [
      C('Roles, grants & row-level security', `Least privilege per role; revoke PUBLIC defaults; separate owner, app, read-only and migration roles; use RLS for per-user/tenant isolation where appropriate.`,
        { code: `CREATE ROLE app LOGIN PASSWORD '…';
GRANT SELECT, INSERT, UPDATE ON logs, builds TO app;
CREATE ROLE analyst; GRANT SELECT ON ALL TABLES IN SCHEMA marts TO analyst;`, lang: 'sql' }),
      C('Backups, restore & point-in-time recovery', `Automate backups, keep copies off-site, encrypt them, and **test restores** regularly with a timed drill. Define RPO/RTO (see the cloud HA lesson).`),
      C('Monitoring: pg_stat_statements, slow query log', `Watch: top queries by total time, slow query log (\`log_min_duration_statement = 500ms\`), connections, cache hit ratio, replication lag, locks and long-running transactions, disk growth.`,
        { code: `SELECT query, calls, round(total_exec_time) AS total_ms, round(mean_exec_time, 1) AS mean_ms
FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;`, lang: 'sql' }),
      C('Vacuum, bloat & maintenance', `MVCC leaves dead row versions; **autovacuum** reclaims space and updates statistics, and prevents transaction-id wraparound. Tune it for busy tables; watch for bloat; long-running transactions block cleanup.`),
      C('Connection pooling (PgBouncer)', `Each Postgres connection is a process (memory-heavy). PgBouncer multiplexes thousands of client connections onto a few dozen server connections — essential for serverless apps and many app instances.`,
        pick('You run 40 serverless functions instances each opening 10 connections; Postgres max is 100. Fix?', ['Raise max_connections to 10,000', false], ['Put PgBouncer (transaction pooling) in front', true, 'Multiplex many clients onto few connections.'], ['Restart Postgres hourly', false])),
      C('Upgrades & migrations at scale', `Major version upgrades via pg_upgrade or logical replication to a new cluster (near-zero downtime). Schema changes on big tables: add columns nullable, \`CREATE INDEX CONCURRENTLY\`, backfill in batches, set \`lock_timeout\` so a migration can't block production.`),
      D('Deep dive: a weekly database health check', `Top 10 queries by time (any new ones?), slow query count, table/index bloat, unused indexes (pg_stat_user_indexes idx_scan = 0), largest tables growth, replication lag, last successful backup and restore test, connection usage peak. 15 minutes a week prevents most emergencies.`),
    ],
    quiz: [
      Q('What does autovacuum do?', ['Backs up', 'Reclaims dead tuples and updates statistics', 'Adds indexes', 'Compresses WAL'], 1, 'MVCC cleanup.'),
      Q('Build an index on a busy production table without blocking writes?', ['CREATE INDEX', 'CREATE INDEX CONCURRENTLY', 'VACUUM FULL', 'Lock the table'], 1, 'Concurrent build.'),
    ],
    practice: 'Enable pg_stat_statements, generate load, find the top 3 queries, and write a short health-check report.',
    explain: 'Explain connection pooling with shared autos at a railway station instead of one per passenger.',
  },

  'db-nosql': {
    intro: 'Different data shapes and access patterns need different stores. Know the families and when each wins.',
    concepts: [
      C('Document (MongoDB)', `Stores JSON-like documents; flexible schema; data accessed together is stored together (embed vs reference). Good for content, catalogues, user profiles with varied fields. Joins are limited — design around queries.`,
        { code: `db.builds.insertOne({ userId: "ravi", pid: "be-2", status: "shipped", retro: { bug: "base62 off-by-one" }, stack: ["FastAPI", "Postgres"] })
db.builds.find({ status: "shipped", stack: "Postgres" }).sort({ shippedAt: -1 })`, lang: 'javascript' }),
      C('Key-value (Redis, DynamoDB)', `Get/put by key at very low latency and huge scale. Redis in-memory (cache, sessions, counters); DynamoDB durable, serverless, designed from access patterns with partition/sort keys.`),
      C('Wide-column (Cassandra)', `Rows partitioned by key across many nodes, columns grouped per partition; massive write throughput and multi-datacentre replication with tunable consistency. Model one table per query. Used for time series, messaging, IoT at huge scale.`),
      C('Graph (Neo4j)', `Nodes and relationships as first-class data; traversals like "friends of friends who did the DE course" are natural and fast (Cypher query language). Good for recommendations, fraud rings, knowledge graphs.`,
        { code: `MATCH (me:Person {name:'Pank'})-[:FRIEND]->(f)-[:FRIEND]->(fof)
WHERE NOT (me)-[:FRIEND]->(fof) AND fof <> me
RETURN fof.name, count(*) AS mutual ORDER BY mutual DESC`, lang: 'text' }),
      C('Choosing the right store', `Start with Postgres unless you have a clear reason. Then match the workload:`,
        { table: { cols: ['Need', 'Good fit'], rows: [['Relational data, transactions, ad-hoc queries', 'Postgres / MySQL'], ['Cache, sessions, leaderboards', 'Redis'], ['Massive key-value at any scale, serverless', 'DynamoDB'], ['Flexible documents', 'MongoDB (or Postgres JSONB)'], ['Huge write-heavy time series across regions', 'Cassandra / ScyllaDB'], ['Relationship traversals', 'Neo4j'], ['Analytics', 'DuckDB / ClickHouse / warehouse'], ['Full-text search', 'Postgres FTS → Elasticsearch']] } },
        pick('A 3-person startup needs users, orders, payments and reports. First database?', ['Cassandra', false], ['PostgreSQL', true, 'Relational, transactional, flexible enough (JSONB) for most needs.'], ['Neo4j', false])),
      D('Deep dive: "polyglot persistence" costs', `Each extra database means another system to back up, secure, monitor, upgrade and keep in sync — plus consistency problems between them. Add a new store only when the primary database measurably can't meet a requirement.`),
    ],
    quiz: [
      Q('"Friends of friends" queries are most natural in…', ['Key-value store', 'Graph database', 'Column store', 'Blob storage'], 1, 'Traversals.'),
      Q('Default choice for a new product’s main database?', ['MongoDB always', 'PostgreSQL', 'Cassandra', 'Redis'], 1, 'Versatile and transactional.'),
    ],
    practice: 'Model the same "builds and retros" data in Postgres, MongoDB and Redis; write the 3 main queries in each and compare.',
    explain: 'Explain the NoSQL families with different kinds of storage: filing cabinet, lockers, warehouse racks and a map of connections.',
  },

  'db-dist': {
    intro: 'What changes when data lives on many machines: replication, sharding, consistency and consensus.',
    concepts: [
      C('Replication (leader/follower, multi-leader)', `**Leader/follower**: writes go to the leader, streamed to followers that serve reads and take over on failure. Asynchronous replication → followers may lag (stale reads). **Multi-leader / leaderless**: writes in several places (multi-region), at the cost of conflict resolution.`,
        { arch: [['Clients', ['Writes', 'Reads']], ['Leader', ['Primary (writes)']], ['Followers (replicated WAL)', ['Replica 1 (reads)', 'Replica 2 (reads, failover)']]] },
        { note: 'Read-your-own-writes: after a user updates their profile, read it from the leader (or wait for the replica) so they don’t see old data.' }),
      C('Partitioning & sharding', `Split data across machines by key: **hash** (even spread, no range queries) or **range** (efficient ranges, hot-spot risk). Choose a shard key with high cardinality and even access; cross-shard queries and transactions get expensive; resharding is hard — consistent hashing helps.`,
        pick('Shard a chat app’s messages. Best shard key?', ['Message date', false], ['Conversation id (hashed)', true, 'Keeps a conversation together and spreads load evenly.'], ['Country', false])),
      C('CAP & PACELC', `**CAP**: during a network **P**artition you must choose **C**onsistency (refuse some requests) or **A**vailability (answer, maybe stale). **PACELC** adds: **E**lse (normal operation) you trade **L**atency vs **C**onsistency. Banking leans CP; social feeds lean AP.`),
      C('Consensus (Raft idea)', `Consensus lets several nodes agree on one ordered log even if some fail. **Raft**: nodes elect a **leader** with majority votes; the leader appends entries and commits them once a **majority** has them; if the leader dies, a new election happens. Used by etcd, CockroachDB, Kafka KRaft, Consul.`,
        { steps: [['Follower times out', 'No heartbeat from a leader → becomes candidate.'], ['Election', 'Asks for votes; majority wins → leader for this term.'], ['Replicate', 'Leader appends client writes to followers’ logs.'], ['Commit', 'Entry committed once a majority stores it.'], ['Failure', 'Leader dies → new election; committed entries survive.']] }),
      D('Deep dive: distributed SQL', `Databases like CockroachDB, YugabyteDB, Spanner and TiDB shard automatically, replicate each shard with Raft, and still offer SQL with transactions across shards. They trade some latency (consensus round-trips) for horizontal scale and survivability — worth knowing for system design interviews.`),
    ],
    quiz: [
      Q('Async replication can cause…', ['Data corruption', 'Stale reads from followers', 'No failover', 'Deadlocks'], 1, 'Replication lag.'),
      Q('Raft commits an entry when…', ['The leader writes it', 'A majority of nodes have it', 'All nodes have it', 'A client confirms'], 1, 'Majority quorum.'),
      Q('During a partition, an AP system will…', ['Refuse all requests', 'Stay available, possibly serving stale data', 'Lose data always', 'Shut down'], 1, 'Availability over consistency.'),
    ],
    practice: 'Do build db-7 (replicated KV store with Raft), or at least run a 3-node etcd cluster in Docker and kill the leader.',
    explain: 'Explain Raft with a class electing a monitor and only accepting decisions a majority wrote down.',
  },

  'db-olap': {
    intro: 'Why analytical queries need different engines — and how they’re so fast. The bridge to the data engineering course.',
    concepts: [
      C('Analytical workloads', `Few users, huge scans and aggregations over history: "revenue by month by city for 3 years". Running these on the OLTP database hurts the app; copy data to an analytical store instead.`),
      C('Columnar engines (DuckDB, ClickHouse)', `**DuckDB** — in-process analytics, perfect for laptops, notebooks and pipelines. **ClickHouse** — a server for real-time analytics over billions of rows. Both columnar, compressed, vectorised.`,
        { code: `pip install duckdb
python -c "import duckdb; print(duckdb.sql(\\"SELECT 42 AS answer\\"))"
-- query Postgres directly from DuckDB:
INSTALL postgres; LOAD postgres;
ATTACH 'postgresql://postgres:pg@localhost/college' AS pg (TYPE postgres);
SELECT course_id, avg(marks) FROM pg.enrolment GROUP BY 1;`, lang: 'bash' }),
      C('Compression & vectorised execution', `Columns of similar values compress extremely well (run-length, dictionary, delta encoding) — less I/O. **Vectorised execution** processes batches of values (e.g. 2,048 at a time) with tight loops and SIMD instead of one row at a time — huge CPU efficiency.`,
        pick('Why does SUM(amount) over 100M rows run in under a second in DuckDB but take much longer in Postgres?', ['DuckDB uses the GPU', false], ['Columnar storage + compression + vectorised execution', true, 'Reads one compressed column and processes it in batches.'], ['Postgres is broken', false])),
      D('Deep dive: HTAP and the blurring line', `Some systems try to do both transactions and analytics (HTAP): TiDB with TiFlash, SingleStore, Postgres + columnar extensions, or zero-ETL replication from OLTP to warehouses. In practice most teams still keep OLTP and OLAP separate, connected by CDC pipelines — exactly what the DE course teaches.`),
    ],
    quiz: [
      Q('Vectorised execution processes…', ['One row at a time', 'Batches of values at a time', 'Only vectors for AI', 'Indexes'], 1, 'Batch processing per column.'),
      Q('Best tool to run analytics on a 2 GB Parquet file on your laptop?', ['Postgres', 'DuckDB', 'Redis', 'MongoDB'], 1, 'In-process columnar engine.'),
    ],
    practice: 'Run the same aggregation over 10M rows in Postgres and DuckDB and explain the speed difference.',
    explain: 'Explain row vs columnar with reading a whole register vs reading only the marks column.',
  },
}
