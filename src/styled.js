import React from 'react';

import { cache } from './components/cache';

// TODO: Ideally, this API would use dot notation (styled.div) in
// addition to function calls (styled('div')). We should be able to
// use Proxies for this, like Framer Motion does.
export default function styled(Tag) {
  return (css) => {
    return function StyledComponent(props) {
      let collectedStyles = cache();

      // Instead of using the filename, I'm using the `useId` hook to
      // generate a unique ID for each styled-component.
      const id = React.useId().replace(/:/g, '');
      const generatedClassName = `styled-${id}`;

      const styleContent = `.${generatedClassName} { ${css} }`;

      collectedStyles.push(styleContent);

      return <Tag className={generatedClassName} {...props} />;
    };
  };
}
