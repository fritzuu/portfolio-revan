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

`npm run dev` starts both Vite and Express. Frontend changes reload automatically; restart the command after changing server code. Port 5184 is deliberately separate from other local Vite projects. The frontend proxies `/api` to the backend on port 3001.

To enable the admin dashboard, copy `.env.example` to `.env`, replace `ADMIN_TOKEN` with a long random secret, and restart the server. Generate a token with `openssl rand -hex 32`. Never commit `.env` or put the token in a `VITE_*` variable. The dashboard keeps the entered token only in memory; refresh or log out to discard it. Without a configured token all admin endpoints reject access.

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
- **Express 5 + Node SQLite** for real server-side persistence.
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
server/app.js                     API, validation, authentication, SQLite schema
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

SQLite is created automatically at `server/data/portfolio.sqlite`. Set `DB_PATH` to override it. Content is seeded only on first creation; later edits are made through `/admin`, not by overwriting the database. Back up the data directory while the server is stopped, or use a SQLite backup mechanism that includes pending WAL writes.

| Endpoint                         | Purpose                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `GET /api/portfolio`             | Public portfolio content                                           |
| `GET /api/guestbook`             | Latest 50 approved messages only                                   |
| `POST /api/guestbook`            | Submit a message pending moderation                                |
| `POST /api/contact`              | Store a private contact message                                    |
| `GET /api/admin`                 | Content, latest 100 guestbook entries, latest 100 private messages |
| `PUT /api/admin/portfolio`       | Validate and save portfolio JSON                                   |
| `PATCH /api/admin/guestbook/:id` | Approve or hide a guestbook entry                                  |

Admin requests require `Authorization: Bearer <ADMIN_TOKEN>`. Guest messages use prepared statements, length validation, a honeypot, and an in-memory limit of five submissions per IP per minute. Public responses omit private messages and unapproved guestbook entries. Admin content rejects non-HTTPS/non-local asset links. The admin content editor exposes the complete JSON document, including projects and profile; it does not upload files. Add new images/PDFs to `public/` and reference their paths.

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

```sh
npm ci
npm run build
npm start
```

Express serves the built website and API together on `PORT` (default 3001). Deploy the Node service with a **persistent disk** mounted at the configured database location and HTTPS provided by your hosting/reverse proxy. This SQLite architecture is intended for one server instance; filesystem storage on ephemeral/serverless hosting will not preserve your data. For multiple instances or a serverless deployment, migrate the storage layer to PostgreSQL/Supabase first.

A Dockerfile is included. Mount `/app/server/data` as a persistent volume and provide `ADMIN_TOKEN` as a runtime environment variable. The submission limiter uses the direct connection IP; behind a reverse proxy it may group visitors under the proxy’s IP. Configure an explicitly trusted proxy only after identifying the deployment topology.

## Personal discoveries

The expanded map is 2600 × 1600. Use the atlas to walk to Jekek’s Garden, Dream Grove, Story Bench, Football Park or Angler’s Shore. Jekek uses a 70px articulated body with fixed-length joints, a head-to-tail traveling wave, arc-length movement history and gradual turns. The supplied pixel design guides its gold/brown pattern and broad head rather than prescribing a coiled pose. Darkrai retains its local transparent reference sprite with floating wisps. Darkrai appears in Dream Grove only when the two-minute day cycle reaches night. Three decorative anglers cast and reel at the eastern lake. Messi (Argentina 10), Yamal (Barcelona 19) and four teammates offer passing lanes, dribble, wind up a kick, pass to fixed endpoints, control the ball, shoot and celebrate on the pitch. The keeper retrieves the ball and kicks it back after a goal.

The book button in the header opens a separate discovery notebook. Five personal field notes are validated and stored under `revan-field-notes` in localStorage; no new backend setup is required. Two discoveries unlock Garden Gate fast travel between the old town and the garden. The Story Bench only includes facts supplied by Revan. Football Park offers a three-shot timing challenge directly over the world: tap KICK when the marker enters the golden center. Reduced motion uses a manual aim slider and still allows the challenge. Ambient movement continues behind map, settings and field-note panels.

Implementation: `src/game/explorationArt.js` (district backgrounds), `src/game/explorationActors.js` (activities), `src/game/exploration.js` (discovery/shot rules), `src/hooks/useExploration.js` (local saves), and the exploration/challenge HTML components.
