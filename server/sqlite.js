import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { seed } from './validation.js';

export function createSqliteStore(dbPath) {
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
  return {
    db,
    getPortfolio: () =>
      JSON.parse(db.prepare('SELECT data FROM content WHERE id=1').get().data),
    savePortfolio: (data) =>
      db
        .prepare('UPDATE content SET data=? WHERE id=1')
        .run(JSON.stringify(data)),
    getGuestbook: (admin = false) =>
      db
        .prepare(
          admin
            ? 'SELECT * FROM guestbook ORDER BY id DESC LIMIT 100'
            : 'SELECT id,name,message,created_at FROM guestbook WHERE approved=1 ORDER BY id DESC LIMIT 50',
        )
        .all(),
    getMessages: () =>
      db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 100').all(),
    addGuestbook: ({ name, message }) =>
      db
        .prepare('INSERT INTO guestbook(name,message) VALUES(?,?)')
        .run(name, message),
    addMessage: ({ name, email, message }) =>
      db
        .prepare('INSERT INTO messages(name,email,message) VALUES(?,?,?)')
        .run(name, email, message),
    moderate: (id, approved) =>
      Boolean(
        db
          .prepare('UPDATE guestbook SET approved=? WHERE id=?')
          .run(Number(approved), id).changes,
      ),
  };
}
