import React from 'react';
import { cache } from './components/StyleRegistry';
import { areObjectsEqual } from './utils';
import {
  removeCSSComments,
  interpolateProps,
  formatCSSBlocks,
  findExistingStyle,
} from './helpers';

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

        const cleanedCSS = removeCSSComments(templateStrings);

        const interpolatedCSS = cleanedCSS.reduce(
          (acc, current, i) =>
            acc + current + interpolateProps(interpolatedProps[i], props),
          ''
        );

        const {
          styles: finalCSS,
          mainBlock,
          subBlocks,
        } = formatCSSBlocks(interpolatedCSS, generatedClassName);

        const matchedStyle = findExistingStyle(collectedStyles, mainBlock, Tag);

        const hasParentComponent = typeof Tag === 'function';

        // If tag is another styled-component, we need to get that className in order to use it from the child.
        const parentClassName = hasParentComponent
          ? Tag(props)?.props?.className
          : '';

        // If there's no parentClassName, that space gets removed when trimmed
        const fullClassName = `${parentClassName} ${generatedClassName}`.trim();

        if (matchedStyle) {
          // If they have the same styles and props, just use the same full class name (parent className + )
          if (areObjectsEqual(matchedStyle.props, restProps)) {
            return <Tag className={matchedStyle.fullClassName} {...props} />;
          }

          // If they have the same styles but different props, use the current parent class name, and the matched style one
          const className =
            `${parentClassName} ${matchedStyle.className}`.trim();

          return <Tag className={className} {...props} />;
        }

        collectedStyles.push({
          fullClassName,
          className: generatedClassName,
          props: restProps,
          css: finalCSS,
        });

        if (subBlocks) {
          collectedStyles.push({
            css: subBlocks,
          });
        }

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
