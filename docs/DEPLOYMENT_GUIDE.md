# Windows Deployment Guide - Stellar Shift

Your build is successful! To fix the "1 file found" issue and enable AI features, follow these final steps:

## 1. Reset Configuration
Ensure your `firebase.json` matches the new version I just provided. It should use `"source": "."` instead of `"public": "out"`.

## 2. Clean Up
Delete the `out` folder on your computer if it exists. This ensures the CLI doesn't get confused by old static files.

## 3. Final Launch Command
Run this command in your terminal:
```bash
firebase deploy
```
*Note: If prompted to "initialize a new codebase", say **Yes**. If asked for a "public directory", just press **Enter** (it will be ignored in favor of the Next.js detection).*

## 4. Required Cloud Activation
If the app loads but scores don't save or AI lore doesn't appear, ensure you have:
1. **Firestore Enabled**: In Firebase Console > Build > Firestore Database.
2. **Anonymous Auth Enabled**: In Firebase Console > Build > Authentication > Sign-in method.

*Mission complete. The stars are yours.*