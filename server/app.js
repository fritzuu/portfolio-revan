import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { validText, validPortfolio } from './validation.js';
import { createImageUploader, validateImage } from './images.js';

export function createApp({
  store,
  adminToken = '',
  cloud = null,
  vercel = false,
  uploadImage = createImageUploader(),
} = {}) {
  if (!store) throw new Error('A persistence store is required.');
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  const limits = new Map();
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.get('/api/auth/config', (_req, res) =>
    res.json({ mode: cloud ? 'supabase' : 'token' }),
  );
  const clientIp = (req) =>
    vercel ? req.get('x-vercel-forwarded-for') || req.ip : req.ip;
  async function rateLimit(req, res, next) {
    if (cloud) {
      if (!(await cloud.consumeLimit(clientIp(req), 'submission', 5)))
        return res
          .status(429)
          .json({ error: 'Terlalu banyak pesan. Coba lagi dalam satu menit.' });
      return next();
    }
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
  async function admin(req, res, next) {
    const token = (req.get('authorization') || '').replace(/^Bearer /, '');
    if (cloud) {
      if (!token || !(await cloud.isAdmin(token)))
        return res.status(401).json({
          error: 'Sesi tidak valid atau akun tidak memiliki akses admin.',
        });
      return next();
    }
    const a = Buffer.from(token),
      b = Buffer.from(adminToken);
    if (!adminToken || a.length !== b.length || !timingSafeEqual(a, b))
      return res
        .status(401)
        .json({ error: 'Token admin tidak valid atau belum dikonfigurasi.' });
    next();
  }
  app.post(
    '/api/admin/images',
    admin,
    rateLimit,
    express.json({ limit: '3mb' }),
    async (req, res) => {
      if (!uploadImage)
        return res
          .status(503)
          .json({ error: 'Upload gambar belum dikonfigurasi.' });
      if (!validateImage(req.body?.image))
        return res.status(400).json({
          error: 'Pilih gambar JPG, PNG, WebP, atau GIF maksimal 2 MB.',
        });
      try {
        res.status(201).json(await uploadImage(req.body.image));
      } catch {
        res.status(502).json({
          error: 'Upload ke ImgBB gagal. Coba lagi atau gunakan tautan gambar.',
        });
      }
    },
  );
  app.use(express.json({ limit: '100kb' }));
  app.post('/api/auth/login', async (req, res) => {
    if (!cloud)
      return res.status(404).json({ error: 'Login akun belum tersedia.' });
    if (!(await cloud.consumeLimit(clientIp(req), 'login', 10)))
      return res.status(429).json({
        error: 'Terlalu banyak percobaan login. Coba lagi dalam satu menit.',
      });
    const { email, password } = req.body || {};
    if (!validText(email, 3, 200) || !validText(password, 1, 1024))
      return res.status(400).json({ error: 'Isi email dan password.' });
    const session = await cloud.login(email.trim(), password);
    if (!session)
      return res
        .status(401)
        .json({ error: 'Email, password, atau akses admin tidak valid.' });
    res.json(session);
  });
  app.post('/api/auth/logout', admin, async (req, res) => {
    if (cloud)
      await cloud.logout(req.get('authorization').replace(/^Bearer /, ''));
    res.json({ message: 'Berhasil keluar.' });
  });
  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', backend: cloud ? 'supabase' : 'sqlite' }),
  );
  app.get('/api/portfolio', async (_req, res) =>
    res.json(await store.getPortfolio()),
  );
  app.get('/api/guestbook', async (_req, res) =>
    res.json(await store.getGuestbook()),
  );
  app.post('/api/guestbook', rateLimit, async (req, res) => {
    const { name, message, website } = req.body || {};
    if (website || !validText(name, 2, 60) || !validText(message, 3, 500))
      return res
        .status(400)
        .json({ error: 'Isi nama 2–60 karakter dan pesan 3–500 karakter.' });
    await store.addGuestbook({ name: name.trim(), message: message.trim() });
    res.status(201).json({
      message: 'Terima kasih! Pesan akan tampil setelah disetujui Revan.',
    });
  });
  app.post('/api/contact', rateLimit, async (req, res) => {
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
    await store.addMessage({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    res.status(201).json({
      message: 'Pesan tersimpan di inbox Revan. Terima kasih sudah mampir!',
    });
  });
  app.get('/api/admin', admin, async (_req, res) => {
    const [portfolio, guestbook, messages] = await Promise.all([
      store.getPortfolio(),
      store.getGuestbook(true),
      store.getMessages(),
    ]);
    res.json({ portfolio, guestbook, messages });
  });
  app.put('/api/admin/portfolio', admin, async (req, res) => {
    if (!validPortfolio(req.body))
      return res.status(400).json({
        error:
          'Struktur konten atau tautan tidak valid. Gunakan format data yang tersedia.',
      });
    await store.savePortfolio(req.body);
    res.json({ message: 'Konten portfolio diperbarui.' });
  });
  app.patch('/api/admin/guestbook/:id', admin, async (req, res) => {
    if (typeof req.body?.approved !== 'boolean')
      return res.status(400).json({ error: 'Status moderasi tidak valid.' });
    if (!/^[1-9]\d{0,15}$/.test(req.params.id))
      return res.status(400).json({ error: 'ID pesan tidak valid.' });
    const changed = await store.moderate(req.params.id, req.body.approved);
    if (!changed)
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
        err.status === 413
          ? 'Permintaan terlalu besar. Gambar maksimal 2 MB.'
          : err.status === 400
            ? 'Format JSON tidak valid.'
            : 'Permintaan tidak dapat diproses.',
    });
  });
  return { app, db: store.db };
}
