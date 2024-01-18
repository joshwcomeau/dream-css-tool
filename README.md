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

The tricky thing is, how do we actually _collect_ those styles in a Server Component?

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

I learned about this in [an issue in the styled-components repo](https://github.com/styled-components/styled-components/issues/3856#issuecomment-1591947905). This appears to be the main blocker.

A [thread from Sebastian Markbåge](https://twitter.com/sebmarkbage/status/1587615484870098945) shares another interesting possible solution: the `React.cache()` API. React.cache essentially provides a per-request cache, available exclusively in Server Components.

I did a quick and dirty prototype with this, and it actually works perfectly, but only in _Server_ Components. I got all excited, only to realize that it breaks when you try and use it in Client Components:

```js
'use client';

function App() {
  return <Button>Hello World</Button>;
}

// 🚫 Error: Not Implemented
const Button = styled.button`
  color: red;
`;
```

This repository includes my dirty proof-of-concept. I'm hoping that someone who understands all of this stuff a lot better than me can help figure out a workable solution, if such a thing exists!

Here are the relevant files:

- [styled.js](https://github.com/joshwcomeau/dream-css-tool/blob/main/src/styled.js) — equivalent to `styled` from styled-components.
- [StyleRegistry.js](https://github.com/joshwcomeau/dream-css-tool/blob/main/src/components/StyleRegistry.js) — The registry that manages the cache. Server Component.
- [StyleInserter.js](https://github.com/joshwcomeau/dream-css-tool/blob/main/src/components/StyleInserter.js) — The component that injects the styles into the page, using `useServerInsertedHTML`. Client Component.

## Comparison with existing tools

There _are_ several CSS-in-JS tools which don't require a runtime, and are (or could be) compatible with RSC.

For example, [Panda CSS](https://panda-css.com/) works by statically analyzing your code and extracting a set of atomic utility classes into a CSS file. This is really cool, but it doesn't quite work for me.

The biggest issue is that it doesn't support component referencing:

```js
const Quote = styled.blockquote`
  font-style: italic;
`;

const Link = styled.a`
  /* Default styles */
  color: var(--color-primary);

  /* 🚫 Doesn't work in Panda CSS */
  ${Quote} & {
    color: inherit;
  }
`;
```

That's the biggest blocker for me, but there are a couple of other things I'm not a fan of:

- As far as I can tell, Panda CSS doesn't support route-specific CSS. Every style in every component across the entire application is compiled into a single CSS file.
- Panda CSS compiles to Tailwind-style utility classes. This certainly helps to reduce the filesize of that CSS file, since there are no duplicate CSS declarations, but I'm not a fan of the in-browser debugging experience, where each CSS rule consists of a single declaration.

There's also [Linaria](https://github.com/callstack/linaria/), which has been around for quite a while, and provides a styled-component-like API that compiles to CSS files. The [next-with-linaria](https://github.com/dlehmhus/next-with-linaria/tree/main) package adds support for the Next.js App Router, by cleverly compiling the CSS into CSS Modules, which already have first-class support in Next.js.

Linaria + next-with-linaria is surprisingly great. It supports component referencing, and the output is identical to that of CSS Modules. It's honestly pretty close to exactly what I want. The only little nitpick I could find is that it isn't optimized for Suspense; all of the CSS for a given route is compiled into 1 CSS file, rather than streaming in additional CSS along with the extra HTML/JS.

The trouble is that next-with-linaria is really more of a prototype than a production-ready library. There's a big warning in the README that warns not to use it in production.

I also worry about its longevity; Linaria uses Webpack 5, along with Webpack-specific features like Virtual Modules. Next is in the process of migrating to Turbopack, and so if/when Next drops support for Webpack, it would break this library. It also means that bundling is presumably slower, since it has to use Webpack instead of Turbopack (which is written in Rust and designed to be fast).

I think my ideal CSS tool would not require any sort of bundler integration: I believe it should be sufficient to have a Babel/SWC transform, to generate the class names. The tool I'm imagining would run during the server-side render rather than at compile-time, producing a `<style>` tag rather than a linked CSS file, containing only the styles necessary for the current UI.

## Other things to consider

- This tool should also work with Suspense and Streaming SSR; the `<style>` tag should be updated when different parts of the page are streamed in around Suspense boundaries. Fortunately, it seems that `useServerInsertedHTML` [already tackles this](https://github.com/vercel/next.js/pull/42293).
- In terms of CSS preprocessing, I think it makes sense to use [Lightning CSS](https://lightningcss.dev/). It offers several improvements over Stylis, the preprocessor used by styled-components:
  - It's faster (written in Rust).
  - Vendor prefixing isn't an "all or nothing" equation, we can target specific browsers using `browserslist`.
  - It does babel-style transpiling for several modern CSS features.
