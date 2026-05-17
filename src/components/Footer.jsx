export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-surface-container-lowest)',
      borderTop: '1px solid var(--color-outline-variant)',
      width: '100%',
      padding: '48px 0',
      marginTop: '80px',
      transition: 'background 0.4s ease, border-color 0.4s ease',
    }}>
      <div className="section-container">
        <div className="footer-content" style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--color-on-surface)',
          }}>
            Revan Zhafran
          </div>

          <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', textAlign: 'center' }}>
            © 2026 Revan Alifian Zhafran. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Github', href: 'https://github.com/fritzuu' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/revanzhafran/' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-on-surface-variant)',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-content {
            flex-direction: column !important;
            text-align: center !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </footer>
  );
}
