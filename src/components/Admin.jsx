import { useState } from 'react';
import { api } from './PortfolioContent';
export default function Admin() {
  const [token, setToken] = useState(''),
    [data, setData] = useState(null),
    [draft, setDraft] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };
  async function load(e) {
    e?.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const v = await api('/api/admin', { headers });
      setData(v);
      setDraft(JSON.stringify(v.portfolio, null, 2));
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      const content = JSON.parse(draft);
      const r = await api('/api/admin/portfolio', {
        method: 'PUT',
        headers,
        body: JSON.stringify(content),
      });
      setNotice(r.message);
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function moderate(id, approved) {
    setBusy(true);
    try {
      await api(`/api/admin/guestbook/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ approved }),
      });
      await load();
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin-shell">
      <a className="back-link" href="/">
        ← Back to the village
      </a>
      <span className="eyebrow">WORLD MANAGEMENT</span>
      <h1>Revan’s desk.</h1>
      <p>Kelola konten portfolio, buku tamu, dan pesan pribadi.</p>
      {!data ? (
        <form className="message-form" onSubmit={load}>
          <label>
            Admin token
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoComplete="off"
            />
          </label>
          <button className="button primary" disabled={busy}>
            Buka dashboard
          </button>
          <small>Gunakan ADMIN_TOKEN dari konfigurasi server.</small>
        </form>
      ) : (
        <>
          <button
            className="button"
            onClick={() => {
              setData(null);
              setToken('');
              setDraft('');
              setNotice('');
            }}
          >
            Keluar
          </button>
          <h2>Konten portfolio</h2>
          <p>
            Edit data JSON di bawah. Tautan harus HTTPS atau file lokal
            berawalan /.
          </p>
          <label className="editor-label">
            Portfolio JSON
            <textarea
              className="json-editor"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
            />
          </label>
          <button className="button primary" disabled={busy} onClick={save}>
            Simpan konten
          </button>
          <h2>Buku tamu</h2>
          {data.guestbook.length ? (
            data.guestbook.map((v) => (
              <article className="admin-entry" key={v.id}>
                <strong>{v.name}</strong>
                <p>{v.message}</p>
                <small>
                  {v.created_at} UTC ·{' '}
                  {v.approved ? 'Publik' : 'Menunggu moderasi'}
                </small>
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => moderate(v.id, !v.approved)}
                >
                  {v.approved ? 'Sembunyikan' : 'Setujui'}
                </button>
              </article>
            ))
          ) : (
            <p>Belum ada pesan buku tamu.</p>
          )}
          <h2>Inbox pribadi</h2>
          {data.messages.length ? (
            data.messages.map((v) => (
              <article className="admin-entry" key={v.id}>
                <strong>{v.name}</strong>
                <p>{v.email}</p>
                <p className="preserve-lines">{v.message}</p>
                <small>{v.created_at} UTC</small>
              </article>
            ))
          ) : (
            <p>Belum ada pesan masuk.</p>
          )}
        </>
      )}
      {notice && (
        <p role="status" className="admin-notice">
          {notice}
        </p>
      )}
    </main>
  );
}
