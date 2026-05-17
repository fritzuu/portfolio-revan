import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

const workExperience = [
  {
    role: 'Fullstack Developer',
    company: 'UGM Vocational State School',
    period: 'June 2023 – Jan 2024',
    icon: 'code',
    points: [
      'Optimized the responsive layout of the RumahEpsTopik website for seamless accessibility on mobile and desktop, enhancing user experience and ensuring a functional design across various screen sizes.',
      'Worked as a Backend Developer managing land, forest, and soil data for the KPH website, focusing on backend development, database optimization, and integrating data management functionalities for efficient data handling.',
    ],
  },
];

const orgExperience = [
  {
    role: 'OC Financial Logistic IGV Summer',
    company: 'AIESEC',
    period: 'Jan 2025 – Aug 2025',
    icon: 'account_balance',
    points: [
      'Directed the overall financial planning and budget allocation for the Incoming Global Volunteer (iGV) project, ensuring all funds were utilized efficiently.',
      'Coordinated end-to-end logistical requirements for international exchange participants, prioritizing safe and comfortable accommodations.',
    ],
  },
  {
    role: 'OC President IGV Winter',
    company: 'AIESEC',
    period: 'Aug 2025 – Jan 2026',
    icon: 'groups',
    points: [
      'Directed and managed a cross-functional Organizing Committee to successfully execute the Incoming Global Volunteer (iGV) project.',
      'Facilitated strategic partnerships and maintained strong communications with external stakeholders, including local NGOs, sponsors, and community partners.',
      'Acted as the primary liaison and problem-solver during operational crises, ensuring the safety and satisfaction of international exchange participants.',
    ],
  },
];

function TimelineCard({ item, index }) {
  return (
    <FadeInSection delay={index * 0.12}>
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: '16px',
          position: 'relative',
          display: 'flex',
          gap: '20px',
        }}
      >
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            width: '52px',
            height: '52px',
            minWidth: '52px',
            borderRadius: '12px',
            background: 'rgba(0, 209, 255, 0.08)',
            border: '1px solid rgba(0, 209, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary-container)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>{item.icon}</span>
        </motion.div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '8px',
          }}>
            <div>
              <h3 style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 600,
                fontSize: '18px',
                color: 'var(--color-on-surface)',
                marginBottom: '4px',
              }}>
                {item.role}
              </h3>
              <p style={{
                color: 'var(--color-primary)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}>
                {item.company}
              </p>
            </div>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: 'var(--color-on-surface-variant)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '4px 12px',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
            }}>
              {item.period}
            </span>
          </div>

          {/* Points */}
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '16px 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {item.points.map((point, i) => (
              <li key={i} style={{
                color: 'var(--color-on-surface-variant)',
                fontSize: '14px',
                lineHeight: 1.7,
                paddingLeft: '20px',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '2px',
                  color: 'var(--color-primary-container)',
                  fontSize: '10px',
                }}>▸</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </FadeInSection>
  );
}

export default function ExperienceSection() {
  return (
    <section id="experience" className="section-py">
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
            Experience
          </h2>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '0 auto' }}>
            My professional journey and leadership roles that have shaped my skills and perspective.
          </p>
        </FadeInSection>

        {/* Work Experience */}
        <FadeInSection>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '22px',
              color: 'var(--color-primary-container)',
            }}>work</span>
            <h3 style={{
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              fontSize: '20px',
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.01em',
            }}>
              Work Experience
            </h3>
          </div>
        </FadeInSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
          {workExperience.map((item, i) => (
            <TimelineCard key={item.role} item={item} index={i} />
          ))}
        </div>

        {/* Organizational Experience */}
        <FadeInSection>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '22px',
              color: 'var(--color-primary-container)',
            }}>diversity_3</span>
            <h3 style={{
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              fontSize: '20px',
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.01em',
            }}>
              Organizational Experience
            </h3>
          </div>
        </FadeInSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orgExperience.map((item, i) => (
            <TimelineCard key={item.role} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
