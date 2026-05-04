
# Terminal Deployment Guide

Follow these steps to deploy **Stellar Shift** to Firebase Hosting from your local terminal.

## 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **NPM** (comes with Node.js)
- **Firebase CLI**: Install it globally using:
  ```bash
  npm install -g firebase-tools
  ```

## 2. Navigate to Project Root
**CRITICAL:** Your terminal must be in the folder containing `package.json`.
If you see an "ENOENT" error, you are in the wrong directory. Use the `cd` command to enter your project folder:
```bash
cd path/to/stellar-shift
```

## 3. Authentication
Log in to your Firebase account:
```bash
firebase login
```

## 4. Initialize Firebase
Run the following command in your project root:
```bash
firebase init hosting
```

### Prompt Answers:
- **Are you ready to proceed?** `Yes`
- **Which Firebase features do you want to set up?** `Hosting: Configure files for Firebase Hosting...`
- **Project Selection**: `Use an existing project` -> Select `studio-547476889-b1c50`.
- **What do you want to use as your public directory?** Input `out` (This folder is created by `npm run build`).
- **Configure as a single-page app?** `Yes`
- **Set up automatic builds and deploys with GitHub?** `No`
- **File out/index.html already exists. Overwrite?** `No`

## 5. Build and Deploy
Execute the build process and deploy to the cloud:
```bash
# Generate the 'out' directory
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## 6. Post-Deployment Verification
Once the deployment is complete, the CLI will provide a **Hosting URL**.
Example: `https://studio-547476889-b1c50.web.app`

### Troubleshooting
- **ENOENT Error**: You are running commands in the wrong folder. Make sure you see `package.json` when you type `dir` (Windows) or `ls` (Mac/Linux).
- **Images Not Loading**: Ensure `next.config.ts` has `images: { unoptimized: true }` for static exports.
- **403 Errors**: Ensure you have enabled **Firestore** and **Anonymous Auth** in the [Firebase Console](https://console.firebase.google.com/).
