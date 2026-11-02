# Cut Tracker web app

The Cut Tracker as a standalone web app that friends can install to their home screen. Each person signs in with an email link and sees only their own log.

It has the same food, lift, weight and prep screens as the Claude page. Two things are different:

- **Saving:** entries save to your account once you sign in. Until then they stay on that phone, and they move into the account at first sign-in. It works offline and syncs when the signal comes back. There's an Export/Import backup on the account card (tap the badge in the top-right corner).
- **Changed since launch:** "Scan a label" and "Describe what you ate" (Claude-only) are gone. "Scan a barcode" uses the camera plus Open Food Facts instead; see below.

## Files

| File | What it is |
|---|---|
| `index.html` | The app |
| `config.js` | Where your Supabase URL and public key go (empty = this-phone-only mode) |
| `store.js` | Sign-in and saving |
| `supabase/schema.sql` | The database table and the privacy rules (each person reads and writes only their own rows) |
| `sw.js`, `manifest.webmanifest`, `icon-*` | Make it installable and let it open offline |

## Go live (about 30 minutes, $0 on free tiers)

Free-tier limits below are from my training data, so check them when you sign up.

1. **Database.** Create a free project at supabase.com. Open *SQL Editor*, paste `supabase/schema.sql`, and click Run.
2. **Keys.** Go to *Project Settings > API* and copy the Project URL and the `anon` public key into `config.js`. The anon key is meant to be public. The privacy rules from step 1 are what protect the data. Never paste the `service_role` key anywhere in this folder.
3. **Hosting.** Pick one:
   - Easiest: drag this whole folder onto Netlify Drop (app.netlify.com/drop). You get a URL right away.
   - Better long-term: put the folder in a GitHub repo and connect it to Netlify, Vercel or GitHub Pages, so every change redeploys on its own.
4. **Sign-in links.** In Supabase, go to *Authentication > URL Configuration*. Set Site URL to your app's URL and add the same URL under Redirect URLs.
5. **Share.** Send friends the URL. On iPhone they tap Safari's Share button, then *Add to Home Screen*. On Android they use Chrome's menu, then *Install app*.

## Known limits

- Supabase's built-in email only sends a few sign-in emails per hour (as of my training). That's fine for a friend group, but connect your own email service if more people join.
- Free Supabase projects can pause after about a week with no activity (as of my training). Opening the dashboard brings a paused project back. Export a backup now and then.
- After changing any file, bump `VERSION` in `sw.js` so installed copies pick up the update.
- On each new day, the Food tab shows the meal plan as a dashed preview. It only saves once you tap "Log as planned" or change something.

## Barcode scanning

"Scan a barcode" on the food tab opens the phone camera (html5-qrcode from cdnjs, loaded only when
the scanner is opened) and looks the product up in Open Food Facts, a free community database.
No key is needed. Nutri-Score and NOVA group are shown when the database has them. Results are
reviewed before logging and saved to My foods with the barcode, so repeat scans never hit the network.
If a product is missing, "Type numbers" saves the entry under that barcode. Community data can be
wrong; the app says so on the review screen.

## Targets

Calorie cap and protein target are per account (Settings in the account card under the badge).
Defaults are 1,500 kcal and 150 g.
