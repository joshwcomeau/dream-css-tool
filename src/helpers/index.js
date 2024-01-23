export function removeCSSComments(templateStringsArray) {
  return templateStringsArray.map((templateString) =>
    templateString.replace(/\/\*[\s\S]*?\*\//g, '')
  );
}

export function interpolateProps(value, props) {
  const interpolatedValue =
    (typeof value === 'function' ? value(props) : value) || '';

  if (typeof interpolatedValue !== 'object') return interpolatedValue;

  const className = interpolatedValue?.props?.className;
  if (className) return '.' + className;

  return '';
}

export function formatCSSBlocks(css, className) {
  const subBlocksRegex = /(?:^\s*|\n\s*)([.&][^{]+{\s*[^}]*})/gm;
  const mainBlock = css.replace(subBlocksRegex, '').trim();

  const subBlocks = css.match(subBlocksRegex) || [];

  return {
    mainBlock,
    subBlocks: subBlocks.join('\n').replaceAll('&', `.${className}`).trim(),
    styles: `.${className} { ${mainBlock} }`,
  };
}

function normalizeCSS(css) {
  return css
    .replace(/\s+/g, ' ') // Reemplaza cualquier secuencia de espacios en blanco con un solo espacio
    .trim(); // Elimina espacios al inicio y al final
}

export function findExistingStyle(stylesArray, css) {
  return stylesArray.find((style) => {
    const cssContentRegex = /{\s*([^}]*)\s*}/;
    const match = style.css.match(cssContentRegex);

    const cssContent = match ? normalizeCSS(match[1]) : '';

    return cssContent === normalizeCSS(css);
  });
}
