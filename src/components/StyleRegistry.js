import React from 'react';

import StyleInserter from './StyleInserter';

export const cache = React.cache(() => {
  return [];
});

function StyleRegistry({ children }) {
  const collectedStyles = cache();

  return (
    <>
      <StyleInserter styles={collectedStyles} />
      {children}
    </>
  );
}

export default StyleRegistry;
