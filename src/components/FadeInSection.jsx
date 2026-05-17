import { motion } from 'framer-motion';

/**
 * Reusable fade-in-on-scroll wrapper using Framer Motion + IntersectionObserver.
 */
export default function FadeInSection({ children, delay = 0, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
