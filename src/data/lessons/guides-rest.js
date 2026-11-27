// Capstone walkthroughs — System design, DevOps, Cloud, Digital marketing ladders
const S = (t, body, ...blocks) => ({ t, body, blocks })
const W = (title, intro, arch, steps, talk) => ({ title, intro, steps: [S('The architecture', 'What you are building, end to end:', { arch }), ...steps, S('Talk about it in interviews', talk)] })

export default {
  // ───────── SYSTEM DESIGN ─────────
  'sd-1': W('Walkthrough: Design doc — URL shortener at scale', 'Estimate, design on paper, then build and measure the cache layer. 2–4 days.',
    [['Paper', ['Requirements', 'Estimates', 'API + data model', 'Diagram']], ['Build', ['Redis cache-aside on be-2']], ['Review', ['Crew design review on the call']]],
    [
      S('1 · Requirements', 'Functional: create, redirect, stats, expiry. Non-functional: 100M redirects/day, p99 < 50 ms, 99.9% availability, links never collide.'),
      S('2 · Estimates', '100M/day ≈ 1,200/s avg, ~5,000/s peak; 10M new links/month × 500 B ≈ 5 GB/month; 80/20 hot links → cache size estimate.'),
      S('3 · Design', 'API, tables, ID strategy, cache, analytics queue; draw it on your board.'),
      S('4 · Deep dives', 'ID generation at scale (ranges per server), hot links, 301 vs 302, abuse.'),
      S('5 · Build the cache', 'Add Redis cache-aside to be-2; load test; report hit rate and p95 with and without cache.'),
      S('6 · Review', 'Present to the crew in 10 minutes; they challenge one decision; update the doc.'),
    ],
    '"I wrote a full design doc for a URL shortener at 100M redirects/day, then implemented the caching deep-dive: Redis cache-aside gave a 92% hit rate and dropped redirect p95 from 18 ms to 3 ms."'),

  'sd-2': W('Walkthrough: Distributed rate limiter', 'Token bucket and sliding window, in memory then shared via Redis. 2–4 days.',
    [['Clients', ['Load generator']], ['App instances ×3', ['Rate limit middleware']], ['Redis', ['Atomic Lua scripts']], ['Output', ['Accepted/rejected graph']]],
    [
      S('1 · In-memory token bucket', 'Capacity + refill rate per key; unit tests with a fake clock.'),
      S('2 · Sliding window variants', 'Log and counter versions; compare memory and accuracy.'),
      S('3 · Distributed with Redis', 'Atomic Lua script so check-and-decrement can’t race.', { code: `-- KEYS[1]=bucket ARGV: capacity, rate, now, cost
local b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(b[1]) or tonumber(ARGV[1])
local ts = tonumber(b[2]) or tonumber(ARGV[3])
tokens = math.min(tonumber(ARGV[1]), tokens + (tonumber(ARGV[3]) - ts) * tonumber(ARGV[2]))
local ok = tokens >= tonumber(ARGV[4])
if ok then tokens = tokens - tonumber(ARGV[4]) end
redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', ARGV[3]); redis.call('EXPIRE', KEYS[1], 3600)
return ok and 1 or 0`, lang: 'lua' }),
      S('4 · Three instances', 'Run 3 app instances behind Nginx; verify the global limit holds within 1%.'),
      S('5 · Failure mode', 'Kill Redis: implement fail-open with a local fallback limit and an alert; document the choice.'),
      S('6 · Headers and graph', '429 + Retry-After + X-RateLimit-Remaining; plot accepted vs rejected during bursts.'),
    ],
    '"A distributed token-bucket rate limiter using an atomic Redis Lua script; three instances never exceeded the global limit by more than 1%, and when Redis fails it degrades to local limits instead of taking the API down."'),

  'sd-3': W('Walkthrough: News feed — fan-out on write vs read', 'Build both strategies, load them, and justify a hybrid with numbers. About 1 week.',
    [['Data', ['10k users, follow graph with celebrities']], ['Strategies', ['Fan-out on write (Redis timelines)', 'Fan-out on read (merge)', 'Hybrid']], ['Measure', ['k6: read p95, write cost, memory']]],
    [
      S('1 · Generate a realistic graph', 'Power-law followers: most users follow ~100, a few celebrities have 5k+ followers.'),
      S('2 · Fan-out on write', 'On post, push the id into each follower’s Redis list (capped at 500).'),
      S('3 · Fan-out on read', 'On feed load, fetch recent posts of everyone followed and merge (heap of k sorted lists).'),
      S('4 · Hybrid', 'Push for normal users; pull celebrity posts at read time and merge.'),
      S('5 · Measure', 'Feed read latency, post write time for a celebrity, Redis memory — table for all three.'),
      S('6 · Edge cases', 'Deletes, privacy changes, new follows (backfill), inactive users (skip fan-out).'),
    ],
    '"I implemented fan-out-on-write, fan-out-on-read and a hybrid feed over a power-law follow graph; the hybrid kept read p95 under 40 ms while cutting celebrity post fan-out from 5,000 writes to zero."'),

  'sd-4': W('Walkthrough: Event-driven order system', 'Three services with their own databases, an outbox, a saga and replayable events. About 1–1.5 weeks.',
    [['Services', ['Orders', 'Inventory', 'Payments']], ['Messaging', ['Kafka / RabbitMQ topics']], ['Patterns', ['Outbox per service', 'Saga with compensation', 'Read model from events']], ['Ops', ['Tracing across services']]],
    [
      S('1 · Boundaries', 'Each service owns its data; communicate only via events and APIs.'),
      S('2 · Outbox', 'Each service writes events to an outbox table in the same transaction; a relay publishes them.'),
      S('3 · Saga', 'OrderPlaced → reserve stock → charge → confirm; on PaymentFailed, release stock and fail the order.'),
      S('4 · Idempotent consumers', 'Processed-event table per service; at-least-once delivery handled.'),
      S('5 · Read model', 'A separate "order history" view built from events; delete and rebuild it by replaying the topic.'),
      S('6 · Chaos', 'Kill payments mid-order; restart; confirm every order ends consistent. Trace one order across services.'),
    ],
    '"Three services coordinated by events with transactional outboxes and a compensating saga; I killed the payment service mid-flow to prove orders always end in a consistent state, and rebuilt a read model by replaying events."'),

  'sd-5': W('Walkthrough: Notification system at scale', 'Email, SMS and push with priorities, preferences, dedupe and provider failover. About 1 week.',
    [['Producers', ['Services emit notification requests']], ['Notification service', ['Preferences', 'Dedupe', 'Templates', 'Priority queues']], ['Channels', ['Email (2 providers)', 'SMS', 'Push']], ['Tracking', ['Delivery status dashboard']]],
    [
      S('1 · Design for 10M users', 'Estimates, priorities (OTP > transactional > marketing), SLAs per priority.'),
      S('2 · API and templates', 'One request format; templates with variables and languages.'),
      S('3 · Preferences & quiet hours', 'Per user, per channel, per category; marketing respects quiet hours, OTP doesn’t.'),
      S('4 · Dedupe and rate limits', 'Same notification within 10 minutes is dropped; per-user caps.'),
      S('5 · Provider failover', 'Circuit breaker per provider; switch to the backup on errors.'),
      S('6 · Prove it', 'Simulate a provider outage during an OTP burst: OTPs still arrive within SLA.'),
    ],
    '"A notification service with priority queues, user preferences, dedupe and circuit-breaker failover between email providers; in an outage simulation, OTPs kept arriving within 10 seconds."'),

  'sd-6': W('Walkthrough: Mini Dropbox / S3', 'Chunked uploads, dedupe, metadata service and sync. 2–3 weeks.',
    [['Client', ['Sync agent (watch folder)', 'Chunker + hasher']], ['Metadata service', ['files, versions, chunks (Postgres)']], ['Blob storage', ['MinIO / S3 (chunks by hash)']], ['Notifications', ['Change feed (SSE)']]],
    [
      S('1 · Chunking', 'Split files into 4 MB chunks; SHA-256 each; a file = ordered list of chunk hashes.'),
      S('2 · Upload protocol', 'Client asks which chunks are missing; uploads only those (dedupe + resumable).'),
      S('3 · Metadata', 'Files, versions, chunk lists, owners; commit a new version atomically after all chunks exist.'),
      S('4 · Sync client', 'Watch a folder, upload changes, download others’ changes via a change feed.'),
      S('5 · Conflicts', 'Two devices edit offline → keep both as "conflicted copy" (like Dropbox).'),
      S('6 · Measure', 'Upload 2 GB, kill it, resume; show storage saved by dedupe across similar files.'),
    ],
    '"A Dropbox-style system with content-addressed 4 MB chunks, resumable uploads that skip existing chunks, versioned metadata and a sync client; dedupe saved 37% storage on our test set."'),

  'sd-7': W('Walkthrough: Ride-hailing dispatch', 'Real-time matching with a geospatial index, a simulator and a full design review. 2–3 weeks.',
    [['Simulator', ['5k drivers', 'Rider requests']], ['Location service', ['H3 index in memory / Redis GEO']], ['Matching service', ['Nearest-k', 'Offers + timeouts']], ['Trips', ['State machine', 'Surge per zone']], ['Ops', ['Dashboards', 'Load test']]],
    [
      S('1 · Design doc', 'One city: estimates for location updates (5k drivers × every 4 s = 1,250/s), requests, storage.'),
      S('2 · Location ingest', 'Drivers stream locations (WebSocket/UDP-ish); keep latest per driver in an H3-cell index.'),
      S('3 · Matching', 'Search nearby cells for available drivers, rank by ETA, offer with 10 s timeout, retry next.'),
      S('4 · Trip state machine', 'requested → accepted → arrived → in_trip → completed/cancelled; idempotent transitions.'),
      S('5 · Surge', 'Demand/supply ratio per zone every minute; price multiplier with caps.'),
      S('6 · Simulate and load test', 'Simulator moves drivers on a map; measure matching p95 and success rate at peak.'),
    ],
    '"A dispatch system with an H3 geospatial index handling 1,250 location updates/s, nearest-driver matching with timeouts and a trip state machine; under simulated peak load, matching p95 stayed under 200 ms."'),

  // ───────── DEVOPS ─────────
  'ops-1': W('Walkthrough: Shell automation toolkit', 'Dotfiles and scripts that set up a machine and look after it. 2–4 days.',
    [['Repo', ['dotfiles/', 'scripts/']], ['Scripts', ['install.sh', 'backup.sh', 'disk-alert.sh']], ['Scheduling', ['cron / systemd timers']], ['Quality', ['ShellCheck', 'pre-commit']]],
    [
      S('1 · Dotfiles', 'Shell config, aliases, git config, editor settings; install.sh symlinks them idempotently.'),
      S('2 · Backup with rotation', 'rsync/tar important folders, keep 7 daily + 4 weekly, verify archives.'),
      S('3 · Disk and log monitor', 'Alert (Telegram bot or email) when disk > 85% or errors spike in a log.'),
      S('4 · Scheduling', 'cron or systemd timers with flock and logs.'),
      S('5 · Safety', 'set -euo pipefail, guards on variables, dry-run flags; ShellCheck clean.'),
      S('6 · Prove it', 'Fresh VM or container: one command sets everything up.'),
    ],
    '"A dotfiles and automation repo: one-command machine setup, rotating verified backups and a disk/log monitor that alerts on Telegram — all ShellCheck-clean with safe-bash defaults."'),

  'ops-2': W('Walkthrough: Self-host on a Linux server', 'Run an app on a VM the classic way — secure, encrypted, self-healing. 2–4 days.',
    [['Internet', ['DNS → VM public IP']], ['VM (Ubuntu)', ['ufw + fail2ban', 'Nginx + Let’s Encrypt', 'systemd service', 'Postgres (local)']], ['Ops', ['Backups', 'Log rotation']]],
    [
      S('1 · VM', 'Free tier VM; create a sudo user; SSH keys only; disable root/password login.'),
      S('2 · Firewall', 'ufw allow SSH/80/443; fail2ban for SSH.'),
      S('3 · App as a service', 'systemd unit with Restart=on-failure, environment file, non-root user.'),
      S('4 · Nginx + TLS', 'Reverse proxy, certbot certificate, HTTP→HTTPS redirect, security headers.'),
      S('5 · Backups', 'Nightly pg_dump to object storage; a restore test.'),
      S('6 · Verify', 'SSL Labs A, reboot the VM and confirm it all comes back.'),
    ],
    '"I self-hosted my API on a hardened Ubuntu VM — key-only SSH, firewall and fail2ban, systemd with auto-restart, Nginx with Let’s Encrypt (SSL Labs A) and tested nightly backups."'),

  'ops-3': W('Walkthrough: Dockerise a 3-tier app', 'Front end, API, Postgres and Redis in Compose — small, secure images. About 1 week.',
    [['Compose', ['web (Nginx static)', 'api', 'postgres', 'redis']], ['Images', ['Multi-stage', '< 150 MB', 'Non-root']], ['Config', ['.env files', 'dev vs prod compose']]],
    [
      S('1 · API image', 'Multi-stage build, slim base, non-root, healthcheck.'),
      S('2 · Front-end image', 'Build stage with Node, serve static files from Nginx.'),
      S('3 · Compose', 'Services, healthchecks, depends_on with conditions, named volumes, internal network.'),
      S('4 · Dev vs prod', 'compose.override.yml with bind mounts and hot reload for dev.'),
      S('5 · Scan and slim', 'Trivy scan; dive to inspect layers; get under 150 MB.'),
      S('6 · Friend test', 'A friend clones and runs `docker compose up` — it works first time.'),
    ],
    '"I containerised a 3-tier app with multi-stage, non-root images under 150 MB, healthchecked Compose services and separate dev/prod configs; a friend ran it with one command on a fresh laptop."'),

  'ops-4': W('Walkthrough: CI/CD pipeline', 'Every PR tested and every merge deployed, with previews and rollback. About 1 week.',
    [['On PR', ['Lint', 'Test (with Postgres service)', 'Build', 'Scan', 'Preview deploy']], ['On merge', ['Push image :sha', 'Deploy staging', 'Smoke test', 'Approve → prod']], ['Rollback', ['Redeploy previous :sha']]],
    [
      S('1 · CI workflow', 'Lint and tests with a Postgres service container; caching for dependencies.'),
      S('2 · Build and push', 'Docker buildx with layer cache; tag with commit SHA; push to GHCR.'),
      S('3 · Security gate', 'Trivy fails the build on critical vulnerabilities.'),
      S('4 · Preview environments', 'Each PR deploys to a temporary environment (or a Vercel/Render preview).'),
      S('5 · Deploy on merge', 'Staging automatically, production behind an environment approval; OIDC instead of stored keys where possible.'),
      S('6 · Rollback', 'A workflow_dispatch job to redeploy any previous SHA; time it.'),
    ],
    '"A CI/CD pipeline where every PR is linted, tested against a real Postgres, scanned and deployed to a preview; merges deploy to staging automatically and to production with approval, and rollback to any commit takes under two minutes."'),

  'ops-5': W('Walkthrough: Infrastructure as code', 'Network, app and database in Terraform modules, reviewed in PRs. About 1 week.',
    [['Modules', ['network', 'app', 'database']], ['Environments', ['dev', 'prod (separate state)']], ['Workflow', ['plan on PR (comment)', 'apply on merge']], ['Checks', ['tflint', 'Checkov', 'Infracost']]],
    [
      S('1 · Remote state', 'S3 bucket + locking; bootstrap it once.'),
      S('2 · Network module', 'VPC, subnets in 2 AZs, routes, outputs.'),
      S('3 · App and database modules', 'Container service or VM, security groups referencing each other, managed DB in private subnets.'),
      S('4 · Environments', 'dev and prod calling the same modules with different variables.'),
      S('5 · CI', 'fmt/validate/tflint/Checkov/plan on PR with the plan as a comment; apply on merge with approval.'),
      S('6 · Destroy and recreate', 'Prove reproducibility; record the time and the monthly cost estimate.'),
    ],
    '"Terraform modules for network, app and database with separate dev/prod state; plans are posted on PRs with security checks and cost estimates, and the whole environment can be destroyed and recreated in one apply."'),

  'ops-6': W('Walkthrough: Kubernetes platform', 'Run your app on Kubernetes with Helm, autoscaling, ingress and canaries. 2–3 weeks.',
    [['Cluster', ['kind / k3s']], ['App', ['Helm chart', 'Deployment + Service', 'HPA']], ['Edge', ['ingress-nginx', 'cert-manager TLS']], ['Releases', ['Rolling', 'Canary (Argo Rollouts / weighted ingress)']]],
    [
      S('1 · Cluster', 'kind locally (or k3s on a VM); kubectl and k9s for navigation.'),
      S('2 · Manifests → Helm', 'Deployment, Service, ConfigMap, Secret, probes, resource requests/limits; then template as a Helm chart with values per environment.'),
      S('3 · Ingress and TLS', 'ingress-nginx and cert-manager (self-signed locally, Let’s Encrypt on a VM).'),
      S('4 · Autoscaling', 'metrics-server + HPA on CPU; load test and watch pods scale up and down.'),
      S('5 · Releases', 'Rolling update with maxUnavailable 0; then a canary sending 10% traffic to the new version.'),
      S('6 · Break it', 'OOMKill a pod, delete a node (k3s), fail readiness — explain what Kubernetes did each time.'),
    ],
    '"I deployed my API on Kubernetes with a Helm chart, TLS ingress and an HPA that scaled from 2 to 8 pods under load; I practised canary releases and documented how the cluster healed after OOM kills and node loss."'),

  'ops-7': W('Walkthrough: Observability, SLOs & GitOps', 'Metrics, logs, traces, SLO alerts and GitOps — then an incident and a postmortem. 2–3 weeks.',
    [['Telemetry', ['OpenTelemetry SDK in the app']], ['Backends', ['Prometheus', 'Loki', 'Tempo/Jaeger', 'Grafana']], ['Delivery', ['Argo CD from a deploy repo']], ['Reliability', ['SLO + burn-rate alerts', 'Chaos test', 'Postmortem']]],
    [
      S('1 · Instrument', 'OpenTelemetry for HTTP and DB spans; Prometheus metrics; JSON logs with trace ids.'),
      S('2 · Stack', 'kube-prometheus-stack + Loki + Tempo via Helm; Grafana data sources linked (trace ↔ logs).'),
      S('3 · Dashboards', 'Golden signals per service; deploy annotations.'),
      S('4 · SLO', '99.5% of requests < 300 ms over 30 days; multi-window burn-rate alerts.'),
      S('5 · GitOps', 'Argo CD syncs from a deploy repo; deploys are PRs bumping image tags.'),
      S('6 · Incident', 'Inject latency/failures (chaos); detect from dashboards; roll back via git revert; write a blameless postmortem.'),
    ],
    '"I built full observability with OpenTelemetry, Prometheus, Loki and Tempo, defined an SLO with burn-rate alerts, and ran a chaos incident: detected in under 5 minutes, rolled back via a GitOps revert, and documented in a blameless postmortem."'),

  // ───────── CLOUD (Merel) ─────────
  'cl-1': W('Walkthrough: Static site on S3 + CloudFront', 'A secure, fast, custom-domain website — with a budget alarm first. 2–4 days.',
    [['Account safety', ['Root MFA', 'Budget alarm', 'Admin role']], ['Hosting', ['Private S3 bucket', 'CloudFront (OAC)', 'ACM certificate']], ['DNS', ['Route 53 or your registrar']]],
    [
      S('1 · Account hygiene', 'Root MFA, IAM admin, $2 budget alarm with email alerts.'),
      S('2 · Bucket', 'Private bucket, Block Public Access on, versioning.'),
      S('3 · CloudFront', 'Distribution with Origin Access Control so only CloudFront reads the bucket; default root object; error pages.'),
      S('4 · HTTPS and domain', 'ACM certificate (us-east-1 for CloudFront), alias record; redirect HTTP → HTTPS.'),
      S('5 · Deploy script', '`aws s3 sync` + cache headers per file type + CloudFront invalidation.'),
      S('6 · Explain the bill', 'Estimate monthly cost at 1 lakh visits; diagram in the README.'),
    ],
    '"I hosted a site on a private S3 bucket behind CloudFront with OAC, HTTPS and a custom domain, set cache headers per file type, and can explain its monthly bill — with a budget alarm configured before anything else."'),

  'cl-2': W('Walkthrough: IAM done right', 'Users, groups, roles and least-privilege policies — plus an audit. 2–4 days.',
    [['Identities', ['Admins group', 'Developers group', 'ReadOnly group']], ['Roles', ['EC2 role (S3 read)', 'CI role (OIDC)']], ['Audit', ['CloudTrail', 'Access Analyzer', 'Credential report']]],
    [
      S('1 · Groups and users', 'No root use; groups with managed policies; MFA enforced via policy condition.'),
      S('2 · Hand-written least-privilege policy', 'S3 read/write to one prefix only; test allowed and denied actions with the policy simulator.'),
      S('3 · Roles instead of keys', 'EC2 instance role to read S3; GitHub OIDC role for deployments — zero access keys.'),
      S('4 · CloudTrail', 'Trail to a locked bucket; find who did what in the event history.'),
      S('5 · Access Analyzer', 'Fix any public or cross-account access findings; download the credential report.'),
      S('6 · Write-up', 'Policy explanations and a before/after of permissions.'),
    ],
    '"I set up IAM with groups, MFA enforcement, hand-written least-privilege policies tested in the simulator, and roles instead of access keys — including GitHub OIDC — with CloudTrail auditing and zero Access Analyzer findings."'),

  'cl-3': W('Walkthrough: Classic 3-tier app on AWS', 'A real app in a private network with a load balancer, auto-scaling and managed database. About 1–1.5 weeks.',
    [['Public subnets (2 AZs)', ['Application Load Balancer', 'NAT Gateway']], ['Private app subnets', ['Auto Scaling group (EC2) or ECS Fargate']], ['Private data subnets', ['RDS Postgres (Multi-AZ optional)']], ['Ops', ['SSM Session Manager', 'CloudWatch alarms']]],
    [
      S('1 · VPC', '10.0.0.0/16; public, app and data subnets in two AZs; route tables; S3 gateway endpoint.'),
      S('2 · Security groups', 'ALB from internet on 443; app only from ALB SG; DB only from app SG.'),
      S('3 · Database', 'RDS Postgres in data subnets, automated backups, no public access.'),
      S('4 · Compute', 'Launch template with user data (or ECS service); Auto Scaling group min 2 across AZs.'),
      S('5 · Load balancer', 'ALB with HTTPS (ACM) and health checks; target tracking scaling on CPU.'),
      S('6 · Prove resilience', 'Terminate an instance — traffic continues; load test — it scales out. Delete NAT/RDS after the lab to avoid bills.'),
    ],
    '"A 3-tier architecture across two AZs: ALB in public subnets, auto-scaling app servers in private subnets, RDS in isolated data subnets, security groups chained by reference and SSM instead of SSH; it self-healed when I terminated an instance."'),

  'cl-4': W('Walkthrough: Serverless API', 'API Gateway + Lambda + DynamoDB, deployed with code, cold starts measured. About 1 week.',
    [['Client', ['Web app']], ['API Gateway (HTTP API)', ['JWT auth (Cognito)', 'Throttling']], ['Lambda functions', ['GET/POST /logs', 'Worker (SQS)']], ['Data', ['DynamoDB (single-table)', 'SQS + DLQ']]],
    [
      S('1 · Access patterns first', 'List queries (logs by user by date, latest builds) and design PK/SK.'),
      S('2 · SAM or CDK project', 'Functions, table, API, least-privilege roles per function.'),
      S('3 · Auth', 'Cognito user pool; JWT authorizer on the API.'),
      S('4 · Async work', 'SQS queue + worker Lambda + DLQ for slow tasks.'),
      S('5 · Measure', 'Cold vs warm latency (memory sizes 128 → 1024 MB); cost per million requests vs the EC2 version.'),
      S('6 · Observe', 'CloudWatch logs/metrics, X-Ray traces, alarms on errors and DLQ depth.'),
    ],
    '"A serverless API with a single-table DynamoDB design from access patterns, Cognito auth, SQS workers with a DLQ, and measured cold starts — 1 GB memory halved cold-start time for a negligible cost increase."'),

  'cl-5': W('Walkthrough: Event-driven media pipeline', 'Upload a photo → resize, tag and notify, with retries and a dead-letter queue. About 1 week.',
    [['Trigger', ['S3 upload (uploads/)']], ['Orchestration', ['EventBridge → Step Functions']], ['Steps', ['Resize (Lambda)', 'Label (Rekognition)', 'Save metadata (DynamoDB)', 'Notify (SNS)']], ['Safety', ['Retries', 'DLQ', 'Dashboard']]],
    [
      S('1 · Buckets and events', 'uploads/ and processed/ prefixes; S3 → EventBridge rule.'),
      S('2 · State machine', 'Validate → Resize ∥ Label (parallel) → Save → Notify; retries with backoff; catch → DLQ.'),
      S('3 · Functions', 'Pillow resize Lambda (layer), Rekognition call, DynamoDB write.'),
      S('4 · Notifications', 'SNS email when processing completes or fails.'),
      S('5 · Burst test', 'Upload 500 images at once; every one processed or in the DLQ with a reason.'),
      S('6 · Dashboard', 'Executions, failures, duration, DLQ depth in CloudWatch.'),
    ],
    '"An event-driven image pipeline using S3 events, Step Functions with parallel resize and labelling, retries and a DLQ; a 500-image burst completed with every failure captured and explained."'),

  'cl-6': W('Walkthrough: Multi-environment infra in Terraform', 'Dev, staging and prod from the same code, deployed by CI, tagged for cost. 2–3 weeks.',
    [['Code', ['modules/ (network, app, data, monitoring)', 'envs/dev, envs/staging, envs/prod']], ['State', ['S3 backend per env']], ['CI', ['plan on PR', 'apply on merge (approval for prod)']], ['FinOps', ['Tags', 'Budgets', 'Monthly cost report']]],
    [
      S('1 · Module design', 'Small modules with clear inputs/outputs; version them.'),
      S('2 · Environments', 'Same modules, different sizes (dev small, prod Multi-AZ); separate state (ideally separate accounts).'),
      S('3 · CI/CD for infra', 'OIDC role per environment; plan comment on PR; manual approval for prod apply.'),
      S('4 · Tagging', 'default_tags: project, env, owner, cost-centre.'),
      S('5 · Monitoring module', 'Dashboards and alarms created with every environment.'),
      S('6 · New environment drill', 'Create a "demo" environment with one PR; destroy it after; cost report by tag.'),
    ],
    '"Multi-environment AWS infrastructure from shared Terraform modules with OIDC-based CI, prod approvals, default cost tags and monitoring baked into every environment — spinning up a new environment is one pull request."'),

  'cl-7': W('Walkthrough: Well-Architected review + DR drill', 'Review a real app against six pillars, fix the risks, and actually restore from disaster. About 2 weeks.',
    [['Review', ['Well-Architected Tool: 6 pillars']], ['Fixes', ['Multi-AZ', 'Backups', 'Least privilege', 'Cost right-sizing']], ['DR drill', ['Delete DB in sandbox', 'Restore', 'Measure RTO/RPO']], ['Report', ['Findings', 'Before/after', 'GCP/Azure mapping']]],
    [
      S('1 · Pick the workload', 'Your cl-3 app (or the team capstone).'),
      S('2 · Run the review', 'Answer the Well-Architected questions honestly; list high-risk issues.'),
      S('3 · Fix the top 5', 'E.g. Multi-AZ DB, AWS Backup plan with cross-region copy, alarms, IAM tightening, right-sizing.'),
      S('4 · Define RTO/RPO', 'With "the business" (your crew); pick a DR strategy that matches.'),
      S('5 · DR drill', 'Simulate loss; restore from backup; time each step; update the runbook.'),
      S('6 · Report', 'Findings, fixes, measured RTO/RPO, cost impact, and the equivalent design on Azure and GCP.'),
    ],
    '"I ran a Well-Architected review on our app, fixed the five highest risks, and performed a timed disaster-recovery drill — restoring the database in 18 minutes against a 1-hour RTO — documented with a runbook and cost impact."'),

  // ───────── DIGITAL MARKETING (Merel) ─────────
  'dm-1': W('Walkthrough: Brand teardown', 'Analyse 3 brands in one category and find the gap. 2–4 days.',
    [['Inputs', ['3 brands’ sites, socials, ads (Meta Ad Library)', 'Customer reviews']], ['Analysis', ['Positioning', 'Personas', 'Voice', 'Channels', 'Funnel']], ['Output', ['One-page brief: the gap']]],
    [
      S('1 · Pick a category you know', 'D2C snacks, ed-tech, cafés in Mangaluru, skincare.'),
      S('2 · Collect evidence', 'Screenshots of homepage, top posts, active ads, pricing, 20 customer reviews each.'),
      S('3 · Positioning', 'Write each brand’s positioning statement and value proposition in your words.'),
      S('4 · Audience and voice', 'Who they target; voice traits with examples.'),
      S('5 · Channels and funnel', 'Where they get attention, how they convert, how they retain.'),
      S('6 · The gap', 'Positioning map; the unserved space; one-page brief with a recommendation.'),
    ],
    '"I tore down three D2C snack brands — positioning, voice, ads and funnels — mapped them on price and tone, and identified an unserved space, summarised in a one-page brief a founder could act on."'),

  'dm-2': W('Walkthrough: One-month content engine', '30-day calendar and 12 finished, on-brand posts. 2–4 days.',
    [['Strategy', ['Persona', '4 content pillars']], ['Plan', ['30-day calendar (Notion/Sheets)']], ['Production', ['Canva brand kit', '12 posts + 4 reels']], ['Review', ['Crew feedback']]],
    [
      S('1 · Pillars', 'Educate / inspire / behind the scenes / promote, mapped to persona needs.'),
      S('2 · Calendar', 'Date, pillar, format, hook, CTA, status for 30 days.'),
      S('3 · Brand kit', 'Colours, fonts, logo, 3 templates in Canva.'),
      S('4 · Write', 'Hooks first (10 options each), then captions with AIDA/PAS.'),
      S('5 · Design', '12 posts and 4 short reels with captions.'),
      S('6 · Review and refine', 'Crew picks weakest 3 and you redo them; final pack ready to schedule.'),
    ],
    '"I built a 30-day content engine — pillars from persona research, a calendar, a Canva brand kit and 12 finished posts written with AIDA/PAS — ready for a client to schedule."'),

  'dm-3': W('Walkthrough: Grow a real account for 4 weeks', 'Run a page like an experiment, one hypothesis per week. 4 weeks part-time.',
    [['Baseline', ['Reach', 'Saves', 'Followers', 'Profile visits']], ['Weekly loop', ['Hypothesis', 'Post plan', 'Analytics review', 'Learning']], ['Output', ['4 weekly reports + final summary']]],
    [
      S('1 · Choose the account', 'A college club, a friend’s business, or a niche page you start.'),
      S('2 · Baseline', 'Record last 30 days of metrics before changing anything.'),
      S('3 · Week 1–4 hypotheses', 'E.g. reels vs carousels; hook styles; posting time; collab posts.'),
      S('4 · Post consistently', '4–5 posts/week; engage with comments within an hour.'),
      S('5 · Weekly review', 'What moved saves/shares/follows; keep, kill or change.'),
      S('6 · Final report', 'Results vs baseline, best formats, recommendations — your first case study.'),
    ],
    '"I ran a page for four weeks with one hypothesis per week; carousels with question hooks drove 3× more saves than reels, and followers grew 38% from baseline — documented in weekly reports."'),

  'dm-4': W('Walkthrough: SEO a real website', 'Research, audit, write and track. About 1–1.5 weeks + 4 weeks tracking.',
    [['Research', ['Keywords + intent', 'Competitor pages']], ['Technical', ['Audit (Screaming Frog / Lighthouse)', 'Fixes']], ['Content', ['3 articles', 'Internal links', 'Schema']], ['Tracking', ['Search Console', 'GA4']]],
    [
      S('1 · Access', 'Get Search Console and GA4 access for a real site (local business or your own).'),
      S('2 · Keyword research', 'Seed list → long-tail keywords with intent and difficulty; pick 3 targets.'),
      S('3 · Technical audit', 'Crawl: broken links, titles, meta, speed, mobile, indexing; fix the top issues.'),
      S('4 · Write 3 articles', 'Answer the query fully, original examples, headings, FAQs, internal links, schema.'),
      S('5 · Submit and track', 'Sitemap and URL inspection; track impressions, clicks, positions weekly.'),
      S('6 · Report', 'Before/after Search Console screenshots and next steps.'),
    ],
    '"I audited and fixed a local business site’s technical SEO and published three articles targeting long-tail keywords; within four weeks they gained impressions for all three targets and one reached page one."'),

  'dm-5': W('Walkthrough: Email funnel', 'Lead magnet → landing page → 5-email automation → A/B test. About 1 week + running time.',
    [['Acquire', ['Lead magnet', 'Landing page (Carrd/Framer)']], ['Nurture', ['5-email welcome flow (Brevo/Mailchimp)']], ['Measure', ['Opens', 'Clicks', 'Conversions', 'A/B subject lines']]],
    [
      S('1 · Lead magnet', 'One specific problem solved fast (checklist, template).'),
      S('2 · Landing page', 'One goal, clear headline, proof, short form; UTM-tagged links in.'),
      S('3 · Deliverability', 'Authenticated domain (SPF/DKIM/DMARC), double opt-in.'),
      S('4 · Welcome flow', 'Deliver → story → quick win → proof → offer.'),
      S('5 · A/B test', 'Subject lines on email 2; judge by clicks.'),
      S('6 · Report', 'Sign-up rate, open/click per email, conversions, learnings.'),
    ],
    '"I built an email funnel with a lead magnet, landing page and five-email automation on an authenticated domain; 31% of visitors signed up and an A/B-tested subject line lifted clicks by 40%."'),

  'dm-6': W('Walkthrough: Paid campaign on a tiny budget', 'Tracking first, structured testing, honest ROAS. About 2 weeks.',
    [['Tracking', ['GA4 events', 'Meta Pixel + CAPI', 'UTMs']], ['Test', ['3 creatives × 2 audiences']], ['Scale', ['Winner +20% budget steps']], ['Report', ['CPA', 'ROAS vs break-even']]],
    [
      S('1 · Goal and economics', 'KPI, budget (₹3–5k), margin → break-even ROAS / target CPA.'),
      S('2 · Tracking', 'Pixel, CAPI (or GTM server-side), GA4 key events; test a conversion end to end.'),
      S('3 · Creative test', '3 creatives (different hooks) × 2 audiences; equal budgets; 5–7 days.'),
      S('4 · Decide on data', 'Kill losers above target CPA; don’t edit daily.'),
      S('5 · Scale the winner', 'Increase budget gradually; add retargeting.'),
      S('6 · Report', 'Spend, CPA, ROAS vs break-even, what the platform over-claimed vs GA4, next test.'),
    ],
    '"With a ₹4,000 budget I tested three hooks across two audiences with proper tracking; the winning creative hit ₹140 CPA against a ₹200 target, and I reconciled Meta’s reported conversions against GA4 in the final report."'),

  'dm-7': W('Walkthrough: Full go-to-market for a launch', 'Launch a real product end to end with attribution and a case study. 3–4 weeks.',
    [['Before', ['Positioning', 'Launch message', 'Channel plan', 'Assets']], ['Launch week', ['Social', 'Email', 'Creators', 'Small paid', 'Communities']], ['After', ['Attribution dashboard (Looker Studio)', 'Case study']]],
    [
      S('1 · Pick the launch', 'Ideal: Study Together v2 or your crew’s flagship product (fl-4).'),
      S('2 · Positioning and message', 'One-line promise, proof points, objections and answers.'),
      S('3 · Channel plan', 'Owned (email, socials), earned (communities, creators), paid (small test) with dates and owners.'),
      S('4 · Assets', 'Landing page, launch video, posts, emails — AI-assisted drafts, human-edited.'),
      S('5 · Launch week', 'Execute daily, reply to everyone, fix the funnel live.'),
      S('6 · Attribution and case study', 'Looker Studio dashboard by UTM; case study with before/after numbers.'),
    ],
    '"I ran the go-to-market for our team’s product: positioning, a multi-channel launch plan and assets, and a Looker Studio attribution dashboard; launch week brought 210 sign-ups, 60% from community posts — documented as a case study."'),
}
