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

## 2. Authentication
Log in to your Firebase account:
```bash
firebase login
```

## 3. Initialize Firebase
Run the following command in your project root:
```bash
firebase init hosting
```

### Prompt Answers:
- **Are you ready to proceed?** `Yes`
- **Which Firebase features do you want to set up?** `Hosting: Configure files for Firebase Hosting...`
- **Project Selection**: `Use an existing project` -> Select `studio-547476889-b1c50`.
- **What do you want to use as your public directory?** Input `out` (This is for static exports).
- **Configure as a single-page app?** `Yes`
- **Set up automatic builds and deploys with GitHub?** `No`
- **File out/index.html already exists. Overwrite?** `No`

## 4. Build and Deploy
Execute the build process and deploy to the cloud:
```bash
# Update next.config.ts to include: output: 'export' if you want static hosting.
# Then run:
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## 5. Post-Deployment Verification
Once the deployment is complete, the CLI will provide a **Hosting URL**.
Example: `https://studio-547476889-b1c50.web.app`

### Troubleshooting
- **403 Errors**: Ensure you have enabled **Firestore** and **Anonymous Auth** in the [Firebase Console](https://console.firebase.google.com/).
- **Missing Data**: Ensure you have created a **Composite Index** in Firestore for the `leaderboard` collection (ordering by `score` descending).

*Mission Authorization: Terminal access confirmed.*