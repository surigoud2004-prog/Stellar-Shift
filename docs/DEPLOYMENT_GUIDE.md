
# Launch Sequence - Stellar Shift (Spark Plan / Static)

Since you are using the **Spark (Free) Plan**, we have configured the app for **Static Export**.

## 1. Clean and Build
Run these commands to ensure a fresh, static build of the project:
```bash
# Delete old build folders if they exist (Windows)
rmdir /s /q out .next

# Install and build
npm install
npm run build
```

## 2. Deploy to Hosting
Since the app is now static, we only need to upload the `out` folder:
```bash
firebase deploy --only hosting
```

### Why this works:
- **No Cloud Functions**: We removed the "Server Actions" and AI flows that required a paid plan.
- **Static Export**: The `out` folder contains the entire game logic, which runs 100% in the player's browser.
- **Mock Lore**: Lore snippets are now pulled from a curated local library instead of a live AI server.

*Authorization Confirmed. Deploy when ready.*
