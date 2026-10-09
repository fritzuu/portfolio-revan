import { Localized } from '../i18n';
import { useId, useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Undo2 } from 'lucide-react';

const PROFILE_FIELDS = [
  { key: 'name', label: 'Nama lengkap', max: 100 },
  { key: 'role', label: 'Profesi / headline', max: 100 },
  { key: 'bio', label: 'Tentang kamu', max: 2000, multiline: true },
  { key: 'email', label: 'Email publik', type: 'email', max: 200 },
  { key: 'github', label: 'GitHub', link: true },
  { key: 'linkedin', label: 'LinkedIn', link: true },
  { key: 'whatsapp', label: 'WhatsApp', link: true },
  { key: 'cv', label: 'Tautan CV', link: true, asset: true },
];
const SECTIONS = [
  {
    key: 'profile',
    label: 'Profil',
    description: 'Perkenalan singkat dan cara menghubungimu.',
  },
  {
    key: 'projects',
    label: 'Proyek',
    description: 'Karya yang ingin kamu tampilkan di studio.',
    max: 30,
    empty: {
      title: '',
      desc: '',
      tags: [],
      img: '',
      imgAlt: '',
      demoLink: null,
      codeLink: null,
      demoLabel: 'Live Demo',
    },
    fields: [
      { key: 'title', label: 'Nama proyek', max: 100 },
      { key: 'desc', label: 'Deskripsi proyek', multiline: true, max: 3000 },
      { key: 'tags', label: 'Teknologi', list: true },
      { key: 'img', label: 'Tautan gambar', link: true, asset: true },
      { key: 'imgAlt', label: 'Deskripsi gambar', optional: true, max: 300 },
      { key: 'demoLink', label: 'Tautan demo', link: true, optional: true },
      {
        key: 'codeLink',
        label: 'Tautan source code',
        link: true,
        optional: true,
      },
      { key: 'demoLabel', label: 'Teks tombol demo', optional: true, max: 60 },
    ],
  },
  {
    key: 'skills',
    label: 'Skill',
    description: 'Kelompokkan kemampuanmu agar mudah dilihat.',
    max: 20,
    empty: { title: '', tags: [], icon: 'build' },
    fields: [
      { key: 'title', label: 'Nama kategori', max: 100 },
      { key: 'tags', label: 'Daftar skill', list: true },
    ],
  },
  {
    key: 'services',
    label: 'Layanan',
    description: 'Ceritakan apa yang bisa kamu bantu kerjakan.',
    max: 20,
    empty: { title: '', desc: '', tags: [], icon: 'web' },
    fields: [
      { key: 'title', label: 'Nama layanan', max: 100 },
      { key: 'desc', label: 'Deskripsi layanan', multiline: true, max: 3000 },
      { key: 'tags', label: 'Keahlian terkait', list: true },
    ],
  },
  {
    key: 'experience',
    label: 'Pengalaman',
    description: 'Peran, organisasi, dan kontribusi yang berkesan.',
    max: 30,
    empty: { role: '', company: '', period: '', points: [], icon: 'code' },
    fields: [
      { key: 'role', label: 'Posisi / jabatan', max: 150 },
      { key: 'company', label: 'Perusahaan / organisasi', max: 150 },
      {
        key: 'period',
        label: 'Periode',
        max: 150,
        placeholder: 'Jan 2025 – Aug 2025',
      },
      {
        key: 'points',
        label: 'Kontribusi dan pencapaian',
        list: true,
        multiline: true,
      },
    ],
  },
  {
    key: 'certificates',
    label: 'Sertifikat',
    description: 'Bukti belajar dan pencapaianmu.',
    max: 30,
    empty: {
      title: '',
      issuer: '',
      issued: '',
      link: '',
      icon: 'verified_user',
    },
    fields: [
      { key: 'title', label: 'Nama sertifikat', max: 150 },
      { key: 'issuer', label: 'Penerbit', max: 150 },
      {
        key: 'issued',
        label: 'Tanggal terbit',
        max: 150,
        placeholder: 'May 2024',
      },
      { key: 'link', label: 'Tautan sertifikat', link: true, asset: true },
    ],
  },
];
function Field({ field, value, onChange, onUpload }) {
  const id = useId();
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const {
    label,
    multiline,
    list,
    optional,
    max,
    link,
    asset,
    type,
    placeholder,
  } = field;
  const text = list ? (value || []).join(multiline ? '\n' : ',') : value || '';
  const control = {
    id,
    'aria-describedby': list ? `${id}-help` : undefined,
    value: text,
    onChange: (e) =>
      onChange(
        list ? e.target.value.split(multiline ? '\n' : ',') : e.target.value,
      ),
    required: !optional && !list,
    maxLength: list ? undefined : max,
    placeholder:
      placeholder ||
      (link
        ? asset
          ? '/nama-file.pdf atau https://…'
          : 'https://…'
        : undefined),
  };
  return (
    <Localized>
      <div className={`admin-field${multiline ? ' admin-field-wide' : ''}`}>
        <label htmlFor={id}>
          {label}
          {optional && <small> · opsional</small>}
        </label>
        {multiline ? (
          <textarea {...control} rows={4} />
        ) : (
          <input {...control} type={type || 'text'} />
        )}
        {list && (
          <small id={`${id}-help`}>
            {multiline
              ? 'Satu pencapaian per baris.'
              : 'Pisahkan dengan koma. Contoh: React, Node.js, Supabase'}
          </small>
        )}
        {field.key === 'img' && onUpload && (
          <div className="admin-image-upload">
            <label htmlFor={`${id}-file`}>
              Atau pilih gambar dari perangkat
            </label>
            <input
              id={`${id}-file`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              aria-describedby={`${id}-upload-help`}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                setUploadError('');
                setUploadStatus('Mengunggah gambar…');
                try {
                  onChange(await onUpload(file));
                  setUploadStatus(
                    'Gambar siap. Simpan perubahan untuk menampilkannya di website.',
                  );
                } catch (error) {
                  setUploadStatus('');
                  setUploadError(error.message);
                }
              }}
            />
            <small id={`${id}-upload-help`}>
              JPG, PNG, WebP, atau GIF · maksimal 2 MB. Gambar yang diunggah
              dapat diakses publik.
            </small>
            {uploadStatus && <small role="status">{uploadStatus}</small>}
            {uploadError && <small role="alert">{uploadError}</small>}
          </div>
        )}
      </div>
    </Localized>
  );
}
function prepare(value) {
  const content = structuredClone(value);
  for (const section of SECTIONS) {
    const items =
      section.key === 'profile' ? [content.profile] : content[section.key];
    for (const item of items)
      for (const field of section.key === 'profile'
        ? PROFILE_FIELDS
        : section.fields) {
        if (field.list)
          item[field.key] = [
            ...new Set(
              (item[field.key] || [])
                .map((entry) => entry.trim())
                .filter(Boolean),
            ),
          ];
        else if (typeof item[field.key] === 'string')
          item[field.key] = item[field.key].trim();
        if (field.optional && field.link && !item[field.key])
          item[field.key] = null;
      }
  }
  return content;
}
function errorFor(content) {
  for (const section of SECTIONS) {
    const items =
      section.key === 'profile' ? [content.profile] : content[section.key];
    for (const [index, item] of items.entries())
      for (const field of section.key === 'profile'
        ? PROFILE_FIELDS
        : section.fields) {
        const value = item[field.key];
        let problem;
        if (field.list) {
          if (
            !Array.isArray(value) ||
            value.some(
              (entry) => entry.length > (field.multiline ? 3000 : 60),
            ) ||
            (section.key === 'projects' && value.length > 20)
          )
            problem = 'Daftar terlalu panjang.';
        } else if (!field.optional && !value) problem = 'Wajib diisi.';
        else if (field.max && value?.length > field.max)
          problem = `Maksimal ${field.max} karakter.`;
        else if (
          field.link &&
          value &&
          !(/^https:\/\/[^\s]+$/.test(value) || /^\/(?!\/)[^\s]+$/.test(value))
        )
          problem = 'Gunakan tautan HTTPS atau alamat file berawalan /.';
        else if (
          field.type === 'email' &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        )
          problem = 'Alamat email belum valid.';
        if (problem)
          return {
            section: section.key,
            message: `${section.label}${section.key === 'profile' ? '' : ` ${index + 1}`} — ${field.label}: ${problem}`,
          };
      }
  }
  return null;
}
export default function PortfolioEditor({
  value,
  onChange,
  onSave,
  onUpload,
  busy,
  dirty,
}) {
  const [active, setActive] = useState('profile');
  const [error, setError] = useState(null);
  const [undo, setUndo] = useState(null);
  const section = SECTIONS.find((item) => item.key === active);
  function updateItem(index, key, next) {
    onChange({
      ...value,
      [active]:
        active === 'profile'
          ? { ...value.profile, [key]: next }
          : value[active].map((item, i) =>
              i === index ? { ...item, [key]: next } : item,
            ),
    });
    setError(null);
    setUndo(null);
  }
  function remove(index) {
    setUndo({ key: active, items: value[active] });
    onChange({
      ...value,
      [active]: value[active].filter((_item, i) => i !== index),
    });
  }
  function move(index, step) {
    setUndo(null);
    const items = [...value[active]];
    [items[index], items[index + step]] = [items[index + step], items[index]];
    onChange({ ...value, [active]: items });
  }
  function submit(event) {
    event.preventDefault();
    const content = prepare(value);
    const invalid = errorFor(content);
    setError(invalid);
    if (invalid) {
      setActive(invalid.section);
      return;
    }
    setUndo(null);
    onSave(content);
  }
  const fields = active === 'profile' ? PROFILE_FIELDS : section.fields;
  const items = active === 'profile' ? [value.profile] : value[active];
  return (
    <Localized>
      <form className="portfolio-editor" onSubmit={submit}>
        <div className="admin-category-nav" aria-label="Bagian portfolio">
          {SECTIONS.map((item) => (
            <button
              type="button"
              disabled={busy}
              aria-pressed={active === item.key}
              key={item.key}
              onClick={() => {
                setActive(item.key);
                setError(null);
              }}
            >
              {item.label}
              {item.key !== 'profile' && <span>{value[item.key].length}</span>}
            </button>
          ))}
        </div>
        <div className="admin-section-heading">
          <div>
            <h2>{section.label}</h2>
            <p>{section.description}</p>
          </div>
          {active !== 'profile' && (
            <button
              type="button"
              className="button"
              disabled={busy || items.length >= section.max}
              onClick={() => {
                setUndo(null);
                onChange({
                  ...value,
                  [active]: [...items, structuredClone(section.empty)],
                });
              }}
            >
              <Plus size={16} /> Tambah {section.label.toLowerCase()}
            </button>
          )}
        </div>
        {error && (
          <p className="admin-form-error" role="alert">
            {error.message}
          </p>
        )}
        {undo && (
          <div className="admin-undo" role="status">
            <span>Item dikeluarkan dari draft.</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onChange({ ...value, [undo.key]: undo.items });
                setUndo(null);
              }}
            >
              <Undo2 size={14} /> Urungkan
            </button>
          </div>
        )}
        <fieldset disabled={busy} className="admin-fields-container">
          {!items.length && (
            <div className="admin-empty">
              <h3>Belum ada {section.label.toLowerCase()}.</h3>
              <p>Gunakan tombol Tambah untuk membuat item pertama.</p>
            </div>
          )}
          {items.map((item, index) => (
            <article className="admin-edit-card" key={`${active}-${index}`}>
              {active !== 'profile' && (
                <div className="admin-card-heading">
                  <h3>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item.title || item.role || `${section.label} baru`}
                  </h3>
                  <div className="admin-card-actions">
                    <button
                      type="button"
                      aria-label={`Pindahkan ${section.label.toLowerCase()} ${index + 1} ke atas`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Pindahkan ${section.label.toLowerCase()} ${index + 1} ke bawah`}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button type="button" onClick={() => remove(index)}>
                      Keluarkan
                    </button>
                  </div>
                </div>
              )}
              <div className="admin-field-grid">
                {fields.map((field) => (
                  <Field
                    key={field.key}
                    field={field}
                    value={item[field.key]}
                    onChange={(next) => updateItem(index, field.key, next)}
                    onUpload={onUpload}
                  />
                ))}
              </div>
              {active === 'projects' &&
                item.img &&
                (/^\/(?!\/)/.test(item.img) ||
                  /^https:\/\//.test(item.img)) && (
                  <div className="admin-image-preview">
                    <img
                      src={item.img}
                      alt={item.imgAlt || 'Pratinjau gambar proyek'}
                      loading="lazy"
                    />
                    <span>Pratinjau gambar</span>
                  </div>
                )}
            </article>
          ))}
        </fieldset>
        <div className="admin-save-bar">
          <span>
            {dirty ? 'Ada perubahan yang belum disimpan' : 'Konten tersimpan'}
            <small>Perubahan tampil di website setelah disimpan.</small>
          </span>
          <button className="button primary" disabled={busy || !dirty}>
            {busy ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </div>
      </form>
    </Localized>
  );
}
