# Firebase setup

This guide connects the app to your own Firebase project on the free **Spark** plan. Allow about 15 minutes. You'll only need to do steps 1–5 once. Repeat step 5 whenever `firestore.rules` changes.

The app uses three Firebase products, all free on Spark:

| Product         | Used for                                       |
| --------------- | ---------------------------------------------- |
| Authentication  | Google sign-in and email/password accounts     |
| Cloud Firestore | Cards, links, themes and images (as data URLs) |
| Hosting         | Serving the app (optional; Netlify also works) |

It does **not** use Cloud Storage or Cloud Functions, because neither is available on Spark for new projects.

> The Firebase console layout changes from time to time. If a menu isn't where this guide says, type the product name (e.g. "Authentication") into the search bar at the top of the console.

---

## 1. Create the project

1. Go to <https://console.firebase.google.com> and sign in with your Google account.
2. Click **Create a project** (or **Add project**).
3. Enter a name, e.g. `Tessera Cards`. Firebase generates a **Project ID** under the name, such as `tessera-cards-1a2b3`. You'll need it later, and it can't be changed.
4. Google Analytics isn't needed. You can turn it off.
5. Click **Create project** and wait for it to finish. New projects start on the Spark (free) plan.

**Recommended:** open **Project settings** (gear icon) → **General** and set a **Public-facing name**, e.g. `Tessera`. This is the name shown in password-reset emails. Without it, emails show the Project ID.

## 2. Register the web app and fill in `.env`

1. On the project overview page, click the **Web** icon (`</>`). It may be labelled **Add app** → **Web**.
2. Enter a nickname such as `web`. **Leave "Also set up Firebase Hosting" unticked**; Hosting is set up later.
3. Click **Register app**. Firebase shows a `firebaseConfig` object like this:

   ```js
   const firebaseConfig = {
     apiKey: 'AIzaSy…',
     authDomain: 'tessera-cards-1a2b3.firebaseapp.com',
     projectId: 'tessera-cards-1a2b3',
     storageBucket: 'tessera-cards-1a2b3.firebasestorage.app',
     messagingSenderId: '123456789012',
     appId: '1:123456789012:web:abc123…',
   }
   ```

4. Open `.env` in the project root and copy each value across. Don't add quotes or spaces:

   | `firebaseConfig` key | `.env` variable                     |
   | -------------------- | ----------------------------------- |
   | `apiKey`             | `VITE_FIREBASE_API_KEY`             |
   | `authDomain`         | `VITE_FIREBASE_AUTH_DOMAIN`         |
   | `projectId`          | `VITE_FIREBASE_PROJECT_ID`          |
   | `storageBucket`      | `VITE_FIREBASE_STORAGE_BUCKET`      |
   | `messagingSenderId`  | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId`              | `VITE_FIREBASE_APP_ID`              |

   For example:

   ```ini
   VITE_FIREBASE_API_KEY=AIzaSy…
   VITE_FIREBASE_AUTH_DOMAIN=tessera-cards-1a2b3.firebaseapp.com
   ```

5. Restart the dev server (`Ctrl+C`, then `npm run dev`). Vite only reads `.env` when it starts.

You can find this config again at any time under **Project settings → General → Your apps → SDK setup and configuration → Config**.

> **Are these values secret?** No. Firebase web config is included in the app's JavaScript and is visible to every visitor. What protects your data is the security rules (step 5). `.env` is still git-ignored so each environment keeps its own settings.

## 3. Turn on sign-in methods

The app offers **Continue with Google** and **email + password**. Turn on both.

1. Open **Authentication**, and click **Get started** if you see it.
2. **Email/Password:** go to the **Sign-in method** tab → **Add new provider** → **Email/Password**. Switch on **Email/Password**, leave **Email link (passwordless sign-in)** off, and click **Save**.
3. **Google:** go to **Add new provider** → **Google**, then switch it on. Choose your email as the **Project support email**, which Google shows to people signing in, and click **Save**.

Google's sign-in window shows your project's **public-facing name** (step 1). Set it so people see "Tessera" rather than `digital-business-card-7f699`.

> **One email, both methods.** Firebase keeps one account per email address, so the same person isn't split into two accounts.
>
> - **Google first, then email sign-up with the same address:** the app says the account already exists. Use Google.
> - **Email/password first, then Google with the same Gmail address:** you're signed in to the **same** account, and your cards are kept. Google is the authority for Gmail addresses, so Firebase may then remove the old password from that account, if the email was never verified. From then on, use Google for it.
> - **Demo accounts** with made-up addresses only ever use email + password, so they aren't affected.

Optional extras in **Authentication → Settings**:

- **Password policy:** set a minimum length of 8 so the server enforces the same rule as the sign-up form.
- **User actions → Email enumeration protection** is on by default for new projects. Leave it on. It's why the reset-password page says "_if_ an account exists".

To make **demo accounts**, either sign up through the app or go to **Authentication → Users → Add user**.

## 4. Create the Firestore database

1. Open **Firestore Database** → **Create database**.
2. If asked for an **edition**, choose **Standard**.
3. Keep the database ID as **`(default)`**. The app connects to the default database.
4. Choose a **location** near most of your visitors, e.g. `northamerica-northeast2 (Toronto)` for Ontario, or `nam5 (United States)` for North America generally. **The location can't be changed later.**
5. When asked about security rules, choose **Start in production mode**. This blocks all access until you publish the app's rules in the next step.
6. Click **Create**.

## 5. Publish the security rules

The rules are in [`firestore.rules`](../firestore.rules) in the project root. They allow:

- anyone to **view a single card** (that's what the public `/c/your-name` page needs);
- nobody to **list or scrape** all cards;
- only a card's **owner** to create, edit or delete it;
- each **slug** (the `your-name` in `/c/your-name`) to be **claimed only once**.

They also check field types and sizes, including the 150 KB cap per image.

Use **either** option below. Both give the same result.

### Option A — paste into the console (no tools needed)

1. Open **Firestore Database → Rules**.
2. Select everything in the editor and delete it.
3. Open `firestore.rules` in VS Code, copy the **entire** file, and paste it in.
4. Click **Publish**. The publish date and time appear above the editor.

### Option B — Firebase CLI (faster when rules change often)

One-time setup:

```bash
npm install -g firebase-tools
firebase login
```

Open [`.firebaserc`](../.firebaserc) and replace `your-firebase-project-id` with your **Project ID** from step 1:

```json
{
  "projects": {
    "default": "tessera-cards-1a2b3"
  }
}
```

Then, from the project root, run this each time the rules change:

```bash
firebase deploy --only firestore:rules
```

This only updates the database rules. It does **not** deploy the website.

### Optional — index settings

[`firestore.indexes.json`](../firestore.indexes.json) stops Firestore from indexing the large `photo` and `logo` image fields. They're never searched, so indexing them only wastes storage. The app works without this step. To apply it with the CLI:

```bash
firebase deploy --only firestore:indexes
```

### Check the rules work

**Thorough check (recommended).** From the project folder, run the rules checker with an existing account. It tries 23 things that must be allowed or refused (signed out, as the owner, and as another user), then deletes everything it created, including a temporary second account:

```bash
TEST_EMAIL=you@example.com TEST_PASSWORD=yourpassword npm run check:rules
```

On Windows PowerShell:

```powershell
$env:TEST_EMAIL='you@example.com'; $env:TEST_PASSWORD='yourpassword'; npm run check:rules
```

Every line should show ✔. A ✘ usually means the latest `firestore.rules` isn't published yet.

**Quick check in the console.** In **Firestore Database → Rules**, open the **Rules Playground**:

| Simulation type | Location             | Authenticated | Expected   |
| --------------- | -------------------- | ------------- | ---------- |
| `get`           | `/cards/anything`    | off           | ✅ Allowed |
| `create`        | `/slugs/benny-lee`   | off           | ❌ Denied  |
| `get`           | `/somethingelse/doc` | off           | ❌ Denied  |

## 6. When the rules change later

Whenever `firestore.rules` changes, repeat **step 5** (Option A or B), then run `npm run check:rules`. If you forget, saving a card shows _"Missing or insufficient permissions"_.

## 7. Authorized domains (do this for every domain you deploy to)

Firebase Authentication only works on approved domains: **Continue with Google** fails on any other domain, and so do password-reset links. `localhost`, `<project-id>.firebaseapp.com` and `<project-id>.web.app` are approved by default, so you don't need to do anything for local development.

When you deploy, add your site's domain, e.g. `your-site.netlify.app`, or later `card.yourdomain.com`:

1. Go to **Authentication → Settings → Authorized domains** → **Add domain**, and enter the domain without `https://`.
2. In `.env`, set `VITE_PUBLIC_BASE_URL=https://card.yourdomain.com`, so the QR codes and password-reset links use it.

If you serve the app from a sub-path of an existing site instead, e.g. `yourdomain.com/card`, also set `VITE_BASE_PATH=/card/`. Hosting details for both setups are in the [README](../README.md).

## 8. Free plan limits

Spark's daily Firestore quota (at the time of writing: 50,000 reads, 20,000 writes and 20,000 deletes per day, plus 1 GiB stored) is plenty for this app:

- Opening a public card costs about **2 reads**.
- The editor autosaves **once you pause typing**, not on every keystroke.
- Each card is a single document of roughly **100–350 KB**, including its images.

If a quota runs out, Firestore stops serving requests until the daily reset at midnight Pacific time. **You're never charged on Spark.**

## Troubleshooting

| What you see                                                   | Fix                                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| The **"Connect your Firebase project"** screen keeps appearing | A required value in `.env` is still empty, or the dev server wasn't restarted.           |
| _"The Firebase API key in .env is not valid"_                  | Copy `apiKey` again. Check there are no quotes, spaces or missing characters.            |
| _"Email/password sign-in isn't enabled…"_                      | Step 3.                                                                                  |
| _"Missing or insufficient permissions"_                        | The rules aren't published or are out of date. Step 5.                                   |
| _"This domain isn't authorized…"_                              | Step 7.                                                                                  |
| The password-reset email doesn't arrive                        | Check spam. With enumeration protection on, no email is sent for unregistered addresses. |
| `firebase: command not found`                                  | Run `npm install -g firebase-tools`, then open a new terminal.                           |
| `firebase deploy` uses the wrong project                       | Check the Project ID in `.firebaserc`, or run `firebase use <project-id>`.               |
