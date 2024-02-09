import { cache } from './cache';
import StyleInserter from './StyleInserter';

export default function StyleRegistryServer() {
  const collectedStyles = cache();

  return <StyleInserter styles={collectedStyles} />;
}
