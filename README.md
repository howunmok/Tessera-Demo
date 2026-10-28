# Tessera — digital business cards

Create polished digital business cards, share them with a styled QR code, and let people save your contact in one tap, with no app required.

## Features

- **Sign in with Google, or with an email and password.**
- **Multiple cards per account:** each card gets its own public link (`/c/your-name`).
- **Editor with live preview and autosave:**
  - profile details: name, job title, company, department, phone numbers, email, office address, short bio and a licence or credential line;
  - a profile photo and company logo, both cropped and compressed in the browser.
- **Unlimited links,** with automatic brand icons, drag-to-reorder and show/hide.
- **Design options:**
  - three templates: Modern Minimal, Corporate Classic and Bold Gradient;
  - palettes, accent and cover colors, or a cover photo;
  - light/dark mode and three font pairings.

  Text contrast is kept at WCAG AA automatically.

- **Styled QR codes:**
  - dot and corner styles, a gradient, and a center logo, which switches to high error correction (H) so the code still scans;
  - a scan-reliability check;
  - PNG and SVG downloads.
- **Public card page:**
  - tap to call, email or get directions;
  - **Save contact** downloads a vCard 3.0 with your photo and links;
  - a share button, and a QR for sharing in person.
- **Export and print:**
  - the card as a PNG;
  - a standard 3.5″ × 2″ business card, front and back, as 300 DPI PNGs;
  - printing a single card, or a sheet of 10 for Avery 8371 / 5371.
- **Link previews:** WhatsApp, LinkedIn, iMessage and similar apps show each card's name and photo (via Netlify Edge Functions).

Built with Vite, React 19, TypeScript (strict), Tailwind CSS v4, react-router, react-hook-form + zod, and Firebase on the free **Spark** plan (Authentication + Firestore).

---

## 1. Run it locally

Requirements: **Node.js 22.22 or newer**.

```bash
npm install
npm run dev          # http://localhost:5173
```

Until `.env` is filled in, the app shows a setup screen listing the missing values. Continue with step 2.

## 2. Set up Firebase

The full step-by-step guide is in **[docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)**. In short:

1. **Create a project** at <https://console.firebase.google.com> on the Spark plan. Analytics is optional.
2. **Register a web app** and copy its config into `.env`. The template is [`.env.example`](.env.example).
3. **Authentication → Sign-in method:** turn on **Google** (choose a project support email) and **Email/Password**.
4. **Firestore Database → Create database:** choose the Standard edition, keep the `(default)` database ID, pick a location near your visitors, and start in production mode.
5. **Publish the security rules** in [`firestore.rules`](firestore.rules). Either paste them into **Firestore → Rules → Publish**, or use the CLI:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules      # project ID comes from .firebaserc
   ```

6. **Check the rules** against your real project. This creates and then removes one test card and a temporary second account:

   ```bash
   TEST_EMAIL=you@example.com TEST_PASSWORD=yourpassword npm run check:rules
   ```

   All checks should pass. On Windows PowerShell, set the variables first:
   `$env:TEST_EMAIL='…'; $env:TEST_PASSWORD='…'; npm run check:rules`

## 3. Deploy

The app is a static site, so any static host works. Two are already set up.

### Option A: Netlify (recommended)

Push to GitHub, import the repository in Netlify, and add your `.env` values as environment variables. [`netlify.toml`](netlify.toml) already contains the build settings, the single-page-app rewrite, security headers and the link-preview edge functions. Step by step: **[docs/DEPLOY_NETLIFY.md](docs/DEPLOY_NETLIFY.md)**.

### Option B: Firebase Hosting

[`firebase.json`](firebase.json) is configured for the same build, with rewrites and security headers included:

```bash
npm run build
firebase deploy --only hosting               # or: firebase deploy (rules + hosting)
```

Your site is then live at `https://<project-id>.web.app`. The per-card link previews use Netlify Edge Functions, so on Firebase Hosting previews show the site-wide defaults instead.

### After deploying (either host)

- **Authentication → Settings → Authorized domains:** add your site's domain. “Continue with Google” and password-reset links only work on approved domains.
- **`VITE_PUBLIC_BASE_URL`:** set it to your final address **before printing QR codes**, because every code contains it.

## Configuration

All settings live in `.env` locally, or in your host's environment variables once deployed.

| Variable               | Purpose                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `VITE_APP_NAME`        | App name in the header, page titles and link previews                          |
| `VITE_PUBLIC_BASE_URL` | Public address that QR codes and links use, e.g. `https://card.yourdomain.com` |
| `VITE_BASE_PATH`       | Sub-path to serve from, e.g. `/card/`; leave empty for the domain root         |
| `VITE_FIREBASE_*`      | Your Firebase web app config (public by design; the rules protect the data)    |

## Scripts

| Command               | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `npm run dev`         | Dev server with hot reload                                          |
| `npm run build`       | Type-check and build for production into `dist/`                    |
| `npm run preview`     | Serve the production build locally                                  |
| `npm run typecheck`   | TypeScript only (app, Vite config and Netlify functions)            |
| `npm run lint`        | ESLint with type-aware rules (`lint:fix` to auto-fix)               |
| `npm run format`      | Prettier (`format:check` to verify)                                 |
| `npm run check:rules` | Check the published Firestore rules against your project (step 2.6) |

## How it works

### Data model (Firestore)

```
cards/{cardId}   ownerUid, slug, label, profile{…}, photo, logo, cover,
                 links[{id, type, label, url, visible, order}], theme{…}, qr{…},
                 schemaVersion, createdAt, updatedAt
slugs/{slug}     { cardId, ownerUid }: reserves a public link for exactly one card
```

- **Images are stored inside the card.** Cloud Storage isn't available on the Spark plan, so the photo (about 400 px), logo (about 300 px) and cover (about 1200 × 400) are cropped and compressed in the browser to WebP under 100 KB each, then stored as data URLs. A full card stays well under Firestore's 1 MB document limit.
- **A card and its slug are always written together, in one batch.** Creating a card claims its slug, changing the link claims the new slug and releases the old one, and deleting a card releases its slug.
- **The schemas are the single source of truth** ([`src/schemas/card.ts`](src/schemas/card.ts)). TypeScript types are inferred from them, forms validate with them, and every card read from Firestore is checked against them, so a malformed link is dropped rather than displayed.
- **Ready for Apple Wallet later:** profile, links, theme and QR settings are kept separate, so a Wallet pass can be added without migrating existing cards.

### Security

- **Firestore rules ([`firestore.rules`](firestore.rules)):**
  - Anyone can read a single card (that's the public page), but nobody can list or scrape all cards.
  - Only a card's owner can create, edit or delete it.
  - Field types, allowed values and sizes are all validated.
  - A slug can be claimed only once and stays tied to its card.

  Verify them with `npm run check:rules`.

- **Links** are normalized and validated, and only `http(s)` links are ever made clickable, so a `javascript:` link can't run.
- **Content Security Policy** (in `netlify.toml` and `firebase.json`): browsers only run the app's own scripts (plus Google's sign-in loader, for the Google pop-up) and only talk to Firestore and Firebase Auth. If you add another service, add its domain to `connect-src`.
- **Public cards are marked `noindex`.** They contain phone numbers and emails, so search engines are asked not to list them.

### Project structure

```
src/
├─ components/
│  ├─ card/        CardRenderer, the three templates, shared parts, theme variables
│  ├─ editor/      the editor: tabs, sections, preview, image cropper, links, QR panel
│  ├─ dashboard/   card tiles, create and delete dialogs
│  ├─ public/      public card page pieces (share, QR dialog)
│  ├─ print/       3.5 × 2 in business card (front and back)
│  ├─ qr/          QR rendering and download
│  ├─ links/       brand icons
│  ├─ layout/      app shell, route guards
│  └─ ui/          buttons, fields, dialogs, pickers…
├─ config/         app name/URLs, defaults, palettes, templates and fonts
├─ hooks/          auth, autosave, slug availability, page meta…
├─ lib/firebase/   app, auth and Firestore (cards + slugs)
├─ pages/          route components (lazy-loaded)
├─ schemas/        zod schemas, the source of truth for card data
├─ styles/         Tailwind theme tokens
├─ types/          TypeScript types inferred from the schemas
└─ utils/          links, colors and contrast, images, vCard, QR, export…
netlify/           edge functions for link previews (Netlify only)
scripts/           check-rules.mjs: checks the security rules against your project
firestore.rules    Firestore security rules
```

## Free-plan notes

- **Firebase Spark:** 50,000 reads and 20,000 writes per day. Each public card view costs 2 reads. The editor saves only after you pause typing, and uploads only the parts that changed.
- **Netlify free plan:** a monthly credit allowance. The link-preview functions only run when a preview bot fetches a card link. To turn them off, delete their two blocks in `netlify.toml`.

## Troubleshooting

| What you see                                       | Fix                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| "Connect your Firebase project" screen             | Fill in `.env`, then restart `npm run dev`                                                         |
| "Missing or insufficient permissions" when saving  | Publish the latest `firestore.rules`, then run `npm run check:rules`                               |
| Google or password-reset errors on your own domain | Add the domain under Authentication → Settings → Authorized domains                                |
| “Your browser blocked the Google sign-in window”   | Allow pop-ups for the site, then click “Continue with Google” again                                |
| “This sign-in method isn’t enabled…”               | Turn on Google (or Email/Password) under Authentication → Sign-in method                           |
| QR codes open `localhost`                          | Download them from your deployed site, or set `VITE_PUBLIC_BASE_URL`                               |
| Printed cards are the wrong size                   | Print at 100% scale ("Actual size") with "Background graphics" turned on                           |
| Link previews show the default text                | See [docs/DEPLOY_NETLIFY.md](docs/DEPLOY_NETLIFY.md), step 6 (and refresh the app's preview cache) |

More help: [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) and [docs/DEPLOY_NETLIFY.md](docs/DEPLOY_NETLIFY.md).
