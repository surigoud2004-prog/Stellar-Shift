# Stellar Shift - Cosmic Match 3

This is a high-performance, Next.js 15 match-3 puzzle adventure built with ShadCN UI, Tailwind CSS, and Firebase.

## Deployment Status
The application is fully configured for production. 

### Deployment Options:
1. **Studio Publish**: Click the **Publish** button in the Firebase Studio UI for an automated deployment.
2. **Terminal Deployment**: For advanced users, follow the [Terminal Deployment Guide](./docs/DEPLOYMENT_GUIDE.md).

### Required Cloud Activation:
Before the app becomes fully functional, you must:
1. **Enable Firestore**: Build > Firestore Database.
2. **Enable Auth**: Build > Authentication > Sign-in method > Enable **Anonymous**.
3. **Set Up Indexes**: Create a composite index for the `leaderboard` collection (Field: `score`, Order: `Descending`).

## Features
- **Neural Link Gameplay**: Hexagonal match-3 logic with special celestial entities.
- **Global Leaderboard**: Persistent high scores stored in Firestore.
- **Pilot Profiles**: Anonymous authentication with XP and rank progression.
- **Tactical Procurement**: Simulated ad-rewards for coins and mission revives.
- **Cosmic Lore**: AI-generated lore snippets powered by Genkit.

*Authorization Confirmed. Mission Ready.*
