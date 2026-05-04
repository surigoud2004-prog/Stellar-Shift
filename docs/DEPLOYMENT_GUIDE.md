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
If you haven't initialized Firebase in this project directory yet, run:
```bash
firebase init hosting
```
- **Project Selection**: Choose `Use an existing project` and select `studio-547476889-b1c50`.
- **Framework Detection**: The CLI should detect Next.js. Accept the default settings.
- **GitHub Actions**: Choose `No` unless you want to set up CI/CD.

## 4. Build and Deploy
Execute the build process and deploy to the cloud:
```bash
# Build the production application
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
