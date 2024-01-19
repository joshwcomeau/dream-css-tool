import React from 'react';
import { cache } from './components/StyleRegistry';
import { areObjectsEqual } from './utils';

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
    return (templateStrings, ...interpolatedProps) => {
      return function StyledComponent(props) {
        const collectedStyles = cache();

        const id = React.useId().replace(/:/g, '');
        const generatedClassName = `styled-${id}`;

        const { className: propsClassName, children, ...restProps } = props;

        // Concatenate the parts of the template string with the interpolated props.
        const generatedCSS = templateStrings.reduce((acc, current, i) => {
          const interpolatedValue = interpolatedProps[i]?.(props) || '';
          return acc + current + interpolatedValue;
        }, '');

        const currentStyle = collectedStyles.find(
          (style) => style.css === generatedCSS
        );

        const parentClassName =
          typeof Tag === 'function' ? Tag(props)?.props?.className : undefined;

        const fullClassName = parentClassName
          ? `${parentClassName} ${generatedClassName}`
          : generatedClassName;

        if (currentStyle) {
          // If they have the same styles and props, just use the same full class name
          if (areObjectsEqual(currentStyle.props, restProps))
            return <Tag className={currentStyle.fullClassName} {...props} />;

          // If they have the same styles but different props, use the parent class name, and the current style one
          const className = parentClassName
            ? `${parentClassName} ${currentStyle.className}`
            : currentStyle.className;
          return <Tag className={className} {...props} />;
        }

        collectedStyles.push({
          fullClassName,
          className: generatedClassName,
          props: restProps,
          css: generatedCSS,
        });

        return <Tag className={fullClassName} {...props} />;
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
