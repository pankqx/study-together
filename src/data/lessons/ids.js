// Tiny index so the roadmap and build screens know what has an in-app lesson
// without loading the lesson text itself (that is lazy-loaded with the Learn screen).
export const LESSON_IDS = new Set(['de-found', 'de-py', 'de-files', 'de-model', 'de-ingest', 'de-orch', 'de-dbt', 'de-quality',
  'de-pyeng', 'de-dwh', 'de-patterns', 'de-spark', 'de-lake', 'de-azure', 'de-stream', 'de-kafka', 'de-sproc', 'de-gov', 'de-bi', 'de-interview',
  'ai-math', 'ai-pyds', 'ai-ml', 'ai-feat', 'ai-dl', 'ai-llm', 'ai-evals', 'ai-emb',
  'ai-rag', 'ai-agents', 'ai-ft', 'ai-app', 'ai-mlops', 'ai-llmops', 'ai-resp', 'ai-de',
  'cld-concepts', 'cld-prereq', 'cld-iam', 'cld-compute', 'cld-storage', 'cld-net', 'cld-db', 'cld-serverless', 'cld-containers', 'cld-iac', 'cld-cicd', 'cld-data', 'cld-ops', 'cld-sec', 'cld-ha', 'cld-multi', 'cld-cert',
  'dm-found', 'dm-research', 'dm-brand', 'dm-content', 'dm-design', 'dm-social', 'dm-video', 'dm-brandme', 'dm-seo', 'dm-email', 'dm-tools', 'dm-ecom', 'dm-ads', 'dm-analytics', 'dm-cro', 'dm-growth', 'dm-ai', 'dm-cert',
  'fe-web', 'fe-html', 'fe-css', 'fe-js', 'fe-ts', 'fe-build', 'fe-react', 'fe-react2', 'fe-forms', 'fe-browser', 'fe-next', 'fe-ui', 'fe-design-sys', 'fe-viz', 'fe-test', 'fe-perf', 'fe-a11y', 'fe-sec', 'fe-deploy',
  'be-node', 'be-rest', 'be-http', 'be-auth', 'be-orm', 'be-py', 'be-arch', 'be-search', 'be-perf', 'be-deploy', 'be-cache', 'be-jobs', 'be-rt', 'be-gql', 'be-sec', 'be-test',
  'db-model', 'db-sql', 'db-sql2', 'db-norm', 'db-txn', 'db-idx', 'db-storage', 'db-pg', 'db-prog', 'db-admin', 'db-nosql', 'db-dist', 'db-olap'])
const r = (p, n) => Array.from({ length: n }, (_, i) => p + '-' + (i + 1))
export const WALKTHROUGH_IDS = new Set([...r('fe', 7), ...r('be', 7), ...r('db', 7), ...r('de', 7), ...r('ai', 7), ...r('fl', 4)])
export const lessonHref = (track, node, key) => `#learn/${track}/${node}${key ? '/' + key : ''}`
