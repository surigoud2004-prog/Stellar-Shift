# Launch Sequence - Stellar Shift (Spark Plan / Static)

To stay on the **Free (Spark) Plan**, we use a manual static deployment process. This bypasses the need for paid Cloud Build APIs.

## 1. Clean and Build
This command generates the `out` folder containing your entire game logic.
```bash
# Windows (PowerShell or CMD)
npm run build
```

## 2. Disable Automatic Framework Detection
If you previously enabled `webframeworks`, turn it off to prevent the CLI from trying to use paid features:
```bash
firebase experiments:disable webframeworks
```

## 3. Deploy to Hosting
Upload the static `out` folder directly:
```bash
firebase deploy --only hosting
```

### Why this works:
- **No Cloud Functions**: We avoid triggering the Blaze plan requirement by not using SSR.
- **Static Export**: The `out` folder contains the compiled HTML/JS/CSS, which is free to host.
- **Mock Lore**: AI features are handled by our local immersive lore library.

*Authorization Confirmed. Deploy when ready.*