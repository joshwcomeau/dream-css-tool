import React from 'react';

import StyleInserter from './StyleInserter';

export const cache = React.cache(() => {
  return [];
});

function StyleRegistry({ children }) {
  const collectedStyles = cache();
  const stylesMap = collectedStyles.map(({ styles }) => styles);

  return (
    <>
      <StyleInserter styles={stylesMap} />
      {children}
    </>
  );
}

export default StyleRegistry;
