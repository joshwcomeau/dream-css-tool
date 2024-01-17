'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';

function StyleInserter({ styles }) {
  useServerInsertedHTML(() => {
    return <style>{styles.join('\n')}</style>;
  });

  return null;
}

export default StyleInserter;
