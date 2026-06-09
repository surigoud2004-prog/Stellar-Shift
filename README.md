# Stellar Shift - Cosmic Match 3

This is a high-performance, Next.js 15 match-3 puzzle adventure.

## 🚀 Deployment Protocol

### Build Command
To prepare the application for production, run:
```bash
npm run build
```
This will generate an `out` folder containing the static site.

### First Mission Launch (Initial Push)
Run these exact commands in your terminal to push your code for the first time:

1.  **Initialize & Commit**: 
    ```bash
    git init
    git add .
    git commit -m "Initial mission launch"
    ```
2.  **Link and Push**:
    ```bash
    git remote add origin https://github.com/surigoud2004-prog/Stellar-Shift.git
    git branch -M main
    git push -u origin main
    ```

### Subsequent Missions (Update Your Code)
Whenever you make changes and want to update GitHub/Netlify, run these 3 commands:

1.  **Stage Changes**: `git add .`
2.  **Log Changes**: `git commit -m "Updated sector features"` (replace with your own message)
3.  **Broadcast**: `git push`

## 🌍 Connect to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select **GitHub** and choose the `Stellar-Shift` repository.
4. **Site Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `out`
5. Netlify will automatically detect these settings from your `netlify.toml` and deploy.

## 🛡️ Security Protocol (Public Repositories)

- **Firebase API Keys**: These are safe to commit; they identify your project to the client. Security is enforced via **Firestore Security Rules**.
- **Environment Variables**: The `.gitignore` file prevents your `.env` from being pushed.
- **Static Mode**: This build uses a static lore library to ensure compatibility with free hosting tiers.

*Mission Readiness: Confirmed.*