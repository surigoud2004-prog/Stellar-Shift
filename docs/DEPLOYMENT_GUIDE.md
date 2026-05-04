# Final Launch Sequence - Stellar Shift (Windows)

If you see a message saying **"found 3 files in public"**, your terminal is ignoring the Next.js engine. Follow these exact steps to fix it:

## 1. Enable the Modern Deployment Engine (Critical)
Run this command in your terminal. This tells Firebase to look for your Next.js project instead of just a folder:
```bash
firebase experiments:enable webframeworks
```

## 2. Update your CLI
Ensure you have the latest version of the tools:
```bash
npm install -g firebase-tools@latest
```

## 3. The Final Launch
Once the experiment is enabled, run the deploy command again:
```bash
firebase deploy
```

### What a successful launch looks like:
- You should see: **"Detected Next.js framework"**.
- It will automatically create a "Firebase App Hosting" backend or a "Cloud Function" for your AI Lore (Server Actions).
- It will take longer than 5 seconds because it's building the AI logic in the cloud.

### Post-Launch Checklist:
1. **Firestore**: Enable in Firebase Console > Build > Firestore.
2. **Auth**: Enable **Anonymous** in Firebase Console > Build > Authentication.

*Mission control is standing by. The stars are waiting.*
