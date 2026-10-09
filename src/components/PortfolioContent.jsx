import { Localized } from '../i18n';
import { useState } from 'react';
import { ArrowUpRight, Download, Mail } from 'lucide-react';
export async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({
    error: 'Backend belum tersedia. Jalankan npm run dev atau coba lagi nanti.',
  }));
  if (!response.ok)
    throw Object.assign(
      new Error(data.error || 'Permintaan gagal. Coba lagi.'),
      { status: response.status },
    );
  return data;
}
function MessageForm({ type, onSubmitted }) {
  const [status, setStatus] = useState(null),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget,
      values = Object.fromEntries(new FormData(form));
    setBusy(true);
    setStatus(null);
    try {
      const result = await api(`/api/${type}`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setStatus({ ok: true, text: result.message });
      form.reset();
      onSubmitted?.();
    } catch (error) {
      setStatus({ ok: false, text: error.message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Localized>
      <form className="message-form" onSubmit={submit}>
        <label>
          Nama
          <input
            name="name"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            placeholder="Nama kamu"
          />
        </label>
        {type === 'contact' && (
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder="kamu@email.com"
            />
          </label>
        )}
        <label>
          {type === 'contact' ? 'Ceritakan idemu' : 'Tinggalkan jejak'}
          <textarea
            name="message"
            required
            minLength={type === 'contact' ? 10 : 3}
            maxLength={type === 'contact' ? 3000 : 500}
            rows={4}
            placeholder={
              type === 'contact'
                ? 'Yuk, bikin sesuatu bersama.'
                : 'Salam dari petualanganmu…'
            }
          />
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button className="button primary" disabled={busy}>
          {busy
            ? 'Mengirim…'
            : type === 'contact'
              ? 'Kirim pesan ↗'
              : 'Tulis di buku tamu ↗'}
        </button>
        {status && (
          <p
            className={status.ok ? 'form-success' : 'form-error'}
            role="status"
          >
            {status.text}
          </p>
        )}
      </form>
    </Localized>
  );
}
export default function PortfolioContent({ section, data }) {
  if (section === 'about')
    return (
      <Localized>
        <>
          <div className="profile-intro">
            <img src="/assets/profile.png" alt={data.profile.name} />
            <div>
              <span className="eyebrow">THE MAKER BEHIND THIS WORLD</span>
              <h3>{data.profile.name}</h3>
              <p>{data.profile.role}</p>
            </div>
          </div>
          <p className="lead">{data.profile.bio}</p>
          <div className="note">
            “Every good thing starts with a little curiosity.”
          </div>
          <div className="link-row">
            <a
              className="button primary"
              href={data.profile.cv}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={16} /> Download CV
            </a>
            <a
              className="button"
              href={data.profile.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={16} />
            </a>
          </div>
        </>
      </Localized>
    );
  if (section === 'projects')
    return (
      <Localized>
        <>
          <p>A few things I’ve turned from ideas into working products.</p>
          <div className="project-list">
            {data.projects.map((p, i) => (
              <article className="project-card" key={p.title}>
                <div className="project-image">
                  <img src={p.img} alt={p.imgAlt || p.title} loading="lazy" />
                  <span>0{i + 1}</span>
                </div>
                <div className="project-body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="link-row">
                    {p.demoLink && (
                      <a href={p.demoLink} target="_blank" rel="noreferrer">
                        Live demo ↗
                      </a>
                    )}
                    {p.codeLink && (
                      <a href={p.codeLink} target="_blank" rel="noreferrer">
                        Source code ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      </Localized>
    );
  if (section === 'skills')
    return (
      <Localized>
        <>
          <p>The building blocks in my inventory.</p>
          <div className="skill-grid">
            {data.skills.map((s, i) => (
              <article className="skill-card" key={s.title}>
                <span className="pixel-number">0{i + 1}</span>
                <h3>{s.title}</h3>
                <div className="tags">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <h3 className="subheading">What I can build for you</h3>
          <div className="service-list">
            {(data.services || []).map((s) => (
              <article key={s.title}>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <div className="tags">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      </Localized>
    );
  if (section === 'experience')
    return (
      <Localized>
        <>
          <p>Places I’ve learned, built, and grown.</p>
          <div className="timeline">
            {data.experience.map((v) => (
              <article key={v.role}>
                <small>{v.period}</small>
                <h3>{v.role}</h3>
                <strong>{v.company}</strong>
                <ul>
                  {v.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <h3 className="subheading">Collected certifications</h3>
          {data.certificates.map((c) => (
            <a
              className="certificate"
              key={c.title}
              href={c.link}
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <strong>{c.title}</strong>
                <small>
                  {c.issuer} · {c.issued}
                </small>
              </span>
              <ArrowUpRight size={20} />
            </a>
          ))}
        </>
      </Localized>
    );
  return (
    <Localized>
      <>
        <div className="availability">
          <span /> Open to opportunities
        </div>
        <h3>Let’s build something good.</h3>
        <p>
          Open to full stack roles and interesting freelance projects. Messages
          go to Revan’s private inbox.
        </p>
        <div className="contact-links">
          <a href={`mailto:${data.profile.email}`}>
            <Mail size={16} />
            {data.profile.email}
          </a>
          <a href={data.profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a href={data.profile.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp ↗
          </a>
        </div>
        <MessageForm type="contact" />
      </>
    </Localized>
  );
}
