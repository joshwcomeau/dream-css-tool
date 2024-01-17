# My Dream CSS-in-JS Tool

The short version: styled-components, but without a client runtime. Built for Next.js.

The goal is to build something that is fully compatible with React Server Components. We shouldn't need to add the `"use client"` directive in order to add styled components.

This does require making some sacrifices. For example, it probably couldn't support [dynamic prop interpolations](https://styled-components.com/docs/basics#adapting-based-on-props), and it definitely couldn't support `ThemeProvider`. Instead, we'll use CSS variables for dynamic content and theming.

Here's a quick example:

```jsx
// app/components/Demo.js
import styled from 'dream-tool';

function Demo({ width }) {
  return (
    <Wrapper style={{ '--color:' width > 500 ? 'red' : undefined }}>
      Hello world
    </Wrapper>
  );
}

const Wrapper = styled.section`
  display: flex;
  justify-content: center;
  color: var(--color);
`;
```

Presuming that this is the only component in the project, here's what the resulting server-rendered HTML should be:

```html
<html>
  <head>
    <style>
      .app_components_Demo_Wrapper {
        display: flex;
        justify-content: center;
        color: var(--color_);
      }
    </style>
  </head>
  <body>
    <section class="app_components_Demo_Wrapper">Hello world</section>
  </body>
</html>
```

The classes are derived from the filename. This ensures global uniqueness, and _should_ allow us to reference these components like this:

```js
const Quote = styled.blockquote`
  font-style: italic;
`;

const Link = styled.a`
  /* Default styles */
  color: var(--color-primary);

  /* Styles when Link is inside Quote: */
  ${Quote} & {
    color: inherit;
  }
`;
```

The resulting CSS should be:

```css
.app_components_Demo_Quote {
  font-style: italic;
}

.app_components_Demo_Link {
  color: var(--color-primary);
}
.app_components_Demo_Quote .app_components_Demo_Link {
  color: inherit;
}
```

This, in a nutshell, is what I wish existed. A fully static CSS-in-JS approach that allows us to reference one component within another.

(I realize that in a larger application, the file paths would be quite long. Maybe gzip will help us out here. If not, we can always hash the paths in production.)

## Generating the class names

I believe we'll need to have a compile step that will generate these class names. I'm imagining a Babel (or SWC?) plugin that does the following transformation:

```js
// Before
const Wrapper = styled.div`
  color: red;
`;

// After
const Wrapper = styled('div', 'app_components_Demo_Wrapper')`
  color: red;
`;
```

This way, the `styled` component receives this class name, and can do the work of preparing the CSS during the server-side render.

## Applying the CSS

This is where things get tricky. 😅

The very first thing I tried looked like this:

```jsx
'use client';
import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';

export default function styled(Tag, css, compiledClassName) {
  return function StyledComponent(props) {
    useServerInsertedHTML(() => {
      return (
        <style>{`
        .${compiledClassName} {
          ${css}
        }
      `}</style>
      );
    });

    return <Tag className={compiledClassName} {...props} />;
  };
}
```

The `useServerInsertedHTML` hook is provided by Next as a way to inject some stuff into the `<head>` of the generated HTML file, during Server Side Rendering.

There's two problems with this approach:

1. `useServerInsertedHTML` requires the `"use client"` directive, which means that any file that _imports_ it would also need to be a Client Component. This means we can't use this approach in a Server Component.
2. By doing it right in the styled-component, it means that every single style would generate its own `<style>` tag, which would bloat the HTML file. Ideally, they should all be collected within a single `<style>` tag.

To solve the 2nd problem, CSS-in-JS libraries in Next.js use a "registry" approach. A registry is a component that wraps around the entire application, and is designed to collect and apply the styles created by descendants.

It struck me that it _should_ be possible for this "registry" component to be the _only_ Client Component we need for this stuff, and it would create the only `<style>` tag, collecting all of the styles emitted during that first server-side render.

In practice, though, this doesn't help us solve Problem #1, because there isn't really a way to _collect_ those styles on the server.

My first idea was to use React Context. Maybe we could do something like this:

```jsx
export const StyleContext = React.createContext();

function StyleRegistry({ children }) {
  const collectedRules = React.useRef([]);

  useServerInsertedHTML(() => {
    const styles = collectedRules.current.join('\n');
    return <style>{styles}</style>;
  });

  return (
    <StyleContext.Provider value={collectedRules}>
      {children}
    </StyleContext.Provider>
  );
}
```

In this made-up example, we collect all of the CSS rules in an array, stored in a ref. That ref is made available via React context.

Each styled-component would then push their rules into this array:

```jsx
'use client';
import React from 'react';

import { StyleContext } from './Registry';

export default function styled(Tag, css, compiledClassName) {
  return function StyledComponent(props) {
    const collectedRules = React.useContext(StyleContext);

    collectedRules.current.push(`
      .${compiledClassName} {
        ${css}
      }
    `);

    return <Tag className={compiledClassName} {...props} />;
  };
}
```

As I understand it, `useServerInsertedHTML` runs _after_ all of the descendants have been rendered, but it still runs on the server (unlike `useEffect`). And so, when that code runs, `collectedRules.current` will be an array of strings, each one for a different CSS rule. They'd be concatenated into a string, and applied in a `<style>` tag.

Unfortunately, React Context doesn't work in Server Components. In fact, React Server Components doesn't seem to have any mechanism that allows descendants to pass data up to the "registry" ancestor.

This appears to be a known issue with React Server Components. The RFC mentions that this is an [active area of research](https://github.com/reactjs/rfcs/blob/bf51f8755ddb38d92e23ad415fc4e3c02b95b331/text/0000-server-components.md#how-do-you-do-routing).

There's an issue in the styled-components repo that [digs into this](https://github.com/styled-components/styled-components/issues/3856#issuecomment-1591947905), this appears to be the main blocker. There was some discussion that the `React.cache` API could be useful here, since it provides a per-request cache, but I quickly ran into an issue: `cache` is only available in Server Components, and `useServerInsertedHTML` only works in Client Components. I tried to collect the data in `cache` and then pass it to a Client Component that uses `useServerInsertedHTML`, but it didn't work, and I don't know why.

**This is currently the biggest blocker.** Based on what I've seen, it just might not be possible to

I'm also not sure how this would work with Streaming SSR (although `useServerInsertedHTML` [is Suspense-friendly](https://github.com/vercel/next.js/pull/42293), so maybe it won't be an issue?).

## Leveraging existing
