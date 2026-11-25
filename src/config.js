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

// 2) The crew. Only these Google accounts can sign in. Order = colour order.
export const CREW = [
  { email: 'pankqx@gmail.com', nick: 'Pank' },
  { email: 'friend1@gmail.com', nick: 'Friend 1' },
  { email: 'friend2@gmail.com', nick: 'Friend 2' },
]

// 3) Optional: free GIPHY API key (developers.giphy.com) to enable GIFs in chat.
export const GIPHY_KEY = ''

// 4) Where your DSA practice lives.
export const PRONTOPY_URL = 'https://pankqx.github.io/pythondsa/'

export const DEMO = !firebaseConfig.apiKey
