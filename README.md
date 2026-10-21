# Armaan Kaushik Portfolio

## Requirements
- Node.js 22 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```bash
npm run build
```

## Render Node service
The Render service serves `dist/` and provides the existing admin/content/media endpoints backed by PostgreSQL. The Netlify Functions remain available for Netlify deployments.

Configure these environment variables in Render:
- `DATABASE_URL`: Supabase PostgreSQL connection URI. Supabase hosts use TLS; localhost URLs use plain connections.
- `DATABASE_CA` (optional): PEM CA certificate for strict database TLS certificate verification.
- `ADMIN_PASSWORD`: a strong admin password.
- `ADMIN_TOKEN_SECRET`: a separate, long random secret used to sign admin tokens.
- `NODE_VERSION`: `22`.

For a local Windows Command Prompt run, set the environment values for the current terminal (use your own credentials; do not commit them):
```cmd
set DATABASE_URL=postgresql://USER:PERCENT_ENCODED_PASSWORD@HOST:5432/DATABASE?sslmode=require
set ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
set ADMIN_TOKEN_SECRET=YOUR_LONG_RANDOM_SECRET
npm run build
npm start
```
The service listens on `http://localhost:3000`; `/healthz` is its health check. Tables are created automatically on startup. `npm start` runs `node server`, which loads the compiled server bundle from `server/dist/`.

### Backend manual test checklist
- Log in at `/admin`; verify an incorrect password is rejected and a correct password grants access.
- Edit and save content, then restore an earlier version and verify the public page reflects it.
- Upload JPEG, PNG, WebP, and PDF files; verify they can be read back.
- Rename an `.exe` to an allowed image/PDF extension and verify the upload is rejected.
- Call an admin endpoint without a Bearer token and verify it returns `401`.
- Restart the service and verify saved content, history, and uploaded media remain available.

## Personalize
Update placeholders in `src/data/content.ts`. To add a resume, put the PDF at `public/resume.pdf` and set `resumeUrl: '/resume.pdf'` in the content configuration.

The project source files were assembled from the supplied text export. Run `npm run build` locally to verify the installation and TypeScript build.
