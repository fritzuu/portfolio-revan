# Revan’s World

An interactive pixel RPG portfolio for **Revan Alifian Zhafran**, rebuilt from the original React portfolio. The original projects, profile photo, experience, skills, services, certificates, contact links, and CV are preserved.

## Run locally

Requires **Node.js 22.13+** (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
```

- Website: http://localhost:5184
- API: http://localhost:3001/api/health
- Admin: http://localhost:5184/admin

`npm run dev` starts both Vite and Express. `BACKEND=supabase` connects the API to Supabase; `BACKEND=sqlite` keeps the local database fallback. Frontend changes reload automatically; restart the command after changing server code. Port 5184 is deliberately separate from other local Vite projects. The frontend proxies `/api` to the backend on port 3001.

For the SQLite fallback, to enable the admin dashboard, copy `.env.example` to `.env`, replace `ADMIN_TOKEN` with a long random secret, and restart the server. Generate a token with `openssl rand -hex 32`. Never commit `.env` or put the token in a `VITE_*` variable. The dashboard keeps the entered token only in memory; refresh or log out to discard it. Without a configured token all admin endpoints reject access.

## The adventure

1. Enter the world through a fullscreen three-act story: a late-night idea, a portal, and arrival in the city (skippable).
2. Choose a masculine/feminine character, three skin tones, and four outfits.
3. Explore a full-screen city with connected garden, grove, pitch and lakeshore districts using WASD/arrows, click-to-walk, or the mobile direction pad.
4. Approach a doorway and press **E** or **Enter**, or use the interaction button.
5. Select a HUD menu, quest, or atlas destination to automatically walk around scenery to its building. The corresponding content opens only after arrival. WASD/arrows, a new click, or Escape cancels the trip. The right-hand quest journal can be collapsed; enter all five locations to finish it.

| Location       | Portfolio content                                 |
| -------------- | ------------------------------------------------- |
| About Revan    | Profile, photograph, CV, GitHub                   |
| Project studio | Image Compression, Lyrictify, Cashflow Management |
| Tech library   | Skills and six original service offerings         |
| Memory museum  | UGM/AIESEC experience and certificates            |
| Post & coffee  | Contact links and a private message form          |

Every location is also reachable through keyboard-accessible navigation buttons in the game HUD. The gameplay canvas is decorative for assistive technology; the HTML panels contain the actual portfolio information. Dialogs use Radix focus management. OS reduced-motion preferences are respected; motion and the original upbeat chiptune (melody, arpeggios, bass and drums) can be configured in settings. PLAY enables music; the story also has a mute button. Character appearance and discoveries are saved in localStorage on the current device. No visitor login is required.

## Stack and structure

- **React 19 + Vite** for the website and HTML interface.
- **Phaser**, loaded separately, for the full-screen city, smooth camera follow, patrolling NPCs, animated player, input, depth-sorted props, and shared scenery collisions.
- **Express 5 + Supabase PostgreSQL/Auth** for cloud persistence and admin login; Node SQLite remains available for local development.
- **Radix Dialog** for accessible panels; OS motion preferences are respected.
- **Local Fontsource fonts** (VT323 and DM Sans); no runtime font requests.
- Original procedural pixel artwork in `src/game/art.js`. Existing project screenshots, PDFs, and photo remain in `public/`.

```text
src/App.jsx                       Website, cutscene/creation flow, progress
src/game/World.jsx                Phaser scene and game lifecycle
src/game/art.js                   Original pixel map and avatar drawing
src/game/layout.js                Authored districts, scenery colliders, NPC circuits
src/game/navigation.js           Collision geometry and A* route finding
src/components/Cutscene.jsx       Fullscreen animated story and dialogue
src/hooks/useMusic.js             Original layered chiptune soundtrack
src/components/WorldMap.jsx       Live minimap and walking-route atlas
src/components/FishingHub.jsx     Backpack, journal, sales and tackle shop
src/components/FishingGame.jsx    Cast, bite and interactive reeling game
src/fishing/catalog.js            20 original creatures and 3 rods
src/fishing/sprites.js            Original pixel creature artwork
src/fishing/engine.js             Local economy, rarity selection, save validation
src/hooks/useFishing.js           Browser-only fishing persistence
src/components/PortfolioContent.jsx  Portfolio panels and message forms
src/components/Admin.jsx          Protected content editor, moderation, inbox
src/data/portfolio.json           Original template content; initial database seed
server/app.js                     API routes and authorization
server/supabase.js                Supabase REST/Auth adapter, shared rate limiter
server/sqlite.js                  Optional local SQLite persistence
server/validation.js              Shared validation and initial portfolio data
api/index.js                      Vercel Function entry point
supabase/schema.sql               Locked-down tables and atomic rate-limit RPC
server/index.js                   Production/development server entry point
```

The visitor navigation has five destinations; guestbook is removed from the public UI. Revan wears a blue hoodie and thick square black glasses. The noticeboard beside the dock has been removed; Mira’s tackle stall remains. A smooth two-minute morning → night → morning cycle dims the world and brings up subtle warm halos only around the existing street lamps. Night dimming peaks at 42% so routes remain easy to see.

## Moonwater fishing

The hand-authored town has a northern portfolio district, central Curiosity Square, an eastern reading garden, and a western lake with a walkable wooden dock. Twenty-one residents follow nine long circuits, pause at destinations, yield to the traveler, and sometimes sit on benches. Mira keeps the tackle stall open.

Use **Go fishing** to walk to Moonwater Dock. Fishing happens directly in the world: your traveler casts into the actual lake, while a larger HUD at the bottom center of the screen handles reeling without a window frame; Cast and Strike buttons are centered within it. Map, settings and other panels leave NPCs, water and the day/night cycle running. New species display **NEW** on the catch result. Cast a line, watch for the dipping float, then **Space / tap** to strike. During reeling, hold Space or the on-screen button to raise the net; release to lower it. Left/right arrow keys and tap buttons make small adjustments. Keep the creature marker inside the net until the catch meter fills. Rare creatures move faster and need more precise tracking. OS reduced-motion settings slow the tracking and widen the net. Switching tabs pauses the fishing timer.

Catches enter the backpack. Select sale quantities and review the total before confirming, or review all unlocked catches together. Inspect individual catches to lock favorites. Selling never removes journal discoveries. Mira’s Tackle Shop sells rod upgrades and lets you equip owned rods.

| Rod        |                 Price | Luck |
| ---------- | --------------------: | ---: |
| Twigline   | Free, owned initially |   0% |
| Moonthread |              40 coins | +15% |
| Astralhook |             150 coins | +40% |

| Rarity    | Base weight |  Sale value |
| --------- | ----------: | ----------: |
| Common    |         60% |   1–3 coins |
| Uncommon  |         25% |   4–7 coins |
| Rare      |         10% | 10–15 coins |
| Epic      |          4% | 25–40 coins |
| Legendary |       0.99% |    75 coins |
| Mythic    |       0.01% |   200 coins |

There are 20 individually drawn fantasy creatures. Discover 12 species to unlock **Astral Crossing**, the only spot where The Unwritten can appear. An eligible crossing cast with Twigline has a 0.01% Mythic selection chance; a successful minigame is still required. Luck multiplies Rare-and-above weights by 1.15 or 1.4, then normalizes all weights. The regular dock excludes Mythic and normalizes the remaining weights. There is no guaranteed catch or pity counter.

All fishing progress is stored **only in this browser** under localStorage key `revan-fishing-v1`: coins, individual catches, favorite locks, journal records, rods and equipped rod. No fishing API, database migration, login, or server setup is needed. Corrupt saves reset safely. If storage is blocked or full, the interface explains that progress is temporary. The backpack is capped at 3,000 catches. Settings offers an explicitly confirmed fishing reset; portfolio progress remains separate. Clearing browser storage removes fishing progress. Stopping fishing or opening the backpack ends an unfinished cast.

## Backend

The API supports Supabase and an optional local SQLite fallback. See [Supabase setup](docs/supabase-setup.md) for cloud testing and Vercel deployment. In cloud mode, `/admin` uses email/password through Supabase Auth. The server verifies the access token with Supabase on every admin request and checks its user ID against `SUPABASE_ADMIN_USER_ID`. A blank admin ID disables admin access. No API secret is sent to the browser.

With `BACKEND=sqlite`, SQLite is created automatically at `server/data/portfolio.sqlite`. Set `DB_PATH` to override it. Content is seeded only on first creation; later edits are made through `/admin`, not by overwriting the database. Back up the data directory while the server is stopped, or use a SQLite backup mechanism that includes pending WAL writes.

| Endpoint                         | Purpose                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `GET /api/portfolio`             | Public portfolio content                                           |
| `GET /api/guestbook`             | Latest 50 approved messages only                                   |
| `POST /api/guestbook`            | Submit a message pending moderation                                |
| `POST /api/contact`              | Store a private contact message                                    |
| `GET /api/admin`                 | Content, latest 100 guestbook entries, latest 100 private messages |
| `PUT /api/admin/portfolio`       | Validate and save portfolio JSON                                   |
| `PATCH /api/admin/guestbook/:id` | Approve or hide a guestbook entry                                  |

Admin requests use an in-memory bearer access token from Supabase Auth in cloud mode, or `ADMIN_TOKEN` in SQLite mode. Guest messages use length validation and a honeypot. SQLite uses prepared statements and a per-process limit of five submissions per IP per minute. Supabase uses PostgREST and an atomic database-backed limit shared across instances; IP identifiers are HMAC hashes, not raw IP addresses. Direct database access for `anon` and `authenticated` is revoked and all four application tables have RLS enabled. Only the server accesses them with its secret key. Public API requests do not bypass validation or the submission limiter. Public responses omit private messages and unapproved guestbook entries. Admin content rejects non-HTTPS/non-local asset links. The admin editor provides labeled forms for profile, projects, skills, services, experience, and certificates, with add/reorder/remove-and-undo controls, image previews, draft status, and a save action. Drafts are preserved while reading the inbox or moderating messages. Project images can be uploaded through the authenticated server to ImgBB when `IMGBB_API_KEY` is configured; save the draft to publish the returned image URL. Add PDFs to `public/` and reference their paths.

Contact submissions are **stored in the admin inbox**, not sent as emails. Guestbook entries appear only after manual approval. Multiplayer and cross-device progress are outside this version’s scope.

## Verify

```sh
npm run lint
npm test
npm run build
npm run format:check
```

API integration tests use isolated databases and verify moderation, private contact persistence, validation, rate limiting, protected content edits, and persistence after restart. Navigation tests check every solid prop, all portfolio/fishing routes, and every NPC circuit. Fishing tests check economy transactions, favorite locks, duplicate catches, rod ownership, corruption recovery, probability weighting, Mythic eligibility and successful/failed tracking. Browser checks cover the story/creator flow, automatic walking and arrival panels, quest collapse, and responsive layout.

## Production

For Vercel, import this repository as a Vite project and set the server-only environment variables described in [Supabase setup](docs/supabase-setup.md). `vercel.json` sends `/api/*` to the function and frontend routes such as `/admin` to the SPA. Vercel always uses Supabase; it never falls back to writing a local SQLite database. Deployment routing must still be verified on the actual Vercel deployment. Vercel Hobby is restricted to personal noncommercial use; the current services/freelance content needs review against those terms before selecting Hobby.

For a standalone Node server or Docker:

```sh
npm ci
npm run build
npm start
```

Express serves the built website and API together on `PORT` (default 3001). Deploy the Node service with a **persistent disk** mounted at the configured database location and HTTPS provided by your hosting/reverse proxy. This SQLite architecture is intended for one server instance; filesystem storage on ephemeral/serverless hosting will not preserve your data. For multiple instances or a serverless deployment, migrate the storage layer to PostgreSQL/Supabase first.

A Dockerfile is included. Mount `/app/server/data` as a persistent volume and provide `ADMIN_TOKEN` as a runtime environment variable. The submission limiter uses the direct connection IP; behind a reverse proxy it may group visitors under the proxy’s IP. Configure an explicitly trusted proxy only after identifying the deployment topology.

## Personal discoveries

The expanded map is 2600 × 1600. Jekek’s Garden has a winding trail, original town-style flowering hedges, ferns, sunflowers, planted beds, a resting stone, a bench, butterflies and a gardener who walks and waters plants. Dream Grove frames its moon court with trees, mushrooms, sparse fireflies and birds. Darkrai keeps its reference design as one intact floating sprite; wisps are separate ambient effects. Jekek retains the reference head and palette on a small articulated body; it slithers, turns gradually and pauses when the visitor approaches. Snake head orientation uses hysteresis to avoid angle jitter. Decorations remain walkable; solid trunks, furniture and gate pillars share renderer/navigation coordinates.

The atlas uses the actual world aspect ratio, distinguishes portfolio/fishing/discovery locations and marks discovered destinations. Five personal notes remain under `revan-field-notes` in localStorage. Two discoveries unlock Garden Gate fast travel; its visible leaves open gradually. The gate is a shortcut marker rather than a locked wall across the only district road. Area titles and discovery notifications appear briefly. Music-enabled play adds surface footfalls, ball kicks, goal/discovery chimes and quieter grove ambience. No new backend or save migration is required.

Football Park runs a continuous **4v4 match** with Messi and Yamal on opposing teams. Its fixed-step ball simulation supports possession, dribbling, passing, pressure, tackles, interceptions, goalkeeper reactions, saves, misses, posts, goals in both directions and centre kick-offs for the conceding team after a short celebration. Join either team to control a teammate with your own avatar. WASD/arrows move, Shift sprints, E tackles, F performs a skill dribble. Hold Space to charge a shot and release to kick along the last movement direction; hold Q for a through pass or tap Q for a normal pass. Touch controls provide direction buttons plus hold/release Shoot, Pass, Sprint, Tackle and Dribble. A small team ring identifies the visitor without changing their outfit. Camera follows the participant; scoreboard stays above and controls below the action. Unrelated HUD is hidden during football. Escape or × returns to exploration. Sprint consumes stamina, missed tackles have recovery, and skill dribbles grant a short dodge window. Slow shots can be caught; hard shots can be parried into a playable rebound.

Each match has two 60-second halves. A four-second halftime keeps the score and switches sides; a five-second fulltime shows the result and personal goal/assist/tackle statistics, then starts a new match at 0–0. The visitor remains on their chosen team. Menus do not pause the autonomous match, while a hidden browser tab freezes its clock and cancels any charging shot. Power is displayed only while charging, as a small meter at the player’s feet.

Three-shot timing practice uses a separate small lane east of the main pitch. Reduced motion provides a manual aim slider. The match keeps running behind practice, map, settings and notebook panels. Reduced-motion changes no longer recreate the scene or reset world time. Avatar pose frames are cached with bounded memory; offscreen snake rendering is skipped while its simulation continues.

Garden and pergola gate use original procedural pixel art consistent with the town. Dream Grove assets come from Kenney Tiny Town (CC0), served locally. Sources, license and rejected alternatives are listed in [ASSET_CREDITS.md](ASSET_CREDITS.md). See [asset selection and implementation notes](docs/world-refresh.md).

Validation for this refresh: automated API/economy/navigation/snake/football tests, lint, production build and formatting. Football tests cover precise half durations and score reset, side changes, charged power and direction, stamina/exhaustion, tackle recovery/cooldown, dribble immunity, goalkeeper catch/parry/rebound outcomes, through passes, hidden-tab behavior, continuous live ball positions and equal simulation at 30/120 Hz. Art was rendered directly from the production drawing functions for inspection. Browser interaction/mobile visual testing was left to Revan as requested; the development server remains on port 5184.

Football starts in **Santai** difficulty: gentler pressing, 1.6-second protection after receiving the ball, shorter power charging, directional shot assistance, more generous stamina, helpful teammate passes, and slower opposing keepers. Switch to **Sengit** in the football HUD for the original challenge. Difficulty changes preserve the current score and match clock.
