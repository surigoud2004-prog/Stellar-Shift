# Final Launch Sequence - Stellar Shift (Windows)

If you see a message saying **"found 3 files in public"**, your terminal is ignoring the Next.js engine. Follow these exact steps to fix it:

## 1. Enable the Modern Deployment Engine (Critical)
Run this command in your terminal. This tells Firebase to look for your Next.js project instead of just a folder:
```bash
firebase experiments:enable webframeworks
```

## 2. Verify your Configuration
Ensure your `firebase.json` looks exactly like this. Do NOT run `firebase init` again, as it might overwrite this:
```json
{
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1"
    }
  }
}
```

## 3. The Final Launch
Run the deploy command again:
```bash
firebase deploy
```

### What a successful launch looks like:
- You should see: **"Detected Next.js framework"**.
- It will automatically create a Cloud Function to handle your AI Lore (Server Actions).
- The deployment will take 2-4 minutes because it is building your application in the cloud.

### Post-Launch Checklist:
1. **Firestore**: Enable in Firebase Console > Build > Firestore.
2. **Auth**: Enable **Anonymous** in Firebase Console > Build > Authentication.

*Mission control is standing by. The stars are waiting.*