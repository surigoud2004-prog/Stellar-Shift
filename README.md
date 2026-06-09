# Stellar Shift - Cosmic Match 3

This is a high-performance, Next.js 15 match-3 puzzle adventure.

## 🚀 Deployment Protocol

### Build Command
To prepare the application for production, run:
```bash
npm run build
```
This will generate an `out` folder containing the static site.

### First Mission Launch (Push to GitHub)
1. **Initialize & Commit**: 
   ```bash
   git init
   git add .
   git commit -m "Initial mission launch"
   ```
2. **Link and Push**:
   ```bash
   git remote add origin https://github.com/surigoud2004-prog/Stellar-Shift.git
   git branch -M main
   git push -u origin main
   ```

### 🛠️ Troubleshooting "Rejected" Push
If you see an error like `[rejected] main -> main (non-fast-forward)`, it means GitHub has files you don't have. To overwrite GitHub with your local code, run:
```bash
git push -u origin main --force
```

### Subsequent Missions (Update Your Code)
1. **Stage Changes**: `git add .`
2. **Log Changes**: `git commit -m "Update mission parameters"`
3. **Broadcast**: `git push`

## 🌍 Connect to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select **GitHub** and choose the `Stellar-Shift` repository.
4. **Environment Variables**:
   In Netlify under **Site Settings > Build & deploy > Environment variables**, add all variables found in your local `.env` (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
5. **Site Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `out`

## 🛡️ Security Protocol
- **API Keys**: We use `process.env.NEXT_PUBLIC_` variables. You must enter these into the Netlify dashboard for the live site to work.
- **Gitignore**: The `.gitignore` file is configured to prevent your `.env` file from being pushed to public view.
- **Firestore Rules**: Your data is secured by Firebase Security Rules on the server side.

*Mission Readiness: Confirmed.*