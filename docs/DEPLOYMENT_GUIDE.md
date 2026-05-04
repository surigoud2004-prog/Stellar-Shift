# Terminal Deployment Guide (Windows Optimized)

Follow these steps to deploy **Stellar Shift** to Firebase Hosting from your local terminal.

## 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **NPM** (comes with Node.js)
- **Firebase CLI**: `npm install -g firebase-tools`

## 2. Local Setup (CRITICAL)
If you just downloaded the project or are in a new folder, you MUST install the libraries:
```bash
# 1. Navigate to your project folder
cd "C:\Users\Admin\Downloads\project (1)"

# 2. Install required engines (Do this once)
npm install
```

## 3. Build the Mission
Execute the production build process.
```bash
# Generate the 'out' directory for Firebase
npm run build
```

## 4. Authentication
Log in to your Firebase account:
```bash
firebase login
```

## 5. Deployment
Deploy to the cloud.
```bash
# Deploy to Firebase Hosting
firebase deploy
```

## Troubleshooting
- **'next' is not recognized**: You missed the `npm install` step.
- **Permission errors**: Run your terminal as an **Administrator**.
- **Directory issues**: Use `dir` to verify `package.json` is visible in your current folder.