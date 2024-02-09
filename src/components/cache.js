/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';

export const useServerCache = React.cache(() => []);

let clientContext;

function getClientCache() {
  if (!clientContext) {
    clientContext = React.createContext([]);
  }

  return clientContext;
}

export function cache() {
  try {
    // React Server Component
    return useServerCache();
  } catch (e) {
    // React Client Component
    const clientContext = getClientCache();
    return React.useContext(clientContext);
  }
}
