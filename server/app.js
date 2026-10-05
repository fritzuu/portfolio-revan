import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { timingSafeEqual } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const seed = JSON.parse(
  readFileSync(new URL('../src/data/portfolio.json', import.meta.url)),
);
const validText = (v, min, max) =>
  typeof v === 'string' && v.trim().length >= min && v.length <= max;
const safeLink = (v) =>
  v === null ||
  (typeof v === 'string' && (/^https:\/\//.test(v) || /^\/(?!\/)/.test(v)));
function validPortfolio(p) {
  return (
    p &&
    validText(p.profile?.name, 1, 100) &&
    validText(p.profile?.role, 1, 100) &&
    validText(p.profile?.bio, 1, 2000) &&
    validText(p.profile?.email, 3, 200) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.profile.email) &&
    ['github', 'linkedin', 'whatsapp', 'cv'].every(
      (k) => safeLink(p.profile[k]) && p.profile[k],
    ) &&
    Array.isArray(p.projects) &&
    p.projects.length <= 30 &&
    p.projects.every(
      (v) =>
        validText(v.title, 1, 100) &&
        validText(v.desc, 1, 3000) &&
        Array.isArray(v.tags) &&
        v.tags.length <= 20 &&
        v.tags.every((t) => validText(t, 1, 60)) &&
        typeof v.img === 'string' &&
        safeLink(v.img) &&
        safeLink(v.demoLink) &&
        safeLink(v.codeLink),
    ) &&
    Array.isArray(p.services) &&
    p.services.length <= 20 &&
    p.services.every(
      (v) =>
        validText(v.title, 1, 100) &&
        validText(v.desc, 1, 3000) &&
        Array.isArray(v.tags) &&
        v.tags.every((t) => validText(t, 1, 60)),
    ) &&
    Array.isArray(p.skills) &&
    p.skills.length <= 20 &&
    p.skills.every(
      (v) =>
        validText(v.title, 1, 100) &&
        Array.isArray(v.tags) &&
        v.tags.every((t) => validText(t, 1, 60)),
    ) &&
    Array.isArray(p.experience) &&
    p.experience.length <= 30 &&
    p.experience.every(
      (v) =>
        ['role', 'company', 'period'].every((k) => validText(v[k], 1, 150)) &&
        Array.isArray(v.points) &&
        v.points.every((t) => validText(t, 1, 3000)),
    ) &&
    Array.isArray(p.certificates) &&
    p.certificates.length <= 30 &&
    p.certificates.every(
      (v) =>
        ['title', 'issuer', 'issued'].every((k) => validText(v[k], 1, 150)) &&
        safeLink(v.link) &&
        v.link,
    )
  );
}
export function createApp({
  dbPath = process.env.DB_PATH || './server/data/portfolio.sqlite',
  adminToken = process.env.ADMIN_TOKEN || '',
} = {}) {
  if (dbPath !== ':memory:')
    mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS guestbook (id INTEGER PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL, approved INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
  db.prepare('INSERT OR IGNORE INTO content(id, data) VALUES(1, ?)').run(
    JSON.stringify(seed),
  );
  const current = JSON.parse(
    db.prepare('SELECT data FROM content WHERE id=1').get().data,
  );
  if (!current.services) {
    current.services = seed.services;
    db.prepare('UPDATE content SET data=? WHERE id=1').run(
      JSON.stringify(current),
    );
  }
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(express.json({ limit: '100kb' }));
  const limits = new Map();
  function rateLimit(req, res, next) {
    const now = Date.now();
    for (const [key, value] of limits)
      if (value.until < now) limits.delete(key);
    const key = req.ip;
    const entry = limits.get(key) || { count: 0, until: now + 60000 };
    entry.count++;
    limits.set(key, entry);
    if (entry.count > 5)
      return res
        .status(429)
        .json({ error: 'Terlalu banyak pesan. Coba lagi dalam satu menit.' });
    next();
  }
  function admin(req, res, next) {
    const token = (req.get('authorization') || '').replace(/^Bearer /, '');
    const a = Buffer.from(token),
      b = Buffer.from(adminToken);
    if (!adminToken || a.length !== b.length || !timingSafeEqual(a, b))
      return res
        .status(401)
        .json({ error: 'Token admin tidak valid atau belum dikonfigurasi.' });
    next();
  }
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/portfolio', (req, res) =>
    res.json(
      JSON.parse(db.prepare('SELECT data FROM content WHERE id=1').get().data),
    ),
  );
  app.get('/api/guestbook', (req, res) =>
    res.json(
      db
        .prepare(
          'SELECT id,name,message,created_at FROM guestbook WHERE approved=1 ORDER BY id DESC LIMIT 50',
        )
        .all(),
    ),
  );
  app.post('/api/guestbook', rateLimit, (req, res) => {
    const { name, message, website } = req.body || {};
    if (website || !validText(name, 2, 60) || !validText(message, 3, 500))
      return res
        .status(400)
        .json({ error: 'Isi nama 2–60 karakter dan pesan 3–500 karakter.' });
    db.prepare('INSERT INTO guestbook(name,message) VALUES(?,?)').run(
      name.trim(),
      message.trim(),
    );
    res.status(201).json({
      message: 'Terima kasih! Pesan akan tampil setelah disetujui Revan.',
    });
  });
  app.post('/api/contact', rateLimit, (req, res) => {
    const { name, email, message, website } = req.body || {};
    if (
      website ||
      !validText(name, 2, 60) ||
      !validText(email, 3, 200) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !validText(message, 10, 3000)
    )
      return res.status(400).json({
        error: 'Periksa nama, email, dan pesan (minimal 10 karakter).',
      });
    db.prepare('INSERT INTO messages(name,email,message) VALUES(?,?,?)').run(
      name.trim(),
      email.trim(),
      message.trim(),
    );
    res.status(201).json({
      message: 'Pesan tersimpan di inbox Revan. Terima kasih sudah mampir!',
    });
  });
  app.get('/api/admin', admin, (req, res) =>
    res.json({
      portfolio: JSON.parse(
        db.prepare('SELECT data FROM content WHERE id=1').get().data,
      ),
      guestbook: db
        .prepare('SELECT * FROM guestbook ORDER BY id DESC LIMIT 100')
        .all(),
      messages: db
        .prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 100')
        .all(),
    }),
  );
  app.put('/api/admin/portfolio', admin, (req, res) => {
    if (!validPortfolio(req.body))
      return res.status(400).json({
        error:
          'Struktur konten atau tautan tidak valid. Gunakan format data yang tersedia.',
      });
    db.prepare('UPDATE content SET data=? WHERE id=1').run(
      JSON.stringify(req.body),
    );
    res.json({ message: 'Konten portfolio diperbarui.' });
  });
  app.patch('/api/admin/guestbook/:id', admin, (req, res) => {
    if (typeof req.body?.approved !== 'boolean')
      return res.status(400).json({ error: 'Status moderasi tidak valid.' });
    const result = db
      .prepare('UPDATE guestbook SET approved=? WHERE id=?')
      .run(Number(req.body.approved), req.params.id);
    if (!result.changes)
      return res.status(404).json({ error: 'Pesan tidak ditemukan.' });
    res.json({ message: 'Status pesan diperbarui.' });
  });
  app.use('/api', (req, res) =>
    res.status(404).json({ error: 'Endpoint tidak ditemukan.' }),
  );
  app.use(express.static(path.resolve('dist')));
  app.get('/{*path}', (req, res) =>
    res.sendFile(path.resolve('dist/index.html')),
  );
  // Return JSON errors; never expose database paths or internal stack traces.
  app.use((err, req, res, next) => {
    void next;
    res.status(err.status || 500).json({
      error:
        err.status === 400
          ? 'Format JSON tidak valid.'
          : 'Permintaan tidak dapat diproses.',
    });
  });
  return { app, db };
}
