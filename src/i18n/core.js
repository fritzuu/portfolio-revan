import messages from './messages.js';
const listeners = new Set();
let language = 'en';
try {
  language =
    localStorage.getItem('revan-world-language') ||
    (navigator.language.startsWith('id') ? 'id' : 'en');
} catch {
  /* Optional browser storage. */
}
if (!['id', 'en'].includes(language)) language = 'en';
const normalize = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
const exact = new Map();
const cache = { id: new Map(), en: new Map() };
const remember = (source, result, locale) => {
  const entries = cache[locale === 'id' ? 'id' : 'en'];
  if (entries.size >= 2000) entries.clear();
  entries.set(source, result);
  return result;
};
const templates = [];
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const pair of messages) {
  pair.forEach((text, side) => {
    if (text.includes('{n}')) {
      templates.push({
        pattern: new RegExp(
          '^' + text.split('{n}').map(escape).join('(.+?)') + '$',
          'i',
        ),
        pair,
        side,
      });
    } else exact.set(normalize(text), pair);
  });
}
export function getLanguage() {
  return language;
}
export function setLanguage(next) {
  if (!['id', 'en'].includes(next) || next === language) return;
  language = next;
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  try {
    localStorage.setItem('revan-world-language', next);
  } catch {
    /* Keep choice in memory. */
  }
  listeners.forEach((listener) => listener());
}
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function t(source, locale = language) {
  if (typeof source !== 'string' || !source.trim()) return source;
  const cached = cache[locale === 'id' ? 'id' : 'en'].get(source);
  if (cached !== undefined) return cached;
  const text = source.replace(/\s+/g, ' ').trim();
  const pair = exact.get(normalize(text));
  let result = pair?.[locale === 'id' ? 1 : 0];
  if (!result) {
    for (const template of templates) {
      const match = text.match(template.pattern);
      if (!match) continue;
      let index = 1;
      result = template.pair[locale === 'id' ? 1 : 0].replace(/\{n\}/g, () =>
        t(match[index++], locale),
      );
      break;
    }
  }
  if (!result) return remember(source, source, locale);
  if (text === text.toUpperCase() && /[A-Z]/.test(text))
    result = result.toUpperCase();
  return remember(
    source,
    (source.match(/^\s*/)?.[0] || '') +
      result +
      (source.match(/\s*$/)?.[0] || ''),
    locale,
  );
}
