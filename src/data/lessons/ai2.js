// AI full stack — lessons 9–16: RAG, agents, open models, AI product, MLOps, LLMOps, responsible AI, AI × DE
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })

export default {
  'ai-rag': {
    intro: 'Retrieval-augmented generation: let the model answer from your documents, with citations, instead of from memory.',
    concepts: [
      C('Document loading & parsing (PDF, HTML, tables)', `Garbage in, garbage out. Parsing is where most RAG quality is won or lost.

- **PDF** — text PDFs: pypdf / PyMuPDF; scanned PDFs need OCR; complex layouts: Docling or Unstructured.
- **HTML** — strip navigation and ads; keep headings.
- **Tables** — convert to Markdown so rows and columns survive.
- Keep **metadata**: source, page, section, date.`,
        { flow: ['Raw files', 'Parse to clean text + metadata', 'Chunk', 'Embed', 'Index'] }),
      C('Chunking strategies', `Split documents into pieces small enough to retrieve precisely, large enough to keep meaning.

- **Fixed size** with overlap (e.g. 500 tokens, 50 overlap) — simple baseline.
- **Recursive / structural** — split on headings, then paragraphs, then sentences.
- **Semantic** — split where the topic changes.
- Prepend the document title and section heading to each chunk ("contextual chunks").`,
        { note: 'There is no universally best size. Compare 3 strategies with your eval set — that is exactly milestone 2 of ai-5.' }),
      C('Embedding & indexing', `Embed every chunk with the same model you use for queries, store vector + text + metadata, and build an ANN index. Re-embed everything if you change the embedding model — vectors from different models are not comparable.`),
      C('Retrieval: vector, keyword, hybrid', `Retrieve the top-k candidates (e.g. 20) by vector, keyword or hybrid search, filtered by metadata (course = DE, date > 2025). Retrieve more than you will finally use — the reranker narrows it down.`),
      C('Re-ranking', `A **cross-encoder reranker** reads the question and each candidate chunk *together* and scores relevance much more accurately than vector similarity. Retrieve 20–50, rerank, keep the top 3–5.`,
        { code: `from sentence_transformers import CrossEncoder
rr = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
scores = rr.predict([(question, c.text) for c in candidates])
top = [c for _, c in sorted(zip(scores, candidates), key=lambda x: -x[0])][:5]`, lang: 'python' }),
      C('Prompt assembly with citations', `Put the retrieved chunks in the prompt with IDs, tell the model to answer only from them and cite IDs, and to say "I don't know" otherwise.`,
        { code: `PROMPT = """Answer using ONLY the sources below. Cite like [S2]. If the sources do not contain the answer, say you don't know.
<sources>
{% for c in chunks %}[S{{loop.index}}] ({{c.source}}, p.{{c.page}}) {{c.text}}
{% endfor %}</sources>
Question: {{question}}"""`, lang: 'text' }),
      C('Evaluating retrieval & answers', `Measure the two halves separately:

- **Retrieval** — recall@k: is the right chunk in the top k? MRR: how high?
- **Answer** — faithfulness (claims supported by sources), relevance, correctness vs expected answer.

Tools: Ragas, DeepEval, or your own LLM-as-judge script.`,
        { note: 'If retrieval recall is low, no prompt will save you. Fix retrieval first.' }),
      C('Keeping the index fresh', `Documents change. Build ingestion as a pipeline: detect new, changed and deleted files (hashes or timestamps), re-chunk and re-embed only those, delete stale vectors, and record the index version. This is data engineering applied to RAG.`),
      C('GraphRAG (intro)', `**GraphRAG** extracts entities and relationships from documents into a **knowledge graph**, then retrieves through the graph. It helps with questions that need connecting many documents ("which suppliers are linked to delayed projects?"), at the cost of a heavier, more expensive ingestion step.`),
    ],
    quiz: [
      Q('Retrieval recall@5 is 40%. What should you improve first?', ['The answer prompt', 'Retrieval: chunking, hybrid search, reranking', 'Temperature', 'Model size'], 1, 'The model cannot cite what was not retrieved.'),
      Q('A reranker scores…', ['Each chunk alone', 'Question and chunk together', 'Only keywords', 'Document length'], 1, 'Cross-encoders read the pair jointly.'),
      Q('You switched embedding models. You must…', ['Do nothing', 'Re-embed all chunks', 'Only re-embed new docs', 'Change the database'], 1, 'Vectors from different models are not comparable.'),
      Q('Faithfulness measures…', ['Speed', 'Whether answer claims are supported by the sources', 'Number of citations', 'Grammar'], 1, 'Grounding, not fluency.'),
    ],
    practice: 'Build ai-5 on the DE lessons in this app: ingest them, compare 3 chunking strategies, add hybrid + rerank, and report recall@5 and faithfulness.',
    explain: 'Explain RAG as an open-book exam where the student must show which page each answer came from.',
  },

  'ai-agents': {
    intro: 'Agents let a model take multiple steps with tools. Powerful — and the easiest AI system to make unreliable. Build them carefully.',
    concepts: [
      C('Agent loop: plan, act, observe', `An agent repeats: think about the goal → choose a tool and arguments → run it → read the result → decide the next step or finish. Always cap the steps.`,
        { flow: ['Goal', 'Plan / choose tool', 'Act (run tool)', 'Observe result', 'Done? else repeat (max N)'] },
        { code: `for step in range(8):                      # hard cap
    r = llm(messages, tools=TOOLS)
    if not r.tool_calls: return r.content    # finished
    for call in r.tool_calls:
        result = run_tool(call)              # validated, sandboxed
        messages.append(tool_message(call, result))
raise RuntimeError("step limit reached")`, lang: 'python' },
        { note: 'Ask first: can a fixed workflow (step 1 → 2 → 3) do this? If yes, build that. It is cheaper, faster and easier to test than an agent.' }),
      C('Tool design & function calling', `Tools are the agent's API — design them like a good API:

- Few, clear tools with specific names and descriptions.
- Strict, typed parameters; validate every call.
- Return concise, useful results and clear error messages the model can act on.
- Make them idempotent and safe; dangerous actions need confirmation.`),
      C('Model Context Protocol (MCP): clients & servers', `**MCP** is an open standard for connecting AI apps to tools and data. An **MCP server** exposes tools/resources (e.g. "query Postgres", "read GitHub issues"); any **MCP client** (Claude, IDEs, your own app) can use them. Write a tool once, use it everywhere.`,
        { code: `# pip install mcp
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("study-db")

@mcp.tool()
def dsa_count(person: str) -> int:
    """Number of DSA problems a crew member has solved."""
    return query("SELECT COUNT(*) FROM problems WHERE uid = %s", person)

if __name__ == "__main__": mcp.run()`, lang: 'python' }),
      C('Agent frameworks: LangGraph, LlamaIndex', `- **LangGraph** — agents as explicit graphs of steps with state, branches and checkpoints. Good control and human-in-the-loop.
- **LlamaIndex** — strong for data/RAG-centric agents and document workflows.

Learn the plain loop above first; then frameworks make sense instead of feeling like magic.`),
      C('Text-to-SQL agents over a warehouse', `The model writes SQL from a question, runs it, checks the result and explains it. Reliability tricks:

- Give it the schema **with column descriptions** and a few example queries.
- Use a **read-only** database user, row limits and timeouts.
- Let it see errors and retry once.
- Evaluate on 30+ questions with known correct answers (compare results, not SQL text).`),
      C('Memory & state', `- **Short-term** — the conversation and tool results in the context window; summarise when long.
- **Long-term** — facts saved outside (database, vector store) and retrieved when relevant.
- **Task state** — where the agent is in a workflow; checkpoint it so a crash can resume.`),
      C('Multi-agent patterns', `Several specialised agents (researcher, writer, reviewer) or an orchestrator delegating to workers. Useful for clearly separable sub-tasks; but each hand-off adds cost, latency and failure points. Start with one agent and add more only when evals show a gain.`),
      C('Guardrails, human-in-the-loop & failure handling', `- Input and output checks (PII, policy, schema).
- Step and cost limits per run.
- Human approval before irreversible actions.
- Trace every step so failures can be debugged.
- Graceful fallback: "I could not complete this; here is what I found."`),
    ],
    quiz: [
      Q('Before building an agent you should ask…', ['Which framework is trendiest', 'Can a fixed workflow do this?', 'How many agents to use', 'Which GPU'], 1, 'Workflows are cheaper and more reliable.'),
      Q('A text-to-SQL agent should connect with…', ['An admin user', 'A read-only user with limits', 'No database', 'The app’s write user'], 1, 'Least privilege.'),
      Q('MCP standardises…', ['Model training', 'How AI apps connect to tools and data', 'GPU drivers', 'Tokenisation'], 1, 'Write the tool once, use from any client.'),
      Q('Why cap the number of agent steps?', ['To save tokens only', 'Prevent infinite loops and runaway cost', 'APIs require it', 'Faster model'], 1, 'Loops happen; caps contain them.'),
    ],
    practice: 'Build ai-6: a read-only text-to-SQL agent over your de-3 warehouse with a step cap, tracing and a 30-question eval.',
    explain: 'Explain the agent loop using how you debug code: guess, try, look at the error, try again.',
  },

  'ai-ft': {
    intro: 'Open models you can run and adapt yourself — and the judgement of when fine-tuning is actually worth it.',
    concepts: [
      C('Running models locally (Ollama)', `Ollama downloads and serves open models with one command, and exposes an OpenAI-compatible API on localhost.`,
        { code: `ollama pull qwen2.5:3b          # small enough for a 4 GB GPU / CPU
ollama run qwen2.5:3b "Explain idempotency in one line"
# API: http://localhost:11434/v1  (OpenAI-compatible)`, lang: 'bash' },
        { note: 'On a GTX 1650 (4 GB), 1.5B–3B models run well; 7B runs partly on CPU and is slower. Quantised (q4) versions use much less memory.' }),
      C('Hugging Face Hub & Transformers', `The Hub hosts most open models and datasets. The **transformers** library loads them in a few lines.`,
        { code: `from transformers import pipeline
clf = pipeline("sentiment-analysis")                       # downloads a default model
print(clf("This lesson was actually clear!"))
gen = pipeline("text-generation", model="Qwen/Qwen2.5-0.5B-Instruct")
print(gen("Data engineering is", max_new_tokens=30)[0]["generated_text"])`, lang: 'python' },
        { note: 'Always read the model card: training data, intended use, limitations and licence.' }),
      C('When to fine-tune vs RAG vs prompt', `Try in this order, and move on only when evals say so:`,
        { table: { cols: ['Need', 'Best tool'], rows: [
          ['Better instructions, format, tone', 'Prompting (+ examples)'],
          ['Knowledge from your documents, kept fresh', 'RAG'],
          ['Consistent style/format at scale, a narrow task, a smaller cheaper model', 'Fine-tuning'],
          ['New facts that change often', 'RAG, not fine-tuning'] ] } },
        { note: 'Fine-tuning teaches behaviour and format well; it is a poor way to add facts.' }),
      C('LoRA / parameter-efficient fine-tuning', `Full fine-tuning updates billions of weights. **LoRA** freezes the model and trains small low-rank adapter matrices — a tiny fraction of the parameters. **QLoRA** also loads the base model in 4-bit, so a small model can be tuned on a free Colab/Kaggle GPU.`,
        { code: `from peft import LoraConfig, get_peft_model
cfg = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
model = get_peft_model(base_model, cfg)
model.print_trainable_parameters()     # e.g. 0.3% of all parameters`, lang: 'python' },
        { note: 'Tools that make this easy on free GPUs: Unsloth notebooks, or Hugging Face TRL’s SFTTrainer.' }),
      C('Evaluating a fine-tuned model', `Compare against the **prompt-only baseline** on a held-out test set with the same metrics, plus latency and cost. Check for regressions on general ability and safety. Honest outcome is often "a better prompt was enough" — reporting that is a senior result.`),
    ],
    quiz: [
      Q('Company policies change monthly; the bot must answer from them. Use…', ['Fine-tuning', 'RAG', 'Higher temperature', 'Bigger model'], 1, 'Fresh facts belong in retrieval.'),
      Q('LoRA trains…', ['All weights', 'Small adapter matrices while the base is frozen', 'Only the tokenizer', 'Embeddings only'], 1, 'Parameter-efficient.'),
      Q('QLoRA reduces memory mainly by…', ['Smaller datasets', 'Loading the base model in 4-bit', 'Shorter prompts', 'CPU training'], 1, 'Quantised base weights.'),
    ],
    practice: 'Run qwen2.5:3b with Ollama, then follow an Unsloth Colab notebook to LoRA-tune a small model on 200 examples, and compare it with a few-shot prompt.',
    explain: 'Explain prompt vs RAG vs fine-tune using a new employee: instructions, a handbook, and months of training.',
  },

  'ai-app': {
    intro: 'Turning an AI prototype into a product people can use: API, streaming UI, protection against abuse, and caching.',
    concepts: [
      C('FastAPI + React for AI apps', `A typical shape: React front end → FastAPI back end (auth, prompts, tools, logging) → LLM provider. Keys and prompts stay on the server, never in the browser.`,
        { code: `from fastapi import FastAPI
from fastapi.responses import StreamingResponse
app = FastAPI()

@app.post("/chat")
async def chat(req: ChatRequest, user=Depends(current_user)):
    async def gen():
        stream = await client.chat.completions.create(model=M, messages=build(req), stream=True)
        async for ch in stream:
            yield ch.choices[0].delta.content or ""
    return StreamingResponse(gen(), media_type="text/plain")
# run: uvicorn main:app --reload`, lang: 'python' }),
      C('Streaming UI (Vercel AI SDK)', `The Vercel AI SDK gives React hooks (\`useChat\`) that handle streaming, message state and loading for you; it works with Next.js or any streaming endpoint. Without it, read the stream with fetch and a reader.`,
        { code: `const res = await fetch('/chat', { method: 'POST', body: JSON.stringify({ message }) })
const reader = res.body.getReader(); const dec = new TextDecoder()
for (;;) { const { done, value } = await reader.read(); if (done) break; setText((t) => t + dec.decode(value)) }`, lang: 'javascript' }),
      C('Auth, rate limits, cost caps', `An open LLM endpoint is a credit card on the internet.

- Require login for any endpoint that calls a paid model.
- Rate-limit per user and per IP.
- Cap tokens per request (max_tokens) and spend per user per day.
- Alert when daily spend crosses a threshold.`),
      C('Caching LLM responses', `- **Exact cache** — same prompt + model + settings → return the stored answer (Redis). Free speed for repeated questions.
- **Semantic cache** — embed the question; if a very similar one was answered, reuse it. Riskier: tune the threshold and never use it for personalised answers.
- Many providers also offer **prompt caching** of long, repeated prefixes (system prompt, documents) at a discount.`),
    ],
    quiz: [
      Q('Where should the LLM API key live?', ['In the React bundle', 'On the server only', 'In localStorage', 'In the URL'], 1, 'Anything in the browser is public.'),
      Q('Best protection against a surprise bill?', ['Bigger model', 'Auth + per-user rate limits + spend caps', 'Higher temperature', 'Streaming'], 1, 'Limit who and how much.'),
      Q('Semantic caching is risky for…', ['FAQ answers', 'Personalised answers', 'Static docs', 'Greetings'], 1, 'A "similar" question may need a different answer.'),
    ],
    practice: 'Put ai-4 behind FastAPI with login, per-user daily token caps and Redis exact caching; measure the cache hit rate.',
    explain: 'Explain why an AI app needs rate limits, using an all-you-can-eat buffet with no limits.',
  },

  'ai-mlops': {
    intro: 'Getting models into production and keeping them good: track experiments, version models, serve them, and watch for decay.',
    concepts: [
      C('Experiment tracking with MLflow', `Every training run logs its parameters, metrics, code version and artifacts, so you can compare runs and reproduce the best one.`,
        { code: `import mlflow
mlflow.set_experiment("churn")
with mlflow.start_run():
    mlflow.log_params({"max_depth": 5, "lr": 0.05})
    model.fit(X_train, y_train)
    mlflow.log_metric("val_auc", auc)
    mlflow.sklearn.log_model(model, "model")
# UI: mlflow ui  →  http://localhost:5000`, lang: 'python' }),
      C('Model registry & versioning', `A **registry** stores named model versions with stages/aliases (e.g. "champion", "challenger"), who promoted them and why. Deployments load "churn@champion" instead of a file path, so rollback is a one-line change.`),
      C('Model serving', `- **Batch** — score all rows on a schedule and write predictions to a table. Simplest; often enough.
- **Online API** — FastAPI/BentoML endpoint for real-time requests.
- **Streaming** — score events as they arrive.

Pick by how fresh predictions must be — same question as batch vs streaming in DE.`),
      C('Monitoring & drift', `Models decay because the world changes.

- **Data drift** — input distributions shift (new cities, new price ranges).
- **Concept drift** — the relationship changes (what predicts churn after a competitor launches).
- Monitor input stats, prediction distribution, and real outcomes when labels arrive; alert and retrain on thresholds. Tool: Evidently.`),
      C('Feature stores (Feast)', `A **feature store** defines features once and serves the *same* values for training (historical, point-in-time correct) and inference (low-latency online store). It prevents **training–serving skew**, where production computes a feature slightly differently from training.`),
    ],
    quiz: [
      Q('Rollback to the previous model should be…', ['Retraining from scratch', 'Switching the registry alias to the previous version', 'Restoring a laptop backup', 'Impossible'], 1, 'Registries make it trivial.'),
      Q('Data drift means…', ['The model file changed', 'Input distributions shifted', 'Labels are wrong', 'Server is slow'], 1, 'The data looks different from training.'),
      Q('Feature stores mainly prevent…', ['Overfitting', 'Training–serving skew', 'Leakage only', 'High cost'], 1, 'Same feature logic for training and serving.'),
    ],
    practice: 'Track 10 runs of your ai-2 model in MLflow, register the best, serve it with FastAPI, and run an Evidently drift report on shifted data.',
    explain: 'Explain model drift with a weather app trained only on winter data.',
  },

  'ai-llmops': {
    intro: 'Operating LLM apps in production: knowing what happened, what it cost, and whether quality is holding.',
    concepts: [
      C('Eval datasets & LLM-as-judge', `Your golden set from the Evals lesson becomes production infrastructure: version it, grow it from real failures, and run it on every change. Use LLM-as-judge for open-ended quality, calibrated against human labels, and deterministic checks (JSON valid, citation present) wherever possible.`),
      C('Tracing (Langfuse)', `A **trace** records every step of one request: prompt, retrieved chunks, tool calls, model responses, tokens, latency and cost. When a user reports a bad answer, you open the trace and see exactly which step failed.`,
        { code: `# self-host: docker compose up (Langfuse repo)  or use its free cloud tier
from langfuse.decorators import observe
@observe()
def answer(q):
    docs = retrieve(q)            # traced as a child span
    return generate(q, docs)`, lang: 'python' }),
      C('Prompt versioning', `Prompts are code. Store them in git or a prompt registry with versions, log which version produced each response, and roll out new versions gradually (or A/B) with evals before and monitoring after.`),
      C('Cost & latency dashboards', `Track per day and per feature: requests, tokens in/out, cost, p50/p95 latency, error rate, and user feedback. Break down by model and prompt version so you can see which change moved the numbers.`,
        { note: 'A good weekly habit for your crew: one chart of cost per 1,000 requests and quality pass rate, side by side.' }),
    ],
    quiz: [
      Q('A user says "the bot gave a wrong answer yesterday". First tool?', ['Retrain', 'Open the trace for that request', 'Raise temperature', 'Change models'], 1, 'Traces show which step failed.'),
      Q('Why log the prompt version with each response?', ['Legal requirement', 'To attribute quality and cost changes to prompt changes', 'Speed', 'Caching'], 1, 'Otherwise you cannot tell what caused a shift.'),
    ],
    practice: 'Add Langfuse tracing to ai-5 and build a small dashboard of daily cost, p95 latency and eval pass rate.',
    explain: 'Explain tracing as a delivery tracking timeline for one request.',
  },

  'ai-resp': {
    intro: 'Building AI that is fair, private, honest about uncertainty, safe — and legally yours to use.',
    concepts: [
      C('Bias & fairness', `Models learn patterns from historical data — including unfair ones. A loan model trained on past approvals can repeat past discrimination.

- Check performance **per group** (gender, region, language), not just overall.
- Look for proxy features (PIN code can proxy for community or income).
- Decide with stakeholders what "fair" means for the use case, and document it.`),
      C('Privacy & PII in training and prompts', `- Don't send personal data to third-party APIs unless the terms and your users allow it.
- Redact PII before logging prompts.
- Never train on user data without consent; India's DPDP Act 2023 requires a lawful purpose and consent for personal data.
- Prefer local models (Ollama) for sensitive data.`),
      C('Hallucinations & grounding', `LLMs produce fluent false statements. Reduce and expose them:

- Ground answers in retrieved sources with citations.
- Instruct the model to say "I don't know" and reward that in evals.
- Verify critical facts with tools (calculators, database lookups).
- Show sources in the UI so users can check.`),
      C('Safety guardrails', `Layers of protection: input filtering (abuse, injection), constrained tools and permissions, output checks (policy, PII, schema), and escalation to humans for sensitive cases. Test them with a red-team set of adversarial prompts in your evals.`),
      C('Licensing of models & data', `"Open" does not always mean free for any use. Check each model's licence (Apache-2.0 and MIT are permissive; some community licences restrict large-scale or certain commercial uses) and each dataset's terms. Record licences in your project README.`),
      C('Explaining AI decisions to users', `Users deserve to know when AI is involved and why it decided something. Show the main factors or sources behind an output, how confident the system is, and how to appeal or reach a human. For tabular models, SHAP values show feature contributions.`),
    ],
    quiz: [
      Q('Overall accuracy is 92%. Before shipping a loan model you should also check…', ['Nothing', 'Performance per group', 'Model size', 'Colour scheme'], 1, 'Averages hide group harms.'),
      Q('Best way to reduce hallucinations in a support bot?', ['Higher temperature', 'Ground in retrieved sources with citations and allow "I don’t know"', 'Longer answers', 'Remove system prompt'], 1, 'Grounding plus honest abstention.'),
      Q('A model is "open weights". That means it is…', ['Always free for any commercial use', 'Downloadable; usage depends on its licence', 'Public domain', 'Trained on open data'], 1, 'Read the licence.'),
    ],
    practice: 'Add a "Responsible AI" section to the README of ai-5: data sources and licences, PII handling, known failure modes, and the red-team cases you tested.',
    explain: 'Explain why a model can be accurate overall and still unfair, with an exam-grading example.',
  },

  'ai-de': {
    intro: 'Where your two tracks meet: data engineering for AI, and AI inside data pipelines. A strong, rare combination on a resume.',
    concepts: [
      C('Pipelines for unstructured data (PDF, images, audio)', `Treat documents, images and audio like any other source: land raw files in bronze, extract text/metadata in silver (parsing, OCR, Whisper for speech-to-text), and produce chunks, embeddings and structured fields in gold. Orchestrate, version and test it like your DE pipelines.`,
        { flow: ['Raw files (bronze)', 'Parse / OCR / transcribe (silver)', 'Chunks + embeddings + fields (gold)', 'Vector index & tables'] },
        { code: `pip install openai-whisper
whisper call_recording.mp3 --model small --language en   # local transcription`, lang: 'bash' }),
      C('Text-to-SQL over your warehouse', `Your star schemas and dbt docs are exactly what makes text-to-SQL work: clean names, column descriptions, and defined metrics. Feed the model the semantic layer / dbt docs, not raw tables, and evaluate by comparing query *results* against known answers.`),
      C('LLMs for data cleaning & classification', `LLMs can normalise messy text (company names, addresses), classify free-text (ticket categories, sentiment) and extract fields from documents — at scale, in batch.

- Use structured output + validation.
- Run in batches with a cheap model; route low-confidence rows to review.
- Measure accuracy on a labelled sample first, and cache results.`,
        { code: `# batch-classify 10k support tickets with a small model, validate each
for batch in chunks(tickets, 50):
    out = classify(batch)                 # JSON: [{"id":..,"category":..,"confidence":..}]
    for row in out:
        (review_queue if row["confidence"] < 0.7 else results).append(row)`, lang: 'python' }),
      C('Embedding pipelines at scale', `For millions of documents: batch embedding requests, run incrementally (only new/changed content, detected by hash), parallelise with Spark or Ray, store vectors with metadata in a vector DB or lakehouse table, and track the embedding model version so you can re-embed when it changes.`,
        { note: 'This is a perfect flagship-project topic for you: build fl-2 or fl-3 with an embedding pipeline in Airflow and evals on top.' }),
    ],
    quiz: [
      Q('Best context to give a text-to-SQL model?', ['Raw table dumps', 'Documented models / semantic layer with column descriptions', 'Nothing', 'Only table names'], 1, 'Clear semantics produce correct SQL.'),
      Q('Re-embedding millions of docs every night is wasteful. Instead…', ['Embed only new or changed docs (hash-based)', 'Stop updating', 'Use bigger vectors', 'Embed randomly'], 0, 'Incremental processing — same idea as incremental loads.'),
      Q('An LLM classifies tickets with low confidence on some rows. Do what?', ['Accept all', 'Route them to human review', 'Delete them', 'Raise temperature'], 1, 'Humans handle the uncertain tail.'),
    ],
    practice: 'Build a small Airflow DAG that ingests the PDFs in a folder, extracts text, chunks, embeds incrementally, and loads pgvector — then point your ai-5 RAG at it.',
    explain: 'Explain why a data engineer who understands embeddings and evals is more valuable than one who only moves tables.',
  },
}
