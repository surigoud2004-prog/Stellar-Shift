# Stellar Shift - Cosmic Match 3

This is a high-performance, Next.js 15 match-3 puzzle adventure.

## 💻 How to open Command Prompt
If you closed your terminal:
1. Open your project folder (`C:\Users\Admin\Downloads\project`) in Windows File Explorer.
2. Click the **Address Bar** at the top (where the folder path is).
3. Type **`cmd`** and press **Enter**.

## 🚀 GitHub to Netlify Deployment (Recommended)

Run these exact commands in your terminal to push your code:

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
3.  **Connect to Netlify**:
    - Log in to [Netlify](https://app.netlify.com/).
    - Click **"Add new site"** -> **"Import an existing project"**.
    - Select **GitHub** and choose the `Stellar-Shift` repository.

## 🛡️ Security Protocol (Public Repositories)

- **Firebase API Keys**: These are safe to commit; they identify your project to the client. Security is enforced via **Firestore Security Rules**.
- **Environment Variables**: The `.gitignore` file prevents your `.env` from being pushed.
- **Static Mode**: This build uses a static lore library to ensure compatibility with free hosting tiers.

*Mission Readiness: Confirmed.*