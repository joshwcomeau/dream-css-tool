import React from 'react';
import { cache } from './components/StyleRegistry';

/**
 * @typedef {(css: TemplateStringsArray) => React.FunctionComponent<React.HTMLProps<HTMLElement>>} StyledFunction
 * @typedef {Record<keyof JSX.IntrinsicElements, StyledFunction> & { (tag: keyof JSX.IntrinsicElements | React.ComponentType<any>): StyledFunction }} StyledInterface
 */

/**
 * Creating a Proxy around the `styled` function.
 * This allows us to intercept property accesses (like styled.div)
 * and treat them as function calls (like styled('div')).
 *
 * @type {StyledInterface}
 */
const styled = new Proxy(
  function (Tag) {
    // The original styled function that creates a styled component
    return (css) => {
      return function StyledComponent(props) {
        let collectedStyles = cache();

        // Using the `useId` hook to generate a unique ID for each styled-component.
        const id = React.useId().replace(/:/g, "");
        const generatedClassName = `styled-${id}`;

        const styleContent = `.${generatedClassName} { ${css} }`;

        collectedStyles.push(styleContent);

        return <Tag className={generatedClassName} {...props} />;
      };
    };
  },
  {
    get: function (target, prop) {
      // Intercepting property access on the `styled` function.
      if (typeof prop === 'string') {
        // If the property is a string, call the original `styled` function with the property name as the tag.
        return target(prop);
      }
      // Default behavior for other properties
      return Reflect.get(target, prop);
    },
  }
);

export default styled;
