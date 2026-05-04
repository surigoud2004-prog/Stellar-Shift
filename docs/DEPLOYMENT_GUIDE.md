# Windows Deployment Guide - Stellar Shift

Your build is successful! To fix the issue where only "3 files" are found and enable AI features, follow these final steps:

## 1. Update your CLI (Critical)
The Next.js 15 integration requires the latest version of the Firebase tools. Run this command first:
```bash
npm install -g firebase-tools@latest
```

## 2. Enable Experimental Frameworks
If the CLI still doesn't detect Next.js, run this command to turn on the modern deployment engine:
```bash
firebase experiments:enable webframeworks
```

## 3. Final Launch Command
Run this command in your terminal:
```bash
firebase deploy
```

### What to expect:
- You should see a message saying **"Detected Next.js framework"**.
- It will automatically run the build and create a Cloud Function for your AI Lore (Server Actions).
- If prompted to "initialize a new codebase", say **Yes**.

## 4. Required Cloud Activation
Once live, ensure you have:
1. **Firestore Enabled**: In Firebase Console > Build > Firestore Database.
2. **Anonymous Auth Enabled**: In Firebase Console > Build > Authentication > Sign-in method.

*Mission complete. The stars are yours.*