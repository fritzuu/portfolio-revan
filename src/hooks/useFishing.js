import { useCallback, useEffect, useReducer, useState } from 'react';
import {
  fishingReducer,
  initialFishing,
  parseFishing,
  SAVE_KEY,
} from '../fishing/engine';
export default function useFishing() {
  const [state, dispatch] = useReducer(fishingReducer, null, () => {
    try {
      return parseFishing(localStorage.getItem(SAVE_KEY));
    } catch {
      return initialFishing();
    }
  });
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      queueMicrotask(() => setStorageAvailable(false));
    }
  }, [state]);
  const catchFish = useCallback(
    (item) => dispatch({ type: 'catch', item }),
    [],
  );
  const cast = useCallback(() => dispatch({ type: 'cast' }), []);
  return { state, dispatch, catchFish, cast, storageAvailable };
}
