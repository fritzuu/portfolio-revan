import { useEffect, useState } from 'react';
import { api } from './PortfolioContent';
import PortfolioEditor from './PortfolioEditor';
function messageDate(value) {
  const iso = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      }).format(date) + ' WIB';
}
export default function Admin() {
  const [token, setToken] = useState(''),
    [data, setData] = useState(null),
    [draft, setDraft] = useState(null),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(null),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState('');
  useEffect(() => {
    let active = true;
    api('/api/auth/config')
      .then((config) => {
        if (active) setMode(config.mode);
      })
      .catch(() => {
        if (active)
          setNotice(
            'Backend belum tersedia. Periksa konfigurasi server lalu muat ulang.',
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const [view, setView] = useState('content');
  const dirty = Boolean(
    data && draft && JSON.stringify(draft) !== JSON.stringify(data.portfolio),
  );
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const headers = { Authorization: `Bearer ${token}` };
  async function load(e) {
    e?.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      let accessToken = token;
      if (mode === 'supabase' && !accessToken) {
        const session = await api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        accessToken = session.access_token;
        setToken(accessToken);
        setPassword('');
      }
      const v = await api('/api/admin', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setData(v);
      setDraft((current) => current ?? structuredClone(v.portfolio));
    } catch (e) {
      if (e.status === 401) {
        setToken('');
        setData(null);
      }
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save(content) {
    setBusy(true);
    setNotice('');
    try {
      const r = await api('/api/admin/portfolio', {
        method: 'PUT',
        headers,
        body: JSON.stringify(content),
      });
      setDraft(content);
      setData((current) => ({
        ...current,
        portfolio: structuredClone(content),
      }));
      setNotice(r.message);
    } catch (e) {
      if (e.status === 401) {
        setToken('');
        setData(null);
      }
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function uploadImage(file) {
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
        file.type,
      ) ||
      file.size > 2 * 1024 * 1024 ||
      !file.size
    )
      throw new Error('Pilih gambar JPG, PNG, WebP, atau GIF maksimal 2 MB.');
    setBusy(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () =>
          reject(new Error('Gambar tidak dapat dibaca. Pilih ulang filenya.'));
        reader.readAsDataURL(file);
      });
      const result = await api('/api/admin/images', {
        method: 'POST',
        headers,
        body: JSON.stringify({ image }),
      });
      return result.url;
    } catch (error) {
      if (error.status === 401) {
        setToken('');
        setData(null);
        setNotice('Sesi berakhir. Login kembali untuk mengunggah gambar.');
      }
      throw error;
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
      if (e.status === 401) {
        setToken('');
        setData(null);
      }
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
      <p>Ruang kecil untuk merawat portfolio dan membaca pesan masuk.</p>
      {!data ? (
        <form className="message-form" onSubmit={load}>
          {mode === 'supabase' ? (
            <>
              <label>
                Email admin
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
            </>
          ) : mode === 'token' ? (
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
          ) : (
            <p>Menyiapkan login…</p>
          )}
          <button className="button primary" disabled={busy || !mode}>
            Buka dashboard
          </button>
          <small>
            {mode === 'supabase'
              ? 'Gunakan akun Supabase Auth yang diberi akses admin. Muat ulang halaman untuk login kembali.'
              : 'Gunakan ADMIN_TOKEN dari konfigurasi server.'}
          </small>
        </form>
      ) : (
        <>
          <button
            className="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api('/api/auth/logout', { method: 'POST', headers });
                setNotice('');
              } catch {
                setNotice(
                  'Sesi lokal ditutup. Logout server belum terkonfirmasi.',
                );
              } finally {
                setBusy(false);
              }
              setData(null);
              setToken('');
              setDraft(null);
              setPassword('');
            }}
          >
            Keluar
          </button>
          <nav className="admin-workspace-nav" aria-label="Kelola website">
            <button
              aria-pressed={view === 'content'}
              disabled={busy}
              onClick={() => setView('content')}
            >
              Konten portfolio
            </button>
            <button
              aria-pressed={view === 'messages'}
              disabled={busy}
              onClick={() => setView('messages')}
            >
              Inbox <span>{data.messages.length}</span>
            </button>
            <button
              aria-pressed={view === 'guestbook'}
              disabled={busy}
              onClick={() => setView('guestbook')}
            >
              Buku tamu{' '}
              <span>
                {data.guestbook.filter((item) => !item.approved).length}
              </span>
            </button>
          </nav>
          {view === 'content' && draft && (
            <PortfolioEditor
              value={draft}
              onChange={(next) => {
                setDraft(next);
                setNotice('');
              }}
              onSave={save}
              onUpload={uploadImage}
              busy={busy}
              dirty={dirty}
            />
          )}
          {view === 'guestbook' && (
            <section>
              <h2>Buku tamu</h2>
              {data.guestbook.length ? (
                data.guestbook.map((v) => (
                  <article className="admin-entry" key={v.id}>
                    <strong>{v.name}</strong>
                    <p>{v.message}</p>
                    <small>
                      {messageDate(v.created_at)} ·{' '}
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
                <div className="admin-empty">
                  <h3>Belum ada pesan buku tamu.</h3>
                  <p>
                    Pesan yang masuk bisa kamu setujui sebelum dipublikasikan.
                  </p>
                  <button className="button" disabled={busy} onClick={load}>
                    Muat ulang
                  </button>
                </div>
              )}
            </section>
          )}
          {view === 'messages' && (
            <section>
              <h2>Inbox pribadi</h2>
              <p className="admin-section-note">
                Pesan ini hanya terlihat olehmu.
              </p>
              {data.messages.length ? (
                data.messages.map((v) => (
                  <article className="admin-entry" key={v.id}>
                    <strong>{v.name}</strong>
                    <p>{v.email}</p>
                    <p className="preserve-lines">{v.message}</p>
                    <small>{messageDate(v.created_at)}</small>
                  </article>
                ))
              ) : (
                <div className="admin-empty">
                  <h3>Inbox masih kosong.</h3>
                  <p>Pesan dari form kontak website akan muncul di sini.</p>
                  <a
                    className="button"
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lihat website
                  </a>
                </div>
              )}
            </section>
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
