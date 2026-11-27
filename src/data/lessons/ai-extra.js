// Deeper material for AI full stack lessons (same format as de-extra.js)
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'ai-math': {
    add: { 'Derivatives & gradients (intuition)': [{ steps: [['Start', 'w = 0, loss is high.'], ['Gradient says', 'Loss drops if w increases — slope is negative.'], ['Step', 'w = w − 0.1 × gradient → w moves up.'], ['Repeat', 'Each step the slope gets flatter.'], ['Converge', 'Slope ≈ 0: the bottom of the valley. Training done.']] }] },
    deeper: [
      D('Deep dive: why cosine similarity everywhere', `Embeddings are compared by the **angle** between vectors, not their length: cos θ = (a·b) / (|a||b|). 1 = same direction (same meaning), 0 = unrelated, −1 = opposite. Normalising vectors to length 1 turns cosine into a plain dot product — which is why vector databases are fast.`,
        { code: `import numpy as np
a, b = np.array([0.2, 0.9]), np.array([0.25, 0.8])
print(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))   # ≈ 0.998 → very similar`, lang: 'python' }),
    ],
    quiz: [Q('Cosine similarity of 0 means vectors are…', ['Identical', 'Unrelated (perpendicular)', 'Opposite', 'Equal length'], 1, 'Angle of 90°.')],
  },
  'ai-pyds': {
    add: { 'Exploratory data analysis (EDA)': [pick('In a loan dataset, "approved_by_manager_id" is filled only for approved loans. What is it?', ['A great feature', false], ['A leaky column — it reveals the answer', true, 'It only exists because of the outcome.'], ['Noise', false])] },
    deeper: [
      D('Deep dive: an EDA checklist you can reuse', `Copy this into every notebook:`,
        { cards: [['Shape & grain', 'What is one row? How many?'], ['Target', 'Distribution; class balance.'], ['Missing', 'Null % per column; why missing?'], ['Duplicates', 'Exact and near-duplicate rows.'], ['Outliers', 'Box plots; data errors vs real extremes.'], ['Leakage', 'Columns created after the outcome?'], ['Relationships', 'Feature vs target plots, correlations.'], ['Findings', '5 bullets + next steps.']] }),
    ],
    quiz: [Q('First EDA question?', ['Which model to use', 'What does one row represent?', 'Which colour scheme', 'How many GPUs'], 1, 'Grain first — like in data modelling.')],
  },
  'ai-ml': {
    add: { 'Metrics: accuracy, precision, recall, F1, ROC-AUC, RMSE': [{ table: { cols: ['', 'Predicted fraud', 'Predicted OK'], rows: [['Actually fraud', 'TP = 40', 'FN = 10'], ['Actually OK', 'FP = 60', 'TN = 9,890']] } }, { cards: [['Precision', '40 / (40 + 60) = 40%'], ['Recall', '40 / (40 + 10) = 80%'], ['Accuracy', '(40 + 9,890) / 10,000 = 99.3% — misleading!'], ['F1', '2 × 0.4 × 0.8 / 1.2 ≈ 0.53']] }] },
    deeper: [
      D('Deep dive: choosing the decision threshold', `A classifier outputs probabilities; **you** choose the cut-off. Lower threshold → more recall, less precision. Pick it from business costs: if a missed fraud costs ₹5,000 and a false alarm costs ₹50 of review time, you accept many false alarms. Plot precision and recall against threshold and choose deliberately — never default to 0.5 without thinking.`),
    ],
    quiz: [Q('Lowering the classification threshold usually…', ['Raises precision', 'Raises recall and lowers precision', 'Changes nothing', 'Improves accuracy always'], 1, 'More positives predicted.')],
  },
  'ai-feat': {
    add: { 'Leakage': [{ steps: [['Split first', 'Train/validation/test before any preprocessing.'], ['Fit on train only', 'Imputer, scaler, encoder learn from train.'], ['Transform others', 'Apply the fitted steps to validation/test.'], ['Time-aware', 'For time data, features may use only the past.'], ['Sanity check', 'Too-good score? Look at feature importance for a leak.']] }] },
    deeper: [
      D('Deep dive: features that usually win on tabular data', `- **Aggregates**: user’s orders in last 7/30 days, average basket value.
- **Recency/frequency**: days since last order, orders per month.
- **Ratios**: refunds ÷ orders, clicks ÷ views.
- **Time features**: hour, weekday, payday week, festival season.
- **Target encoding** for high-cardinality categories, computed out-of-fold to avoid leakage.`),
    ],
    quiz: [Q('Target encoding must be computed…', ['On the full dataset', 'Out-of-fold / on training data only', 'On test data', 'Randomly'], 1, 'Otherwise it leaks the target.')],
  },
  'ai-dl': {
    add: { 'Transformers & attention': [{ steps: [['Tokens → vectors', '"the river bank" becomes 3 embeddings + positions.'], ['Queries, keys, values', 'Each token makes a query (what I need), key (what I offer), value (my content).'], ['Scores', 'bank’s query compared with every key → "river" scores high.'], ['Weighted mix', 'bank’s new vector = weighted sum of values → now means riverbank.'], ['Many heads, many layers', 'Different heads learn grammar, meaning, references.']] }] },
    deeper: [
      D('Deep dive: training tricks that matter', `- **Learning-rate schedule** (warm-up then decay) — the single most important setting.
- **Batch size** vs memory; gradient accumulation to fake bigger batches on small GPUs.
- **Mixed precision** (fp16/bf16) — faster, half the memory.
- **Regularisation**: dropout, weight decay, data augmentation, early stopping.
- **Transfer learning**: start from a pretrained model and fine-tune — almost always better than from scratch.`),
    ],
    quiz: [Q('On a small GPU, to simulate a larger batch use…', ['Higher learning rate', 'Gradient accumulation', 'More layers', 'Bigger images'], 1, 'Accumulate gradients over several steps.')],
  },
  'ai-llm': {
    add: { 'Tool / function calling': [pick('The model returns a tool call delete_user(id=42) from a chat message. Safest handling?', ['Run it immediately', false], ['Validate arguments, check the user’s permission, and require confirmation for destructive actions', true, 'The model only proposes; your code enforces rules.'], ['Ignore all tools', false])] },
    deeper: [
      D('Deep dive: context engineering', `Quality depends on **what you put in the context window**, not only the wording of the prompt:`,
        { cards: [['Instructions', 'Role, rules, output format — stable, cacheable.'], ['Examples', '2–3 high-quality input/output pairs.'], ['Retrieved knowledge', 'Only the most relevant chunks, with sources.'], ['Conversation state', 'Summarised history, not the whole transcript.'], ['Tool results', 'Trimmed to what matters.'], ['Order', 'Stable content first (cache), the user question last.']] }),
    ],
    quiz: [Q('Long chats get slow and expensive. Common fix?', ['Raise temperature', 'Summarise older history and keep recent turns', 'Remove the system prompt', 'Use more tools'], 1, 'Manage the context window.')],
  },
  'ai-evals': {
    add: { 'Golden datasets & test cases': [{ steps: [['Collect', '30–50 real questions from users or the team.'], ['Label', 'Expected answer or a pass/fail rubric for each.'], ['Tag', 'Type: fact, edge, safety, multi-step.'], ['Run', 'Script runs all cases and records pass, latency, cost.'], ['Grow', 'Every new bug becomes a case.']] }] },
    deeper: [
      D('Deep dive: error analysis beats metrics', `Before building fancy metrics, read 50 failed outputs and **categorise** them: retrieval missed, wrong format, hallucinated number, refused wrongly, too long. Count each category. Fix the biggest category first. This is how professional AI teams actually improve products.`),
    ],
    quiz: [Q('Best first step to improve an LLM app?', ['Switch to the biggest model', 'Read and categorise real failures', 'Add more tools', 'Rewrite in another framework'], 1, 'Error analysis shows what to fix.')],
  },
  'ai-emb': {
    add: { 'Hybrid search (BM25 + vectors)': [pick('Query: "DP-700 exam syllabus". Vector search returns generic cert pages. Fix?', ['Bigger embedding model only', false], ['Add BM25/keyword search and fuse results (hybrid)', true, 'Exact codes match better with keyword search.'], ['Remove metadata', false])] },
    deeper: [
      D('Deep dive: choosing an embedding model', `Compare on **your** data with a small eval (queries + correct chunks): recall@5, latency, cost, vector size (storage), languages supported (Hindi/Kannada?), and max input length. Public leaderboards (MTEB) are a starting point, not the answer.`),
    ],
    quiz: [Q('The best way to pick an embedding model is…', ['Leaderboard rank only', 'An eval on your own queries and documents', 'Largest vectors', 'Newest release'], 1, 'Your data decides.')],
  },
  'ai-rag': {
    add: { 'Chunking strategies': [{ steps: [['Fixed 500 tokens', 'recall@5 = 0.62 — chunks cut mid-table.'], ['Heading-aware', 'recall@5 = 0.71 — sections stay together.'], ['+ title prefix', 'recall@5 = 0.76 — chunks carry context.'], ['+ hybrid + rerank', 'recall@5 = 0.88.'], ['Lesson', 'Measure every change; keep what moves the number.']] }] },
    deeper: [
      D('Deep dive: advanced RAG techniques', `When basic RAG plateaus:`,
        { cards: [['Query rewriting', 'Turn a vague chat question into a precise search query.'], ['Multi-query', 'Search several phrasings, merge results.'], ['HyDE', 'Generate a hypothetical answer, search with its embedding.'], ['Parent-child chunks', 'Retrieve small chunks, send their bigger parent section.'], ['Metadata filters', 'Restrict by date, product, permissions.'], ['Agentic RAG', 'Let the model decide to search again if evidence is thin.']] }),
    ],
    quiz: [Q('Parent-child chunking retrieves…', ['Only titles', 'Small precise chunks but sends their larger parent for context', 'Whole documents always', 'Random chunks'], 1, 'Precision in search, context in the prompt.')],
  },
  'ai-agents': {
    add: { 'Agent loop: plan, act, observe': [{ steps: [['Goal', '"Which DSA pattern did the crew practise least this month?"'], ['Act', 'list_tables() → sees problems table.'], ['Act', 'run_sql("SELECT pattern, COUNT(*) …")'], ['Observe', 'Graphs: 2, sliding window: 14, DP: 3.'], ['Answer', '"Graphs — 2 problems. Suggest 3 graph problems this week."']] }] },
    deeper: [
      D('Deep dive: workflow patterns before agents', `Anthropic’s guidance on building effective agents lists simpler patterns that solve most problems:`,
        { cards: [['Prompt chaining', 'Fixed steps: outline → draft → check.'], ['Routing', 'Classify input, send to a specialised prompt.'], ['Parallelisation', 'Run sub-tasks at once, combine.'], ['Orchestrator–workers', 'One LLM splits work for others.'], ['Evaluator–optimiser', 'One generates, another critiques, loop.'], ['Agent', 'Only when steps can’t be predicted in advance.']] }),
    ],
    quiz: [Q('Classifying a support message and sending it to a specialised prompt is…', ['An agent', 'Routing', 'Fine-tuning', 'RAG'], 1, 'A simple workflow pattern.')],
  },
  'ai-ft': {
    add: { 'When to fine-tune vs RAG vs prompt': [pick('Your bot must always reply in a strict JSON format with a house style, millions of times a day, cheaply. Strong case for…', ['RAG', false], ['Fine-tuning a small model', true, 'Consistent format/style at scale on a cheaper model is fine-tuning’s sweet spot.'], ['Higher temperature', false])] },
    deeper: [
      D('Deep dive: building a fine-tuning dataset', `Data quality matters more than quantity:
- 200–2,000 clean examples of exactly the behaviour you want.
- Cover edge cases and refusals, not just happy paths.
- Consistent format; no contradictions.
- Hold out 10–20% for evaluation.
- Generate with a strong model only if you review samples by hand.`),
    ],
    quiz: [Q('More important for fine-tuning results?', ['Huge noisy dataset', 'Smaller, clean, consistent examples', 'Longest examples', 'Random examples'], 1, 'Quality beats quantity.')],
  },
  'ai-app': {
    add: { 'Auth, rate limits, cost caps': [{ steps: [['Request arrives', 'Check auth token.'], ['Rate limit', 'User under 20 requests/min? (Redis counter)'], ['Budget', 'User under today’s token cap?'], ['Cache', 'Exact match cached? Return it.'], ['Call model', 'With max_tokens and timeout; log tokens and cost.']] }] },
    deeper: [
      D('Deep dive: graceful degradation', `Providers go down and slow down. Plan for it: timeouts and retries with backoff, a fallback model or provider, cached answers for common questions, clear UI messages ("taking longer than usual"), and a kill switch to turn off expensive features if costs spike.`),
    ],
    quiz: [Q('Your LLM provider is down. A resilient app…', ['Shows a blank page', 'Falls back to another model/cache and tells the user', 'Retries forever', 'Crashes'], 1, 'Degrade gracefully.')],
  },
  'ai-mlops': {
    add: { 'Monitoring & drift': [{ steps: [['Baseline', 'Save training data stats.'], ['Watch inputs', 'Compare daily feature distributions (PSI, KS test).'], ['Watch outputs', 'Prediction distribution shifts?'], ['Watch outcomes', 'When labels arrive, track real accuracy.'], ['Act', 'Alert → investigate → retrain → shadow test → promote.']] }] },
    deeper: [
      D('Deep dive: shadow and canary for models', `Before replacing a model: run the new one in **shadow** (it predicts on live traffic but users don’t see it) and compare; then **canary** a small share of traffic; promote via the registry alias only if metrics hold. Same discipline as software deploys.`),
    ],
    quiz: [Q('A shadow deployment means the new model…', ['Serves all users', 'Predicts on live traffic without affecting users', 'Is deleted', 'Trains online'], 1, 'Safe comparison.')],
  },
  'ai-llmops': {
    add: { 'Tracing (Langfuse)': [{ arch: [['Trace: one user request', ['request id, user, prompt version']], ['Spans', ['retrieve (120 ms, 5 chunks)', 'rerank (80 ms)', 'generate (1.4 s, 2.1k tokens, ₹0.40)']], ['Scores', ['user 👎', 'judge: unfaithful']]] }] },
    deeper: [
      D('Deep dive: the LLMOps feedback loop', `The loop that improves an AI product every week:`,
        { flow: ['Production traces', 'Feedback & judge scores', 'Error analysis', 'New eval cases', 'Prompt/retrieval change', 'Eval in CI', 'Gradual rollout'] }),
    ],
    quiz: [Q('Bad production traces should become…', ['Deleted', 'New eval test cases', 'Ignored', 'Marketing'], 1, 'Close the loop.')],
  },
  'ai-resp': {
    add: { 'Hallucinations & grounding': [pick('Your RAG bot answers confidently when no relevant chunk was found. Best fix?', ['Raise temperature', false], ['If retrieval scores are low, answer "I don’t know" and offer a human', true, 'Abstain when evidence is missing.'], ['Hide sources', false])] },
    deeper: [
      D('Deep dive: a red-team checklist', `Before launch, try to break it:`,
        { cards: [['Prompt injection', '"Ignore your instructions…" in user text and documents.'], ['Data leakage', 'Ask for other users’ data or the system prompt.'], ['Harmful advice', 'Medical, legal, financial edge cases.'], ['Bias probes', 'Same question with different names/genders/regions.'], ['Jailbreak roleplay', '"Pretend you are…"'], ['Cost attacks', 'Huge inputs, loops, tool spam.']] }),
    ],
    quiz: [Q('Red-teaming means…', ['Designing the UI', 'Deliberately trying to make the system fail unsafely before launch', 'Marketing', 'Training'], 1, 'Adversarial testing.')],
  },
  'ai-de': {
    add: { 'LLMs for data cleaning & classification': [{ steps: [['Sample', 'Label 200 rows by hand.'], ['Prompt + schema', 'Classify with structured output.'], ['Measure', 'Accuracy vs your labels; fix the prompt.'], ['Batch run', 'Cheap model, cached, with confidence.'], ['Human review', 'Low-confidence rows go to a queue.']] }] },
    deeper: [
      D('Deep dive: an AI-ready data platform', `What makes a company "AI-ready" — and why data engineers who know AI are in demand:`,
        { arch: [['Sources', ['Databases', 'Docs & PDFs', 'Tickets', 'Calls']], ['Platform', ['Lakehouse (tables + files)', 'Embedding pipeline', 'Catalog + lineage + access control']], ['AI layer', ['RAG / agents', 'Text-to-SQL on semantic layer', 'ML models']], ['Ops', ['Evals', 'Tracing', 'Cost dashboards']]] }),
    ],
    quiz: [Q('Why do AI apps depend on data engineering?', ['They don’t', 'They need clean, fresh, governed data and pipelines for documents and features', 'Only for dashboards', 'Only for storage'], 1, 'Garbage in, garbage out — at scale.')],
  },
}
