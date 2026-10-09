import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { t, getLanguage, setLanguage, subscribe } from '../src/i18n/core.js';
import { translateTree } from '../src/i18n/tree.js';

test('both languages cover opening, character choices, cutscene and game instructions', () => {
  assert.equal(
    t('WELCOME TO MY LITTLE CORNER OF THE INTERNET', 'id'),
    'SELAMAT DATANG DI DUNIA KECILKU',
  );
  assert.equal(t('Skin tone', 'id'), 'Warna kulit');
  assert.equal(
    t('Koneksi terputus. Muat ulang untuk mencoba lagi.', 'en'),
    'Connection lost. Reload to try again.',
  );
  assert.equal(
    t('Keep it inside your net.', 'id'),
    'Jaga agar tetap di dalam jaringmu.',
  );
  assert.equal(t('Keeper catches it!', 'id'), 'Kiper menangkapnya!');
  assert.ok(
    t(
      'Every project starts with a little curiosity. What if a portfolio could become a place you can actually explore?',
      'id',
    ).startsWith('Setiap proyek'),
  );
});

test('dynamic messages preserve numbers and names and translate embedded difficulty', () => {
  assert.equal(
    t('Sold 3 catches for 25 coins.', 'id'),
    'Menjual 3 tangkapan seharga 25 koin.',
  );
  assert.equal(t('Maksimal 150 karakter.', 'en'), 'Maximum 150 characters.');
  assert.equal(t('Tim Messi · Sengit', 'en'), 'Messi team · Intense');
  assert.equal(
    t('Astralhook purchased and equipped.', 'id'),
    'Astralhook dibeli dan dipakai.',
  );
  assert.equal(t('React', 'id'), 'React');
});

test('translation changes visible text and accessibility labels without changing input data or routing', () => {
  const source = createElement(
    'section',
    { id: 'shop', className: 'fishing' },
    createElement('button', { 'aria-label': 'Cast a line' }, 'Cast a line'),
    createElement('input', { value: 'Projects', placeholder: 'Nama kamu' }),
  );
  const id = translateTree(source, 'id');
  const en = translateTree(source, 'en');
  assert.equal(id.props.id, 'shop');
  assert.equal(id.props.className, 'fishing');
  assert.deepEqual(id.props.children[0].props.children, ['Lempar kail']);
  assert.equal(id.props.children[0].props['aria-label'], 'Lempar kail');
  assert.equal(id.props.children[1].props.value, 'Projects');
  assert.equal(en.props.children[1].props.placeholder, 'Your name');
  assert.equal(source.props.children[1].props.placeholder, 'Nama kamu');
});

test('language changes notify active screens, persist the choice and ignore invalid values', () => {
  const previous = getLanguage();
  const oldStorage = globalThis.localStorage;
  const oldDocument = globalThis.document;
  const writes = [];
  let calls = 0;
  globalThis.localStorage = { setItem: (...args) => writes.push(args) };
  globalThis.document = { documentElement: { lang: previous } };
  const unsubscribe = subscribe(() => calls++);
  try {
    const next = previous === 'en' ? 'id' : 'en';
    setLanguage(next);
    assert.equal(getLanguage(), next);
    assert.equal(calls, 1);
    assert.equal(globalThis.document.documentElement.lang, next);
    assert.deepEqual(writes[0], ['revan-world-language', next]);
    setLanguage(next);
    setLanguage('invalid');
    assert.equal(calls, 1);
  } finally {
    unsubscribe();
    setLanguage(previous);
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
  }
});
