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
3. Explore a compact, full-screen city using WASD/arrows, click-to-walk, or the mobile direction pad.
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
src/game/navigation.js           Collision geometry and A* route finding
src/components/Cutscene.jsx       Fullscreen animated story and dialogue
src/hooks/useMusic.js             Original layered chiptune soundtrack
src/components/WorldMap.jsx       Live minimap and walking-route atlas
src/components/PortfolioContent.jsx  Portfolio panels and message forms
src/components/Admin.jsx          Protected content editor, moderation, inbox
src/data/portfolio.json           Original template content; initial database seed
server/app.js                     API, validation, authentication, SQLite schema
server/index.js                   Production/development server entry point
```

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

API integration tests use isolated databases and verify moderation, private contact persistence, validation, rate limiting, protected content edits, and persistence after restart. Navigation tests check every solid prop, all building-to-building routes, and recovery when clicking blocked scenery. Browser checks cover the story/creator flow, automatic walking and arrival panels, quest collapse, and responsive layout.

## Production

```sh
npm ci
npm run build
npm start
```

Express serves the built website and API together on `PORT` (default 3001). Deploy the Node service with a **persistent disk** mounted at the configured database location and HTTPS provided by your hosting/reverse proxy. This SQLite architecture is intended for one server instance; filesystem storage on ephemeral/serverless hosting will not preserve your data. For multiple instances or a serverless deployment, migrate the storage layer to PostgreSQL/Supabase first.

A Dockerfile is included. Mount `/app/server/data` as a persistent volume and provide `ADMIN_TOKEN` as a runtime environment variable. The submission limiter uses the direct connection IP; behind a reverse proxy it may group visitors under the proxy’s IP. Configure an explicitly trusted proxy only after identifying the deployment topology.
