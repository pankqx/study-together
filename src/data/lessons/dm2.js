// Digital marketing — lessons 10–18
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'dm-email': {
    intro: 'Email (and WhatsApp) are channels you own — no algorithm between you and your audience. Often the highest-ROI channel.',
    concepts: [
      C('Building a list (lead magnets)', `A **lead magnet** is something genuinely useful in exchange for an email: a checklist, template, mini-course, discount, quiz result. It must solve one specific problem quickly.`,
        { cards: [['Checklist', '"The 20-point resume checklist recruiters use"'], ['Template', '"Free Canva templates for 30 days of posts"'], ['Mini-course', '"5-day email course: SEO basics"'], ['Discount', '"10% off your first order"'], ['Quiz', '"Which marketing career fits you?"']] }),
      C('Segmentation', `Send different emails to different people: by interest, behaviour (opened, clicked, bought), stage (new, active, inactive) or location. Relevant emails get opened; generic blasts get unsubscribed.`,
        pick('A student downloaded the "SEO checklist". What should they get next?', ['Every email you ever send', false], ['A short SEO-focused sequence, then a related offer', true, 'Their download signals their interest.'], ['Nothing', false])),
      C('Automated flows (welcome, abandoned cart)', `Flows run automatically when someone does something:`,
        { steps: [['Welcome #1 (instantly)', 'Deliver the lead magnet; set expectations.'], ['Welcome #2 (day 2)', 'Your story and why you can help.'], ['Welcome #3 (day 4)', 'Best free content / quick win.'], ['Welcome #4 (day 6)', 'Social proof: results, testimonials.'], ['Welcome #5 (day 8)', 'Offer with a clear reason to act now.']] },
        { note: 'Abandoned cart: reminder after 1 hour, help/FAQ after 24 hours, small incentive after 48 hours. Often recovers a meaningful share of lost carts.' }),
      C('Deliverability', `If emails land in spam, nothing else matters.

- Authenticate your domain: **SPF, DKIM, DMARC** (required by Gmail/Yahoo for bulk senders).
- Only email people who opted in; make unsubscribing one click.
- Clean inactive subscribers regularly.
- Avoid spammy patterns (all caps, too many links, image-only emails).
- Warm up new sending domains gradually.`),
      C('A/B testing subject lines', `Test one change at a time on a sample, send the winner to the rest. Judge by opens *and* clicks (Apple Mail privacy inflates opens).`,
        { table: { cols: ['Version', 'Subject', 'Open rate', 'Click rate'], rows: [['A', 'Your SEO checklist is inside', '41%', '6.2%'], ['B', 'The 3 SEO mistakes costing you traffic', '38%', '8.9%']] } },
        { note: 'B wins on clicks — which is what you actually want.' }),
    ],
    quiz: [
      Q('SPF, DKIM and DMARC improve…', ['Design', 'Deliverability and trust', 'Open rates by magic', 'List size'], 1, 'They authenticate your domain.'),
      Q('Best first automated flow to build?', ['Birthday email', 'Welcome sequence', 'Annual report', 'Win-back after 2 years'], 1, 'New subscribers are most engaged.'),
      Q('Subject line A has more opens, B has more clicks. Usually pick…', ['A', 'B', 'Neither', 'Both'], 1, 'Clicks reflect real interest.'),
    ],
    practice: 'Do build dm-5: lead magnet, landing page, 5-email welcome flow in Brevo or Mailchimp (free tiers), and an A/B test.',
    explain: 'Explain why an email list is "owned" while followers are "rented".',
  },

  'dm-tools': {
    intro: 'The tools that make marketing measurable and repeatable. Set tracking up before spending a rupee on ads.',
    concepts: [
      C('Google Tag Manager', `**GTM** manages all tracking tags (GA4, Meta Pixel, ads conversions) from one place without editing site code each time. **Tags** fire when **triggers** happen, using **variables**.`,
        { steps: [['Install GTM once', 'Paste the container snippet into the site.'], ['Add GA4 tag', 'Fires on all pages.'], ['Create a trigger', 'e.g. click on "Book now" button or form submit.'], ['Add event tag', 'Send "generate_lead" to GA4 and Meta.'], ['Preview & publish', 'Test in Preview mode, then publish a version.']] }),
      C('Meta Pixel & conversions API', `The **Pixel** (browser code) and **Conversions API** (server-side) send events like ViewContent, AddToCart, Lead, Purchase to Meta, so ads can optimise for real results and you can measure them. Using both improves accuracy as browsers block more tracking.`),
      C('CRM basics (HubSpot)', `A **CRM** stores every contact and their history — source, emails, calls, deals, stage. HubSpot's free CRM is enough to start: pipeline stages (Lead → Contacted → Proposal → Won/Lost), tasks and reminders, and reports on where leads come from.`,
        { flow: ['Lead captured', 'Contacted', 'Meeting / demo', 'Proposal', 'Won / Lost'] }),
      C('Scheduling & social tools', `Plan and publish from one place: Meta Business Suite (free for Instagram/Facebook), Buffer, Later, LinkedIn's native scheduler. Batch-create on one day, schedule the week, then spend daily time on engagement instead of posting.`),
      C('Marketing automation platforms', `Tools like HubSpot, Brevo, Klaviyo (e-commerce) and Zapier/Make connect actions: "when someone fills this form → add to CRM → tag by interest → start email flow → notify sales on WhatsApp/Slack".`,
        pick('Before launching a ₹10,000 ad campaign, what must be done first?', ['Design more ads', false], ['Set up and test conversion tracking (GTM, GA4, Pixel)', true, 'Without tracking you cannot tell which ads worked.'], ['Buy followers', false])),
    ],
    quiz: [
      Q('Main benefit of Google Tag Manager?', ['Free hosting', 'Manage tracking tags without editing code each time', 'Better SEO automatically', 'Design tool'], 1, 'Central tag management.'),
      Q('Why use Conversions API with the Pixel?', ['It is cheaper', 'Server-side events are more reliable when browsers block tracking', 'Required for posts', 'Speeds up the site'], 1, 'Better signal quality.'),
      Q('A CRM mainly tracks…', ['Website speed', 'Contacts, interactions and deals', 'Fonts', 'Hashtags'], 1, 'Customer relationships.'),
    ],
    practice: 'Install GTM on a test site, send a GA4 event for a button click, and verify it in GA4 DebugView.',
    explain: 'Explain GTM as a switchboard that controls all the tracking lights in a house.',
  },

  'dm-ecom': {
    intro: 'Selling online and to local customers: be findable on maps, trusted in reviews, and convincing on every product page.',
    concepts: [
      C('Google Business Profile', `For any local business, this is the highest-impact free marketing. It powers the map results for "bakery near me".

- Correct name, category, hours, phone, location.
- Real photos added weekly; posts and offers.
- Products/services with prices.
- Respond to every review.`),
      C('Reviews & reputation', `Reviews drive local rankings and buying decisions. Ask happy customers at the right moment (right after a great experience), make it one tap (QR code / short link), reply to every review — thank the good ones, and answer bad ones calmly with a fix.`,
        { code: `Reply to a 2-star review:
"Hi Rahul, sorry the brownies arrived late on Saturday — that's not the experience we want.
We've changed our delivery partner for weekends. We'd love to make it up to you; DM us your order number."`, lang: 'text' }),
      C('Shopify & marketplaces basics', `- **Own store (Shopify, WooCommerce)** — your brand, your customer data, your margins; you must bring the traffic.
- **Marketplaces (Amazon, Flipkart, Meesho, Swiggy/Zomato)** — built-in traffic, but fees, price competition and no customer relationship.

Many brands do both: marketplaces for reach, own store and WhatsApp for repeat customers.`),
      C('Product listings that convert', `A listing must answer every question a buyer has without asking:`,
        { cards: [['Title', 'Brand + product + key feature + size: "Jaggery Millet Brownies — Eggless, Box of 6"'], ['Images', '6–8: hero, close-up, in use, size reference, ingredients, packaging.'], ['Benefits first', 'What it does for them, then features.'], ['Social proof', 'Ratings, reviews with photos.'], ['Remove doubt', 'Delivery time, returns, shelf life, FAQs.']] }),
      C('Retargeting', `Most visitors leave without buying. **Retargeting** shows ads to people who visited, viewed a product or added to cart — they already know you, so it converts far better than cold ads. Use frequency caps so it doesn’t feel creepy, and exclude people who already bought.`,
        pick('Who should see a "complete your order — free delivery today" ad?', ['Everyone in India', false], ['People who added to cart in the last 7 days but didn’t buy', true, 'High intent, specific message.'], ['People who bought yesterday', false])),
    ],
    quiz: [
      Q('Most important free tool for a local café’s visibility?', ['TikTok', 'Google Business Profile', 'Pinterest', 'Email'], 1, 'Maps and local search.'),
      Q('Best response to a negative review?', ['Ignore it', 'Calm, public apology with a concrete fix', 'Argue', 'Delete it'], 1, 'Other readers judge your response.'),
      Q('Retargeting audiences should usually exclude…', ['Cart abandoners', 'Recent purchasers', 'Product viewers', 'Site visitors'], 1, 'Don’t waste spend on people who already bought.'),
    ],
    practice: 'Audit a local business’s Google Business Profile and write 10 concrete improvements, plus 3 review replies.',
    explain: 'Explain marketplace vs own store using renting a stall in a busy mall vs opening your own shop.',
  },

  'dm-ads': {
    intro: 'Paid ads buy attention instantly. The skill is spending small, learning fast, and scaling only what is proven profitable.',
    concepts: [
      C('Google Ads: search, display, YouTube', `- **Search** — text ads on Google results for keywords people type. Captures existing demand; highest intent.
- **Display** — banners across millions of sites. Cheap reach, lower intent; good for retargeting.
- **YouTube** — video ads; awareness and consideration.
- **Performance Max** — Google’s automated campaign across all its channels.`),
      C('Meta Ads: campaigns, ad sets, ads', `Meta ads have three levels:`,
        { arch: [['Campaign — the objective', ['Sales / Leads / Traffic / Awareness']], ['Ad sets — who, where, budget', ['Audience A', 'Audience B']], ['Ads — the creative', ['Video 1', 'Image 2', 'Carousel 3']]] },
        { note: 'Choose the objective that matches the business goal. A "Traffic" campaign finds clickers, not buyers.' }),
      C('Audiences & targeting', `- **Cold** — interests, demographics, or broad targeting (let the algorithm find buyers).
- **Lookalike** — people similar to your customers.
- **Warm / retargeting** — site visitors, video viewers, engagers.
- **Custom lists** — your customer emails/phones (with consent).

Today, creative is the main targeting lever: the ad itself decides who stops and engages.`),
      C('Bidding & budgets', `Start small, test, then scale:`,
        { steps: [['Set the goal', 'e.g. leads at ≤ ₹150 each.'], ['Test', '₹300–500/day across 3 creatives × 2 audiences for 5–7 days.'], ['Wait for data', 'Avoid editing daily — the algorithm needs ~50 results to learn.'], ['Cut losers', 'Pause ads well above target cost.'], ['Scale winners slowly', 'Raise budget ~20% every few days, or duplicate the winner.']] }),
      C('CPC, CPA, ROAS', `The numbers every marketer must calculate in their head:`,
        { table: { cols: ['Metric', 'Formula', 'Example'], rows: [['CTR', 'clicks ÷ impressions', '300 / 20,000 = 1.5%'], ['CPC', 'spend ÷ clicks', '₹3,000 / 300 = ₹10'], ['Conversion rate', 'conversions ÷ clicks', '15 / 300 = 5%'], ['CPA', 'spend ÷ conversions', '₹3,000 / 15 = ₹200'], ['ROAS', 'revenue ÷ spend', '₹9,000 / ₹3,000 = 3×']] } },
        pick('You spent ₹5,000 and made ₹7,500 in sales, but your product margin is 30%. Is the campaign profitable?', ['Yes, ROAS is 1.5×', false], ['No — 30% of ₹7,500 is ₹2,250 profit before ads, less than ₹5,000 spent', true, 'Break-even ROAS = 1 ÷ margin ≈ 3.3×. ROAS must beat that.'], ['Can’t tell', false])),
    ],
    quiz: [
      Q('Someone searches "buy running shoes size 9". Best channel?', ['Display', 'Google Search ads', 'YouTube awareness', 'Influencer'], 1, 'High-intent search.'),
      Q('₹4,000 spend, 20 sales. CPA?', ['₹20', '₹200', '₹2,000', '₹80'], 1, '4,000 ÷ 20.'),
      Q('Margin 25%. Break-even ROAS?', ['1×', '2×', '4×', '25×'], 2, '1 ÷ 0.25 = 4.'),
      Q('Why avoid editing ads every day?', ['Meta forbids it', 'Learning phase resets and data stays too small', 'It costs extra', 'Ads expire'], 1, 'Let the algorithm learn.'),
    ],
    practice: 'Do build dm-6: tracking first, then a small test (3 creatives × 2 audiences), and a report with CPA, ROAS and break-even ROAS.',
    explain: 'Explain ROAS vs profit to a shop owner who thinks 2× ROAS always means success.',
  },

  'dm-analytics': {
    intro: 'If you can’t measure it, you can’t improve it — or prove your value. Analytics turns marketing from opinion into evidence.',
    concepts: [
      C('GA4 events & conversions', `GA4 tracks **events** (page_view, scroll, click, generate_lead, purchase). Mark the important ones as **key events** (conversions). Reports then show which channels, pages and campaigns drive them.`,
        { cards: [['Automatic', 'page_view, session_start, first_visit'], ['Enhanced measurement', 'scroll, outbound click, file download, video'], ['Recommended', 'generate_lead, sign_up, purchase, add_to_cart'], ['Custom', 'Anything specific, e.g. checklist_download']] }),
      C('UTM parameters', `UTMs tag your links so GA4 knows exactly where a visitor came from.`,
        { code: `https://example.com/course?utm_source=instagram&utm_medium=social&utm_campaign=nov_batch&utm_content=reel_hook_a`, lang: 'text' },
        { table: { cols: ['Parameter', 'Means', 'Example'], rows: [['utm_source', 'Where', 'instagram, newsletter, google'], ['utm_medium', 'Channel type', 'social, email, cpc'], ['utm_campaign', 'Which campaign', 'nov_batch'], ['utm_content', 'Which version', 'reel_hook_a']] } },
        { note: 'Use lowercase and a shared naming sheet; "Instagram" and "instagram" show up as different sources.' }),
      C('Attribution models', `Customers touch many channels before buying. **Attribution** decides who gets credit.`,
        { steps: [['Reel (first touch)', 'Discovers the brand.'], ['Google search', 'Comes back to read reviews.'], ['Email', 'Gets the discount code.'], ['Retargeting ad (last touch)', 'Clicks and buys.'], ['Who gets credit?', 'Last-click: the ad. First-click: the reel. Data-driven (GA4 default): shared based on patterns.']] }),
      C('Dashboards in Looker Studio', `**Looker Studio** (free) connects GA4, Google Ads, Sheets and more into shareable dashboards. A good marketing dashboard: one goal metric at the top, the funnel (sessions → leads → customers), channel breakdown, trend over time, and cost metrics.`),
      C('Choosing KPIs', `A KPI must connect to a business outcome. Vanity metrics (likes, impressions) are fine as diagnostics but not as goals.`,
        pick('Goal: more course enrolments. Best primary KPI?', ['Instagram likes', false], ['Enrolments (and cost per enrolment)', true, 'Measure the outcome you want; use others to diagnose.'], ['Follower count', false])),
    ],
    quiz: [
      Q('What does utm_medium describe?', ['The campaign name', 'The channel type (social, email, cpc)', 'The page', 'The device'], 1, 'Medium = type of channel.'),
      Q('Last-click attribution gives full credit to…', ['The first touch', 'The final touch before conversion', 'All equally', 'Email always'], 1, 'Final interaction.'),
      Q('Which is a vanity metric when the goal is sales?', ['Revenue', 'Likes', 'Conversion rate', 'CPA'], 1, 'Not tied directly to the outcome.'),
    ],
    practice: 'Create a UTM naming sheet, tag all links for one week, then build a one-page Looker Studio dashboard from GA4.',
    explain: 'Explain attribution using a football goal: who gets credit, the scorer or the players who passed?',
  },

  'dm-cro': {
    intro: 'Getting more value from the traffic you already have. Doubling conversion rate is often cheaper than doubling traffic.',
    concepts: [
      C('Landing page structure', `One page, one goal. A proven order:`,
        { steps: [['Hero', 'Clear headline (outcome), subheadline (how), one CTA button, visual.'], ['Proof', 'Logos, numbers, short testimonials.'], ['Problem → solution', 'Show you understand them, then how you solve it.'], ['How it works', '3 simple steps.'], ['Objections / FAQ', 'Price, time, "will it work for me?"'], ['Final CTA', 'Repeat the offer and button.']] }),
      C('Funnel drop-off analysis', `Find the biggest leak before fixing anything.`,
        { table: { cols: ['Step', 'Users', 'Continue rate'], rows: [['Landing page', '10,000', '—'], ['Clicked "Enroll"', '1,800', '18%'], ['Started form', '1,200', '67%'], ['Submitted form', '360', '30% ← biggest leak'], ['Paid', '180', '50%']] } },
        { note: 'Fix the form first (too many fields? confusing? no trust signals?) — that is where most people are lost.' }),
      C('A/B testing', `Show version A to half the visitors and B to the other half; compare conversion rate. Test one meaningful change; decide the sample size and duration **before** starting; don’t stop early when one is ahead — early leads are often noise.`,
        pick('After 2 days, B leads 6 conversions to 4. What now?', ['Declare B the winner', false], ['Keep running until the planned sample size — 10 conversions is far too little data', true, 'Tiny samples swing randomly.'], ['Stop and test something else', false])),
      C('UX heuristics for conversion', `Common fixes that lift conversions:`,
        { cards: [['Clarity', 'Can someone say what you offer in 5 seconds?'], ['Friction', 'Fewer form fields; autofill; guest checkout.'], ['Trust', 'Reviews, guarantees, secure payment badges, real contact info.'], ['Speed', 'Each extra second of load time loses visitors.'], ['Mobile first', 'Big buttons, readable text, sticky CTA.'], ['One CTA', 'Remove competing links on landing pages.']] }),
    ],
    quiz: [
      Q('Where should you optimise first?', ['The prettiest page', 'The step with the biggest drop-off', 'The footer', 'The logo'], 1, 'Biggest leak = biggest gain.'),
      Q('A landing page should usually have…', ['Many goals', 'One clear goal and CTA', 'No headline', 'Hidden prices'], 1, 'Focus converts.'),
      Q('Why not stop an A/B test early?', ['Tools forbid it', 'Early results are noisy and often reverse', 'It costs more', 'Google penalises it'], 1, 'Need enough data.'),
    ],
    practice: 'Map the funnel of your dm-5 landing page in GA4, find the biggest drop, and run one A/B test on it.',
    explain: 'Explain funnel drop-off using a leaking water pipe — fix the biggest hole first.',
  },

  'dm-growth': {
    intro: 'From running campaigns to running growth: systems that compound, customers who stay, and plans that leadership trusts.',
    concepts: [
      C('Growth loops', `A funnel ends; a **loop** feeds itself: new users create something that brings more users.`,
        { steps: [['User creates value', 'A student shares a project made with your app.'], ['It reaches new people', 'Their LinkedIn network sees it.'], ['New people sign up', 'Some click and join.'], ['They create value too', 'The loop repeats — and compounds.']] },
        { cards: [['Referral loop', 'Give ₹100, get ₹100.'], ['Content loop', 'Users’ posts or reviews attract users.'], ['Paid loop', 'Profit from customers funds more ads.']] }),
      C('Retention & lifecycle marketing', `Keeping customers is cheaper than finding new ones. Map the lifecycle (new → active → at risk → lapsed) and message each stage: onboarding tips, habit nudges, "we miss you" offers, loyalty rewards. Track cohort retention: of people who joined in a month, how many are still active after 30/60/90 days?`),
      C('Campaign planning end to end', `A campaign brief on one page:`,
        { code: `Objective:   120 enrolments for the January batch
Audience:    final-year students in Karnataka (persona: Priya)
Message:     "3 real client projects in 6 weeks"
Channels:    Instagram reels + Meta ads, LinkedIn posts, email list, 3 college partnerships
Timeline:    teaser (wk1) → launch (wk2–3) → urgency (wk4)
Budget:      ₹40,000  (ads ₹30k, creators ₹8k, tools ₹2k)
KPIs:        CPA ≤ ₹330, landing CVR ≥ 4%
Tracking:    UTMs, GA4 key events, Pixel; weekly review every Monday`, lang: 'text' }),
      C('Budgeting & forecasting', `Work backwards from the goal using funnel rates:

Goal 120 sales ÷ 5% landing conversion = 2,400 visitors ÷ 1.5% CTR = 160,000 impressions. At ₹12 per click × 2,400 = ₹28,800 ad budget. Then add a buffer and test budget.`,
        pick('Conversion rate drops from 5% to 2.5% with everything else the same. Ad budget needed for the same sales?', ['Same', false], ['Doubles', true, 'Half the conversion rate needs twice the visitors.'], ['Halves', false])),
      C('Reporting to stakeholders', `Leaders want: what happened, why, and what next — in one page. Lead with the business result against the goal, show 3–5 key numbers with trends, explain wins and misses honestly, and end with decisions or asks.`),
    ],
    quiz: [
      Q('What makes a growth loop different from a funnel?', ['It is longer', 'Outputs feed back as new inputs, compounding', 'It uses ads only', 'No users'], 1, 'Self-reinforcing.'),
      Q('Cohort retention answers…', ['Total followers', 'How many users from a given start period are still active over time', 'Ad spend', 'SEO rank'], 1, 'Retention by join date.'),
      Q('A stakeholder report should start with…', ['Every metric', 'The business result against the goal', 'Tool screenshots', 'Apologies'], 1, 'Outcome first.'),
    ],
    practice: 'Write a one-page campaign brief with a funnel-based budget forecast for a real or imaginary launch.',
    explain: 'Explain growth loops using how WhatsApp groups spread.',
  },

  'dm-ai': {
    intro: 'AI is now part of every marketer’s toolkit. Use it to move faster — while keeping judgement, brand and honesty human.',
    concepts: [
      C('AI for content drafts & variations', `Use AI for first drafts, many variations (10 hooks, 5 subject lines), repurposing, summaries and research — then edit with your knowledge of the audience and brand.`,
        { code: `You are a copywriter for [brand], voice: friendly, expert, honest.
Audience: final-year students in Karnataka who want a first marketing job.
Write 10 reel hooks (max 8 words each) about building a portfolio with real clients.
Avoid hype words like "ultimate" and "secret". Mix curiosity, numbers and contrarian angles.`, lang: 'text' },
        { note: 'Give context (brand, audience, voice, examples) — generic prompts give generic copy.' }),
      C('Personalisation at scale', `AI helps tailor messages by segment or behaviour — different email intros per interest, product recommendations, ad creative variants per audience. Keep it useful, not creepy, and based on data people agreed to share.`),
      C('Marketing automation tools', `Common AI-assisted tools: Canva Magic Studio (design), CapCut / Opus Clip (video cutting), ChatGPT / Claude (writing, analysis), Meta Advantage+ and Google Performance Max (automated ad targeting and creative), and Zapier/Make with AI steps for workflows.`),
      C('Ethics, disclosure & brand safety', `- Disclose AI-generated people or testimonials; never fake reviews or customer stories.
- Fact-check every claim — AI invents statistics.
- Respect copyright and likeness; don't imitate real people or brands.
- Protect customer data — don’t paste private data into public tools.
- Keep a human reviewer for anything published.`,
        pick('AI wrote "97% of students get placed in 30 days" for your ad. You have no data for it. What do you do?', ['Publish — it sounds great', false], ['Remove it; only use claims you can prove', true, 'False claims break trust and advertising rules (ASCI).'], ['Change it to 96%', false])),
    ],
    quiz: [
      Q('Best use of AI in content work?', ['Publish without review', 'Drafts and variations, then human editing', 'Faking reviews', 'Replace all research'], 1, 'Speed with judgement.'),
      Q('An AI-generated statistic in your copy should be…', ['Trusted', 'Verified or removed', 'Rounded', 'Bolded'], 1, 'AI can invent numbers.'),
    ],
    practice: 'Generate 20 hooks with AI for one campaign, pick the best 3 with your crew, and A/B test them as reels.',
    explain: 'Explain where AI helps and where humans must stay in charge in a marketing team.',
  },

  'dm-cert': {
    intro: 'Free certifications get you past resume filters; case studies with real numbers get you hired.',
    concepts: [
      C('Google Ads certification (Skillshop)', `Free on Google Skillshop: Search, Display, Video, Shopping and Measurement certifications. Each has free learning paths and an online exam; valid for a year. Start with **Google Ads Search**.`),
      C('Google Analytics certification', `Free on Skillshop: GA4 setup, events and conversions, reports and explorations, attribution. Do it right after you set up GA4 on a real project, so the exam just names things you did.`),
      C('HubSpot Content Marketing certification', `Free on HubSpot Academy: content strategy, storytelling, SEO basics, repurposing and measurement. HubSpot's Inbound and Email Marketing certifications are also free and respected.`),
      C('Portfolio of 3 case studies with results', `Your portfolio matters more than any certificate. Each case study:`,
        { steps: [['Context', 'Who the client was and their goal.'], ['Challenge', 'What was not working, with a baseline number.'], ['Strategy', 'What you decided and why (audience, message, channels).'], ['Execution', 'What you made — show the actual posts, ads, pages.'], ['Results', 'Numbers vs baseline: followers, leads, CPA, revenue.'], ['Learnings', 'What you would do differently.']] },
        { note: 'Your builds dm-3 to dm-7 produce exactly these three case studies. Put them on a simple Notion or Canva site and link it in your LinkedIn Featured section.' }),
    ],
    quiz: [
      Q('Which is more convincing to a hiring manager?', ['10 certificates', '3 case studies with real numbers', 'A long resume', 'Follower count'], 1, 'Evidence of results.'),
      Q('Where are Google’s free marketing certifications?', ['Coursera only', 'Google Skillshop', 'Udemy', 'LinkedIn'], 1, 'Skillshop.'),
    ],
    practice: 'Finish the Google Ads Search certification this month and draft your first case study from dm-3.',
    explain: 'Explain why a portfolio beats certificates, using cooking: a menu of dishes you made vs a cooking-class certificate.',
  },
}
