import { useState } from 'react';
import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Halo, saya ${formData.name} (${formData.email}).\n\n${formData.message}`;
    window.open(`https://wa.me/6285641631620?text=${encodeURIComponent(message)}`, '_blank');
  };

  const contactLinks = [
    { icon: 'mail', label: 'revanalifiandev@gmail.com', href: 'mailto:revanalifiandev@gmail.com' },
    { icon: 'link', label: 'LinkedIn Profile', href: 'https://www.linkedin.com/in/revanzhafran/' },
    { icon: 'code', label: 'GitHub', href: 'https://github.com/fritzuu' },
  ];

  return (
    <section id="contact" className="section-py">
      <div className="section-container">
        <FadeInSection>
          <div
            className="glass-panel"
            style={{
              borderRadius: '24px',
              padding: 'clamp(32px, 5vw, 64px)',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '400px',
              height: '400px',
              background: 'rgba(0, 209, 255, 0.04)',
              borderRadius: '9999px',
              filter: 'blur(100px)',
              pointerEvents: 'none',
            }} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '64px',
              position: 'relative',
              zIndex: 1,
            }} className="contact-grid">

              {/* Left */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  marginBottom: '24px',
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                    animation: 'pulse 2s infinite',
                    display: 'inline-block',
                  }} />
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Available for new opportunities
                  </span>
                </div>

                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--color-on-surface)', marginBottom: '16px' }}>
                  Let's Build Together
                </h2>
                <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '32px', lineHeight: 1.6 }}>
                  Currently open to junior/mid-level full stack roles and interesting freelance projects.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {contactLinks.map((link) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      whileHover={{ x: 4 }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '16px',
                        color: 'var(--color-on-surface-variant)',
                        textDecoration: 'none',
                        width: 'fit-content',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '9999px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border-color 0.2s ease',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{link.icon}</span>
                      </div>
                      <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em' }}>
                        {link.label}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Right — Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="sr-only">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="sr-only">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="sr-only">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project..."
                    rows={4}
                    required
                    className="form-input"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="glow-hover"
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '12px 32px',
                    background: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary-container)',
                    borderRadius: '8px',
                    border: 'none',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.3s ease',
                  }}
                >
                  Send Message
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                </motion.button>
              </form>
            </div>
          </div>
        </FadeInSection>
      </div>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        @media (min-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
