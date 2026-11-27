// Cloud computing — lessons 9–17
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'cld-containers': {
    intro: 'Package an app once, run it anywhere — then let the cloud run the containers for you.',
    concepts: [
      C('Docker basics', `A **container image** bundles your app with its runtime and libraries. A **container** is a running instance of it. Same image on your laptop, in CI and in production — no "works on my machine".`,
        { code: `# Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER 1000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`, lang: 'dockerfile' },
        { code: `docker build -t study-api .
docker run -p 8000:8000 --env-file .env study-api
docker ps; docker logs <id>`, lang: 'bash' },
        { cards: [['Image', 'A read-only template (layers).'], ['Container', 'A running instance of an image.'], ['Registry', 'Where images are stored (Docker Hub, ECR).'], ['Volume', 'Persistent data outside the container.']] }),
      C('ECR (container registry)', `**ECR** is AWS's private image registry. CI builds the image, tags it with the git commit, and pushes it; ECS/EKS pull from it. Turn on image scanning and lifecycle rules to delete old images.`,
        { code: `aws ecr create-repository --repository-name study-api --image-scanning-configuration scanOnPush=true
aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.ap-south-1.amazonaws.com
docker tag study-api <acct>.dkr.ecr.ap-south-1.amazonaws.com/study-api:$(git rev-parse --short HEAD)
docker push <acct>.dkr.ecr.ap-south-1.amazonaws.com/study-api:$(git rev-parse --short HEAD)`, lang: 'bash' }),
      C('ECS & Fargate', `**ECS** runs containers from a **task definition** (image, CPU, memory, env, ports). A **service** keeps N tasks running behind a load balancer and rolls out new versions. **Fargate** means no servers to manage — you pay per task CPU/memory per second.`,
        { arch: [['ALB', ['HTTPS :443']], ['ECS service (desired = 3) on Fargate', ['Task a', 'Task b', 'Task c']], ['Pulled from', ['ECR image :a1b2c3']]] }),
      C('EKS (Kubernetes) intro', `**EKS** is managed Kubernetes. Kubernetes is powerful and portable (same tools on any cloud), but has a steep learning curve and running cost. Choose it when you need its ecosystem (Helm, operators), many teams and services, or multi-cloud portability; otherwise ECS/Fargate is simpler.`),
      C('App Runner & simpler options', `Not every app needs a cluster. **App Runner** takes a container image or repo and gives you an HTTPS URL with auto-scaling — almost no configuration. Alternatives: Lightsail for simple VMs, Elastic Beanstalk for classic PaaS.`,
        pick('A 3-person team needs one containerised API online this week with HTTPS and autoscaling. Simplest?', ['EKS with Helm', false], ['App Runner (or ECS Fargate)', true, 'Fully managed with minimal setup; Kubernetes would be overkill.'], ['EC2 with manual Docker', false])),
    ],
    quiz: [
      Q('Fargate means…', ['Kubernetes only', 'Run containers without managing servers', 'A registry', 'A database'], 1, 'Serverless compute for containers.'),
      Q('Tag images with…', ['latest only', 'The git commit SHA', 'Random names', 'Dates only'], 1, 'Traceable, immutable versions.'),
      Q('When is EKS worth its complexity?', ['A single small API', 'Many services/teams needing Kubernetes ecosystem or portability', 'Static websites', 'Always'], 1, 'Otherwise ECS/App Runner.'),
    ],
    practice: 'Dockerise your FastAPI app, push to ECR, and run it on ECS Fargate behind an ALB (or App Runner first if short on time).',
    explain: 'Explain containers using tiffin boxes: the same packed meal works at home, office or train.',
  },

  'cld-iac': {
    intro: 'Clicking in the console does not scale and cannot be reviewed. Infrastructure as code makes infra repeatable, reviewable and reversible.',
    concepts: [
      C('CloudFormation basics', `AWS's native IaC: YAML/JSON **templates** declare resources; CloudFormation creates them as a **stack**, in dependency order, and rolls back on failure.`,
        { code: `Resources:
  RawBucket:
    Type: AWS::S3::Bucket
    Properties:
      VersioningConfiguration: { Status: Enabled }
      PublicAccessBlockConfiguration: { BlockPublicAcls: true, BlockPublicPolicy: true, IgnorePublicAcls: true, RestrictPublicBuckets: true }
# aws cloudformation deploy --template-file infra.yaml --stack-name study-raw`, lang: 'yaml' }),
      C('Terraform with AWS', `**Terraform** (HCL language) works across AWS, Azure, GCP and SaaS tools — the most requested IaC skill in job posts.`,
        { code: `provider "aws" { region = "ap-south-1" }

resource "aws_s3_bucket" "raw" { bucket = "pank-study-raw-2026" }

resource "aws_s3_bucket_versioning" "raw" {
  bucket = aws_s3_bucket.raw.id
  versioning_configuration { status = "Enabled" }
}`, lang: 'hcl' },
        { steps: [['terraform init', 'Downloads providers, sets up the backend.'], ['terraform plan', 'Shows exactly what will change. Review it like a PR.'], ['terraform apply', 'Makes the changes and updates state.'], ['terraform destroy', 'Removes everything — perfect for labs and bills.']] }),
      C('AWS CDK (intro)', `The **CDK** lets you define infrastructure in TypeScript or Python with loops, functions and high-level constructs; it synthesises CloudFormation. Great for developers who prefer real code.`,
        { code: `from aws_cdk import Stack, aws_s3 as s3
class RawStack(Stack):
    def __init__(self, scope, id, **kw):
        super().__init__(scope, id, **kw)
        s3.Bucket(self, "Raw", versioned=True, block_public_access=s3.BlockPublicAccess.BLOCK_ALL)
# cdk deploy`, lang: 'python' }),
      C('State, drift & environments', `- **State** — Terraform's record of what it manages. Store it remotely (S3 + locking), never in git; it can contain secrets.
- **Drift** — someone changed resources by hand; plan shows the difference. Fix by updating code, not more clicks.
- **Environments** — same modules with different variables for dev/stage/prod, separate state (and ideally separate accounts).`,
        pick('A teammate changed a security group in the console. Terraform plan now shows a diff. Best action?', ['Ignore it', false], ['Decide the correct value, put it in code, and apply — so code is the source of truth', true, 'Code must reflect reality; manual changes get overwritten or cause surprises.'], ['Delete the state file', false])),
    ],
    quiz: [
      Q('Before terraform apply you should…', ['Delete state', 'Read terraform plan', 'Commit state to git', 'Disable locking'], 1, 'Review the exact change.'),
      Q('Where should Terraform state live for a team?', ['In git', 'Remote backend with locking (S3)', 'On one laptop', 'Nowhere'], 1, 'Shared, locked, secure.'),
      Q('Drift means…', ['Slow network', 'Real resources differ from code', 'A new region', 'Cost increase'], 1, 'Manual or external changes.'),
    ],
    practice: 'Rewrite your S3 + VPC labs in Terraform with a remote S3 backend, then destroy and recreate everything in one command.',
    explain: 'Explain IaC as a recipe vs cooking from memory each time.',
  },

  'cld-cicd': {
    intro: 'Ship to the cloud on every merge — safely, without long-lived keys, and with a fast way back.',
    concepts: [
      C('GitHub Actions deploying to AWS (OIDC, no long-lived keys)', `With **OIDC**, GitHub proves to AWS "this workflow is from repo X, branch main", and AWS gives it a temporary role. No access keys stored in GitHub secrets at all.`,
        { code: `permissions: { id-token: write, contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<acct>:role/github-deploy
          aws-region: ap-south-1
      - run: aws sts get-caller-identity`, lang: 'yaml' },
        { note: 'In the role’s trust policy, restrict the subject to your repo and branch (repo:pankqx/study-together:ref:refs/heads/main).' }),
      C('Build & push images', `Pipeline: test → build image → scan → push to ECR tagged with the commit → update the service. Cache Docker layers to keep builds fast.`,
        { flow: ['Push / PR', 'Lint + tests', 'docker build (cached)', 'Scan (Trivy)', 'Push :sha to ECR', 'Deploy'] }),
      C('Blue/green & canary deploys', `- **Rolling** — replace instances a few at a time (default in ECS).
- **Blue/green** — stand up the new version (green) next to the old (blue), switch traffic at once, keep blue for instant rollback.
- **Canary** — send 5–10% of traffic to the new version, watch errors/latency, then shift the rest.`,
        { steps: [['Deploy green', 'New version runs alongside blue, no traffic.'], ['Smoke test', 'Health checks and a few test requests on green.'], ['Shift 10%', 'Canary: watch error rate and p95 latency for 10 minutes.'], ['Shift 100%', 'If metrics are fine.'], ['Keep blue', 'For instant rollback, then retire it.']] }),
      C('Rollbacks', `Plan the way back before you ship: immutable versioned images, the previous task definition one click away, automatic rollback on failed health checks or alarms (ECS deployment circuit breaker, CodeDeploy alarms), and database migrations that are backward-compatible (expand → migrate → contract).`,
        pick('A deploy also renames a database column. What makes rollback safe?', ['Rename in place and hope', false], ['Expand/contract: add new column, dual-write, switch reads, remove old later', true, 'Old and new app versions both keep working during the change.'], ['Disable backups', false])),
    ],
    quiz: [
      Q('Why OIDC instead of AWS keys in GitHub secrets?', ['Faster builds', 'Short-lived credentials, nothing to leak or rotate', 'Required by AWS', 'Cheaper'], 1, 'Temporary role credentials.'),
      Q('Canary deployment sends new version…', ['All traffic immediately', 'A small slice of traffic first', 'No traffic', 'Only to admins'], 1, 'Then increases if healthy.'),
      Q('Fastest rollback in blue/green?', ['Rebuild', 'Switch traffic back to blue', 'Restore backup', 'Redeploy from laptop'], 1, 'Old version is still running.'),
    ],
    practice: 'Add an OIDC GitHub Actions workflow that builds, scans, pushes to ECR and updates your ECS service on every merge to main.',
    explain: 'Explain canary deploys using a new dish served to one table before adding it to the menu.',
  },

  'cld-data': {
    intro: 'The AWS services data engineers use daily — mapped to the DE concepts you already learned.',
    concepts: [
      C('Glue & Glue Data Catalog', `- **Glue Data Catalog** — the metastore: databases and tables (schema + S3 location + partitions) used by Athena, EMR, Redshift Spectrum.
- **Crawlers** — scan S3 and infer schemas into the catalog.
- **Glue jobs** — serverless Spark (or Python) ETL.`,
        { arch: [['S3 lake', ['bronze/', 'silver/', 'gold/']], ['Glue Data Catalog', ['db: silver', 'table: orders (partitions)']], ['Query engines', ['Athena', 'EMR Spark', 'Redshift Spectrum']]] }),
      C('Athena', `Serverless SQL directly on S3 (Trino engine). Pay per TB scanned — so partitions and Parquet matter enormously.`,
        { code: `CREATE EXTERNAL TABLE silver.orders (order_id string, amount double, customer_id string)
PARTITIONED BY (order_date date)
STORED AS PARQUET LOCATION 's3://pank-lake/silver/orders/';
MSCK REPAIR TABLE silver.orders;       -- load partitions
SELECT order_date, SUM(amount) FROM silver.orders
WHERE order_date >= DATE '2026-11-01' GROUP BY 1;`, lang: 'sql' },
        { note: 'Same query over CSV vs partitioned Parquet can differ 50–100× in bytes scanned — and cost.' }),
      C('Redshift', `AWS's MPP data warehouse (provisioned or serverless). Columnar, distribution and sort keys for performance, COPY from S3 for loads, Spectrum to query S3 directly, and zero-ETL integrations from Aurora.`),
      C('Kinesis', `Managed streaming: **Kinesis Data Streams** (shards, like Kafka partitions), **Firehose** (no-code delivery of streams into S3/Redshift/OpenSearch with batching and format conversion). **MSK** is managed Kafka when you want Kafka itself.`,
        { flow: ['App events', 'Kinesis Data Streams', 'Lambda / Flink processing', 'Firehose → S3 Parquet', 'Athena'] }),
      C('EMR', `Managed Spark/Hadoop/Trino clusters (also EMR Serverless and EMR on EKS). Use for heavy, custom Spark jobs where Glue is limiting; run on spot instances for cost.`,
        { table: { cols: ['Need', 'AWS service'], rows: [['Catalog of lake tables', 'Glue Data Catalog'], ['Ad-hoc SQL on S3', 'Athena'], ['Warehouse', 'Redshift'], ['Streaming ingest', 'Kinesis / MSK'], ['Big Spark jobs', 'EMR / Glue'], ['Orchestration', 'MWAA (Airflow) / Step Functions']] } }),
    ],
    quiz: [
      Q('Athena pricing is based on…', ['Rows returned', 'Data scanned', 'Query time', 'Users'], 1, 'Per TB scanned.'),
      Q('Where do Athena and EMR look up table schemas?', ['IAM', 'Glue Data Catalog', 'CloudWatch', 'Route 53'], 1, 'Shared metastore.'),
      Q('Deliver a stream into S3 as batched Parquet with no code?', ['Kinesis Firehose', 'SQS', 'EBS', 'Glue crawler'], 0, 'Firehose handles batching and conversion.'),
    ],
    practice: 'Upload partitioned Parquet to S3, crawl it with Glue, and compare bytes scanned in Athena for CSV vs Parquet.',
    explain: 'Map your local DE stack to AWS services in a table and explain each row.',
  },

  'cld-ops': {
    intro: 'Running in the cloud is a daily job: watch it, keep it healthy, keep it cheap, and be able to recover.',
    concepts: [
      C('CloudWatch metrics & logs', `- **Metrics** — CPU, latency, errors, custom business numbers. **Alarms** on thresholds notify via SNS.
- **Logs** — app and service logs; **Logs Insights** to query them.
- **Dashboards** — the four golden signals: latency, traffic, errors, saturation.`,
        { code: `fields @timestamp, @message
| filter level = "ERROR"
| stats count() by bin(5m)
| sort @timestamp desc`, lang: 'sql' }),
      C('Well-Architected Framework', `AWS's six pillars for reviewing any design:`,
        { cards: [['Operational excellence', 'Automate, observe, learn from incidents.'], ['Security', 'Least privilege, encryption, traceability.'], ['Reliability', 'Recover from failure, scale, test recovery.'], ['Performance efficiency', 'Right resources, measure, evolve.'], ['Cost optimisation', 'Pay only for what delivers value.'], ['Sustainability', 'Minimise resources and energy used.']] }),
      C('Cost optimisation (FinOps)', `- **See it**: tags, Cost Explorer, budgets per project.
- **Right-size**: most instances are oversized; Compute Optimizer suggests smaller ones.
- **Commit**: Savings Plans for steady usage; Spot for batch.
- **Turn off**: schedule dev environments off at night; delete idle resources.
- **Architect**: S3 lifecycle, Graviton, serverless for spiky loads, VPC endpoints instead of NAT for S3.`,
        pick('Dev environment runs 24×7 but is used 9am–7pm on weekdays. Quick saving?', ['Bigger instances', false], ['Schedule it off outside working hours (~70% saving)', true, '50 of 168 hours used — stop it the rest of the time.'], ['Move to another region', false])),
      C('Backup & disaster recovery', `Backups only count if you have **restored** them. Use AWS Backup policies for EBS/RDS/DynamoDB/EFS, copy critical backups to another region/account, and run a timed restore drill regularly.`),
    ],
    quiz: [
      Q('Which signals are the four golden signals?', ['CPU, RAM, disk, network', 'Latency, traffic, errors, saturation', 'Users, revenue, cost, churn', 'Logs, metrics, traces, alerts'], 1, 'From Google SRE.'),
      Q('Steady 24×7 workload. Cheapest pricing?', ['On-demand', 'Savings Plan / reserved', 'Spot', 'Dedicated host'], 1, 'Commitments for steady usage.'),
      Q('A backup is trustworthy when…', ['It exists', 'You have successfully restored from it', 'It is encrypted', 'It is large'], 1, 'Test restores.'),
    ],
    practice: 'Create a CloudWatch dashboard and alarm for your ALB (5xx errors, p95 latency) that emails you; add cost allocation tags and a budget per project.',
    explain: 'Explain the Well-Architected pillars as a checklist for building a house.',
  },

  'cld-sec': {
    intro: 'Defence in depth: detect threats, protect the edge, keep secrets secret, and record everything.',
    concepts: [
      C('GuardDuty & Security Hub', `- **GuardDuty** — threat detection from CloudTrail, VPC flow and DNS logs: crypto-mining, leaked credentials used from odd places, port scans.
- **Security Hub** — one dashboard of findings and checks against standards (CIS, AWS best practices).`),
      C('WAF & Shield', `**WAF** filters HTTP requests at CloudFront/ALB/API Gateway: managed rule sets (SQL injection, bad bots), rate limits per IP, geo rules. **Shield Standard** protects against common DDoS automatically; Shield Advanced adds support and cost protection.`),
      C('Secrets Manager & Parameter Store', `Store DB passwords and API keys centrally, encrypted with KMS, fetched at runtime by IAM role — never in code or env files committed to git. Secrets Manager adds automatic rotation; Parameter Store is cheaper for config.`,
        { code: `import boto3, json
secret = json.loads(boto3.client("secretsmanager").get_secret_value(SecretId="prod/db")["SecretString"])`, lang: 'python' }),
      C('Network security patterns', `- Nothing in private subnets is directly reachable from the internet.
- Only the load balancer is public; databases accept traffic only from app security groups.
- No SSH open to 0.0.0.0/0 — use SSM Session Manager.
- VPC endpoints for AWS services; flow logs on.`),
      C('Logging with CloudTrail', `**CloudTrail** records every API call: who, what, when, from where. Enable an organisation-wide trail to a locked-down log bucket in a separate account, with log file validation — it is your security camera footage.`),
      C('Compliance basics', `Compliance frameworks (ISO 27001, SOC 2, PCI DSS for cards, HIPAA, India's DPDP Act) define controls. AWS provides compliance reports in **Artifact**; you still prove your own controls. **AWS Config** continuously checks rules like "all buckets encrypted" and records configuration history.`,
        { cards: [['GuardDuty', 'Detects threats'], ['Security Hub', 'Aggregates findings'], ['WAF', 'Filters web requests'], ['CloudTrail', 'Who did what'], ['Config', 'Are resources compliant?'], ['Secrets Manager', 'Stores and rotates secrets']] }),
    ],
    quiz: [
      Q('Who called DeleteBucket yesterday? Look in…', ['CloudWatch metrics', 'CloudTrail', 'GuardDuty', 'Route 53'], 1, 'API activity log.'),
      Q('Block SQL-injection attempts at the edge with…', ['Shield', 'WAF', 'NACL', 'KMS'], 1, 'Layer-7 request filtering.'),
      Q('Where should the prod DB password live?', ['In the repo', 'Secrets Manager, fetched via IAM role', 'Slack', 'The Dockerfile'], 1, 'Encrypted, access-controlled, rotatable.'),
    ],
    practice: 'Enable GuardDuty, Security Hub and an org CloudTrail in your sandbox; move your app’s DB password into Secrets Manager.',
    explain: 'Explain defence in depth with layers of security at an airport.',
  },

  'cld-ha': {
    intro: 'Designing for failure: decide how much downtime and data loss the business can accept, then build and test exactly that.',
    concepts: [
      C('Multi-AZ vs multi-region', `- **Multi-AZ** — survives a data-centre failure. Standard for production; modest cost.
- **Multi-region** — survives a whole region failing, or serves global users. Much more complex and expensive: data replication, failover, consistency.`,
        { arch: [['Route 53 (failover / latency routing)', ['DNS']], ['Region A (primary)', ['AZ a', 'AZ b']], ['Region B (standby or active)', ['AZ a', 'AZ b']]] }),
      C('RTO & RPO', `- **RTO** (recovery time objective) — how long can we be down?
- **RPO** (recovery point objective) — how much data can we lose?`,
        { table: { cols: ['Strategy', 'RTO', 'RPO', 'Cost'], rows: [['Backup & restore', 'Hours', 'Hours', '$'], ['Pilot light', '10s of minutes', 'Minutes', '$$'], ['Warm standby', 'Minutes', 'Seconds–minutes', '$$$'], ['Multi-site active/active', 'Near zero', 'Near zero', '$$$$']] } },
        pick('A college results portal can be down 4 hours and lose at most 1 hour of data. Strategy?', ['Active/active in two regions', false], ['Backup & restore with hourly backups (or pilot light)', true, 'Matches RTO 4h / RPO 1h at the lowest cost.'], ['No backups', false])),
      C('Backup strategies (AWS Backup)', `Central backup plans by tag (e.g. backup=daily), retention rules, cross-region and cross-account copies, and **vault lock** so even an admin (or attacker) cannot delete backups early. Follow 3-2-1: 3 copies, 2 media/locations, 1 offsite/immutable.`),
      C('Route 53 failover', `Health checks watch the primary endpoint; a **failover routing policy** answers DNS with the secondary when the primary is unhealthy. Keep TTLs low (e.g. 60 s) so clients switch quickly.`,
        { steps: [['Health check fails', 'Primary ALB returns errors for 3 checks.'], ['Route 53 flips', 'DNS now answers with the secondary endpoint.'], ['Clients follow', 'After TTL expires, traffic goes to region B.'], ['Data', 'Secondary DB is promoted (replica → primary).'], ['Fail back', 'Planned, tested, after the incident.']] }),
      C('Chaos testing (intro)', `Deliberately break things in a controlled way to prove resilience: kill instances, add latency, fail an AZ. **AWS Fault Injection Service** runs these experiments with stop conditions. Start in staging, with a hypothesis and a rollback plan.`),
    ],
    quiz: [
      Q('RPO measures…', ['Downtime', 'Acceptable data loss', 'Cost', 'Latency'], 1, 'Recovery point = how far back.'),
      Q('Cheapest DR strategy?', ['Active/active', 'Backup & restore', 'Warm standby', 'Pilot light'], 1, 'Longest RTO/RPO, lowest cost.'),
      Q('For quick DNS failover, record TTLs should be…', ['24 hours', 'Low (e.g. 60 s)', 'Zero always', 'Irrelevant'], 1, 'Clients re-resolve sooner.'),
    ],
    practice: 'Do build cl-7: write RTO/RPO for your app, delete the DB in a sandbox, restore from backup, and time it.',
    explain: 'Explain RTO vs RPO with losing your phone: how long until you have a phone again, and how many photos were lost.',
  },

  'cld-multi': {
    intro: 'Most of what you learned on AWS exists on Azure and GCP under different names. Learn the map once.',
    concepts: [
      C('Azure: ADLS, Data Factory, Synapse, Fabric, Databricks', `Azure is strong in enterprises and Indian IT services. Data stack: **ADLS Gen2** (lake storage), **Data Factory** (ingest/orchestrate), **Databricks** (Spark/Delta), **Fabric** (unified analytics + Power BI, replacing Synapse for new work), **Entra ID** (identity).`),
      C('GCP: BigQuery, Dataflow, Pub/Sub, Composer', `GCP is strongest in data and AI: **BigQuery** (serverless warehouse), **Dataflow** (managed Apache Beam, batch + streaming), **Pub/Sub** (messaging), **Composer** (managed Airflow), **Cloud Storage**, **Vertex AI**.`),
      C('Service mapping table', `The same building blocks everywhere:`,
        { table: { cols: ['Need', 'AWS', 'Azure', 'GCP'], rows: [
          ['VMs', 'EC2', 'Virtual Machines', 'Compute Engine'],
          ['Object storage', 'S3', 'Blob / ADLS Gen2', 'Cloud Storage'],
          ['Functions', 'Lambda', 'Functions', 'Cloud Run functions'],
          ['Containers (managed)', 'ECS/Fargate, App Runner', 'Container Apps', 'Cloud Run'],
          ['Kubernetes', 'EKS', 'AKS', 'GKE'],
          ['Relational DB', 'RDS/Aurora', 'Azure SQL / PostgreSQL', 'Cloud SQL / AlloyDB'],
          ['NoSQL', 'DynamoDB', 'Cosmos DB', 'Firestore / Bigtable'],
          ['Warehouse', 'Redshift', 'Fabric / Synapse', 'BigQuery'],
          ['Streaming', 'Kinesis / MSK', 'Event Hubs', 'Pub/Sub'],
          ['Orchestration', 'MWAA / Step Functions', 'Data Factory', 'Composer / Workflows'],
          ['Identity', 'IAM', 'Entra ID + RBAC', 'Cloud IAM'],
          ['IaC native', 'CloudFormation/CDK', 'Bicep/ARM', 'Infrastructure Manager'] ] } },
        { cards: [['Cloud Run', 'GCP: run a container, scales to zero.'], ['Cosmos DB', 'Azure: global multi-model NoSQL.'], ['Event Hubs', 'Azure: Kafka-compatible streaming.'], ['Dataflow', 'GCP: Apache Beam, batch + streaming.']] }),
    ],
    quiz: [
      Q('Azure equivalent of S3 for a data lake?', ['Cosmos DB', 'ADLS Gen2', 'Event Hubs', 'AKS'], 1, 'Blob storage with hierarchical namespace.'),
      Q('GCP’s managed Airflow is…', ['Dataflow', 'Composer', 'Pub/Sub', 'Dataproc'], 1, 'Cloud Composer.'),
      Q('Kafka-compatible streaming on Azure?', ['Event Hubs', 'Service Bus only', 'Blob', 'Functions'], 0, 'Event Hubs exposes a Kafka endpoint.'),
    ],
    practice: 'Take your cl-3 architecture and redraw it with Azure and GCP service names on your board.',
    explain: 'Explain why learning one cloud deeply transfers to the others.',
  },

  'cld-cert': {
    intro: 'Certifications open doors in Indian hiring, especially at service companies. Here is the order and how to prepare without wasting money.',
    concepts: [
      C('AWS Certified Cloud Practitioner', `Entry level: cloud concepts, core services, security, billing. Good first exam for anyone (including non-engineers). Prepare with AWS Skill Builder's free courses and the official practice questions; 2–3 weeks part-time.`),
      C('AWS Solutions Architect – Associate', `The most valued associate cert: designing secure, resilient, high-performing, cost-optimised architectures — VPC, compute, storage, databases, decoupling. Prepare by **building** the cl-1 to cl-5 projects, then practice exams until you consistently score above the pass mark.`,
        { steps: [['Build first', 'cl-1 to cl-5 cover most of the exam.'], ['Fill gaps', 'Course videos for services you have not touched.'], ['Practice exams', 'Timed; review every wrong answer.'], ['Book', 'When you score comfortably above passing twice.']] }),
      C('AWS Data Engineer – Associate (for data roles)', `Covers ingestion (Kinesis, DMS, Glue), storage and lakes (S3, Lake Formation, Redshift), transformation (Glue, EMR), orchestration, security and governance. Best fit if you are aiming for data engineering roles on AWS.`),
      C('Optional: Azure AZ-900 / DP-900', `**AZ-900** (Azure fundamentals) and **DP-900** (data fundamentals) are cheap, quick foundations — useful because many Indian employers run Azure. Microsoft sometimes offers free vouchers through events and Learn challenges.`,
        { note: 'Certifications get you shortlisted; projects and explanations get you hired. Do both, projects first.' }),
    ],
    quiz: [
      Q('Best preparation for Solutions Architect – Associate?', ['Only videos', 'Build real projects, then timed practice exams', 'Memorise dumps', 'Skip practice'], 1, 'Hands-on plus exam practice.'),
      Q('Cert most aligned with AWS data engineering roles?', ['Cloud Practitioner', 'Data Engineer – Associate', 'Security Specialty', 'Developer – Associate'], 1, 'It targets data pipelines on AWS.'),
    ],
    practice: 'Book a target date for Cloud Practitioner 6 weeks from now and add a weekly practice-exam block to your planner.',
    explain: 'Explain to a junior why certifications alone don’t get jobs, and what does.',
  },
}
