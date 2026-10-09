import {
  Code2,
  Gamepad2,
  Paintbrush,
  Database,
  Image,
  HardDrive,
  ArrowRight,
} from 'lucide-react';
import { Localized } from '../i18n';

const TECHNOLOGY = [
  [
    Code2,
    'React + Vite',
    'The interface',
    'Menus, portfolio rooms and character selection are built with React. Vite bundles the website.',
  ],
  [
    Gamepad2,
    'Phaser',
    'The living world',
    'Phaser draws the pixel world on canvas and handles movement, collisions, NPCs, fishing and football.',
  ],
  [
    Paintbrush,
    'Canvas + pixel sprites',
    'The artwork',
    'Trees, buildings and scenery use original pixel artwork. Jekek and Darkrai also use reference sprites.',
  ],
  [
    Database,
    'Express + Supabase',
    'The backend',
    'Express connects the website to Supabase for portfolio content, private contact messages and authenticated admin access.',
  ],
  [
    Image,
    'ImgBB',
    'Project images',
    'Images uploaded through the admin editor are hosted on ImgBB. Their links are stored with the portfolio content.',
  ],
  [
    HardDrive,
    'localStorage',
    'Your adventure',
    'Your character, discoveries, fish, coins, rods and language choice stay in this browser. No player account is needed.',
  ],
];
const CONTENT = [
  [
    'Portfolio rooms',
    'Five buildings introduce Revan, his projects, tools and services, experience and certificates, and contact details.',
    'Visit the project studio',
    'projects',
  ],
  [
    'Moonwater fishing',
    'Catch 20 fantasy creatures, keep a fish journal, sell catches and buy three rods with different luck bonuses. Discover 12 species to open Astral Crossing.',
    'Head to the water',
    'fishing',
  ],
  [
    'Football with friends',
    'Play with Messi, Lamine Yamal and the residents. Dribble, tackle, pass and charge your shots while keepers try to save. Each match has two one-minute halves.',
    'Visit the football park',
    'football',
  ],
  [
    'Personal discoveries',
    'Meet Jekek the python, find Darkrai in Dream Grove, read Revan’s field notes and watch resident anglers. Morning and night alternate every two minutes inside the game.',
    'Explore the map',
    'map',
  ],
];
export default function WorldInsights({ onTravel, onView }) {
  return (
    <Localized>
      <div className="world-insights">
        <p className="insights-lead">
          A portfolio you can walk through. The little games and personal
          details lead you to the work and the person behind it.
        </p>
        <section aria-labelledby="world-content-heading">
          <h3 id="world-content-heading">What’s inside?</h3>
          <div className="insights-content">
            {CONTENT.map(([title, description, action, destination]) => (
              <article key={destination}>
                <h4>{title}</h4>
                <p>{description}</p>
                <button
                  className="button"
                  onClick={() =>
                    destination === 'map'
                      ? onView('map')
                      : onTravel(destination)
                  }
                >
                  {action}
                  <ArrowRight size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="world-tech-heading">
          <h3 id="world-tech-heading">How was this world built?</h3>
          <div className="insights-tech">
            {TECHNOLOGY.map(([Icon, stack, title, description]) => (
              <article key={stack}>
                <Icon size={24} aria-hidden="true" />
                <div>
                  <span className="insights-stack">{stack}</span>
                  <h4>{title}</h4>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Localized>
  );
}
