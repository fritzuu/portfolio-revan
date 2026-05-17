import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

const cards = [
  {
    icon: 'extension',
    title: 'Problem Solving',
    desc: 'Approaching complex challenges with analytical thinking and logical decomposition.',
  },
  {
    icon: 'code',
    title: 'Clean Code',
    desc: 'Writing maintainable, DRY, and scalable codebases following industry best practices.',
  },
  {
    icon: 'devices',
    title: 'Responsive Design',
    desc: 'Ensuring pixel-perfect execution across all devices and screen sizes.',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="section-py">
      <div className="section-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          
          {/* Top Section: Photo + Text */}
          <div className="about-top-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '48px',
            alignItems: 'center'
          }}>
            {/* Photo */}
            <FadeInSection>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-10px',
                  background: 'var(--color-primary-container)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  borderRadius: '24px',
                  zIndex: 0,
                }}></div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="glass-panel"
                  style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    zIndex: 1,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <img
                    src="/assets/profile.png"
                    alt="Revan Alifian Zhafran"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.9,
                    }}
                  />
                </motion.div>
              </div>
            </FadeInSection>

            {/* Text */}
            <FadeInSection delay={0.2}>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', lineHeight: 1.3, color: 'var(--color-on-surface)', marginBottom: '24px' }}>
                Who I Am
              </h2>
              <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '24px', lineHeight: 1.6, fontSize: '18px' }}>
                Hi, I'm <span style={{ color: 'var(--color-primary-container)', fontWeight: 600 }}>Revan</span>. A passionate developer driven by curiosity and the pursuit of elegant solutions. I transition seamlessly between crafting intuitive user interfaces and architecting robust backend systems.
              </p>
              <div style={{ display: 'flex', gap: '48px', marginTop: '32px' }}>
                {[
                  { value: '10+', label: 'Projects Completed' },
                  { value: '5+', label: 'Core Technologies' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '36px', color: 'var(--color-primary-container)', marginBottom: '4px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>

          {/* Bottom Section: Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
            gap: '24px',
          }}>
            {cards.map((card, i) => (
              <FadeInSection key={card.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    height: '100%',
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary-container)',
                  }}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: '20px', color: 'var(--color-on-surface)' }}>
                    {card.title}
                  </h3>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', lineHeight: 1.6 }}>
                    {card.desc}
                  </p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .about-top-grid {
            grid-template-columns: 4fr 7fr !important;
          }
        }
      `}</style>
    </section>
  );
}
