// Digital marketing — lessons 1–9
const C = (t, body, ...blocks) => ({ t, body, blocks })
const Q = (q, o, a, why) => ({ q, o, a, why })
const pick = (q, ...options) => ({ pick: { q, options } })

export default {
  'dm-found': {
    intro: 'Marketing is getting the right message to the right people at the right moment — and measuring whether it worked. Everything starts here.',
    concepts: [
      C('Customer journey & the marketing funnel', `People do not buy the moment they see you. They move through stages, and each stage needs different content and different metrics.`,
        { steps: [['Awareness', 'They discover you exist — a reel, a search result, a friend. Metric: reach, impressions.'], ['Consideration', 'They compare options — reviews, comparisons, your website. Metric: clicks, time on page, saves.'], ['Conversion', 'They act — buy, sign up, book. Metric: conversion rate, cost per acquisition.'], ['Retention', 'They come back — email, WhatsApp, great product. Metric: repeat rate, churn.'], ['Advocacy', 'They tell others — reviews, referrals, UGC. Metric: referrals, reviews, NPS.']] },
        { note: 'Most beginner campaigns fail because they show a "Buy now" ad to people who have never heard of the brand. Match the message to the stage.' }),
      C('Target audience & personas', `"Everyone" is not an audience. A **persona** is a specific, research-based picture of one ideal customer: who they are, what they want, what blocks them, where they spend time.`,
        { cards: [['Who', 'Priya, 21, final-year B.Com student in Mangaluru.'], ['Goal', 'Get a first job in digital marketing within 6 months.'], ['Pain', 'No experience, can’t afford ₹40k courses, overwhelmed by YouTube.'], ['Where she is', 'Instagram reels at night, LinkedIn for jobs, WhatsApp groups.'], ['What convinces her', 'Real student results, free trial, Kannada/English mix.']] },
        { note: 'Build personas from real conversations (5 interviews beats 50 guesses).' }),
      C('Value proposition', `Your value proposition says, in one breath: **for whom**, **what outcome**, and **why you instead of the alternatives**.`,
        { code: `For [final-year students] who [want a marketing job but have no experience],
[CareerKit] is a [6-week practical programme] that [gets you 3 real client projects for your portfolio],
unlike [video-only courses], we [pair you with a local business].`, lang: 'text' },
        pick('Which is the strongest value proposition?', ['"High-quality digital marketing services"', false], ['"We get Mangaluru restaurants 30% more weekday orders through Instagram in 60 days"', true, 'Specific audience, specific outcome, specific timeframe.'], ['"Your one-stop solution for all needs"', false])),
      C('The marketing mix (4Ps)', `A classic checklist for any offer:`,
        { cards: [['Product', 'What it is and what problem it solves.'], ['Price', 'What it costs, and how that positions it (premium, value).'], ['Place', 'Where people buy it — Instagram DMs, Swiggy, Amazon, a shop.'], ['Promotion', 'How people hear about it — content, ads, influencers, PR.']] },
        { note: 'Digital marketers often only think about Promotion. Great marketers question all four — sometimes the fix is the price or the place, not more ads.' }),
      C('Owned, earned and paid media', `- **Owned** — channels you control: website, email list, Instagram account, WhatsApp channel. Compounding, cheap, slow.
- **Earned** — attention others give you: shares, press, reviews, UGC. Most trusted, hardest to control.
- **Paid** — attention you buy: ads, sponsored posts. Fast and scalable, stops when the money stops.`,
        { table: { cols: ['', 'Owned', 'Earned', 'Paid'], rows: [['Control', 'High', 'Low', 'High'], ['Cost', 'Time', 'Effort/quality', 'Money'], ['Trust', 'Medium', 'Highest', 'Lowest'], ['Speed', 'Slow', 'Unpredictable', 'Instant']] } }),
    ],
    quiz: [
      Q('Someone compares your product with two others. Funnel stage?', ['Awareness', 'Consideration', 'Retention', 'Advocacy'], 1, 'They know you and are evaluating.'),
      Q('A customer review on Google is which media type?', ['Owned', 'Earned', 'Paid', 'None'], 1, 'Attention given by others.'),
      Q('Best source for building personas?', ['Guessing', 'Real customer interviews and data', 'Competitor ads only', 'Stock photos'], 1, 'Research beats assumptions.'),
    ],
    practice: 'Pick one local business. Write its persona, value proposition, 4Ps, and one piece of content for each funnel stage.',
    explain: 'Explain the funnel using how you chose your last phone.',
  },

  'dm-research': {
    intro: 'Good marketing is mostly research. Learn what people actually think, what competitors do, and why people really buy.',
    concepts: [
      C('Surveys & customer interviews', `- **Interviews** (5–10 people, 20–30 minutes) find the *why*. Ask about past behaviour, not hypotheticals: "Tell me about the last time you…" not "Would you buy…?"
- **Surveys** (50+ people) measure *how many*. Use after interviews, to size what you found.`,
        { cards: [['Good question', '"Walk me through the last time you ordered dessert online."'], ['Bad question', '"Would you buy healthy brownies?" — people say yes to be nice.'], ['Good follow-up', '"Why that one?" / "What almost stopped you?"'], ['Survey tip', 'One idea per question; avoid leading words like "amazing".']] }),
      C('Competitor research tools', `See what works for others before spending money:`,
        { table: { cols: ['Tool', 'What you learn', 'Cost'], rows: [['Meta Ad Library', 'Every active ad a brand runs on Facebook/Instagram', 'Free'], ['Google Ads Transparency Center', 'Their Google/YouTube ads', 'Free'], ['SimilarWeb', 'Website traffic sources', 'Free tier'], ['Ubersuggest / Ahrefs free tools', 'Their top keywords and pages', 'Free tier'], ['Instagram/YouTube itself', 'Which posts got the most engagement', 'Free']] } },
        { note: 'Ads running for months are usually profitable — study those, not new ones.' }),
      C('Persuasion principles (social proof, scarcity, reciprocity)', `Cialdini's principles explain why people say yes. Use them honestly — fake urgency destroys trust.`,
        { cards: [['Social proof', '"2,400 students enrolled" — people follow others.'], ['Scarcity', '"Only 20 seats this batch" — rare feels valuable. Must be true.'], ['Reciprocity', 'Give a free guide first; people want to return the favour.'], ['Authority', 'Expert credentials, certifications, media mentions.'], ['Liking', 'People buy from brands that feel like them.'], ['Commitment', 'Small yes first (free webinar) → bigger yes later.']] }),
      C('Behavioural biases in buying decisions', `Our brains take shortcuts:

- **Anchoring** — the first price seen sets the reference (₹2,999 ~~₹5,999~~).
- **Decoy effect** — a third option makes the target look better (Basic / **Pro** / Pro+ priced close to Pro).
- **Loss aversion** — losing ₹100 hurts more than gaining ₹100 feels good ("Don't lose your progress").
- **Default effect** — people keep the pre-selected option.
- **Choice overload** — too many options → no decision.`,
        pick('A pricing page has Basic ₹199, Pro ₹499, Premium ₹549. What is Premium likely doing?', ['Making money on its own', false], ['Acting as a decoy so Pro (or Premium) looks like great value', true, 'Close-priced options shape what feels like a good deal.'], ['Nothing', false])),
      C('Turning research into insights', `An **insight** is not a fact; it is a fact plus *why it matters* plus *what we will do*.

- Fact: "Students watch reels after 10 pm."
- Insight: "They are tired and want quick wins, not long lessons."
- Action: "Post 30-second 'one skill tonight' reels at 10:30 pm."`,
        { flow: ['Raw data', 'Patterns', 'Insight (why)', 'Action', 'Test & measure'] }),
    ],
    quiz: [
      Q('Best interview question?', ['Would you buy this?', 'Tell me about the last time you bought something like this', 'Do you like our logo?', 'How much would you pay?'], 1, 'Past behaviour is reliable; hypotheticals are not.'),
      Q('Which free tool shows all active Instagram ads of a competitor?', ['GA4', 'Meta Ad Library', 'Canva', 'Search Console'], 1, 'Ad transparency library.'),
      Q('"Only 3 left" when there are 300 left is…', ['Good scarcity', 'Dishonest and harms trust', 'Social proof', 'Anchoring'], 1, 'Persuasion must be truthful.'),
    ],
    practice: 'Interview 5 people about a purchase category, study 3 competitors in Meta Ad Library, and write 3 insights in fact → why → action form.',
    explain: 'Explain anchoring and the decoy effect using a café menu.',
  },

  'dm-brand': {
    intro: 'A brand is what people say about you when you are not in the room. Positioning decides what you want them to say.',
    concepts: [
      C('Positioning statement', `Positioning is the space you own in the customer's mind, relative to alternatives.`,
        { code: `For [audience] who [need],
[brand] is the [category] that [key benefit],
because [reason to believe].

For working professionals in Bengaluru who want healthy desserts,
The Brownie Co. is the home bakery that makes guilt-free brownies without compromising taste,
because every recipe uses jaggery and millets and is taste-tested by 50 customers.`, lang: 'text' }),
      C('Brand voice & tone', `**Voice** is your consistent personality; **tone** adapts to the situation (playful on reels, calm in a complaint reply).`,
        { table: { cols: ['Voice trait', 'Do', "Don't"], rows: [['Friendly', '"Hey! Your order is on its way 🚀"', '"Dear customer, your order has been dispatched."'], ['Expert', 'Explain why, cite results', 'Use jargon to sound smart'], ['Honest', '"We messed up — here’s the fix"', 'Hide problems']] } }),
      C('Competitor analysis', `Map competitors on the two attributes customers care about most to find a gap.`,
        { arch: [['Premium + fun', ['Brand A']], ['Premium + serious', ['Brand B', 'Brand C']], ['Affordable + fun', ['← the gap: your brand?']], ['Affordable + serious', ['Brand D']]] },
        { note: 'A good gap is one that customers want and competitors cannot easily copy.' }),
      C('Storytelling', `Stories are remembered far better than facts. A simple structure:`,
        { steps: [['Hero', 'The customer, not your brand.'], ['Problem', 'What they struggled with — make it specific.'], ['Guide', 'Your brand helps, with a plan.'], ['Action', 'What they did.'], ['Transformation', 'The result, with a number or a feeling.']] },
        pick('Which opening hooks a story best?', ['"We are a leading company founded in 2020"', false], ['"Riya failed 14 interviews. The 15th went differently."', true, 'A specific person, a tension, curiosity.'], ['"Click to learn more"', false])),
    ],
    quiz: [
      Q('Voice vs tone?', ['The same', 'Voice is constant personality; tone adapts to context', 'Tone is constant', 'Voice is the logo'], 1, 'Consistent voice, flexible tone.'),
      Q('In brand stories, the hero should be…', ['The brand', 'The customer', 'The founder always', 'The product'], 1, 'The brand is the guide.'),
      Q('A positioning map helps you find…', ['Fonts', 'An unoccupied space customers value', 'Hashtags', 'Prices only'], 1, 'Gaps in the market.'),
    ],
    practice: 'Write a positioning statement and a voice chart (3 traits, do/don’t) for a real or imaginary brand, and a 5-step customer story.',
    explain: 'Explain positioning using how you would describe two colleges to a friend.',
  },

  'dm-content': {
    intro: 'Content is how brands earn attention without paying for every view. Plan it, write it well, and reuse it everywhere.',
    concepts: [
      C('Content strategy & pillars', `**Pillars** are 3–5 recurring themes tied to your audience's needs and your business goal. Every post fits a pillar.`,
        { cards: [['Educate', '"3 Excel tricks for job interviews"'], ['Inspire', 'Student success stories'], ['Behind the scenes', 'How we pick projects'], ['Community', 'Q&A, polls, student shout-outs'], ['Promote (max ~20%)', 'Batch announcements, offers']] }),
      C('Editorial calendar', `A calendar turns strategy into a schedule: date, pillar, format, hook, CTA, owner, status. Batch-create a week of content in one sitting.`,
        { table: { cols: ['Day', 'Pillar', 'Format', 'Hook', 'CTA'], rows: [['Mon', 'Educate', 'Carousel', '5 resume mistakes recruiters hate', 'Save this'], ['Wed', 'Inspire', 'Reel', 'From 0 interviews to 3 offers', 'Comment "story"'], ['Fri', 'Promote', 'Story + post', 'New batch — 20 seats', 'DM "join"']] } }),
      C('Copywriting frameworks (AIDA, PAS)', `Frameworks give your copy a proven shape.`,
        { steps: [['AIDA · Attention', '"Your resume gets 6 seconds."'], ['AIDA · Interest', '"Recruiters scan for 3 things only."'], ['AIDA · Desire', '"Fix them and get 3× more callbacks."'], ['AIDA · Action', '"Grab the free checklist — link in bio."'], ['PAS · Problem → Agitate → Solve', '"No callbacks? → Every week without one hurts more → Here’s the 10-minute fix."']] }),
      C('Headlines & hooks', `The first line or first 2 seconds decide everything. Patterns that work:`,
        { cards: [['Number', '"7 free tools that replace ₹10k software"'], ['Curiosity gap', '"The resume mistake nobody tells you about"'], ['Contrarian', '"Stop applying on LinkedIn (do this instead)"'], ['Specific result', '"How I got 12k views with a ₹0 budget"'], ['Direct call-out', '"B.Com students, this one is for you"']] },
        pick('Which hook is strongest for a reel?', ['"Hello everyone, welcome back to my channel"', false], ['"This 1 setting doubled my reel views"', true, 'Specific, curious, no wasted seconds.'], ['"Today we will discuss marketing"', false])),
      C('Repurposing content across channels', `Create once, distribute many times:`,
        { flow: ['1 long video / blog', '5 reels / shorts', '3 carousels', '1 newsletter', '5 LinkedIn posts', 'Quotes for stories'] },
        { note: 'Adapt to each platform’s format and culture — don’t paste the same caption everywhere.' }),
    ],
    quiz: [
      Q('What share of posts should usually be direct promotion?', ['80%', 'Around 20% or less', '100%', '0%'], 1, 'Value first earns the right to sell.'),
      Q('PAS stands for…', ['Post, Ask, Share', 'Problem, Agitate, Solve', 'Plan, Act, Scale', 'Price, Audience, Sales'], 1, 'Copywriting framework.'),
      Q('Main purpose of a hook?', ['Show the logo', 'Stop the scroll in the first seconds', 'List features', 'Add hashtags'], 1, 'Attention first.'),
    ],
    practice: 'Do build dm-2: pillars, a 30-day calendar, and 12 posts — write every caption with AIDA or PAS.',
    explain: 'Explain repurposing using one wedding video turned into reels, photos and stories.',
  },

  'dm-design': {
    intro: 'You don’t need to be a designer — you need a few rules that make content look clean, readable and on-brand.',
    concepts: [
      C('Layout & typography for social posts', `- **Hierarchy**: one big message, one supporting line, one small CTA.
- **Contrast**: dark text on light, or light on dark — never mid on mid.
- **Two fonts max** (one bold heading, one clean body).
- **Whitespace**: empty space makes it feel premium.
- **Grid & alignment**: align everything to edges or centre consistently.
- Text must be readable on a phone at arm's length.`,
        { cards: [['Instagram post', '1080 × 1350 (4:5)'], ['Story / Reel', '1080 × 1920 (9:16)'], ['YouTube thumbnail', '1280 × 720 (16:9)'], ['LinkedIn image', '1200 × 627 or 1080 × 1350']] }),
      C('Canva or Figma basics', `- **Canva** — fastest for social posts, templates, brand kit (colours, fonts, logo), magic resize. Great for daily content.
- **Figma** — precise layout, components and auto-layout; better for landing pages and design systems.`,
        { steps: [['Set up a brand kit', 'Two colours + one accent, two fonts, logo.'], ['Make 3 master templates', 'Quote, tip carousel, announcement.'], ['Duplicate, never start blank', 'Consistency builds recognition.'], ['Export right', 'PNG for graphics, MP4 for video, correct sizes.']] }),
      C('Short-form video editing', `Free tools: CapCut, InShot, DaVinci Resolve. Rules that hold attention:

- Hook in the first 1–2 seconds (text on screen + motion).
- Cut every pause; change shot or add zoom every 2–4 seconds.
- Captions always — most people watch muted.
- One idea per video; end with a clear CTA or a loop back to the start.`),
      C('Thumbnails & cover images', `A thumbnail competes with everything else on the screen. Big face with clear emotion or a strong object, 3–5 words max, high contrast, and it must make sense with the title (not repeat it).`,
        pick('Which thumbnail text works best alongside the title "How I learned SQL in 30 days"?', ['"How I learned SQL in 30 days"', false], ['"0 → JOB READY"', true, 'Short, adds intrigue instead of repeating the title.'], ['A full paragraph', false])),
    ],
    quiz: [
      Q('Recommended aspect ratio for Instagram feed posts?', ['16:9', '4:5 (1080×1350)', '1:2', '21:9'], 1, 'Takes more screen space.'),
      Q('Why add captions to reels?', ['SEO only', 'Most people watch without sound', 'Required by Instagram', 'Looks busy'], 1, 'Muted viewing is common.'),
      Q('How many fonts in one post?', ['5+', '2 at most', '1 per word', 'Doesn’t matter'], 1, 'Clean hierarchy.'),
    ],
    practice: 'Create a brand kit and 3 Canva templates, then make 3 posts and one 30-second reel with captions in CapCut.',
    explain: 'Explain visual hierarchy using a newspaper front page.',
  },

  'dm-social': {
    intro: 'Each platform has its own culture and algorithm. Win by showing up consistently with content made for that platform.',
    concepts: [
      C('Platform strategy: Instagram, LinkedIn, YouTube', `Pick 1–2 platforms where your audience actually is, and do them well.`,
        { table: { cols: ['Platform', 'Best for', 'Winning formats'], rows: [['Instagram', 'Consumer brands, lifestyle, local business, students', 'Reels, carousels, stories, DMs'], ['LinkedIn', 'B2B, careers, personal brand', 'Text posts with a story, carousels (PDF), comments'], ['YouTube', 'Search + long-term discovery, education', 'Long videos, Shorts, tutorials']] } }),
      C('Reels & shorts that hold attention', `The algorithm mostly measures **watch time, completion, rewatches, shares and saves**.`,
        { steps: [['0–2 s: hook', 'Bold claim or question, text on screen.'], ['2–10 s: promise', 'Tell them what they’ll get.'], ['Body: fast value', 'One idea, quick cuts, visuals.'], ['End: payoff + CTA', '"Save this for later" or loop back to the start.'], ['Check analytics', 'Where do people drop? Fix that second next time.']] }),
      C('Community management', `Reply to comments in the first hour, answer DMs quickly, pin good questions, turn FAQs into posts, and handle complaints publicly with calm and privately with solutions. Communities grow where people feel heard.`),
      C('Creator & influencer collaborations', `Micro-creators (5k–50k followers) often give better engagement and trust per rupee than big names.

- Check real engagement and audience location, not just follower count.
- Give a clear brief but let them speak in their own style.
- Agree deliverables, usage rights and disclosure (**#ad / paid partnership** — required by ASCI guidelines in India).
- Track with unique codes or UTM links.`),
      C('Social analytics', `Measure what matches your goal:`,
        { cards: [['Reach', 'How many unique people saw it.'], ['Engagement rate', '(likes + comments + saves + shares) ÷ reach.'], ['Saves & shares', 'Strongest signals of value.'], ['Profile visits → follows', 'Did content convert to followers?'], ['Link clicks / DMs', 'Did it drive action?']] },
        pick('A reel got 50k views but almost no saves, shares or follows. What does that suggest?', ['A huge success', false], ['The hook worked but the content didn’t deliver value to the right audience', true, 'Views without saves/shares/follows = attention without value or fit.'], ['Post more of exactly this', false])),
    ],
    quiz: [
      Q('Best platform for B2B lead generation and careers?', ['Instagram', 'LinkedIn', 'Snapchat', 'Pinterest'], 1, 'Professional audience.'),
      Q('Which signal matters most for reels distribution?', ['Hashtag count', 'Watch time and completion', 'Caption length', 'Posting time only'], 1, 'Retention drives reach.'),
      Q('Paid influencer posts in India must…', ['Hide the payment', 'Be clearly disclosed (#ad)', 'Avoid brand names', 'Be stories only'], 1, 'ASCI disclosure guidelines.'),
    ],
    practice: 'Do build dm-3: run one account for 4 weeks with one hypothesis per week and a weekly analytics review.',
    explain: 'Explain why 1,000 true fans beat 100,000 random followers.',
  },

  'dm-video': {
    intro: 'Video is the highest-attention format online. YouTube is also the second largest search engine — videos keep bringing views for years.',
    concepts: [
      C('Scripting hooks & story structure', `Write before you shoot.`,
        { steps: [['Hook (0–15 s)', 'The problem or surprising result, shown not told.'], ['Set-up', 'Why it matters; what they will learn.'], ['Body', 'Steps or story beats; re-hook every 60–90 s ("but here’s where it went wrong…").'], ['Payoff', 'Deliver what you promised.'], ['CTA', 'One clear next step — next video, subscribe, link.']] }),
      C('YouTube SEO: titles, thumbnails, descriptions', `- **Title** — the searched keyword + a reason to click ("SQL in 30 Days — My Exact Plan (Free Resources)").
- **Thumbnail** — the biggest factor for click-through rate.
- **Description** — first 2 lines matter; add chapters (timestamps), links, keywords naturally.
- Tags matter little; the content and viewer behaviour matter most.`),
      C('Retention & audience analytics', `In YouTube Studio, watch:`,
        { cards: [['CTR (click-through rate)', 'Thumbnail + title performance.'], ['Average view duration', 'How long people watch.'], ['Retention graph', 'Exactly where people leave — fix those moments.'], ['Traffic sources', 'Search, suggested, browse, external.'], ['Returning viewers', 'Are you building an audience?']] }),
      C('Shorts / Reels strategy', `Shorts drive discovery; long videos build trust and watch time. Use Shorts as trailers: a single tip or highlight that links to the full video. Post consistently; test hooks.`),
      C('Repurposing long videos', `One 12-minute video → 5–8 Shorts (best moments), a carousel of key points, a LinkedIn post, a newsletter section, and a blog post with the transcript. Tools like CapCut or Opus Clip speed up cutting.`,
        pick('A video has a big retention drop at 0:40. Best next step?', ['Change the title', false], ['Watch what happens at 0:40 and fix that pattern next time (slow intro, off-topic, sponsor)', true, 'The graph points to the exact problem moment.'], ['Delete the channel', false])),
    ],
    quiz: [
      Q('Biggest lever for YouTube click-through rate?', ['Tags', 'Thumbnail and title', 'Description length', 'Upload time'], 1, 'What people see before clicking.'),
      Q('Where do you find exactly when viewers leave?', ['CTR', 'Audience retention graph', 'Subscriber count', 'Comments'], 1, 'Second-by-second.'),
      Q('Main role of Shorts for a long-form channel?', ['Replace long videos', 'Discovery that leads to long videos', 'Nothing', 'Ads only'], 1, 'Trailers and reach.'),
    ],
    practice: 'Script, shoot and publish one 5-minute tutorial with chapters, then cut it into 3 Shorts and compare their analytics after a week.',
    explain: 'Explain retention graphs using a movie where people walk out at certain scenes.',
  },

  'dm-brandme': {
    intro: 'Your own brand is your best marketing project. It gets you jobs, clients and opportunities — and it is free.',
    concepts: [
      C('Optimising a LinkedIn profile', `Recruiters search LinkedIn like Google. Make your profile findable and convincing:`,
        { steps: [['Photo & banner', 'Clear, friendly face; banner says what you do.'], ['Headline', 'Not just "Student". "Digital Marketing | SEO & Meta Ads | Helping local brands grow online".'], ['About', 'Who you help, how, proof (numbers), and a call to action.'], ['Featured', 'Pin your best case study, portfolio, certificate.'], ['Experience & projects', 'Results with numbers: "Grew page from 300 to 4,100 followers in 8 weeks".'], ['Skills', 'Top skills matching the jobs you want.']] }),
      C('Writing posts that get read', `A post that works: a hook line, short paragraphs with white space, one story or lesson, a specific takeaway, a question to invite comments. Post consistently (2–3 times a week) and comment thoughtfully on others' posts — comments build visibility too.`,
        { code: `I got rejected from 14 internships.

The 15th one said yes. Here's what changed:

1. I stopped sending the same resume
2. I showed one real project with numbers
3. I messaged the hiring manager, not just HR

The project took 2 weekends. The rejections took 3 months.

What's one thing that helped you land your first role?`, lang: 'text' }),
      C('Building in public', `Share what you are learning and building as you go: weekly progress, mistakes, numbers, lessons. It builds trust, attracts people with the same goals, and creates a public record of skills — far stronger than a certificate.`,
        { note: 'Your Study Together builds and retros are perfect building-in-public material. One post per shipped project.' }),
      C('Networking & outreach', `Give before you ask. A good cold message is short, specific and easy to say yes to.`,
        { code: `Hi Ananya — loved your post on Meta ads for D2C brands, especially the creative testing grid.
I'm a student running ads for a local bakery (₹3k budget, ROAS 2.4 so far).
Could I ask you one question about scaling the winning ad set? Happy to share my data too.`, lang: 'text' },
        pick('Which outreach is most likely to get a reply?', ['"Please refer me for any job"', false], ['A short, specific message referencing their work with one clear question', true, 'Specific, respectful, low effort to answer.'], ['Sending your resume with no message', false])),
    ],
    quiz: [
      Q('Best LinkedIn headline?', ['"Student at XYZ"', '"Digital Marketing | SEO & Meta Ads | Helping local brands grow"', '"Looking for opportunities"', '"Hi"'], 1, 'Keywords plus value.'),
      Q('Building in public means…', ['Only posting wins', 'Sharing your learning and progress openly as you go', 'Posting memes', 'Buying followers'], 1, 'Process, not just results.'),
    ],
    practice: 'Rewrite your LinkedIn headline and About, add one project with numbers, and publish one post about a lesson from this week.',
    explain: 'Explain why a public project beats a private certificate when job hunting.',
  },

  'dm-seo': {
    intro: 'SEO brings free, compounding traffic from people actively searching for what you offer. Now it also means showing up in AI answers.',
    concepts: [
      C('How search engines work', `Search engines **crawl** the web (bots follow links), **index** pages (store and understand them), and **rank** results for each query using hundreds of signals: relevance, quality, links, page experience, freshness and user behaviour.`,
        { steps: [['Crawl', 'Googlebot discovers your page via links and sitemaps.'], ['Render', 'It loads the page, including JavaScript.'], ['Index', 'It understands and stores the content.'], ['Rank', 'For each search, it orders indexed pages by usefulness.'], ['Serve', 'Results shown — blue links, maps, videos, AI overviews.']] }),
      C('Keyword research & search intent', `Find what people actually type, and **why**.`,
        { table: { cols: ['Intent', 'Example', 'Content that ranks'], rows: [['Informational', '"what is SEO"', 'Guide / article'], ['Commercial', '"best SEO course in India"', 'Comparison, reviews'], ['Transactional', '"buy brownies Mangaluru"', 'Product / order page'], ['Navigational', '"Swiggy login"', 'The brand’s page']] } },
        { note: 'Start with long-tail keywords (4+ words, lower competition): "eggless brownies delivery Mangaluru" beats "brownies".' }),
      C('On-page SEO', `- Target one main keyword per page.
- Title tag (≈60 characters) and meta description (≈155) — written for clicks.
- One H1; clear H2/H3 structure.
- Answer the query fully and early; original insights, examples, images with alt text.
- Internal links to related pages; clean URLs (/eggless-brownies-mangaluru).`),
      C('Technical SEO basics (speed, indexing, schema)', `Make it easy for search engines and users:`,
        { cards: [['Speed / Core Web Vitals', 'Fast loading (LCP), stable layout (CLS), quick response (INP).'], ['Mobile-friendly', 'Google indexes the mobile version first.'], ['Indexing', 'Sitemap submitted; no accidental noindex; robots.txt correct.'], ['HTTPS', 'Secure site.'], ['Schema markup', 'Structured data (LocalBusiness, Product, FAQ) for rich results.']] }),
      C('Links & digital PR', `Links from relevant, trusted sites are votes of confidence. Earn them with genuinely useful assets (original data, free tools, guides), local press, partnerships and guest content. Never buy links — it risks penalties.`),
      C('Google Search Console', `Free and essential: see which queries show your site, clicks, CTR, average position, indexing problems, Core Web Vitals, and submit sitemaps.`,
        pick('A page ranks at position 6 with lots of impressions but very low CTR. Quick win?', ['Delete the page', false], ['Rewrite the title and meta description to be more compelling for that query', true, 'You are visible; make the snippet more clickable.'], ['Buy links', false])),
      C('AI search & generative engine optimisation (GEO)', `Google AI Overviews, ChatGPT search and Perplexity now answer questions directly and cite sources. To be cited:

- Clear, factual answers near the top of the page.
- Original data, expert quotes, specific numbers.
- Strong brand mentions across trusted sites.
- Structured, well-organised content (headings, lists, FAQs).
- Keep pages updated.`,
        { note: 'Classic SEO is still the foundation — AI engines mostly cite pages that already rank and are trusted.' }),
    ],
    quiz: [
      Q('"best laptop under 60000" is mainly which intent?', ['Navigational', 'Commercial investigation', 'Informational only', 'Transactional brand'], 1, 'Comparing options before buying.'),
      Q('Where do you see real queries that bring impressions to your site?', ['GA4', 'Google Search Console', 'Canva', 'Meta Ads'], 1, 'Search performance report.'),
      Q('Safest way to get backlinks?', ['Buy them', 'Create link-worthy assets and do PR', 'Spam comments', 'Link farms'], 1, 'Earned links are safe and valuable.'),
      Q('To be cited in AI answers, pages should…', ['Hide the answer', 'Give clear, factual, well-structured answers with original data', 'Avoid headings', 'Use only images'], 1, 'GEO rewards clarity and authority.'),
    ],
    practice: 'Do build dm-4: keyword research, technical audit, 3 articles and Search Console tracking for a real site.',
    explain: 'Explain crawling, indexing and ranking using a librarian who collects, catalogues and recommends books.',
  },
}
