
# Terminal Deployment Guide (Windows Optimized)

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
# Example: if you downloaded it to Downloads
cd C:\Users\Admin\Downloads\project
```

## 3. Authentication
Log in to your Firebase account:
```bash
firebase login
```

## 4. Initialize Firebase (One-time setup)
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
Execute the build process and deploy to the cloud.
```bash
# 1. Generate the 'out' directory
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy
```

## 6. Post-Deployment Verification
Once the deployment is complete, the CLI will provide a **Hosting URL**.
Example: `https://studio-547476889-b1c50.web.app`

### Troubleshooting Windows Errors
- **NODE_ENV error**: I have fixed this in your `package.json`. Just run `npm run build`.
- **Command not found**: Ensure you have installed the Firebase CLI globally (`npm install -g firebase-tools`).
- **Permission errors**: Try running your terminal as an **Administrator**.
- **Images Not Loading**: Next.js 15 static export requires `images: { unoptimized: true }` which is already set in your `next.config.ts`.
