import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';

const words = ['Scalable', 'Modern', 'Reliable', 'Performance'];

function useTypingEffect() {
  const [displayed, setDisplayed] = useState(words[0]);
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(words[0].length);
  const [isDeleting, setIsDeleting] = useState(true);

  useEffect(() => {
    const currentWord = words[wordIdx];
    let timeout;

    if (isDeleting) {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setDisplayed(currentWord.substring(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setWordIdx((i) => (i + 1) % words.length);
        }, 400);
      }
    } else {
      const nextWord = words[(wordIdx) % words.length];
      if (charIdx < nextWord.length) {
        timeout = setTimeout(() => {
          setDisplayed(nextWord.substring(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, 100);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, wordIdx]);

  return displayed;
}

const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAbyip4AQVH54x4yGti4_qjT3yczf3tzVM8cT17tdXTgwsqtsyb2pvsKlrfk1zm2-ivjfibDaFRrjUzPZBAYRbQ2CBgFg5FUN1RohUDYb_WL5GmHxNzJcnaE-PcOdHDv6pa8Qjpe1CY3qjfWCscVlVKxvEMaPelfxiuCMXMZ1Xrj5JOTbwHwqNIs-8Qm6Lo8f7UjPa81kE9qB8Iaqxjqy5SXpw_56rPeMI7LUdZleEkh9jO--mfpTO3X0NW8rWO78oVAfX3tGsJlD2';

export default function HeroSection() {
  const typedWord = useTypingEffect();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '128px',
        paddingBottom: '64px',
        position: 'relative',
      }}
    >
      <div className="section-container" style={{ width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          alignItems: 'center',
        }}
          className="hero-grid"
        >
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 10 }}
          >
            {/* Badge */}
            <motion.div variants={childVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: 'var(--color-primary-container)', boxShadow: '0 0 8px #00D1FF', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)' }}>
                Junior Web Developer
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={childVariants}
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: 'var(--color-on-surface)',
                lineHeight: 1.1,
              }}
              className="hero-headline"
            >
              Building Modern,<br />
              <span className="gradient-text typing-cursor" style={{ display: 'inline-block', minWidth: '200px' }}>
                {typedWord}
              </span>
              <br />
              Digital Solutions.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={childVariants}
              style={{
                fontFamily: 'Inter',
                fontSize: '18px',
                lineHeight: 1.6,
                color: 'var(--color-on-surface-variant)',
                maxWidth: '600px',
              }}
            >
              I specialize in creating high-performance, user-centric web applications. Blending clean backend architecture with refined frontend aesthetics.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={childVariants}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}
            >
              <Link to="projects" smooth duration={700} offset={-80}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="glow-hover"
                  style={{
                    padding: '12px 32px',
                    background: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary-container)',
                    borderRadius: '9999px',
                    border: 'none',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  View Projects
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </motion.button>
              </Link>

              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                href="/CV_RevanZhafran_FullStackDev.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 32px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--color-on-surface)',
                  borderRadius: '9999px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Download CV
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'flex-end',
              zIndex: 0,
            }}
          >
            {/* Glow */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              background: 'rgba(164, 230, 255, 0.12)',
              borderRadius: '9999px',
              filter: 'blur(80px)',
              pointerEvents: 'none',
            }} />

            {/* Card */}
            <div
              className="glass-panel"
              style={{
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '4/5',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(51,53,57,0.5) 0%, transparent 100%)',
                zIndex: 1,
                pointerEvents: 'none',
              }} />
              <img
                src={heroImage}
                alt="Workspace"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.8,
                  mixBlendMode: 'luminosity',
                  transition: 'mix-blend-mode 0.7s ease, opacity 0.7s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.mixBlendMode = 'normal';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.mixBlendMode = 'luminosity';
                  e.currentTarget.style.opacity = '0.8';
                }}
              />

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div className="glass-panel" style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'JetBrains Mono, monospace',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-container)', fontSize: '18px' }}>terminal</span>
                  npm start
                </div>
                <div className="glass-panel" style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'JetBrains Mono, monospace',
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginLeft: '16px',
                }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-container)', fontSize: '18px' }}>database</span>
                  Connected
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .hero-headline {
          font-size: 32px;
        }

        @media (min-width: 480px) {
          .hero-headline {
            font-size: 40px;
          }
        }

        @media (min-width: 768px) {
          .hero-headline {
            font-size: 56px;
          }
          .hero-grid {
            grid-template-columns: 7fr 5fr !important;
          }
        }

        @media (min-width: 1024px) {
          .hero-headline {
            font-size: 64px;
          }
        }
      `}</style>
    </section>
  );
}
