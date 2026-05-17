import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

const certs = [
  {
    icon: 'verified_user',
    title: 'BNSP Full Stack Developer',
    issuer: 'LSP Teknologi Digital',
    issued: 'May 2024',
    link: '/Sertif-bnsp-revan.pdf',
  },
  {
    icon: 'school',
    title: 'Full Stack Web Development',
    issuer: 'Universitas Gadjah Mada',
    issued: 'July 2023',
    link: '/Sertifikat-magang-ugm.pdf',
  },
  {
    icon: 'workspace_premium',
    title: 'Asisten Junior Web Developer',
    issuer: 'PT Abad Jaya Senantiasa',
    issued: 'May 2024',
    link: '/Sertifikat_kompetensi_asisten_junior_web_dev.pdf',
  },
];

export default function CertificatesSection() {
  return (
    <section id="certificates" className="section-py">
      <div className="section-container">
        <FadeInSection style={{ textAlign: 'center', marginBottom: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--color-on-surface)', marginBottom: '16px' }}>
            Professional Certifications
          </h2>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '0 auto' }}>
            Validating my expertise through industry-recognized certifications and professional training.
          </p>
        </FadeInSection>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
          {certs.map((cert, i) => (
            <FadeInSection key={cert.title} delay={i * 0.12} style={{ flex: '1 1 280px', maxWidth: '340px' }}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 280 }}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  height: '100%',
                  cursor: 'default',
                }}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'rgba(0, 209, 255, 0.08)',
                    border: '1px solid rgba(0, 209, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary-container)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{cert.icon}</span>
                </motion.div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: '18px', color: 'var(--color-on-surface)', marginBottom: '4px' }}>
                    {cert.title}
                  </h3>
                  <p style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '8px' }}>
                    {cert.issuer}
                  </p>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                    Issued: {cert.issued}
                  </p>
                </div>

                {/* Link */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    /* Tambahkan atribut download jika ingin langsung terdownload (contoh: download="sertifikat.pdf") */
                    style={{
                      color: 'var(--color-primary)',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-container)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-primary)'}
                  >
                    View Certificate
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                  </a>
                </div>
              </motion.div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
