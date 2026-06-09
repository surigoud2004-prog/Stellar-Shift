# Windows Launch Sequence - Stellar Shift (Spark/Free Plan)

To deploy on the Free Plan, we bypass the "Web Frameworks" feature and deploy the static build directly.

## 1. Preparation
Ensure the "Web Frameworks" experiment is disabled to prevent Blaze plan errors:
```bash
firebase experiments:disable webframeworks
```

## 2. Build the Mission Engine
Generate the static production files (this creates the `out` folder):
```bash
npm run build
```

## 3. Deploy to Hosting & Indexes
Upload the static `out` folder and the Firestore indexes:
```bash
firebase deploy --only hosting,firestore:indexes
```

### Troubleshooting Windows Errors:
- **'next' is not recognized**: Run `npm install` first.
- **Blaze plan required**: Ensure you disabled the experiment in step 1 and are NOT using "source" in firebase.json.
- **Index creation failed**: Ensure you have owner permissions on the Firebase project.

*Mission Readiness: Confirmed.*