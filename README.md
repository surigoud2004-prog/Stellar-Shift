# Stellar Shift - Cosmic Match 3

This is a high-performance, Next.js 15 match-3 puzzle adventure.

## 🚀 GitHub to Netlify Deployment (Recommended)

Follow these steps to push your code to GitHub and host on Netlify:

1.  **Initialize Git**: 
    ```bash
    git init
    git add .
    git commit -m "Initial mission launch"
    ```
2.  **Create a GitHub Repo**: Go to [GitHub](https://github.com/new) and create a new public repository.
3.  **Link and Push**:
    ```bash
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git branch -M main
    git push -u origin main
    ```
4.  **Connect to Netlify**:
    - Log in to [Netlify](https://app.netlify.com/).
    - Click **"Add new site"** -> **"Import an existing project"**.
    - Select **GitHub** and choose your repository.
    - Netlify will detect the settings from `netlify.toml` automatically.

## 🛡️ Security Protocol (Public Repositories)

- **Firebase API Keys**: These are safe to commit; they identify your project to the client. Security is enforced via **Firestore Security Rules**.
- **Environment Variables**: The `.gitignore` file prevents your `.env` from being pushed. Always add secrets (like AI keys) directly to the Netlify or Firebase Hosting UI.
- **Firestore Rules**: Ensure your production rules restrict write access to authenticated owners only.

## Features
- **Neural Link Gameplay**: Hexagonal match-3 logic.
- **Global Leaderboard**: Persistent high scores stored in Firestore.
- **Cosmic Lore**: High-performance static lore library.

*Mission Readiness: Confirmed.*