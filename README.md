# Stellar Shift - Cosmic Match 3

This is a high-performance, Next.js 15 match-3 puzzle adventure optimized for static deployment on Netlify or Firebase Hosting.

## 🚀 Deployment Protocol

### 1. Build Command
To prepare the application for production, run:
```bash
npm run build
```
This generates an `out` folder containing your static mission files.

### 2. Broadcast to GitHub
If you haven't pushed yet, or have new changes:
1. **Stage**: `git add .`
2. **Commit**: `git commit -m "Final mission readiness"`
3. **Push**: `git push -u origin main`
   *(If you get a rejection error, use `git push -u origin main --force`)*

## 🌍 Connecting to Netlify

1. **New Site**: Log in to [Netlify](https://app.netlify.com/) and click **"Add new site"** -> **"Import an existing project"**.
2. **Select Repo**: Connect your GitHub and select the `Stellar-Shift` repository.
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `out`
4. **CRITICAL: Environment Variables**:
   In Netlify under **Site Settings > Build & deploy > Environment variables**, you MUST add the following from your `.env`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🛡️ Security & Performance
- **Static Export**: The app uses `output: 'export'` for maximum speed and compatibility.
- **Mock Lore**: AI features are simulated locally to keep the app functional on the Firebase Spark (Free) plan.
- **CSP**: `netlify.toml` is pre-configured with security headers to protect your neural link.

*Mission Status: Ready for Deployment.*