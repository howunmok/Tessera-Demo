# Deploying to Netlify

The app is a static site, so Netlify only builds and serves it. Your data, sign-in and security rules stay in Firebase. Build settings are already in [`netlify.toml`](../netlify.toml):

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node.js version:** 24
- **Single-page-app rewrite:** without it, opening `/c/your-name` from a QR code would show Netlify's 404 page.
- **Security and caching headers**

## 1. Create the site

1. Push the project to GitHub. `.env` is git-ignored, so your keys don't go to GitHub.
2. In Netlify, choose **Add new site → Import an existing project → GitHub**, and select the repository.
3. Netlify picks up the build settings from `netlify.toml`. Leave them as they are.

## 2. Add the environment variables

Netlify doesn't read your local `.env`. Go to **Site configuration → Environment variables** and add each variable from your `.env` with the same value:

| Variable                            | Value                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `VITE_APP_NAME`                     | e.g. `Tessera`                                                         |
| `VITE_PUBLIC_BASE_URL`              | Your site's address, e.g. `https://your-site.netlify.app` (see step 4) |
| `VITE_FIREBASE_API_KEY`             | from `.env`                                                            |
| `VITE_FIREBASE_AUTH_DOMAIN`         | from `.env`                                                            |
| `VITE_FIREBASE_PROJECT_ID`          | from `.env`                                                            |
| `VITE_FIREBASE_STORAGE_BUCKET`      | from `.env`                                                            |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from `.env`                                                            |
| `VITE_FIREBASE_APP_ID`              | from `.env`                                                            |

Leave `VITE_BASE_PATH` out unless you serve the app from a sub-path.

Keep each variable's **scope** set to include **Functions** (the default, "All scopes", does). The link-preview edge functions read `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, `VITE_APP_NAME` and `VITE_PUBLIC_BASE_URL` at runtime. See step 6.

> **Don't tick "Contains secret values"** for these variables. Firebase web config is public by design: it's included in the JavaScript every visitor downloads. Marking it secret makes Netlify's secret scanning fail the build.
>
> If the build still fails with a **"secrets detected"** message pointing at the Firebase API key, add one more variable: `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES`, set to your API key value. This tells Netlify's smart detection that this value is expected in the output.

Then trigger a deploy (**Deploys → Trigger deploy**).

## 3. Allow the domain in Firebase

In the Firebase console, go to **Authentication → Settings → Authorized domains → Add domain**, and add your Netlify domain, e.g. `your-site.netlify.app` (no `https://`).

**Without this, "Continue with Google" fails on your live site** with an "unauthorized domain" error, and password-reset links won't work either. If you rename the site or add a custom domain later, add the new domain too.

## 4. QR codes and your domain

Each QR code contains `VITE_PUBLIC_BASE_URL` + `/c/<slug>`. That address is baked into every code you print, so:

- **Decide on the final address before printing.** Set `VITE_PUBLIC_BASE_URL` to it in Netlify, then redeploy.
- **Don't rename the Netlify site** after printing. Renaming changes `your-site.netlify.app`, and printed codes stop working.
- **Adding a custom domain later is safe.** Once a custom domain is the site's primary domain, Netlify redirects the `netlify.app` address to it, so codes already printed keep working. Remember to add the new domain to Firebase's authorized domains (step 3) and update `VITE_PUBLIC_BASE_URL`.
- **A sub-path of an existing website** (e.g. `yourdomain.com/card`) is possible if that website is also on Netlify. Add a proxy rewrite on the main site from `/card/*` to this site with status `200`, set `VITE_BASE_PATH=/card/` here, and set `VITE_PUBLIC_BASE_URL=https://yourdomain.com/card`.

## 5. Security rules

Netlify doesn't touch Firestore. Rule changes are still published through Firebase. See [FIREBASE_SETUP.md, step 5](FIREBASE_SETUP.md#5-publish-the-security-rules).

The `hosting` section in `firebase.json` is only used if you deploy to Firebase Hosting instead. Netlify ignores it.

## 6. Link previews (name and photo in WhatsApp, LinkedIn, iMessage…)

When someone pastes a card link into a chat app, the app's "preview bot" reads the page's tags. These bots don't run JavaScript, so on their own they'd only see the site-wide defaults from `index.html`.

Two small **Netlify Edge Functions** fix this. They're declared at the bottom of [`netlify.toml`](../netlify.toml) and deploy automatically with the site:

| Function       | Path       | What it does                                                                                                   |
| -------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `card-preview` | `/c/*`     | For preview bots only, replaces the page title and preview tags with the card's name, title, bio and photo.    |
| `card-image`   | `/og/name` | Serves the card's profile photo as a real image, because a preview image must be a URL, not stored image data. |

Good to know:

- **Visitors aren't affected.** Real browsers get the normal page, untouched and with no extra delay. The functions only do work for user agents such as `facebookexternalhit`, `WhatsApp` or `LinkedInBot`.
- **They only read public data,** the same single-card read the public page makes. The security rules still block listing cards.
- **Cards stay out of search engines.** Pages carry `noindex`, because they contain phone numbers and emails.
- **If anything goes wrong, previews fall back to the defaults.** That covers missing variables and a slow or unavailable Firestore. The page itself always loads.
- **Usage:** Netlify's free plan is a monthly credit allowance. These functions run only when a bot fetches a card link, so their usage should be tiny. If you'd rather not use them, delete the two `[[edge_functions]]` blocks in `netlify.toml`, and previews show the site-wide defaults.
- **Sub-paths:** if you serve the app from a sub-path (`VITE_BASE_PATH=/card/`), change the two `path` values in `netlify.toml` to `/card/c/*` and `/card/og/*`.

### Check a preview after deploying

- **Facebook / WhatsApp:** paste your card link into the [Sharing Debugger](https://developers.facebook.com/tools/debug/). Its **Scrape Again** button also refreshes a stale preview.
- **LinkedIn:** paste it into the [Post Inspector](https://www.linkedin.com/post-inspector/).
- **Command line:**

  ```bash
  curl -s -A "facebookexternalhit/1.1" https://your-site.netlify.app/c/your-name | grep -E "og:|<title>"
  ```

Apps cache previews, sometimes for days, so after changing your name or photo, use the debuggers above to refresh them. The preview photo is the WebP image from your card, which most apps display.
