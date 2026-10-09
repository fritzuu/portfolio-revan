import { readFileSync } from 'node:fs';
export const seed = JSON.parse(
  readFileSync(new URL('../src/data/portfolio.json', import.meta.url)),
);
export const validText = (v, min, max) =>
  typeof v === 'string' && v.trim().length >= min && v.length <= max;
const safeLink = (v) =>
  v === null ||
  (typeof v === 'string' && (/^https:\/\//.test(v) || /^\/(?!\/)/.test(v)));
export function validPortfolio(p) {
  return (
    p &&
    validText(p.profile?.name, 1, 100) &&
    validText(p.profile?.role, 1, 100) &&
    validText(p.profile?.bio, 1, 2000) &&
    validText(p.profile?.email, 3, 200) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.profile.email) &&
    ['github', 'linkedin', 'whatsapp', 'cv'].every(
      (k) => safeLink(p.profile[k]) && p.profile[k],
    ) &&
    Array.isArray(p.projects) &&
    p.projects.length <= 30 &&
    p.projects.every(
      (v) =>
        validText(v.title, 1, 100) &&
        validText(v.desc, 1, 3000) &&
        Array.isArray(v.tags) &&
        v.tags.length <= 20 &&
        v.tags.every((t) => validText(t, 1, 60)) &&
        typeof v.img === 'string' &&
        safeLink(v.img) &&
        safeLink(v.demoLink) &&
        safeLink(v.codeLink),
    ) &&
    Array.isArray(p.services) &&
    p.services.length <= 20 &&
    p.services.every(
      (v) =>
        validText(v.title, 1, 100) &&
        validText(v.desc, 1, 3000) &&
        Array.isArray(v.tags) &&
        v.tags.every((t) => validText(t, 1, 60)),
    ) &&
    Array.isArray(p.skills) &&
    p.skills.length <= 20 &&
    p.skills.every(
      (v) =>
        validText(v.title, 1, 100) &&
        Array.isArray(v.tags) &&
        v.tags.every((t) => validText(t, 1, 60)),
    ) &&
    Array.isArray(p.experience) &&
    p.experience.length <= 30 &&
    p.experience.every(
      (v) =>
        ['role', 'company', 'period'].every((k) => validText(v[k], 1, 150)) &&
        Array.isArray(v.points) &&
        v.points.every((t) => validText(t, 1, 3000)),
    ) &&
    Array.isArray(p.certificates) &&
    p.certificates.length <= 30 &&
    p.certificates.every(
      (v) =>
        ['title', 'issuer', 'issued'].every((k) => validText(v[k], 1, 150)) &&
        safeLink(v.link) &&
        v.link,
    )
  );
}
