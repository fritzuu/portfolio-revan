import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

const services = [
  {
    icon: 'web',
    title: 'Frontend Development',
    desc: 'Building responsive, modern, and pixel-perfect user interfaces using React, Next.js, Vue.js, and Tailwind CSS. Focused on performance, accessibility, and seamless UX across all devices.',
    tags: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'Swift'],
  },
  {
    icon: 'dns',
    title: 'Backend Development',
    desc: 'Developing robust server-side applications and RESTful APIs with Laravel, Node.js, and PHP. Including authentication, role-based access control, and efficient data handling.',
    tags: ['Laravel', 'Node.js', 'PHP', 'REST API'],
  },
  {
    icon: 'storage',
    title: 'Database & Cloud',
    desc: 'Designing and managing scalable databases with MySQL, PostgreSQL, Supabase, and Firebase. Expertise in schema design, query optimization, and real-time data sync.',
    tags: ['MySQL', 'PostgreSQL', 'Supabase', 'Firebase'],
  },
  {
    icon: 'smart_toy',
    title: 'AI Integration',
    desc: 'Integrating AI-powered features into web applications using Gemini API and other AI services. Building intelligent assistants, content generation, and smart automation.',
    tags: ['Gemini API', 'Python', 'AI Chatbots'],
  },
  {
    icon: 'devices',
    title: 'Full Stack Solutions',
    desc: 'End-to-end development from concept to deployment. Building complete web applications with modern architectures, deployed on platforms like Vercel for optimal performance.',
    tags: ['Full Stack', 'Vercel', 'Docker', 'Git'],
  },
  {
    icon: 'design_services',
    title: 'UI/UX & Prototyping',
    desc: 'Crafting intuitive and visually appealing interfaces with Figma. Translating wireframes and designs into production-ready code with attention to modern design trends.',
    tags: ['Figma', 'Prototyping', 'Responsive Design'],
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="section-py">
      <div className="section-container">
        <FadeInSection style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: 700,
            fontSize: '32px',
            letterSpacing: '-0.02em',
            color: 'var(--color-on-surface)',
            marginBottom: '16px',
          }}>
            Services I Offer
          </h2>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive digital solutions tailored to your needs — from stunning frontends to powerful backends and everything in between.
          </p>
        </FadeInSection>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: '24px',
        }}>
          {services.map((service, i) => (
            <FadeInSection key={service.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="glass-panel"
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'rgba(0, 209, 255, 0.08)',
                    border: '1px solid rgba(0, 209, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary-container)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{service.icon}</span>
                </motion.div>

                {/* Title & Description */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: 'var(--color-on-surface)',
                    marginBottom: '8px',
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    color: 'var(--color-on-surface-variant)',
                    fontSize: '14px',
                    lineHeight: 1.7,
                  }}>
                    {service.desc}
                  </p>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {service.tags.map((tag) => (
                    <span key={tag} className="code-tag">{tag}</span>
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
