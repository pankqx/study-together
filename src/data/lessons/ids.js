// Tiny index so the roadmap and build screens know what has an in-app lesson
// without loading the lesson text itself (that is lazy-loaded with the Learn screen).
export const LESSON_IDS = new Set(['de-found', 'de-py', 'de-files', 'de-model', 'de-ingest', 'de-orch', 'de-dbt', 'de-quality',
  'de-pyeng', 'de-dwh', 'de-patterns', 'de-spark', 'de-lake', 'de-azure', 'de-stream', 'de-kafka', 'de-sproc', 'de-gov', 'de-bi', 'de-interview',
  'ai-math', 'ai-pyds', 'ai-ml', 'ai-feat', 'ai-dl', 'ai-llm', 'ai-evals', 'ai-emb',
  'ai-rag', 'ai-agents', 'ai-ft', 'ai-app', 'ai-mlops', 'ai-llmops', 'ai-resp', 'ai-de'])
export const WALKTHROUGH_IDS = new Set(['de-1'])
export const lessonHref = (track, node, key) => `#learn/${track}/${node}${key ? '/' + key : ''}`
