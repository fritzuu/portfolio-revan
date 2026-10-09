import { useSyncExternalStore } from 'react';
import { subscribe, getLanguage } from './core';
export function useLanguage() {
  return useSyncExternalStore(subscribe, getLanguage, () => 'en');
}
