import React from 'react';

import StyleInserter from './StyleInserter';

export const cache = React.cache(() => {
  return [];
});

function StyleRegistry({ children }) {
  const collectedStyles = cache();
  const stylesMap = React.useMemo(
    () =>
      collectedStyles.map(({ className, css }) => `.${className} { ${css} }`),
    [collectedStyles]
  );

  return (
    <>
      <StyleInserter styles={stylesMap} />
      {children}
    </>
  );
}

export default StyleRegistry;
