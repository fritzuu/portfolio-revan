import { Children, cloneElement, isValidElement } from 'react';
import { t, getLanguage } from './core.js';
export function translateTree(node, locale = getLanguage()) {
  if (typeof node === 'string') return t(node, locale);
  if (!isValidElement(node)) return node;
  const props = {};
  for (const key of [
    'title',
    'placeholder',
    'alt',
    'aria-label',
    'aria-valuetext',
  ]) {
    if (typeof node.props[key] === 'string')
      props[key] = t(node.props[key], locale);
  }
  if (node.props.children !== undefined)
    props.children = Children.map(node.props.children, (child) =>
      translateTree(child, locale),
    );
  return cloneElement(node, props);
}
