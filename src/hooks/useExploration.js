import { useCallback, useEffect, useState } from 'react';
import { cleanDiscoveries } from '../game/exploration';
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
  const discover = useCallback(
    (id) =>
      setDiscoveries((previous) => {
        const next = cleanDiscoveries([...previous, id]);
        return next.length === previous.length ? previous : next;
      }),
    [],
  );
  useEffect(() => {
    try {
      localStorage.setItem('revan-field-notes', JSON.stringify(discoveries));
    } catch {
      /* Still playable without storage. */
    }
  }, [discoveries]);
  return { discoveries, discover };
}
