import React from 'react';

import StyleRegistryClient from './StyleRegistryClient';
import StyleRegistryServer from './StyleRegistryServer';

export default function StyleRegistry({ children }) {
  return (
    <>
      <StyleRegistryServer />
      <StyleRegistryClient />
      {children}
    </>
  );
}
