"use client";
import { cache } from './cache';
import StyleInserter from './StyleInserter';

export default function StyleRegistryClient() {
  const collectedStyles = cache();

  return <StyleInserter styles={collectedStyles} />;
}
