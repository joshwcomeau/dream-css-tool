'use client';

import React from 'react';
import styled from '../styled.js';

export default function CountButton() {
  const [count, setCount] = React.useState(0);
  return (
    <Button onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </Button>
  );
}

// Currently, this doesn't work, because `cache()` can't be used in
// Client Components. It throws an error, and none of the styles get
// created.
const Button = styled.button`
  padding: 1rem 2rem;
  color: red;
  font-size: 1rem;
`;
