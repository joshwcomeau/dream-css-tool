"use client";
import { cache } from './cache';
import StyleInserter from './StyleInserter';

export default function StyleRegistryClient() {
  const collectedStyles = cache();
  console.log("collectedStyles client", collectedStyles)

  return <StyleInserter styles={collectedStyles} />;
}
