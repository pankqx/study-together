# study/together

A private study platform for three friends learning their way from full stack to data engineering, cloud and AI. Everyone moves at their own pace, and everyone can see where the others are.

**Live:** https://pankqx.github.io/study-together/

Navigation: Today · Roadmap · DSA · Log in the floating bar; Crew, Proof wall and Profile under **More**; Planner and Boards at the bottom of Today.

## What's inside

| Screen | What it does |
|---|---|
| **DSA log** | Paste a LeetCode / ProntoPy link to log a solved problem with difficulty, pattern and a short note. One row per problem shows who in the crew has solved it, plus everyone's notes. Also: pattern coverage table and a personal "revisit" list. |
| **Today** | Your streak, rank and XP. The mandatory 2-hour DSA block (via ProntoPy). A shared study-room timer, the next unfinished topic in each track you've picked to focus on, and the crew's activity today. |
| **Roadmap** | 10 standalone tracks, each going from basics to pro: DSA in Python, Front end, Back end, DBMS, System design, DevOps, Cloud, Data engineering, AI full stack, Crossover. There's also a Capstones track and a blended **Crossover journey** (12 stages that mix every track). Tap a topic to tick concepts, open free resources, and post proof. |
| **Build & learn** | A ladder of 7 projects per domain (front end, back end, DBMS, system design, DevOps, cloud, data engineering, AI, digital marketing), from scratch to advanced, plus 4 cross-domain flagship builds done together. Each project links the roadmap topics to learn while building, lists milestones and "think like a senior" review questions, and has a pro checklist (design doc, tests in CI, one measured number, retro, demo). Shipping needs a written retro. Shipped builds come back on Today to re-explain at 7, 30 and 90 days, and you can see how the others built the same project. Projects live in `src/data/builds.js`. |
| **Crew** | Head-to-head "gap" bars per track, plus rank, XP, streaks, heatmaps and badges for each person. |
| **Proof** | A wall where you post notes and photos tagged with a roadmap topic. Friends can react. |
| **Learning log** | One entry a day: what you studied (pre-filled from concepts you ticked), an explanation in your own words, what's still unclear, and topics you'll teach. A shared call agenda collects topics to explain and open questions; tick "Explained" once it's taught. Replies on every entry. **Recap & calls**: pick since-last-call / 7 days / 30 days / since the beginning to see, per person, topics studied (from roadmap ticks and logs), DSA problems solved, their explanations and questions — copy, share on WhatsApp or print it; save call notes to start the next recap from there. |
| **Board** | Infinite black-and-white whiteboards (Excalidraw) that sync live between the three of you. Export to PNG/SVG. |
| **Planner** | Week calendar like time.fyi. Quick-add by typing ("Spark joins 7-9pm tomorrow"). Drag to move or resize blocks. Keep a task list, and peek at friends' plans. |

**How the streak works:** a day counts if you do any one of these: tick a concept, mark DSA done, post proof, finish a planner block or task, or complete a study-room session.

There are no dates or deadlines. The roadmap lives in `src/data/roadmap.js`, so you can edit topics, resources or the journey there.

## Go live in about 10 minutes

1. **Firebase project.** Go to [console.firebase.google.com](https://console.firebase.google.com), click *Add project*, and leave Analytics off.
2. **Google login.** Go to *Build → Authentication → Get started → Sign-in method*, then enable **Google**. Then go to *Settings → Authorized domains* and add `pankqx.github.io`.
3. **Database.** Go to *Build → Firestore Database → Create database* and choose production mode, region `asia-south1` (Mumbai). Then open the *Rules* tab, paste [`firestore.rules`](firestore.rules) with your 3 real emails, and click *Publish*.
4. **Web config.** Go to *Project settings → Your apps → Web (</>)* and register the app. Copy the `firebaseConfig` object into `src/config.js`.
5. **Crew emails.** Put the same 3 Gmail addresses in `CREW` in `src/config.js`.
6. **Optional GIFs.** Create a free app at [developers.giphy.com](https://developers.giphy.com) and paste the key into `GIPHY_KEY`.
7. **Publish.** Push to `main`. GitHub Actions builds and deploys to Pages. One-time setup: in the repo, go to *Settings → Pages → Source* and pick **GitHub Actions**.

Everything stays on free tiers. Photos are compressed in the browser and stored in Firestore, so you don't need Firebase Storage or a billing plan.

Until `firebaseConfig.apiKey` is filled in, the app runs in **demo mode**: fake crew data, saved only in your browser.

## Develop

```bash
npm install
npm run dev
```
