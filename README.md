# ထွန်းဆန်ဆိုင် — Stock Availability App

A rice business stock and payment management app built with React + Vite + Firebase.

---

## Step 1 — GitHub Setup

### First time
```bash
git init
git add .
git commit -m "Initial commit — ထွန်းဆန်ဆိုင် app"
```

Go to https://github.com → New repository → name it `thun-rice-shop`

```bash
git remote add origin https://github.com/YOUR_USERNAME/thun-rice-shop.git
git branch -M main
git push -u origin main
```

### After making changes
```bash
git add .
git commit -m "describe your change"
git push
```

> ⚠️ Never commit `.env.local` — it's in `.gitignore` to keep your Firebase keys safe.

---

## Step 2 — Connect Firebase Database

### 2a. Create Firebase project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name: `thun-rice-shop`
3. Disable Google Analytics → **Create project**

### 2b. Add Web App
1. Click **</>** (Web icon) on project overview
2. App nickname: `thun-rice-shop` → **Register app**
3. Copy the config values shown

### 2c. Enable Firestore
1. Left sidebar → **Firestore Database** → **Create database**
2. Choose **Start in test mode**
3. Location: **asia-southeast1 (Singapore)**
4. Click **Enable**

### 2d. Set Firestore security rules
In Firestore → **Rules** tab, paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Click **Publish**.

### 2e. Add your config to the project
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in your Firebase values:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=thun-rice-shop.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=thun-rice-shop
VITE_FIREBASE_STORAGE_BUCKET=thun-rice-shop.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 2f. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:5173 — add a purchase and check Firestore to confirm it saved.

---

## Step 3 — Deploy to Firebase Hosting

### First time setup
```bash
npm install -g firebase-tools
firebase login
```

Open `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual project ID.

### Deploy
```bash
npm run build
firebase deploy
```

Your app will be live at:
```
https://thun-rice-shop.web.app
```

### Set environment variables for production
In Firebase Console → **Hosting** is automatic since we build first.
But you need to add env vars to your build. They are already baked in at build time via `import.meta.env` — as long as `.env.local` exists when you run `npm run build`, it works.

### Re-deploy after changes
```bash
npm run build
firebase deploy
```

---

## Project Structure

```
thun-rice-shop/
├── src/
│   ├── App.jsx              ← Main app (all pages + styles)
│   ├── main.jsx             ← React entry point
│   ├── index.css            ← Global reset
│   └── store/
│       ├── firebase.js      ← Firebase connection
│       └── useStore.js      ← Data store (Firestore)
├── public/
│   └── favicon.svg          ← ထ logo
├── .env.example             ← Copy to .env.local, fill in keys
├── .env.local               ← Your keys (NOT committed to GitHub)
├── .gitignore
├── firebase.json            ← Hosting config
├── .firebaserc              ← Project ID
├── package.json
├── vite.config.js
└── README.md
```

---

## Free Tier Limits (Firebase Spark)

| Resource | Free limit | Estimated usage |
|---|---|---|
| Reads | 50,000 / day | ~500 / day ✓ |
| Writes | 20,000 / day | ~100 / day ✓ |
| Storage | 1 GB | ~10 MB / year ✓ |
| Hosting | 10 GB / month | ✓ |

Well within free limits at 100+ entries/month.
