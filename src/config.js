// ─────────────────────────────────────────────────────────────
//  STUDY TOGETHER · settings you edit
// ─────────────────────────────────────────────────────────────

// 1) Paste your Firebase web config here (Firebase console → Project settings → Your apps → Web).
//    These values are public by design; your Firestore rules are what protect the data.
//    Leave apiKey empty to run in DEMO mode (data stays in this browser only).
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

// 2) The crew. Their nicknames, colours and portraits are set automatically.
//    Anyone with a Google account can sign in while OPEN_SIGNUP is true.
export const CREW = [
  { email: 'pankqx@gmail.com', nick: 'Pank', tagline: 'Still levelling up, one problem a day.', tracks: ['fe', 'be', 'db', 'de', 'ai', 'dsa'] },
  { email: 'ravi@example.com', nick: 'Ravi', tagline: 'The genius. Probably finished the roadmap already.', tracks: ['fe', 'be', 'db', 'de', 'ai', 'dsa'] },
  { email: 'merel@example.com', nick: 'Merel', tagline: 'Creative, bold and a little bit crazy.', tracks: ['cloud', 'dm', 'dsa'] },
]

// 3) Optional: free GIPHY API key (developers.giphy.com) to enable GIFs in chat.
export const GIPHY_KEY = ''

// 4) Where your DSA practice lives.
export const PRONTOPY_URL = 'https://python-dsa-sigma.vercel.app/' // ProntoPy (beta)

export const OPEN_SIGNUP = true

export const DEMO = !firebaseConfig.apiKey
