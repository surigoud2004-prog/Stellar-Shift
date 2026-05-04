# Launch Sequence - Stellar Shift (Spark Plan / Static)

To stay on the **Free (Spark) Plan**, we use a manual static deployment process. This bypasses the need for paid Cloud Build APIs.

## 1. Disable Framework Detection
Ensure your terminal isn't trying to use the paid "Web Frameworks" feature:
```bash
firebase experiments:disable webframeworks
```

## 2. Generate Static Mission Engine
This command creates the `out` folder containing your entire game logic.
```bash
npm run build
```

## 3. Deploy to Hosting
Upload the static `out` folder directly:
```bash
firebase deploy --only hosting
```

### Why this works:
- **No Cloud Functions**: We avoid triggering the Blaze plan requirement by not using server-side rendering.
- **Static Export**: The `out` folder contains the compiled HTML/JS/CSS, which is free to host.
- **Mock Lore**: AI features are handled by our local immersive lore library.

*Authorization Confirmed. Deploy when ready.*