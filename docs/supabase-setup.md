# Supabase testing and Vercel deployment

## Architecture

Browser → `/api/*` → Express → Supabase PostgreSQL/Auth. The browser receives portfolio data and a short-lived admin access token, never the Supabase secret key or a refresh token. The access token stays in React memory; refresh requires login again. On expiry, rejected admin requests return the dashboard to login. Supabase logout ends the Auth session, but already issued JWTs can remain valid until expiry.

The four tables have RLS enabled and no browser-role grants. Public content is exposed through the validated application API; contact messages remain admin-only. A UUID allowlist in the server environment grants admin access. Supabase database administrator/dashboard access is separate from the website admin account.

Game progress stays in localStorage. Sprites, public CV and certificates stay in `public/`. Project images can be uploaded from admin to ImgBB; only their public URLs are saved in portfolio content. Supabase Storage is not used. Contact submissions are stored in the inbox, not emailed.

## Initial setup

1. In your Supabase project's SQL Editor, run `supabase/schema.sql`. Use a new testing project: it creates application tables and tightens their permissions. It does not copy your old SQLite database.
2. Copy `.env.example` to `.env`. Set `BACKEND=supabase`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`. The actual `.env` and `.env.*` files are Git-ignored; only `.env.example` is tracked. Keep the secret key server-only, without a `VITE_` prefix.
3. Run `npm run seed:supabase`. It seeds the current frontend template and preserves an existing content row. Previous SQLite messages/content edits remain in `server/data/` and are not automatically uploaded.
4. In Authentication → Users, create your admin account with email/password. Set `SUPABASE_ADMIN_USER_ID` to that user's UUID. Confirm the user's email through the dashboard if necessary. Do not use an arbitrary visitor's UUID. Leaving the variable blank disables admin login.
5. Disable public user signup in Supabase Auth settings. The application itself has no signup screen. Email/password admin login currently does not implement a TOTP challenge; do not treat this version as MFA-enforced. Add a complete MFA flow and server-side assurance-level enforcement before relying on MFA for production.
6. Restart `npm run dev` and open `/admin`. Log in with the Auth account, not the API key.

No frontend Supabase environment variables are required: Supabase requests originate from the server. Keeping the publishable key out of this bundle is not a security boundary; database grants and RLS protect direct access.

## Vercel

Import the Git repository with the Vite preset, `npm run build`, and output directory `dist`. Use Node 24. Configure these environment variables for each intended deployment environment:

```env
BACKEND=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_ADMIN_USER_ID=your-auth-user-uuid
IMGBB_API_KEY=your-imgbb-api-key
```

Do not upload `.env` or put the secret key into `VITE_*`. Use a separate testing project for preview deployments; previews can otherwise write to the same database as production. Environment changes require a new deployment; local changes require restarting the API.

`api/index.js` starts the cloud API lazily. The function fails closed with a generic 503 if configuration is missing, rather than silently creating a temporary SQLite database. Rate limits use the Vercel-provided `x-vercel-forwarded-for` header only when running on Vercel. Other hosts use the direct connection IP; configure a trusted proxy explicitly if deploying behind another proxy.

Verify `/api/health`, `/api/portfolio`, contact persistence, `/admin` login, edits, moderation, unauthorized access, and SPA routing after deployment. A local build does not confirm cloud routing.

Vercel Hobby permits personal noncommercial use. This portfolio contains services and freelance invitations, so review its eligibility before using Hobby. Supabase Free has quotas, inactivity pausing, and no included automatic backups. Rotate testing credentials before production, export database records regularly, and retain originals of public documents separately. If keys were shared in chat, retire those keys after testing rather than continuing to use them for production.

## Abuse and privacy

Contact and guestbook endpoints share five attempts per IP per minute. Login permits ten attempts per IP per minute in addition to Supabase Auth's own limits. The SQL RPC increments atomically across server instances and stores an HMAC hash of each IP/category. Expired limiter rows are removed on subsequent requests. Rate-limit failures reject submissions rather than allowing unthrottled writes. IP limiting and the honeypot do not eliminate distributed spam; CAPTCHA/server verification should be added if abuse occurs or before a broad public launch.

Authenticated users have no direct database permissions. The API verifies user identity remotely and requires the configured admin UUID. Secret-key database requests bypass RLS intentionally, so each administrative route must retain its authorization middleware. Upstream errors never return Supabase response bodies, keys, or database details. All API responses use `Cache-Control: no-store` to prevent inbox/session caching.

Messages contain names, email addresses and private text. Define retention and deletion before production; this iteration does not add deletion UI or automated retention. Supabase storage buckets are not created. Anything in `public/` is intentionally publicly downloadable.

## Validation

`npm run lint`, `npm test`, `npm run build`, and `npm run format:check` cover local behavior. Cloud adapter tests cover allowlisted and ordinary users, absent admin configuration, remote token verification, private inbox access, moderation filtering, unsafe links, shared limiter behavior, and upstream failures without secret leakage. Live cloud verification additionally checks portfolio reads, disposable contact persistence, denied publishable-key access and concurrent rate limits. Actual email/password login still needs the configured admin account and a user-driven browser check.

## ImgBB images

Create an API key at https://api.imgbb.com/ and set `IMGBB_API_KEY` in local `.env` and Vercel environment variables. Restart the local API or redeploy Vercel after changing it. Keep this key server-only. In admin → Proyek, select a JPG, PNG, WebP, or GIF up to 2 MB. The authenticated backend checks file signatures, limits requests, uploads to ImgBB with a 30-second timeout, and returns only a public image URL. Select **Simpan perubahan** to publish the URL. Uploads have no automatic expiration.

Deleting/replacing a draft project or leaving without saving does not delete its ImgBB image. Manage those files in your ImgBB account and keep originals. These uploads are public; use portfolio screenshots rather than private documents. The 2 MB application limit keeps base64 requests below Vercel function payload limits.

## Admin uploads and visibility

Profile photos and image certificates upload through the existing server-side ImgBB integration. CVs and PDF certificates upload to the public Supabase Storage bucket `portfolio-files`. This project bucket has been provisioned with a 2 MB limit and `application/pdf` allowed MIME type. If moving to another Supabase project, create the same public bucket; no anonymous upload policies are needed because the authenticated admin API uploads with its server credential.

Admin uploads accept files up to 2 MB. PDF signatures and end markers are checked on the server. Uploaded assets are public; save the editor draft to attach them to portfolio content. Existing CV and certificate URLs remain usable until replaced by an uploaded file. Replacing a file preserves the previous asset in storage.

Each project, service, skill category, experience, and certificate has a visibility toggle. Save changes to publish the toggle. Hidden entries remain editable in the authenticated dashboard and are excluded from `/api/portfolio` responses. Visibility hides portfolio entries; it does not make previously shared public file URLs private.
