import { cache } from './cache';
import StyleInserter from './StyleInserter';

export default function StyleRegistryServer() {
  const collectedStyles = cache();
  console.log("collectedStyles server", collectedStyles)

  return <StyleInserter styles={collectedStyles} />;
}
