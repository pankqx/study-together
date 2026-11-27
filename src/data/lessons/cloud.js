// Cloud computing — lessons 1–8 (AWS-first; Azure/GCP mapped in the last lessons)
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })   // options: [text, correct, why]

export default {
  'cld-concepts': {
    intro: 'What "the cloud" actually is, how it is organised around the world, who is responsible for what — and how students get surprise bills.',
    concepts: [
      C('IaaS, PaaS, SaaS', `The cloud is renting someone else's computers, by the second, through an API. The question is **how much they manage for you**.

- **IaaS** (infrastructure) — you rent virtual machines, disks, networks. You manage the OS and everything above. *EC2.*
- **PaaS** (platform) — you give code; they run it, patch it and scale it. *Elastic Beanstalk, App Runner, Lambda, RDS.*
- **SaaS** (software) — a finished product you just use. *Gmail, Canva, Salesforce.*`,
        { arch: [['SaaS — you just use it', ['Gmail', 'Canva', 'Notion']], ['PaaS — you bring code', ['Lambda', 'App Runner', 'RDS']], ['IaaS — you manage the OS', ['EC2 VM', 'EBS disk', 'VPC network']], ['The provider’s data centres', ['Servers', 'Power', 'Cooling', 'Security guards']]] },
        { note: 'Pizza analogy: IaaS = buy ingredients and bake at home; PaaS = takeaway; SaaS = dine in. Less control, less work as you go up.' },
        pick('You want to run a Python API without patching servers or managing scaling. Which model?', ['IaaS (EC2)', false], ['PaaS / serverless (Lambda, App Runner)', true, 'PaaS runs your code and handles servers, patching and scaling.'], ['SaaS', false])),
      C('Regions & availability zones', `AWS has **regions** around the world (Mumbai = ap-south-1, Hyderabad = ap-south-2). Each region has several **availability zones (AZs)** — separate data centres with their own power and network, a few kilometres apart, linked by fast fibre.

- Spread your app across **2+ AZs** to survive one data centre failing.
- Pick the region close to your users (latency) and allowed by law (data residency).
- Prices and available services differ by region.`,
        { arch: [['Region: ap-south-1 (Mumbai)', ['AZ a', 'AZ b', 'AZ c']], ['Inside each AZ', ['One or more data centres', 'Own power + network']]] },
        { cards: [['Region', 'A geographic area (Mumbai) containing multiple AZs.'], ['Availability zone', 'One or more isolated data centres inside a region.'], ['Edge location', 'A CDN point of presence (CloudFront) close to users — many more of these than regions.']] }),
      C('Shared responsibility', `Security is split. **AWS secures the cloud** (buildings, hardware, the hypervisor). **You secure what you put in the cloud** (your data, IAM, OS patches on EC2, security groups, encryption choices).

The higher you go (IaaS → PaaS → SaaS), the more the provider handles.`,
        { table: { cols: ['Responsibility', 'EC2 (IaaS)', 'Lambda / RDS (managed)'], rows: [
          ['Physical security, hardware', 'AWS', 'AWS'],
          ['OS patching', 'You', 'AWS'],
          ['Network rules (security groups)', 'You', 'You'],
          ['IAM permissions', 'You', 'You'],
          ['Your data & encryption choices', 'You', 'You'] ] } },
        { note: 'Almost every real cloud breach is on the customer side: a public S3 bucket, leaked keys, over-broad IAM. Not AWS being hacked.' }),
      C('Pricing models & free tier traps', `- **On-demand** — pay per second/hour, no commitment. Most expensive per hour, most flexible.
- **Savings Plans / Reserved** — commit for 1–3 years, save up to ~70%.
- **Spot** — spare capacity at big discounts, can be taken back with 2 minutes' notice. Great for batch jobs.

Free tier traps that bill students:`,
        { cards: [['NAT Gateway', 'Charged per hour + per GB, not free tier. Delete it after labs.'], ['Elastic IP not attached', 'An unused public IP is billed hourly.'], ['RDS left running', 'Free tier covers one small instance; extra instances or Multi-AZ cost money.'], ['Data transfer out', 'Downloading data to the internet is charged per GB.'], ['Forgotten region', 'Resources in another region keep running — check every region.']] },
        { steps: [['Turn on MFA for root', 'Before anything else.'], ['Create a budget alarm', 'AWS Budgets → monthly budget of $1–5 with email alerts at 50%, 80%, 100%.'], ['Use a separate admin user/role', 'Never work as root.'], ['Tag everything', 'e.g. project=study-together so you can find and delete it.'], ['Clean up after every lab', 'Delete stacks, NAT gateways, EIPs, load balancers, databases.']] }),
    ],
    quiz: [
      Q('Who patches the OS on an EC2 instance?', ['AWS', 'You', 'Nobody', 'The region'], 1, 'On IaaS the OS is your responsibility.'),
      Q('To survive a single data-centre failure, deploy across…', ['Two regions only', 'Two or more availability zones', 'One bigger instance', 'Edge locations'], 1, 'AZs are isolated data centres.'),
      Q('Cheapest option for a fault-tolerant nightly batch job?', ['On-demand', 'Spot instances', 'Dedicated hosts', 'Reserved for 3 years'], 1, 'Spot is deeply discounted and batch jobs can retry.'),
      Q('Common surprise bill in free-tier labs?', ['IAM users', 'NAT Gateway left running', 'Security groups', 'CloudWatch dashboards'], 1, 'NAT gateways are billed hourly and per GB.'),
    ],
    practice: 'Create your AWS account, enable root MFA, create a $2 budget alarm, and an IAM admin user. Screenshot the budget.',
    explain: 'Explain IaaS/PaaS/SaaS and shared responsibility using renting a flat vs a PG vs a hotel.',
  },

  'cld-prereq': {
    intro: 'The cloud is mostly Linux servers on networks. These basics make every later lesson make sense.',
    concepts: [
      C('Linux command line & SSH', `You will manage servers through a terminal. **SSH** opens a secure shell on a remote machine using a key pair: the private key stays on your laptop, the public key sits on the server.`,
        { code: `ssh -i mykey.pem ubuntu@13.233.10.20     # connect
pwd; ls -la; cd /var/log; less syslog       # look around
sudo apt update && sudo apt install -y nginx
systemctl status nginx                       # is the service running?
journalctl -u nginx --since "10 min ago"     # its logs`, lang: 'bash' },
        { note: 'On Windows, use the built-in OpenSSH in PowerShell or WSL (Ubuntu inside Windows). `chmod 400 mykey.pem` or SSH refuses the key.' }),
      C('Files, permissions, processes', `Every file has an owner, a group and permissions for **r**ead, **w**rite, e**x**ecute.`,
        { code: `ls -l app.sh        # -rwxr-x--- 1 ubuntu devs ...
chmod 750 app.sh    # owner rwx, group r-x, others none
chown ubuntu:devs app.sh
ps aux | grep python    # running processes
top                     # live CPU/memory
kill -15 4321           # ask a process to stop gracefully
df -h; du -sh *         # disk usage`, lang: 'bash' },
        { cards: [['7', 'rwx — read, write, execute'], ['5', 'r-x — read and execute'], ['4', 'r-- — read only'], ['chmod 644', 'Owner reads/writes, everyone else reads. Normal for files.']] }),
      C('IP addresses, subnets & CIDR', `An IPv4 address is 4 numbers (10.0.1.25). **CIDR** notation says how big a network is: the number after the slash is how many bits are fixed.

- 10.0.0.0/16 → 65,536 addresses (a whole VPC)
- 10.0.1.0/24 → 256 addresses (a subnet)
- Private ranges: 10.x, 172.16–31.x, 192.168.x — not reachable from the internet.`,
        { table: { cols: ['CIDR', 'Addresses', 'Typical use'], rows: [['/16', '65,536', 'VPC'], ['/20', '4,096', 'Large subnet'], ['/24', '256', 'Subnet'], ['/32', '1', 'A single IP in a rule']] } },
        pick('A security group rule allows 203.0.113.7/32. What does it allow?', ['A whole office network', false], ['Exactly one IP address', true, '/32 fixes all 32 bits — one address.'], ['The entire internet', false])),
      C('DNS, ports & protocols', `**DNS** turns names into IPs (study.example.com → 13.233.10.20). **Ports** identify which program on a machine to talk to.`,
        { table: { cols: ['Port', 'Protocol', 'Used for'], rows: [['22', 'SSH', 'Remote shell'], ['80', 'HTTP', 'Web (unencrypted)'], ['443', 'HTTPS', 'Web (TLS)'], ['5432', 'PostgreSQL', 'Database'], ['53', 'DNS', 'Name lookups']] } },
        { steps: [['You type study.example.com', 'Browser checks its cache.'], ['Resolver asks DNS', 'Your ISP or 1.1.1.1 resolver looks it up.'], ['Root → .com → example.com', 'Each level points to the next nameserver (Route 53 for your domain).'], ['IP returned', '13.233.10.20 comes back, cached for the TTL.'], ['TCP + TLS to port 443', 'Browser connects securely and sends the HTTP request.']] }),
      C('HTTP & load balancing basics', `HTTP is request/response: a **method** (GET, POST), a **path**, **headers**, an optional **body**; the server replies with a **status code** (200 OK, 301 redirect, 404 not found, 500 server error, 503 unavailable).

A **load balancer** spreads requests across several servers, checks their health, and stops sending traffic to broken ones.`,
        { arch: [['Users', ['Browser', 'Mobile app']], ['Load balancer (health checks)', ['ALB']], ['Servers', ['App 1 ✓', 'App 2 ✓', 'App 3 ✗ removed']]] }),
    ],
    quiz: [
      Q('How many addresses in a /24?', ['24', '256', '65,536', '1'], 1, '2^(32−24) = 256.'),
      Q('HTTPS uses port…', ['22', '80', '443', '5432'], 2, 'TLS web traffic.'),
      Q('chmod 600 secret.txt means…', ['Everyone reads', 'Only owner reads/writes', 'Executable', 'Group writes'], 1, '6 = rw for owner; 0 for group and others.'),
      Q('A load balancer stops sending traffic to a server when…', ['It is new', 'Its health check fails', 'It has an IP', 'It is in another AZ'], 1, 'Health checks remove broken targets.'),
    ],
    practice: 'Launch a free-tier Ubuntu EC2, SSH in, install Nginx, check it with curl localhost, and read its logs with journalctl.',
    explain: 'Explain DNS as a phone contacts list, and ports as flat numbers in an apartment building.',
  },

  'cld-iam': {
    intro: 'IAM decides who can do what in your account. Get it right and most security problems disappear.',
    concepts: [
      C('IAM users, groups, roles, policies', `- **User** — a person or app with long-term credentials.
- **Group** — a set of users sharing permissions (Admins, Developers).
- **Role** — an identity that is **assumed** temporarily (by an EC2 instance, a Lambda, a user from another account, GitHub Actions).
- **Policy** — a JSON document listing allowed or denied actions on resources.`,
        { code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::study-together-uploads/*"
  }]
}`, lang: 'json' },
        { cards: [['User', 'Long-term identity: a person.'], ['Group', 'Bundle of users with shared policies.'], ['Role', 'Temporary identity assumed by a service or person.'], ['Policy', 'JSON: Effect + Action + Resource (+ Condition).']] }),
      C('Least privilege & policy evaluation', `Give only the permissions needed for the task, on only the resources needed.

How AWS decides:`,
        { steps: [['Default: deny', 'Everything starts denied.'], ['Any explicit Deny?', 'If any policy says Deny for this action → denied. Deny always wins.'], ['Any Allow?', 'If an identity or resource policy allows it → allowed.'], ['Guardrails', 'Organisation SCPs and permission boundaries can still cap it.'], ['Otherwise', 'Implicitly denied.']] },
        pick('One policy allows s3:* and another explicitly denies s3:DeleteObject. Can the user delete objects?', ['Yes, allow wins', false], ['No — explicit deny always wins', true, 'An explicit Deny overrides any Allow.'], ['Only on weekdays', false])),
      C('MFA & root account hygiene', `The **root** user can do anything, including closing the account. Protect it:

- Strong password + **MFA** (authenticator app).
- No access keys for root, ever.
- Use root only for the few tasks that need it (billing settings, closing the account).
- Day-to-day work through an admin role or IAM Identity Center.`),
      C('Access keys vs roles (STS)', `**Access keys** are long-lived passwords for the API — if leaked (e.g. pushed to GitHub), attackers can use them until you notice. **Roles** give **temporary credentials** via STS that expire in minutes to hours.`,
        { table: { cols: ['', 'Access keys', 'Roles (STS)'], rows: [['Lifetime', 'Until rotated', 'Minutes–hours'], ['Leak impact', 'High', 'Low, expires'], ['Use for', 'Rare legacy cases', 'EC2, Lambda, CI/CD, cross-account']] } },
        { note: 'Bots scan GitHub for AWS keys within minutes of a push. Use roles everywhere you can.' }),
      C('KMS & encryption at rest', `**KMS** manages encryption keys. Services like S3, EBS and RDS encrypt data at rest with a KMS key; access to the data then also requires permission to use the key — a second lock. Every key use is logged in CloudTrail.

Encryption **in transit** = TLS (HTTPS). **At rest** = KMS-encrypted disks and buckets. Turn both on.`),
      C('AWS Organizations (intro)', `Companies use many accounts (dev, staging, prod, security, logs) grouped in **AWS Organizations**, with consolidated billing and **Service Control Policies (SCPs)** — guardrails like "nobody may disable CloudTrail" or "only use Mumbai and Hyderabad regions".`,
        { arch: [['Management account', ['Billing', 'SCPs']], ['Organizational units', ['Security OU', 'Workloads OU']], ['Accounts', ['logs', 'dev', 'staging', 'prod']]] }),
    ],
    quiz: [
      Q('An EC2 app needs to read S3. Best practice?', ['Put access keys in the code', 'Attach an IAM role to the instance', 'Use root keys', 'Make the bucket public'], 1, 'Roles give temporary, rotating credentials.'),
      Q('Explicit Deny vs Allow on the same action?', ['Allow wins', 'Deny wins', 'Newest wins', 'Random'], 1, 'Explicit deny always overrides.'),
      Q('What should the root user have?', ['Access keys', 'MFA and no access keys', 'Admin group', 'Nothing'], 1, 'Protect it and rarely use it.'),
      Q('SCPs are used to…', ['Encrypt data', 'Set guardrails across accounts in an organisation', 'Create users', 'Monitor cost'], 1, 'They cap what accounts can do.'),
    ],
    practice: 'Do build cl-2: create groups, a least-privilege S3 policy by hand, an EC2 role, enable CloudTrail, and run IAM Access Analyzer.',
    explain: 'Explain users vs roles with a hostel: residents have keys; guests get a visitor pass that expires.',
  },

  'cld-compute': {
    intro: 'Where your code actually runs — virtual machines, scaling groups, load balancers and serverless functions — and how to choose.',
    concepts: [
      C('EC2: instance types, AMIs, key pairs', `An **EC2 instance** is a virtual machine. You choose:

- **Instance type** — family + size: t3.micro (burstable, cheap), m7 (general), c7 (compute), r7 (memory), g (GPU). Graviton ("g" suffix, e.g. t4g) is ARM — often ~20% cheaper.
- **AMI** — the disk image: Ubuntu, Amazon Linux, or your own pre-baked image.
- **Key pair** — for SSH (or skip SSH and use Session Manager).
- **User data** — a script that runs on first boot.`,
        { code: `#!/bin/bash
# user data: runs once at first boot
apt-get update -y && apt-get install -y nginx
echo "<h1>Hello from $(hostname)</h1>" > /var/www/html/index.html`, lang: 'bash' }),
      C('EBS volumes & snapshots', `**EBS** is a network disk attached to one instance in one AZ. It survives instance stop/start. **Snapshots** are point-in-time backups stored in S3, usable to create new volumes in any AZ — or copied to another region.

Types: gp3 (general SSD — default), io2 (high IOPS databases), st1 (throughput HDD).`,
        { note: 'Instance store (temporary local disk) is wiped when the instance stops. Never keep data you need on it.' }),
      C('Auto Scaling groups', `An **Auto Scaling group (ASG)** keeps a desired number of instances running across AZs, replaces unhealthy ones, and scales out/in based on metrics.`,
        { steps: [['Launch template', 'Defines AMI, type, security group, user data.'], ['Min / desired / max', 'e.g. 2 / 2 / 6 instances across 2 AZs.'], ['Health checks', 'Unhealthy instances are terminated and replaced.'], ['Scaling policy', 'Target tracking: keep average CPU at 50%.'], ['Load test', 'CPU rises → ASG adds instances → load drops → it removes them.']] }),
      C('Elastic Load Balancing', `- **ALB** (Application, layer 7) — HTTP/HTTPS, routes by path or host (/api → API servers), WebSockets. Most web apps.
- **NLB** (Network, layer 4) — TCP/UDP, extreme performance, static IPs.
- **GWLB** — for network security appliances.`,
        { arch: [['Internet', ['Users']], ['ALB in public subnets (2 AZs)', ['Listener :443 + TLS cert']], ['Target groups', ['/api → API ASG', '/ → Web ASG']]] }),
      C('Lambda: triggers, limits, cold starts', `**Lambda** runs a function when an event happens; you pay per request and per millisecond of compute.

- **Triggers**: API Gateway, S3 uploads, SQS messages, EventBridge schedules, DynamoDB streams.
- **Limits**: max 15 minutes per run, memory 128 MB–10 GB (CPU scales with memory), payload size limits.
- **Cold start**: first request on a new execution environment has extra latency (~100 ms–1 s+). Mitigate with smaller packages, provisioned concurrency, or SnapStart for Java.`,
        { code: `def handler(event, context):
    name = (event.get("queryStringParameters") or {}).get("name", "crew")
    return {"statusCode": 200, "body": f"Hello, {name}!"}`, lang: 'python' }),
      C('Choosing compute: EC2 vs containers vs serverless', `Choose by how much control you need and the traffic shape.`,
        { table: { cols: ['', 'EC2', 'Containers (ECS/Fargate)', 'Lambda'], rows: [
          ['You manage', 'OS + runtime', 'Container image', 'Function code'],
          ['Good for', 'Legacy apps, special software, steady load', 'Web services, microservices', 'Event-driven, spiky or low traffic'],
          ['Scales to zero', 'No', 'No (Fargate tasks keep running)', 'Yes'],
          ['Max run time', 'Unlimited', 'Unlimited', '15 min'] ] } },
        pick('An image-resize job runs when a file is uploaded, a few hundred times a day. Best fit?', ['A big EC2 always on', false], ['Lambda triggered by S3', true, 'Event-driven, spiky, short jobs are Lambda’s sweet spot; it costs nothing when idle.'], ['EKS cluster', false])),
    ],
    quiz: [
      Q('Data on an EBS volume after stopping and starting the instance?', ['Lost', 'Still there', 'Moved to S3', 'Encrypted'], 1, 'EBS persists; instance store does not.'),
      Q('Route /api and / to different servers by path. Use…', ['NLB', 'ALB', 'Route 53 only', 'NAT gateway'], 1, 'ALB does layer-7 path routing.'),
      Q('A 40-minute video transcode job on Lambda will…', ['Work', 'Fail — 15-minute max', 'Be free', 'Auto-split'], 1, 'Use containers/Batch for long jobs.'),
      Q('An ASG mainly gives you…', ['Cheaper storage', 'Self-healing and automatic scaling', 'DNS', 'Encryption'], 1, 'Replaces unhealthy instances and scales.'),
    ],
    practice: 'Launch template with user data → ASG (2 AZs, min 2) → ALB. Hit the ALB URL, terminate one instance and watch it heal.',
    explain: 'Explain EC2 vs Lambda with an auto-rickshaw you own vs booking a ride per trip.',
  },

  'cld-storage': {
    intro: 'Storage is the foundation of every cloud system — especially data engineering, where S3 is your data lake.',
    concepts: [
      C('S3 buckets, classes, lifecycle', `**S3** stores objects (files) in **buckets**, effectively unlimited, with 11 nines of durability. Objects are addressed by key: \`s3://bucket/raw/orders/2026-11-26/part-0.parquet\`.

- **Block Public Access** on by default — keep it on.
- **Versioning** keeps old versions (undo deletes).
- **Storage classes** trade price for access speed.
- **Lifecycle rules** move or delete objects automatically.`,
        { table: { cols: ['Class', 'Use', 'Relative cost'], rows: [['Standard', 'Hot data', '$$$'], ['Intelligent-Tiering', 'Unknown access patterns', 'auto'], ['Standard-IA', 'Monthly access', '$$'], ['Glacier Instant/Flexible', 'Archives, rare access', '$'], ['Glacier Deep Archive', 'Compliance, years', '¢']] } },
        { code: `aws s3 mb s3://pank-study-raw-2026
aws s3 cp orders.parquet s3://pank-study-raw-2026/raw/orders/2026-11-26/
aws s3 ls s3://pank-study-raw-2026/raw/ --recursive`, lang: 'bash' }),
      C('EBS & EFS', `- **EBS** — block disk for **one** instance in one AZ (like a laptop SSD).
- **EFS** — shared network file system mounted by **many** instances across AZs (like a shared drive). Pay per GB used.
- **S3** — object storage over HTTP, not a mounted disk.`,
        { cards: [['EBS', 'One server’s disk. Fast, single-AZ.'], ['EFS', 'Shared folder for many Linux servers.'], ['S3', 'Objects via API. Cheapest, unlimited, data lakes.']] }),
      C('Data lake layout on S3', `A good layout makes data findable, cheap to query and easy to reprocess:`,
        { code: `s3://company-lake/
  bronze/source=shop/table=orders/ingest_date=2026-11-26/part-0000.parquet
  silver/orders/order_date=2026-11-26/part-0000.parquet
  gold/daily_revenue/month=2026-11/part-0000.parquet`, lang: 'text' },
        { steps: [['Separate buckets or prefixes per layer', 'bronze, silver, gold with different permissions.'], ['Partition by date', 'Queries filter to a few folders (Athena scans less, costs less).'], ['Columnar formats', 'Parquet/Iceberg in silver and gold.'], ['Lifecycle', 'Move old bronze to Glacier after 90 days.'], ['Catalog it', 'Glue Data Catalog so Athena/Spark know the schemas.']] }),
    ],
    quiz: [
      Q('Several EC2 instances must share one file system. Use…', ['EBS', 'EFS', 'Instance store', 'Glacier'], 1, 'EFS is a shared NFS file system.'),
      Q('Logs accessed rarely after 90 days but kept 7 years. Best approach?', ['Keep in Standard', 'Lifecycle rule to Glacier tiers', 'Delete', 'EBS snapshots'], 1, 'Lifecycle moves them to cheap archive classes.'),
      Q('Why partition the lake by date?', ['Prettier', 'Queries scan less data', 'Required by S3', 'Encryption'], 1, 'Partition pruning cuts cost and time.'),
    ],
    practice: 'Create a bucket with versioning, upload files into a bronze/silver/gold layout, add a lifecycle rule, then delete and restore a file via versions.',
    explain: 'Explain EBS vs EFS vs S3 with a personal locker, a shared staff room shelf, and a giant warehouse with numbered tags.',
  },

  'cld-net': {
    intro: 'Your private network in the cloud. Most "it won’t connect" problems are here — learn to read it like a map.',
    concepts: [
      C('VPC, subnets, route tables', `A **VPC** is your private network (e.g. 10.0.0.0/16) in a region. You split it into **subnets**, each in one AZ. A **route table** attached to each subnet decides where traffic goes.

A subnet is **public** only because its route table sends 0.0.0.0/0 to an Internet Gateway.`,
        { arch: [['Internet', ['Internet Gateway']], ['Public subnets (AZ a, AZ b) — route 0.0.0.0/0 → IGW', ['ALB', 'NAT Gateway']], ['Private app subnets — route 0.0.0.0/0 → NAT', ['App server a', 'App server b']], ['Private data subnets — no internet route', ['RDS primary', 'RDS standby']]] }),
      C('Security groups vs NACLs', `- **Security group** — a stateful firewall on each instance/ENI. Only **allow** rules. Return traffic is automatically allowed. Can reference other security groups ("allow 5432 from the app-sg").
- **NACL** — a stateless firewall on the subnet. Allow and **deny** rules, evaluated in order; you must allow return traffic (ephemeral ports) explicitly.`,
        { table: { cols: ['', 'Security group', 'NACL'], rows: [['Level', 'Instance', 'Subnet'], ['Stateful', 'Yes', 'No'], ['Deny rules', 'No', 'Yes'], ['Typical use', 'Main control', 'Extra coarse block (e.g. deny an IP range)']] } },
        pick('The database should accept connections only from the app servers. Best rule?', ['Allow 5432 from 0.0.0.0/0', false], ['Allow 5432 from the app servers’ security group', true, 'Referencing the SG follows instances as they scale, with no IPs to maintain.'], ['A NACL deny for everything', false])),
      C('NAT & internet gateways', `- **Internet Gateway** — two-way internet access for public subnets.
- **NAT Gateway** — lets private instances reach **out** (updates, APIs) while blocking inbound connections. Lives in a public subnet. Billed per hour + per GB — the classic student bill.
- **VPC endpoints** — private access to S3/DynamoDB and other AWS services without NAT (gateway endpoints for S3/DynamoDB are free).`),
      C('Route 53 & CloudFront', `- **Route 53** — DNS: domains, records (A, CNAME, alias), health checks, routing policies (latency, weighted, failover).
- **CloudFront** — CDN: caches content at edge locations near users, terminates HTTPS, protects origins, works with WAF.`,
        { steps: [['User requests study.example.com', 'Route 53 alias record points to CloudFront.'], ['Nearest edge location', 'Chennai/Mumbai edge serves from cache if it has it.'], ['Cache miss', 'Edge fetches from origin (S3 or ALB) and caches it.'], ['Response', 'Fast, HTTPS, origin protected from direct traffic.']] }),
    ],
    quiz: [
      Q('What makes a subnet public?', ['Its name', 'A route 0.0.0.0/0 to an Internet Gateway', 'A public IP on the VPC', 'A NACL'], 1, 'The route table defines it.'),
      Q('Private instances need to download OS updates. Use…', ['Internet Gateway on their subnet', 'NAT Gateway', 'Route 53', 'EFS'], 1, 'Outbound-only internet.'),
      Q('Which is stateless?', ['Security group', 'NACL', 'Both', 'Neither'], 1, 'NACLs need explicit return rules.'),
      Q('Access S3 from private subnets without NAT costs?', ['Impossible', 'S3 gateway VPC endpoint', 'Public bucket', 'CloudFront'], 1, 'Gateway endpoints for S3 are free.'),
    ],
    practice: 'Build the 3-tier VPC from the diagram (2 AZs, public/app/data subnets). Use SSM Session Manager instead of SSH and an S3 gateway endpoint.',
    explain: 'Explain a VPC as a gated campus: the main gate (IGW), a courier desk for outgoing parcels only (NAT), and guarded buildings (security groups).',
  },

  'cld-db': {
    intro: 'Managed databases: the provider handles patching, backups and failover so you can focus on schema and queries.',
    concepts: [
      C('RDS / Aurora', `**RDS** runs Postgres, MySQL, MariaDB, SQL Server or Oracle for you: automated backups, point-in-time restore, patching, **Multi-AZ** standby with automatic failover, and **read replicas** for read scaling.

**Aurora** is AWS's cloud-native engine (Postgres/MySQL compatible): storage replicated 6 ways across 3 AZs, faster failover, up to 15 replicas, and a serverless option.`,
        { arch: [['App servers', ['App a', 'App b']], ['Writer endpoint', ['Primary (AZ a)']], ['Synchronous standby / replicas', ['Standby (AZ b) — failover', 'Read replica — reports']]] },
        { note: 'Multi-AZ is for availability (failover). Read replicas are for read scaling. Different problems.' }),
      C('DynamoDB', `A serverless **key-value / document** database with single-digit-millisecond latency at any scale. You design the table from your **access patterns**: a partition key (and optional sort key) decides where items live.`,
        { table: { cols: ['PK', 'SK', 'Attributes'], rows: [['USER#pank', 'PROFILE', 'name, tracks'], ['USER#pank', 'LOG#2026-11-26', 'studied, teach'], ['USER#pank', 'LOG#2026-11-27', 'studied, teach']] } },
        { note: 'Query "all logs for pank in November" = PK = USER#pank AND SK begins_with LOG#2026-11. No joins — design for the queries you need.' },
        pick('You need flexible ad-hoc joins and reports across many tables. Better choice?', ['DynamoDB', false], ['RDS/Aurora Postgres', true, 'Relational databases handle ad-hoc joins; DynamoDB is designed for known access patterns.'], ['S3 only', false])),
      C('ElastiCache', `Managed **Redis/Valkey** or Memcached: in-memory, sub-millisecond reads. Uses: caching database results, sessions, rate limiting, leaderboards (sorted sets), pub/sub.`,
        { steps: [['App needs data', 'Check the cache first.'], ['Cache hit', 'Return immediately (≈1 ms).'], ['Cache miss', 'Read from the database (≈10–50 ms).'], ['Fill cache', 'Store the result with a TTL.'], ['On update', 'Delete or update the cached key (invalidation).']] }),
    ],
    quiz: [
      Q('Multi-AZ RDS mainly provides…', ['Read scaling', 'Automatic failover for availability', 'Cheaper storage', 'Global tables'], 1, 'A synchronous standby for failover.'),
      Q('DynamoDB tables should be designed from…', ['Normalised entities', 'Access patterns', 'The UI', 'CSV files'], 1, 'Keys follow the queries.'),
      Q('The cache-aside pattern reads from the database when…', ['Always', 'On a cache miss', 'Never', 'Only at night'], 1, 'Then fills the cache.'),
    ],
    practice: 'Create a free-tier RDS Postgres in private subnets, connect from an EC2 in the app subnet, take a manual snapshot and restore it to a new instance.',
    explain: 'Explain RDS vs DynamoDB using a library catalogue (search any way) vs a locker room (find by locker number instantly).',
  },

  'cld-serverless': {
    intro: 'Build systems from managed building blocks connected by events — no servers to patch, and nothing billed when idle.',
    concepts: [
      C('API Gateway + Lambda', `**API Gateway** receives HTTP requests, handles auth, throttling and CORS, and invokes a Lambda per request. HTTP APIs are cheaper and simpler; REST APIs have more features.`,
        { arch: [['Client', ['React app']], ['API Gateway', ['Auth (Cognito/JWT)', 'Throttling', 'Routes']], ['Lambda functions', ['GET /logs', 'POST /logs']], ['Data', ['DynamoDB']]] },
        { code: `# template.yaml (AWS SAM)
Resources:
  LogsFn:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: python3.12
      Handler: app.handler
      Events:
        Api: { Type: HttpApi, Properties: { Path: /logs, Method: get } }
# sam build && sam deploy --guided`, lang: 'yaml' }),
      C('SQS, SNS, EventBridge', `Three ways to connect services without them calling each other directly:`,
        { table: { cols: ['Service', 'Pattern', 'Use when'], rows: [['SQS', 'Queue — one consumer group pulls messages', 'Buffer work, smooth spikes, retries, DLQ'], ['SNS', 'Pub/sub — push to many subscribers', 'Fan-out: email + SMS + SQS at once'], ['EventBridge', 'Event bus with content-based rules', 'Route events by type/content, schedules, SaaS events']] } },
        { steps: [['Order placed', 'Order service publishes "OrderPlaced" to EventBridge.'], ['Rules match', 'Rule 1 → SQS for the invoice worker; Rule 2 → Lambda for email.'], ['Workers process', 'Each at its own pace; failures retry.'], ['Failures', 'After N retries messages go to a dead-letter queue to inspect.']] }),
      C('Step Functions', `**Step Functions** orchestrates multi-step workflows as a visual state machine: sequence, branches, parallel steps, waits, retries with backoff, and error handling — each step calling Lambda or 200+ AWS services directly.`,
        { flow: ['Upload received', 'Validate', 'Resize ∥ Tag (parallel)', 'Save metadata', 'Notify', 'On error → DLQ + alert'] },
        { note: 'Rule of thumb: if you are writing retries and state tracking by hand across Lambdas, you wanted Step Functions.' }),
    ],
    quiz: [
      Q('A spike of 50k orders must be processed without overloading the payment service. Put between them…', ['SNS', 'SQS queue', 'Route 53', 'CloudFront'], 1, 'Queues buffer and let consumers go at their own pace.'),
      Q('One event must trigger email, SMS and an analytics queue. Use…', ['SQS alone', 'SNS fan-out or EventBridge rules', 'Step Functions only', 'DynamoDB'], 1, 'Pub/sub fan-out.'),
      Q('Multi-step workflow with retries, branches and waits?', ['Cron', 'Step Functions', 'S3 events', 'NAT'], 1, 'Managed state machines.'),
    ],
    practice: 'Do build cl-4: API Gateway + Lambda + DynamoDB with SAM, then add an SQS queue and a worker Lambda with a DLQ.',
    explain: 'Explain SQS vs SNS with a token queue at a hospital counter vs a public announcement.',
  },
}
