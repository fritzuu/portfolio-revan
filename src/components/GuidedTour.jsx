import { Localized } from '../i18n';
import PixelCharacter from './PixelCharacter';
export default function GuidedTour({
  tour,
  moving,
  onStart,
  onSkip,
  onNext,
  onOpen,
  onResume,
}) {
  const stops = [
    [
      'Project Studio',
      'Di sini kamu bisa melihat karya yang kubangun, teknologi yang dipakai, dan hasilnya.',
    ],
    [
      'Skill Workshop',
      'Ini bekal kerjaku: kemampuan teknis dan layanan yang bisa kubantu kerjakan.',
    ],
    [
      'About House',
      'Kenalan lebih dekat denganku di sini. Kamu juga bisa membaca dan mengunduh CV-ku.',
    ],
  ];
  const offer = tour.status === 'offer',
    done = tour.status === 'done';
  const walking = tour.status === 'walking';
  return (
    <Localized>
      <section className="guided-tour" aria-label="Tur bersama Revan">
        <div className="tour-guide-avatar">
          <PixelCharacter
            character={{ gender: 'male', outfit: 1, skin: 0, revan: true }}
            size={64}
            label="Revan, pemandu tur"
          />
        </div>
        <div className="tour-dialogue">
          <small>
            REVAN ·{' '}
            {offer
              ? 'Pemandu duniamu'
              : done
                ? 'Tur selesai'
                : `Tur portfolio ${tour.step + 1}/3`}
          </small>
          <h3>
            {offer
              ? 'Mau kuantar keliling?'
              : done
                ? 'Sekarang, dunia ini milikmu.'
                : stops[tour.step][0]}
          </h3>
          <p>
            {offer
              ? 'Kenali karya, skill, dan profilku lewat tur singkat. Kamu bisa melewatinya kapan saja.'
              : done
                ? 'Mau ngobrol soal proyek? Temui aku di Contact. Atau coba mancing, main bola, dan cari rahasia desa.'
                : walking
                  ? 'Yuk, ikuti aku ke pemberhentian berikutnya.'
                  : stops[tour.step][1]}
          </p>
          <div className="tour-actions">
            {offer ? (
              <button className="button primary" onClick={onStart}>
                Ikut tur
              </button>
            ) : done ? (
              <button className="button primary" onClick={onOpen}>
                Hubungi Revan
              </button>
            ) : walking ? (
              <button
                className="button primary"
                disabled={moving}
                onClick={onResume}
              >
                {moving ? 'Sedang berjalan…' : 'Lanjutkan perjalanan'}
              </button>
            ) : (
              <>
                <button className="button primary" onClick={onOpen}>
                  Lihat isinya ↗
                </button>
                <button className="button" onClick={onNext}>
                  {tour.step === 2 ? 'Selesaikan tur' : 'Lanjut →'}
                </button>
              </>
            )}
            <button className="tour-skip" onClick={onSkip}>
              {offer
                ? 'Jelajah sendiri'
                : done
                  ? 'Mulai menjelajah'
                  : 'Lewati tur'}
            </button>
          </div>
        </div>
      </section>
    </Localized>
  );
}
