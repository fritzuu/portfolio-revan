import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ExperienceSection from './components/ExperienceSection';
import CertificatesSection from './components/CertificatesSection';
import ProjectsSection from './components/ProjectsSection';
import ServicesSection from './components/ServicesSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {/* Fixed ambient blobs */}
      <div className="bg-grid-pattern" style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: '25%',
        width: '500px',
        height: '500px',
        background: isDark ? 'rgba(0, 209, 255, 0.07)' : 'rgba(0, 150, 200, 0.06)',
        borderRadius: '9999px',
        filter: 'blur(120px)',
        pointerEvents: 'none',
        transform: 'translateY(-50%)',
        mixBlendMode: isDark ? 'screen' : 'multiply',
        zIndex: -1,
        transition: 'background 0.4s ease',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: isDark ? 'rgba(255, 213, 156, 0.04)' : 'rgba(200, 160, 100, 0.05)',
        borderRadius: '9999px',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: -1,
        transition: 'background 0.4s ease',
      }} />

      <Navbar />

      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <CertificatesSection />
        <ProjectsSection />
        <ServicesSection />
        <ContactSection />
      </main>

      <ThemeToggle />
      <Footer />
    </>
  );
}
