import { Children } from 'react';
import { useLanguage } from './hooks';
import { translateTree } from './tree';
export function Localized({ children }) {
  const language = useLanguage();
  return Children.map(children, (child) => translateTree(child, language));
}
