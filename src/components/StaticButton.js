import React from 'react';
import styled from '../styled.js';

export default function CountButton() {
  return <Button>Static</Button>;
}

const Button = styled('button')`
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  background: hsl(270deg 100% 30%);
  color: white;
  font-size: 1rem;
  cursor: pointer;
`;
