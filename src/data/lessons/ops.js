// DevOps — 10 lessons
const C = (t, body, ...blocks) => ({ t, body, blocks })
const D = (t, body, ...blocks) => ({ t, body, blocks, deep: true })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'ops-linux': {
    intro: 'Almost every server, container and cloud VM runs Linux. Comfort in the terminal is non-negotiable for DevOps and data roles.',
    concepts: [
      C('Filesystem & permissions', `Everything is a file under \`/\`: \`/etc\` (config), \`/var/log\` (logs), \`/home\`, \`/tmp\`, \`/opt\`, \`/proc\` (live system info). Permissions: owner/group/others × read/write/execute; \`sudo\` for admin actions.`,
        { code: `ls -la /var/log
sudo chown -R app:app /srv/app && chmod 750 /srv/app
find /var/log -name "*.log" -mtime +7 -size +100M
du -sh /var/* | sort -h | tail`, lang: 'bash' }),
      C('Processes, signals, systemd', `Processes have PIDs; signals tell them what to do (SIGTERM = please stop, SIGKILL = stop now, SIGHUP = reload). **systemd** runs services: start on boot, restart on crash, logs.`,
        { code: `# /etc/systemd/system/study-api.service
[Unit]
Description=Study API
After=network.target
[Service]
User=app
WorkingDirectory=/srv/app
EnvironmentFile=/srv/app/.env
ExecStart=/srv/app/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=on-failure
[Install]
WantedBy=multi-user.target
# sudo systemctl daemon-reload && sudo systemctl enable --now study-api`, lang: 'ini' }),
      C('Package managers', `apt (Debian/Ubuntu), dnf (Fedora/RHEL), apk (Alpine, common in containers), brew (Mac). Update the index, install, pin versions where reproducibility matters, remove what you don't need.`),
      C('Logs & journalctl', `systemd services log to the journal: \`journalctl -u study-api -f\` (follow), \`--since "1 hour ago"\`, \`-p err\` (errors only). Classic files live in /var/log (nginx, auth.log).`),
      C('SSH & keys', `Use key pairs (\`ssh-keygen -t ed25519\`), disable password and root login, use \`~/.ssh/config\` aliases, and an SSH agent. \`scp\`/\`rsync\` copy files; \`ssh -L\` tunnels a remote port (e.g. a database) to your laptop.`,
        { code: `ssh-keygen -t ed25519 -C "pankqx@laptop"
ssh-copy-id ubuntu@server
ssh -L 5433:localhost:5432 ubuntu@server     # reach server's Postgres at localhost:5433`, lang: 'bash' },
        pick('A service keeps crashing at 3 a.m. First command?', ['reboot', false], ['journalctl -u <service> --since "03:00"', true, 'Read the logs before changing anything.'], ['rm -rf /var/log', false])),
      D('Deep dive: the "server is slow" checklist', `\`uptime\` (load), \`top\`/\`htop\` (CPU, memory per process), \`free -h\` (memory, swap), \`df -h\` (disk full?), \`iostat\`/\`iotop\` (disk I/O), \`ss -tulpn\` (listening ports, connections), \`journalctl -p err -b\` (errors since boot). In that order, most problems reveal themselves in 2 minutes.`),
    ],
    quiz: [
      Q('Graceful stop signal?', ['SIGKILL', 'SIGTERM', 'SIGSEGV', 'SIGSTOP'], 1, 'Allows cleanup.'),
      Q('Make a service restart automatically on crash with systemd?', ['cron', 'Restart=on-failure', 'nohup', 'screen'], 1, 'Unit file option.'),
    ],
    practice: 'Do build ops-2: run your API as a systemd service behind Nginx on a VM with SSH hardening.',
    explain: 'Explain signals with a teacher saying "please wrap up" (TERM) vs pulling the plug (KILL).',
  },

  'ops-shell': {
    intro: 'Shell scripts automate the boring parts. Written carefully, they save hours; written carelessly, they delete things.',
    concepts: [
      C('Bash variables, loops, conditionals', `Quote variables (\`"$var"\`) — always.`,
        { code: `#!/usr/bin/env bash
for f in logs/*.log; do
  size=$(stat -c %s "$f")
  if (( size > 100000000 )); then echo "big: $f"; fi
done
name=\${1:-world}           # default value
[[ -f .env ]] || { echo "missing .env" >&2; exit 1; }`, lang: 'bash' }),
      C('Pipes, grep, sed, awk', `Small tools chained with pipes answer big questions fast.`,
        { code: `# top 10 IPs hitting nginx
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head
# count 5xx responses per hour
grep '" 5[0-9][0-9] ' access.log | awk '{print substr($4, 2, 14)}' | uniq -c
# replace a config value in place
sed -i 's/^LOG_LEVEL=.*/LOG_LEVEL=info/' .env`, lang: 'bash' }),
      C('cron', `Schedule commands: \`m h dom mon dow command\`. Use absolute paths, redirect output to a log, set the environment explicitly, and prevent overlapping runs with \`flock\`.`,
        { code: `# every day at 02:30, no overlap, logs kept
30 2 * * * flock -n /tmp/backup.lock /srv/app/backup.sh >> /var/log/backup.log 2>&1`, lang: 'bash' }),
      C('Writing safe scripts (set -euo pipefail)', `Make scripts fail loudly instead of continuing after errors:`,
        { code: `#!/usr/bin/env bash
set -euo pipefail          # exit on error, on unset vars, on failed pipes
IFS=$'\\n\\t'
trap 'echo "failed at line $LINENO" >&2' ERR
dir="\${BACKUP_DIR:?BACKUP_DIR must be set}"
rm -rf -- "\${dir:?}/old"    # :? guards against rm -rf /old if empty`, lang: 'bash' },
        pick('dir is accidentally empty. What does rm -rf "$dir/old" do without guards?', ['Nothing', false], ['Deletes /old — at the root', true, 'Use ${dir:?} so the script stops if it’s empty.'], ['Asks for confirmation', false])),
      D('Deep dive: when to stop using bash', `If a script needs data structures, JSON handling, error handling across many steps, or more than ~100 lines — switch to Python. Run ShellCheck on every script you keep; it catches most bash mistakes automatically.`),
    ],
    quiz: [
      Q('set -e makes a script…', ['Faster', 'Exit when a command fails', 'Verbose', 'Run as root'], 1, 'Stops on errors.'),
      Q('Prevent two cron runs overlapping?', ['sleep', 'flock', 'nohup', 'chmod'], 1, 'Lock file.'),
    ],
    practice: 'Do build ops-1: dotfiles, a backup script with rotation, a disk monitor, all passing ShellCheck.',
    explain: 'Explain pipes with an assembly line where each worker does one small job.',
  },

  'ops-git': {
    intro: 'Git is how teams collaborate on code. Fluency here makes you faster and saves you from disasters.',
    concepts: [
      C('Branching & merging', `Branches are cheap pointers. Work on a feature branch, merge via pull request. Merge commits keep history as it happened; fast-forward when possible; resolve conflicts by understanding both changes, then run tests.`),
      C('Rebase & interactive history', `\`git rebase main\` replays your commits on top of the latest main (linear history). Squash fix-up commits before review. Never rebase commits others already pulled. \`git reflog\` recovers "lost" commits.`,
        { code: `git fetch origin && git rebase origin/main      # update your branch
git commit --fixup <sha> && git rebase -i --autosquash origin/main
git reflog                                       # find anything you "lost"
git bisect start; git bisect bad; git bisect good v1.2   # find the commit that broke it`, lang: 'bash' }),
      C('Pull requests & reviews', `Small PRs (< 400 lines) with a clear description: what, why, how to test, screenshots. Reviewers check correctness, tests, naming, security and simplicity; be kind and specific. CI must be green before merge.`),
      C('Git flow vs trunk-based', `**Git flow** — long-lived develop/release branches; suits scheduled releases. **Trunk-based** — short-lived branches merged to main daily, feature flags for unfinished work, continuous deployment. Most modern teams use trunk-based.`,
        pick('A team deploys to production many times a day. Branching model?', ['Git flow with release branches', false], ['Trunk-based with short-lived branches and feature flags', true, 'Small, frequent merges keep main deployable.'], ['Everyone commits to their own long branch for months', false])),
      D('Deep dive: commit messages that help future you', `Imperative subject under ~60 characters ("Add idempotent upsert for daily loads"), blank line, then why the change was needed and anything surprising. Conventional Commits (feat:, fix:, chore:) enable automatic changelogs. Your crew’s commits are also your portfolio — make them readable.`),
    ],
    quiz: [
      Q('Recover a commit after a bad reset?', ['Impossible', 'git reflog', 'git clone again', 'git stash'], 1, 'Reflog remembers.'),
      Q('Rebasing commits others already pulled is…', ['Recommended', 'Dangerous — rewrites shared history', 'Required', 'Harmless'], 1, 'Only rebase private work.'),
    ],
    practice: 'In your crew repo: use feature branches + PRs with required review, squash fixups, and try git bisect on a deliberately broken commit.',
    explain: 'Explain rebase vs merge with rewriting your notes neatly vs stapling pages together.',
  },

  'ops-net': {
    intro: 'Getting traffic safely from the internet to your app — and debugging it when it doesn’t arrive.',
    concepts: [
      C('Ports, firewalls', `Only expose what must be public (80/443); everything else private or behind a VPN/SSH tunnel. \`ufw\` (Ubuntu) or cloud security groups; default deny inbound.`,
        { code: `sudo ufw default deny incoming && sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable
sudo ss -tulpn          # what is listening, and on which interface?`, lang: 'bash' }),
      C('Nginx reverse proxy', `Nginx terminates TLS and forwards to your app on localhost, adding compression, caching headers and rate limits.`,
        { code: `server {
  listen 443 ssl http2;
  server_name api.study.dev;
  ssl_certificate /etc/letsencrypt/live/api.study.dev/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.study.dev/privkey.pem;
  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}`, lang: 'nginx' }),
      C("TLS & certificates (Let's Encrypt)", `Free certificates via certbot; auto-renew with a timer; redirect HTTP → HTTPS; modern TLS settings; check with SSL Labs. Certificates expire — monitor expiry.`,
        { code: `sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.study.dev     # obtains cert and edits nginx config
sudo certbot renew --dry-run`, lang: 'bash' }),
      C('Debugging with curl, dig, ss', `Work from outside in:`,
        { steps: [['DNS', 'dig api.study.dev — does it resolve to the right IP?'], ['Reachability', 'curl -v https://api.study.dev — TLS ok? status?'], ['Firewall', 'Is 443 allowed (ufw / security group)?'], ['Proxy', 'Nginx logs: /var/log/nginx/error.log — upstream refused?'], ['App', 'ss -tulpn — is the app listening on 127.0.0.1:8000? journalctl for crashes.']] },
        pick('curl shows "502 Bad Gateway" from Nginx. Most likely?', ['DNS is wrong', false], ['Nginx can’t reach the app upstream (down or wrong port)', true, '502 = the proxy got no valid response from upstream.'], ['Certificate expired', false])),
      D('Deep dive: what X-Forwarded-For is for', `Behind a proxy, your app sees the proxy's IP. The proxy passes the real client IP in X-Forwarded-For; your app must trust it only from known proxies, or attackers can fake their IP (and bypass IP rate limits).`),
    ],
    quiz: [
      Q('502 from Nginx usually means…', ['Client error', 'Upstream app not responding correctly', 'DNS failure', 'Firewall blocked port 22'], 1, 'Bad gateway.'),
      Q('Free TLS certificates come from…', ["Let's Encrypt", 'Nginx', 'GitHub', 'DNS'], 0, 'Automated CA.'),
    ],
    practice: 'Serve your API on a VM via Nginx with a Let’s Encrypt certificate and get an A on SSL Labs.',
    explain: 'Explain a reverse proxy with a hotel reception directing guests to rooms.',
  },

  'ops-docker': {
    intro: 'Containers package apps with everything they need — the standard unit of deployment today.',
    concepts: [
      C('Images, layers, containers', `An image is a stack of read-only **layers** (one per Dockerfile instruction), cached and shared. A container adds a thin writable layer; when it’s deleted, that layer is gone — persist data in volumes.`),
      C('Dockerfile best practices', `Order for caching (dependencies before code), small base images, \`.dockerignore\`, pinned versions, non-root user, one process per container, healthcheck, no secrets in layers.`,
        { cards: [['Cache-friendly order', 'COPY requirements → install → COPY code'], ['.dockerignore', '.git, node_modules, .env, data'], ['Non-root', 'USER 1000'], ['No secrets', 'Build secrets via --secret, runtime via env/secret manager'], ['Pin', 'python:3.12-slim, not latest']] }),
      C('Multi-stage builds', `Build with all tools in one stage, copy only the result into a tiny runtime stage — smaller, safer images.`,
        { code: `FROM python:3.12 AS build
WORKDIR /app
COPY requirements.txt .
RUN pip wheel -r requirements.txt -w /wheels
FROM python:3.12-slim
COPY --from=build /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY app/ /app/app
USER 1000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`, lang: 'dockerfile' }),
      C('Volumes & networks', `**Volumes** persist data (databases) beyond container life. **Bind mounts** map host folders (dev hot reload). User-defined **networks** let containers reach each other by service name (\`db:5432\`).`),
      C('Docker Compose', `Define a multi-container app in one file; \`docker compose up\` runs it all — perfect for local dev and small deployments.`,
        { code: `services:
  api:
    build: .
    env_file: .env
    ports: ["8000:8000"]
    depends_on: { db: { condition: service_healthy } }
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: pg }
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: { test: ["CMD", "pg_isready"], interval: 5s }
volumes: { pgdata: {} }`, lang: 'yaml' },
        pick('Your Postgres data vanishes every time you recreate the container. Fix?', ['Use latest tag', false], ['Store data in a named volume', true, 'The container’s writable layer is deleted with it.'], ['Run as root', false])),
      D('Deep dive: shrinking an image from 1.2 GB to 150 MB', `Switch to a slim base, multi-stage build, remove build tools from the final stage, .dockerignore big folders, combine RUN steps and clean caches, and inspect layers with \`docker history\` or \`dive\`. Smaller images pull faster, start faster and have fewer vulnerabilities.`),
    ],
    quiz: [
      Q('Why copy requirements.txt before the source code?', ['Required syntax', 'Dependency layer stays cached when only code changes', 'Security', 'Smaller image always'], 1, 'Layer caching.'),
      Q('Containers in the same Compose network reach each other by…', ['localhost', 'Service name', 'Random IPs', 'They can’t'], 1, 'Built-in DNS.'),
    ],
    practice: 'Do build ops-3: Dockerise a 3-tier app with multi-stage builds, healthchecks and images under 150 MB.',
    explain: 'Explain image layers with a stack of transparent sheets.',
  },

  'ops-ci': {
    intro: 'Continuous integration and delivery: every change tested and shippable, automatically.',
    concepts: [
      C('GitHub Actions workflows', `YAML in \`.github/workflows\`: **triggers** (push, pull_request, schedule), **jobs** (run in parallel on runners), **steps** (commands or reusable actions), caching, matrices.`,
        { code: `name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:16, env: { POSTGRES_PASSWORD: pg }, ports: ["5432:5432"] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: pip }
      - run: pip install -r requirements.txt
      - run: ruff check . && pytest -q`, lang: 'yaml' }),
      C('Build, test, lint pipelines', `Order fast checks first (lint, types) then tests, then build artifacts. Fail fast; keep CI under ~10 minutes; flaky tests are bugs — fix or quarantine them.`),
      C('Deploy on merge', `Merging to main triggers: build image → push with commit tag → deploy to staging → smoke tests → (manual approval or automatic) production. Every deploy traceable to a commit.`,
        { flow: ['PR merged', 'Build & tag image', 'Deploy staging', 'Smoke tests', 'Approve', 'Deploy prod', 'Watch metrics'] }),
      C('Environments & secrets', `GitHub **environments** (staging, production) hold their own secrets and protection rules (required reviewers, branch restrictions). Prefer OIDC to cloud providers over stored keys; never echo secrets in logs.`,
        pick('Where should production deploy credentials live?', ['In the workflow YAML', false], ['OIDC role, or secrets in a protected "production" environment', true, 'Scoped, reviewable, never in code.'], ['In the repo README', false])),
      D('Deep dive: making CI fast', `Cache dependencies and Docker layers, run jobs in parallel, test only affected packages in monorepos, use test sharding, avoid sleeping in tests, and track CI duration as a metric — slow CI quietly kills team speed.`),
    ],
    quiz: [
      Q('Typical first CI step after checkout?', ['Deploy', 'Lint / type check (fast failures)', 'Load test', 'Delete caches'], 1, 'Fail fast.'),
      Q('GitHub environments help with…', ['Faster builds', 'Per-environment secrets and approval rules', 'Linting', 'Caching'], 1, 'Protection rules.'),
    ],
    practice: 'Do build ops-4: lint, test, build, scan, push, deploy on merge, with a production environment requiring approval.',
    explain: 'Explain CI/CD with a factory where every product is checked automatically before leaving.',
  },

  'ops-iac': {
    intro: 'Infrastructure defined in code — reviewed, versioned, repeatable. Terraform is the industry default.',
    concepts: [
      C('Terraform basics', `Providers (AWS, GCP, Cloudflare, GitHub…), resources, variables, outputs, and the plan/apply workflow. Terraform computes the diff between code and reality.`,
        { code: `variable "env" { type = string }
resource "aws_s3_bucket" "lake" { bucket = "study-lake-\${var.env}" }
output "lake_bucket" { value = aws_s3_bucket.lake.bucket }
# terraform init → terraform plan -var env=dev → terraform apply -var env=dev`, lang: 'hcl' }),
      C('State & backends', `State maps code to real resources. Store it remotely (S3 + DynamoDB/lockfile, Terraform Cloud) with locking and encryption; never commit it (it can contain secrets); never edit it by hand except with \`terraform state\` commands.`),
      C('Modules', `Reusable packages of resources with inputs and outputs — e.g. a \`network\` module used by dev/stage/prod. Keep modules small and well-documented; pin module versions.`,
        { code: `module "network" {
  source = "./modules/network"
  cidr   = "10.0.0.0/16"
  azs    = ["ap-south-1a", "ap-south-1b"]
}`, lang: 'hcl' }),
      C('Plan/apply in CI', `PR → \`terraform fmt\`, \`validate\`, \`plan\` posted as a comment → review → merge → \`apply\` in a protected environment. Add policy checks (tfsec/Checkov) and cost estimates (Infracost).`,
        pick('Who should run terraform apply against production?', ['Anyone from their laptop', false], ['The CI pipeline after a reviewed plan and approval', true, 'Auditable, consistent, locked.'], ['Nobody — click in the console', false])),
      D('Deep dive: importing what was clicked', `Existing hand-made resources can be brought under Terraform with \`import\` blocks, then \`plan\` until there’s no diff. Do it gradually, one resource group at a time. Afterwards, restrict console write access so drift doesn’t return.`),
    ],
    quiz: [
      Q('Terraform state should be stored…', ['In git', 'Remote backend with locking', 'In the README', 'Nowhere'], 1, 'Shared, locked, encrypted.'),
      Q('Reusable resource groups in Terraform are…', ['Providers', 'Modules', 'Outputs', 'Workspaces'], 1, 'Modules.'),
    ],
    practice: 'Do build ops-5: network/app/database modules, remote state, plan in PR, apply on merge, destroy and recreate.',
    explain: 'Explain declarative IaC with ordering "a room set up like this photo" rather than giving step-by-step instructions.',
  },

  'ops-k8s': {
    intro: 'Kubernetes runs containers across many machines, healing and scaling them. Learn the core objects; most YAML is variations on them.',
    concepts: [
      C('Pods, deployments, services', `- **Pod** — one or more containers scheduled together (usually one).
- **Deployment** — keeps N replicas of a pod running, rolling updates and rollbacks.
- **Service** — stable name and IP that load-balances to matching pods.`,
        { code: `apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/pankqx/study-api:a1b2c3
          ports: [{ containerPort: 8000 }]
          resources: { requests: { cpu: 100m, memory: 128Mi }, limits: { memory: 256Mi } }
          readinessProbe: { httpGet: { path: /readyz, port: 8000 } }
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec: { selector: { app: api }, ports: [{ port: 80, targetPort: 8000 }] }`, lang: 'yaml' }),
      C('ConfigMaps & secrets', `ConfigMaps hold config; Secrets hold sensitive values (base64, not encrypted by default — enable encryption at rest or use external secret managers). Mount as env vars or files; changing them doesn't restart pods automatically.`),
      C('Ingress', `An Ingress (with a controller like ingress-nginx or Traefik) routes external HTTP(S) by host/path to Services, with TLS (cert-manager + Let's Encrypt). The newer **Gateway API** is the successor.`),
      C('Helm charts', `Helm packages Kubernetes YAML as templated **charts** with values per environment; install, upgrade and roll back releases with one command.`,
        { code: `helm create study-api
helm upgrade --install api ./study-api -f values-staging.yaml
helm rollback api 3`, lang: 'bash' }),
      C('Local clusters (kind / minikube)', `Practise for free on your laptop: \`kind create cluster\`, load your image, apply manifests, \`kubectl port-forward\`. k3s for a lightweight real cluster on a VM.`,
        { code: `kind create cluster --name study
kind load docker-image study-api:dev --name study
kubectl apply -f k8s/ && kubectl get pods -w
kubectl logs deploy/api -f; kubectl describe pod <name>    # debugging`, lang: 'bash' },
        pick('A pod shows CrashLoopBackOff. First step?', ['Delete the cluster', false], ['kubectl logs <pod> --previous and kubectl describe pod', true, 'See why the container exited and recent events.'], ['Scale to 100 replicas', false])),
      D('Deep dive: requests, limits and autoscaling', `Requests reserve resources (scheduling); limits cap them (memory over limit → OOMKilled; CPU over limit → throttled). HPA scales replicas on CPU/memory or custom metrics (queue length). Set requests from measured usage, memory limits always, CPU limits carefully.`),
    ],
    quiz: [
      Q('Which object keeps 3 replicas running and handles rolling updates?', ['Pod', 'Deployment', 'Service', 'ConfigMap'], 1, 'Deployment.'),
      Q('Container exceeds its memory limit. Result?', ['Throttled', 'OOMKilled', 'Ignored', 'Moved'], 1, 'Memory limits are enforced by killing.'),
    ],
    practice: 'Do build ops-6: kind cluster, Helm chart for your API, HPA under load, ingress with TLS, rolling and canary deploys.',
    explain: 'Explain Deployments and Services with a manager keeping 3 counters staffed and a single queue sign pointing to them.',
  },

  'ops-obs': {
    intro: 'You can’t fix what you can’t see. Observability turns "it’s slow" into "this query on this endpoint since this deploy".',
    concepts: [
      C('Prometheus metrics', `Prometheus scrapes \`/metrics\` endpoints and stores time series. Metric types: counter (requests_total), gauge (queue_depth), histogram (request_duration_seconds). Query with PromQL.`,
        { code: `# error rate over 5 minutes
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
# p95 latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`, lang: 'text' }),
      C('Grafana dashboards', `Dashboards over Prometheus, Loki, databases. Per service: the four golden signals (latency, traffic, errors, saturation), plus deploy annotations so changes line up with graphs.`),
      C('Centralised logs (Loki)', `Ship logs from all containers/hosts to one place (Loki, ELK, CloudWatch). Structured JSON logs with request ids make it possible to jump from a slow trace to its logs.`),
      C('Alerting & on-call basics', `Alert on **symptoms** users feel (error rate, latency SLO burn), not every cause. Every alert must be actionable and link to a runbook. Rotate on-call; review alerts weekly to remove noise; write blameless postmortems.`,
        pick('Your team gets 40 alerts a night, most ignored. Best fix?', ['Add more alerts', false], ['Delete/merge non-actionable alerts and alert on SLO burn rates', true, 'Alert fatigue hides real incidents.'], ['Turn off phones', false])),
      D('Deep dive: SLOs and error budgets', `SLO: "99.5% of requests succeed in < 300 ms over 30 days". The error budget is the 0.5% you may fail. Burn-rate alerts fire when you’re using the budget too fast. If the budget is spent, prioritise reliability over features — a shared, objective rule between dev and ops.`),
    ],
    quiz: [
      Q('Which metric type for "requests served so far"?', ['Gauge', 'Counter', 'Histogram', 'Summary only'], 1, 'Monotonic counter.'),
      Q('Good alerts are based on…', ['Every CPU spike', 'User-facing symptoms with runbooks', 'Disk at 10%', 'Log volume'], 1, 'Actionable symptoms.'),
    ],
    practice: 'Do build ops-7: Prometheus + Grafana + Loki for your API, one SLO with a burn-rate alert, then break something and write a postmortem.',
    explain: 'Explain metrics, logs and traces with a car: dashboard gauges, a trip diary, and GPS route history.',
  },

  'ops-gitops': {
    intro: 'Git as the source of truth for what runs in production, and security built into the pipeline.',
    concepts: [
      C('Argo CD', `Argo CD watches a Git repo of Kubernetes manifests/Helm values and continuously syncs the cluster to match. Deploy = merge a PR changing the image tag; rollback = revert the commit; drift is detected and corrected.`,
        { flow: ['CI builds image :sha', 'PR bumps tag in deploy repo', 'Review & merge', 'Argo CD syncs cluster', 'Health checks', 'Revert commit to roll back'] }),
      C('Image scanning (Trivy)', `Scan images and dependencies for known vulnerabilities (CVEs), misconfigurations and leaked secrets in CI; fail on critical issues; rebuild regularly to pick up patched base images.`,
        { code: `trivy image --severity HIGH,CRITICAL --exit-code 1 ghcr.io/pankqx/study-api:a1b2c3
trivy fs --scanners vuln,secret,misconfig .`, lang: 'bash' }),
      C('Secrets (Vault / SOPS)', `Git can't hold plain secrets. Options: **SOPS** (encrypt secret files in git with KMS/age keys), **Sealed Secrets**, **External Secrets Operator** pulling from Vault/AWS Secrets Manager. Vault also issues short-lived dynamic credentials (e.g. a DB user per app instance).`),
      C('Policy as code', `Write rules as code and enforce them automatically: OPA/Gatekeeper or Kyverno in Kubernetes ("no privileged containers", "images only from our registry", "resource limits required"), Checkov/tfsec for Terraform. Violations fail the PR or are rejected by the cluster.`,
        pick('Ensure no one deploys containers running as root to the cluster. Best approach?', ['A wiki page asking nicely', false], ['An admission policy (Kyverno/Gatekeeper) rejecting such pods', true, 'Enforced automatically, every time.'], ['Manual review once a year', false])),
      D('Deep dive: supply-chain security', `Pin dependencies and GitHub Actions by SHA, generate SBOMs (Syft), sign images (Cosign) and verify signatures at deploy, enable Dependabot, and give CI only the permissions it needs. Attacks increasingly target build pipelines, not just running apps.`),
    ],
    quiz: [
      Q('In GitOps, how do you roll back?', ['SSH into nodes', 'Revert the commit in the deploy repo', 'Delete the cluster', 'kubectl edit live'], 1, 'Git is the source of truth.'),
      Q('SOPS lets you…', ['Scan images', 'Store encrypted secrets in git', 'Run Kubernetes', 'Monitor logs'], 1, 'Encrypted files, decrypted at deploy.'),
    ],
    practice: 'Add Argo CD to your kind cluster syncing from a deploy repo, Trivy in CI, SOPS-encrypted secrets and one Kyverno policy.',
    explain: 'Explain GitOps with a restaurant that only cooks what is written on the official order sheet.',
  },
}
