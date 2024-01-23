import React from 'react';

import StyleInserter from './StyleInserter';

export const cache = React.cache(() => {
  return [];
});

const sortFn = (a, b) => {
  const aClassCount = a.fullClassName?.split(' ').length;
  const bClassCount = b.fullClassName?.split(' ').length;

  if (aClassCount === bClassCount) {
    // If they have the same class count, maintain the original order.
    return 0;
  } else {
    // Sort by the number of classes in ascending order.
    return aClassCount - bClassCount;
  }
};

function StyleRegistry({ children }) {
  const collectedStyles = cache();
  const stylesMap = React.useMemo(
    () => collectedStyles.sort(sortFn).map(({ css }) => css),
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
