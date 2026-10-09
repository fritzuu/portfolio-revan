import { useEffect, useState } from 'react';
import PixelCharacter from './PixelCharacter';

const REVAN = { gender: 'male', outfit: 1, skin: 0, revan: true };

export function StartBackdrop() {
  return (
    <div className="start-backdrop" aria-hidden="true">
      <div className="start-grid" />
      <div className="start-orbit orbit-one" />
      <div className="start-orbit orbit-two" />
      <div className="start-pixel pixel-one" />
      <div className="start-pixel pixel-two" />
      <div className="start-pixel pixel-three" />
      <div className="start-horizon" />
    </div>
  );
}

export default function AdventureLoading({ prepare, onReady, reduced }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let timer;
    const arrival = new Promise((resolve) => {
      timer = setTimeout(resolve, reduced ? 300 : 1400);
    });
    Promise.all([prepare(), arrival])
      .then(() => {
        if (active) onReady();
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [prepare, onReady, reduced]);
  return (
    <section
      className={`adventure-loading${reduced ? ' motion-reduced' : ''}`}
      aria-label="Menyiapkan petualangan"
      aria-busy={!failed}
    >
      <span className="loading-kicker">A LITTLE WORLD BY REVAN</span>
      <div className="loading-avatar">
        <PixelCharacter
          character={REVAN}
          size={144}
          animated={!reduced && !failed}
          label="Revan berjalan dengan hoodie biru dan kacamata"
        />
        <div className="loading-trail" />
      </div>
      <h1>
        {failed
          ? 'Jalannya belum terbuka.'
          : 'Sebentar, aku siapkan dunia kita.'}
      </h1>
      <p role="status">
        {failed
          ? 'Koneksi terputus. Muat ulang untuk mencoba lagi.'
          : 'Setelah ini, pilih karakter untuk petualanganmu.'}
      </p>
      {failed ? (
        <button className="button" onClick={() => window.location.reload()}>
          Muat ulang
        </button>
      ) : (
        <div className="loading-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
    </section>
  );
}
