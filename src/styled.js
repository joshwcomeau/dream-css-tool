import React from 'react';

import { cache } from './components/StyleRegistry';

export default function styled(Tag, css) {
  return function StyledComponent(props) {
    let collectedStyles;
    try {
      collectedStyles = cache();
    } catch (err) {
      collectedStyles = { current: [] };
    }

    const id = React.useId().replace(/:/g, '');
    const generatedClassName = `styled-${id}`;

    const styleContent = `.${generatedClassName} { ${css} }`;

    collectedStyles.current.push(styleContent);

    return (
      <>
        <Tag className={generatedClassName} {...props} />
      </>
    );
  };
}
