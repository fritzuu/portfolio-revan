import { useCallback, useEffect, useRef, useState } from 'react';
import { cleanDiscoveries, DISCOVERIES } from '../game/exploration';
export default function useExploration() {
  const [discoveries, setDiscoveries] = useState(() => {
    try {
      return cleanDiscoveries(
        JSON.parse(localStorage.getItem('revan-field-notes')),
      );
    } catch {
      return [];
    }
  });
  const known = useRef(new Set(discoveries));
  const [latest, setLatest] = useState(null);
  const discover = useCallback((id) => {
    if (known.current.has(id) || !DISCOVERIES.some((d) => d.id === id)) return;
    known.current.add(id);
    setLatest(id);
    setDiscoveries((previous) => cleanDiscoveries([...previous, id]));
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('revan-field-notes', JSON.stringify(discoveries));
    } catch {
      /* Still playable without storage. */
    }
  }, [discoveries]);
  return { discoveries, discover, latest };
}
