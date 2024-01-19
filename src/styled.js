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
    // Can't use the `useId` hook here because it isn't inside React.
    const id = generateUniqueId();
    const generatedClassName = `styled-${id}`;

    // The original styled function that creates a styled component
    return (templateStrings, ...interpolatedProps) => {
      return function StyledComponent(props) {
        let collectedStyles = cache();

        const currentStyle = collectedStyles.find((style) => style.id === id);
        if (currentStyle)
          return <Tag className={generatedClassName} {...props} />;

        let parentClassName;
        if (typeof Tag === 'function') {
          parentClassName = Tag().props.className;
        }

        const className = parentClassName
          ? `${parentClassName} ${generatedClassName}`
          : generatedClassName;

        // Concatenate the parts of the template string with the interpolated props.
        const generatedCSS = templateStrings.reduce((acc, current, i) => {
          const interpolatedValue = interpolatedProps[i]?.(props) || "";
          return acc + current + interpolatedValue;
        }, '');

        collectedStyles.push({
          id,
          styles: `.${generatedClassName} { ${generatedCSS} }`,
        });

        return <Tag className={className} {...props} />;
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

function generateUniqueId() {
  const timestamp = new Date().getTime().toString(16); // Marca de tiempo en hexadecimal
  const randomPart = (Math.random() * 16 ** 6).toString(16).padStart(6, "0"); // Número aleatorio en hexadecimal

  return `${timestamp}-${randomPart}`.replaceAll('.', '-');
}

export default styled;
