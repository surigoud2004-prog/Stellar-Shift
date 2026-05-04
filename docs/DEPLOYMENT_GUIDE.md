
# Terminal Deployment Guide (Windows Optimized)

Follow these steps to deploy **Stellar Shift** to Firebase. Because this app uses Genkit AI, it requires a server-side environment (Firebase App Hosting or Web Frameworks).

## 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **NPM** (comes with Node.js)
- **Firebase CLI**: `npm install -g firebase-tools`

## 2. Local Setup (Windows Commands)
Open your terminal in your project directory and run:

```bash
# 1. Install all mission engines (Required first time)
npm install

# 2. Build the production application (SUCCESS CONFIRMED)
npm run build
```

## 3. Final Deployment
Push your project to the live servers.

### Option A: Firebase CLI (Direct Launch)
Run these commands in order:
```bash
# 1. Log in to your Firebase account
firebase login

# 2. Launch the mission!
firebase deploy
```

### Option B: Firebase App Hosting (Auto-Deploy)
This is the most modern way to host Next.js apps.
1. Go to the [Firebase Console](https://console.firebase.google.com/project/studio-547476889-b1c50/apphosting).
2. Click **Get Started**.
3. Connect your GitHub repository and it will deploy automatically whenever you push code.

## Troubleshooting
- **'firebase' is not recognized**: Run `npm install -g firebase-tools` then restart your terminal.
- **Permission errors**: Run your terminal as an **Administrator**.
