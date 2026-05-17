import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

const projects = [
  {
    title: 'Image Compression',
    desc: 'A fast and efficient image compression tool built with React JS and Vite. Hosted on Vercel.',
    tags: ['React JS', 'Vite', 'Vercel'],
    img: '/image.png',
    imgAlt: 'Image Compression App',
    demoLink: 'https://image-compressor-wheat.vercel.app/',
    codeLink: 'https://github.com/fritzuu/svdproject-reactjs.git',
    demoLabel: 'Live Demo',
  },
  {
    title: 'Lyrictify',
    desc: 'A macOS menu bar application built with Swift that fetches lyrics, shows your Spotify queue, and displays currently playing tracks directly in the top bar.',
    tags: ['Swift', 'macOS', 'Spotify API'],
    img: '/LYRICTIFY.png',
    imgAlt: 'Lyrictify macOS App',
    demoLink: null,
    codeLink: 'https://github.com/fritzuu/Lyrictify',
    demoLabel: 'View',
  },
  {
    title: 'Cashflow Management (UMKM)',
    desc: 'A cashflow management application designed specifically for a Kue Bolu Kukus to help track income, monitor expenses, and manage financial health. also included with Gemini AI as personal assistant for user to ask any question related to finance or how to manage their business',
    tags: ['Next.js', 'Tailwind', 'PostgreSQL', 'Supabase', 'Gemini API'],
    img: '/legitbites.png',
    imgAlt: 'Cashflow Management App',
    demoLink: 'https://legitbites-cashflow-deployment-ej2y1as9d-fritzuus-projects.vercel.app/login',
    codeLink: 'https://github.com/BufuMabufu/legitbites-cashflow-management',
    demoLabel: 'Demo',
  },
];

function ProjectCard({ project, index }) {
  return (
    <FadeInSection delay={index * 0.1}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 280 }}
        className="glass-panel"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Image */}
        <div style={{
          position: 'relative',
          height: '200px',
          overflow: 'hidden',
          background: 'var(--color-surface-container)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            src={project.img}
            alt={project.imgAlt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain', 
              objectPosition: 'center',
              imageRendering: 'high-quality',
              transition: 'transform 0.6s ease',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: '20px', color: 'var(--color-on-surface)', marginBottom: '8px' }}>
            {project.title}
          </h3>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
            {project.desc}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {project.tags.map((tag) => (
              <span key={tag} className="code-tag">{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '16px',
          }}>
            {project.demoLink && (
              <a
                href={project.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-on-surface)',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-on-surface)'}
              >
                {project.demoLabel}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
              </a>
            )}
            {project.codeLink && (
              <a
                href={project.codeLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-on-surface-variant)',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
              >
                Code
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>code</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </FadeInSection>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="section-py">
      <div className="section-container">
        <FadeInSection style={{ textAlign: 'center', marginBottom: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--color-on-surface)', marginBottom: '16px' }}>
            Selected Work
          </h2>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '480px', margin: '0 auto 24px' }}>
            A collection of recent projects showcasing my full stack capabilities.
          </p>
          <a
            href="https://github.com/fritzuu"
            target="_blank"
            rel="noopener noreferrer"
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
            View GitHub
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
          </a>
        </FadeInSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '24px' }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
