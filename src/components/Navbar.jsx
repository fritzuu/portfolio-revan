import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-scroll';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'About', to: 'about' },
  { label: 'Skills', to: 'skills' },
  { label: 'Experience', to: 'experience' },
  { label: 'Certificates', to: 'certificates' },
  { label: 'Projects', to: 'projects' },
  { label: 'Services', to: 'services' },
  { label: 'Contact', to: 'contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = document.querySelectorAll('section[id]');
      let current = 'hero';
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 200) {
          current = section.getAttribute('id');
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navBg = scrolled
    ? (isDark ? 'rgba(17, 19, 24, 0.9)' : 'rgba(248, 249, 255, 0.9)')
    : (isDark ? 'rgba(17, 19, 24, 0.5)' : 'rgba(248, 249, 255, 0.5)');

  const navBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)';

  return (
    <>
      {/* ──── Desktop Navbar: centered pill ──── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="nav-desktop"
        style={{
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          borderRadius: '9999px',
          background: navBg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: navBorder,
          boxShadow: scrolled ? (isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)') : 'none',
          transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {navLinks.map((link) => {
          const isActive = activeSection === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              smooth
              duration={700}
              offset={-80}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'color 0.2s ease, background 0.2s ease',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: isActive
                  ? (isDark ? 'rgba(164,230,255,0.1)' : 'rgba(0,104,128,0.08)')
                  : 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </motion.nav>

      {/* ──── Mobile Navbar: logo + hamburger ──── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="nav-mobile"
        style={{
          position: 'fixed',
          top: '12px',
          left: '16px',
          right: '16px',
          zIndex: 50,
          borderRadius: '16px',
          background: navBg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: navBorder,
          boxShadow: scrolled ? (isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)') : 'none',
          transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
          padding: '10px 16px',
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link
          to="hero"
          smooth
          duration={700}
          offset={-80}
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 800,
            fontSize: '18px',
            letterSpacing: '-0.04em',
            color: 'var(--color-on-surface)',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          Revan Zhafran
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-on-surface)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </motion.nav>

      {/* ──── Mobile Drawer ──── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 48,
                background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)',
              }}
            />

            {/* Menu */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'fixed',
                top: '72px',
                left: '16px',
                right: '16px',
                zIndex: 49,
                background: isDark ? 'rgba(17, 19, 24, 0.96)' : 'rgba(248, 249, 255, 0.96)',
                backdropFilter: 'blur(24px)',
                borderRadius: '20px',
                border: navBorder,
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.1)',
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  smooth
                  duration={700}
                  offset={-80}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: activeSection === link.to
                      ? 'var(--color-primary)'
                      : 'var(--color-on-surface-variant)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    background: activeSection === link.to
                      ? (isDark ? 'rgba(164,230,255,0.06)' : 'rgba(0,104,128,0.06)')
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="contact"
                smooth
                duration={700}
                offset={-80}
                onClick={() => setMobileOpen(false)}
                style={{
                  marginTop: '6px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-on-primary-container)',
                  background: 'var(--color-primary-container)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Hire Me
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        /* Desktop: show centered pill, hide mobile bar */
        @media (min-width: 901px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile { display: none !important; }
        }
        /* Mobile: show mobile bar, hide desktop pill */
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
