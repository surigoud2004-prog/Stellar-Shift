# Stellar Shift - Cosmic Match 3

This is a high-performance, Next.js 15 match-3 puzzle adventure built with ShadCN UI, Tailwind CSS, and Firebase.

## Deployment Status
The application is configured for **Netlify** or **Firebase Static Hosting**.

### Netlify Launch Sequence:
1. **Build Locally**: 
   ```bash
   npm run build
   ```
2. **Deploy to Netlify**:
   - Install CLI: `npm install -g netlify-cli`
   - Login: `netlify login`
   - Deploy: `netlify deploy --prod --dir=out`

### Firebase (Free Plan) Sequence:
1. Disable experiment: `firebase experiments:disable webframeworks`
2. Build: `npm run build`
3. Deploy: `firebase deploy --only hosting`

## Features
- **Neural Link Gameplay**: Hexagonal match-3 logic with special celestial entities.
- **Global Leaderboard**: Persistent high scores stored in Firestore.
- **Pilot Profiles**: Anonymous authentication with XP and rank progression.
- **Tactical Procurement**: Simulated ad-rewards for coins and mission revives.
- **Cosmic Lore**: High-performance static lore library.

*Authorization Confirmed. Mission Ready.*