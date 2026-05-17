import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

const skillGroups = [
  {
    icon: 'web',
    title: 'Frontend',
    tags: ['HTML/CSS', 'JavaScript', 'Tailwind CSS', 'React', 'Next.JS', 'Swift', 'Java Swing', 'Vue.JS'],
  },
  {
    icon: 'dns',
    title: 'Backend',
    tags: ['PHP', 'Laravel', 'Node.js'],
  },
  {
    icon: 'storage',
    title: 'Database',
    tags: ['MySQL', 'PostgreSQL', 'Supabase', 'Firebase'],
  },
  {
    icon: 'build',
    title: 'Tools & AI',
    tags: ['Git', 'Figma', 'Docker', 'VS Code', 'Python', 'Gemini API', 'Rest API'],
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="section-py">
      <div className="section-container">
        <FadeInSection style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--color-on-surface)', marginBottom: '16px' }}>
            Technical Arsenal
          </h2>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '0 auto' }}>
            The tools and frameworks I use to build robust digital experiences.
          </p>
        </FadeInSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '24px' }}>
          {skillGroups.map((group, i) => (
            <FadeInSection key={group.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="glass-panel"
                style={{ padding: '24px', borderRadius: '12px', height: '100%' }}
              >
                <h3 style={{
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: 'var(--color-on-surface)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>
                    {group.icon}
                  </span>
                  {group.title}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {group.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      whileHover={{ scale: 1.08 }}
                      className="tag-pill"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
