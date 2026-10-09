import { Localized } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import PixelCharacter from './PixelCharacter';
import { drawTitleVillage, titleTime } from '../game/titleVillage';

const REVAN = { gender: 'male', outfit: 1, skin: 0, revan: true };

export function StartBackdrop() {
  const canvas = useRef(null);
  const [time, setTime] = useState(() => titleTime(new Date().getHours()));
  useEffect(() => {
    const update = () => setTime(titleTime(new Date().getHours()));
    const interval = setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  useEffect(() => {
    const c = canvas.current.getContext('2d');
    c.imageSmoothingEnabled = false;
    drawTitleVillage(c, time);
  }, [time]);
  return (
    <Localized>
      <div className={`start-backdrop village-${time}`} aria-hidden="true">
        <canvas ref={canvas} width={640} height={360} />
        <div className="village-shade" />
      </div>
    </Localized>
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
    <Localized>
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
    </Localized>
  );
}
