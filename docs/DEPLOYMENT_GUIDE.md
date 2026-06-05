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

## 3. Deploy to Hosting
Upload the static `out` folder directly to Firebase:
```bash
firebase deploy --only hosting
```

### Troubleshooting Windows Errors:
- **'next' is not recognized**: Run `npm install` first.
- **Blaze plan required**: Ensure `firebase.json` has `"public": "out"` and you disabled the experiment in step 1.
- **Found 3 files in public**: Ensure you ran `npm run build` and your `firebase.json` points to `out`.

*Mission Readiness: Confirmed.*