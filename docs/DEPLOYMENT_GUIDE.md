
# Terminal Deployment Guide (Windows Optimized)

Follow these steps to deploy **Stellar Shift** to Firebase. Because this app uses Genkit AI, it requires a server-side environment (Firebase App Hosting or Web Frameworks).

## 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **NPM** (comes with Node.js)
- **Firebase CLI**: `npm install -g firebase-tools`

## 2. Local Setup (Windows Commands)
Open your terminal in `C:\Users\Admin\Downloads\project (1)` and run:

```bash
# 1. Install all mission engines (Required first time)
npm install

# 2. Build the production application
npm run build
```

## 3. Deployment
Deploy to the cloud.

### Option A: Firebase App Hosting (Recommended for Next.js + AI)
This is the most modern way to host Next.js apps with Server Actions.
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **App Hosting** and click **Get Started**.
3. Connect your GitHub repository.

### Option B: Firebase CLI (Legacy Hosting)
If you prefer the terminal:
```bash
# 1. Log in
firebase login

# 2. Initialize (Only if first time)
# Select 'Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys'
# When asked for public directory, use '.next' or let it auto-detect Next.js.
firebase init hosting

# 3. Deploy
firebase deploy
```

## Troubleshooting
- **Server Actions Error**: This is now resolved by removing `output: 'export'`.
- **'next' is not recognized**: You must run `npm install` before building.
- **Permission errors**: Run your terminal as an **Administrator**.
```